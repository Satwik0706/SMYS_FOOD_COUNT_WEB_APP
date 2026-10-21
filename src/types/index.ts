export type YearLevel = '1st Year' | '2nd Year' | '3rd Year' | '4th Year';

export interface StudentUser {
  uid: string;
  name: string;
  email: string;
  role: 'student';
  year: YearLevel;
  rollNumber: string;
  adminId: string;
  password?: string;
  breakfastPref: boolean;
  lunchPref: boolean;
  snackPref: boolean;
  dinnerPref: boolean;
  isLeave: boolean;
}

export interface FoodCount {
  studentId: string;
  date: string; // YYYY-MM-DD
  breakfast: boolean;
  lunch: boolean;
  snack: boolean;
  dinner: boolean;
  lunchBox: boolean;
  isLeave: boolean;
  submittedAt: number;
}

export interface LockStatus {
  locked: boolean; // Master Lock Flag
  breakfastLocked: boolean;
  lunchLocked: boolean;
  snackLocked: boolean;
  dinnerLocked: boolean;
}

export interface MissedCountRequest {
  id: string;
  studentId: string;
  studentName: string;
  studentYear: string;
  date: string; // YYYY-MM-DD
  breakfast: boolean;
  lunch: boolean;
  dinner: boolean;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  timestamp: number;
  adminNote?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: number;
  targetYear: 'All' | YearLevel;
  priority: 'HIGH' | 'NORMAL';
  category?: 'MESS' | 'GENERAL' | 'LEAVE' | 'TIMING';
}

export interface MealMenu {
  title: string;
  timing: string;
  items: string[];
  special?: string;
}

export interface DailyMenu {
  date: string; // YYYY-MM-DD
  dayName: string;
  breakfast: MealMenu;
  lunch: MealMenu;
  snack: MealMenu;
  dinner: MealMenu;
}
