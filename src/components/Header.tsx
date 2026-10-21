import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, Settings, Clock, ShieldCheck, ShieldAlert, Sparkles } from 'lucide-react';

interface HeaderProps {
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSettings }) => {
  const { user, logout, lockStatus, firebaseStatus } = useAuth();
  const [timeStr, setTimeStr] = useState<string>('');
  const [countdownStr, setCountdownStr] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );

      // Calculate time until 7:40 PM (19:40)
      const target = new Date();
      target.setHours(19, 40, 0, 0);

      // If already past 19:40 today, next lock is tomorrow 19:40
      if (now.getTime() > target.getTime()) {
        target.setDate(target.getDate() + 1);
      }

      const diffMs = target.getTime() - now.getTime();
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const diffSecs = Math.floor((diffMs % (1000 * 60)) / 1000);

      setCountdownStr(
        `${String(diffHours).padStart(2, '0')}:${String(diffMins).padStart(2, '0')}:${String(diffSecs).padStart(2, '0')}`
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-orange-100/80 shadow-xs">
      <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
        {/* Brand & Emblem */}
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-400 flex items-center justify-center text-white shadow-md shadow-orange-500/20">
              <span className="font-extrabold text-base tracking-tight font-sans">SMYS</span>
            </div>
            {/* Live Indicator Pill */}
            <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border-2 border-white"></span>
            </span>
          </div>

          <div>
            <div className="flex items-center space-x-1.5">
              <h1 className="text-base font-bold text-slate-800 tracking-tight leading-tight">
                SMYS Portal
              </h1>
              <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded-full bg-orange-100 text-orange-700">
                Hostel Mess
              </span>
            </div>
            <div className="flex items-center space-x-1.5 text-xs text-slate-500 mt-0.5">
              <Clock className="w-3 h-3 text-orange-500" />
              <span className="font-medium text-[11px] text-slate-600">{timeStr || '19:40 Lock'}</span>
              <span className="text-slate-300">•</span>
              <span className="text-[11px] font-mono text-amber-700 font-semibold" title="Time to 7:40 PM lock">
                {countdownStr} left
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-1">
          {/* Lock Status Pill */}
          <div
            className={`hidden sm:flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-semibold ${
              lockStatus.locked
                ? 'bg-rose-100 text-rose-700'
                : 'bg-emerald-100 text-emerald-700'
            }`}
          >
            {lockStatus.locked ? (
              <ShieldAlert className="w-3.5 h-3.5" />
            ) : (
              <ShieldCheck className="w-3.5 h-3.5" />
            )}
            <span>{lockStatus.locked ? 'Locked' : 'Open'}</span>
          </div>

          {/* Settings / Config Button */}
          <button
            onClick={onOpenSettings}
            title="Firebase & Portal Settings"
            className="p-2 rounded-xl text-slate-500 hover:text-orange-600 hover:bg-orange-50 transition-colors"
          >
            <Settings className="w-5 h-5" />
          </button>

          {/* Logout Button */}
          {user && (
            <button
              onClick={logout}
              title="Sign Out"
              className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
            >
              <LogOut className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
