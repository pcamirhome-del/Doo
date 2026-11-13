/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Monitor, Smartphone, Apple, WifiOff, Terminal, ArrowRight } from 'lucide-react';
import { AppItem, Platform } from './types/app';
import { apiClient } from './services/apiClient';
import { useWishlist } from './hooks/useWishlist';
import { useOnlineStatus } from './hooks/useOnlineStatus';
import { Navbar } from './components/Navbar';
import { SearchHero } from './components/SearchHero';
import { SearchResultsGrid } from './components/SearchResultsGrid';
import { CategoryCarousel } from './components/CategoryCarousel';
import { WishlistView } from './components/WishlistView';
import { BulkInstallerDrawer } from './components/BulkInstallerDrawer';
import { Footer } from './components/Footer';

export default function App() {
  const [activeTab, setActiveTab] = useState<'discover' | 'wishlist' | 'installer'>('discover');
  const [searchPlatform, setSearchPlatform] = useState<Platform>('pc');
  const [carouselPlatform, setCarouselPlatform] = useState<Platform>('pc');

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<AppItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Homepage 15-item Category Carousels state
  const [socialApps, setSocialApps] = useState<AppItem[]>([]);
  const [editingApps, setEditingApps] = useState<AppItem[]>([]);
  const [loadingCarousels, setLoadingCarousels] = useState(true);

  // Bulk Auto-Installer Selection state
  const [bulkSelectedApps, setBulkSelectedApps] = useState<AppItem[]>([]);

  // Wishlist Hook (IndexedDB + Firebase Firestore)
  const {
    wishlistItems,
    user,
    syncing,
    isWishlisted,
    toggleWishlist,
    removeById,
  } = useWishlist();

  const isOnline = useOnlineStatus();

  // Fetch 15 items per category whenever carouselPlatform changes
  useEffect(() => {
    let active = true;
    const loadCarousels = async () => {
      setLoadingCarousels(true);
      const [socialData, editingData] = await Promise.all([
        apiClient.getCarousel('social', carouselPlatform),
        apiClient.getCarousel('editing', carouselPlatform),
      ]);
      if (active) {
        setSocialApps(socialData.slice(0, 15));
        setEditingApps(editingData.slice(0, 15));
        setLoadingCarousels(false);
      }
    };
    loadCarousels();
    return () => {
      active = false;
    };
  }, [carouselPlatform]);

  const handleExecuteSearch = useCallback(async (query: string, platform: Platform) => {
    setSearchQuery(query);
    setActiveTab('discover');
    setIsSearching(true);
    const results = await apiClient.searchApps(query, platform);
    setSearchResults(results);
    setIsSearching(false);
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
    setSearchResults([]);
  }, []);

  const isSelectedForBulk = useCallback(
    (app: AppItem) =>
      bulkSelectedApps.some((item) => item.id === app.id && item.platform === app.platform),
    [bulkSelectedApps]
  );

  const handleToggleBulkSelect = useCallback((app: AppItem) => {
    if (app.platform === 'ios') return;
    setBulkSelectedApps((prev) => {
      const exists = prev.some((item) => item.id === app.id && item.platform === app.platform);
      if (exists) {
        return prev.filter((item) => !(item.id === app.id && item.platform === app.platform));
      }
      return [...prev, app];
    });
  }, []);

  const handleSelectAllForBulk = useCallback((apps: AppItem[]) => {
    const eligible = apps.filter((a) => a.platform === 'pc' || a.platform === 'android');
    setBulkSelectedApps((prev) => {
      const map = new Map<string, AppItem>();
      prev.forEach((item) => map.set(`${item.platform}:${item.id}`, item));
      eligible.forEach((item) => map.set(`${item.platform}:${item.id}`, item));
      return Array.from(map.values());
    });
  }, []);

  const handleScrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0A0F1D] text-slate-100 selection:bg-sky-500 selection:text-slate-950">
      {/* Top Bar Contract Navigation */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        wishlistCount={wishlistItems.length}
        bulkCount={bulkSelectedApps.length}
        onScrollToSection={handleScrollToSection}
      />

      {/* Offline PWA Banner */}
      {!isOnline && (
        <div className="bg-amber-500/15 border-b border-amber-500/40 px-6 py-2.5 text-xs font-medium text-amber-300 flex items-center justify-center gap-2">
          <WifiOff className="w-4 h-4 shrink-0" />
          <span>
            Offline Mode Active — Serving cached store catalogs and local IndexedDB Wishlist.
          </span>
        </div>
      )}

      {/* Main Content Workspace */}
      <main className="flex-1">
        {activeTab === 'discover' && (
          <>
            {/* Phase 1: Unified Search Bar, Platform Selector & Live Thumbnail Autocomplete */}
            <SearchHero
              selectedPlatform={searchPlatform}
              onPlatformChange={(plat) => {
                setSearchPlatform(plat);
                if (searchQuery.trim()) {
                  handleExecuteSearch(searchQuery.trim(), plat);
                }
              }}
              onExecuteSearch={handleExecuteSearch}
              isSearching={isSearching}
              onToggleWishlist={toggleWishlist}
              isWishlisted={isWishlisted}
            />

            {/* Live Deep Search Results */}
            <SearchResultsGrid
              query={searchQuery}
              platform={searchPlatform}
              results={searchResults}
              isLoading={isSearching}
              onClearSearch={handleClearSearch}
              isWishlisted={isWishlisted}
              onToggleWishlist={toggleWishlist}
              isSelectedForBulk={isSelectedForBulk}
              onToggleBulkSelect={handleToggleBulkSelect}
              onSelectAllForBulk={handleSelectAllForBulk}
            />

            {/* Phase 2: Homepage Categorised Horizontal Carousels (15 items per category) */}
            <section id="carousels-section" className="max-w-7xl mx-auto px-6 py-12">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold font-display text-slate-100">
                    Featured Platform Catalogs
                  </h2>
                  <p className="text-sm text-slate-400 mt-1">
                    Switch platforms below to dynamically reload 15 verified applications per category.
                  </p>
                </div>

                {/* Dynamic Platform Toggle Buttons Above Carousels */}
                <div className="flex items-center gap-1.5 p-1.5 glass-panel rounded-xl border border-slate-800 self-start md:self-auto">
                  <button
                    type="button"
                    onClick={() => setCarouselPlatform('pc')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                      carouselPlatform === 'pc'
                        ? 'bg-sky-500 text-slate-950'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    <Monitor className="w-4 h-4" />
                    <span>PC (Windows)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCarouselPlatform('android')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                      carouselPlatform === 'android'
                        ? 'bg-sky-500 text-slate-950'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    <Smartphone className="w-4 h-4" />
                    <span>Android</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCarouselPlatform('ios')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                      carouselPlatform === 'ios'
                        ? 'bg-sky-500 text-slate-950'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    <Apple className="w-4 h-4" />
                    <span>iPhone (iOS)</span>
                  </button>
                </div>
              </div>

              {/* Carousel 1: Social Media Applications (15 items) */}
              <CategoryCarousel
                title="01. Social Media Applications"
                subtitle={`Top 15 ${carouselPlatform.toUpperCase()} communication & community apps`}
                items={socialApps}
                isLoading={loadingCarousels}
                isWishlisted={isWishlisted}
                onToggleWishlist={toggleWishlist}
                isSelectedForBulk={isSelectedForBulk}
                onToggleBulkSelect={handleToggleBulkSelect}
              />

              {/* Carousel 2: Photo & Video Editing Tools (15 items) */}
              <CategoryCarousel
                title="02. Photo & Video Editing Tools"
                subtitle={`Top 15 ${carouselPlatform.toUpperCase()} creative production & media suites`}
                items={editingApps}
                isLoading={loadingCarousels}
                isWishlisted={isWishlisted}
                onToggleWishlist={toggleWishlist}
                isSelectedForBulk={isSelectedForBulk}
                onToggleBulkSelect={handleToggleBulkSelect}
              />
            </section>
          </>
        )}

        {/* Phase 3: Dedicated Wishlist View */}
        {activeTab === 'wishlist' && (
          <WishlistView
            items={wishlistItems}
            user={user}
            syncing={syncing}
            onRemoveItem={removeById}
            onBackToDiscover={() => setActiveTab('discover')}
          />
        )}

        {/* Phase 4: Dedicated Auto-Installer Engine View */}
        {activeTab === 'installer' && (
          <BulkInstallerDrawer
            selectedApps={bulkSelectedApps}
            onRemoveApp={handleToggleBulkSelect}
            onClearAll={() => setBulkSelectedApps([])}
          />
        )}
      </main>

      {/* Floating Bulk Deployment Bar when items are selected in Discover view */}
      {activeTab !== 'installer' && bulkSelectedApps.length > 0 && (
        <div className="sticky bottom-4 z-30 px-6 pointer-events-none">
          <div className="max-w-3xl mx-auto glass-panel rounded-2xl p-4 border border-sky-400/50 shadow-2xl flex items-center justify-between gap-4 pointer-events-auto">
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2.5 rounded-xl bg-sky-500/20 text-sky-400 shrink-0">
                <Terminal className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold font-display text-slate-100 truncate">
                  {bulkSelectedApps.length} Package{bulkSelectedApps.length > 1 ? 's' : ''} Queued for Bulk Auto-Install
                </p>
                <p className="text-xs text-slate-400 truncate font-mono tabular-nums">
                  PC: {bulkSelectedApps.filter((a) => a.platform === 'pc').length} (.ps1/.bat) · Android:{' '}
                  {bulkSelectedApps.filter((a) => a.platform === 'android').length} (APK Queue)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setBulkSelectedApps([])}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 cursor-pointer"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('installer')}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold text-xs cursor-pointer whitespace-nowrap"
              >
                <span>Open Auto-Installer</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer with Glowing Developer Signature */}
      <Footer />
    </div>
  );
}
