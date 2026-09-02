import mongoose from 'mongoose';

// A single meeting slot for an apostolate. An apostolate may have several
// (e.g. a weekly gathering plus a monthly one).
const meetingScheduleSchema = new mongoose.Schema({
  day: { type: String, default: '' },
  time: { type: String, default: '' },
  location: { type: String, default: '' }
}, { _id: false });

const apostolateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  meetingSchedules: {
    type: [meetingScheduleSchema],
    default: []
  },
  photo: {
    type: String,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

export default mongoose.model('Apostolate', apostolateSchema);
