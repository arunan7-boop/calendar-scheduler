const express = require('express');
const axios = require('axios');
const pool = require('../db/pool');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

const CLAUDE_API_KEY = process.env.ANTHROPIC_API_KEY;

// Find available slots using Claude AI
router.post('/find-slots', verifyToken, async (req, res) => {
  try {
    const { professionalId, requestText } = req.body;

    if (!professionalId || !requestText) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Get professional details
    const profResult = await pool.query(
      'SELECT * FROM professional_profiles WHERE id = $1',
      [professionalId]
    );

    if (profResult.rows.length === 0) {
      return res.status(404).json({ error: 'Professional not found' });
    }

    const prof = profResult.rows[0];

    // Call Claude to parse the request and extract booking details
    const parseResponse = await axios.post(
      'https://api.anthropic.com/v1/messages',
      {
        model: 'claude-sonnet-4-5',
        max_tokens: 300,
        messages: [
          {
            role: 'user',
            content: `Extract booking details from this text: "${requestText}"\n\nReturn JSON only (no markdown, no extra text): {service: string or null, preferredDate: YYYY-MM-DD or null, preferredTime: HH:MM or null, durationMinutes: number or 60}`
          }
        ]
      },
      {
        headers: {
          'Authorization': `Bearer ${CLAUDE_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    let bookingDetails = { durationMinutes: 60 };
    try {
      const parsed = JSON.parse(parseResponse.data.content[0].text);
      bookingDetails = { ...bookingDetails, ...parsed };
    } catch (e) {
      console.error('Failed to parse Claude response:', parseResponse.data.content[0].text);
    }

    // TODO: Query available slots based on working hours and existing bookings
    // For now, return mock slots
    const availableSlots = [
      { time: '2026-06-15T14:00:00', displayTime: 'Mon 15 Jun, 2:00 PM' },
      { time: '2026-06-15T15:00:00', displayTime: 'Mon 15 Jun, 3:00 PM' },
      { time: '2026-06-16T10:00:00', displayTime: 'Tue 16 Jun, 10:00 AM' }
    ];

    res.json({
      extractedDetails: bookingDetails,
      availableSlots,
      message: 'Available slots found'
    });
  } catch (err) {
    console.error('Error in find-slots:', err.response?.data || err.message);
    res.status(500).json({ error: 'Failed to find available slots' });
  }
});

// Suggest alternative reschedule slots
router.post('/suggest-reschedule', verifyToken, async (req, res) => {
  try {
    const { bookingId } = req.body;

    const bookingResult = await pool.query(
      'SELECT * FROM bookings WHERE id = $1',
      [bookingId]
    );

    if (bookingResult.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const booking = bookingResult.rows[0];

    // TODO: Query professional's available slots around the original time
    const alternativeSlots = [
      { time: '2026-06-15T14:00:00', displayTime: 'Mon 15 Jun, 2:00 PM' },
      { time: '2026-06-15T15:00:00', displayTime: 'Mon 15 Jun, 3:00 PM' },
      { time: '2026-06-16T10:00:00', displayTime: 'Tue 16 Jun, 10:00 AM' }
    ];

    res.json({
      bookingId,
      alternativeSlots,
      message: 'Alternative slots suggested'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to suggest alternatives' });
  }
});

module.exports = router;
