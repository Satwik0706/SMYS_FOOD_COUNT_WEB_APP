import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { NotificationItem } from '../types';
import { subscribeNotifications } from '../services/firestoreService';

export const AlertsTab: React.FC = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  useEffect(() => {
    if (!user) return;
    const unsubscribe = subscribeNotifications(user.year, (items) => {
      setNotifications(items);
    });
    return () => unsubscribe();
  }, [user]);

  return (
    <div className="space-y-6 pb-24 pt-3">
      {/* Title Header (Matching Screenshot 1) */}
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">
          Notifications
        </h2>
        <p className="text-xs text-[#888888] mt-0.5">
          Mess announcements and alerts
        </p>
      </div>

      {/* Notifications Body (Matching Screenshot 1) */}
      {notifications.length === 0 ? (
        <div className="py-36 text-center">
          <p className="text-base text-[#888888] font-normal">
            No notifications yet.
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
  );
};
