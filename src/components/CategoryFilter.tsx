import React from 'react';
import { ArrowUpDown, SlidersHorizontal, Sparkles } from 'lucide-react';
import { Category } from '../types';

interface CategoryFilterProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (catId: string) => void;
  sortOption: 'newest' | 'oldest' | 'downloads';
  onSelectSort: (sort: 'newest' | 'oldest' | 'downloads') => void;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  sortOption,
  onSelectSort,
}) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-4 border-b border-slate-200">
      {/* Category Pills Scroller */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
        {categories.map((cat) => {
          const isSelected =
            cat.id === 'all'
              ? selectedCategory === 'all' || selectedCategory === ''
              : selectedCategory.toLowerCase() === cat.name.toLowerCase() ||
                selectedCategory.toLowerCase() === cat.id.toLowerCase();

          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id === 'all' ? 'all' : cat.name)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer shrink-0 select-none ${
                isSelected
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
              }`}
            >
              <span>{cat.name}</span>
              {typeof cat.posterCount === 'number' && (
                <span
                  className={`ml-1.5 text-[10px] px-1.5 py-0.2 rounded-full ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {cat.posterCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Sort Selector */}
      <div className="flex items-center gap-2 shrink-0 self-end md:self-auto text-xs">
        <span className="text-slate-400 font-medium flex items-center gap-1">
          <ArrowUpDown className="w-3.5 h-3.5" /> Sort:
        </span>
        <select
          value={sortOption}
          onChange={(e) => onSelectSort(e.target.value as any)}
          className="bg-white border border-slate-200 text-slate-800 py-1.5 px-3 rounded-xl focus:outline-none focus:border-teal-500 font-medium cursor-pointer shadow-2xs"
        >
          <option value="newest">Newest to Oldest</option>
          <option value="oldest">Oldest to Newest</option>
          <option value="downloads">Most Downloaded</option>
        </select>
      </div>
    </div>
  );
};
