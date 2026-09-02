import mongoose from 'mongoose';

/**
 * Sacrament — a parish-dependent record describing how a sacrament is offered
 * and prepared for at THIS parish. Because each parish runs its own database
 * (one parish per deployment), these documents are inherently parish-specific:
 * availability (when/how it is offered) and procedure (the steps/requirements to
 * receive it) are set by each parish's own staff via the admin panel.
 */
const sacramentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  // When and how the sacrament is offered at this parish
  availability: {
    type: String,
    default: ''
  },
  // The steps / requirements to receive the sacrament at this parish
  procedure: {
    type: String,
    default: ''
  },
  // Controls display order on the public page (lower first)
  order: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

export default mongoose.model('Sacrament', sacramentSchema);
