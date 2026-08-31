import express from 'express';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import SiteContent from '../models/SiteContent.js';

const router = express.Router();

/**
 * Deep-merge plain objects so admins can save one section without resending the
 * whole document. Arrays are replaced wholesale (not merged element-by-element).
 */
const isPlainObject = (v) =>
  v && typeof v === 'object' && !Array.isArray(v);

const deepMerge = (target, source) => {
  const out = { ...target };
  for (const [key, value] of Object.entries(source)) {
    if (isPlainObject(value) && isPlainObject(out[key])) {
      out[key] = deepMerge(out[key], value);
    } else {
      out[key] = value;
    }
  }
  return out;
};

/**
 * GET /api/site-content
 * Public. Returns the singleton, or an empty object if none exists — the
 * frontend fills gaps from its shipped defaults (data/defaultSiteContent.ts).
 */
router.get('/', async (req, res) => {
  try {
    const content = await SiteContent.findOne({ key: 'default' }).lean();
    res.set('Cache-Control', 'public, max-age=60');
    res.json(content || {});
  } catch (error) {
    console.error('Error fetching site content:', error);
    res.status(500).json({
      message: 'Error retrieving site content',
      error: error.message
    });
  }
});

/**
 * PUT /api/site-content
 * Admin-only. Deep-merges the payload into the existing singleton (upsert).
 */
router.put('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const existing = await SiteContent.findOne({ key: 'default' });

    if (!existing) {
      const created = await SiteContent.create({ ...req.body, key: 'default' });
      return res.json(created.toObject());
    }

    const merged = deepMerge(existing.toObject(), req.body);
    delete merged._id;
    merged.key = 'default';

    existing.set(merged);
    await existing.save();

    res.json(existing.toObject());
  } catch (error) {
    console.error('Error updating site content:', error);
    res.status(500).json({
      message: 'Error updating site content',
      error: error.message
    });
  }
});

export default router;
