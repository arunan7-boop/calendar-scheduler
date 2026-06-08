require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const pool = require('./db/pool');
const authRoutes = require('./routes/auth');
const clientRoutes = require('./routes/clients');
const professionalRoutes = require('./routes/professionals');
const organizationRoutes = require('./routes/organizations');
const calendarRoutes = require('./routes/calendar');
const aiRoutes = require('./routes/ai');

const app = express();

// CORS configuration
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'https://calandr.pages.dev',
  process.env.FRONTEND_URL
].filter(Boolean);

// Middleware
app.use(helmet());
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Health check (before routes, to verify DB connection)
app.get('/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ status: 'ok', timestamp: result.rows[0].now });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// Auto-run migrations on startup
async function runMigrations() {
  console.log('Starting database migrations...');
  const client = await pool.connect();
  try {
    // Core tables (already created, but idempotent)
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        user_type VARCHAR(50) NOT NULL CHECK (user_type IN ('CLIENT', 'PROFESSIONAL')),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('✓ users table');

    await client.query(`
      CREATE TABLE IF NOT EXISTS client_profiles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        title VARCHAR(50),
        pronouns VARCHAR(50),
        contact_number VARCHAR(20) NOT NULL,
        country_code VARCHAR(5) DEFAULT '+44',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('✓ client_profiles table');

    await client.query(`
      CREATE TABLE IF NOT EXISTS professional_profiles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
        company_name VARCHAR(255) NOT NULL,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        bio TEXT,
        work_address TEXT NOT NULL,
        work_phone VARCHAR(20),
        services JSONB DEFAULT '[]',
        working_hours JSONB DEFAULT '{}',
        break_times JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('✓ professional_profiles table');

    await client.query(`
      CREATE TABLE IF NOT EXISTS testimonials (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        professional_id UUID REFERENCES professional_profiles(id) ON DELETE CASCADE,
        client_name VARCHAR(100),
        rating INT CHECK (rating >= 1 AND rating <= 5),
        text TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('✓ testimonials table');

    await client.query(`
      CREATE TABLE IF NOT EXISTS bookings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        professional_id UUID NOT NULL REFERENCES professional_profiles(id) ON DELETE CASCADE,
        client_id UUID NOT NULL REFERENCES client_profiles(id) ON DELETE CASCADE,
        service_id VARCHAR(100),
        scheduled_at TIMESTAMP NOT NULL,
        duration_minutes INT NOT NULL,
        status VARCHAR(50) DEFAULT 'CONFIRMED' CHECK (status IN ('CONFIRMED', 'CANCELLED', 'RESCHEDULED_PENDING', 'COMPLETED')),
        google_calendar_event_id VARCHAR(255),
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(professional_id, scheduled_at)
      )
    `);
    console.log('✓ bookings table');

    await client.query(`
      CREATE TABLE IF NOT EXISTS booking_history (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
        action VARCHAR(50),
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('✓ booking_history table');

    await client.query(`
      CREATE TABLE IF NOT EXISTS calendar_integrations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
        provider VARCHAR(50) DEFAULT 'GOOGLE',
        access_token TEXT NOT NULL,
        refresh_token TEXT,
        calendar_id VARCHAR(255),
        expires_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('✓ calendar_integrations table');

    await client.query(`
      CREATE TABLE IF NOT EXISTS tenants (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        domain VARCHAR(255) UNIQUE,
        brand_primary_color VARCHAR(7),
        brand_secondary_color VARCHAR(7),
        logo_url TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('✓ tenants table');

    // Organization tables (new)
    await client.query(`
      CREATE TABLE IF NOT EXISTS organizations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        logo_url TEXT,
        description TEXT,
        theme_id VARCHAR(50) DEFAULT 'default',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('✓ organizations table');

    await client.query(`
      CREATE TABLE IF NOT EXISTS organization_members (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
        professional_id UUID NOT NULL REFERENCES professional_profiles(id) ON DELETE CASCADE,
        role VARCHAR(50) DEFAULT 'member',
        joined_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(organization_id, professional_id)
      )
    `);
    console.log('✓ organization_members table');

    await client.query(`
      CREATE TABLE IF NOT EXISTS invite_tokens (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
        token VARCHAR(255) UNIQUE NOT NULL,
        created_by UUID NOT NULL REFERENCES users(id),
        email VARCHAR(255),
        status VARCHAR(50) DEFAULT 'active',
        used_by UUID REFERENCES users(id),
        used_at TIMESTAMP,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('✓ invite_tokens table');

    await client.query(`
      CREATE TABLE IF NOT EXISTS onboarding_progress (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        professional_id UUID NOT NULL UNIQUE REFERENCES professional_profiles(id) ON DELETE CASCADE,
        organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
        current_step INT DEFAULT 1,
        completed BOOLEAN DEFAULT FALSE,
        step_1_data JSONB,
        step_2_data JSONB,
        step_3_data JSONB,
        step_4_data JSONB,
        last_updated TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('✓ onboarding_progress table');

    await client.query(`
      CREATE TABLE IF NOT EXISTS professional_services (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        professional_id UUID NOT NULL REFERENCES professional_profiles(id) ON DELETE CASCADE,
        organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        duration_minutes INT DEFAULT 60,
        description TEXT,
        is_custom BOOLEAN DEFAULT FALSE,
        shared_with_org BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('✓ professional_services table');

    await client.query(`
      CREATE TABLE IF NOT EXISTS professional_images (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        professional_id UUID NOT NULL REFERENCES professional_profiles(id) ON DELETE CASCADE,
        gcs_url TEXT NOT NULL,
        position INT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('✓ professional_images table');

    await client.query(`
      CREATE TABLE IF NOT EXISTS professional_working_hours (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        professional_id UUID NOT NULL REFERENCES professional_profiles(id) ON DELETE CASCADE,
        day_of_week VARCHAR(10) NOT NULL,
        start_time TIME,
        end_time TIME,
        is_working_day BOOLEAN DEFAULT TRUE,
        break_start TIME,
        break_end TIME,
        shared_with_org BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(professional_id, day_of_week)
      )
    `);
    console.log('✓ professional_working_hours table');

    await client.query(`
      CREATE TABLE IF NOT EXISTS themes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        organization_id UUID UNIQUE REFERENCES organizations(id) ON DELETE CASCADE,
        theme_name VARCHAR(50) NOT NULL,
        primary_color VARCHAR(7) DEFAULT '#6366f1',
        secondary_color VARCHAR(7) DEFAULT '#ec4899',
        font_family VARCHAR(100) DEFAULT 'system-ui',
        accent_color VARCHAR(7) DEFAULT '#f59e0b',
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('✓ themes table');

    // Create all indexes
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)',
      'CREATE INDEX IF NOT EXISTS idx_organizations_owner_id ON organizations(owner_id)',
      'CREATE INDEX IF NOT EXISTS idx_organization_members_org_id ON organization_members(organization_id)',
      'CREATE INDEX IF NOT EXISTS idx_organization_members_pro_id ON organization_members(professional_id)',
      'CREATE INDEX IF NOT EXISTS idx_invite_tokens_org_id ON invite_tokens(organization_id)',
      'CREATE INDEX IF NOT EXISTS idx_invite_tokens_token ON invite_tokens(token)',
      'CREATE INDEX IF NOT EXISTS idx_onboarding_progress_org_id ON onboarding_progress(organization_id)',
      'CREATE INDEX IF NOT EXISTS idx_professional_services_org_id ON professional_services(organization_id)',
      'CREATE INDEX IF NOT EXISTS idx_professional_working_hours_pro_id ON professional_working_hours(professional_id)',
      'CREATE INDEX IF NOT EXISTS idx_bookings_professional_id ON bookings(professional_id)',
      'CREATE INDEX IF NOT EXISTS idx_bookings_client_id ON bookings(client_id)',
      'CREATE INDEX IF NOT EXISTS idx_bookings_scheduled_at ON bookings(scheduled_at)',
      'CREATE INDEX IF NOT EXISTS idx_calendar_integrations_user_id ON calendar_integrations(user_id)'
    ];

    for (const idx of indexes) {
      await client.query(idx);
    }
    console.log('✓ indexes created');

    console.log('✅ Database migrations completed successfully');
    return true;
  } catch (err) {
    console.error('❌ Migration error:', err.message);
    throw err;
  } finally {
    client.release();
  }
}

// Start server
async function start() {
  try {
    await runMigrations();

    // Routes
    app.use('/api/auth', authRoutes);
    app.use('/api/clients', clientRoutes);
    app.use('/api/professionals', professionalRoutes);
    app.use('/api/organizations', organizationRoutes);
    app.use('/api/calendar', calendarRoutes);
    app.use('/api/ai', aiRoutes);

    // Error handling
    app.use((err, req, res, next) => {
      console.error(err);
      res.status(err.status || 500).json({
        error: err.message || 'Internal server error'
      });
    });

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Calendar Scheduler API running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();

module.exports = app;
