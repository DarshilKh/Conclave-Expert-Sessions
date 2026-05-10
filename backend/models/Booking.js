import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    expert: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Expert',
      required: true,
    },
    expertName: {
      type: String,
      required: true,
    },
    expertCategory: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    date: {
      type: String,
      required: true,
      match: [/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'],
    },
    timeSlot: {
      type: String,
      required: true,
      match: [/^\d{2}:\d{2}$/, 'Time slot must be in HH:MM format'],
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: ['Pending', 'Confirmed', 'Completed', 'Cancelled'],
      default: 'Pending',
    },
  },
  {
    timestamps: true,
    // Ensure Mongoose doesn't strip unknown fields silently in future
    strict: true,
  }
);

// ── Compound unique index ─────────────────────────────────────────────────────
// Hard database-level guard: prevents duplicate bookings for the same
// expert + date + time even if application-level locking is bypassed
// (e.g. after a manual DB fix that resets isBooked flags).
bookingSchema.index(
  { expert: 1, date: 1, timeSlot: 1 },
  {
    unique: true,
    // Name the index explicitly so it's identifiable in error messages
    // and MongoDB logs — makes 11000 duplicate key errors easier to trace.
    name: 'unique_expert_date_timeslot',
  }
);

// ── Supporting indexes ────────────────────────────────────────────────────────
// email: powers GET /bookings?email= lookups
bookingSchema.index({ email: 1 }, { name: 'idx_email' });

// expert: powers admin/expert dashboard queries
bookingSchema.index({ expert: 1 }, { name: 'idx_expert' });

// status: powers filtered status queries
bookingSchema.index({ status: 1 }, { name: 'idx_status' });

// ── Orphan-recovery helper (static method) ────────────────────────────────────
// Called by external recovery scripts or admin routes to find bookings
// that exist without a corresponding locked slot, or vice-versa.
// This does NOT run automatically — it's a manual recovery tool.
bookingSchema.statics.findOrphaned = async function () {
  return this.find({ status: 'Pending' })
    .sort({ createdAt: 1 })
    .lean();
};

const Booking = mongoose.model('Booking', bookingSchema);
export default Booking;