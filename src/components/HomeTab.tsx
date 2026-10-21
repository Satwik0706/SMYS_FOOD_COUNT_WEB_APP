import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { NotificationItem, StudentUser } from '../types';
import { subscribeNotifications } from '../services/firestoreService';
import { formatTimeAgo, getInitialDate, formatDateKey, formatDisplayDate } from '../utils/rules';
import {
  Bell,
  CalendarCheck,
  Utensils,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  Sparkles,
  CheckCircle2,
  XCircle,
  MessageCircle,
  Bookmark
} from 'lucide-react';
import { TabType } from './BottomNav';

interface HomeTabProps {
  onNavigateTab: (tab: TabType) => void;
}

export const HomeTab: React.FC<HomeTabProps> = ({ onNavigateTab }) => {
  const { user, lockStatus, adminWhatsApp } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [initialDate] = useState<Date>(() => getInitialDate());

  useEffect(() => {
    if (!user) return;
    const unsubscribe = subscribeNotifications(user.year, (items) => {
      setNotifications(items);
    });
    return () => unsubscribe();
  }, [user]);

  if (!user) return null;

  // Student initial for circular badge
  const initial = user.name ? user.name.trim().charAt(0).toUpperCase() : 'S';
  const targetDateInfo = formatDisplayDate(initialDate);

  // Active meals summary
  const mealsOptedCount = [
    user.breakfastPref,
    user.lunchPref,
    user.snackPref,
    user.dinnerPref
  ].filter(Boolean).length;

  return (
    <div className="space-y-4 pb-20 pt-2">
      {/* Hero Greeting Card */}
      <div className="rounded-3xl bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 p-5 text-white shadow-lg shadow-orange-500/20 relative overflow-hidden">
        {/* Subtle background decoration */}
        <div className="absolute -top-12 -right-12 w-40 h-40 bg-white/10 rounded-full blur-xl pointer-events-none" />
        <div className="absolute bottom-0 right-4 w-24 h-24 bg-amber-400/20 rounded-full blur-lg pointer-events-none" />

        <div className="relative z-10 flex items-start justify-between">
          <div className="flex items-center space-x-3.5">
            {/* Circular Orange Badge Initial Avatar */}
            <div className="w-14 h-14 rounded-2xl bg-white text-orange-600 flex items-center justify-center font-extrabold text-2xl shadow-md border-2 border-orange-200">
              {initial}
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs uppercase font-bold tracking-wider text-orange-100">
                  Student Portal
                </span>
                {/* Year Tag Chip */}
                <span className="px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-semibold text-white border border-white/30">
                  {user.year}
                </span>
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight mt-0.5">
                Welcome, {user.name}
              </h2>
              <div className="flex items-center space-x-2 text-xs text-orange-100/90 mt-1">
                <span>Roll: {user.rollNumber}</span>
                <span>•</span>
                <span>ID: {user.adminId}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Meal Status Bar */}
        <div className="mt-4 pt-3 border-t border-white/20 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-1.5">
            <span className="text-orange-100">Default Target:</span>
            <strong className="text-white font-semibold">{targetDateInfo.main}</strong>
          </div>
          <div className="flex items-center space-x-1.5">
            {user.isLeave ? (
              <span className="px-2 py-0.5 rounded-full bg-rose-500/90 text-white font-bold text-[10px] uppercase tracking-wider">
                On Leave
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/90 text-white font-bold text-[10px] uppercase tracking-wider">
                {mealsOptedCount}/4 Meals Opted
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Quick Action Tiles */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => onNavigateTab('count')}
          className="p-4 rounded-2xl bg-white border border-orange-100/80 shadow-xs hover:border-orange-300 hover:shadow-md transition-all text-left group"
        >
          <div className="w-9 h-9 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
            <CalendarCheck className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-800 text-sm flex items-center justify-between">
            <span>Food Count</span>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-orange-500 group-hover:translate-x-0.5 transition-all" />
          </h3>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Set breakfast, lunch & dinner count
          </p>
        </button>

        <button
          onClick={() => onNavigateTab('menu')}
          className="p-4 rounded-2xl bg-white border border-emerald-100/80 shadow-xs hover:border-emerald-300 hover:shadow-md transition-all text-left group"
        >
          <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
            <Utensils className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-800 text-sm flex items-center justify-between">
            <span>Daily Menu</span>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-500 group-hover:translate-x-0.5 transition-all" />
          </h3>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Check today & tomorrow meal items
          </p>
        </button>
      </div>

      {/* Lock Status Reminder if Locked */}
      {lockStatus.locked && (
        <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start space-x-3">
          <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="text-xs">
            <h4 className="font-bold text-rose-900">Submission Window Closed</h4>
            <p className="text-rose-700 mt-0.5">
              The Master Food Count lock is currently active. Further changes are restricted by mess administration.
            </p>
          </div>
        </div>
      )}

      {/* Announcements Feed Header */}
      <div className="pt-2">
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center space-x-2">
            <div className="p-1 rounded-lg bg-orange-100 text-orange-600">
              <Bell className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-slate-800 text-sm">
              Live Announcements
            </h3>
          </div>
          <span className="text-[11px] font-semibold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-100">
            For {user.year} & All
          </span>
        </div>

        {/* Real-time Announcements List */}
        <div className="space-y-3">
          {notifications.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-slate-200/80 text-slate-400 text-xs">
              No recent announcements posted yet.
            </div>
          ) : (
            notifications.map((item) => {
              const isHighPriority = item.priority === 'HIGH';

              return (
                <div
                  key={item.id}
                  className={`p-4 rounded-2xl bg-white border transition-all shadow-xs ${
                    isHighPriority
                      ? 'border-rose-200/90 hover:border-rose-300'
                      : 'border-slate-200/80 hover:border-blue-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      {/* Priority Badge */}
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          isHighPriority
                            ? 'bg-rose-100 text-rose-700 border border-rose-200'
                            : 'bg-blue-100 text-blue-700 border border-blue-200'
                        }`}
                      >
                        {isHighPriority ? 'High Priority' : 'Normal'}
                      </span>

                      {/* Year Target Chip */}
                      <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-md">
                        {item.targetYear}
                      </span>
                    </div>

                    <span className="text-[10px] text-slate-400 shrink-0">
                      {formatTimeAgo(item.timestamp)}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-800 mt-2">
                    {item.title}
                  </h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {item.message}
                  </p>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Admin WhatsApp Help Desk Banner */}
      <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-xs">
            <MessageCircle className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-xs text-emerald-950">Mess Admin WhatsApp Desk</h4>
            <p className="text-[11px] text-emerald-700">Need special meal permission or leave adjustments?</p>
          </div>
        </div>
        <a
          href={`https://wa.me/${adminWhatsApp}?text=${encodeURIComponent(
            `Hi Admin, I am ${user.name} (Roll: ${user.rollNumber}, Year: ${user.year}). I have a query regarding SMYS hostel mess.`
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs flex items-center space-x-1 transition-all"
        >
          <span>Chat</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
};
