import React, { useState } from 'react';
import { Download, Smartphone, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showModal, setShowModal] = useState(false);

  if (isInstalled) {
    return null;
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      await install();
    } else {
      setShowModal(true);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleInstallClick}
        className="flex items-center gap-2 rounded-lg bg-sky-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-sky-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
      >
        <Download className="w-4 h-4 shrink-0" />
        <span>{isIOS ? 'Install on iOS' : 'Install PWA'}</span>
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl glass-panel p-6 border border-sky-500/30 text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <Smartphone className="w-5 h-5 text-sky-400" />
                <h3 className="text-lg font-semibold font-display">Install NexusDeploy PWA</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
                aria-label="Close installation guide"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {isIOS ? (
              <div className="mt-4 space-y-3 text-sm text-slate-300">
                <p>To install this offline-capable application on your iPhone or iPad:</p>
                <ol className="list-decimal list-inside space-y-2 text-slate-200">
                  <li>
                    Tap the <strong>Share</strong> button in the Safari bottom bar.
                  </li>
                  <li>
                    Scroll down and select <strong>Add to Home Screen</strong>.
                  </li>
                  <li>
                    Tap <strong>Add</strong> in the top-right corner to launch in standalone mode.
                  </li>
                </ol>
              </div>
            ) : (
              <div className="mt-4 space-y-3 text-sm text-slate-300">
                <p>
                  To install NexusDeploy as a standalone desktop or Android application:
                </p>
                <ol className="list-decimal list-inside space-y-2 text-slate-200">
                  <li>
                    Click the <strong>Install icon</strong> on the right side of your browser address bar (or open the browser menu).
                  </li>
                  <li>
                    Select <strong>Install NexusDeploy</strong> (or <strong>Open in standalone window</strong> if previewing inside a frame).
                  </li>
                </ol>
              </div>
            )}

            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="mt-6 w-full rounded-lg bg-slate-800 hover:bg-slate-700 py-2.5 text-sm font-medium text-slate-100 transition-colors cursor-pointer"
            >
              Got It
            </button>
          </div>
        </div>
      )}
    </>
  );
};
