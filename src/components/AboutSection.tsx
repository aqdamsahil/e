import React from 'react';
import { Layers, ShieldCheck, Download, Sparkles, Smartphone, CheckCircle2 } from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';

export const AboutSection: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 animate-fade-in space-y-12">
      {/* Intro */}
      <div className="text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-teal-500 to-cyan-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-teal-500/20">
          <Layers className="w-8 h-8" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          About Poster<span className="text-teal-600">Hub</span>
        </h1>
        <p className="text-slate-600 text-sm max-w-xl mx-auto leading-relaxed">
          PosterHub is a modern, high-fidelity gallery and poster repository created to preserve and share high-resolution poster art across cinema, travel, sci-fi, music, and design.
        </p>
      </div>

      {/* 3 Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
            <Download className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm">Original Quality Downloads</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            All posters maintain their native aspect ratio and original resolution (up to 4K+), ideal for wall framing, high-DPI wallpapers, and print exhibits.
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center">
            <Smartphone className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm">Progressive Web App (PWA)</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Install PosterHub directly to your phone or desktop. Enjoy an app-like experience with offline caching, fast browsing, and standalone launching.
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm">Secure Admin Portal</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Role-based administration powered by server-side cryptographic authentication. Only authorized admins can manage and publish artwork.
          </p>
        </div>
      </div>

      {/* PWA Promotion Callout */}
      <div className="bg-gradient-to-r from-teal-500 to-cyan-600 rounded-3xl p-8 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center sm:text-left">
          <span className="text-xs font-bold tracking-wider uppercase bg-white/20 px-2.5 py-1 rounded-full">
            Install Everywhere
          </span>
          <h2 className="text-2xl font-bold">Install PosterHub On Your Device</h2>
          <p className="text-xs text-teal-50 max-w-md">
            Click the Install button to save PosterHub to your home screen or desktop launcher for 1-tap access.
          </p>
        </div>
        <div className="shrink-0 bg-white p-3 rounded-2xl shadow-lg">
          <PWAInstallButton />
        </div>
      </div>
    </div>
  );
};
