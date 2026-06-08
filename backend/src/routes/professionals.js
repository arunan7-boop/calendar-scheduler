const express = require('express');
const router = express.Router();

router.get('/profile', (req, res) => res.json({ message: 'TODO: Get professional profile' }));
router.patch('/profile', (req, res) => res.json({ message: 'TODO: Update professional profile' }));
router.get('/bookings', (req, res) => res.json({ message: 'TODO: Get professional bookings' }));
router.get('/calendar', (req, res) => res.json({ message: 'TODO: Get professional calendar' }));

module.exports = router;
