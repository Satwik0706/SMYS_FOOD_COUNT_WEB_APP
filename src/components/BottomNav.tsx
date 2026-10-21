import React from 'react';
import { Home, ShoppingCart, CalendarDays, Bell } from 'lucide-react';

export type TabType = 'home' | 'menu' | 'attendance' | 'alerts';

interface BottomNavProps {
  activeTab: TabType;
  onChangeTab: (tab: TabType) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onChangeTab }) => {
  const tabs = [
    {
      id: 'home' as TabType,
      label: 'Home',
      icon: Home
    },
    {
      id: 'menu' as TabType,
      label: 'Menu',
      icon: ShoppingCart
    },
    {
      id: 'attendance' as TabType,
      label: 'Attendance',
      icon: CalendarDays
    },
    {
      id: 'alerts' as TabType,
      label: 'Alerts',
      icon: Bell
    }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#0D0E10] border-t border-[#1C1E22] py-2 px-3">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onChangeTab(tab.id)}
              className="flex flex-col items-center justify-center min-w-[64px] transition-all"
            >
              <div
                className={`flex items-center justify-center rounded-full transition-all ${
                  isActive
                    ? 'w-16 h-8 bg-[#8B2D08] text-white shadow-xs'
                    : 'w-10 h-8 text-[#888888]'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.2] text-white' : 'stroke-[1.8]'}`} />
              </div>

              <span
                className={`text-[11px] font-semibold mt-1 tracking-tight ${
                  isActive ? 'text-[#FF9800]' : 'text-[#888888]'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
