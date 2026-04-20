const express = require('express');
const { upload } = require('../services/storage.service');
const {
  uploadVideo,
  getAllVideos,
  getVideoDetails,
  getStreamUrl
} = require('../controllers/video.controller');

const router = express.Router();

// Route to upload a video
router.post('/upload', upload.single('video'), uploadVideo);

// Route to list all videos
router.get('/', getAllVideos);

// Route to get a specific video details
router.get('/:id', getVideoDetails);

// Route to get the streaming playlist url
router.get('/:id/stream', getStreamUrl);

module.exports = router;
