import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { fetchBookingsByEmail } from '../lib/api.js';
import StatusBadge from '../components/bookings/StatusBadge.jsx';
import { Input, Button, Card, EmptyState } from '../components/ui/index.jsx';
import { formatDateShort, formatTime } from '../lib/utils.js';

const schema = z.object({
  email: z.string().email('Enter a valid email address'),
});

function BookingCard({ booking }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="p-5">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h3 className="text-sm font-semibold text-[#1a2332]">
              {booking.expertName}
            </h3>
            <p className="text-xs text-[#6B7280] mt-0.5">{booking.expertCategory}</p>
          </div>
          <StatusBadge status={booking.status} />
        </div>

        <div className="mt-4 pt-4 border-t border-[#F0EDE9] grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div>
            <p className="text-xs text-[#9CA3AF] font-medium uppercase tracking-wider mb-1">
              Date
            </p>
            <p className="text-sm text-[#374151]">
              {formatDateShort(booking.date)}
            </p>
          </div>
          <div>
            <p className="text-xs text-[#9CA3AF] font-medium uppercase tracking-wider mb-1">
              Time
            </p>
            <p className="text-sm text-[#374151]">
              {formatTime(booking.timeSlot)}
            </p>
          </div>
          <div>
            <p className="text-xs text-[#9CA3AF] font-medium uppercase tracking-wider mb-1">
              Name
            </p>
            <p className="text-sm text-[#374151]">{booking.name}</p>
          </div>
        </div>

        {booking.notes && (
          <p className="mt-3 text-xs text-[#6B7280] italic leading-relaxed">
            "{booking.notes}"
          </p>
        )}
      </Card>
    </motion.div>
  );
}

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async ({ email }) => {
    setLoading(true);
    setError(null);
    setSearched(false);
    try {
      const res = await fetchBookingsByEmail(email);
      setBookings(res.data);
      setSearched(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const grouped = bookings.reduce((acc, b) => {
    if (!acc[b.status]) acc[b.status] = [];
    acc[b.status].push(b);
    return acc;
  }, {});

  const statusOrder = ['Confirmed', 'Pending', 'Completed', 'Cancelled'];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10"
    >
      <div className="mb-8">
        <h1 className="font-display text-3xl text-[#003049] mb-1">
          My Bookings
        </h1>
        <p className="text-sm text-[#6B7280]">
          Enter your email address to view your session history.
        </p>
      </div>

      {/* Email lookup */}
      <Card className="p-5 mb-7">
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <Input
                label="Email Address"
                type="email"
                placeholder="jane@company.com"
                error={errors.email?.message}
                {...register('email')}
              />
            </div>
            <Button
              type="submit"
              variant="primary"
              loading={loading}
              className="shrink-0"
            >
              Look up
            </Button>
          </div>
        </form>
      </Card>

      {/* Error */}
      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 p-4 mb-5 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Results */}
      <AnimatePresence>
        {searched && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            {bookings.length === 0 ? (
              <EmptyState
                icon="📅"
                title="No bookings found"
                description="We couldn't find any sessions booked with this email address."
              />
            ) : (
              <div className="space-y-8">
                <p className="text-xs text-[#9CA3AF]">
                  {bookings.length} session{bookings.length !== 1 ? 's' : ''} found
                </p>

                {statusOrder.map((status) => {
                  const group = grouped[status];
                  if (!group?.length) return null;
                  return (
                    <div key={status}>
                      <h2 className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider mb-3">
                        {status} · {group.length}
                      </h2>
                      <div className="space-y-3">
                        {group.map((booking) => (
                          <BookingCard key={booking._id} booking={booking} />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
