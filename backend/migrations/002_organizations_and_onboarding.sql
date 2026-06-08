-- Organizations table
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  logo_url TEXT,
  description TEXT,
  theme_id VARCHAR(50) DEFAULT 'default',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Organization members (professionals)
CREATE TABLE IF NOT EXISTS organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  professional_id UUID NOT NULL REFERENCES professional_profiles(id) ON DELETE CASCADE,
  role VARCHAR(50) DEFAULT 'member', -- 'admin', 'member'
  joined_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(organization_id, professional_id)
);

-- Invite tokens for professionals to join orgs
CREATE TABLE IF NOT EXISTS invite_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  token VARCHAR(255) UNIQUE NOT NULL,
  created_by UUID NOT NULL REFERENCES users(id),
  email VARCHAR(255),
  status VARCHAR(50) DEFAULT 'active', -- 'active', 'used', 'expired'
  used_by UUID REFERENCES users(id),
  used_at TIMESTAMP,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Onboarding progress tracking
CREATE TABLE IF NOT EXISTS onboarding_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id UUID NOT NULL UNIQUE REFERENCES professional_profiles(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  current_step INT DEFAULT 1, -- 1, 2, 3, 4
  completed BOOLEAN DEFAULT FALSE,
  step_1_data JSONB, -- basic info
  step_2_data JSONB, -- services
  step_3_data JSONB, -- working hours
  step_4_data JSONB, -- images & logo
  last_updated TIMESTAMP DEFAULT NOW()
);

-- Services with sharing capability
CREATE TABLE IF NOT EXISTS professional_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id UUID NOT NULL REFERENCES professional_profiles(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  duration_minutes INT DEFAULT 60,
  description TEXT,
  is_custom BOOLEAN DEFAULT FALSE, -- user-added service
  shared_with_org BOOLEAN DEFAULT FALSE, -- visible to org members
  created_at TIMESTAMP DEFAULT NOW()
);

-- Professional images (gallery)
CREATE TABLE IF NOT EXISTS professional_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id UUID NOT NULL REFERENCES professional_profiles(id) ON DELETE CASCADE,
  gcs_url TEXT NOT NULL,
  position INT, -- order in gallery (1-6)
  created_at TIMESTAMP DEFAULT NOW()
);

-- Working hours with sharing
CREATE TABLE IF NOT EXISTS professional_working_hours (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id UUID NOT NULL REFERENCES professional_profiles(id) ON DELETE CASCADE,
  day_of_week VARCHAR(10) NOT NULL, -- 'monday', 'tuesday', etc
  start_time TIME,
  end_time TIME,
  is_working_day BOOLEAN DEFAULT TRUE,
  break_start TIME,
  break_end TIME,
  shared_with_org BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(professional_id, day_of_week)
);

-- Theme configurations (5 predefined themes)
CREATE TABLE IF NOT EXISTS themes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID UNIQUE REFERENCES organizations(id) ON DELETE CASCADE,
  theme_name VARCHAR(50) NOT NULL, -- 'default', 'minimal', 'vibrant', 'zen', 'luxury'
  primary_color VARCHAR(7) DEFAULT '#6366f1',
  secondary_color VARCHAR(7) DEFAULT '#ec4899',
  font_family VARCHAR(100) DEFAULT 'system-ui',
  accent_color VARCHAR(7) DEFAULT '#f59e0b',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_organizations_owner_id ON organizations(owner_id);
CREATE INDEX IF NOT EXISTS idx_organization_members_org_id ON organization_members(organization_id);
CREATE INDEX IF NOT EXISTS idx_organization_members_pro_id ON organization_members(professional_id);
CREATE INDEX IF NOT EXISTS idx_invite_tokens_org_id ON invite_tokens(organization_id);
CREATE INDEX IF NOT EXISTS idx_invite_tokens_token ON invite_tokens(token);
CREATE INDEX IF NOT EXISTS idx_onboarding_progress_org_id ON onboarding_progress(organization_id);
CREATE INDEX IF NOT EXISTS idx_professional_services_org_id ON professional_services(organization_id);
CREATE INDEX IF NOT EXISTS idx_professional_working_hours_pro_id ON professional_working_hours(professional_id);
