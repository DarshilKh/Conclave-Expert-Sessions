import { formatDate, formatTime } from '../../lib/utils.js';

export default function SlotPicker({ slotsByDate, selectedDate, selectedTime, onSelect, bookedSlots = [] }) {
  const dates = Object.keys(slotsByDate).sort();

  if (dates.length === 0) {
    return (
      <div className="py-8 text-center text-sm text-[#9CA3AF]">
        No available slots at this time.
      </div>
    );
  }

  const isBooked = (date, time) =>
    bookedSlots.some((s) => s.date === date && s.time === time);

  return (
    <div className="space-y-5">
      {dates.map((date) => {
        const slots = slotsByDate[date];
        return (
          <div key={date}>
            <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider mb-2.5">
              {formatDate(date)}
            </p>
            <div className="flex flex-wrap gap-2">
              {slots.map((slot) => {
                const booked = slot.isBooked || isBooked(date, slot.time);
                const selected =
                  selectedDate === date && selectedTime === slot.time;

                return (
                  <button
                    key={slot.time}
                    disabled={booked}
                    onClick={() =>
                      !booked && onSelect({ date, time: slot.time })
                    }
                    className={`px-3.5 py-2 text-sm rounded-md border transition-all duration-150 ${
                      booked
                        ? 'bg-[#F8F7F5] text-[#C4C0BA] border-[#E8E5E1] cursor-not-allowed line-through'
                        : selected
                        ? 'bg-[#003049] text-white border-[#003049] shadow-sm'
                        : 'bg-white text-[#374151] border-[#D0CCC7] hover:border-[#2C7F91] hover:text-[#2C7F91]'
                    }`}
                  >
                    {formatTime(slot.time)}
                    {booked && (
                      <span className="ml-1 text-xs text-[#C4C0BA]">·</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
