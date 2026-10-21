import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Header } from './components/Header';
import { BottomNav, TabType } from './components/BottomNav';
import { LoginScreen } from './components/LoginScreen';
import { HomeTab } from './components/HomeTab';
import { MenuTab } from './components/MenuTab';
import { FoodCountTab } from './components/FoodCountTab';
import { AlertsTab } from './components/AlertsTab';

const MainPortal: React.FC = () => {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('home');

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0D0E10] flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#FF5722] animate-pulse mx-auto flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-[#FF5722]/30">
            S
          </div>
          <p className="text-xs font-semibold text-[#888888] tracking-wide">
            Loading SMYS Portal...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginScreen />;
  }

  return (
    <div className="min-h-screen bg-black flex justify-center">
      {/* Mobile-first Container (matching native dark app) */}
      <div className="w-full max-w-md min-h-screen bg-[#0D0E10] flex flex-col relative border-x border-[#1C1E22]">
        {/* Top Header */}
        <Header />

        {/* Main Tab Screen Content */}
        <main className="flex-1 px-4 pt-1">
          {activeTab === 'home' && <HomeTab />}
          {activeTab === 'menu' && <MenuTab />}
          {activeTab === 'attendance' && <FoodCountTab />}
          {activeTab === 'alerts' && <AlertsTab />}
        </main>

        {/* Fixed Bottom Navigation Bar */}
        <BottomNav
          activeTab={activeTab}
          onChangeTab={(tab) => setActiveTab(tab)}
        />
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainPortal />
    </AuthProvider>
  );
}
