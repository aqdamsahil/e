import React, { useState } from 'react';
import { Eye, Download, Share2, Calendar, Sparkles, Check, CheckCircle2 } from 'lucide-react';
import { Poster } from '../types';

interface PosterCardProps {
  poster: Poster;
  onView: (poster: Poster) => void;
  onDownload: (poster: Poster) => void;
  onShare: (poster: Poster) => void;
}

export const PosterCard: React.FC<PosterCardProps> = ({
  poster,
  onView,
  onDownload,
  onShare,
}) => {
  const [downloading, setDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const formattedDate = new Date(poster.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const handleDownloadClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setDownloading(true);
    try {
      await onDownload(poster);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 2000);
    } finally {
      setDownloading(false);
    }
  };

  const handleShareClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onShare(poster);
  };

  return (
    <article
      onClick={() => onView(poster)}
      className="group relative bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-xl hover:border-teal-200 transition-all duration-300 flex flex-col overflow-hidden cursor-pointer"
    >
      {/* Poster Image Container */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-slate-100">
        <img
          src={poster.imageUrl}
          alt={poster.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
        />

        {/* Category Pill Over Image */}
        <div className="absolute top-3 left-3 z-10">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-900/75 backdrop-blur-md text-white border border-white/20 shadow-sm">
            {poster.category}
          </span>
        </div>

        {/* Quality / Format Pill */}
        <div className="absolute top-3 right-3 z-10">
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-white/90 backdrop-blur-md text-slate-800 shadow-sm uppercase tracking-wider">
            {poster.fileFormat || '4K'}
          </span>
        </div>

        {/* Hover Quick Actions Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
          <div className="flex items-center justify-between gap-2 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onView(poster);
              }}
              className="flex-1 py-2 px-3 bg-white/95 hover:bg-white text-slate-900 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 shadow-md transition cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5 text-teal-600" />
              <span>Preview</span>
            </button>
            <button
              onClick={handleDownloadClick}
              disabled={downloading}
              className="py-2 px-3 bg-teal-500 hover:bg-teal-600 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 shadow-md transition cursor-pointer"
              title="Download high-resolution file"
            >
              {downloadSuccess ? (
                <Check className="w-3.5 h-3.5" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
            </button>
            <button
              onClick={handleShareClick}
              className="p-2 bg-slate-800/80 hover:bg-slate-800 text-white rounded-xl shadow-md transition cursor-pointer"
              title="Share Poster"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Poster Metadata Details */}
      <div className="p-4 flex flex-col flex-1 justify-between bg-white">
        <div>
          <h3 className="font-bold text-slate-900 text-sm leading-snug line-clamp-1 group-hover:text-teal-600 transition-colors">
            {poster.title}
          </h3>
          {poster.description && (
            <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
              {poster.description}
            </p>
          )}
        </div>

        <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>{formattedDate}</span>
          </div>

          <div className="flex items-center gap-1 text-slate-600 font-medium">
            <Download className="w-3 h-3 text-teal-600" />
            <span>{poster.downloadCount.toLocaleString()} downloads</span>
          </div>
        </div>

        {/* Direct Action Buttons on mobile/touch */}
        <div className="mt-3 grid grid-cols-3 gap-1.5 sm:hidden">
          <button
            onClick={() => onView(poster)}
            className="py-1.5 bg-slate-100 text-slate-700 text-xs font-medium rounded-lg flex items-center justify-center gap-1"
          >
            <Eye className="w-3 h-3" />
            <span>View</span>
          </button>
          <button
            onClick={handleDownloadClick}
            className="py-1.5 bg-teal-50 text-teal-700 text-xs font-semibold rounded-lg flex items-center justify-center gap-1"
          >
            <Download className="w-3 h-3" />
            <span>Save</span>
          </button>
          <button
            onClick={handleShareClick}
            className="py-1.5 bg-slate-100 text-slate-700 text-xs font-medium rounded-lg flex items-center justify-center gap-1"
          >
            <Share2 className="w-3 h-3" />
            <span>Share</span>
          </button>
        </div>
      </div>
    </article>
  );
};
