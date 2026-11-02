import React, { useState } from 'react';
import { Shield, Lock, User, AlertCircle, ArrowLeft, KeyRound, CheckCircle2 } from 'lucide-react';
import { loginAdmin } from '../lib/api';
import { AuthState } from '../types';

interface AdminLoginProps {
  onSuccess: (token: string, user: any) => void;
  onCancel: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onSuccess, onCancel }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showHelper, setShowHelper] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Please provide both username and password.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      // Calls server-side authentication route with PBKDF2 hash comparison
      const response = await loginAdmin(username.trim(), password.trim());
      onSuccess(response.token, response.user);
    } catch (err: any) {
      setError(err.message || 'Invalid administrator credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-12 px-4 animate-fade-in">
      <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl relative overflow-hidden">
        {/* Top ambient color bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-teal-500 via-cyan-500 to-indigo-600" />

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-slate-900 text-teal-400 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-slate-900/10">
            <Shield className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Admin Portal</h1>
          <p className="text-xs text-slate-500 mt-1">
            PosterHub management &amp; publishing dashboard
          </p>
        </div>

        {/* Error notification */}
        {error && (
          <div className="mb-6 p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-2.5 text-xs text-rose-800">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1 font-medium">{error}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Admin Username
            </label>
            <div className="relative">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                autoComplete="username"
                required
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-teal-500 focus:bg-white transition"
              />
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Admin Password
              </label>
              <button
                type="button"
                onClick={() => setShowHelper(!showHelper)}
                className="text-[11px] text-teal-600 hover:text-teal-700 font-medium cursor-pointer"
              >
                {showHelper ? 'Hide hint' : 'Show hint'}
              </button>
            </div>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••"
                autoComplete="current-password"
                required
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-teal-500 focus:bg-white transition"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>

            {showHelper && (
              <div className="mt-2 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-600 space-y-1">
                <p>
                  <strong>Username:</strong> <code className="bg-slate-200 px-1 rounded">admin</code>
                </p>
                <p>
                  <strong>Password:</strong> Case-insensitive verification configured on the server.
                </p>
              </div>
            )}
          </div>

          {/* Security notice */}
          <div className="pt-2 flex items-center gap-1.5 text-[11px] text-slate-400">
            <KeyRound className="w-3.5 h-3.5 text-teal-600 shrink-0" />
            <span>Secured via PBKDF2 server-side session token</span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-slate-900 hover:bg-slate-800 active:scale-[0.99] text-white font-bold text-sm rounded-xl shadow-lg shadow-slate-900/10 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Shield className="w-4 h-4 text-teal-400" />
                <span>Sign In to Dashboard</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
          <button
            onClick={onCancel}
            className="text-slate-500 hover:text-slate-800 flex items-center gap-1 transition cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Public Gallery</span>
          </button>
        </div>
      </div>
    </div>
  );
};
