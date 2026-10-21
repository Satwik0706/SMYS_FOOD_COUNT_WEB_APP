import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Header } from './components/Header';
import { BottomNav, TabType } from './components/BottomNav';
import { LoginScreen } from './components/LoginScreen';
import { HomeTab } from './components/HomeTab';
import { MenuTab } from './components/MenuTab';
import { FoodCountTab } from './components/FoodCountTab';
import { AlertsTab } from './components/AlertsTab';
import { SettingsModal } from './components/SettingsModal';
import { PwaInstallBanner } from './components/PwaInstallBanner';

const MainPortal: React.FC = () => {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFF9F3] flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-orange-500 animate-pulse mx-auto flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-orange-500/30">
            S
          </div>
          <p className="text-xs font-semibold text-slate-500 tracking-wide">
            Loading SMYS Portal...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <LoginScreen onOpenSettings={() => setIsSettingsOpen(true)} />
        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex justify-center">
      {/* Mobile-first Container (fills mobile, centered framed card on desktop) */}
      <div className="w-full max-w-md min-h-screen bg-[#FFF9F3] flex flex-col shadow-2xl relative border-x border-orange-100/60">
        {/* PWA Install Banner */}
        <PwaInstallBanner />

        {/* Top Header */}
        <Header onOpenSettings={() => setIsSettingsOpen(true)} />

        {/* Main Tab Screen Content */}
        <main className="flex-1 px-4 pt-2">
          {activeTab === 'home' && (
            <HomeTab onNavigateTab={(tab) => setActiveTab(tab)} />
          )}
          {activeTab === 'menu' && <MenuTab />}
          {activeTab === 'count' && <FoodCountTab />}
          {activeTab === 'alerts' && <AlertsTab />}
        </main>

        {/* Fixed Bottom Navigation Bar */}
        <BottomNav
          activeTab={activeTab}
          onChangeTab={(tab) => setActiveTab(tab)}
        />

        {/* Settings & Diagnostics Modal */}
        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
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
