const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jwt-simple');
const pool = require('../config/database');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// ========== SIGNUP ==========
router.post('/signup', async (req, res) => {
  try {
    const { email, password, firstName, lastName, phone, userType } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Check if user already exists
    const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(409).json({ error: 'User already exists with this email' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const result = await pool.query(
      'INSERT INTO users (email, password, first_name, last_name, phone, user_type) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, email, user_type',
      [email, hashedPassword, firstName || '', lastName || '', phone || '', userType || 'citizen']
    );

    const user = result.rows[0];

    // Create JWT token
    const token = jwt.encode({ userId: user.id, email: user.email }, JWT_SECRET);

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: user.id,
        email: user.email,
        userType: user.user_type
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ========== LOGIN ==========
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = result.rows[0];

    // Compare password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Create JWT token
    const token = jwt.encode({ userId: user.id, email: user.email }, JWT_SECRET);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        userType: user.user_type
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ========== VERIFY TOKEN ==========
router.post('/verify-token', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Token is required' });
    }

    const decoded = jwt.decode(token, JWT_SECRET);
    res.json({ valid: true, userId: decoded.userId });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

module.exports = router;
