import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { AppItem } from '../types/app';
import { AppCard } from './AppCard';

interface CategoryCarouselProps {
  title: string;
  subtitle: string;
  items: AppItem[];
  isLoading: boolean;
  isWishlisted: (app: AppItem) => boolean;
  onToggleWishlist: (app: AppItem) => void;
  isSelectedForBulk: (app: AppItem) => boolean;
  onToggleBulkSelect: (app: AppItem) => void;
}

export const CategoryCarousel: React.FC<CategoryCarouselProps> = ({
  title,
  subtitle,
  items,
  isLoading,
  isWishlisted,
  onToggleWishlist,
  isSelectedForBulk,
  onToggleBulkSelect,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleScroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;
    const scrollAmount = 680;
    scrollContainerRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  return (
    <div className="py-6">
      {/* Header + Left/Right Smooth Navigation Controls */}
      <div className="flex items-end justify-between gap-4 mb-5">
        <div>
          <h3 className="text-xl sm:text-2xl font-bold font-display text-slate-100">{title}</h3>
          <p className="text-sm text-slate-400 mt-0.5 font-mono tabular-nums">
            {subtitle} · {items.length || 15} curated items
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => handleScroll('left')}
            aria-label={`Scroll ${title} left`}
            className="p-2.5 rounded-xl glass-panel hover:bg-slate-800 text-slate-200 border border-slate-700/80 transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={() => handleScroll('right')}
            aria-label={`Scroll ${title} right`}
            className="p-2.5 rounded-xl glass-panel hover:bg-slate-800 text-slate-200 border border-slate-700/80 transition-colors cursor-pointer"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Horizontal 15-Item Carousel Track */}
      <div
        ref={scrollContainerRef}
        className="flex items-stretch gap-5 overflow-x-auto no-scrollbar scroll-smooth pb-3"
      >
        {isLoading
          ? Array.from({ length: 6 }).map((_, idx) => (
              <div
                key={idx}
                className="w-[310px] sm:w-[330px] shrink-0 glass-card rounded-xl p-5 h-56 animate-pulse flex flex-col justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-xl bg-slate-800" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-slate-800 rounded w-3/4" />
                    <div className="h-3 bg-slate-800 rounded w-1/2" />
                  </div>
                </div>
                <div className="h-9 bg-slate-800 rounded-lg w-full" />
              </div>
            ))
          : items.map((app) => (
              <div key={`${app.platform}-${app.id}`} className="w-[310px] sm:w-[330px] shrink-0">
                <AppCard
                  app={app}
                  isWishlisted={isWishlisted(app)}
                  onToggleWishlist={onToggleWishlist}
                  isSelectedForBulk={isSelectedForBulk(app)}
                  onToggleBulkSelect={onToggleBulkSelect}
                  compact
                />
              </div>
            ))}
      </div>
    </div>
  );
};
