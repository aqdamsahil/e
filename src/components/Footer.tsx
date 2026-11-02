import React from 'react';
import { Layers, Shield, Heart, Sparkles, Mail, Github, Download } from 'lucide-react';
import { Category } from '../types';

interface FooterProps {
  categories: Category[];
  onSelectCategory: (catName: string) => void;
  onOpenAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  categories,
  onSelectCategory,
  onOpenAdmin,
}) => {
  return (
    <footer className="bg-white border-t border-slate-200 mt-20 pt-16 pb-12 text-xs text-slate-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-12 border-b border-slate-100">
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-teal-600 to-cyan-500 flex items-center justify-center text-white shadow-sm">
                <Layers className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-lg text-slate-900 tracking-tight">
                Poster<span className="text-teal-600">Hub</span>
              </span>
            </div>
            <p className="max-w-md text-slate-600 text-xs leading-relaxed">
              PosterHub is a premier community and artist-driven poster uploading and gallery platform. Browse, discover, and download high-resolution posters formatted in original quality for framing, wallpapers, and digital exhibits.
            </p>
            <div className="pt-2 flex items-center gap-3 text-slate-400">
              <span className="inline-flex items-center gap-1 bg-slate-50 px-2.5 py-1 rounded-md text-[11px] border border-slate-200 text-slate-600">
                <Sparkles className="w-3 h-3 text-teal-600" /> Progressive Web App Enabled
              </span>
              <span className="inline-flex items-center gap-1 bg-slate-50 px-2.5 py-1 rounded-md text-[11px] border border-slate-200 text-slate-600">
                ⚡ 4K High Quality
              </span>
            </div>
          </div>

          {/* Categories Quick Links */}
          <div>
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-3">
              Explore Categories
            </h4>
            <ul className="space-y-2">
              {categories
                .filter((c) => c.id !== 'all')
                .slice(0, 6)
                .map((cat) => (
                  <li key={cat.id}>
                    <button
                      onClick={() => {
                        onSelectCategory(cat.name);
                        window.scrollTo({ top: 400, behavior: 'smooth' });
                      }}
                      className="text-slate-500 hover:text-teal-600 transition cursor-pointer"
                    >
                      {cat.name}
                    </button>
                  </li>
                ))}
            </ul>
          </div>

          {/* Quick Links & Contact */}
          <div>
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-3">
              Platform &amp; Admin
            </h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={onOpenAdmin}
                  className="text-slate-500 hover:text-teal-600 flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Shield className="w-3.5 h-3.5 text-teal-500" />
                  <span>Admin Management Portal</span>
                </button>
              </li>
              <li>
                <span className="text-slate-400">Direct Support: contact@posterhub.gallery</span>
              </li>
              <li>
                <span className="text-slate-400">License: Personal &amp; Exhibition Use</span>
              </li>
              <li>
                <span className="text-slate-400">PWA Manifest: Active (Offline Cache)</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright row */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400">
          <p>© {new Date().getFullYear()} PosterHub. All rights reserved. Built for creators and art enthusiasts.</p>
          <div className="flex items-center gap-4">
            <span className="hover:text-slate-600">Privacy Policy</span>
            <span>•</span>
            <span className="hover:text-slate-600">Terms of Use</span>
            <span>•</span>
            <button onClick={onOpenAdmin} className="text-teal-600 hover:underline cursor-pointer">
              Admin Login
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
