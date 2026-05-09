import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { Input, Textarea, Button } from '../ui/index.jsx';
import { createBooking } from '../../lib/api.js';
import { formatDate, formatTime } from '../../lib/utils.js';

const schema = z.object({
  name: z.string().min(2, 'Full name is required').max(100),
  email: z.string().email('Enter a valid email address'),
  phone: z
    .string()
    .regex(/^[+]?[\d\s\-().]{7,20}$/, 'Enter a valid phone number'),
  notes: z.string().max(500, 'Notes must be under 500 characters').optional(),
});

export default function BookingForm({ expert, selectedDate, selectedTime, onSuccess, onClear }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (data) => {
    try {
      await createBooking({
        expertId: expert._id,
        date: selectedDate,
        timeSlot: selectedTime,
        ...data,
      });
      toast.success('Session booked! Check your email for confirmation.');
      reset();
      onSuccess?.();
    } catch (err) {
      toast.error(err.message || 'Booking failed. Please try again.');
    }
  };

  if (!selectedDate || !selectedTime) {
    return (
      <div className="py-10 text-center">
        <div className="w-10 h-10 rounded-full bg-[#F2F2F2] flex items-center justify-center mx-auto mb-3">
          <svg className="w-5 h-5 text-[#9CA3AF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <p className="text-sm text-[#6B7280]">
          Select an available time slot to continue
        </p>
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="form"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        {/* Selected slot summary */}
        <div className="mb-5 p-3.5 bg-[#EEF5F8] border border-[#A7BED3] rounded-md">
          <p className="text-xs font-semibold text-[#2C7F91] uppercase tracking-wider mb-1">
            Selected Session
          </p>
          <p className="text-sm font-medium text-[#003049]">
            {formatDate(selectedDate)} · {formatTime(selectedTime)}
          </p>
          <button
            onClick={onClear}
            className="text-xs text-[#6B7280] hover:text-[#003049] mt-1 transition-colors"
          >
            Change slot →
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <Input
            label="Full Name"
            placeholder="Jane Smith"
            error={errors.name?.message}
            {...register('name')}
          />
          <Input
            label="Email Address"
            type="email"
            placeholder="jane@company.com"
            error={errors.email?.message}
            {...register('email')}
          />
          <Input
            label="Phone Number"
            type="tel"
            placeholder="+1 (555) 000-0000"
            error={errors.phone?.message}
            {...register('phone')}
          />
          <Textarea
            label="Notes (optional)"
            placeholder="Share any context or specific topics you'd like to cover…"
            rows={3}
            error={errors.notes?.message}
            {...register('notes')}
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={isSubmitting}
            className="w-full mt-2"
          >
            Confirm Booking
          </Button>
        </form>
      </motion.div>
    </AnimatePresence>
  );
}
