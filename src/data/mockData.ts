import { DailyMenu, LockStatus, NotificationItem, StudentUser } from '../types';
import { formatDateKey } from '../utils/rules';

// Standard 7-day cyclical hostel mess menu
export const WEEKLY_MESS_SCHEDULE: Record<number, Omit<DailyMenu, 'date'>> = {
  0: { // Sunday
    dayName: 'Sunday',
    breakfast: {
      title: 'Sunday Special Breakfast',
      timing: '7:30 AM - 9:00 AM',
      items: ['Masala Dosa with Potato Masala', 'Sambar & Coconut Chutney', 'Boiled Eggs / Banana', 'Filter Coffee / Tea'],
      special: 'Crispy Butter Roast Special'
    },
    lunch: {
      title: 'Grand Sunday Feast',
      timing: '12:30 PM - 2:00 PM',
      items: ['Chicken Biryani / Paneer Dum Biryani', 'Onion Cucumber Raita', 'Mirchi Ka Salan', 'Boiled Egg', 'Gulab Jamun (1 pc)'],
      special: 'Chef Special Biryani Feast'
    },
    snack: {
      title: 'Evening Refreshment',
      timing: '5:00 PM - 6:00 PM',
      items: ['Samosa with Mint Green Chutney', 'Cardamom Milk Tea / Coffee']
    },
    dinner: {
      title: 'Light Night Dinner',
      timing: '7:30 PM - 9:00 PM',
      items: ['Soft Phulkas', 'Dal Tadka', 'Jeera Rice', 'Aloo Gobi Dry', 'Curd']
    }
  },
  1: { // Monday
    dayName: 'Monday',
    breakfast: {
      title: 'South Indian Breakfast',
      timing: '7:30 AM - 9:00 AM',
      items: ['Steamed Idli (3 pcs)', 'Medu Vada (1 pc)', 'Drumstick Sambar', 'Tomato & Coconut Chutneys', 'Tea / Coffee']
    },
    lunch: {
      title: 'Executive Lunch',
      timing: '12:30 PM - 2:00 PM',
      items: ['Steamed Basmati Rice', 'Chana Masala Gravy', 'Roti / Chapati (2 pcs)', 'Mix Veg Poriyal', 'Rasam', 'Fresh Curd']
    },
    snack: {
      title: 'Evening Refreshment',
      timing: '5:00 PM - 6:00 PM',
      items: ['Crispy Onion Pakoda', 'Filter Coffee / Ginger Chai']
    },
    dinner: {
      title: 'Nutritious Dinner',
      timing: '7:30 PM - 9:00 PM',
      items: ['Hot Chapatis', 'Paneer Butter Masala', 'Veg Fried Rice', 'Dal Fry', 'Pickle & Papad']
    }
  },
  2: { // Tuesday
    dayName: 'Tuesday',
    breakfast: {
      title: 'Wholesome Breakfast',
      timing: '7:30 AM - 9:00 AM',
      items: ['Puri with Potato Aloo Sagu', 'Kesari Bath / Sheera', 'Sprouts Salad', 'Hot Tea / Milk']
    },
    lunch: {
      title: 'Traditional Lunch',
      timing: '12:30 PM - 2:00 PM',
      items: ['White Rice', 'Tomato Rasam', 'Palak Paneer', 'Crispy Appalam', 'Beans Carrot Fry', 'Butter Milk']
    },
    snack: {
      title: 'Evening Refreshment',
      timing: '5:00 PM - 6:00 PM',
      items: ['Veg Cutlet (2 pcs) with Tomato Ketchup', 'Special Masala Chai']
    },
    dinner: {
      title: 'Comfort Dinner',
      timing: '7:30 PM - 9:00 PM',
      items: ['Methi Paratha with Butter', 'Dal Makhani', 'Steamed Rice', 'Curd Rice with Pomegranate']
    }
  },
  3: { // Wednesday
    dayName: 'Wednesday',
    breakfast: {
      title: 'Classic Tiffin',
      timing: '7:30 AM - 9:00 AM',
      items: ['Ven Pongal with Ghee & Cashews', 'Getti Chutney & Medu Vada', 'Sambar', 'Tea / Coffee']
    },
    lunch: {
      title: 'Midweek Special Lunch',
      timing: '12:30 PM - 2:00 PM',
      items: ['Chicken Curry / Mushroom Curry', 'White Rice', 'Chapatis (2 pcs)', 'Dal Palak', 'Kootu', 'Payasam']
    },
    snack: {
      title: 'Evening Refreshment',
      timing: '5:00 PM - 6:00 PM',
      items: ['Sweet Corn Chaat / Sundal', 'Lemon Tea / Coffee']
    },
    dinner: {
      title: 'Dinner Spread',
      timing: '7:30 PM - 9:00 PM',
      items: ['Egg Curry / Kadai Paneer', 'Soft Phulkas', 'Ghee Rice', 'Dal Tadka', 'Salad']
    }
  },
  4: { // Thursday
    dayName: 'Thursday',
    breakfast: {
      title: 'Light Morning Tiffin',
      timing: '7:30 AM - 9:00 AM',
      items: ['Rava Upma with Mixed Veggies', 'Coconut Chutney', 'Banana', 'Coffee / Tea']
    },
    lunch: {
      title: 'Homestyle Lunch',
      timing: '12:30 PM - 2:00 PM',
      items: ['Lemon Rice / Steamed Rice', 'Sambar', 'Aloo Fry', 'Cabbage Thoran', 'Rasam', 'Fresh Curd']
    },
    snack: {
      title: 'Evening Refreshment',
      timing: '5:00 PM - 6:00 PM',
      items: ['Pani Puri / Masala Puri (Hostel Counter)', 'Hot Tea / Coffee']
    },
    dinner: {
      title: 'Delight Dinner',
      timing: '7:30 PM - 9:00 PM',
      items: ['Malabar Parotta / Chapati', 'Veg Kurma / Soya Chunk Curry', 'Curd Rice', 'Pickle']
    }
  },
  5: { // Friday
    dayName: 'Friday',
    breakfast: {
      title: 'Crispy Dosa Morning',
      timing: '7:30 AM - 9:00 AM',
      items: ['Set Dosa (3 pcs) with Butter', 'Vegetable Sagu & Chutney', 'Tea / Coffee']
    },
    lunch: {
      title: 'Friday Feast',
      timing: '12:30 PM - 2:00 PM',
      items: ['Fish Fry (Optional) / Paneer Tikka', 'Rice', 'Mysore Rasam', 'Dal Fry', 'Mor Kuzhambu', 'Semiya Payasam']
    },
    snack: {
      title: 'Evening Refreshment',
      timing: '5:00 PM - 6:00 PM',
      items: ['Bread Omelette / Veg Cheese Sandwich', 'Cold Coffee / Milk Tea']
    },
    dinner: {
      title: 'Friday Night Special',
      timing: '7:30 PM - 9:00 PM',
      items: ['Egg Fried Rice / Veg Fried Rice', 'Gobi Manchurian Semi-gravy', 'Chapatis', 'Sweet Corn Soup']
    }
  },
  6: { // Saturday
    dayName: 'Saturday',
    breakfast: {
      title: 'Weekend Kickoff Breakfast',
      timing: '7:30 AM - 9:00 AM',
      items: ['Aloo Paratha with Curd & Pickle', 'Poha with Peanuts', 'Fruits Bowl', 'Coffee / Tea']
    },
    lunch: {
      title: 'Weekend Lunch',
      timing: '12:30 PM - 2:00 PM',
      items: ['Pulao with Rajma Masala', 'Steamed Rice', 'Mix Veg Raita', 'Papad', 'Sweet Boondi']
    },
    snack: {
      title: 'Evening Refreshment',
      timing: '5:00 PM - 6:00 PM',
      items: ['Bhel Puri / Sev Puri', 'Ginger Tea / Filter Coffee']
    },
    dinner: {
      title: 'Weekend Dinner',
      timing: '7:30 PM - 9:00 PM',
      items: ['Pav Bhaji with Butter Pavs', 'Veg Pulao', 'Gulab Jamun / Ice Cream', 'Fresh Curd']
    }
  }
};

/**
 * Returns daily menu for any given date, falling back to weekly schedule if Firestore has no doc.
 */
export function getFallbackMenuForDate(date: Date): DailyMenu {
  const dateKey = formatDateKey(date);
  const dayIndex = date.getDay();
  const template = WEEKLY_MESS_SCHEDULE[dayIndex] || WEEKLY_MESS_SCHEDULE[1];

  return {
    date: dateKey,
    dayName: template.dayName,
    breakfast: template.breakfast,
    lunch: template.lunch,
    snack: template.snack,
    dinner: template.dinner
  };
}

// Default Lock Status (Master Open, All meals editable initially)
export const INITIAL_LOCK_STATUS: LockStatus = {
  locked: false,
  breakfastLocked: false,
  lunchLocked: false,
  snackLocked: false,
  dinnerLocked: false
};

// Demo Student User
export const DEMO_STUDENT_USER: StudentUser = {
  uid: 'smys_std_101',
  name: 'Rahul Sharma',
  email: 'rahul.sharma@smys.edu',
  role: 'student',
  year: '3rd Year',
  rollNumber: '22CS104',
  adminId: 'SMYS-2024-089',
  password: 'password123',
  breakfastPref: true,
  lunchPref: true,
  snackPref: true,
  dinnerPref: true,
  isLeave: false
};

// Default Notifications
export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif_1',
    title: 'Important: Sunday Special Feast Timing',
    message: 'Mess timings for upcoming Sunday Lunch will strictly follow 12:30 PM to 2:00 PM. Please ensure your food count is submitted before 7:40 PM on Saturday.',
    timestamp: Date.now() - 1000 * 60 * 45, // 45 mins ago
    targetYear: 'All',
    priority: 'HIGH',
    category: 'TIMING'
  },
  {
    id: 'notif_2',
    title: '3rd Year Mess Feedback Meeting',
    message: 'Quarterly student mess council meeting will be held in the hostel dining hall this Thursday at 6:30 PM. All 3rd year room representatives must attend.',
    timestamp: Date.now() - 1000 * 60 * 180, // 3 hours ago
    targetYear: '3rd Year',
    priority: 'NORMAL',
    category: 'GENERAL'
  },
  {
    id: 'notif_3',
    title: 'Night Study Snacks Available',
    message: 'During internal exam week, hot tea and biscuits will be served between 10:30 PM and 11:15 PM at the main mess counter.',
    timestamp: Date.now() - 1000 * 60 * 60 * 24, // 1 day ago
    targetYear: 'All',
    priority: 'NORMAL',
    category: 'MESS'
  },
  {
    id: 'notif_4',
    title: 'Leave Count Reminder',
    message: 'Students leaving for weekend home transit must toggle "On Leave" in the portal before 7:40 PM Friday to avoid food wastage.',
    timestamp: Date.now() - 1000 * 60 * 60 * 36,
    targetYear: 'All',
    priority: 'HIGH',
    category: 'LEAVE'
  }
];
