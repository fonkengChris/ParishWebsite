import express from 'express';
import Apostolate from '../models/Apostolate.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get all active apostolates (public)
router.get('/', async (req, res) => {
  try {
    const apostolates = await Apostolate.find({ isActive: true })
      .sort({ name: 1 });
    res.json(apostolates);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all apostolates (admin)
router.get('/all', authenticate, requireAdmin, async (req, res) => {
  try {
    const apostolates = await Apostolate.find().sort({ name: 1 });
    res.json(apostolates);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single apostolate
router.get('/:id', async (req, res) => {
  try {
    const apostolate = await Apostolate.findById(req.params.id);
    if (!apostolate) {
      return res.status(404).json({ message: 'Apostolate not found' });
    }
    res.json(apostolate);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create apostolate (admin)
router.post('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const apostolate = new Apostolate(req.body);
    await apostolate.save();
    res.status(201).json(apostolate);
  } catch (error) {
    res.status(400).json({ message: 'Error creating apostolate', error: error.message });
  }
});

// Update apostolate (admin)
router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const apostolate = await Apostolate.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!apostolate) {
      return res.status(404).json({ message: 'Apostolate not found' });
    }
    res.json(apostolate);
  } catch (error) {
    res.status(400).json({ message: 'Error updating apostolate', error: error.message });
  }
});

// Delete apostolate (admin)
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const apostolate = await Apostolate.findByIdAndDelete(req.params.id);
    if (!apostolate) {
      return res.status(404).json({ message: 'Apostolate not found' });
    }
    res.json({ message: 'Apostolate deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
