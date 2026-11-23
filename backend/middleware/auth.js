import jwt from 'jsonwebtoken';
import { can, canAny } from '../utils/permissions.js';

export const authenticate = (req, res, next) => {
  try {
    // Try to get token from Authorization header first
    let token = req.headers.authorization?.split(' ')[1];
    
    // If no token in header, try to get from query (for backward compatibility)
    if (!token) {
      token = req.query.token;
    }

    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    return res.status(401).json({ message: 'Authentication failed' });
  }
};

// Allows the request when the user's role may manage `resource` (see utils/permissions.js)
export const requirePermission = (resource) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  if (!can(req.user, resource)) {
    return res.status(403).json({ message: `You do not have permission to manage ${resource}` });
  }
  next();
};

// Allows the request when the user may manage at least one of `resources`
export const requireAnyPermission = (resources) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  if (!canAny(req.user, resources)) {
    return res.status(403).json({ message: 'You do not have permission to do this' });
  }
  next();
};
