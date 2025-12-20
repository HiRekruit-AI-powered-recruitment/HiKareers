const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const multer = require('multer');
const streamifier = require('streamifier');
const cloudinary = require('./config/cloudinary');

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 5000;
const mongoUri = process.env.MONGO_URI;

// Basic middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Multer setup (memory storage as placeholder)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB limit for PDFs
});

// Health route
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'API is running' });
});

// Example upload route (for testing Multer)
app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  res.json({ filename: req.file.originalname, size: req.file.size });
});

// Upload PDF to Cloudinary (resource_type: 'raw')
app.post('/api/upload-pdf', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  if (req.file.mimetype !== 'application/pdf') {
    return res.status(400).json({ error: 'Only PDF files are allowed' });
  }

  try {
    const folder = 'hirekruit/pdfs';

    const uploadStream = cloudinary.uploader.upload_stream(
      { resource_type: 'raw', folder },
      (error, result) => {
        if (error) {
          return res.status(500).json({ error: error.message });
        }
        return res.json({
          public_id: result.public_id,
          url: result.secure_url,
          bytes: result.bytes,
        });
      }
    );

    // Stream the buffer to Cloudinary
    streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// Connect to MongoDB (non-blocking start)
async function startServer() {
  try {
    if (mongoUri) {
      await mongoose.connect(mongoUri, { autoIndex: true });
      console.log('MongoDB connected');
    } else {
      console.warn('MONGO_URI not set. Skipping MongoDB connection.');
    }
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
  } finally {
    app.listen(port, () => {
      console.log(`Server listening on port ${port}`);
    });
  }
}

startServer();
