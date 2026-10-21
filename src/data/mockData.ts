import { DailyMenu, LockStatus, NotificationItem, StudentUser } from '../types';
import { formatDateKey } from '../utils/rules';

// Authentic weekly mess schedule matching native SMYS hostel dishes
export const WEEKLY_MESS_SCHEDULE: Record<number, Omit<DailyMenu, 'date'>> = {
  0: { // Sunday
    dayName: 'Sunday',
    breakfast: {
      title: 'Breakfast',
      timing: '7:30 am to 11:00 am',
      items: ['ಮಸಾಲಾ ದೋಸೆ + ಚಟ್ನಿ + ಸಾಂಬಾರ್.', 'ಕಾಫಿ / ಟೀ.']
    },
    lunch: {
      title: 'Lunch',
      timing: '12:30 to 2:30 pm',
      items: ['ಸ್ಪೆಷಲ್ ಬಿರಿಯಾನಿ / ಅನ್ನ + ದಾಲ್ + ಪಾಯಸ.', 'ಮೊಸರು.']
    },
    snack: {
      title: 'Snacks',
      timing: '5:00 to 6:00 pm',
      items: ['ಸಮೋಸಾ + ಚಟ್ನಿ.', 'ಚಹಾ / ಕಾಫಿ.']
    },
    dinner: {
      title: 'Dinner',
      timing: '7:30 to 9:30 pm',
      items: ['ಚಪಾತಿ + ಪನ್ನೀರ್ ಕುರ್ಮಾ + ಜೀರಾ ರೈಸ್.', 'ಮೊಸರನ್ನ.']
    }
  },
  1: { // Monday
    dayName: 'Monday',
    breakfast: {
      title: 'Breakfast',
      timing: '7:30 am to 11:00 am',
      items: ['ಇಡ್ಲಿ + ವಡೆ + ಸಾಂಬಾರ್ + ಚಟ್ನಿ.', 'ಕಾಫಿ / ಟೀ.']
    },
    lunch: {
      title: 'Lunch',
      timing: '12:30 to 2:30 pm',
      items: ['ಅನ್ನ + ಬೇಳೆ ಸಾರು + ತರಕಾರಿ ಪಲ್ಯ.', 'ಮೊಸರು.']
    },
    snack: {
      title: 'Snacks',
      timing: '5:00 to 6:00 pm',
      items: ['ಈರುಳ್ಳಿ ಪಕೋಡಾ.', 'ಚಹಾ / ಕಾಫಿ.']
    },
    dinner: {
      title: 'Dinner',
      timing: '7:30 to 9:30 pm',
      items: ['ಚಪಾತಿ + ದಾಲ್ ಫ್ರೈ + ಅನ್ನ + ರಸಂ.', 'ಮೊಸರು.']
    }
  },
  2: { // Tuesday
    dayName: 'Tuesday',
    breakfast: {
      title: 'Breakfast',
      timing: '7:30 am to 11:00 am',
      items: ['ಪೂರಿ + ಸಾಗು + ಕೇಸರಿ ಬಾತ್.', 'ಕಾಫಿ / ಟೀ.']
    },
    lunch: {
      title: 'Lunch',
      timing: '12:30 to 2:30 pm',
      items: ['ಅನ್ನ + ಟೊಮೇಟೊ ರಸಂ + ಪಾಲಕ್ ಪಲ್ಯ.', 'ಮೊಸರು + ಹಪ್ಪಳ.']
    },
    snack: {
      title: 'Snacks',
      timing: '5:00 to 6:00 pm',
      items: ['ಕಟ್ಲೆಟ್ + ಸಾಸ್.', 'ಚಹಾ / ಕಾಫಿ.']
    },
    dinner: {
      title: 'Dinner',
      timing: '7:30 to 9:30 pm',
      items: ['ರೊಟ್ಟಿ + ಎಣ್ಣೆಗಾಯಿ ಪಲ್ಯ + ಅನ್ನ.', 'ಮೊಸರನ್ನ.']
    }
  },
  3: { // Wednesday (Matches Screenshot 4)
    dayName: 'Wednesday',
    breakfast: {
      title: 'Breakfast',
      timing: '7:30 am to 11:00 am',
      items: ['ಪುಳಿಯೋಗರೆ + ಮೊಸರು.']
    },
    lunch: {
      title: 'Lunch',
      timing: '12:30 to 2:30 pm',
      items: ['ಅನ್ನ + ಸೌತೆಕಾಯ್ ಹುಳಿ + ಮೊಸರು.']
    },
    snack: {
      title: 'Snacks',
      timing: '5:00 to 6:00 pm',
      items: ['ಸ್ವೀಟ್ ಕಾರ್ನ್ / ಸುಂಡಲ್.', 'ಕಾಫಿ / ಟೀ.']
    },
    dinner: {
      title: 'Dinner',
      timing: '7:30 to 9:30 pm',
      items: ['ಚಪಾತಿ + ಮಿಕ್ಸ್ ವೆಜ್ ಕುರ್ಮಾ + ಅನ್ನ.', 'ಮೊಸರನ್ನ.']
    }
  },
  4: { // Thursday
    dayName: 'Thursday',
    breakfast: {
      title: 'Breakfast',
      timing: '7:30 am to 11:00 am',
      items: ['ಉಪ್ಪಿಟ್ಟು + ತೆಂಗಿನಕಾಯಿ ಚಟ್ನಿ.', 'ಕಾಫಿ / ಟೀ.']
    },
    lunch: {
      title: 'Lunch',
      timing: '12:30 to 2:30 pm',
      items: ['ಅನ್ನ + ಮೈಸೂರು ಸಾಂಬಾರ್ + ಆಲೂ ಫ್ರೈ.', 'ಮೊಸರು.']
    },
    snack: {
      title: 'Snacks',
      timing: '5:00 to 6:00 pm',
      items: ['ಪಾನಿಪುರಿ / ಮಸಾಲಪುರಿ.', 'ಚಹಾ.']
    },
    dinner: {
      title: 'Dinner',
      timing: '7:30 to 9:30 pm',
      items: ['ಪರೋಟ + ಚನ್ನಾ ಮಸಾಲಾ + ಅನ್ನ.', 'ಮೊಸರನ್ನ.']
    }
  },
  5: { // Friday
    dayName: 'Friday',
    breakfast: {
      title: 'Breakfast',
      timing: '7:30 am to 11:00 am',
      items: ['ಸೆಟ್ ದೋಸೆ + ಸಾಗು + ಚಟ್ನಿ.', 'ಕಾಫಿ / ಟೀ.']
    },
    lunch: {
      title: 'Lunch',
      timing: '12:30 to 2:30 pm',
      items: ['ಅನ್ನ + ಬಿಸಿಬೇಳೆ ಬಾತ್ + ಬೂಂದಿ ರಾಯಿತಾ.', 'ಸೇವಿಗೆ ಪಾಯಸ.']
    },
    snack: {
      title: 'Snacks',
      timing: '5:00 to 6:00 pm',
      items: ['ವೆಜ್ ಸ್ಯಾಂಡ್‌ವಿಚ್.', 'ಕೋಲ್ಡ್ ಕಾಫಿ / ಚಹಾ.']
    },
    dinner: {
      title: 'Dinner',
      timing: '7:30 to 9:30 pm',
      items: ['ಫ್ರೈಡ್ ರೈಸ್ + ಗೋಬಿ ಮಂಚೂರಿಯನ್.', 'ಚಪಾತಿ + ಮೊಸರು.']
    }
  },
  6: { // Saturday
    dayName: 'Saturday',
    breakfast: {
      title: 'Breakfast',
      timing: '7:30 am to 11:00 am',
      items: ['ಅವಲಕ್ಕಿ ಬಾತ್ (ಪೋಹಾ) + ಮೊಸರು.', 'ಕಾಫಿ / ಟೀ.']
    },
    lunch: {
      title: 'Lunch',
      timing: '12:30 to 2:30 pm',
      items: ['ಪುಲಾವ್ + ಕುರುಮಾ + ಅನ್ನ + ರಸಂ.', 'ಮೊಸರು.']
    },
    snack: {
      title: 'Snacks',
      timing: '5:00 to 6:00 pm',
      items: ['ಭೇಲ್ ಪುರಿ.', 'ಮಸಾಲಾ ಟೀ.']
    },
    dinner: {
      title: 'Dinner',
      timing: '7:30 to 9:30 pm',
      items: ['ಪಾವ್ ಬಾಜಿ + ಬಟರ್ ಪಾವ್ + ಪುಲಾವ್.', 'ಮೊಸರು.']
    }
  }
};

export function getFallbackMenuForDate(date: Date): DailyMenu {
  const dateKey = formatDateKey(date);
  const dayIndex = date.getDay();
  const template = WEEKLY_MESS_SCHEDULE[dayIndex] || WEEKLY_MESS_SCHEDULE[3];

  return {
    date: dateKey,
    dayName: template.dayName,
    breakfast: template.breakfast,
    lunch: template.lunch,
    snack: template.snack,
    dinner: template.dinner
  };
}

// Lock Status matching native app screenshot 5:
// Breakfast Locked, Lunch Locked, Snacks Locked, Dinner Open!
export const INITIAL_LOCK_STATUS: LockStatus = {
  locked: false,
  breakfastLocked: true,
  lunchLocked: true,
  snackLocked: true,
  dinnerLocked: false
};

// Default Student User matching native app screenshot 2:
export const DEMO_STUDENT_USER: StudentUser = {
  uid: 'smys_satwik',
  name: 'SATWIK G JOSHI',
  email: 'satwik@smys.edu',
  role: 'student',
  year: '3rd Year',
  rollNumber: '22CS042',
  adminId: 'SMYS-2024-042',
  password: 'password123',
  breakfastPref: false,
  lunchPref: false,
  snackPref: false,
  dinnerPref: true,
  isLeave: false
};

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [];
