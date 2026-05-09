const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const potholeRoutes = require('./routes/potholes');
const userRoutes = require('./routes/users');

// Initialize Express app
const app = express();
const server = http.createServer(app);

// Initialize Socket.IO for real-time updates
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

// ========== SOCKET.IO REAL-TIME EVENTS ==========
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  // User joins a specific room (e.g., city or region)
  socket.on('join-region', (regionId) => {
    socket.join(`region-${regionId}`);
    console.log(`User ${socket.id} joined region-${regionId}`);
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Make io accessible to routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

// ========== API ROUTES ==========
app.use('/api/auth', authRoutes);
app.use('/api/potholes', potholeRoutes);
app.use('/api/users', userRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'RoadGuard Backend is running',
    timestamp: new Date().toISOString()
  });
});

// 404 Error handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Endpoint not found',
    path: req.path 
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Internal server error',
    message: err.message 
  });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 RoadGuard Backend running on http://localhost:${PORT}`);
  console.log(`📡 WebSocket server ready for real-time updates`);
});
