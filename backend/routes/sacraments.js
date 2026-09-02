import express from 'express';
import Sacrament from '../models/Sacrament.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get all active sacraments (public)
router.get('/', async (req, res) => {
  try {
    const sacraments = await Sacrament.find({ isActive: true })
      .sort({ order: 1, name: 1 });
    res.json(sacraments);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all sacraments (admin)
router.get('/all', authenticate, requireAdmin, async (req, res) => {
  try {
    const sacraments = await Sacrament.find().sort({ order: 1, name: 1 });
    res.json(sacraments);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single sacrament
router.get('/:id', async (req, res) => {
  try {
    const sacrament = await Sacrament.findById(req.params.id);
    if (!sacrament) {
      return res.status(404).json({ message: 'Sacrament not found' });
    }
    res.json(sacrament);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create sacrament (admin)
router.post('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const sacrament = new Sacrament(req.body);
    await sacrament.save();
    res.status(201).json(sacrament);
  } catch (error) {
    res.status(400).json({ message: 'Error creating sacrament', error: error.message });
  }
});

// Update sacrament (admin)
router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const sacrament = await Sacrament.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!sacrament) {
      return res.status(404).json({ message: 'Sacrament not found' });
    }
    res.json(sacrament);
  } catch (error) {
    res.status(400).json({ message: 'Error updating sacrament', error: error.message });
  }
});

// Delete sacrament (admin)
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const sacrament = await Sacrament.findByIdAndDelete(req.params.id);
    if (!sacrament) {
      return res.status(404).json({ message: 'Sacrament not found' });
    }
    res.json({ message: 'Sacrament deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
