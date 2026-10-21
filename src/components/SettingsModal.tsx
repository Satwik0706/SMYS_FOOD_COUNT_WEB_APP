import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  saveCustomFirebaseConfig,
  resetFirebaseConfig
} from '../services/firebaseConfig';
import { updateActiveLockStatus } from '../services/firestoreService';
import {
  X,
  Database,
  Smartphone,
  PhoneCall,
  Sliders,
  ShieldAlert,
  CheckCircle,
  ExternalLink,
  RotateCcw,
  Save,
  Share2
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { lockStatus, adminWhatsApp, setAdminWhatsApp, firebaseStatus } = useAuth();

  const [whatsAppInput, setWhatsAppInput] = useState(adminWhatsApp);
  const [activeTab, setActiveTab] = useState<'firebase' | 'lockSimulator' | 'pwa'>('firebase');

  // Firebase Config Form State
  const [apiKey, setApiKey] = useState(() => {
    try {
      const saved = localStorage.getItem('smys_firebase_config');
      return saved ? JSON.parse(saved).apiKey || '' : import.meta.env.VITE_FIREBASE_API_KEY || '';
    } catch {
      return '';
    }
  });

  const [projectId, setProjectId] = useState(() => {
    try {
      const saved = localStorage.getItem('smys_firebase_config');
      return saved ? JSON.parse(saved).projectId || 'smys-food-count-b378a' : 'smys-food-count-b378a';
    } catch {
      return 'smys-food-count-b378a';
    }
  });

  const [authDomain, setAuthDomain] = useState(() => {
    try {
      const saved = localStorage.getItem('smys_firebase_config');
      return saved ? JSON.parse(saved).authDomain || `${projectId}.firebaseapp.com` : `${projectId}.firebaseapp.com`;
    } catch {
      return `${projectId}.firebaseapp.com`;
    }
  });

  const [appId, setAppId] = useState(() => {
    try {
      const saved = localStorage.getItem('smys_firebase_config');
      return saved ? JSON.parse(saved).appId || '' : '';
    } catch {
      return '';
    }
  });

  if (!isOpen) return null;

  const handleSaveWhatsApp = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminWhatsApp(whatsAppInput);
    alert('Admin WhatsApp number updated successfully!');
  };

  const handleSaveFirebaseConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim()) {
      alert('Please enter a valid Firebase API Key.');
      return;
    }

    saveCustomFirebaseConfig({
      apiKey: apiKey.trim(),
      authDomain: authDomain.trim(),
      projectId: projectId.trim(),
      storageBucket: `${projectId.trim()}.appspot.com`,
      messagingSenderId: '',
      appId: appId.trim()
    });
  };

  const handleResetFirebase = () => {
    if (confirm('Reset to default config?')) {
      resetFirebaseConfig();
    }
  };

  // Lock status toggle simulation for admin testing
  const handleToggleLock = (key: keyof typeof lockStatus) => {
    updateActiveLockStatus({
      [key]: !lockStatus[key]
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white w-full max-w-md rounded-3xl p-5 sm:p-6 shadow-2xl border border-orange-100 relative max-h-[90vh] flex flex-col">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <Sliders className="w-5 h-5 text-orange-500" />
            <h3 className="font-bold text-slate-800 text-base">
              Portal Settings & Diagnostic
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Pills */}
        <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-2xl my-3 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('firebase')}
            className={`py-2 rounded-xl transition-all ${
              activeTab === 'firebase'
                ? 'bg-white text-orange-600 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Firebase DB
          </button>
          <button
            onClick={() => setActiveTab('lockSimulator')}
            className={`py-2 rounded-xl transition-all ${
              activeTab === 'lockSimulator'
                ? 'bg-white text-orange-600 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Lock Simulator
          </button>
          <button
            onClick={() => setActiveTab('pwa')}
            className={`py-2 rounded-xl transition-all ${
              activeTab === 'pwa'
                ? 'bg-white text-orange-600 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            iOS PWA
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto pr-1 flex-1 space-y-4">
          {/* TAB 1: Firebase & WhatsApp Config */}
          {activeTab === 'firebase' && (
            <div className="space-y-4">
              {/* Connection Status Box */}
              <div
                className={`p-3.5 rounded-2xl border text-xs ${
                  firebaseStatus.isConfigured
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-amber-50 border-amber-200 text-amber-800'
                }`}
              >
                <div className="flex items-center space-x-2 font-bold mb-1">
                  <Database className="w-4 h-4" />
                  <span>
                    Status: {firebaseStatus.isConfigured ? 'Firebase Active' : 'Connected Store Mode'}
                  </span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  Project: <strong>{firebaseStatus.projectId}</strong>
                </p>
                <p className="text-[11px] opacity-90 mt-0.5">{firebaseStatus.message}</p>
              </div>

              {/* Admin WhatsApp Number Setting */}
              <form onSubmit={handleSaveWhatsApp} className="space-y-2 pt-1 border-t border-slate-100">
                <label className="block text-xs font-semibold text-slate-700">
                  Hostel Admin WhatsApp Number
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={whatsAppInput}
                    onChange={(e) => setWhatsAppInput(e.target.value)}
                    placeholder="e.g. 919876543210 (with country code)"
                    className="flex-1 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                  />
                  <button
                    type="submit"
                    className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs"
                  >
                    Save
                  </button>
                </div>
                <p className="text-[10px] text-slate-400">
                  Used by the "Send to WhatsApp" button for missed food count requests.
                </p>
              </form>

              {/* Firebase Credentials Config */}
              <form onSubmit={handleSaveFirebaseConfig} className="space-y-3 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800">
                    Custom Firebase Web SDK Keys
                  </label>
                  <button
                    type="button"
                    onClick={handleResetFirebase}
                    className="text-[10px] text-rose-600 hover:underline flex items-center space-x-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset</span>
                  </button>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">
                    API Key
                  </label>
                  <input
                    type="text"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="AIzaSy..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">
                    Project ID
                  </label>
                  <input
                    type="text"
                    value={projectId}
                    onChange={(e) => setProjectId(e.target.value)}
                    placeholder="smys-food-count-b378a"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">
                    Auth Domain
                  </label>
                  <input
                    type="text"
                    value={authDomain}
                    onChange={(e) => setAuthDomain(e.target.value)}
                    placeholder="smys-food-count-b378a.firebaseapp.com"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 px-4 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold text-xs shadow-xs flex items-center justify-center space-x-1.5 transition-all"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Keys & Connect</span>
                </button>
              </form>
            </div>
          )}

          {/* TAB 2: Lock Simulator (Test Rule C in real-time) */}
          {activeTab === 'lockSimulator' && (
            <div className="space-y-3">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 leading-relaxed">
                <strong>Rule C Lock Testing Tool:</strong> Toggle locks below to test how the Food Count screen and banners behave under different admin constraints.
              </div>

              {/* Master Lock */}
              <div className="p-3 rounded-2xl border border-rose-200 bg-rose-50/50 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-xs text-rose-950">Master Lock (locked)</h4>
                  <p className="text-[10px] text-rose-700">Closes entire submission window</p>
                </div>
                <button
                  onClick={() => handleToggleLock('locked')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    lockStatus.locked
                      ? 'bg-rose-600 text-white'
                      : 'bg-white text-slate-600 border border-slate-200'
                  }`}
                >
                  {lockStatus.locked ? 'LOCKED' : 'OPEN'}
                </button>
              </div>

              {/* Breakfast Lock */}
              <div className="p-3 rounded-2xl border border-orange-200 bg-orange-50/40 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-xs text-orange-950">Breakfast Lock</h4>
                  <p className="text-[10px] text-orange-700">breakfastLocked</p>
                </div>
                <button
                  onClick={() => handleToggleLock('breakfastLocked')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    lockStatus.breakfastLocked
                      ? 'bg-orange-600 text-white'
                      : 'bg-white text-slate-600 border border-slate-200'
                  }`}
                >
                  {lockStatus.breakfastLocked ? 'LOCKED' : 'OPEN'}
                </button>
              </div>

              {/* Lunch Lock */}
              <div className="p-3 rounded-2xl border border-emerald-200 bg-emerald-50/40 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-xs text-emerald-950">Lunch Lock</h4>
                  <p className="text-[10px] text-emerald-700">lunchLocked</p>
                </div>
                <button
                  onClick={() => handleToggleLock('lunchLocked')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    lockStatus.lunchLocked
                      ? 'bg-emerald-600 text-white'
                      : 'bg-white text-slate-600 border border-slate-200'
                  }`}
                >
                  {lockStatus.lunchLocked ? 'LOCKED' : 'OPEN'}
                </button>
              </div>

              {/* Snack Lock */}
              <div className="p-3 rounded-2xl border border-purple-200 bg-purple-50/40 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-xs text-purple-950">Snacks Lock</h4>
                  <p className="text-[10px] text-purple-700">snackLocked</p>
                </div>
                <button
                  onClick={() => handleToggleLock('snackLocked')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    lockStatus.snackLocked
                      ? 'bg-purple-600 text-white'
                      : 'bg-white text-slate-600 border border-slate-200'
                  }`}
                >
                  {lockStatus.snackLocked ? 'LOCKED' : 'OPEN'}
                </button>
              </div>

              {/* Dinner Lock */}
              <div className="p-3 rounded-2xl border border-blue-200 bg-blue-50/40 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-xs text-blue-950">Dinner Lock</h4>
                  <p className="text-[10px] text-blue-700">dinnerLocked</p>
                </div>
                <button
                  onClick={() => handleToggleLock('dinnerLocked')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    lockStatus.dinnerLocked
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-slate-600 border border-slate-200'
                  }`}
                >
                  {lockStatus.dinnerLocked ? 'LOCKED' : 'OPEN'}
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: iOS Safari PWA Instructions */}
          {activeTab === 'pwa' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-slate-700 space-y-3">
                <div className="flex items-center space-x-2 text-amber-900 font-bold">
                  <Smartphone className="w-4 h-4 text-orange-600" />
                  <span>How to Install on iPhone / Safari:</span>
                </div>

                <ol className="list-decimal pl-4 space-y-2 text-xs text-slate-600">
                  <li>
                    Open this URL in <strong>Apple Safari</strong> on your iPhone.
                  </li>
                  <li>
                    Tap the <strong>Share</strong> button (the square with an arrow pointing upward) in the bottom toolbar.
                  </li>
                  <li>
                    Scroll down and tap <strong>"Add to Home Screen"</strong>.
                  </li>
                  <li>
                    Tap <strong>"Add"</strong> in the top right corner. The SMYS Food Count app icon will now appear on your iPhone home screen!
                  </li>
                </ol>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-2">
                <h4 className="font-bold text-slate-800">Android / Chrome Users:</h4>
                <p>
                  Chrome will automatically show an "Install App" banner or tap the three dots in the top right and select "Install app".
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
