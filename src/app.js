const express = require('express');
const cors = require('cors');
const path = require('path');

const videoRoutes = require('./routes/video.routes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static file serving for HLS files
// In production, this might be handled by Nginx or a CDN / S3 bucket
app.use('/videos/output', express.static(path.join(__dirname, '../videos/output')));

// Frontend Test Client
app.use('/', express.static(path.join(__dirname, '../public')));

// Routes
app.use('/api/videos', videoRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Error]:', err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Server Error'
  });
});

module.exports = app;
