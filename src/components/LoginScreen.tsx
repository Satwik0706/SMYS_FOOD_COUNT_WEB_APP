import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  User,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Info,
  Smartphone
} from 'lucide-react';

interface LoginScreenProps {
  onOpenSettings: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onOpenSettings }) => {
  const { login, useDemoAccount, firebaseStatus } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password.trim()) {
      setErrorMsg('Please enter your Email, Admin ID, or Roll Number and password.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    try {
      await login(identifier, password);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = () => {
    useDemoAccount();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50/70 via-white to-amber-50/40 flex flex-col justify-between p-4 sm:p-6">
      {/* Top Banner / Status */}
      <div className="max-w-md w-full mx-auto flex items-center justify-between text-xs text-slate-500 pt-2">
        <div className="flex items-center space-x-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="font-medium text-slate-600">SMYS Portal v2.0</span>
        </div>
        <button
          onClick={onOpenSettings}
          className="text-orange-600 hover:text-orange-700 font-medium underline flex items-center space-x-1"
        >
          <Info className="w-3.5 h-3.5" />
          <span>Firebase Setup</span>
        </button>
      </div>

      {/* Main Card */}
      <div className="max-w-md w-full mx-auto my-auto pt-4 pb-8">
        {/* Brand Emblem & Welcome */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-400 p-0.5 shadow-xl shadow-orange-500/25 flex items-center justify-center text-white">
            <div className="w-full h-full bg-gradient-to-tr from-amber-600 to-orange-500 rounded-[14px] flex flex-col items-center justify-center">
              <span className="font-extrabold text-2xl tracking-wider text-white">SMYS</span>
              <span className="text-[9px] uppercase tracking-widest text-orange-100 font-semibold">MESS</span>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
            Student Mess Portal
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
            Daily food count preferences, live mess menus, and hostel announcements
          </p>
        </div>

        {/* Card Form */}
        <div className="bg-white/90 backdrop-blur-md rounded-3xl p-6 sm:p-7 shadow-[0_10px_30px_rgba(255,152,0,0.08)] border border-orange-100/80">
          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-start space-x-2 animate-shake">
              <span className="mt-0.5 font-bold">!</span>
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Unified Identifier Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Sign in with Email, Admin ID, or Roll No
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="e.g. rahul@smys.edu or 22CS104"
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-all placeholder:text-slate-400"
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1 pl-1">
                Accepted: Institutional Email, Student Admin ID (SMYS-XXX), or Roll Number
              </p>
            </div>

            {/* Password Input */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Password
                </label>
                <span className="text-[11px] text-orange-600 font-medium">Internal Verification</span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your student password"
                  required
                  className="w-full pl-10 pr-10 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-all placeholder:text-slate-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold text-sm shadow-md shadow-orange-500/25 flex items-center justify-center space-x-2 transition-all active:scale-[0.99] disabled:opacity-70"
            >
              {loading ? (
                <span>Signing in...</span>
              ) : (
                <>
                  <span>Sign In to Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Login Option */}
          <div className="mt-5 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={handleQuickDemo}
              className="w-full py-2.5 px-3 rounded-xl bg-amber-50 hover:bg-amber-100/80 text-amber-900 border border-amber-200/80 font-medium text-xs flex items-center justify-center space-x-2 transition-colors"
            >
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>Explore as Demo Student (Rahul Sharma, 3rd Year)</span>
            </button>
          </div>
        </div>

        {/* Database & PWA Info Badge */}
        <div className="mt-5 p-3 rounded-2xl bg-white/70 border border-orange-100 text-slate-500 text-xs flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span className="text-[11px]">
              DB: <strong className="text-slate-700">{firebaseStatus.projectId}</strong>
            </span>
          </div>
          <div className="flex items-center space-x-1 text-[11px] text-orange-700 font-medium">
            <Smartphone className="w-3.5 h-3.5" />
            <span>PWA Ready</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="max-w-md w-full mx-auto text-center text-[11px] text-slate-400 pb-2">
        SMYS Hostel Food Management System • Mobile Web Portal
      </footer>
    </div>
  );
};
