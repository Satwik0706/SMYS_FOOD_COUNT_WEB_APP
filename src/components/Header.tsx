import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut } from 'lucide-react';

export const Header: React.FC = () => {
  const { user, logout } = useAuth();

  if (!user) return null;

  // Extract first name in all caps e.g. "SATWIK"
  const firstName = user.name ? user.name.trim().split(' ')[0].toUpperCase() : 'STUDENT';

  return (
    <header className="sticky top-0 z-40 bg-[#0D0E10] px-4 pt-3 pb-2 flex items-center justify-between">
      {/* Brand & Greeting */}
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight leading-tight">
          SMYS Portal
        </h1>
        <p className="text-xs text-[#9E9E9E] mt-0.5 font-normal">
          Welcome back, {firstName}
        </p>
      </div>

      {/* Logout Action Button (Matching Native App Red Door Icon) */}
      <button
        onClick={logout}
        title="Sign Out"
        className="w-10 h-10 rounded-2xl bg-[#261214] border border-[#3E1B1D] text-[#FF5252] flex items-center justify-center hover:bg-[#321619] transition-all active:scale-95"
      >
        <LogOut className="w-5 h-5 stroke-[2]" />
      </button>
    </header>
  );
};
