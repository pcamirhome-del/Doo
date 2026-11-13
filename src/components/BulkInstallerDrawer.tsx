import React, { useState } from 'react';
import {
  Terminal,
  Download,
  Trash2,
  Play,
  CheckCircle2,
  Smartphone,
  Monitor,
  ExternalLink,
} from 'lucide-react';
import { AppItem } from '../types/app';
import {
  generateWindowsInstallScript,
  triggerScriptFileDownload,
  WindowsPackageManager,
  WindowsScriptFormat,
} from '../services/installerGenerator';

interface BulkInstallerDrawerProps {
  selectedApps: AppItem[];
  onRemoveApp: (app: AppItem) => void;
  onClearAll: () => void;
}

export const BulkInstallerDrawer: React.FC<BulkInstallerDrawerProps> = ({
  selectedApps,
  onRemoveApp,
  onClearAll,
}) => {
  const [scriptFormat, setScriptFormat] = useState<WindowsScriptFormat>('ps1');
  const [pkgManager, setPkgManager] = useState<WindowsPackageManager>('winget');
  const [androidQueueIndex, setAndroidQueueIndex] = useState<number | null>(null);
  const [completedAndroidIds, setCompletedAndroidIds] = useState<string[]>([]);

  const pcApps = selectedApps.filter((a) => a.platform === 'pc');
  const androidApps = selectedApps.filter((a) => a.platform === 'android');

  const previewScript =
    pcApps.length > 0
      ? generateWindowsInstallScript(pcApps, scriptFormat, pkgManager)
      : null;

  const handleDownloadWindowsScript = () => {
    if (!previewScript) return;
    triggerScriptFileDownload(
      previewScript.filename,
      previewScript.content,
      previewScript.mimeType
    );
  };

  const handleStartAndroidSequentialQueue = () => {
    if (androidApps.length === 0) return;
    setCompletedAndroidIds([]);
    setAndroidQueueIndex(0);

    androidApps.forEach((app, index) => {
      setTimeout(() => {
        setAndroidQueueIndex(index);
        const targetUrl = app.secondarySourceUrl || app.directDownloadUrl || app.officialUrl;
        const link = document.createElement('a');
        link.href = targetUrl;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setCompletedAndroidIds((prev) => [...prev, app.id]);
        if (index === androidApps.length - 1) {
          setTimeout(() => setAndroidQueueIndex(null), 1200);
        }
      }, index * 1400);
    });
  };

  return (
    <section className="max-w-7xl mx-auto px-6 py-10">
      <div className="glass-panel rounded-2xl p-6 mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <Terminal className="w-6 h-6 text-sky-400" />
            <h2 className="text-2xl font-bold font-display text-slate-100">
              Auto-Installer Engine — التسطيب الأوتوماتيكي
            </h2>
          </div>
          <p className="text-sm text-slate-300 mt-1 max-w-2xl">
            Generate silent automated Windows deployment scripts (`.ps1` / `.bat` powered by `winget` or `chocolatey`) or dispatch a sequential APK download queue for Android devices.
          </p>
        </div>

        {selectedApps.length > 0 && (
          <button
            type="button"
            onClick={onClearAll}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 text-xs font-semibold transition-colors cursor-pointer shrink-0"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear Queue ({selectedApps.length})</span>
          </button>
        )}
      </div>

      {selectedApps.length === 0 ? (
        <div className="glass-panel rounded-2xl p-12 text-center">
          <Terminal className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-semibold font-display text-slate-200">
            No Packages Selected for Bulk Deployment
          </h3>
          <p className="text-sm text-slate-400 mt-1 max-w-md mx-auto">
            Check "Select for Bulk Install (تسطيب أوتوماتيكي)" on any PC or Android application card in Search Results or Homepage Carousels to build your deployment queue.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Column 1: PC Windows Silent Script Generator */}
          <div className="glass-panel rounded-2xl p-6 space-y-5">
            <div className="flex items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <Monitor className="w-5 h-5 text-sky-400" />
                <div>
                  <h3 className="text-lg font-bold font-display text-slate-100">
                    Windows PC Silent Script ({pcApps.length})
                  </h3>
                  <p className="text-xs text-slate-400">
                    Unattended terminal installation via official repositories
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={pkgManager}
                  onChange={(e) => setPkgManager(e.target.value as WindowsPackageManager)}
                  className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 font-mono"
                >
                  <option value="winget">winget</option>
                  <option value="choco">chocolatey</option>
                </select>

                <select
                  value={scriptFormat}
                  onChange={(e) => setScriptFormat(e.target.value as WindowsScriptFormat)}
                  className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 font-mono"
                >
                  <option value="ps1">PowerShell (.ps1)</option>
                  <option value="bat">Batch (.bat)</option>
                </select>
              </div>
            </div>

            {pcApps.length === 0 ? (
              <p className="text-sm text-slate-400 py-4">
                No Windows PC applications selected yet. Select PC apps to generate a `.ps1` or `.bat` installer.
              </p>
            ) : (
              <>
                <ul className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {pcApps.map((app) => (
                    <li
                      key={app.id}
                      className="flex items-center justify-between gap-3 bg-slate-900/90 px-3.5 py-2.5 rounded-xl border border-slate-800"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={app.thumbnail}
                          alt={app.name}
                          referrerPolicy="no-referrer"
                          className="w-8 h-8 rounded-lg object-cover bg-slate-800 shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-200 truncate">{app.name}</p>
                          <p className="text-xs font-mono text-sky-400 truncate">
                            {pkgManager === 'winget' ? app.wingetId || app.id : app.chocoId || app.id}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => onRemoveApp(app)}
                        className="text-slate-400 hover:text-rose-400 p-1 cursor-pointer"
                        title="Remove from queue"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </li>
                  ))}
                </ul>

                {previewScript && (
                  <div className="rounded-xl bg-slate-950 border border-slate-800 p-4">
                    <div className="flex items-center justify-between text-xs text-slate-400 font-mono mb-2">
                      <span>{previewScript.filename}</span>
                      <span>UTF-8 Silent Mode</span>
                    </div>
                    <pre className="text-xs font-mono text-emerald-300 overflow-x-auto max-h-48 whitespace-pre">
                      {previewScript.content}
                    </pre>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleDownloadWindowsScript}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold text-sm transition-colors cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>
                    Download {scriptFormat.toUpperCase()} Auto-Installer ({pcApps.length} Apps)
                  </span>
                </button>
              </>
            )}
          </div>

          {/* Column 2: Android Sequential APK Download Queue */}
          <div className="glass-panel rounded-2xl p-6 space-y-5">
            <div className="flex items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <Smartphone className="w-5 h-5 text-emerald-400" />
                <div>
                  <h3 className="text-lg font-bold font-display text-slate-100">
                    Android Bulk APK Queue ({androidApps.length})
                  </h3>
                  <p className="text-xs text-slate-400">
                    Sequential package fetcher for Google Play & F-Droid repositories
                  </p>
                </div>
              </div>
            </div>

            {androidApps.length === 0 ? (
              <p className="text-sm text-slate-400 py-4">
                No Android applications selected yet. Select Android apps to queue sequential APK downloads.
              </p>
            ) : (
              <>
                <ul className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {androidApps.map((app, idx) => {
                    const isCurrent = androidQueueIndex === idx;
                    const isDone = completedAndroidIds.includes(app.id);
                    return (
                      <li
                        key={app.id}
                        className={`flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl border ${
                          isCurrent
                            ? 'bg-sky-500/15 border-sky-400'
                            : isDone
                            ? 'bg-emerald-500/10 border-emerald-500/30'
                            : 'bg-slate-900/90 border-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={app.thumbnail}
                            alt={app.name}
                            referrerPolicy="no-referrer"
                            className="w-8 h-8 rounded-lg object-cover bg-slate-800 shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-slate-200 truncate">
                              {idx + 1}. {app.name}
                            </p>
                            <p className="text-xs text-slate-400 truncate font-mono">
                              {isCurrent
                                ? 'Dispatching package download...'
                                : isDone
                                ? 'Dispatched to device storage'
                                : app.secondarySourceLabel || 'Google Play / F-Droid'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {isDone && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                          <a
                            href={app.secondarySourceUrl || app.directDownloadUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-300"
                            title="Direct package link"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                          <button
                            type="button"
                            onClick={() => onRemoveApp(app)}
                            className="text-slate-400 hover:text-rose-400 p-1 cursor-pointer"
                            title="Remove from queue"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>

                <button
                  type="button"
                  onClick={handleStartAndroidSequentialQueue}
                  disabled={androidQueueIndex !== null}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 text-slate-950 font-semibold text-sm transition-colors cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-slate-950" />
                  <span>
                    {androidQueueIndex !== null
                      ? `Fetching Package ${androidQueueIndex + 1} of ${androidApps.length}...`
                      : `Start Sequential APK Queue (${androidApps.length} Apps)`}
                  </span>
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </section>
  );
};
