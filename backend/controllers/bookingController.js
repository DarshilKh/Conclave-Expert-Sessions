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

// ─────────────────────────────────────────────
// POST /bookings
// ─────────────────────────────────────────────
export const createBooking = asyncHandler(async (req, res) => {
  // ── 1. Validate request body ──────────────────────────────────────────────
  const parsed = bookingSchema.safeParse(req.body);
  if (!parsed.success) {
    const error = new Error(
      parsed.error.errors.map((e) => e.message).join(', ')
    );
    error.statusCode = 400;
    throw error;
  }

  const { expertId, name, email, phone, date, timeSlot, notes } = parsed.data;

  // ── 2. Confirm the expert exists ──────────────────────────────────────────
  // We still need expert.name and expert.category for Booking.create below.
  // This read is intentionally kept — it is NOT used for availability checking.
  const expert = await Expert.findById(expertId).lean();
  if (!expert) {
    const error = new Error('Expert not found.');
    error.statusCode = 404;
    throw error;
  }

  // ── 3. Atomically lock the slot ───────────────────────────────────────────
  // Single findOneAndUpdate that both checks availability AND marks the slot
  // booked in one atomic operation. This is the ONLY availability gate.
  //
  // The stale-read pattern (findById → slot.isBooked check → findOneAndUpdate)
  // has been intentionally removed. That two-step approach allowed a window
  // where two concurrent requests could both pass the isBooked===false check
  // before either write completed. The atomic update below eliminates that
  // window entirely — MongoDB's document-level locking guarantees only one
  // caller can transition isBooked: false → true.
  const updatedExpert = await Expert.findOneAndUpdate(
    {
      _id: expertId,
      'availableSlots.date': date,
      'availableSlots.time': timeSlot,
      'availableSlots.isBooked': false, // ← only matches when slot is free
    },
    { $set: { 'availableSlots.$.isBooked': true } },
    { new: true }
  );

  // null means either the expert doesn't exist, the slot doesn't exist,
  // or the slot is already booked — all correctly result in 409.
  if (!updatedExpert) {
    const error = new Error(
      'This slot is unavailable. It may have just been booked — please choose another.'
    );
    error.statusCode = 409;
    throw error;
  }

  // ── 4. Create the Booking document ────────────────────────────────────────
  // The compound unique index on { expert, date, timeSlot } is the final
  // safety net against duplicate bookings (e.g. index rebuilt after data fix).
  //
  // CRITICAL: if Booking.create fails for ANY reason after the slot has been
  // locked above, we must roll back the slot to isBooked: false. Without this
  // rollback the slot would be permanently orphaned — locked with no booking
  // record, unrecoverable without manual DB intervention.
  let booking;
  try {
    booking = await Booking.create({
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
  } catch (createErr) {
    // ── ROLLBACK: unlock the slot so other users can book it ──────────────
    // We attempt the rollback but do NOT let a rollback failure swallow the
    // original error — log it and re-throw the real error either way.
    try {
      await Expert.findOneAndUpdate(
        {
          _id: expertId,
          'availableSlots.date': date,
          'availableSlots.time': timeSlot,
        },
        { $set: { 'availableSlots.$.isBooked': false } }
      );
    } catch (rollbackErr) {
      // Rollback failed — slot remains orphaned. Log for manual recovery.
      // Do NOT throw here; we still need to surface the original createErr.
      console.error(
        '[bookingController] CRITICAL: slot rollback failed. ' +
          `Expert ${expertId}, date ${date}, time ${timeSlot} ` +
          'is now orphaned and must be manually unlocked.',
        rollbackErr
      );
    }

    // Surface a clean 409 for duplicate-key violations; re-throw everything
    // else as-is so the global error handler can assign the correct status.
    if (createErr.code === 11000) {
      const error = new Error(
        'This slot has already been booked. Please choose another.'
      );
      error.statusCode = 409;
      throw error;
    }

    throw createErr; // unexpected DB error → 500 via global error handler
  }

  // ── 5. Emit real-time event via Socket.IO ─────────────────────────────────
  const io = req.app.get('io');
  if (io) {
    io.to(`expert:${expertId}`).emit('slot:booked', {
      expertId,
      date,
      timeSlot,
      bookingId: booking._id,
    });
  }

  // ── 6. Respond ────────────────────────────────────────────────────────────
  res.status(201).json({
    success: true,
    message: 'Booking confirmed successfully.',
    data: booking,
  });
});

// ─────────────────────────────────────────────
// GET /bookings?email=
// ─────────────────────────────────────────────
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

// ─────────────────────────────────────────────
// PATCH /bookings/:id/status
// ─────────────────────────────────────────────
export const updateBookingStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const validStatuses = ['Pending', 'Confirmed', 'Completed', 'Cancelled'];

  if (!validStatuses.includes(status)) {
    const error = new Error(
      `Status must be one of: ${validStatuses.join(', ')}`
    );
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