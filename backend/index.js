// index.js
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import connectDB from './config/db.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import subscriptionRoutes from './routes/subscriptionRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to database
connectDB();

// Global Security Middleware Matrix
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Payload parsing bounds
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Volumetric Throttling limits
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests from this node. Please cool down.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// ==========================================
// MOUNT COMPONENT ROUTES
// ==========================================

// Public System Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'active', timestamp: new Date() });
});

// Main Functional Dashboard Routes Namespace
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/subscription', subscriptionRoutes);

// Global Post-processing Fallback Error Catching Layer
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Secure Core Engine running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});