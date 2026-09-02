import express from 'express';
import ParishService from '../models/ParishService.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get all active parish services (public)
router.get('/', async (req, res) => {
  try {
    const services = await ParishService.find({ isActive: true })
      .sort({ order: 1, name: 1 });
    res.json(services);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all parish services (admin)
router.get('/all', authenticate, requireAdmin, async (req, res) => {
  try {
    const services = await ParishService.find().sort({ order: 1, name: 1 });
    res.json(services);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single parish service
router.get('/:id', async (req, res) => {
  try {
    const service = await ParishService.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ message: 'Parish service not found' });
    }
    res.json(service);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create parish service (admin)
router.post('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const service = new ParishService(req.body);
    await service.save();
    res.status(201).json(service);
  } catch (error) {
    res.status(400).json({ message: 'Error creating parish service', error: error.message });
  }
});

// Update parish service (admin)
router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const service = await ParishService.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!service) {
      return res.status(404).json({ message: 'Parish service not found' });
    }
    res.json(service);
  } catch (error) {
    res.status(400).json({ message: 'Error updating parish service', error: error.message });
  }
});

// Delete parish service (admin)
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const service = await ParishService.findByIdAndDelete(req.params.id);
    if (!service) {
      return res.status(404).json({ message: 'Parish service not found' });
    }
    res.json({ message: 'Parish service deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
