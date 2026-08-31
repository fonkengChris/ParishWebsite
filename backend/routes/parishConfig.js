import express from 'express';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import ParishConfig from '../models/ParishConfig.js';

const router = express.Router();

/**
 * Build a fallback config object from environment variables. Used only until
 * the DB singleton is populated, so an unconfigured instance still renders.
 */
const buildFallbackConfig = () => {
  const [lat, lng] = (process.env.PARISH_COORDINATES || '0,0')
    .split(',')
    .map((n) => parseFloat(n.trim()) || 0);

  return {
    key: 'default',
    name: process.env.PARISH_NAME || 'Parish Website',
    diocese: process.env.PARISH_DIOCESE || '',
    dioceseUrl: process.env.PARISH_DIOCESE_URL || '',
    city: process.env.PARISH_CITY || '',
    region: process.env.PARISH_REGION || '',
    country: process.env.PARISH_COUNTRY || '',
    coordinates: { lat, lng },
    neighbourhood: process.env.PARISH_NEIGHBOURHOOD || '',
    contact: {
      phone: process.env.PARISH_PHONE || '',
      email: process.env.PARISH_CONTACT_EMAIL || process.env.SMTP_FROM_EMAIL || '',
      address: process.env.PARISH_ADDRESS || '',
      officeHours: []
    },
    social: {
      facebook: '',
      youtube: '',
      instagram: '',
      whatsapp: '',
      twitter: ''
    },
    tagline: process.env.PARISH_TAGLINE || '',
    patron: {
      name: process.env.PARISH_PATRON_NAME || '',
      descriptor: process.env.PARISH_PATRON_DESCRIPTOR || ''
    },
    assets: { logoUrl: '', faviconUrl: '', heroUrl: '' },
    currency: process.env.MTN_CURRENCY || 'XAF'
  };
};

/**
 * GET /api/parish-config
 * Public. Returns the singleton, or an env-derived fallback if none exists.
 */
router.get('/', async (req, res) => {
  try {
    const config = await ParishConfig.findOne({ key: 'default' }).lean();
    res.set('Cache-Control', 'public, max-age=60');
    res.json(config || buildFallbackConfig());
  } catch (error) {
    console.error('Error fetching parish config:', error);
    res.status(500).json({
      message: 'Error retrieving parish config',
      error: error.message
    });
  }
});

/**
 * PUT /api/parish-config
 * Admin-only. Upserts the singleton.
 */
router.put('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const update = { ...req.body, key: 'default' };
    const config = await ParishConfig.findOneAndUpdate(
      { key: 'default' },
      { $set: update },
      { new: true, upsert: true, setDefaultsOnInsert: true, runValidators: true }
    ).lean();

    res.json(config);
  } catch (error) {
    console.error('Error updating parish config:', error);
    res.status(500).json({
      message: 'Error updating parish config',
      error: error.message
    });
  }
});

export default router;
