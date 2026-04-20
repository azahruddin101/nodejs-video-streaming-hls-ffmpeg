const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Configure Multer for local uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Save to the videos/uploads directory
    cb(null, path.join(__dirname, '../../videos/uploads'));
  },
  filename: (req, file, cb) => {
    // Generate a unique filename using UUID
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  }
});

// File filter (accept mp4, mkv)
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['video/mp4', 'video/x-matroska'];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only MP4 and MKV are allowed.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    // Optional size limit handling
    fileSize: (process.env.MAX_FILE_SIZE_MB || 500) * 1024 * 1024
  }
});

module.exports = {
  upload
};
