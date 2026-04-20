require('dotenv').config();
const { Worker } = require('bullmq');
const mongoose = require('mongoose');
const { processVideoJob } = require('./video.processor');

const connection = {
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: process.env.REDIS_PORT || 6379,
  maxRetriesPerRequest: null
};

const startWorker = async () => {
  const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/video_streaming';
  
  // Connect worker to MongoDB so it can update video records
  try {
    await mongoose.connect(MONGO_URI);
    console.log(`[Worker] Connected to MongoDB at ${MONGO_URI}`);
  } catch (err) {
    console.error('[Worker] MongoDB Connection Error:', err);
    process.exit(1);
  }

  const worker = new Worker('video-processing', async job => {
    console.log(`[Worker] Picked up job ${job.id} for videoId: ${job.data.videoId}`);
    await processVideoJob(job);
  }, { connection });

  worker.on('completed', job => {
    console.log(`[Worker] Job ${job.id} completed successfully.`);
  });

  worker.on('failed', (job, err) => {
    console.log(`[Worker] Job ${job.id} failed with error: ${err.message}`);
  });

  console.log('[Worker] Video Processing Worker Started & Listening...');
};

startWorker();
