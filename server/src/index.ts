import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { errorHandler } from './middleware/errorHandler';

// Import logging
import logger, { logRequest, logError } from './utils/logger';

// Import versioned routes
import v1Routes from './routes/v1';
import path from 'path';

// Load environment variables
dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000"||"http://localhost:3001",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"]
  }
});

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10000, // limit each IP to 10000 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  }
});
app.use('/api/', limiter);

// CORS and body parsing middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use(logRequest);

// API Routes
app.use('/api/v1', v1Routes);

// Serve uploaded avatars statically
app.use('/uploads/avatars', express.static(path.join(process.cwd(), 'uploads', 'avatars')));

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  logger.info('User connected', { socketId: socket.id });

  // Join user to their room
  socket.on('join', (userId: string) => {
    socket.join(userId);
    logger.info('User joined room', { userId, socketId: socket.id });
  });

  // Handle booking updates
  socket.on('booking-update', (data) => {
    const { userId, driverId, booking } = data;
    socket.to(userId).emit('booking-updated', booking);
    socket.to(driverId).emit('booking-updated', booking);
    logger.info('Booking update sent', { userId, driverId, bookingId: booking.id });
  });

  // Handle location updates
  socket.on('location-update', (data) => {
    const { driverId, location } = data;
    socket.to(driverId).emit('location-updated', location);
    logger.info('Location update sent', { driverId, location });
  });

  // Handle chat messages
  socket.on('send-message', (data) => {
    const { receiverId, message } = data;
    socket.to(receiverId).emit('new-message', message);
    logger.info('Message sent', { receiverId, messageId: message.id });
  });

  socket.on('disconnect', () => {
    logger.info('User disconnected', { socketId: socket.id });
  });
});

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  logError(new Error('Route not found'), { 
    method: req.method, 
    url: req.url, 
    ip: req.ip 
  });
  
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  logger.info('Server started', { 
    port: PORT, 
    environment: process.env.NODE_ENV,
    clientUrl: process.env.CLIENT_URL 
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received. Shutting down gracefully...');
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
}); 