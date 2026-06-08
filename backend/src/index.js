require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const pool = require('./db/pool');
const authRoutes = require('./routes/auth');
const clientRoutes = require('./routes/clients');
const professionalRoutes = require('./routes/professionals');
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
    // Create tables one by one so we see which one fails
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
    console.log('✓ users table created');

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
    console.log('✓ client_profiles table created');

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
    console.log('✓ professional_profiles table created');

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
    console.log('✓ testimonials table created');

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
    console.log('✓ bookings table created');

    await client.query(`
      CREATE TABLE IF NOT EXISTS booking_history (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
        action VARCHAR(50),
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('✓ booking_history table created');

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
    console.log('✓ calendar_integrations table created');

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
    console.log('✓ tenants table created');

    // Create indexes
    await client.query('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_client_profiles_user_id ON client_profiles(user_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_professional_profiles_user_id ON professional_profiles(user_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_bookings_professional_id ON bookings(professional_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_bookings_client_id ON bookings(client_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_bookings_scheduled_at ON bookings(scheduled_at)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_calendar_integrations_user_id ON calendar_integrations(user_id)');
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
