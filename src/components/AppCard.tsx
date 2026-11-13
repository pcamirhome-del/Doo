import React, { useState } from 'react';
import { Heart, ExternalLink, CheckSquare, Square, ChevronDown, ChevronUp, Terminal } from 'lucide-react';
import { AppItem } from '../types/app';

interface AppCardProps {
  app: AppItem;
  isWishlisted: boolean;
  onToggleWishlist: (app: AppItem) => void;
  isSelectedForBulk: boolean;
  onToggleBulkSelect: (app: AppItem) => void;
  compact?: boolean;
}

export const AppCard: React.FC<AppCardProps> = ({
  app,
  isWishlisted,
  onToggleWishlist,
  isSelectedForBulk,
  onToggleBulkSelect,
  compact = false,
}) => {
  const [imgError, setImgError] = useState(false);
  const [showFoss, setShowFoss] = useState(false);

  const supportsBulkInstall = app.platform === 'pc' || app.platform === 'android';
  const platformLabel =
    app.platform === 'pc'
      ? 'Windows PC'
      : app.platform === 'android'
      ? 'Android APK / Play'
      : 'iOS App Store';

  const initials = app.name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

  return (
    <div
      className={`glass-card rounded-xl p-5 flex flex-col justify-between h-full ${
        isSelectedForBulk ? 'ring-1 ring-sky-400 border-sky-400/60' : ''
      }`}
    >
      <div>
        {/* Header Row: Thumbnail + Title + Actions */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-14 h-14 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center overflow-hidden shrink-0">
              {!imgError && app.thumbnail ? (
                <img
                  src={app.thumbnail}
                  alt={`${app.name} icon`}
                  referrerPolicy="no-referrer"
                  onError={() => setImgError(true)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-sky-900/60 to-indigo-950 flex items-center justify-center text-sky-300 font-display font-bold text-base">
                  {initials || 'APP'}
                </div>
              )}
            </div>

            <div className="min-w-0">
              <h3
                className="text-base font-semibold font-display text-slate-100 truncate"
                title={app.name}
              >
                {app.name}
              </h3>
              <p className="text-xs text-slate-400 truncate mt-0.5">{app.developer}</p>
              {/* Unboxed clean metadata with typographic separators */}
              <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1 font-mono tabular-nums">
                <span className="text-sky-400">{platformLabel}</span>
                <span aria-hidden="true">·</span>
                <span>{app.rating ? `${app.rating} ★` : 'Verified'}</span>
                {app.isFOSS && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="text-emerald-400">Open Source</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Wishlist Heart Button */}
          <button
            type="button"
            onClick={() => onToggleWishlist(app)}
            aria-label={isWishlisted ? `Remove ${app.name} from Wishlist` : `Save ${app.name} to Wishlist`}
            title={isWishlisted ? 'Remove from Wishlist (قائمة الأمنيات)' : 'Save to Wishlist (قائمة الأمنيات)'}
            className={`p-2 rounded-lg transition-colors shrink-0 cursor-pointer ${
              isWishlisted
                ? 'text-rose-400 bg-rose-500/15 hover:bg-rose-500/25'
                : 'text-slate-400 hover:text-rose-300 hover:bg-slate-800/70'
            }`}
          >
            <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-rose-400' : ''}`} />
          </button>
        </div>

        {/* Description (shown when not compact) */}
        {!compact && app.description && (
          <p className="mt-3 text-sm text-slate-300 line-clamp-2 leading-relaxed">
            {app.description}
          </p>
        )}

        {/* Winget command preview for PC */}
        {!compact && app.platform === 'pc' && app.wingetId && (
          <div className="mt-3 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-950/80 border border-slate-800/90 text-xs font-mono text-slate-300 overflow-x-auto">
            <Terminal className="w-3.5 h-3.5 text-sky-400 shrink-0" />
            <span className="truncate">winget install --id {app.wingetId}</span>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-2.5">
        {/* Bulk Install Selector for PC and Android */}
        {supportsBulkInstall && (
          <button
            type="button"
            onClick={() => onToggleBulkSelect(app)}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              isSelectedForBulk
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                : 'bg-slate-900/70 text-slate-300 hover:bg-slate-800/80 border border-slate-800'
            }`}
          >
            <span className="flex items-center gap-2 whitespace-nowrap">
              {isSelectedForBulk ? (
                <CheckSquare className="w-4 h-4 text-sky-400 shrink-0" />
              ) : (
                <Square className="w-4 h-4 text-slate-400 shrink-0" />
              )}
              <span>Select for Bulk Install (تسطيب أوتوماتيكي)</span>
            </span>
            <span className="font-mono text-[11px] text-slate-400">
              {app.platform === 'pc' ? '.ps1 / .bat' : 'APK Queue'}
            </span>
          </button>
        )}

        {/* Primary & Secondary Store/Download Links */}
        <div className="flex items-center gap-2">
          <a
            href={app.directDownloadUrl || app.downloadUrl || app.officialUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold text-xs transition-colors whitespace-nowrap"
          >
            <span>
              {app.platform === 'ios'
                ? 'Apple App Store'
                : app.platform === 'android'
                ? 'Google Play Store'
                : 'Official Download'}
            </span>
            <ExternalLink className="w-3.5 h-3.5 shrink-0" />
          </a>

          {app.secondarySourceUrl && app.platform !== 'ios' && (
            <a
              href={app.secondarySourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs transition-colors whitespace-nowrap"
              title={app.secondarySourceLabel || 'Alternative Repository'}
            >
              <span className="truncate max-w-[115px]">
                {app.secondarySourceLabel || 'FOSS Repo'}
              </span>
              <ExternalLink className="w-3 h-3 shrink-0" />
            </a>
          )}
        </div>

        {/* PC Open-Source (FOSS) Alternatives Accordion */}
        {!compact &&
          app.platform === 'pc' &&
          app.fossAlternatives &&
          app.fossAlternatives.length > 0 && (
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setShowFoss(!showFoss)}
                className="w-full flex items-center justify-between text-xs text-emerald-400 hover:text-emerald-300 transition-colors py-1 cursor-pointer"
              >
                <span>Open-Source (FOSS) Alternatives ({app.fossAlternatives.length})</span>
                {showFoss ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              {showFoss && (
                <div className="mt-2 space-y-2 pt-2 border-t border-slate-800/60">
                  {app.fossAlternatives.map((alt) => (
                    <div
                      key={alt.name}
                      className="flex items-center justify-between gap-2 text-xs bg-slate-900/80 px-2.5 py-2 rounded-lg"
                    >
                      <div className="min-w-0">
                        <p className="font-medium text-slate-200 truncate">{alt.name}</p>
                        <p className="text-[11px] text-slate-400 truncate">
                          {alt.license} · {alt.wingetId || 'Freeware'}
                        </p>
                      </div>
                      <a
                        href={alt.officialUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sky-400 hover:underline shrink-0 flex items-center gap-1"
                      >
                        <span>Visit</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
      </div>
    </div>
  );
};
