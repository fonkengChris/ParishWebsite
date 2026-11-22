import express from 'express';
import Parishioner from '../models/Parishioner.js';
import User from '../models/User.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// A profile may only be read or changed by the parishioner it belongs to, or by an admin
const requireProfileOwnerOrAdmin = async (req, res, next) => {
  try {
    if (req.user.role === 'admin') return next();
    const user = await User.findById(req.user.userId).select('parishioner');
    if (user?.parishioner && user.parishioner.toString() === req.params.id) return next();
    return res.status(403).json({ message: 'You can only access your own profile' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get parishioner profile by ID (owner or admin)
router.get('/profile/:id', authenticate, requireProfileOwnerOrAdmin, async (req, res) => {
  try {
    const parishioner = await Parishioner.findById(req.params.id)
      .populate('user', 'email role')
      .populate('missionStation', 'name location')
      .populate('apostolates', 'name');
    if (!parishioner) {
      return res.status(404).json({ message: 'Parishioner not found' });
    }
    res.json(parishioner);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update parishioner profile by ID (owner or admin)
// Restricted fields (user, isActive) cannot be updated through this endpoint
router.put('/profile/:id', authenticate, requireProfileOwnerOrAdmin, async (req, res) => {
  try {
    // Fields that should NOT be updatable through public profile endpoint
    const restrictedFields = ['_id', 'user', 'isActive', 'createdAt', 'updatedAt'];
    
    // Filter out restricted fields
    const updateData = { ...req.body };
    restrictedFields.forEach(field => {
      delete updateData[field];
    });
    
    const parishioner = await Parishioner.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('user', 'email role')
      .populate('missionStation', 'name location')
      .populate('apostolates', 'name');
    if (!parishioner) {
      return res.status(404).json({ message: 'Parishioner not found' });
    }
    res.json(parishioner);
  } catch (error) {
    res.status(400).json({ message: 'Error updating parishioner', error: error.message });
  }
});

// Get all parishioners (admin only)
router.get('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const parishioners = await Parishioner.find()
      .populate('user', 'email role')
      .populate('missionStation', 'name location')
      .populate('apostolates', 'name')
      .sort({ lastName: 1, firstName: 1 });
    res.json(parishioners);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single parishioner (admin only)
router.get('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const parishioner = await Parishioner.findById(req.params.id)
      .populate('user', 'email role')
      .populate('missionStation', 'name location')
      .populate('apostolates', 'name');
    if (!parishioner) {
      return res.status(404).json({ message: 'Parishioner not found' });
    }
    res.json(parishioner);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update parishioner (admin only)
router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const updateData = { ...req.body };
    
    const parishioner = await Parishioner.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('user', 'email role')
      .populate('missionStation', 'name location')
      .populate('apostolates', 'name');
    if (!parishioner) {
      return res.status(404).json({ message: 'Parishioner not found' });
    }
    res.json(parishioner);
  } catch (error) {
    res.status(400).json({ message: 'Error updating parishioner', error: error.message });
  }
});

// Delete parishioner (admin only)
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const parishioner = await Parishioner.findByIdAndDelete(req.params.id);
    if (!parishioner) {
      return res.status(404).json({ message: 'Parishioner not found' });
    }
    res.json({ message: 'Parishioner deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;

