const express = require('express');
const router = express.Router();

router.post('/find-slots', (req, res) => res.json({ message: 'TODO: Find available slots' }));
router.post('/suggest-reschedule', (req, res) => res.json({ message: 'TODO: Suggest reschedule slots' }));

module.exports = router;
