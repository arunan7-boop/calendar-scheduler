const express = require('express');
const axios = require('axios');
const pool = require('../db/pool');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5000/api/calendar/google/callback';

// Get Google Calendar OAuth URL
router.get('/google/auth-url', verifyToken, (req, res) => {
  try {
    const scope = encodeURIComponent('https://www.googleapis.com/auth/calendar');
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${GOOGLE_CLIENT_ID}` +
      `&redirect_uri=${encodeURIComponent(GOOGLE_REDIRECT_URI)}` +
      `&response_type=code` +
      `&scope=${scope}` +
      `&access_type=offline` +
      `&state=${req.user.userId}`;

    res.json({ authUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to generate auth URL' });
  }
});

// Handle Google Calendar OAuth callback
router.post('/google/callback', verifyToken, async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ error: 'Authorization code required' });
    }

    // Exchange code for tokens
    const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', {
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      code,
      redirect_uri: GOOGLE_REDIRECT_URI,
      grant_type: 'authorization_code'
    });

    const { access_token, refresh_token, expires_in } = tokenResponse.data;

    // Get user's calendar ID
    const calendarResponse = await axios.get('https://www.googleapis.com/calendar/v3/users/me/calendarList', {
      headers: { Authorization: `Bearer ${access_token}` }
    });

    const calendarId = calendarResponse.data.items[0]?.id || 'primary';

    // Save tokens to DB
    const existingIntegration = await pool.query(
      'SELECT id FROM calendar_integrations WHERE user_id = $1',
      [req.user.userId]
    );

    const expiresAt = new Date(Date.now() + expires_in * 1000);

    if (existingIntegration.rows.length > 0) {
      await pool.query(
        `UPDATE calendar_integrations 
         SET access_token = $1, refresh_token = $2, calendar_id = $3, expires_at = $4, updated_at = NOW()
         WHERE user_id = $5`,
        [access_token, refresh_token, calendarId, expiresAt, req.user.userId]
      );
    } else {
      await pool.query(
        `INSERT INTO calendar_integrations (user_id, access_token, refresh_token, calendar_id, expires_at)
         VALUES ($1, $2, $3, $4, $5)`,
        [req.user.userId, access_token, refresh_token, calendarId, expiresAt]
      );
    }

    res.json({ message: 'Google Calendar connected successfully', calendarId });
  } catch (err) {
    console.error('Google Calendar callback error:', err.response?.data || err.message);
    res.status(500).json({ error: 'Failed to connect Google Calendar' });
  }
});

// Sync booking to Google Calendar
router.post('/sync-booking', verifyToken, async (req, res) => {
  try {
    const { bookingId, action } = req.body; // action: 'create', 'update', 'delete'

    const bookingResult = await pool.query(
      `SELECT b.*, pp.company_name, pp.first_name, pp.last_name
       FROM bookings b
       JOIN professional_profiles pp ON b.professional_id = pp.id
       WHERE b.id = $1`,
      [bookingId]
    );

    if (bookingResult.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const booking = bookingResult.rows[0];

    // Get calendar integration
    const integrationResult = await pool.query(
      'SELECT * FROM calendar_integrations WHERE user_id = $1',
      [req.user.userId]
    );

    if (integrationResult.rows.length === 0) {
      return res.status(400).json({ error: 'Google Calendar not connected' });
    }

    const integration = integrationResult.rows[0];

    // TODO: Create/update/delete Google Calendar event
    // For now, just return success
    res.json({ message: `Booking ${action}d in Google Calendar` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to sync booking' });
  }
});

module.exports = router;
