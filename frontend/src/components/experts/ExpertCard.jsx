import { Link } from 'react-router-dom';
import { Card, Badge, StarRating } from '../ui/index.jsx';

export default function ExpertCard({ expert }) {
  return (
    <Card hover className="h-full flex flex-col">
      <Link
        to={`/experts/${expert._id}`}
        className="flex flex-col flex-1 p-5"
      >
        <div className="flex items-start gap-4">
          <div className="shrink-0">
            <div className="w-14 h-14 rounded-full bg-[#C6CADA] overflow-hidden ring-2 ring-[#E8E5E1]">
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
                  )}&background=A7BED3&color=003049&size=56`;
                }}
              />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-semibold text-[#1a2332] leading-tight line-clamp-1">
                  {expert.name}
                </h3>
                <p className="text-xs text-[#6B7280] mt-0.5 leading-snug line-clamp-2 min-h-[2.25rem]">
                  {expert.title}
                </p>
              </div>
              <span className="text-sm font-semibold text-[#003049] shrink-0 whitespace-nowrap">
                ${expert.hourlyRate}
                <span className="text-xs font-normal text-[#9CA3AF]">/hr</span>
              </span>
            </div>

            <div className="flex items-center gap-2 mt-2.5">
              <StarRating rating={expert.rating} />
              <span className="text-xs text-[#6B7280]">
                {expert.rating.toFixed(1)} · {expert.reviewCount} reviews
              </span>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-[#F0EDE9] flex items-center justify-between">
          <Badge variant="ocean">{expert.category}</Badge>
          <span className="text-xs text-[#9CA3AF]">
            {expert.experience}y experience
          </span>
        </div>

        <div className="mt-auto pt-3 flex flex-wrap gap-1.5 min-h-[28px]">
          {expert.tags?.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-xs px-2 py-0.5 bg-[#F8F7F5] text-[#6B7280] rounded-md border border-[#E8E5E1]"
            >
              {tag}
            </span>
          ))}
        </div>
      </Link>
    </Card>
  );
}