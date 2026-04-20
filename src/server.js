require('dotenv').config();
const app = require('./app');
const mongoose = require('mongoose');

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/video_streaming';

const startServer = async () => {
  try {
    // Connect to Database
    await mongoose.connect(MONGO_URI);
    console.log(`[Database] Connected to MongoDB at ${MONGO_URI}`);

    // Start listening
    app.listen(PORT, () => {
      console.log(`[Server] Core HTTP server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('[Server] Failed to start:', error.message);
    process.exit(1);
  }
};

startServer();
