import React, { useState, useEffect } from 'react';
import {
  Layers,
  Sparkles,
  Flame,
  Clock,
  Download,
  Search,
  Filter,
  ArrowRight,
  TrendingUp,
  Image as ImageIcon,
  CheckCircle2,
} from 'lucide-react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { CategoryFilter } from './components/CategoryFilter';
import { PosterCard } from './components/PosterCard';
import { PosterModal } from './components/PosterModal';
import { AdminLogin } from './components/AdminLogin';
import { AdminDashboard } from './components/AdminDashboard';
import { AboutSection } from './components/AboutSection';
import { Footer } from './components/Footer';
import { OfflineIndicator } from './components/OfflineIndicator';
import { fetchPosters, fetchCategories, trackDownload, verifyAdmin, logoutAdmin } from './lib/api';
import { Poster, Category, AuthState } from './types';

export default function App() {
  const [currentView, setCurrentView] = useState<'home' | 'categories' | 'latest' | 'about' | 'admin'>('home');
  const [posters, setPosters] = useState<Poster[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Search, filter, and sort
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortOption, setSortOption] = useState<'newest' | 'oldest' | 'downloads'>('newest');

  // Preview Modal
  const [activePoster, setActivePoster] = useState<Poster | null>(null);

  // Authentication State
  const [auth, setAuth] = useState<AuthState>(() => {
    const savedToken = localStorage.getItem('posterhub_admin_token');
    return {
      isAuthenticated: !!savedToken,
      token: savedToken,
      user: savedToken ? { username: 'admin', role: 'admin', name: 'Administrator' } : null,
    };
  });

  // Load initial data
  const loadContent = async () => {
    setLoading(true);
    try {
      const [postersData, categoriesData] = await Promise.all([
        fetchPosters({
          category: selectedCategory !== 'all' ? selectedCategory : undefined,
          search: searchQuery.trim() || undefined,
          sort: sortOption,
          status: 'published',
        }),
        fetchCategories(),
      ]);
      setPosters(postersData);
      setCategories(categoriesData);
    } catch (err) {
      console.error('Error fetching gallery data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContent();
  }, [selectedCategory, sortOption]);

  // Debounced search trigger
  useEffect(() => {
    const timer = setTimeout(() => {
      loadContent();
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Check URL params on initial mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const posterParam = params.get('poster');
    if (posterParam) {
      // Find poster or fetch
      const found = posters.find((p) => p.id === posterParam);
      if (found) {
        setActivePoster(found);
      }
    }

    if (window.location.pathname === '/admin' || window.location.hash === '#admin') {
      setCurrentView('admin');
    }

    // Verify stored admin token validity
    if (auth.token) {
      verifyAdmin(auth.token).then((isValid) => {
        if (!isValid) {
          localStorage.removeItem('posterhub_admin_token');
          setAuth({ isAuthenticated: false, token: null, user: null });
        }
      });
    }
  }, []);

  // Update active poster if URL query matched later
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const posterParam = params.get('poster');
    if (posterParam && posters.length > 0 && !activePoster) {
      const found = posters.find((p) => p.id === posterParam);
      if (found) setActivePoster(found);
    }
  }, [posters]);

  // Handle Download Action
  const handleDownload = async (poster: Poster) => {
    try {
      // Track download on server / firestore
      const newCount = await trackDownload(poster.id);
      // Update local state
      setPosters((prev) =>
        prev.map((p) => (p.id === poster.id ? { ...p, downloadCount: newCount || p.downloadCount + 1 } : p))
      );
      if (activePoster && activePoster.id === poster.id) {
        setActivePoster((prev) => (prev ? { ...prev, downloadCount: newCount || prev.downloadCount + 1 } : null));
      }

      // Trigger download with meaningful filename
      const cleanTitle = poster.title.replace(/[^a-zA-Z0-9_-]/g, '_');
      const filename = `PosterHub-${cleanTitle}.${(poster.fileFormat || 'jpg').toLowerCase()}`;

      // Create download anchor
      const link = document.createElement('a');
      link.href = poster.imageUrl;
      link.download = filename;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Download error:', err);
    }
  };

  // Handle Share Modal / Clipboard
  const handleShare = (poster: Poster) => {
    setActivePoster(poster);
  };

  // Handle Admin Login Success
  const handleLoginSuccess = (token: string, user: any) => {
    localStorage.setItem('posterhub_admin_token', token);
    setAuth({
      isAuthenticated: true,
      token,
      user,
    });
    setCurrentView('admin');
  };

  // Handle Logout
  const handleLogout = async () => {
    if (auth.token) {
      await logoutAdmin(auth.token);
    }
    localStorage.removeItem('posterhub_admin_token');
    setAuth({
      isAuthenticated: false,
      token: null,
      user: null,
    });
    setCurrentView('home');
  };

  // Calculated sections
  const totalDownloads = posters.reduce((sum, p) => sum + (p.downloadCount || 0), 0);
  const latestPosters = [...posters].slice(0, 4);
  const popularPosters = [...posters].sort((a, b) => b.downloadCount - a.downloadCount).slice(0, 4);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Top Fixed / Sticky Navigation Bar with Install Pill Button */}
      <Navbar
        currentView={currentView}
        setCurrentView={(view) => {
          setCurrentView(view);
          if (view === 'categories') {
            const el = document.getElementById('gallery-section');
            el?.scrollIntoView({ behavior: 'smooth' });
          } else if (view === 'latest') {
            setSortOption('newest');
            const el = document.getElementById('gallery-section');
            el?.scrollIntoView({ behavior: 'smooth' });
          } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }}
        auth={auth}
        onOpenLogin={() => setCurrentView('admin')}
        onLogout={handleLogout}
        searchQuery={searchQuery}
        setSearchQuery={(q) => {
          setSearchQuery(q);
          if (currentView !== 'home') setCurrentView('home');
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {/* VIEW: ADMIN PORTAL */}
        {currentView === 'admin' && (
          auth.isAuthenticated && auth.token ? (
            <AdminDashboard
              token={auth.token}
              onLogout={handleLogout}
              onViewPublic={() => {
                setCurrentView('home');
                loadContent();
              }}
              onPreviewPoster={(poster) => setActivePoster(poster)}
            />
          ) : (
            <AdminLogin
              onSuccess={handleLoginSuccess}
              onCancel={() => setCurrentView('home')}
            />
          )
        )}

        {/* VIEW: ABOUT */}
        {currentView === 'about' && <AboutSection />}

        {/* VIEW: PUBLIC HOME / CATEGORIES / LATEST */}
        {(currentView === 'home' || currentView === 'categories' || currentView === 'latest') && (
          <>
            {/* Hero Section */}
            <HeroSection
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              categories={categories}
              selectedCategory={selectedCategory}
              setSelectedCategory={(cat) => {
                setSelectedCategory(cat);
                const el = document.getElementById('gallery-section');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              totalPosters={posters.length}
              totalDownloads={totalDownloads}
            />

            {/* Popular Posters Spotlight (Only on Home when not actively searching) */}
            {currentView === 'home' && !searchQuery && selectedCategory === 'all' && popularPosters.length > 0 && (
              <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-4">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                      <Flame className="w-4 h-4" />
                    </span>
                    <div>
                      <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                        Most Popular Posters
                      </h2>
                      <p className="text-xs text-slate-500">Highest downloaded artwork across all categories</p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setSortOption('downloads');
                      const el = document.getElementById('gallery-section');
                      el?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1 cursor-pointer"
                  >
                    <span>View all popular</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {popularPosters.map((poster) => (
                    <PosterCard
                      key={`popular_${poster.id}`}
                      poster={poster}
                      onView={(p) => setActivePoster(p)}
                      onDownload={handleDownload}
                      onShare={handleShare}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Main Interactive Gallery Section */}
            <section id="gallery-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-20">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <div>
                  <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                    <Layers className="w-6 h-6 text-teal-600" />
                    <span>
                      {selectedCategory === 'all'
                        ? searchQuery
                          ? `Search Results for "${searchQuery}"`
                          : 'Poster Gallery'
                        : `${selectedCategory} Posters`}
                    </span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Showing {posters.length} poster{posters.length === 1 ? '' : 's'} available in original resolution
                  </p>
                </div>
              </div>

              {/* Dynamic Category Pill Filters & Sorting */}
              <CategoryFilter
                categories={categories}
                selectedCategory={selectedCategory}
                onSelectCategory={(catName) => setSelectedCategory(catName)}
                sortOption={sortOption}
                onSelectSort={(sort) => setSortOption(sort)}
              />

              {/* Posters Responsive Grid */}
              {loading ? (
                <div className="py-24 text-center space-y-4">
                  <div className="w-10 h-10 border-3 border-teal-500/20 border-t-teal-600 rounded-full animate-spin mx-auto" />
                  <p className="text-xs text-slate-500 font-medium">Loading high-resolution gallery...</p>
                </div>
              ) : posters.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pt-6">
                  {posters.map((poster) => (
                    <PosterCard
                      key={poster.id}
                      poster={poster}
                      onView={(p) => setActivePoster(p)}
                      onDownload={handleDownload}
                      onShare={handleShare}
                    />
                  ))}
                </div>
              ) : (
                <div className="py-20 text-center max-w-md mx-auto space-y-4">
                  <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto text-slate-400">
                    <ImageIcon className="w-8 h-8" />
                  </div>
                  <h3 className="font-bold text-slate-800 text-base">No Posters Found</h3>
                  <p className="text-xs text-slate-500">
                    We couldn&apos;t find any posters matching &quot;{searchQuery || selectedCategory}&quot;. Try adjusting your search term or exploring another category.
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('all');
                    }}
                    className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition cursor-pointer"
                  >
                    Reset All Filters
                  </button>
                </div>
              )}
            </section>
          </>
        )}
      </main>

      {/* High-Resolution Uncropped Modal Preview */}
      <PosterModal
        poster={activePoster}
        onClose={() => {
          setActivePoster(null);
          // Clean URL param
          if (window.history.pushState) {
            const url = new URL(window.location.href);
            url.searchParams.delete('poster');
            window.history.pushState({}, '', url.toString());
          }
        }}
        onDownload={handleDownload}
      />

      {/* PWA Offline Indicator */}
      <OfflineIndicator />

      {/* Public Footer */}
      <Footer
        categories={categories}
        onSelectCategory={(catName) => {
          setSelectedCategory(catName);
          setCurrentView('home');
          const el = document.getElementById('gallery-section');
          el?.scrollIntoView({ behavior: 'smooth' });
        }}
        onOpenAdmin={() => {
          setCurrentView('admin');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />
    </div>
  );
}
