import express from 'express';
import User from '../models/User.js';
import { authenticate, requirePermission } from '../middleware/auth.js';
import { ROLES, GRANTABLE, canGrantRole, isTopRank, normalizeAdjustments } from '../utils/permissions.js';

const router = express.Router();

// Get all users (admin/parish-priest only)
router.get('/', authenticate, requirePermission('Users'), async (req, res) => {
  try {
    const users = await User.find()
      .select('-passwordHash')
      .populate('parishioner', 'firstName lastName email')
      .sort({ createdAt: -1 });
    
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single user by ID (admin/parish-priest only)
router.get('/:id', authenticate, requirePermission('Users'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-passwordHash')
      .populate('parishioner', 'firstName lastName email');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update user role (admin/parish-priest only)
router.put('/:id/role', authenticate, requirePermission('Users'), async (req, res) => {
  try {
    const { role } = req.body;
    
    if (!role) {
      return res.status(400).json({ message: 'Role is required' });
    }
    
    if (!ROLES.includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    if (!canGrantRole(req.user.role, role)) {
      return res.status(403).json({ message: 'You cannot grant a role above your own' });
    }
    
    // Prevent users from changing their own role (security measure)
    if (req.user.userId === req.params.id) {
      return res.status(403).json({ message: 'You cannot change your own role' });
    }
    
    const user = await User.findById(req.params.id).select('-passwordHash');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!canGrantRole(req.user.role, user.role)) {
      return res.status(403).json({ message: 'You cannot change the role of a user above your own' });
    }

    user.role = role;
    // Keep only the grants/revocations that still mean something for the new role
    Object.assign(user, normalizeAdjustments(role, user.permissions, user.revokedPermissions));
    await user.save();
    
    res.json(user);
  } catch (error) {
    res.status(400).json({ message: 'Error updating user role', error: error.message });
  }
});

// Set a user's individual adjustments: areas granted on top of their role, and areas their
// role gives that are revoked (admin/parish-priest only)
router.put('/:id/permissions', authenticate, requirePermission('Users'), async (req, res) => {
  try {
    const { permissions, revokedPermissions = [] } = req.body;

    if (!Array.isArray(permissions) || !Array.isArray(revokedPermissions)) {
      return res.status(400).json({ message: 'Permissions must be lists' });
    }

    const invalid = [...permissions, ...revokedPermissions].filter((p) => !GRANTABLE.includes(p));
    if (invalid.length) {
      return res.status(400).json({ message: `Cannot adjust: ${invalid.join(', ')}` });
    }

    if (req.user.userId === req.params.id) {
      return res.status(403).json({ message: 'You cannot change your own permissions' });
    }

    const user = await User.findById(req.params.id).select('-passwordHash');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!canGrantRole(req.user.role, user.role)) {
      return res.status(403).json({ message: 'You cannot change the permissions of a user above your own' });
    }

    if (isTopRank(user.role)) {
      return res.status(400).json({ message: 'Admins and parish priests always have full access' });
    }

    Object.assign(user, normalizeAdjustments(user.role, permissions, revokedPermissions));
    await user.save();

    res.json(user);
  } catch (error) {
    res.status(400).json({ message: 'Error updating permissions', error: error.message });
  }
});

export default router;

