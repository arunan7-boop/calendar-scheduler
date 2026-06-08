const express = require('express');
const router = express.Router();

// Get client profile
router.get('/profile', (req, res) => {
  res.json({ message: 'TODO: Get client profile' });
});

// Update client profile
router.patch('/profile', (req, res) => {
  res.json({ message: 'TODO: Update client profile' });
});

// List client bookings
router.get('/bookings', (req, res) => {
  res.json({ message: 'TODO: List client bookings' });
});

// Request new booking
router.post('/bookings', (req, res) => {
  res.json({ message: 'TODO: Request new booking' });
});

module.exports = router;
