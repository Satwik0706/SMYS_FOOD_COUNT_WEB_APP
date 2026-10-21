import React, { createContext, useContext, useState, useEffect } from 'react';
import { LockStatus, StudentUser } from '../types';
import {
  authenticateStudent,
  subscribeLockStatus
} from '../services/firestoreService';
import { getFirebaseStatus } from '../services/firebaseConfig';
import { INITIAL_LOCK_STATUS, DEMO_STUDENT_USER } from '../data/mockData';

interface AuthContextType {
  user: StudentUser | null;
  loading: boolean;
  lockStatus: LockStatus;
  login: (identifier: string, pass: string) => Promise<void>;
  logout: () => void;
  updateLocalUser: (updater: (prev: StudentUser) => StudentUser) => void;
  adminWhatsApp: string;
  setAdminWhatsApp: (num: string) => void;
  firebaseStatus: { isConfigured: boolean; message: string; projectId: string };
  useDemoAccount: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_WHATSAPP_STORAGE_KEY = 'smys_admin_whatsapp';
const DEFAULT_ADMIN_WHATSAPP = '919876543210';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<StudentUser | null>(() => {
    try {
      const saved = localStorage.getItem('smys_store_active_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState<boolean>(true);
  const [lockStatus, setLockStatus] = useState<LockStatus>(INITIAL_LOCK_STATUS);
  const [adminWhatsApp, setAdminWhatsAppState] = useState<string>(() => {
    return localStorage.getItem(ADMIN_WHATSAPP_STORAGE_KEY) || DEFAULT_ADMIN_WHATSAPP;
  });

  const firebaseStatus = getFirebaseStatus();

  const setAdminWhatsApp = (num: string) => {
    const clean = num.replace(/\D/g, '');
    setAdminWhatsAppState(clean);
    localStorage.setItem(ADMIN_WHATSAPP_STORAGE_KEY, clean);
  };

  useEffect(() => {
    // Subscribe to active master and meal lock status in real-time
    const unsubscribeLock = subscribeLockStatus((status) => {
      setLockStatus(status);
    });

    setLoading(false);

    return () => {
      unsubscribeLock();
    };
  }, []);

  const login = async (identifier: string, pass: string) => {
    setLoading(true);
    try {
      const student = await authenticateStudent(identifier, pass);
      setUser(student);
    } finally {
      setLoading(false);
    }
  };

  const useDemoAccount = () => {
    setUser(DEMO_STUDENT_USER);
    localStorage.setItem('smys_store_active_user', JSON.stringify(DEMO_STUDENT_USER));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('smys_store_active_user');
  };

  const updateLocalUser = (updater: (prev: StudentUser) => StudentUser) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated = updater(prev);
      localStorage.setItem('smys_store_active_user', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        lockStatus,
        login,
        logout,
        updateLocalUser,
        adminWhatsApp,
        setAdminWhatsApp,
        firebaseStatus,
        useDemoAccount
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
