import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { NotificationItem } from '../types';
import { subscribeNotifications } from '../services/firestoreService';
import { formatTimeAgo } from '../utils/rules';
import {
  Bell,
  Search,
  Filter,
  AlertCircle,
  Clock,
  Info,
  Calendar,
  Sparkles
} from 'lucide-react';

export const AlertsTab: React.FC = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [filterType, setFilterType] = useState<'ALL' | 'HIGH' | 'NORMAL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!user) return;
    const unsubscribe = subscribeNotifications(user.year, (items) => {
      setNotifications(items);
    });
    return () => unsubscribe();
  }, [user]);

  if (!user) return null;

  const filteredNotifs = notifications.filter((item) => {
    // Priority filter
    if (filterType === 'HIGH' && item.priority !== 'HIGH') return false;
    if (filterType === 'NORMAL' && item.priority !== 'NORMAL') return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        item.message.toLowerCase().includes(q) ||
        item.targetYear.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-4 pb-20 pt-2">
      {/* Header */}
      <div className="bg-white rounded-3xl p-4 shadow-xs border border-orange-100 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-orange-100 text-orange-600">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">
                Mess Announcements & Alerts
              </h2>
              <p className="text-[11px] text-slate-500">
                Live stream filtered for <strong>{user.year}</strong> & <strong>All Batches</strong>
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full border border-orange-200">
            {filteredNotifs.length} Notices
          </span>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notifications or topics..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all placeholder:text-slate-400"
          />
        </div>

        {/* Priority Filter Tabs */}
        <div className="flex items-center space-x-1.5 pt-1">
          <button
            onClick={() => setFilterType('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filterType === 'ALL'
                ? 'bg-orange-500 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Notices
          </button>
          <button
            onClick={() => setFilterType('HIGH')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filterType === 'HIGH'
                ? 'bg-rose-500 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            High Priority
          </button>
          <button
            onClick={() => setFilterType('NORMAL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filterType === 'NORMAL'
                ? 'bg-blue-500 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Normal
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifs.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 text-center border border-slate-200 text-slate-400 text-xs">
            <Bell className="w-8 h-8 mx-auto mb-2 text-slate-300" />
            <p>No announcements found matching your filter.</p>
          </div>
        ) : (
          filteredNotifs.map((item) => {
            const isHigh = item.priority === 'HIGH';

            return (
              <div
                key={item.id}
                className={`p-4 rounded-3xl bg-white border transition-all shadow-xs ${
                  isHigh
                    ? 'border-rose-200 hover:border-rose-300 shadow-rose-500/5'
                    : 'border-slate-200/90 hover:border-blue-200'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        isHigh
                          ? 'bg-rose-100 text-rose-700 border border-rose-200'
                          : 'bg-blue-100 text-blue-700 border border-blue-200'
                      }`}
                    >
                      {isHigh ? 'High Priority' : 'Normal'}
                    </span>

                    <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                      Batch: {item.targetYear}
                    </span>
                  </div>

                  <span className="text-[10px] text-slate-400 shrink-0 font-medium">
                    {formatTimeAgo(item.timestamp)}
                  </span>
                </div>

                <h3 className="font-bold text-slate-800 text-sm mt-2.5">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  {item.message}
                </p>

                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>Hostel Mess Circular</span>
                  </span>
                  <span className="text-orange-600 font-medium">SMYS Verified</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
