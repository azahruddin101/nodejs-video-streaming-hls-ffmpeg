# 🎬 Node.js Video Streaming Platform (HLS + FFmpeg + Adaptive Bitrate)

A production-ready backend system for video streaming that supports **adaptive bitrate streaming (HLS)** using **FFmpeg**, built with **Node.js, Express.js, MongoDB, and BullMQ**.

This project demonstrates how platforms like YouTube/Netflix process and stream videos efficiently.

---

## 🚀 Features

* 📤 Video upload system (Admin-based)
* ⚡ Asynchronous video processing (BullMQ + Redis)
* 🎥 Multi-resolution transcoding:

  * 144p, 240p, 360p, 480p, 720p, 1080p
* 📡 Adaptive bitrate streaming (HLS - `.m3u8` + `.ts`)
* 🧠 Master playlist generation
* 📦 Chunked video segments (~6 sec)
* 🔄 Retry & fault-tolerant processing
* 🧩 Separate worker service (FFmpeg isolation)
* 📊 Video status tracking (processing, ready, failed)
* 📁 Scalable architecture (ready for S3 + CDN)

---

## 🧠 Architecture

```
Client → API Server → Redis Queue → Worker (FFmpeg) → Storage → HLS Output
```

* API server handles requests
* Worker processes videos (CPU intensive tasks)
* Redis queue ensures reliability and scalability

---

## ⚙️ Tech Stack

* Node.js
* Express.js
* MongoDB (Mongoose)
* BullMQ + Redis
* FFmpeg
* HLS (HTTP Live Streaming)

---

## 📁 Project Structure

```
├── api/
├── worker/
├── models/
├── controllers/
├── services/
├── queues/
├── utils/
├── videos/
│   ├── input/
│   └── output/
```

---

## 📡 API Endpoints

### Upload Video

POST /api/videos/upload

### Get All Videos

GET /api/videos

### Get Single Video

GET /api/videos/:id

### Get Streaming URL

GET /api/videos/:id/stream

---

## 🎬 How It Works

1. Admin uploads video
2. Video stored locally (or S3-ready design)
3. Job added to BullMQ queue
4. Worker picks job and runs FFmpeg
5. Video converted into multiple resolutions
6. HLS segments + playlists generated
7. Master `.m3u8` returned for streaming

---

## ▶️ Run Locally

### 1. Install dependencies

```bash
npm install
```

### 2. Install FFmpeg

```bash
brew install ffmpeg
```

### 3. Start Redis

```bash
brew services start redis
```

### 4. Run API server

```bash
node api/server.js
```

### 5. Run Worker

```bash
node worker/worker.js
```

---

## 📺 Test Streaming

Open:
```
http://localhost:4000/videos/output/{videoId}/master.m3u8
```

Use:

* VLC Player
* HLS.js (browser)

---

## 🧪 Example Output

```
/videos/output/
master.m3u8
/v0 (144p)
/v1 (240p)
/v2 (360p)
...
```

---

## 🔥 Future Improvements

* ☁️ AWS S3 + CloudFront integration
* 🔐 DRM (Widevine/FairPlay)
* 📊 Analytics & watch tracking
* 🎞️ Thumbnail & preview generation
* ⚡ GPU-based transcoding
* 📡 MPEG-DASH support

---

## 📌 Keywords (SEO)

video streaming, hls streaming nodejs, ffmpeg nodejs, adaptive bitrate streaming, video processing backend, bullmq ffmpeg, video streaming server nodejs

---

## ⭐ Contribute

PRs are welcome. Feel free to improve performance, add features, or optimize FFmpeg pipeline.

---

## 📜 License

MIT License

---

## 🙌 Author

Built with ❤️ for learning and production-grade system design.
