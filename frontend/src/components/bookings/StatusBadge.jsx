import { statusColors } from '../../lib/utils.js';
import { cn } from '../../lib/utils.js';

export default function StatusBadge({ status }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border',
        statusColors[status] || statusColors.Pending
      )}
    >
      <span
        className={cn(
          'w-1.5 h-1.5 rounded-full',
          status === 'Pending' && 'bg-amber-500',
          status === 'Confirmed' && 'bg-emerald-500',
          status === 'Completed' && 'bg-blue-500',
          status === 'Cancelled' && 'bg-red-500'
        )}
      />
      {status}
    </span>
  );
}
