const { Queue } = require('bullmq');

const connection = {
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: process.env.REDIS_PORT || 6379
};

// Create a BullMQ Queue instance
const videoQueue = new Queue('video-processing', { connection });

/**
 * Add a new video processing job to the queue
 * @param {Object} jobData { videoId, filePath } 
 */
const addVideoJob = async (jobData) => {
  await videoQueue.add('process-video', jobData, {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000 // 5s, 25s, 125s
    }
  });
};

module.exports = {
  videoQueue,
  addVideoJob
};
