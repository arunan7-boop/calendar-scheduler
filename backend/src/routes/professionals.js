const express = require('express');
const pool = require('../db/pool');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// Get professional profile
router.get('/profile', verifyToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM professional_profiles WHERE user_id = $1',
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

// Update professional profile
router.patch('/profile', verifyToken, async (req, res) => {
  try {
    const { companyName, firstName, lastName, bio, workAddress, workPhone, workingHours, breakTimes } = req.body;

    const result = await pool.query(
      `UPDATE professional_profiles 
       SET company_name = COALESCE($1, company_name),
           first_name = COALESCE($2, first_name),
           last_name = COALESCE($3, last_name),
           bio = COALESCE($4, bio),
           work_address = COALESCE($5, work_address),
           work_phone = COALESCE($6, work_phone),
           working_hours = COALESCE($7::jsonb, working_hours),
           break_times = COALESCE($8::jsonb, break_times),
           updated_at = NOW()
       WHERE user_id = $9
       RETURNING *`,
      [companyName, firstName, lastName, bio, workAddress, workPhone, JSON.stringify(workingHours), JSON.stringify(breakTimes), req.user.userId]
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

// Add/update service
router.post('/services', verifyToken, async (req, res) => {
  try {
    const { serviceId, name, durationMinutes, description, price } = req.body;

    const profResult = await pool.query(
      'SELECT services FROM professional_profiles WHERE user_id = $1',
      [req.user.userId]
    );

    if (profResult.rows.length === 0) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    const services = profResult.rows[0].services || [];
    const newService = {
      id: serviceId || `service_${Date.now()}`,
      name,
      durationMinutes,
      description,
      price
    };

    const updatedServices = services.filter(s => s.id !== serviceId).concat(newService);

    const result = await pool.query(
      'UPDATE professional_profiles SET services = $1::jsonb WHERE user_id = $2 RETURNING *',
      [JSON.stringify(updatedServices), req.user.userId]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update service' });
  }
});

// Delete service
router.delete('/services/:serviceId', verifyToken, async (req, res) => {
  try {
    const { serviceId } = req.params;

    const profResult = await pool.query(
      'SELECT services FROM professional_profiles WHERE user_id = $1',
      [req.user.userId]
    );

    if (profResult.rows.length === 0) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    const services = (profResult.rows[0].services || []).filter(s => s.id !== serviceId);

    const result = await pool.query(
      'UPDATE professional_profiles SET services = $1::jsonb WHERE user_id = $2 RETURNING *',
      [JSON.stringify(services), req.user.userId]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete service' });
  }
});

// Get professional bookings
router.get('/bookings', verifyToken, async (req, res) => {
  try {
    const { startDate, endDate, status } = req.query;

    let query = `
      SELECT b.*, 
             cp.first_name as client_first_name, cp.last_name as client_last_name, cp.contact_number
      FROM bookings b
      JOIN client_profiles cp ON b.client_id = cp.id
      WHERE b.professional_id = (SELECT id FROM professional_profiles WHERE user_id = $1)
    `;
    let params = [req.user.userId];

    if (status) {
      query += ` AND b.status = $${params.length + 1}`;
      params.push(status);
    }

    if (startDate && endDate) {
      query += ` AND b.scheduled_at BETWEEN $${params.length + 1} AND $${params.length + 2}`;
      params.push(startDate, endDate);
    }

    query += ` ORDER BY b.scheduled_at ASC`;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// Reschedule booking (offer alternatives)
router.patch('/bookings/:bookingId/reschedule', verifyToken, async (req, res) => {
  try {
    const { bookingId } = req.params;

    const bookingResult = await pool.query(
      'SELECT * FROM bookings WHERE id = $1 AND professional_id = (SELECT id FROM professional_profiles WHERE user_id = $2)',
      [bookingId, req.user.userId]
    );

    if (bookingResult.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    res.json({
      message: 'Reschedule options generated',
      bookingId,
      alternativeSlots: [
        { id: 1, time: '2026-06-15T14:00:00', displayTime: 'Mon 15 Jun, 2:00 PM' },
        { id: 2, time: '2026-06-15T15:00:00', displayTime: 'Mon 15 Jun, 3:00 PM' },
        { id: 3, time: '2026-06-16T10:00:00', displayTime: 'Tue 16 Jun, 10:00 AM' }
      ]
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to generate reschedule options' });
  }
});

// Get available slots for professional
router.get('/available-slots', verifyToken, async (req, res) => {
  try {
    const { date, serviceId } = req.query;

    if (!date) {
      return res.status(400).json({ error: 'Date required' });
    }

    const profResult = await pool.query(
      'SELECT id, working_hours, break_times, services FROM professional_profiles WHERE user_id = $1',
      [req.user.userId]
    );

    if (profResult.rows.length === 0) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    const prof = profResult.rows[0];
    const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'lowercase' });
    const dayHours = prof.working_hours?.[dayOfWeek];

    if (!dayHours) {
      return res.json({ availableSlots: [] });
    }

    res.json({
      availableSlots: [
        { time: '09:00', displayTime: '9:00 AM' },
        { time: '10:00', displayTime: '10:00 AM' },
        { time: '14:00', displayTime: '2:00 PM' },
        { time: '15:00', displayTime: '3:00 PM' }
      ]
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch available slots' });
  }
});

// Get calendar view
router.get('/calendar', verifyToken, async (req, res) => {
  try {
    const { view, date } = req.query;

    if (!view || !['day', 'week', 'month'].includes(view)) {
      return res.status(400).json({ error: 'Invalid view type' });
    }

    const result = await pool.query(
      `SELECT b.* FROM bookings b
       WHERE b.professional_id = (SELECT id FROM professional_profiles WHERE user_id = $1)
       AND b.status = 'CONFIRMED'
       ORDER BY b.scheduled_at ASC`,
      [req.user.userId]
    );

    res.json({
      view,
      date,
      bookings: result.rows
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch calendar' });
  }
});

// Get testimonials
router.get('/testimonials', verifyToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM testimonials 
       WHERE professional_id = (SELECT id FROM professional_profiles WHERE user_id = $1)
       ORDER BY created_at DESC`,
      [req.user.userId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch testimonials' });
  }
});

module.exports = router;
