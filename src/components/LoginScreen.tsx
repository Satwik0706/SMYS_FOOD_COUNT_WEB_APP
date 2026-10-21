import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Lock, Eye, EyeOff } from 'lucide-react';

export const LoginScreen: React.FC = () => {
  const { login, loginWithDemoAccount } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password.trim()) {
      setErrorMsg('Please enter your Email or User ID and password.');
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#24130A] via-[#121110] to-[#0D0E10] flex flex-col justify-between px-5 py-8">
      {/* Top Title */}
      <div className="text-center pt-8">
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Shri Madhwa Yuvaka Sangha
        </h1>
        <p className="text-sm font-semibold text-[#FF5722] mt-1.5 tracking-wide">
          Food Count Portal
        </p>
      </div>

      {/* Main Login Card (Matching Screenshot 3) */}
      <div className="w-full max-w-sm mx-auto my-auto">
        <div className="bg-[#17181A] rounded-3xl p-6 sm:p-7 border border-[#232528] shadow-2xl">
          <h2 className="text-xl font-bold text-white text-center mb-6">
            Welcome Back
          </h2>

          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Input 1: Email or User ID */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#FF5722]">
                <User className="w-5 h-5" />
              </div>
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="Email or User ID"
                required
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-[#25272B] border border-transparent text-sm text-white placeholder:text-[#888888] focus:outline-none focus:border-[#FF5722] focus:ring-1 focus:ring-[#FF5722] transition-all"
              />
            </div>

            {/* Input 2: Password */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#FF5722]">
                <Lock className="w-5 h-5" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
                className="w-full pl-12 pr-12 py-3.5 rounded-2xl bg-[#25272B] border border-transparent text-sm text-white placeholder:text-[#888888] focus:outline-none focus:border-[#FF5722] focus:ring-1 focus:ring-[#FF5722] transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-[#FF5722] hover:opacity-80"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-3 py-4 rounded-2xl bg-[#FF5722] hover:bg-[#F4511E] text-white font-bold text-base shadow-lg shadow-[#FF5722]/20 transition-all active:scale-[0.98] disabled:opacity-70 cursor-pointer"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>

            <button
              type="button"
              onClick={loginWithDemoAccount}
              className="w-full mt-2.5 py-3 rounded-2xl bg-[#1C1E22] hover:bg-[#25282E] text-[#FF9800] border border-[#FF9800]/20 font-semibold text-xs tracking-wide transition-all active:scale-[0.98] cursor-pointer"
            >
              ⚡ Instant Demo Student Mode
            </button>
          </form>
        </div>

        {/* Links below card */}
        <div className="text-center mt-6 space-y-3">
          <div>
            <button
              type="button"
              onClick={() => alert('Please contact the hostel mess administrator to reset your password.')}
              className="text-sm font-semibold text-[#FF5722] hover:underline"
            >
              Forgot Password?
            </button>
          </div>
          <div>
            <span className="text-xs text-[#777777]">
              Privacy Policy
            </span>
          </div>
        </div>
      </div>

      <div className="text-center text-[11px] text-[#555555]">
        SMYS Hostel Food Management System
      </div>
    </div>
  );
};
