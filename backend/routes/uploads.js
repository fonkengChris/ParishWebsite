import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Uploaded files live in backend/uploads/ and are served statically at /uploads
// (see startup/middleware.js). Keep this path in sync with that static mount.
export const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');
fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']);
const EXT_BY_MIME = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
  'image/svg+xml': '.svg'
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => {
    const ext = EXT_BY_MIME[file.mimetype] || path.extname(file.originalname) || '';
    const unique = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}`;
    cb(null, `${unique}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (req, file, cb) => {
    if (ALLOWED_MIME.has(file.mimetype)) return cb(null, true);
    cb(new Error('Unsupported file type. Upload a JPEG, PNG, WebP, GIF or SVG image.'));
  }
});

/**
 * POST /api/uploads
 * Admin-only. Accepts a single `image` file (multipart/form-data) and returns
 * its public URL. Frontend and backend deploy on different origins, so we
 * return an absolute URL (overridable with PUBLIC_BASE_URL for proxied hosts).
 */
router.post('/', authenticate, requireAdmin, (req, res) => {
  upload.single('image')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded. Send it as the "image" field.' });
    }
    const base = process.env.PUBLIC_BASE_URL || `${req.protocol}://${req.get('host')}`;
    const url = `${base.replace(/\/$/, '')}/uploads/${req.file.filename}`;
    res.status(201).json({ url });
  });
});

export default router;
