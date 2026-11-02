import React, { useState } from 'react';
import { X, Download, Share2, Calendar, FileText, Check, ExternalLink, ShieldCheck, Heart, Sparkles } from 'lucide-react';
import { Poster } from '../types';

interface PosterModalProps {
  poster: Poster | null;
  onClose: () => void;
  onDownload: (poster: Poster) => void;
}

export const PosterModal: React.FC<PosterModalProps> = ({
  poster,
  onClose,
  onDownload,
}) => {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [liked, setLiked] = useState(false);

  if (!poster) return null;

  const formattedDate = new Date(poster.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await onDownload(poster);
    } finally {
      setDownloading(false);
    }
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}/?poster=${poster.id}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(
      `Check out this high-resolution poster "${poster.title}" on PosterHub: ${window.location.origin}/?poster=${poster.id}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${poster.title} – PosterHub`,
          text: poster.description || `Download ${poster.title} in original 4K resolution on PosterHub`,
          url: `${window.location.origin}/?poster=${poster.id}`,
        });
      } catch (err) {
        // Ignored or cancelled
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl max-w-5xl w-full max-h-[92vh] overflow-hidden shadow-2xl flex flex-col md:flex-row border border-slate-100"
      >
        {/* Left: Complete Uncropped Image Stage */}
        <div className="relative md:flex-1 bg-slate-900 flex items-center justify-center min-h-[320px] md:min-h-[560px] p-4 sm:p-6 select-none overflow-hidden group">
          <img
            src={poster.imageUrl}
            alt={poster.title}
            className="max-h-[75vh] w-auto max-w-full object-contain rounded-lg shadow-2xl transition-transform duration-300"
          />

          {/* Close button on mobile floating */}
          <button
            onClick={onClose}
            className="md:hidden absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-900/80 text-white flex items-center justify-center hover:bg-slate-900 transition"
          >
            <X className="w-5 h-5" />
          </button>

          {/* High-res badge overlay */}
          <div className="absolute bottom-4 left-4 flex items-center gap-2">
            <span className="bg-slate-950/80 backdrop-blur-md text-white text-[11px] px-2.5 py-1 rounded-full font-mono border border-white/10">
              Complete View • {poster.fileFormat || 'Original Quality'}
            </span>
          </div>
        </div>

        {/* Right: Metadata, Details & Actions */}
        <div className="w-full md:w-96 p-6 sm:p-8 flex flex-col justify-between overflow-y-auto max-h-[50vh] md:max-h-[92vh] bg-white">
          <div>
            {/* Top Bar with Category & Desktop Close */}
            <div className="flex items-center justify-between mb-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200">
                {poster.category}
              </span>
              <button
                onClick={onClose}
                className="hidden md:flex w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Poster Title */}
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight leading-snug">
              {poster.title}
            </h2>

            {/* Description */}
            <div className="mt-3 text-sm text-slate-600 leading-relaxed">
              {poster.description ? (
                <p>{poster.description}</p>
              ) : (
                <p className="italic text-slate-400">
                  Curated high-resolution design from the PosterHub community library.
                </p>
              )}
            </div>

            {/* Technical Specifications Specs List */}
            <div className="mt-6 p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2.5 text-xs text-slate-600">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" /> Upload Date
                </span>
                <span className="font-medium text-slate-800">{formattedDate}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" /> Format
                </span>
                <span className="font-semibold text-slate-800 uppercase">{poster.fileFormat || 'JPEG'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Download className="w-3.5 h-3.5" /> Total Downloads
                </span>
                <span className="font-bold text-teal-600">{poster.downloadCount.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" /> License
                </span>
                <span className="font-medium text-slate-800">Free for Personal Use</span>
              </div>
            </div>
          </div>

          {/* Action Center */}
          <div className="mt-6 pt-6 border-t border-slate-100 space-y-3">
            {/* Primary Download Button */}
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 active:scale-[0.99] text-white font-bold text-sm rounded-xl shadow-lg shadow-teal-500/25 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>{downloading ? 'Preparing 4K Download...' : 'Download Original Quality'}</span>
            </button>

            {/* Sharing Row */}
            <div className="grid grid-cols-2 gap-2">
              {/* WhatsApp Share */}
              <button
                onClick={handleWhatsAppShare}
                className="py-2.5 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-xl border border-emerald-200/80 transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>WhatsApp</span>
              </button>

              {/* Copy Link */}
              <button
                onClick={handleCopyLink}
                className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-teal-600" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Copy Link</span>
                  </>
                )}
              </button>
            </div>

            {/* Native Share button if supported */}
            {typeof navigator !== 'undefined' && (navigator as any).share && (
              <button
                onClick={handleNativeShare}
                className="w-full py-2 text-slate-500 hover:text-slate-800 text-xs font-medium flex items-center justify-center gap-1 transition"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>More Share Options</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
