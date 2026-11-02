import React, { useState } from 'react';
import {
  Download,
  CheckCircle2,
  Share2,
  Smartphone,
  Monitor,
  X,
  ExternalLink,
  PlusSquare,
  Sparkles,
  ArrowDownToLine,
  HelpCircle,
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, triggerInstall } = usePWAInstall();
  const [showModal, setShowModal] = useState<boolean>(false);
  const [activePlatformTab, setActivePlatformTab] = useState<'ios' | 'android' | 'desktop'>(
    isIOS ? 'ios' : 'desktop'
  );
  const [installedNotice, setInstalledNotice] = useState<boolean>(false);

  const handleClick = async () => {
    if (isInstalled) {
      setInstalledNotice(true);
      setShowModal(true);
      return;
    }

    if (isInstallable) {
      try {
        const outcome = await triggerInstall();
        if (outcome === 'accepted') {
          setInstalledNotice(true);
          setShowModal(true);
        }
      } catch (err) {
        console.warn('Installation error:', err);
        setShowModal(true);
      }
    } else {
      // Show platform-specific installation instructions
      setShowModal(true);
    }
  };

  return (
    <>
      {/* 
        INSTALL BUTTON
        - Top navigation bar placement
        - Download/install icon with text "Install"
        - Rounded pill-shaped design
        - Beautiful teal/cyan background with white text
        - Small, clean, and professional
      */}
      <button
        onClick={handleClick}
        className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[13px] font-bold shadow-sm transition-all duration-200 active:scale-95 cursor-pointer select-none ${
          isInstalled
            ? 'bg-teal-50 border border-teal-300 text-teal-800 hover:bg-teal-100 shadow-teal-500/10'
            : 'bg-[#00a299] hover:bg-[#008f87] active:bg-[#007f78] text-white shadow-teal-700/20 hover:shadow-teal-700/35'
        }`}
        title={isInstalled ? 'PosterHub is installed' : 'Install PosterHub Web App'}
        aria-label={isInstalled ? 'Open App' : 'Install App'}
      >
        {isInstalled ? (
          <>
            <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
            <span className="tracking-tight">Open App</span>
          </>
        ) : (
          <>
            {/* Exact Download / Install Tray Icon from Reference Screenshot */}
            <svg
              className="w-4 h-4 text-white shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 16.5v1.5a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-1.5" />
              <polyline points="7 10.5 12 15.5 17 10.5" />
              <line x1="12" y1="3.5" x2="12" y2="15.5" />
            </svg>
            <span className="tracking-tight">Install</span>
          </>
        )}
      </button>

      {/* PWA Guided Installation & Information Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-teal-600 to-cyan-600 p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-md">
                  <ArrowDownToLine className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-base leading-tight">Install PosterHub</h3>
                  <p className="text-[11px] text-teal-100">Standalone App • Free 4K Posters &amp; Uploads</p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition cursor-pointer text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              {installedNotice || isInstalled ? (
                /* App Already Installed State */
                <div className="text-center py-4 space-y-3">
                  <div className="w-14 h-14 bg-teal-50 text-teal-600 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h4 className="font-bold text-slate-800 text-lg">PosterHub is Installed</h4>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                    PosterHub is installed on your device. You can launch it directly from your home screen, desktop, or app launcher without browser URL bars.
                  </p>
                </div>
              ) : (
                /* Guided Platform Instructions */
                <div className="space-y-4">
                  {/* Platform Selector Tabs */}
                  <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl text-xs font-semibold">
                    <button
                      onClick={() => setActivePlatformTab('desktop')}
                      className={`flex-1 py-1.5 rounded-lg transition cursor-pointer ${
                        activePlatformTab === 'desktop'
                          ? 'bg-white text-teal-700 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Desktop (PC/Mac)
                    </button>
                    <button
                      onClick={() => setActivePlatformTab('android')}
                      className={`flex-1 py-1.5 rounded-lg transition cursor-pointer ${
                        activePlatformTab === 'android'
                          ? 'bg-white text-teal-700 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Android
                    </button>
                    <button
                      onClick={() => setActivePlatformTab('ios')}
                      className={`flex-1 py-1.5 rounded-lg transition cursor-pointer ${
                        activePlatformTab === 'ios'
                          ? 'bg-white text-teal-700 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      iPhone / iPad
                    </button>
                  </div>

                  {/* Desktop Instructions */}
                  {activePlatformTab === 'desktop' && (
                    <div className="space-y-3 text-xs text-slate-600">
                      <div className="bg-cyan-50 border border-cyan-100 p-3 rounded-2xl flex items-start gap-2.5 text-cyan-900">
                        <Monitor className="w-4 h-4 text-cyan-600 shrink-0 mt-0.5" />
                        <div>
                          <strong className="block font-semibold">Chrome, Edge &amp; Brave on PC/Mac</strong>
                          Click the install icon in the address bar or browser menu.
                        </div>
                      </div>

                      <ol className="space-y-2.5 text-slate-600 text-xs">
                        <li className="flex items-start gap-2.5">
                          <span className="w-5 h-5 rounded-full bg-teal-600 text-white font-bold flex items-center justify-center shrink-0 text-[10px]">
                            1
                          </span>
                          <span>
                            Look for the <strong className="text-slate-800">Install icon</strong> (⊕ or download icon) at the right end of your browser&apos;s address bar.
                          </span>
                        </li>
                        <li className="flex items-start gap-2.5">
                          <span className="w-5 h-5 rounded-full bg-teal-600 text-white font-bold flex items-center justify-center shrink-0 text-[10px]">
                            2
                          </span>
                          <span>
                            Or click browser menu (<strong className="text-slate-800">⋮</strong>) and select <strong className="text-slate-800">&quot;Install PosterHub...&quot;</strong>.
                          </span>
                        </li>
                        <li className="flex items-start gap-2.5">
                          <span className="w-5 h-5 rounded-full bg-teal-600 text-white font-bold flex items-center justify-center shrink-0 text-[10px]">
                            3
                          </span>
                          <span>
                            Click <strong className="text-slate-800">Install</strong>. PosterHub launches instantly in its own dedicated window!
                          </span>
                        </li>
                      </ol>

                      {isInstallable && (
                        <button
                          onClick={async () => {
                            await triggerInstall();
                            setShowModal(false);
                          }}
                          className="w-full mt-2 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Launch Native Browser Prompt</span>
                        </button>
                      )}
                    </div>
                  )}

                  {/* Android Instructions */}
                  {activePlatformTab === 'android' && (
                    <div className="space-y-3 text-xs text-slate-600">
                      <div className="bg-teal-50 border border-teal-100 p-3 rounded-2xl flex items-start gap-2.5 text-teal-900">
                        <Smartphone className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                        <div>
                          <strong className="block font-semibold">Chrome &amp; Samsung Internet on Android</strong>
                          Fast 1-tap installation to your home screen.
                        </div>
                      </div>

                      <ol className="space-y-2.5 text-slate-600 text-xs">
                        <li className="flex items-start gap-2.5">
                          <span className="w-5 h-5 rounded-full bg-teal-600 text-white font-bold flex items-center justify-center shrink-0 text-[10px]">
                            1
                          </span>
                          <span>
                            Tap the <strong className="text-slate-800">three dots menu (⋮)</strong> at the top right of Chrome.
                          </span>
                        </li>
                        <li className="flex items-start gap-2.5">
                          <span className="w-5 h-5 rounded-full bg-teal-600 text-white font-bold flex items-center justify-center shrink-0 text-[10px]">
                            2
                          </span>
                          <span>
                            Tap <strong className="text-slate-800">&quot;Install app&quot;</strong> or <strong className="text-slate-800">&quot;Add to Home screen&quot;</strong>.
                          </span>
                        </li>
                        <li className="flex items-start gap-2.5">
                          <span className="w-5 h-5 rounded-full bg-teal-600 text-white font-bold flex items-center justify-center shrink-0 text-[10px]">
                            3
                          </span>
                          <span>
                            Confirm by tapping <strong className="text-slate-800">Install</strong>.
                          </span>
                        </li>
                      </ol>

                      {isInstallable && (
                        <button
                          onClick={async () => {
                            await triggerInstall();
                            setShowModal(false);
                          }}
                          className="w-full mt-2 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Tap to Trigger Install</span>
                        </button>
                      )}
                    </div>
                  )}

                  {/* iOS Safari Instructions */}
                  {activePlatformTab === 'ios' && (
                    <div className="space-y-3 text-xs text-slate-600">
                      <div className="bg-amber-50 border border-amber-200/80 p-3 rounded-2xl flex items-start gap-2.5 text-amber-900">
                        <Share2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <strong className="block font-semibold">Safari on iPhone &amp; iPad</strong>
                          iOS uses Safari&apos;s Share sheet to install Progressive Web Apps.
                        </div>
                      </div>

                      <ol className="space-y-2.5 text-slate-600 text-xs">
                        <li className="flex items-start gap-2.5">
                          <span className="w-5 h-5 rounded-full bg-teal-600 text-white font-bold flex items-center justify-center shrink-0 text-[10px]">
                            1
                          </span>
                          <span>
                            In Safari, tap the <strong className="text-slate-800">Share</strong> icon{' '}
                            <Share2 className="w-3.5 h-3.5 inline text-teal-600 mx-0.5" /> in the bottom toolbar.
                          </span>
                        </li>
                        <li className="flex items-start gap-2.5">
                          <span className="w-5 h-5 rounded-full bg-teal-600 text-white font-bold flex items-center justify-center shrink-0 text-[10px]">
                            2
                          </span>
                          <span>
                            Scroll down the options list and tap{' '}
                            <strong className="text-slate-800">Add to Home Screen</strong>.
                          </span>
                        </li>
                        <li className="flex items-start gap-2.5">
                          <span className="w-5 h-5 rounded-full bg-teal-600 text-white font-bold flex items-center justify-center shrink-0 text-[10px]">
                            3
                          </span>
                          <span>
                            Tap <strong className="text-slate-800">Add</strong> in the top right corner. The PosterHub icon will appear on your home screen.
                          </span>
                        </li>
                      </ol>
                    </div>
                  )}
                </div>
              )}

              {/* PWA Feature Highlights */}
              <div className="border-t border-slate-100 pt-3 grid grid-cols-3 gap-2 text-center text-[10px] text-slate-500">
                <div className="bg-slate-50 p-2 rounded-xl">
                  <span className="font-bold text-slate-800 block">⚡ Offline-Ready</span>
                  Cached resources
                </div>
                <div className="bg-slate-50 p-2 rounded-xl">
                  <span className="font-bold text-slate-800 block">📱 Standalone</span>
                  Zero browser bars
                </div>
                <div className="bg-slate-50 p-2 rounded-xl">
                  <span className="font-bold text-slate-800 block">🖼️ 4K Artwork</span>
                  Instant downloads
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={() => setShowModal(false)}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
