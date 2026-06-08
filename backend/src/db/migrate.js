require('dotenv').config();
const pool = require('./pool');

const migration = `
-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  user_type VARCHAR(50) NOT NULL CHECK (user_type IN ('CLIENT', 'PROFESSIONAL')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Client profiles
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
);

-- Professional profiles
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
);

-- Testimonials
CREATE TABLE IF NOT EXISTS testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id UUID REFERENCES professional_profiles(id) ON DELETE CASCADE,
  client_name VARCHAR(100),
  rating INT CHECK (rating >= 1 AND rating <= 5),
  text TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Bookings
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
);

-- Booking history
CREATE TABLE IF NOT EXISTS booking_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  action VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Calendar integrations
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
);

-- Whitelabel tenants (for future)
CREATE TABLE IF NOT EXISTS tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  domain VARCHAR(255) UNIQUE,
  brand_primary_color VARCHAR(7),
  brand_secondary_color VARCHAR(7),
  logo_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_client_profiles_user_id ON client_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_professional_profiles_user_id ON professional_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_professional_id ON bookings(professional_id);
CREATE INDEX IF NOT EXISTS idx_bookings_client_id ON bookings(client_id);
CREATE INDEX IF NOT EXISTS idx_bookings_scheduled_at ON bookings(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_calendar_integrations_user_id ON calendar_integrations(user_id);
`;

async function runMigration() {
  const client = await pool.connect();
  try {
    console.log('Running database migrations...');
    await client.query(migration);
    console.log('✅ Database migration completed successfully');
  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  } finally {
    client.release();
    pool.end();
  }
}

runMigration();
