require('dotenv').config(); // ← MUST be line 1, before any other imports

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();

// ─── Middleware ──────────────────────────────────────────────
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5000', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ─── Routes ─────────────────────────────────────────────────
app.use('/api/auth',         require('./routes/auth'));
app.use('/api/jobs',         require('./routes/jobs'));
app.use('/api/applications', require('./routes/applications'));
app.use('/api/interviews',   require('./routes/interviews'));
app.use('/api/users',        require('./routes/users'));
app.use('/api/analytics',    require('./routes/analytics'));

// ─── Health check ────────────────────────────────────────────
app.get('/api/health', (req, res) => res.json({ status: 'OK', timestamp: new Date() }));

// ─── Global error handler ────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

// ─── Database + Start ────────────────────────────────────────
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

// Debug: confirm env vars loaded (remove after confirming it works)
console.log('PORT:', PORT);
console.log('MONGO_URI:', MONGO_URI ? '✅ Loaded' : '❌ UNDEFINED — check your .env file location');

if (!MONGO_URI) {
  console.error('\n❌ ERROR: MONGO_URI is not defined.');
  console.error('Fix: Make sure backend/.env exists and contains MONGO_URI=...\n');
  process.exit(1);
}

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });

module.exports = app;