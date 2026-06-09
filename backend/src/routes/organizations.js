const express = require('express');
const crypto = require('crypto');
const pool = require('../db/pool');
const { verifyToken } = require('../middleware/auth');
const nodemailer = require('nodemailer');

const router = express.Router();

// SMTP configuration
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Self-care services list
const SELF_CARE_SERVICES = [
  'Massage Therapy', 'Yoga', 'Meditation', 'Facials', 'Hair Services',
  'Nail Care', 'Spa Treatments', 'Aromatherapy', 'Counseling', 'Coaching',
  'Personal Training', 'Pilates', 'Acupuncture', 'Reiki', 'Waxing',
  'Pedicure', 'Manicure', 'Sauna', 'Steam Room', 'Hot Stone Massage',
  'Thai Massage', 'Deep Tissue', 'Swedish Massage', 'Reflexology', 'Chiropody',
  'Beauty Treatments', 'Wellness Consultation'
];

// Theme configurations
const THEMES = {
  default: {
    name: 'Default',
    primary_color: '#6366f1',
    secondary_color: '#ec4899',
    accent_color: '#f59e0b',
    font_family: 'system-ui'
  },
  minimal: {
    name: 'Minimal',
    primary_color: '#1f2937',
    secondary_color: '#9ca3af',
    accent_color: '#6b7280',
    font_family: 'Inter, sans-serif'
  },
  vibrant: {
    name: 'Vibrant',
    primary_color: '#ff006e',
    secondary_color: '#00f5ff',
    accent_color: '#ffbe0b',
    font_family: 'Poppins, sans-serif'
  },
  zen: {
    name: 'Zen',
    primary_color: '#10b981',
    secondary_color: '#34d399',
    accent_color: '#6ee7b7',
    font_family: 'Raleway, sans-serif'
  },
  luxury: {
    name: 'Luxury',
    primary_color: '#1e1e1e',
    secondary_color: '#d4af37',
    accent_color: '#ffd700',
    font_family: 'Georgia, serif'
  }
};

// Create organization (professional signup)
router.post('/create', verifyToken, async (req, res) => {
  try {
    const { organization_name, theme_id = 'default' } = req.body;
    const user_id = req.user.userId; // JWT uses userId, not id

    if (!organization_name) {
      return res.status(400).json({ error: 'Organization name required' });
    }

    // Check if theme exists
    if (!THEMES[theme_id]) {
      return res.status(400).json({ error: 'Invalid theme' });
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Get professional_id for this user
      const proResult = await client.query(
        'SELECT id FROM professional_profiles WHERE user_id = $1',
        [user_id]
      );

      if (proResult.rows.length === 0) {
        throw new Error('Professional profile not found');
      }

      const professional_id = proResult.rows[0].id;

      // Create organization
      const orgResult = await client.query(
        `INSERT INTO organizations (name, owner_id, theme_id) 
         VALUES ($1, $2, $3) RETURNING id, name, created_at`,
        [organization_name, user_id, theme_id]
      );
      const org_id = orgResult.rows[0].id;

      // Create theme config
      const theme = THEMES[theme_id];
      await client.query(
        `INSERT INTO themes (organization_id, theme_name, primary_color, secondary_color, accent_color, font_family)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [org_id, theme.name, theme.primary_color, theme.secondary_color, theme.accent_color, theme.font_family]
      );

      // Add owner as admin member
      await client.query(
        `INSERT INTO organization_members (organization_id, professional_id, role)
         VALUES ($1, $2, $3)`,
        [org_id, professional_id, 'admin']
      );

      await client.query('COMMIT');

      res.status(201).json({
        organization: orgResult.rows[0],
        message: 'Organization created successfully'
      });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('Organization creation error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get user's organizations
router.get('/my-organizations', verifyToken, async (req, res) => {
  try {
    const user_id = req.user.userId;

    const result = await pool.query(
      `SELECT o.*, t.primary_color, t.secondary_color, t.accent_color, t.font_family
       FROM organizations o
       LEFT JOIN themes t ON o.id = t.organization_id
       WHERE o.owner_id = $1
       ORDER BY o.created_at DESC`,
      [user_id]
    );

    res.json(result.rows);
  } catch (err) {
    console.error('Get organizations error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get organization details
router.get('/:org_id', verifyToken, async (req, res) => {
  try {
    const { org_id } = req.params;

    const result = await pool.query(
      `SELECT o.*, t.primary_color, t.secondary_color, t.accent_color, t.font_family
       FROM organizations o
       LEFT JOIN themes t ON o.id = t.organization_id
       WHERE o.id = $1`,
      [org_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Organization not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Get organization error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Update organization
router.patch('/:org_id', verifyToken, async (req, res) => {
  try {
    const { org_id } = req.params;
    const { name, description, theme_id } = req.body;
    const user_id = req.user.userId;

    // Verify user is org owner
    const orgCheck = await pool.query(
      'SELECT owner_id FROM organizations WHERE id = $1',
      [org_id]
    );

    if (orgCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Organization not found' });
    }

    if (orgCheck.rows[0].owner_id !== user_id) {
      return res.status(403).json({ error: 'Only owner can edit organization' });
    }

    // Update organization
    const updates = [];
    const values = [];
    let paramIdx = 1;

    if (name !== undefined) {
      updates.push(`name = $${paramIdx++}`);
      values.push(name);
    }

    if (description !== undefined) {
      updates.push(`description = $${paramIdx++}`);
      values.push(description);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(org_id);
    const query = `UPDATE organizations SET ${updates.join(', ')} WHERE id = $${paramIdx} RETURNING *`;
    const result = await pool.query(query, values);

    // If theme changed, update theme config
    if (theme_id) {
      if (!THEMES[theme_id]) {
        return res.status(400).json({ error: 'Invalid theme' });
      }

      const theme = THEMES[theme_id];
      await pool.query(
        `UPDATE themes SET theme_name = $1, primary_color = $2, secondary_color = $3, accent_color = $4, font_family = $5
         WHERE organization_id = $6`,
        [theme.name, theme.primary_color, theme.secondary_color, theme.accent_color, theme.font_family, org_id]
      );
    }

    res.json({ organization: result.rows[0], message: 'Organization updated' });
  } catch (err) {
    console.error('Organization update error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Generate invite token
router.post('/:org_id/invite', verifyToken, async (req, res) => {
  try {
    const { org_id } = req.params;
    const { email } = req.body;
    const user_id = req.user.userId;

    // Verify user is org owner/admin
    const orgCheck = await pool.query(
      'SELECT owner_id FROM organizations WHERE id = $1',
      [org_id]
    );

    if (orgCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Organization not found' });
    }

    if (orgCheck.rows[0].owner_id !== user_id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Generate token
    const token = crypto.randomBytes(32).toString('hex');
    const expires_at = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const result = await pool.query(
      `INSERT INTO invite_tokens (organization_id, token, created_by, email, expires_at)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING token, expires_at`,
      [org_id, token, user_id, email, expires_at]
    );

    // Get org name for email
    const org = await pool.query('SELECT name FROM organizations WHERE id = $1', [org_id]);

    // Send invite email
    const inviteLink = `${process.env.FRONTEND_URL}/join?token=${token}`;
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: email,
      subject: `You're invited to join ${org.rows[0].name} on Calendr`,
      html: `
        <h2>You're invited to join ${org.rows[0].name}!</h2>
        <p>Complete your professional profile and join the team.</p>
        <a href="${inviteLink}" style="display: inline-block; padding: 10px 20px; background-color: #6366f1; color: white; text-decoration: none; border-radius: 5px;">
          Accept Invite
        </a>
        <p>This link expires in 7 days.</p>
      `
    };

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) console.error('Email error:', err);
      else console.log('Invite email sent:', info.response);
    });

    res.status(201).json({
      token: result.rows[0].token,
      expires_at: result.rows[0].expires_at,
      message: 'Invite sent'
    });
  } catch (err) {
    console.error('Invite generation error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Verify invite token
router.post('/invite/verify', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Token required' });
    }

    const result = await pool.query(
      `SELECT it.*, o.name, o.id, o.theme_id
       FROM invite_tokens it
       JOIN organizations o ON it.organization_id = o.id
       WHERE it.token = $1 AND it.status = 'active' AND it.expires_at > NOW()`,
      [token]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid or expired token' });
    }

    const invite = result.rows[0];
    res.json({
      valid: true,
      organization: {
        id: invite.id,
        name: invite.name,
        theme_id: invite.theme_id
      }
    });
  } catch (err) {
    console.error('Token verification error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get services list
router.get('/services/list', (req, res) => {
  res.json({ services: SELF_CARE_SERVICES });
});

// Get themes list
router.get('/themes/list', (req, res) => {
  const themesList = Object.entries(THEMES).map(([key, value]) => ({
    id: key,
    ...value
  }));
  res.json({ themes: themesList });
});

// Save onboarding progress
router.post('/:org_id/onboarding/save', verifyToken, async (req, res) => {
  try {
    const { org_id } = req.params;
    const { professional_id, current_step, step_data, token } = req.body;

    // Verify token if provided
    if (token) {
      const tokenCheck = await pool.query(
        `SELECT organization_id FROM invite_tokens 
         WHERE token = $1 AND status = 'active' AND expires_at > NOW()`,
        [token]
      );

      if (tokenCheck.rows.length === 0) {
        return res.status(403).json({ error: 'Invalid or expired invite token' });
      }

      if (tokenCheck.rows[0].organization_id !== org_id) {
        return res.status(403).json({ error: 'Token does not match organization' });
      }
    }

    // Check if professional exists in org
    const memberCheck = await pool.query(
      `SELECT id FROM organization_members 
       WHERE organization_id = $1 AND professional_id = $2`,
      [org_id, professional_id]
    );

    if (memberCheck.rows.length === 0 && !token) {
      return res.status(403).json({ error: 'Professional not in organization' });
    }

    // Save or update progress
    const progressCheck = await pool.query(
      `SELECT id FROM onboarding_progress 
       WHERE professional_id = $1 AND organization_id = $2`,
      [professional_id, org_id]
    );

    let result;
    if (progressCheck.rows.length > 0) {
      // Update
      const updateData = {};
      updateData[`step_${current_step}_data`] = step_data;

      const updateQuery = `
        UPDATE onboarding_progress
        SET current_step = $1, last_updated = NOW(), step_${current_step}_data = $2
        WHERE professional_id = $3 AND organization_id = $4
        RETURNING *
      `;

      result = await pool.query(updateQuery, [current_step, step_data, professional_id, org_id]);
    } else {
      // Insert
      const updateData = {};
      updateData[`step_${current_step}_data`] = step_data;

      result = await pool.query(
        `INSERT INTO onboarding_progress (professional_id, organization_id, current_step, step_${current_step}_data)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [professional_id, org_id, current_step, step_data]
      );
    }

    res.json({
      progress: result.rows[0],
      message: `Step ${current_step} saved`
    });
  } catch (err) {
    console.error('Onboarding save error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get onboarding progress
router.get('/:org_id/onboarding/:professional_id', verifyToken, async (req, res) => {
  try {
    const { org_id, professional_id } = req.params;

    const result = await pool.query(
      `SELECT * FROM onboarding_progress 
       WHERE professional_id = $1 AND organization_id = $2`,
      [professional_id, org_id]
    );

    if (result.rows.length === 0) {
      return res.json({
        current_step: 1,
        completed: false,
        message: 'No progress yet'
      });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Get onboarding error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
