import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Cloudinary config. Either set CLOUDINARY_URL (the SDK reads it automatically)
// or the three CLOUDINARY_* vars below. Uploads persist in Cloudinary and are
// served from its CDN — the app stores only the returned URL, so this survives
// backend restarts/redeploys (Render's filesystem is ephemeral).
if (process.env.CLOUDINARY_CLOUD_NAME) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
  });
}

const isConfigured = () =>
  Boolean(process.env.CLOUDINARY_URL || process.env.CLOUDINARY_CLOUD_NAME);

const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']);

// Keep the file in memory; we stream it straight to Cloudinary (no disk writes).
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (req, file, cb) => {
    if (ALLOWED_MIME.has(file.mimetype)) return cb(null, true);
    cb(new Error('Unsupported file type. Upload a JPEG, PNG, WebP, GIF or SVG image.'));
  }
});

const uploadToCloudinary = (buffer) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'parish', resource_type: 'image' },
      (error, result) => (error ? reject(error) : resolve(result))
    );
    stream.end(buffer);
  });

/**
 * POST /api/uploads
 * Admin-only. Accepts a single `image` file (multipart/form-data), stores it in
 * Cloudinary and returns its public CDN URL.
 */
router.post('/', authenticate, requireAdmin, (req, res) => {
  if (!isConfigured()) {
    return res.status(500).json({
      message: 'Image uploads are not configured. Set CLOUDINARY_URL (or CLOUDINARY_CLOUD_NAME/API_KEY/API_SECRET) on the backend.'
    });
  }

  upload.single('image')(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded. Send it as the "image" field.' });
    }
    try {
      const result = await uploadToCloudinary(req.file.buffer);
      res.status(201).json({ url: result.secure_url });
    } catch (uploadErr) {
      console.error('Cloudinary upload failed:', uploadErr);
      res.status(502).json({ message: 'Upload to storage provider failed. Please try again.' });
    }
  });
});

export default router;
