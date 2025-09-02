import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { router as conversationRouter } from './routes/conversation.js';
import { router as leadRouter } from './routes/leads.js';
import { router as calendarRouter } from './routes/calendar.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/retirement-bot').then(() => {
  console.log('✓ Connected to MongoDB');
}).catch((err) => {
  console.error('✗ MongoDB connection error:', err);
});

// Routes
app.use('/api/conversation', conversationRouter);
app.use('/api/leads', leadRouter);
app.use('/api/calendar', calendarRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

export default app;
