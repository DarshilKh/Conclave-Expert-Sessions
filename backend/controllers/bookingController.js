import Booking from '../models/Booking.js';
import Expert from '../models/Expert.js';
import asyncHandler from '../utils/asyncHandler.js';
import { z } from 'zod';

const bookingSchema = z.object({
  expertId: z.string().min(1, 'Expert is required'),
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  phone: z
    .string()
    .regex(/^[+]?[\d\s\-().]{7,20}$/, 'Invalid phone number'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  timeSlot: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format'),
  notes: z.string().max(500).optional().default(''),
});

// POST /bookings
export const createBooking = asyncHandler(async (req, res) => {
  const parsed = bookingSchema.safeParse(req.body);
  if (!parsed.success) {
    const error = new Error(
      parsed.error.errors.map((e) => e.message).join(', ')
    );
    error.statusCode = 400;
    throw error;
  }

  const { expertId, name, email, phone, date, timeSlot, notes } = parsed.data;

  const expert = await Expert.findById(expertId);
  if (!expert) {
    const error = new Error('Expert not found.');
    error.statusCode = 404;
    throw error;
  }

  // Verify the slot exists and is available
  const slot = expert.availableSlots.find(
    (s) => s.date === date && s.time === timeSlot
  );

  if (!slot) {
    const error = new Error('Selected time slot is not available.');
    error.statusCode = 400;
    throw error;
  }

  if (slot.isBooked) {
    const error = new Error('This slot has already been booked.');
    error.statusCode = 409;
    throw error;
  }

  // Atomically mark slot as booked using findOneAndUpdate to handle race conditions
  const updatedExpert = await Expert.findOneAndUpdate(
    {
      _id: expertId,
      'availableSlots.date': date,
      'availableSlots.time': timeSlot,
      'availableSlots.isBooked': false,
    },
    { $set: { 'availableSlots.$.isBooked': true } },
    { new: true }
  );

  if (!updatedExpert) {
    const error = new Error(
      'This slot was just booked by someone else. Please choose another.'
    );
    error.statusCode = 409;
    throw error;
  }

  // Create booking record (compound unique index provides final safety net)
  const booking = await Booking.create({
    expert: expertId,
    expertName: expert.name,
    expertCategory: expert.category,
    name,
    email,
    phone,
    date,
    timeSlot,
    notes,
  });

  // Emit real-time event via socket
  const io = req.app.get('io');
  if (io) {
    io.to(`expert:${expertId}`).emit('slot:booked', {
      expertId,
      date,
      timeSlot,
      bookingId: booking._id,
    });
  }

  res.status(201).json({
    success: true,
    message: 'Booking confirmed successfully.',
    data: booking,
  });
});

// GET /bookings?email=
export const getBookingsByEmail = asyncHandler(async (req, res) => {
  const { email } = req.query;

  if (!email) {
    const error = new Error('Email query parameter is required.');
    error.statusCode = 400;
    throw error;
  }

  const emailValidation = z.string().email();
  const result = emailValidation.safeParse(email);
  if (!result.success) {
    const error = new Error('Invalid email address.');
    error.statusCode = 400;
    throw error;
  }

  const bookings = await Booking.find({ email: email.toLowerCase() })
    .sort({ createdAt: -1 })
    .lean();

  res.json({ success: true, data: bookings });
});

// PATCH /bookings/:id/status
export const updateBookingStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const validStatuses = ['Pending', 'Confirmed', 'Completed', 'Cancelled'];

  if (!validStatuses.includes(status)) {
    const error = new Error(`Status must be one of: ${validStatuses.join(', ')}`);
    error.statusCode = 400;
    throw error;
  }

  const booking = await Booking.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true, runValidators: true }
  );

  if (!booking) {
    const error = new Error('Booking not found.');
    error.statusCode = 404;
    throw error;
  }

  const io = req.app.get('io');
  if (io) {
    io.emit('booking:statusUpdated', {
      bookingId: booking._id,
      status: booking.status,
    });
  }

  res.json({ success: true, message: 'Status updated.', data: booking });
});
