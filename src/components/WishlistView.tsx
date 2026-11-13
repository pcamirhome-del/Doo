import React, { useState } from 'react';
import { Heart, Trash2, ExternalLink, Cloud, HardDrive, LogIn, LogOut } from 'lucide-react';
import { User } from 'firebase/auth';
import { Platform, WishlistItem } from '../types/app';
import { signInWithGoogle, signOutUser } from '../firebase';

interface WishlistViewProps {
  items: WishlistItem[];
  user: User | null;
  syncing: boolean;
  onRemoveItem: (id: string) => void;
  onBackToDiscover: () => void;
}

export const WishlistView: React.FC<WishlistViewProps> = ({
  items,
  user,
  syncing,
  onRemoveItem,
  onBackToDiscover,
}) => {
  const [filterPlatform, setFilterPlatform] = useState<'all' | Platform>('all');
  const [authError, setAuthError] = useState<string | null>(null);

  const filteredItems =
    filterPlatform === 'all'
      ? items
      : items.filter((item) => item.platform === filterPlatform);

  const handleGoogleSignIn = async () => {
    setAuthError(null);
    try {
      await signInWithGoogle();
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'Cloud sign-in cancelled or failed.');
    }
  };

  return (
    <section className="max-w-7xl mx-auto px-6 py-10">
      {/* Header & Cloud Sync Banner */}
      <div className="glass-panel rounded-2xl p-6 mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2.5">
            <Heart className="w-6 h-6 text-rose-400 fill-rose-400" />
            <h2 className="text-2xl font-bold font-display text-slate-100">
              Wishlist — قائمة الأمنيات
            </h2>
          </div>
          <p className="text-sm text-slate-300 mt-1.5 max-w-2xl">
            Saved applications and direct store links are persisted locally in IndexedDB for instant offline PWA access and synchronized with Firebase Cloud Firestore when signed in.
          </p>
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-3 font-mono tabular-nums">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <HardDrive className="w-3.5 h-3.5" />
              <span>IndexedDB Local Persistence Active ({items.length} saved)</span>
            </span>
            <span aria-hidden="true">·</span>
            <span className="flex items-center gap-1.5 text-sky-400">
              <Cloud className="w-3.5 h-3.5" />
              <span>
                {user
                  ? syncing
                    ? 'Syncing with Firestore...'
                    : `Synced to Cloud (${user.email})`
                  : 'Cloud Sync Standby (Sign in to sync across devices)'}
              </span>
            </span>
          </div>
          {authError && <p className="text-xs text-rose-400 mt-2">{authError}</p>}
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {user ? (
            <button
              type="button"
              onClick={() => signOutUser()}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors cursor-pointer whitespace-nowrap"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out ({user.displayName || 'User'})</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-xs font-semibold text-slate-950 transition-colors cursor-pointer whitespace-nowrap"
            >
              <LogIn className="w-4 h-4" />
              <span>Sync Wishlist with Google Cloud</span>
            </button>
          )}
        </div>
      </div>

      {/* Platform Filter Tabs */}
      <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
        <div className="flex items-center gap-1.5 p-1 bg-slate-900 rounded-xl border border-slate-800">
          {(['all', 'pc', 'android', 'ios'] as const).map((plat) => (
            <button
              key={plat}
              type="button"
              onClick={() => setFilterPlatform(plat)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                filterPlatform === plat
                  ? 'bg-sky-500 text-slate-950'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              {plat === 'all'
                ? `All Platforms (${items.length})`
                : plat === 'pc'
                ? 'PC (Windows)'
                : plat === 'android'
                ? 'Android'
                : 'iOS (iPhone)'}
            </button>
          ))}
        </div>
      </div>

      {/* Wishlist Grid or Empty State */}
      {filteredItems.length === 0 ? (
        <div className="glass-panel rounded-2xl p-12 text-center">
          <Heart className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-semibold font-display text-slate-200">
            Your Wishlist is Empty
          </h3>
          <p className="text-sm text-slate-400 mt-1 max-w-md mx-auto">
            Click the heart icon on any PC, Android, or iOS application card to bookmark it for offline access and cloud sync.
          </p>
          <button
            type="button"
            onClick={onBackToDiscover}
            className="mt-5 px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold text-sm transition-colors cursor-pointer"
          >
            Explore Applications
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="glass-card rounded-xl p-5 flex flex-col justify-between"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3.5 min-w-0">
                  <img
                    src={item.thumbnail}
                    alt={item.name}
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        item.name
                      )}&background=0D1117&color=38bdf8&size=128`;
                    }}
                    className="w-14 h-14 rounded-xl object-cover bg-slate-900 border border-slate-800 shrink-0"
                  />
                  <div className="min-w-0">
                    <h4 className="text-base font-semibold font-display text-slate-100 truncate">
                      {item.name}
                    </h4>
                    <p className="text-xs text-slate-400 truncate">{item.developer}</p>
                    <p className="text-xs text-sky-400 mt-1 font-mono uppercase">
                      {item.platform} · {item.category}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onRemoveItem(item.id)}
                  title="Remove from Wishlist"
                  className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center gap-2">
                <a
                  href={item.directDownloadUrl || item.officialUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold text-xs transition-colors whitespace-nowrap"
                >
                  <span>Visit Official Download</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                {item.secondarySourceUrl && (
                  <a
                    href={item.secondarySourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 flex items-center gap-1 whitespace-nowrap"
                  >
                    <span>{item.secondarySourceLabel || 'Mirror'}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};
