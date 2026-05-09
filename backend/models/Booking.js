import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    expert: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Expert',
      required: true,
    },
    expertName: { type: String, required: true },
    expertCategory: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    phone: { type: String, required: true, trim: true },
    date: { type: String, required: true },   // YYYY-MM-DD
    timeSlot: { type: String, required: true }, // HH:MM
    notes: { type: String, trim: true, default: '' },
    status: {
      type: String,
      enum: ['Pending', 'Confirmed', 'Completed', 'Cancelled'],
      default: 'Pending',
    },
  },
  { timestamps: true }
);

// Compound unique index: prevents same expert/date/time double booking
bookingSchema.index(
  { expert: 1, date: 1, timeSlot: 1 },
  { unique: true }
);

bookingSchema.index({ email: 1 });
bookingSchema.index({ expert: 1 });
bookingSchema.index({ status: 1 });

const Booking = mongoose.model('Booking', bookingSchema);
export default Booking;
