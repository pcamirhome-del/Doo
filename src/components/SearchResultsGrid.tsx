import React from 'react';
import { X, CheckSquare } from 'lucide-react';
import { AppItem, Platform } from '../types/app';
import { AppCard } from './AppCard';

interface SearchResultsGridProps {
  query: string;
  platform: Platform;
  results: AppItem[];
  isLoading: boolean;
  onClearSearch: () => void;
  isWishlisted: (app: AppItem) => boolean;
  onToggleWishlist: (app: AppItem) => void;
  isSelectedForBulk: (app: AppItem) => boolean;
  onToggleBulkSelect: (app: AppItem) => void;
  onSelectAllForBulk: (apps: AppItem[]) => void;
}

export const SearchResultsGrid: React.FC<SearchResultsGridProps> = ({
  query,
  platform,
  results,
  isLoading,
  onClearSearch,
  isWishlisted,
  onToggleWishlist,
  isSelectedForBulk,
  onToggleBulkSelect,
  onSelectAllForBulk,
}) => {
  if (!query && !isLoading && results.length === 0) {
    return null;
  }

  const platformTitle =
    platform === 'pc'
      ? 'PC (Windows Winget & FOSS)'
      : platform === 'android'
      ? 'Android (Google Play & F-Droid)'
      : 'iOS (Official Apple App Store)';

  return (
    <section className="max-w-7xl mx-auto px-6 py-10 border-b border-slate-800/80">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold font-display text-slate-100">
            Search Results for "{query}"
          </h2>
          <p className="text-sm text-slate-400 mt-0.5 font-mono tabular-nums">
            {platformTitle} · {results.length} verified packages found
          </p>
        </div>

        <div className="flex items-center gap-3">
          {(platform === 'pc' || platform === 'android') && results.length > 0 && (
            <button
              type="button"
              onClick={() => onSelectAllForBulk(results)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-sky-300 transition-colors cursor-pointer whitespace-nowrap"
            >
              <CheckSquare className="w-4 h-4" />
              <span>Select All for Bulk Install</span>
            </button>
          )}

          <button
            type="button"
            onClick={onClearSearch}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-xs font-medium text-slate-300 border border-slate-800 transition-colors cursor-pointer whitespace-nowrap"
          >
            <X className="w-4 h-4" />
            <span>Clear Search</span>
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div
              key={idx}
              className="glass-card rounded-xl p-5 h-56 animate-pulse flex flex-col justify-between"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-14 h-14 rounded-xl bg-slate-800" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-slate-800 rounded w-2/3" />
                  <div className="h-3 bg-slate-800 rounded w-1/2" />
                </div>
              </div>
              <div className="h-10 bg-slate-800 rounded-lg w-full" />
            </div>
          ))}
        </div>
      ) : results.length === 0 ? (
        <div className="glass-panel rounded-2xl p-10 text-center">
          <p className="text-base font-medium text-slate-200">
            No store packages matched "{query}" on {platformTitle}.
          </p>
          <p className="text-sm text-slate-400 mt-1">
            Try searching a broader application name or switching the target platform above.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {results.map((item) => (
            <AppCard
              key={`${item.platform}-${item.id}`}
              app={item}
              isWishlisted={isWishlisted(item)}
              onToggleWishlist={onToggleWishlist}
              isSelectedForBulk={isSelectedForBulk(item)}
              onToggleBulkSelect={onToggleBulkSelect}
            />
          ))}
        </div>
      )}
    </section>
  );
};
