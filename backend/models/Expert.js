import mongoose from 'mongoose';

const slotSchema = new mongoose.Schema({
  date: { type: String, required: true },   // YYYY-MM-DD
  time: { type: String, required: true },   // HH:MM
  isBooked: { type: Boolean, default: false },
});

const expertSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    category: {
      type: String,
      required: true,
      enum: [
        'Business Strategy',
        'Technology',
        'Finance',
        'Marketing',
        'Legal',
        'Design',
        'Product Management',
        'Data Science',
        'HR & Talent',
        'Operations',
      ],
    },
    title: { type: String, required: true },
    bio: { type: String, required: true },
    experience: { type: Number, required: true, min: 1 },
    rating: { type: Number, required: true, min: 1, max: 5 },
    reviewCount: { type: Number, default: 0 },
    avatar: { type: String },
    hourlyRate: { type: Number, required: true },
    tags: [{ type: String }],
    availableSlots: [slotSchema],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

expertSchema.index({ category: 1 });
expertSchema.index({ name: 'text', bio: 'text', tags: 'text' });
expertSchema.index({ rating: -1 });

const Expert = mongoose.model('Expert', expertSchema);
export default Expert;
