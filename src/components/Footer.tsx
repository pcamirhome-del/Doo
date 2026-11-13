import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-16 border-t border-slate-800/80 glass-panel py-10 px-6">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="text-center sm:text-left">
          <p className="text-base font-bold font-display text-slate-100">
            NexusDeploy — Universal App & Game Discovery Engine
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Official Store Discovery (Winget · Google Play · F-Droid · Apple App Store) & Offline-Ready PWA
          </p>
        </div>

        {/* Glowing Developer Signature */}
        <div className="px-5 py-2.5 rounded-xl bg-slate-950/90 border border-sky-400/50 shadow-[0_0_25px_rgba(56,189,248,0.35)]">
          <p
            dir="rtl"
            className="text-base sm:text-lg font-bold font-display text-sky-300 tracking-wide drop-shadow-[0_0_10px_rgba(56,189,248,0.85)]"
          >
            مع تحيات المطور Amir Lamay
          </p>
        </div>
      </div>
    </footer>
  );
};
