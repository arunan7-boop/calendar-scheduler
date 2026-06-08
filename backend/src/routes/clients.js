const express = require('express');
const pool = require('../db/pool');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// Get client profile
router.get('/profile', verifyToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM client_profiles WHERE user_id = $1',
      [req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Update client profile
router.patch('/profile', verifyToken, async (req, res) => {
  try {
    const { firstName, lastName, title, pronouns, contactNumber, countryCode } = req.body;

    const result = await pool.query(
      `UPDATE client_profiles 
       SET first_name = COALESCE($1, first_name),
           last_name = COALESCE($2, last_name),
           title = COALESCE($3, title),
           pronouns = COALESCE($4, pronouns),
           contact_number = COALESCE($5, contact_number),
           country_code = COALESCE($6, country_code),
           updated_at = NOW()
       WHERE user_id = $7
       RETURNING *`,
      [firstName, lastName, title, pronouns, contactNumber, countryCode, req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// List client bookings
router.get('/bookings', verifyToken, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let query = `
      SELECT b.*, 
             pp.company_name, pp.first_name as pro_first_name, pp.last_name as pro_last_name
      FROM bookings b
      JOIN professional_profiles pp ON b.professional_id = pp.id
      WHERE b.client_id = (SELECT id FROM client_profiles WHERE user_id = $1)
      AND b.status = 'CONFIRMED'
    `;
    let params = [req.user.userId];

    if (startDate && endDate) {
      query += ` AND b.scheduled_at BETWEEN $2 AND $3`;
      params.push(startDate, endDate);
    }

    query += ` ORDER BY b.scheduled_at DESC`;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// Request new booking (trigger Claude slot-finding)
router.post('/bookings', verifyToken, async (req, res) => {
  try {
    const { professionalId, requestText } = req.body;

    if (!professionalId || !requestText) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Get client profile
    const clientResult = await pool.query(
      'SELECT id FROM client_profiles WHERE user_id = $1',
      [req.user.userId]
    );

    if (clientResult.rows.length === 0) {
      return res.status(404).json({ error: 'Client profile not found' });
    }

    const clientId = clientResult.rows[0].id;

    // TODO: Call Claude API to parse request and find available slots
    // For now, return placeholder
    res.json({
      message: 'Booking request submitted',
      status: 'pending_slot_selection',
      availableSlots: [
        { id: 1, time: '2026-06-15T14:00:00', displayTime: 'Mon 15 Jun, 2:00 PM' },
        { id: 2, time: '2026-06-15T15:00:00', displayTime: 'Mon 15 Jun, 3:00 PM' },
        { id: 3, time: '2026-06-16T10:00:00', displayTime: 'Tue 16 Jun, 10:00 AM' }
      ]
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to request booking' });
  }
});

// Cancel or reschedule booking
router.patch('/bookings/:bookingId', verifyToken, async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { action, newSlotId } = req.body;

    if (!action || !['cancel', 'reschedule'].includes(action)) {
      return res.status(400).json({ error: 'Invalid action' });
    }

    if (action === 'cancel') {
      const result = await pool.query(
        `UPDATE bookings 
         SET status = 'CANCELLED', updated_at = NOW()
         WHERE id = $1 
         AND client_id = (SELECT id FROM client_profiles WHERE user_id = $2)
         RETURNING *`,
        [bookingId, req.user.userId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Booking not found' });
      }

      // TODO: Delete from Google Calendar
      res.json({ message: 'Booking cancelled', booking: result.rows[0] });
    } else if (action === 'reschedule') {
      // TODO: Show available slots, similar to new booking request
      res.json({ message: 'Reschedule flow started', bookingId });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update booking' });
  }
});

module.exports = router;
