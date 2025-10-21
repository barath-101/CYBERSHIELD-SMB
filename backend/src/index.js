const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const http = require('http');
const socketIo = require('socket.io');
const config = require('./config');
const { apiLimiter } = require('./middleware/rateLimiter');

// Routes
const authRoutes = require('./routes/auth');
const scanRoutes = require('./routes/scan');
const eventsRoutes = require('./routes/events');
const feedbackRoutes = require('./routes/feedback');
const policiesRoutes = require('./routes/policies');
const adminRoutes = require('./routes/admin');
const demoRoutes = require('./routes/demo');

const app = express();
const server = http.createServer(app);

// Socket.IO setup for real-time updates
const io = socketIo(server, {
  cors: {
    origin: config.cors.origin,
    methods: ['GET', 'POST'],
  },
});

// Middleware
app.use(helmet());
app.use(cors(config.cors));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Apply rate limiting to all API routes
app.use('/api', apiLimiter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/scan', scanRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/policies', policiesRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/demo', demoRoutes);

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('join-company', (companyId) => {
    socket.join(`company-${companyId}`);
    console.log(`Socket ${socket.id} joined company ${companyId}`);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Make io available to routes
app.set('io', io);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
const PORT = config.port;
server.listen(PORT, () => {
  console.log(`CyberShield Backend running on port ${PORT}`);
  console.log(`Environment: ${config.nodeEnv}`);
  console.log(`WebSocket server ready`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

module.exports = { app, io };
