const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs');
const Video = require('../models/Video');

// We configure these specific resolutions for adaptive streaming
const RESOLUTIONS = [
  { name: '144p', width: 256, height: 144, bitrate: '400k' },
  { name: '240p', width: 426, height: 240, bitrate: '600k' },
  { name: '360p', width: 640, height: 360, bitrate: '800k' },
  { name: '480p', width: 854, height: 480, bitrate: '1200k' },
  { name: '720p', width: 1280, height: 720, bitrate: '2500k' },
  { name: '1080p', width: 1920, height: 1080, bitrate: '4500k' }
];

const processVideoJob = async (job) => {
  const { videoId, filePath } = job.data;
  
  const video = await Video.findById(videoId);
  if (!video) throw new Error('Video record not found');

  try {
    // Determine output directory
    const outputDir = path.join(__dirname, `../../videos/output/${videoId}`);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Get Original Info
    const metadata = await new Promise((resolve, reject) => {
      ffmpeg.ffprobe(filePath, (err, metadata) => {
        if (err) reject(err);
        else resolve(metadata);
      });
    });

    const duration = metadata.format.duration || 0;
    
    // Create master playlist
    const masterPlaylistPath = path.join(outputDir, 'master.m3u8');
    let masterContent = '#EXTM3U\n#EXT-X-VERSION:3\n';

    // We will run a Promise for each resolution we want to generate
    const processedResolutions = [];

    for (let i = 0; i < RESOLUTIONS.length; i++) {
      const res = RESOLUTIONS[i];
      const resName = res.name;
      const resDir = path.join(outputDir, resName);
      
      if (!fs.existsSync(resDir)) {
        fs.mkdirSync(resDir, { recursive: true });
      }

      const m3u8Filename = `index.m3u8`;
      const m3u8OutputPath = path.join(resDir, m3u8Filename);

      console.log(`[Worker] Started encoding ${resName} for ${videoId}`);
      
      await new Promise((resolve, reject) => {
        ffmpeg(filePath)
          .outputOptions([
            `-vf scale=w=${res.width}:h=${res.height}:force_original_aspect_ratio=decrease,pad=ceil(iw/2)*2:ceil(ih/2)*2`,
            `-c:a aac`,
            `-ar 48000`,
            `-c:v h264`,
            `-profile:v main`,
            `-crf 20`,
            `-sc_threshold 0`,
            `-g 48`,
            `-keyint_min 48`,
            `-hls_time 3`,
            `-hls_playlist_type vod`,
            `-b:v ${res.bitrate}`,
            `-maxrate ${res.bitrate}`,
            `-bufsize ${res.bitrate}`,
            // ts segment filename layout
            `-hls_segment_filename ${resDir}/segment_%03d.ts`
          ])
          .output(m3u8OutputPath)
          .on('end', () => {
             console.log(`[Worker] Finished encoding ${resName}`);
             resolve();
          })
          .on('error', (err) => {
            console.error(`[Worker] Error encoding ${resName}:`, err);
            reject(err);
          })
          /* Usually progress mapping can go here:
          .on('progress', (progress) => {
             // Tracking overall % would require aggregating % from each task.
             // Here we keep it lightweight.
          })
          */
          .run();
      });

      // After success, append to master playlist
      masterContent += `#EXT-X-STREAM-INF:BANDWIDTH=${parseInt(res.bitrate)*1000},RESOLUTION=${res.width}x${res.height}\n`;
      masterContent += `${resName}/${m3u8Filename}\n`;
      
      processedResolutions.push(resName);
    }

    // Save master playlist
    fs.writeFileSync(masterPlaylistPath, masterContent);

    // Update Video record
    video.status = 'ready';
    video.resolutions = processedResolutions;
    video.duration = duration;
    video.masterPlaylistUrl = `/videos/output/${videoId}/master.m3u8`;
    await video.save();

  } catch (error) {
    video.status = 'failed';
    await video.save();
    throw error; // Rethrow to let BullMQ know the job failed
  }
};

module.exports = {
  processVideoJob
};
