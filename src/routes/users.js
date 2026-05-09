const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { verifyToken } = require('../middleware/auth');

// ========== GET USER PROFILE ==========
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'SELECT id, email, first_name, last_name, phone, user_type, profile_picture, created_at FROM users WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user: result.rows[0] });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ========== UPDATE USER PROFILE ==========
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, phone, profilePicture } = req.body;

    const result = await pool.query(
      `UPDATE users 
       SET first_name = COALESCE($1, first_name),
           last_name = COALESCE($2, last_name),
           phone = COALESCE($3, phone),
           profile_picture = COALESCE($4, profile_picture),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $5
       RETURNING id, email, first_name, last_name, phone, user_type`,
      [firstName, lastName, phone, profilePicture, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      message: 'User updated successfully',
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ========== GET USER'S REPORTED POTHOLES ==========
router.get('/:id/potholes', async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    const result = await pool.query(
      'SELECT * FROM potholes WHERE reporter_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3',
      [id, limit, offset]
    );

    res.json({
      count: result.rows.length,
      potholes: result.rows
    });
  } catch (error) {
    console.error('Error fetching user potholes:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ========== GET NOTIFICATIONS ==========
router.get('/:id/notifications', async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 20, offset = 0 } = req.query;

    const result = await pool.query(
      'SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3',
      [id, limit, offset]
    );

    res.json({
      count: result.rows.length,
      notifications: result.rows
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ========== MARK NOTIFICATION AS READ ==========
router.patch('/:userId/notifications/:notificationId/read', async (req, res) => {
  try {
    const { userId, notificationId } = req.params;

    const result = await pool.query(
      'UPDATE notifications SET is_read = true WHERE id = $1 AND user_id = $2 RETURNING *',
      [notificationId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    res.json({
      message: 'Notification marked as read',
      notification: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating notification:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
