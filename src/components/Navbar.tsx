import React from 'react';
import { PWAInstallButton } from './PWAInstallButton';

interface NavbarProps {
  activeTab: 'discover' | 'wishlist' | 'installer';
  onSelectTab: (tab: 'discover' | 'wishlist' | 'installer') => void;
  wishlistCount: number;
  bulkCount: number;
  onScrollToSection: (sectionId: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  wishlistCount,
  bulkCount,
  onScrollToSection,
}) => {
  return (
    <header className="sticky top-0 z-40 flex items-center justify-between gap-8 px-6 py-4 glass-panel border-b border-slate-800/80">
      {/* Zone 1: Single text element wordmark */}
      <button
        type="button"
        onClick={() => onSelectTab('discover')}
        className="text-xl font-bold tracking-tight font-display text-slate-100 hover:text-sky-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
      >
        NexusDeploy
      </button>

      {/* Zone 2: 4 concise single-line text navigation links */}
      <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-300">
        <button
          type="button"
          onClick={() => onSelectTab('discover')}
          className={`transition-colors whitespace-nowrap shrink-0 cursor-pointer pb-0.5 ${
            activeTab === 'discover'
              ? 'text-sky-400 border-b border-sky-400'
              : 'hover:text-white'
          }`}
        >
          Discover
        </button>
        <button
          type="button"
          onClick={() => {
            onSelectTab('discover');
            setTimeout(() => onScrollToSection('carousels-section'), 50);
          }}
          className="hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          Categories
        </button>
        <button
          type="button"
          onClick={() => onSelectTab('wishlist')}
          className={`transition-colors whitespace-nowrap shrink-0 cursor-pointer pb-0.5 ${
            activeTab === 'wishlist'
              ? 'text-sky-400 border-b border-sky-400'
              : 'hover:text-white'
          }`}
        >
          Wishlist ({wishlistCount})
        </button>
        <button
          type="button"
          onClick={() => onSelectTab('installer')}
          className={`transition-colors whitespace-nowrap shrink-0 cursor-pointer pb-0.5 ${
            activeTab === 'installer'
              ? 'text-sky-400 border-b border-sky-400'
              : 'hover:text-white'
          }`}
        >
          Auto-Installer ({bulkCount})
        </button>
      </nav>

      {/* Zone 3: 1 primary action */}
      <div className="flex items-center gap-3 shrink-0">
        <PWAInstallButton />
      </div>
    </header>
  );
};
