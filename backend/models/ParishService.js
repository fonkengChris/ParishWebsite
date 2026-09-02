import mongoose from 'mongoose';

/**
 * ParishService — a parish-dependent record for the pastoral services and
 * formation offered at THIS parish that are NOT sacraments: e.g. youth
 * formation, small Christian communities, catechesis / RCIA, Bible study,
 * charitable outreach. Sacraments live in their own model (Sacrament.js).
 *
 * Because each parish runs its own database (one parish per deployment), these
 * documents are inherently parish-specific and are edited by each parish's own
 * staff via the admin panel.
 */
const parishServiceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  // A short one-line summary shown under the title
  description: {
    type: String,
    default: ''
  },
  // Longer detail: how it works, who it is for, and how to take part.
  // One point per line renders as a separate bullet on the public page.
  details: {
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

export default mongoose.model('ParishService', parishServiceSchema);
