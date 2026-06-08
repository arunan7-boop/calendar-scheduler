const express = require('express');
const router = express.Router();

router.get('/google/auth-url', (req, res) => res.json({ message: 'TODO: Google auth URL' }));
router.post('/google/callback', (req, res) => res.json({ message: 'TODO: Google callback' }));

module.exports = router;
