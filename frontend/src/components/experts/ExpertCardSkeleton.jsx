import { Skeleton } from '../ui/index.jsx';

export default function ExpertCardSkeleton() {
  return (
    <div className="h-full flex flex-col bg-white rounded-[10px] border border-[#E8E5E1] shadow-[0_1px_3px_rgba(0,0,0,0.06)] p-5">
      <div className="flex items-start gap-4">
        <Skeleton className="w-14 h-14 rounded-full shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-48" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-[#F0EDE9] flex items-center justify-between">
        <Skeleton className="h-5 w-24 rounded-full" />
        <Skeleton className="h-3 w-20" />
      </div>

      <div className="mt-auto pt-3 flex gap-1.5 min-h-[28px]">
        <Skeleton className="h-5 w-16 rounded-md" />
        <Skeleton className="h-5 w-20 rounded-md" />
        <Skeleton className="h-5 w-14 rounded-md" />
      </div>
    </div>
  );
}