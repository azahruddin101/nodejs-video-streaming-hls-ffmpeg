const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true,
    default: ""
  },
  originalVideoUrl: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'ready', 'failed'],
    default: 'pending'
  },
  duration: {
    type: Number,
    default: 0
  },
  resolutions: {
    type: [String],
    default: []
  },
  masterPlaylistUrl: {
    type: String,
    default: null
  },
  progress: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

module.exports = mongoose.model('Video', videoSchema);
