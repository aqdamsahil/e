import React, { useState } from 'react';
import { Layers, Shield, Menu, X, Sparkles, LogOut, Search } from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';
import { AuthState } from '../types';

interface NavbarProps {
  currentView: 'home' | 'categories' | 'latest' | 'about' | 'admin';
  setCurrentView: (view: 'home' | 'categories' | 'latest' | 'about' | 'admin') => void;
  auth: AuthState;
  onOpenLogin: () => void;
  onLogout: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  setCurrentView,
  auth,
  onOpenLogin,
  onLogout,
  searchQuery,
  setSearchQuery,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-xs transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div
          onClick={() => {
            setCurrentView('home');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="flex items-center gap-2.5 cursor-pointer group select-none shrink-0"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-600 via-teal-500 to-cyan-500 flex items-center justify-center shadow-md shadow-teal-500/20 group-hover:shadow-teal-500/35 transition-all">
            <Layers className="w-5 h-5 text-white transform -rotate-6 group-hover:rotate-0 transition-transform" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-xl tracking-tight text-slate-900 group-hover:text-teal-600 transition-colors">
                Poster<span className="text-teal-600">Hub</span>
              </span>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200/60 uppercase tracking-wider">
                Pro
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium -mt-1 hidden sm:block">
              Free 4K Posters &amp; Artwork
            </p>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 text-sm font-medium text-slate-600">
          <button
            onClick={() => setCurrentView('home')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              currentView === 'home'
                ? 'text-teal-700 bg-teal-50 font-semibold'
                : 'hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            Home
          </button>
          <button
            onClick={() => setCurrentView('categories')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              currentView === 'categories'
                ? 'text-teal-700 bg-teal-50 font-semibold'
                : 'hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            Categories
          </button>
          <button
            onClick={() => setCurrentView('latest')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              currentView === 'latest'
                ? 'text-teal-700 bg-teal-50 font-semibold'
                : 'hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            Latest Posters
          </button>
          <button
            onClick={() => setCurrentView('about')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              currentView === 'about'
                ? 'text-teal-700 bg-teal-50 font-semibold'
                : 'hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            About
          </button>
        </nav>

        {/* Right Action Cluster: Search + Install App Button + Admin Portal */}
        <div className="flex items-center gap-2.5">
          {/* Quick Search Toggle (desktop/tablet) */}
          <div className="relative hidden lg:block w-48 xl:w-56">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search posters..."
              className="w-full bg-slate-100 hover:bg-slate-100/80 focus:bg-white text-xs pl-8 pr-3 py-1.5 rounded-full border border-transparent focus:border-teal-500 focus:outline-none transition"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* INSTALL BUTTON - Rounded pill-shaped teal/cyan button exactly as requested */}
          <PWAInstallButton />

          {/* Admin Portal Button */}
          {auth.isAuthenticated ? (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentView('admin')}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                  currentView === 'admin'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                }`}
              >
                <Shield className="w-3.5 h-3.5 text-teal-500" />
                <span>Dashboard</span>
              </button>
              <button
                onClick={onLogout}
                title="Log out from Admin"
                className="p-1.5 text-slate-400 hover:text-rose-600 rounded-full hover:bg-rose-50 transition cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                setCurrentView('admin');
                onOpenLogin();
              }}
              className="px-3 py-1.5 rounded-full text-xs font-medium text-slate-600 hover:text-teal-700 hover:bg-teal-50/80 transition flex items-center gap-1 cursor-pointer border border-slate-200"
            >
              <Shield className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline">Admin</span>
            </button>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 transition cursor-pointer"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 pt-3 pb-5 space-y-3 shadow-lg">
          {/* Mobile Search */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search posters by title, artist, or tag..."
              className="w-full bg-slate-50 text-xs pl-8 pr-3 py-2 rounded-xl border border-slate-200 focus:border-teal-500 focus:outline-none"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          </div>

          <nav className="flex flex-col space-y-1 text-sm font-medium text-slate-700">
            <button
              onClick={() => {
                setCurrentView('home');
                setMobileMenuOpen(false);
              }}
              className={`text-left px-3 py-2 rounded-lg ${
                currentView === 'home' ? 'bg-teal-50 text-teal-700 font-bold' : 'hover:bg-slate-50'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => {
                setCurrentView('categories');
                setMobileMenuOpen(false);
              }}
              className={`text-left px-3 py-2 rounded-lg ${
                currentView === 'categories' ? 'bg-teal-50 text-teal-700 font-bold' : 'hover:bg-slate-50'
              }`}
            >
              Categories
            </button>
            <button
              onClick={() => {
                setCurrentView('latest');
                setMobileMenuOpen(false);
              }}
              className={`text-left px-3 py-2 rounded-lg ${
                currentView === 'latest' ? 'bg-teal-50 text-teal-700 font-bold' : 'hover:bg-slate-50'
              }`}
            >
              Latest Posters
            </button>
            <button
              onClick={() => {
                setCurrentView('about');
                setMobileMenuOpen(false);
              }}
              className={`text-left px-3 py-2 rounded-lg ${
                currentView === 'about' ? 'bg-teal-50 text-teal-700 font-bold' : 'hover:bg-slate-50'
              }`}
            >
              About PosterHub
            </button>
            <button
              onClick={() => {
                setCurrentView('admin');
                setMobileMenuOpen(false);
              }}
              className={`text-left px-3 py-2 rounded-lg flex items-center justify-between ${
                currentView === 'admin' ? 'bg-slate-900 text-white font-bold' : 'hover:bg-slate-50'
              }`}
            >
              <span className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-teal-500" />
                Admin Dashboard
              </span>
              {auth.isAuthenticated && (
                <span className="text-[10px] bg-teal-500 text-white px-2 py-0.5 rounded-full">
                  Logged In
                </span>
              )}
            </button>
            <div className="pt-2 pb-1 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">Install App on Phone</span>
              <PWAInstallButton />
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};
