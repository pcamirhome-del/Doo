import React, { useState, useEffect, useRef } from 'react';
import { Search, Monitor, Smartphone, Apple, Loader2, ExternalLink, Heart } from 'lucide-react';
import { AppItem, Platform } from '../types/app';
import { apiClient } from '../services/apiClient';
import { useDebounce } from '../hooks/useDebounce';

interface SearchHeroProps {
  selectedPlatform: Platform;
  onPlatformChange: (platform: Platform) => void;
  onExecuteSearch: (query: string, platform: Platform) => void;
  isSearching: boolean;
  onToggleWishlist: (app: AppItem) => void;
  isWishlisted: (app: AppItem) => boolean;
}

export const SearchHero: React.FC<SearchHeroProps> = ({
  selectedPlatform,
  onPlatformChange,
  onExecuteSearch,
  isSearching,
  onToggleWishlist,
  isWishlisted,
}) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<AppItem[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const debouncedQuery = useDebounce(query, 280);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;
    const fetchSuggestions = async () => {
      if (!debouncedQuery.trim() || debouncedQuery.trim().length < 2) {
        setSuggestions([]);
        return;
      }
      setLoadingSuggestions(true);
      const data = await apiClient.getAutocomplete(debouncedQuery, selectedPlatform);
      if (active) {
        setSuggestions(data.slice(0, 6));
        setLoadingSuggestions(false);
      }
    };

    fetchSuggestions();
    return () => {
      active = false;
    };
  }, [debouncedQuery, selectedPlatform]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setShowDropdown(false);
    onExecuteSearch(query.trim(), selectedPlatform);
  };

  return (
    <section className="relative py-12 md:py-16 px-6 border-b border-slate-800/80">
      <div className="max-w-4xl mx-auto text-center">
        <p className="text-sm font-medium text-sky-400 tracking-wide">
          Universal Multi-Platform App & Game Discovery Engine
        </p>
        <h1 className="mt-2 text-3xl sm:text-5xl font-bold font-display text-slate-50 tracking-tight [text-wrap:balance]">
          Authentic Store Discovery, FOSS Alternatives & Silent Bulk Deployment
        </h1>
        <p className="mt-4 text-base text-slate-300 max-w-2xl mx-auto">
          Search official Windows Winget repositories, Google Play & F-Droid open-source mirrors, and the Apple App Store in real time.
        </p>

        {/* Search & Platform Selector Container */}
        <div ref={containerRef} className="relative mt-8 text-left">
          <form
            onSubmit={handleSubmit}
            className="glass-panel rounded-2xl p-2 sm:p-2.5 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 border border-sky-500/30 shadow-2xl"
          >
            {/* Platform Selector Dropdown / Segmented Selector */}
            <div className="flex items-center bg-slate-900/90 rounded-xl p-1 border border-slate-800 shrink-0">
              <button
                type="button"
                onClick={() => onPlatformChange('pc')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                  selectedPlatform === 'pc'
                    ? 'bg-sky-500 text-slate-950'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                <span>PC (Windows)</span>
              </button>
              <button
                type="button"
                onClick={() => onPlatformChange('android')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                  selectedPlatform === 'android'
                    ? 'bg-sky-500 text-slate-950'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Android</span>
              </button>
              <button
                type="button"
                onClick={() => onPlatformChange('ios')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                  selectedPlatform === 'ios'
                    ? 'bg-sky-500 text-slate-950'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Apple className="w-3.5 h-3.5" />
                <span>iOS (iPhone)</span>
              </button>
            </div>

            {/* Unified Search Input (min 16px to prevent iOS Safari zoom) */}
            <div className="relative flex-1 flex items-center">
              <Search className="w-5 h-5 text-slate-400 ml-3 shrink-0" />
              <input
                type="text"
                value={query}
                onFocus={() => setShowDropdown(true)}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setShowDropdown(true);
                }}
                placeholder={
                  selectedPlatform === 'pc'
                    ? 'Search PC software or games (e.g. Photoshop, Discord, Blender, VLC)...'
                    : selectedPlatform === 'android'
                    ? 'Search Android apps on Google Play & F-Droid (e.g. Telegram, Lightroom)...'
                    : 'Search official iPhone apps on Apple App Store (e.g. Procreate, CapCut)...'
                }
                className="w-full bg-transparent px-3 py-2.5 text-base text-slate-100 placeholder-slate-400 focus:outline-none"
              />
              {loadingSuggestions && (
                <Loader2 className="w-4 h-4 text-sky-400 animate-spin mr-2 shrink-0" />
              )}
            </div>

            {/* Search Submit Button */}
            <button
              type="submit"
              disabled={isSearching}
              className="px-6 py-3 rounded-xl bg-sky-500 hover:bg-sky-400 disabled:opacity-60 text-slate-950 font-semibold text-sm transition-colors whitespace-nowrap shrink-0 cursor-pointer flex items-center justify-center gap-2"
            >
              {isSearching ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Searching...</span>
                </>
              ) : (
                <span>Search Store</span>
              )}
            </button>
          </form>

          {/* Live Autocomplete Dropdown with Thumbnails */}
          {showDropdown && query.trim().length >= 2 && (suggestions.length > 0 || loadingSuggestions) && (
            <div className="absolute left-0 right-0 mt-2 glass-panel rounded-2xl border border-sky-500/30 shadow-2xl overflow-hidden z-30">
              <div className="px-4 py-2 border-b border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <span>
                  Live {selectedPlatform.toUpperCase()} Store Suggestions for "{query.trim()}"
                </span>
                <span>Press Enter for full analysis</span>
              </div>

              {suggestions.length === 0 && loadingSuggestions ? (
                <div className="p-6 text-center text-sm text-slate-400 flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-sky-400" />
                  <span>Fetching live thumbnails and store metadata...</span>
                </div>
              ) : (
                <ul className="divide-y divide-slate-800/70 max-h-80 overflow-y-auto">
                  {suggestions.map((item) => {
                    const saved = isWishlisted(item);
                    return (
                      <li
                        key={`${item.platform}-${item.id}`}
                        className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-slate-800/60 transition-colors"
                      >
                        <button
                          type="button"
                          onClick={() => {
                            setQuery(item.name);
                            setShowDropdown(false);
                            onExecuteSearch(item.name, selectedPlatform);
                          }}
                          className="flex items-center gap-3.5 min-w-0 flex-1 text-left cursor-pointer"
                        >
                          <img
                            src={item.thumbnail}
                            alt={item.name}
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                item.name
                              )}&background=0D1117&color=38bdf8&size=128`;
                            }}
                            className="w-10 h-10 rounded-lg object-cover bg-slate-900 border border-slate-700 shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-slate-100 truncate">
                              {item.name}
                            </p>
                            <p className="text-xs text-slate-400 truncate">
                              {item.developer} · {item.platform.toUpperCase()}
                            </p>
                          </div>
                        </button>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => onToggleWishlist(item)}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              saved ? 'text-rose-400 bg-rose-500/15' : 'text-slate-400 hover:text-rose-300'
                            }`}
                            title="Save to Wishlist"
                          >
                            <Heart className={`w-4 h-4 ${saved ? 'fill-rose-400' : ''}`} />
                          </button>
                          <a
                            href={item.directDownloadUrl || item.downloadUrl || item.officialUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-sky-300 flex items-center gap-1"
                          >
                            <span>Get</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          )}

          {/* Quick Search Chips */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-400">
            <span>Quick lookup:</span>
            {['Discord', 'Telegram', 'Blender', 'GIMP', 'VLC', 'CapCut', 'Signal', 'OBS Studio'].map(
              (term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => {
                    setQuery(term);
                    onExecuteSearch(term, selectedPlatform);
                  }}
                  className="px-2.5 py-1 rounded-md bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-sky-300 border border-slate-800 transition-colors cursor-pointer"
                >
                  {term}
                </button>
              )
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
