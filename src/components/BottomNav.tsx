import React from 'react';
import { Home, Utensils, CalendarCheck, Bell } from 'lucide-react';

export type TabType = 'home' | 'menu' | 'count' | 'alerts';

interface BottomNavProps {
  activeTab: TabType;
  onChangeTab: (tab: TabType) => void;
  unreadAlertsCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onChangeTab,
  unreadAlertsCount = 0
}) => {
  const tabs = [
    {
      id: 'home' as TabType,
      label: 'Home',
      icon: Home,
      badge: null
    },
    {
      id: 'menu' as TabType,
      label: 'Mess Menu',
      icon: Utensils,
      badge: null
    },
    {
      id: 'count' as TabType,
      label: 'Food Count',
      icon: CalendarCheck,
      badge: 'Live'
    },
    {
      id: 'alerts' as TabType,
      label: 'Alerts',
      icon: Bell,
      badge: unreadAlertsCount > 0 ? unreadAlertsCount : null
    }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200/80 shadow-[0_-4px_16px_rgba(0,0,0,0.04)]">
      <div className="max-w-md mx-auto px-3 py-1 flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onChangeTab(tab.id)}
              className={`relative flex flex-col items-center justify-center py-2 px-3 rounded-2xl transition-all duration-200 ${
                isActive
                  ? 'text-orange-600 font-semibold'
                  : 'text-slate-500 hover:text-slate-800 font-medium'
              }`}
            >
              <div className="relative">
                <div
                  className={`p-1 rounded-xl transition-all ${
                    isActive ? 'bg-orange-100 scale-105 shadow-xs' : 'bg-transparent'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
                </div>

                {/* Badge if any */}
                {tab.badge && (
                  <span
                    className={`absolute -top-1 -right-2 text-[10px] font-bold px-1.5 py-0.2 rounded-full ring-2 ring-white ${
                      typeof tab.badge === 'string'
                        ? 'bg-orange-500 text-white'
                        : 'bg-rose-500 text-white'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </div>

              <span className={`text-[11px] mt-1 tracking-tight ${isActive ? 'text-orange-600' : 'text-slate-500'}`}>
                {tab.label}
              </span>

              {/* Active Underline Pill */}
              {isActive && (
                <span className="w-4 h-1 bg-orange-500 rounded-full mt-0.5 animate-pulse-subtle" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
