import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { ROLES, GRANTABLE, can } from '../utils/permissions.js';

const userSchema = new mongoose.Schema({
  // For admin/editor users
  username: {
    type: String,
    sparse: true, // Allows null/undefined, but must be unique when present
    unique: true,
    trim: true
  },
  // For parishioner users (email-based)
  email: {
    type: String,
    sparse: true, // Allows null/undefined, but must be unique when present
    unique: true,
    trim: true,
    lowercase: true
  },
  passwordHash: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ROLES,
    required: true
  },
  // One-to-one relationship with Parishioner (only for parishioner role)
  parishioner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Parishioner',
    default: null
  },
  // Individual adjustments to the role (see utils/permissions.js): extra areas granted,
  // and areas the role would give but that were taken away
  permissions: {
    type: [{ type: String, enum: GRANTABLE }],
    default: []
  },
  revokedPermissions: {
    type: [{ type: String, enum: GRANTABLE }],
    default: []
  }
}, {
  timestamps: true
});

// Validation: either username or email must be provided
userSchema.pre('validate', function(next) {
  if (!this.username && !this.email) {
    next(new Error('Either username or email is required'));
  } else {
    next();
  }
});

userSchema.methods.comparePassword = async function(password) {
  return bcrypt.compare(password, this.passwordHash);
};

// Permission helper methods (rules live in utils/permissions.js)
userSchema.methods.canAccess = function(resource) {
  return can(this, resource);
};

userSchema.methods.hasRole = function(...roles) {
  return roles.includes(this.role);
};

export default mongoose.model('User', userSchema);


