const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const pool = require('../config/database');
const { verifyToken } = require('../middleware/auth');

// Configure file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `pothole-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// ========== CREATE POTHOLE (with image upload) ==========
router.post('/report', upload.single('image'), async (req, res) => {
  try {
    const { latitude, longitude, severity, description, address, city, state, pincode, reporterId } = req.body;

    // Validate required fields
    if (!latitude || !longitude || !reporterId) {
      return res.status(400).json({ error: 'Latitude, longitude, and reporterId are required' });
    }

    // Get image URL if file was uploaded
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    // Insert pothole record
    const result = await pool.query(
      `INSERT INTO potholes 
       (reporter_id, latitude, longitude, severity, description, image_url, address, city, state, pincode) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
       RETURNING *`,
      [reporterId, latitude, longitude, severity || 'medium', description || '', imageUrl, address || '', city || '', state || '', pincode || '']
    );

    const pothole = result.rows[0];

    // Emit real-time event to all connected clients
    req.io.emit('pothole-reported', {
      id: pothole.id,
      latitude: pothole.latitude,
      longitude: pothole.longitude,
      severity: pothole.severity,
      city: pothole.city,
      timestamp: pothole.created_at
    });

    res.status(201).json({
      message: 'Pothole reported successfully',
      pothole
    });
  } catch (error) {
    console.error('Error reporting pothole:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ========== GET ALL POTHOLES ==========
router.get('/', async (req, res) => {
  try {
    const { city, status, limit = 50, offset = 0 } = req.query;

    let query = 'SELECT * FROM potholes WHERE 1=1';
    const params = [];
    let paramCount = 0;

    // Filter by city if provided
    if (city) {
      paramCount++;
      query += ` AND city = $${paramCount}`;
      params.push(city);
    }

    // Filter by status if provided
    if (status) {
      paramCount++;
      query += ` AND status = $${paramCount}`;
      params.push(status);
    }

    // Add pagination
    paramCount++;
    query += ` ORDER BY created_at DESC LIMIT $${paramCount}`;
    params.push(limit);

    paramCount++;
    query += ` OFFSET $${paramCount}`;
    params.push(offset);

    const result = await pool.query(query, params);

    res.json({
      count: result.rows.length,
      potholes: result.rows
    });
  } catch (error) {
    console.error('Error fetching potholes:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ========== GET POTHOLE BY ID ==========
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query('SELECT * FROM potholes WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Pothole not found' });
    }

    res.json({ pothole: result.rows[0] });
  } catch (error) {
    console.error('Error fetching pothole:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ========== UPDATE POTHOLE STATUS ==========
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, verifiedBy, comment } = req.body;

    // Validate status
    const validStatuses = ['reported', 'verified', 'in_progress', 'repaired', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    // Update pothole status
    const result = await pool.query(
      'UPDATE potholes SET status = $1, verified_by = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *',
      [status, verifiedBy || null, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Pothole not found' });
    }

    const pothole = result.rows[0];

    // Add update record
    if (comment) {
      await pool.query(
        'INSERT INTO pothole_updates (pothole_id, updated_by, status, comment) VALUES ($1, $2, $3, $4)',
        [id, verifiedBy, status, comment]
      );
    }

    // Emit real-time event
    req.io.emit('pothole-updated', {
      id: pothole.id,
      status: pothole.status,
      city: pothole.city,
      timestamp: pothole.updated_at
    });

    res.json({
      message: 'Pothole status updated',
      pothole
    });
  } catch (error) {
    console.error('Error updating pothole:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ========== GET POTHOLES BY LOCATION (Near coordinates) ==========
router.get('/location/nearby', async (req, res) => {
  try {
    const { latitude, longitude, radius = 1 } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({ error: 'Latitude and longitude are required' });
    }

    // Using simple distance calculation (can be optimized with PostGIS)
    const result = await pool.query(
      `SELECT *, 
       SQRT(POWER(latitude - $1, 2) + POWER(longitude - $2, 2)) as distance
       FROM potholes
       WHERE SQRT(POWER(latitude - $1, 2) + POWER(longitude - $2, 2)) < $3
       ORDER BY distance ASC`,
      [latitude, longitude, radius]
    );

    res.json({
      count: result.rows.length,
      potholes: result.rows
    });
  } catch (error) {
    console.error('Error fetching nearby potholes:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ========== GET STATISTICS ==========
router.get('/stats/summary', async (req, res) => {
  try {
    const { city } = req.query;

    let query = `
      SELECT 
        COUNT(*) as total_potholes,
        SUM(CASE WHEN status = 'repaired' THEN 1 ELSE 0 END) as repaired_potholes,
        SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress_potholes,
        SUM(CASE WHEN severity = 'critical' THEN 1 ELSE 0 END) as critical_potholes
      FROM potholes
    `;

    let params = [];
    if (city) {
      query += ' WHERE city = $1';
      params.push(city);
    }

    const result = await pool.query(query, params);

    res.json({
      stats: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
