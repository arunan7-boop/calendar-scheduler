const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../db/pool');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

// Register
router.post('/register', async (req, res) => {
  try {
    const { email, password, userType, firstName, lastName, companyName, workAddress } = req.body;

    if (!email || !password || !userType) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if user exists
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const userResult = await pool.query(
      'INSERT INTO users (email, password_hash, user_type) VALUES ($1, $2, $3) RETURNING id',
      [email, passwordHash, userType]
    );
    const userId = userResult.rows[0].id;

    // Create profile based on type
    if (userType === 'CLIENT') {
      await pool.query(
        'INSERT INTO client_profiles (user_id, first_name, last_name) VALUES ($1, $2, $3)',
        [userId, firstName || '', lastName || '']
      );
    } else if (userType === 'PROFESSIONAL') {
      await pool.query(
        'INSERT INTO professional_profiles (user_id, company_name, first_name, last_name, work_address) VALUES ($1, $2, $3, $4, $5)',
        [userId, companyName || '', firstName || '', lastName || '', workAddress || '']
      );
    }

    // Generate JWT token (auto-login)
    const token = jwt.sign(
      { userId, userType, email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({ 
      token, 
      userId, 
      userType, 
      email,
      message: 'User registered successfully' 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const result = await pool.query('SELECT id, password_hash, user_type, email FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user.id, userType: user.user_type, email: user.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ token, userId: user.id, userType: user.user_type, email: user.email });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Refresh token
router.post('/refresh', verifyToken, async (req, res) => {
  try {
    const newToken = jwt.sign(
      { userId: req.user.userId, userType: req.user.userType, email: req.user.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ token: newToken });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Token refresh failed' });
  }
});

// Get current user
router.get('/me', verifyToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT id, email, user_type FROM users WHERE id = $1', [req.user.userId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

module.exports = router;
