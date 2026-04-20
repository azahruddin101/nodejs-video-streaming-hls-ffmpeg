const Video = require('../models/Video');
const { addVideoJob } = require('../queues/video.queue');
const path = require('path');

exports.uploadVideo = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No video file provided' });
    }

    const { title, description } = req.body;
    
    // Create new video entry in DB with 'processing' status since it's uploaded
    const video = await Video.create({
      title: title || 'Untitled Video',
      description: description || '',
      originalVideoUrl: req.file.path,
      status: 'processing'
    });

    // Enqueue job for background processing
    await addVideoJob({
      videoId: video._id.toString(),
      filePath: req.file.path
    });

    return res.status(201).json({
      success: true,
      message: 'Video uploaded and queued for processing successfully',
      data: video
    });
  } catch (error) {
    next(error);
  }
};

exports.getAllVideos = async (req, res, next) => {
  try {
    const videos = await Video.find().sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      data: videos
    });
  } catch (error) {
    next(error);
  }
};

exports.getVideoDetails = async (req, res, next) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) {
      return res.status(404).json({ success: false, message: 'Video not found' });
    }

    return res.status(200).json({
      success: true,
      data: video
    });
  } catch (error) {
    next(error);
  }
};

exports.getStreamUrl = async (req, res, next) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) {
      return res.status(404).json({ success: false, message: 'Video not found' });
    }

    if (video.status !== 'ready' || !video.masterPlaylistUrl) {
      return res.status(400).json({ success: false, message: 'Video is not ready for streaming yet' });
    }

    // Usually, stream URL might need signing or formatting, depending on deployment setup
    // Since we map /videos/output in our static server we can return the local path
    const streamUrl = `/videos/output/${video._id}/master.m3u8`;

    return res.status(200).json({
      success: true,
      data: {
        streamUrl
      }
    });
  } catch (error) {
    next(error);
  }
};
