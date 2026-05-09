import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { fetchExpert } from '../lib/api.js';
import { getSocket, joinExpertRoom, leaveExpertRoom } from '../lib/socket.js';
import SlotPicker from '../components/experts/SlotPicker.jsx';
import BookingForm from '../components/bookings/BookingForm.jsx';
import { Card, StarRating, Badge, Skeleton } from '../components/ui/index.jsx';

function DetailSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Skeleton className="h-4 w-24 mb-8" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-[10px] border border-[#E8E5E1] p-6 space-y-4">
            <div className="flex gap-4">
              <Skeleton className="w-20 h-20 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-56" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-4/5" />
          </div>
        </div>
        <div>
          <Skeleton className="h-64 w-full rounded-[10px]" />
        </div>
      </div>
    </div>
  );
}

export default function ExpertDetailPage() {
  const { id } = useParams();

  const [expert, setExpert] = useState(null);
  const [slotsByDate, setSlotsByDate] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState({ date: null, time: null });

  const loadExpert = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchExpert(id);
      setExpert(res.data);
      setSlotsByDate(res.data.slotsByDate || {});
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadExpert();
  }, [loadExpert]);

  useEffect(() => {
    const interval = setInterval(loadExpert, 60_000);
    return () => clearInterval(interval);
  }, [loadExpert]);

  useEffect(() => {
    if (!id) return;

    joinExpertRoom(id);
    const socket = getSocket();

    const handleSlotBooked = ({ expertId, date, timeSlot }) => {
      if (expertId !== id) return;

      setSlotsByDate((prev) => {
        if (!prev[date]) return prev;
        return {
          ...prev,
          [date]: prev[date].map((slot) =>
            slot.time === timeSlot ? { ...slot, isBooked: true } : slot
          ),
        };
      });

      setSelectedSlot((prev) =>
        prev.date === date && prev.time === timeSlot
          ? { date: null, time: null }
          : prev
      );
    };

    socket.on('slot:booked', handleSlotBooked);

    return () => {
      socket.off('slot:booked', handleSlotBooked);
      leaveExpertRoom(id);
    };
  }, [id]);

  const handleBookingSuccess = () => {
    setSelectedSlot({ date: null, time: null });
    loadExpert();
  };

  if (loading) return <DetailSkeleton />;

  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="bg-red-50 border border-red-200 rounded-md p-4 text-sm text-red-600">
          {error} —{' '}
          <button onClick={loadExpert} className="underline font-medium">
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!expert) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10"
    >
      <nav className="mb-7 flex items-center gap-2 text-sm text-[#9CA3AF]">
        <Link to="/" className="hover:text-[#003049] transition-colors">
          Experts
        </Link>
        <span>/</span>
        <span className="text-[#374151]">{expert.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <div className="p-6">
              <div className="flex items-start gap-5">
                <div className="w-20 h-20 rounded-full bg-[#C6CADA] overflow-hidden ring-2 ring-[#E8E5E1] shrink-0">
                  <img
                    src={
                      expert.avatar ||
                      `https://api.dicebear.com/7.x/personas/svg?seed=${expert._id}`
                    }
                    alt={expert.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        expert.name
                      )}&background=A7BED3&color=003049&size=80`;
                    }}
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                      <h1 className="font-display text-2xl text-[#003049] leading-tight">
                        {expert.name}
                      </h1>
                      <p className="text-sm text-[#6B7280] mt-0.5">
                        {expert.title}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-semibold text-[#003049]">
                        ${expert.hourlyRate}
                        <span className="text-sm font-normal text-[#9CA3AF]">
                          /hr
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 mt-3 flex-wrap">
                    <div className="flex items-center gap-1.5">
                      <StarRating rating={expert.rating} size="md" />
                      <span className="text-sm font-medium text-[#374151]">
                        {expert.rating.toFixed(1)}
                      </span>
                      <span className="text-sm text-[#9CA3AF]">
                        ({expert.reviewCount} reviews)
                      </span>
                    </div>
                    <Badge variant="ocean">{expert.category}</Badge>
                    <span className="text-sm text-[#9CA3AF]">
                      {expert.experience}y experience
                    </span>
                  </div>
                </div>
              </div>

              <p className="mt-5 text-sm text-[#4B5563] leading-relaxed">
                {expert.bio}
              </p>

              {expert.tags?.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {expert.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs px-2.5 py-1 bg-[#F8F7F5] text-[#6B7280] rounded-md border border-[#E8E5E1]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-base font-semibold text-[#1a2332]">
                  Available Sessions
                </h2>
                <span className="flex items-center gap-1.5 text-xs text-[#5E8374]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#5E8374] animate-pulse" />
                  Live availability
                </span>
              </div>
              <SlotPicker
                slotsByDate={slotsByDate}
                selectedDate={selectedSlot.date}
                selectedTime={selectedSlot.time}
                onSelect={({ date, time }) => setSelectedSlot({ date, time })}
              />
            </div>
          </Card>
        </div>

        <div>
          <div className="sticky top-24">
            <Card>
              <div className="p-6">
                <h2 className="text-base font-semibold text-[#1a2332] mb-5">
                  Book a Session
                </h2>
                <BookingForm
                  expert={expert}
                  selectedDate={selectedSlot.date}
                  selectedTime={selectedSlot.time}
                  onSuccess={handleBookingSuccess}
                  onClear={() => setSelectedSlot({ date: null, time: null })}
                />
              </div>
            </Card>
          </div>
        </div>
      </div>
    </motion.div>
  );
}