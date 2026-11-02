import React from 'react';
import { Search, Sparkles, Download, Layers, ShieldCheck, Flame, ArrowRight } from 'lucide-react';
import { Category } from '../types';

interface HeroSectionProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  categories: Category[];
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  totalPosters: number;
  totalDownloads: number;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  searchQuery,
  setSearchQuery,
  categories,
  selectedCategory,
  setSelectedCategory,
  totalPosters,
  totalDownloads,
}) => {
  return (
    <section className="relative overflow-hidden pt-12 pb-16 md:pt-16 md:pb-20 border-b border-slate-100 bg-gradient-to-b from-white via-slate-50/60 to-white">
      {/* Decorative ambient background accents */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[360px] bg-gradient-to-tr from-teal-100/40 via-cyan-100/30 to-amber-100/20 rounded-full blur-3xl -z-10 pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        {/* Brand highlight pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-50 border border-teal-200/80 text-teal-800 text-xs font-semibold shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-teal-600" />
          <span>Next-Gen High-Resolution Poster Gallery &amp; PWA</span>
        </div>

        {/* Primary headline */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.12]">
          Discover, Download &amp; Upload{' '}
          <span className="bg-gradient-to-r from-teal-600 via-cyan-600 to-indigo-600 bg-clip-text text-transparent">
            Artistic Posters
          </span>
        </h1>

        {/* Subtitle */}
        <p className="max-w-2xl mx-auto text-sm sm:text-base text-slate-600 leading-relaxed">
          Explore curated original quality artwork spanning Cyberpunk, Minimalist, Movies, Travel, Music, and Gaming. Free 4K downloads with instant mobile &amp; desktop installation.
        </p>

        {/* Big Search Bar */}
        <div className="max-w-2xl mx-auto pt-2">
          <div className="relative flex items-center bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-200/90 p-2 focus-within:border-teal-500 focus-within:ring-4 focus-within:ring-teal-500/10 transition-all">
            <Search className="w-5 h-5 text-slate-400 ml-3 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, artist, genre (e.g. Tokyo, Dolomites, Bauhaus, Noir)..."
              className="w-full px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none bg-transparent"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="px-2 text-xs text-slate-400 hover:text-slate-600 font-semibold"
              >
                Clear
              </button>
            )}
            <button
              onClick={() => {
                const el = document.getElementById('gallery-section');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="ml-2 px-5 py-2.5 bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white text-xs font-bold rounded-xl shadow-md transition shrink-0 cursor-pointer"
            >
              Search
            </button>
          </div>
        </div>

        {/* Trending Category Tags */}
        <div className="pt-2 flex flex-wrap items-center justify-center gap-2 text-xs">
          <span className="text-slate-400 flex items-center gap-1 font-medium mr-1">
            <Flame className="w-3.5 h-3.5 text-amber-500" /> Trending:
          </span>
          {categories
            .filter((c) => c.id !== 'all')
            .slice(0, 5)
            .map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.name);
                  const el = document.getElementById('gallery-section');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className={`px-3 py-1 rounded-full transition cursor-pointer ${
                  selectedCategory.toLowerCase() === cat.name.toLowerCase()
                    ? 'bg-teal-600 text-white font-semibold'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {cat.name}
              </button>
            ))}
        </div>

        {/* Platform stats summary pills */}
        <div className="pt-6 grid grid-cols-3 max-w-lg mx-auto gap-3 text-center">
          <div className="bg-white/80 backdrop-blur-sm p-3 rounded-2xl border border-slate-100 shadow-xs">
            <span className="block text-lg font-extrabold text-slate-900">
              {totalPosters.toLocaleString()}+
            </span>
            <span className="text-[11px] text-slate-500 font-medium">Curated Posters</span>
          </div>

          <div className="bg-white/80 backdrop-blur-sm p-3 rounded-2xl border border-slate-100 shadow-xs">
            <span className="block text-lg font-extrabold text-teal-600">
              {totalDownloads.toLocaleString()}+
            </span>
            <span className="text-[11px] text-slate-500 font-medium">Direct Downloads</span>
          </div>

          <div className="bg-white/80 backdrop-blur-sm p-3 rounded-2xl border border-slate-100 shadow-xs">
            <span className="block text-lg font-extrabold text-slate-900">100% Free</span>
            <span className="text-[11px] text-slate-500 font-medium">Original Quality</span>
          </div>
        </div>
      </div>
    </section>
  );
};
