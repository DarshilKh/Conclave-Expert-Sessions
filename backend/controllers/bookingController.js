import Booking from '../models/Booking.js';
import Expert from '../models/Expert.js';
import asyncHandler from '../utils/asyncHandler.js';
import { z } from 'zod';

// ── Structured alert helper ───────────────────────────────────────────────────
// Centralises orphan-slot alerting so the transport (Sentry, Datadog,
// plain stderr JSON) can be swapped in one place without touching
// controller logic.
//
// In production set SENTRY_DSN (and optionally install @sentry/node).
// In development / CI the fallback writes a structured JSON line to stderr
// so log-aggregation pipelines (Papertrail, Logtail, etc.) can alert on it.
const alertOrphanedSlot = (() => {
  // Lazily resolve Sentry so the controller works even when @sentry/node
  // is not installed (e.g. local dev without the optional dependency).
  let Sentry = null;

  const tryLoadSentry = () => {
    if (Sentry !== null) return; // already attempted
    try {
      // Dynamic require — works whether the package is present or not.
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      Sentry = require('@sentry/node');
    } catch {
      // Package not installed — fall back to structured stderr logging.
      Sentry = undefined;
    }
  };

  /**
   * @param {object} params
   * @param {string} params.expertId
   * @param {string} params.date
   * @param {string} params.timeSlot
   * @param {Error}  params.rollbackErr   - the rollback failure
   * @param {Error}  params.originalErr   - the Booking.create failure
   */
  return ({ expertId, date, timeSlot, rollbackErr, originalErr }) => {
    tryLoadSentry();

    const payload = {
      level: 'critical',
      event: 'ORPHANED_SLOT',
      expertId,
      date,
      timeSlot,
      rollbackError: rollbackErr?.message,
      originalError: originalErr?.message,
      recoveryHint:
        `db.experts.updateOne(` +
        `{ _id: ObjectId("${expertId}"), "availableSlots.date": "${date}", ` +
        `"availableSlots.time": "${timeSlot}" }, ` +
        `{ $set: { "availableSlots.$.isBooked": false } })`,
      timestamp: new Date().toISOString(),
    };

    // ── Sentry (if available) ─────────────────────────────────────────────
    if (Sentry) {
      Sentry.withScope((scope) => {
        scope.setLevel('fatal');
        scope.setTag('event', 'ORPHANED_SLOT');
        scope.setContext('orphan_detail', payload);
        Sentry.captureException(rollbackErr);
      });
    }

    // ── Structured stderr (always) ────────────────────────────────────────
    // Write to stderr (not stdout) so log shippers treat it as an error.
    // The JSON structure makes it trivially parseable by Datadog, Logtail,
    // Papertrail, CloudWatch Logs Insights, etc.
    process.stderr.write(JSON.stringify(payload) + '\n');
  };
})();

// ── Request-body schema ───────────────────────────────────────────────────────
const bookingBodySchema = z.object({
  expertId: z.string().min(1, 'Expert is required'),
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be at most 100 characters'),
  email: z.string().email('Invalid email address'),
  phone: z
    .string()
    .regex(/^[+]?[\d\s\-().]{7,20}$/, 'Invalid phone number'),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (expected YYYY-MM-DD)'),
  timeSlot: z
    .string()
    .regex(/^\d{2}:\d{2}$/, 'Invalid time format (expected HH:MM)'),
  notes: z.string().max(500, 'Notes must be at most 500 characters').optional().default(''),
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /bookings
// ─────────────────────────────────────────────────────────────────────────────
export const createBooking = asyncHandler(async (req, res) => {
  // ── 1. Validate request body ──────────────────────────────────────────────
  const parsed = bookingBodySchema.safeParse(req.body);
  if (!parsed.success) {
    const error = new Error(
      parsed.error.errors.map((e) => e.message).join(', ')
    );
    error.statusCode = 400;
    throw error;
  }

  const { expertId, name, email, phone, date, timeSlot, notes } = parsed.data;

  // ── 2. Confirm the expert exists ──────────────────────────────────────────
  // Intentional separate read: we need expert.name and expert.category
  // for the Booking document. This is NOT the availability check.
  const expert = await Expert.findById(expertId).lean();
  if (!expert) {
    const error = new Error('Expert not found.');
    error.statusCode = 404;
    throw error;
  }

  // ── 3. Atomically lock the slot ───────────────────────────────────────────
  // A single findOneAndUpdate that both checks availability AND marks the
  // slot booked. MongoDB's document-level write lock means only one
  // concurrent caller can transition isBooked false → true.
  //
  // The old two-step pattern (findById → isBooked check → separate update)
  // has been removed — it had a race window between the read and the write.
  const updatedExpert = await Expert.findOneAndUpdate(
    {
      _id: expertId,
      'availableSlots.date': date,
      'availableSlots.time': timeSlot,
      'availableSlots.isBooked': false, // only matches when slot is free
    },
    { $set: { 'availableSlots.$.isBooked': true } },
    { new: true }
  );

  // null → expert not found, slot not found, or slot already booked.
  // All three are correctly surfaced as 409 Conflict.
  if (!updatedExpert) {
    const error = new Error(
      'This slot is unavailable. It may have just been booked — please choose another.'
    );
    error.statusCode = 409;
    throw error;
  }

  // ── 4. Create the Booking document ────────────────────────────────────────
  // The compound unique index { expert, date, timeSlot } is the final safety
  // net (e.g. if the slot was reset manually and two requests snuck through).
  //
  // CRITICAL: any failure here — after the slot has been locked above — must
  // roll back isBooked to false, otherwise the slot is permanently orphaned.
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
    // ── ROLLBACK: free the slot so other users can book it ────────────────
    let rollbackErr = null;
    try {
      await Expert.findOneAndUpdate(
        {
          _id: expertId,
          'availableSlots.date': date,
          'availableSlots.time': timeSlot,
        },
        { $set: { 'availableSlots.$.isBooked': false } }
      );
    } catch (rbErr) {
      // Rollback itself failed — slot is now orphaned.
      // Fire the structured alert so on-call / monitoring can recover it.
      rollbackErr = rbErr;
      alertOrphanedSlot({
        expertId,
        date,
        timeSlot,
        rollbackErr,
        originalErr: createErr,
      });
    }

    // Surface a clean 409 for duplicate-key violations.
    // Re-throw everything else so the global error handler assigns 500.
    if (createErr.code === 11000) {
      const error = new Error(
        'This slot has already been booked. Please choose another.'
      );
      error.statusCode = 409;
      throw error;
    }

    throw createErr;
  }

  // ── 5. Real-time notification via Socket.IO ───────────────────────────────
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

// ─────────────────────────────────────────────────────────────────────────────
// GET /bookings?email=
// ─────────────────────────────────────────────────────────────────────────────
export const getBookingsByEmail = asyncHandler(async (req, res) => {
  const { email } = req.query;

  if (!email) {
    const error = new Error('Email query parameter is required.');
    error.statusCode = 400;
    throw error;
  }

  const emailSchema = z.string().email('Invalid email address.');
  const result = emailSchema.safeParse(email);
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

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /bookings/:id/status
// ─────────────────────────────────────────────────────────────────────────────
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