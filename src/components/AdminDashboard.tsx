import React, { useState, useEffect, useRef } from 'react';
import {
  UploadCloud,
  FileText,
  Trash2,
  Edit,
  Eye,
  CheckCircle,
  XCircle,
  BarChart3,
  Layers,
  Download,
  Plus,
  RefreshCw,
  AlertTriangle,
  Check,
  Search,
  Filter,
  ArrowUpRight,
  Shield,
  LogOut,
  FolderPlus,
  Sparkles,
} from 'lucide-react';
import { Poster, Category, AdminStats } from '../types';
import {
  fetchPosters,
  uploadPosters,
  updatePoster,
  deletePoster,
  fetchCategories,
  createCategory,
  deleteCategory,
  fetchStats,
} from '../lib/api';

interface AdminDashboardProps {
  token: string;
  onLogout: () => void;
  onViewPublic: () => void;
  onPreviewPoster: (poster: Poster) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  token,
  onLogout,
  onViewPublic,
  onPreviewPoster,
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'posters' | 'categories' | 'stats'>('upload');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [posters, setPosters] = useState<Poster[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Upload state
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<{ file: File; url: string }[]>([]);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadCategory, setUploadCategory] = useState('');
  const [uploadDescription, setUploadDescription] = useState('');
  const [uploadPublished, setUploadPublished] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Edit poster modal state
  const [editingPoster, setEditingPoster] = useState<Poster | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editPublished, setEditPublished] = useState(true);

  // Delete confirmation modal state
  const [posterToDelete, setPosterToDelete] = useState<Poster | null>(null);

  // New category state
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsData, postersData, categoriesData] = await Promise.all([
        fetchStats(token),
        fetchPosters({ status: 'all', token }),
        fetchCategories(),
      ]);
      setStats(statsData);
      setPosters(postersData);
      setCategories(categoriesData);
      if (categoriesData.length > 1 && !uploadCategory) {
        setUploadCategory(categoriesData[1].name);
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to sync admin data' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [token]);

  // Handle files selected for upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      addFiles(Array.from(e.target.files));
    }
  };

  const addFiles = (files: File[]) => {
    const validFiles = files.filter((f) =>
      ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(f.type)
    );

    if (validFiles.length < files.length) {
      setFeedback({
        type: 'error',
        message: 'Some files were skipped: Only JPG, PNG, and WEBP images are supported.',
      });
    }

    const newSelected = [...selectedFiles, ...validFiles];
    setSelectedFiles(newSelected);

    const previews = validFiles.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));
    setFilePreviews((prev) => [...prev, ...previews]);

    if (validFiles.length > 0 && !uploadTitle) {
      const cleanName = validFiles[0].name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
      setUploadTitle(cleanName);
    }
  };

  const removeFile = (index: number) => {
    URL.revokeObjectURL(filePreviews[index].url);
    const updatedFiles = [...selectedFiles];
    updatedFiles.splice(index, 1);
    setSelectedFiles(updatedFiles);

    const updatedPreviews = [...filePreviews];
    updatedPreviews.splice(index, 1);
    setFilePreviews(updatedPreviews);
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addFiles(Array.from(e.dataTransfer.files));
    }
  };

  // Submit Upload
  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFiles.length === 0) {
      setFeedback({ type: 'error', message: 'Please select at least one poster file.' });
      return;
    }

    setUploading(true);
    setUploadProgress(20);

    const formData = new FormData();
    selectedFiles.forEach((file) => {
      formData.append('images', file);
    });
    formData.append('title', uploadTitle.trim());
    formData.append('category', uploadCategory || 'Minimalist & Art');
    formData.append('description', uploadDescription.trim());
    formData.append('published', String(uploadPublished));

    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => (prev < 90 ? prev + 15 : prev));
    }, 200);

    try {
      const res = await uploadPosters(formData, token);
      clearInterval(progressInterval);
      setUploadProgress(100);

      setFeedback({ type: 'success', message: res.message });
      // Reset form
      setSelectedFiles([]);
      filePreviews.forEach((p) => URL.revokeObjectURL(p.url));
      setFilePreviews([]);
      setUploadTitle('');
      setUploadDescription('');
      if (fileInputRef.current) fileInputRef.current.value = '';

      await loadData();
      setActiveTab('posters');
    } catch (err: any) {
      clearInterval(progressInterval);
      setFeedback({ type: 'error', message: err.message || 'Upload failed' });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  // Toggle publish state
  const handleTogglePublish = async (poster: Poster) => {
    try {
      const updated = await updatePoster(poster.id, { published: !poster.published }, token);
      setPosters((prev) => prev.map((p) => (p.id === poster.id ? updated : p)));
      setFeedback({
        type: 'success',
        message: `Poster "${poster.title}" is now ${updated.published ? 'Published' : 'saved as Draft'}.`,
      });
      loadData();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to update poster state' });
    }
  };

  // Open edit modal
  const openEditModal = (poster: Poster) => {
    setEditingPoster(poster);
    setEditTitle(poster.title);
    setEditCategory(poster.category);
    setEditDescription(poster.description || '');
    setEditPublished(poster.published);
  };

  // Save edit modal
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPoster) return;

    try {
      const updated = await updatePoster(
        editingPoster.id,
        {
          title: editTitle.trim(),
          category: editCategory,
          description: editDescription.trim(),
          published: editPublished,
        },
        token
      );
      setPosters((prev) => prev.map((p) => (p.id === editingPoster.id ? updated : p)));
      setEditingPoster(null);
      setFeedback({ type: 'success', message: `Poster updated successfully!` });
      loadData();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to save poster edits' });
    }
  };

  // Confirm delete
  const handleDeletePoster = async () => {
    if (!posterToDelete) return;
    try {
      await deletePoster(posterToDelete.id, token);
      setPosters((prev) => prev.filter((p) => p.id !== posterToDelete.id));
      setFeedback({ type: 'success', message: `Poster "${posterToDelete.title}" permanently deleted.` });
      setPosterToDelete(null);
      loadData();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to delete poster' });
    }
  };

  // Add category
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    try {
      const newCat = await createCategory(newCatName.trim(), newCatDesc.trim(), token);
      setCategories((prev) => [...prev, newCat]);
      setNewCatName('');
      setNewCatDesc('');
      setFeedback({ type: 'success', message: `Category "${newCat.name}" added!` });
      loadData();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to add category' });
    }
  };

  // Delete category
  const handleDeleteCategory = async (cat: Category) => {
    if (cat.posterCount && cat.posterCount > 0) {
      if (!confirm(`Warning: This category contains ${cat.posterCount} posters. Are you sure you want to remove it?`)) {
        return;
      }
    }
    try {
      await deleteCategory(cat.id, token);
      setCategories((prev) => prev.filter((c) => c.id !== cat.id));
      setFeedback({ type: 'success', message: `Category removed.` });
      loadData();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to delete category' });
    }
  };

  // Filtered posters for admin list
  const filteredPosters = posters.filter((p) => {
    const matchesSearch =
      searchQuery === '' ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' ? true : statusFilter === 'published' ? p.published : !p.published;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in space-y-8">
      {/* Top Header & Actions */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-slate-900 text-teal-400 flex items-center justify-center">
              <Shield className="w-4 h-4" />
            </span>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Admin Dashboard</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manage posters, upload artwork in original quality, configure categories, and monitor downloads.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            className="p-2 text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition cursor-pointer"
            title="Refresh data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={onViewPublic}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-teal-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition flex items-center gap-1.5 cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 text-teal-600" />
            <span>View Public Site</span>
          </button>
          <button
            onClick={onLogout}
            className="px-3.5 py-2 text-xs font-semibold text-rose-700 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 rounded-xl transition flex items-center gap-1.5 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Log Out</span>
          </button>
        </div>
      </div>

      {/* Feedback Toast Notification */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl flex items-center justify-between text-xs font-medium ${
            feedback.type === 'success'
              ? 'bg-teal-50 border border-teal-200 text-teal-800'
              : 'bg-rose-50 border border-rose-200 text-rose-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <CheckCircle className="w-4 h-4 text-teal-600" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-600" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-slate-400 hover:text-slate-700">
            ✕
          </button>
        </div>
      )}

      {/* Key Metrics / Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Posters</span>
            <Layers className="w-4 h-4 text-teal-600" />
          </div>
          <p className="text-3xl font-extrabold text-slate-900 mt-2">{stats?.totalPosters ?? posters.length}</p>
          <div className="mt-2 text-[11px] text-slate-500">
            {stats?.publishedPosters ?? 0} published • {stats?.draftPosters ?? 0} drafts
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Published</span>
            <CheckCircle className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-3xl font-extrabold text-emerald-700 mt-2">
            {stats?.publishedPosters ?? posters.filter((p) => p.published).length}
          </p>
          <div className="mt-2 text-[11px] text-slate-500">Visible to public visitors</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Drafts</span>
            <XCircle className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-3xl font-extrabold text-amber-600 mt-2">
            {stats?.draftPosters ?? posters.filter((p) => !p.published).length}
          </p>
          <div className="mt-2 text-[11px] text-slate-500">Unpublished artwork</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Downloads</span>
            <Download className="w-4 h-4 text-cyan-600" />
          </div>
          <p className="text-3xl font-extrabold text-cyan-700 mt-2">
            {stats?.totalDownloads?.toLocaleString() ?? 0}
          </p>
          <div className="mt-2 text-[11px] text-slate-500">Tracked in real time</div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('upload')}
          className={`pb-3 px-3 text-xs font-bold uppercase tracking-wider border-b-2 transition cursor-pointer flex items-center gap-2 ${
            activeTab === 'upload'
              ? 'border-teal-600 text-teal-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <UploadCloud className="w-4 h-4" />
          <span>Upload New Posters</span>
        </button>

        <button
          onClick={() => setActiveTab('posters')}
          className={`pb-3 px-3 text-xs font-bold uppercase tracking-wider border-b-2 transition cursor-pointer flex items-center gap-2 ${
            activeTab === 'posters'
              ? 'border-teal-600 text-teal-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Manage Posters ({posters.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('categories')}
          className={`pb-3 px-3 text-xs font-bold uppercase tracking-wider border-b-2 transition cursor-pointer flex items-center gap-2 ${
            activeTab === 'categories'
              ? 'border-teal-600 text-teal-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FolderPlus className="w-4 h-4" />
          <span>Categories ({categories.length - 1})</span>
        </button>

        <button
          onClick={() => setActiveTab('stats')}
          className={`pb-3 px-3 text-xs font-bold uppercase tracking-wider border-b-2 transition cursor-pointer flex items-center gap-2 ${
            activeTab === 'stats'
              ? 'border-teal-600 text-teal-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Analytics &amp; Top Downloads</span>
        </button>
      </div>

      {/* TAB 1: UPLOAD SYSTEM */}
      {activeTab === 'upload' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Upload Poster Artwork</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Drag and drop high-resolution poster files (JPG, PNG, WEBP) or browse from your device.
            </p>
          </div>

          <form onSubmit={handleUploadSubmit} className="space-y-6">
            {/* Drag & Drop Box */}
            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 hover:border-teal-500 bg-slate-50/60 hover:bg-teal-50/20 rounded-3xl p-8 sm:p-12 text-center transition cursor-pointer group"
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200 text-teal-600 flex items-center justify-center mx-auto shadow-sm group-hover:scale-105 transition-transform">
                <UploadCloud className="w-8 h-8" />
              </div>
              <h3 className="mt-4 font-bold text-slate-800 text-sm">
                Drop your high-resolution posters here, or <span className="text-teal-600">Browse</span>
              </h3>
              <p className="mt-1 text-xs text-slate-400">
                Supports JPG, JPEG, PNG, WEBP • Up to 20 images at once • Max 30MB each
              </p>
            </div>

            {/* Selected File Previews Grid */}
            {filePreviews.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Selected Files ({filePreviews.length})
                  </h4>
                  <button
                    type="button"
                    onClick={() => {
                      filePreviews.forEach((p) => URL.revokeObjectURL(p.url));
                      setSelectedFiles([]);
                      setFilePreviews([]);
                    }}
                    className="text-xs text-rose-600 hover:underline cursor-pointer"
                  >
                    Clear All
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                  {filePreviews.map((item, index) => (
                    <div key={index} className="relative group bg-slate-100 rounded-xl overflow-hidden border border-slate-200">
                      <img src={item.url} alt="preview" className="w-full aspect-[3/4] object-cover" />
                      <div className="p-1.5 text-[10px] text-slate-700 truncate bg-white font-medium">
                        {item.file.name}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-slate-900/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer"
                        title="Remove image"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Metadata Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Poster Title
                </label>
                <input
                  type="text"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  placeholder="e.g. Neon Odyssey: Tokyo Midnight"
                  required
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-teal-500 focus:bg-white"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  For multiple files, numbers (#1, #2...) will be automatically appended if using one title.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Category
                </label>
                <select
                  value={uploadCategory}
                  onChange={(e) => setUploadCategory(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-teal-500 focus:bg-white cursor-pointer"
                >
                  {categories
                    .filter((c) => c.id !== 'all')
                    .map((cat) => (
                      <option key={cat.id} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Description / Artist Notes (Optional)
                </label>
                <textarea
                  value={uploadDescription}
                  onChange={(e) => setUploadDescription(e.target.value)}
                  rows={2}
                  placeholder="Describe the poster artwork, inspiration, or printing recommendation..."
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-teal-500 focus:bg-white"
                />
              </div>

              <div className="flex items-center gap-3 md:col-span-2">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={uploadPublished}
                    onChange={(e) => setUploadPublished(e.target.checked)}
                    className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500"
                  />
                  <span className="text-xs font-semibold text-slate-800">
                    Publish immediately to Public Gallery
                  </span>
                </label>
                <span className="text-xs text-slate-400">
                  (Uncheck to save privately as Draft)
                </span>
              </div>
            </div>

            {/* Upload Progress Bar */}
            {uploading && (
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-slate-600 font-medium">
                  <span>Uploading and optimizing original files...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-teal-500 transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
              <button
                type="submit"
                disabled={uploading || selectedFiles.length === 0}
                className="py-3 px-6 bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white font-bold text-sm rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <UploadCloud className="w-4 h-4" />
                <span>
                  {uploading
                    ? 'Uploading...'
                    : `Upload ${selectedFiles.length > 0 ? selectedFiles.length : ''} Poster${
                        selectedFiles.length > 1 ? 's' : ''
                      }`}
                </span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 2: POSTERS MANAGEMENT TABLE */}
      {activeTab === 'posters' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Manage Posters ({filteredPosters.length})</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Edit details, toggle publish/draft status, preview, or remove posters.
              </p>
            </div>

            {/* Search and Status Filters */}
            <div className="flex items-center gap-2">
              <div className="relative w-48">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter by title..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="py-1.5 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none cursor-pointer"
              >
                <option value="all">All Status</option>
                <option value="published">Published Only</option>
                <option value="draft">Drafts Only</option>
              </select>
            </div>
          </div>

          {/* Posters Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Poster</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Downloads</th>
                  <th className="py-3 px-4">Uploaded</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPosters.map((poster) => (
                  <tr key={poster.id} className="hover:bg-slate-50/70 transition">
                    {/* Poster Thumb & Title */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={poster.imageUrl}
                          alt={poster.title}
                          className="w-12 h-16 object-cover rounded-lg bg-slate-100 border border-slate-200 shrink-0 cursor-pointer"
                          onClick={() => onPreviewPoster(poster)}
                        />
                        <div>
                          <div
                            onClick={() => onPreviewPoster(poster)}
                            className="font-bold text-slate-900 hover:text-teal-600 cursor-pointer line-clamp-1"
                          >
                            {poster.title}
                          </div>
                          <span className="text-[10px] text-slate-400 uppercase">
                            {poster.fileFormat || 'JPG'} • {((poster.fileSize || 1024) / 1024 / 1024).toFixed(1)} MB
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700">
                        {poster.category}
                      </span>
                    </td>

                    {/* Status Toggle */}
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleTogglePublish(poster)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold transition cursor-pointer ${
                          poster.published
                            ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
                        }`}
                        title="Click to toggle status"
                      >
                        {poster.published ? (
                          <>
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span>Published</span>
                          </>
                        ) : (
                          <>
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            <span>Draft</span>
                          </>
                        )}
                      </button>
                    </td>

                    {/* Download count */}
                    <td className="py-3 px-4 font-semibold text-slate-700">
                      {poster.downloadCount.toLocaleString()}
                    </td>

                    {/* Created Date */}
                    <td className="py-3 px-4 text-slate-500">
                      {new Date(poster.createdAt).toLocaleDateString()}
                    </td>

                    {/* Action buttons */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onPreviewPoster(poster)}
                          className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                          title="Preview full image"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openEditModal(poster)}
                          className="p-1.5 text-slate-500 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition cursor-pointer"
                          title="Edit details"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setPosterToDelete(poster)}
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                          title="Delete poster"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredPosters.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-slate-400">
                      No posters found matching your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: CATEGORIES MANAGEMENT */}
      {activeTab === 'categories' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Add Category Form */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">Add New Category</h3>
            <form onSubmit={handleAddCategory} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Category Name
                </label>
                <input
                  type="text"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="e.g. Architecture &amp; Urban"
                  required
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Description
                </label>
                <textarea
                  value={newCatDesc}
                  onChange={(e) => setNewCatDesc(e.target.value)}
                  rows={2}
                  placeholder="Short overview of posters in this genre..."
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Create Category</span>
              </button>
            </form>
          </div>

          {/* Categories List */}
          <div className="md:col-span-2 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">Active Categories</h3>
            <div className="divide-y divide-slate-100">
              {categories.map((cat) => (
                <div key={cat.id} className="py-3 flex items-center justify-between gap-4">
                  <div>
                    <h4 className="font-bold text-slate-800 text-xs">{cat.name}</h4>
                    <p className="text-[11px] text-slate-400">{cat.description || 'No description provided'}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full">
                      {cat.posterCount ?? 0} posters
                    </span>
                    {cat.id !== 'all' && (
                      <button
                        onClick={() => handleDeleteCategory(cat)}
                        className="text-slate-400 hover:text-rose-600 transition p-1 cursor-pointer"
                        title="Delete category"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: ANALYTICS & TOP DOWNLOADS */}
      {activeTab === 'stats' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Download Analytics &amp; Popular Posters</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Live ranking of top posters downloaded by visitors worldwide.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {stats?.topDownloaded?.map((p, idx) => (
              <div
                key={p.id}
                onClick={() => onPreviewPoster(p)}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-4 hover:bg-slate-100/70 transition cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-slate-900 text-white font-extrabold text-xs flex items-center justify-center shrink-0">
                    #{idx + 1}
                  </div>
                  <img
                    src={p.imageUrl}
                    alt={p.title}
                    className="w-12 h-16 object-cover rounded-lg bg-slate-200 shrink-0"
                  />
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs line-clamp-1">{p.title}</h4>
                    <span className="text-[10px] text-slate-400">{p.category}</span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-sm font-extrabold text-teal-600 block">
                    {p.downloadCount.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider">Downloads</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* EDIT POSTER MODAL */}
      {editingPoster && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-base">Edit Poster Details</h3>
              <button
                onClick={() => setEditingPoster(null)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Category
                </label>
                <select
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 cursor-pointer"
                >
                  {categories
                    .filter((c) => c.id !== 'all')
                    .map((cat) => (
                      <option key={cat.id} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Description
                </label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="editPublished"
                  checked={editPublished}
                  onChange={(e) => setEditPublished(e.target.checked)}
                  className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500"
                />
                <label htmlFor="editPublished" className="text-xs font-semibold text-slate-700 cursor-pointer">
                  Published (publicly visible in gallery)
                </label>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingPoster(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow-sm"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION DIALOG */}
      {posterToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 text-center space-y-4">
            <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div>
              <h3 className="font-bold text-slate-900 text-base">Delete Poster?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to permanently delete <strong>&quot;{posterToDelete.title}&quot;</strong>? This action cannot be undone.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => setPosterToDelete(null)}
                className="py-2.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeletePoster}
                className="py-2.5 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-sm transition cursor-pointer"
              >
                Delete Forever
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
