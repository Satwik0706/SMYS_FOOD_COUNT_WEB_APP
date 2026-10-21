import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { NotificationItem } from '../types';
import { subscribeNotifications } from '../services/firestoreService';

export const HomeTab: React.FC = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  useEffect(() => {
    if (!user) return;
    const unsubscribe = subscribeNotifications(user.year, (items) => {
      setNotifications(items);
    });
    return () => unsubscribe();
  }, [user]);

  if (!user) return null;

  // Student Initial (e.g. 'S')
  const initial = user.name ? user.name.trim().charAt(0).toUpperCase() : 'S';

  // Extract year number e.g. "3rd Year" -> "3"
  const yearNumber = user.year ? user.year.replace(/\D/g, '') || '3' : '3';

  return (
    <div className="space-y-6 pb-24 pt-3">
      {/* Profile Card (Matching Screenshot 2) */}
      <div className="rounded-3xl bg-[#1A1817] border border-[#3A2218] p-5 flex items-center space-x-4 shadow-lg">
        {/* Circular Orange Initial Avatar */}
        <div className="w-16 h-16 rounded-full bg-[#FF5722] text-white flex items-center justify-center font-bold text-2xl shrink-0 shadow-md">
          {initial}
        </div>

        {/* Name and Year Tag */}
        <div>
          <p className="text-sm text-[#9E9E9E] font-medium leading-none mb-1">
            Welcome,
          </p>
          <h2 className="text-xl font-bold text-white tracking-wide uppercase leading-tight">
            {user.name}
          </h2>
          <div className="mt-2">
            <span className="inline-flex items-center justify-center px-3 py-0.5 rounded-full bg-[#3B2D0E] text-[#FFC107] font-bold text-xs">
              {yearNumber}
            </span>
          </div>
        </div>
      </div>

      {/* Announcements Section (Matching Screenshot 2) */}
      <div className="space-y-3">
        <div>
          <h3 className="text-xl font-bold text-white tracking-tight">
            Announcements
          </h3>
          <p className="text-xs text-[#888888] mt-0.5">
            Stay updated with mess alerts
          </p>
        </div>

        {/* Announcements Container */}
        {notifications.length === 0 ? (
          <div className="rounded-2xl bg-[#1F1F21] p-10 text-center border border-[#2B2B2E]">
            <p className="text-sm text-[#9E9E9E]">
              No new announcements for today.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl bg-[#1F1F21] p-4 border border-[#2B2B2E] space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-white">{item.title}</h4>
                  <span className="text-[10px] text-[#FF5722] font-semibold bg-[#2B1713] px-2 py-0.5 rounded-md">
                    {item.priority}
                  </span>
                </div>
                <p className="text-xs text-[#CCCCCC] leading-relaxed">
                  {item.message}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
