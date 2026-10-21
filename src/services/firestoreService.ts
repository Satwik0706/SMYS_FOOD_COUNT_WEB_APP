import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  onSnapshot,
  query,
  where,
  getDocs,
  Unsubscribe
} from 'firebase/firestore';
import { db, isFirebaseReady } from './firebaseConfig';
import {
  DailyMenu,
  FoodCount,
  LockStatus,
  MissedCountRequest,
  NotificationItem,
  StudentUser
} from '../types';
import {
  DEMO_STUDENT_USER,
  getFallbackMenuForDate,
  INITIAL_LOCK_STATUS,
  INITIAL_NOTIFICATIONS
} from '../data/mockData';

// Local storage backup keys for offline / fallback demo operation
const STORAGE_PREFIX = 'smys_store_';

function getLocalItem<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(STORAGE_PREFIX + key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setLocalItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
  } catch (err) {
    console.error('LocalStorage write error:', err);
  }
}

/**
 * 1. Save Food Count
 * Synchronizes atomic merge to foodcounts and updates sticky user preferences in users
 */
export async function saveFoodCount(
  studentId: string,
  dateStr: string,
  foodData: {
    breakfast: boolean;
    lunch: boolean;
    snack: boolean;
    dinner: boolean;
    lunchBox: boolean;
    isLeave: boolean;
  }
): Promise<void> {
  const docId = `${studentId}_${dateStr}`;
  const submittedAt = Date.now();

  const countRecord: FoodCount = {
    studentId,
    date: dateStr,
    breakfast: foodData.breakfast,
    lunch: foodData.lunch,
    snack: foodData.snack,
    dinner: foodData.dinner,
    lunchBox: foodData.lunchBox,
    isLeave: foodData.isLeave,
    submittedAt
  };

  // Always sync to local store for offline and instant UI response
  setLocalItem(`foodcount_${docId}`, countRecord);

  // Update local user sticky prefs
  const localUser = getLocalItem<StudentUser | null>('active_user', null);
  if (localUser && localUser.uid === studentId) {
    const updatedUser: StudentUser = {
      ...localUser,
      breakfastPref: foodData.breakfast,
      lunchPref: foodData.lunch,
      snackPref: foodData.snack,
      dinnerPref: foodData.dinner,
      isLeave: foodData.isLeave
    };
    setLocalItem('active_user', updatedUser);
  }

  // If live Firebase is ready, commit to Firestore
  if (isFirebaseReady() && db) {
    try {
      const foodCountRef = doc(db, 'foodcounts', docId);
      const userRef = doc(db, 'users', studentId);

      // 1. Atomic merge to foodcounts collection
      await setDoc(
        foodCountRef,
        {
          studentId: studentId,
          date: dateStr,
          breakfast: foodData.breakfast,
          lunch: foodData.lunch,
          snack: foodData.snack,
          dinner: foodData.dinner,
          lunchBox: foodData.lunchBox,
          isLeave: foodData.isLeave,
          submittedAt: submittedAt
        },
        { merge: true }
      );

      // 2. Sync sticky user preferences
      await updateDoc(userRef, {
        breakfastPref: foodData.breakfast,
        lunchPref: foodData.lunch,
        snackPref: foodData.snack,
        dinnerPref: foodData.dinner,
        isLeave: foodData.isLeave
      });
    } catch (err) {
      console.warn('Firestore save warning, fallback kept locally:', err);
    }
  }
}

/**
 * 2. Get Food Count for a specific date
 */
export async function getFoodCount(studentId: string, dateStr: string): Promise<FoodCount | null> {
  const docId = `${studentId}_${dateStr}`;

  if (isFirebaseReady() && db) {
    try {
      const foodCountRef = doc(db, 'foodcounts', docId);
      const snap = await getDoc(foodCountRef);
      if (snap.exists()) {
        return snap.data() as FoodCount;
      }
    } catch (err) {
      console.warn('Firestore getFoodCount fallback:', err);
    }
  }

  return getLocalItem<FoodCount | null>(`foodcount_${docId}`, null);
}

/**
 * 3. Realtime Listener for Food Count
 */
export function subscribeFoodCount(
  studentId: string,
  dateStr: string,
  callback: (data: FoodCount | null) => void
): Unsubscribe {
  const docId = `${studentId}_${dateStr}`;

  if (isFirebaseReady() && db) {
    try {
      const foodCountRef = doc(db, 'foodcounts', docId);
      return onSnapshot(
        foodCountRef,
        (snap) => {
          if (snap.exists()) {
            const data = snap.data() as FoodCount;
            setLocalItem(`foodcount_${docId}`, data);
            callback(data);
          } else {
            callback(getLocalItem<FoodCount | null>(`foodcount_${docId}`, null));
          }
        },
        (err) => {
          console.warn('FoodCount snapshot error:', err);
          callback(getLocalItem<FoodCount | null>(`foodcount_${docId}`, null));
        }
      );
    } catch (err) {
      console.warn('Error creating snapshot listener:', err);
    }
  }

  // Fallback initial call
  callback(getLocalItem<FoodCount | null>(`foodcount_${docId}`, null));
  return () => {};
}

/**
 * 4. Realtime Listener for Master & Meal Lock Status
 * Path: lockstatus/active_lock_status
 */
export function subscribeLockStatus(callback: (status: LockStatus) => void): Unsubscribe {
  if (isFirebaseReady() && db) {
    try {
      const lockRef = doc(db, 'lockstatus', 'active_lock_status');
      return onSnapshot(
        lockRef,
        (snap) => {
          if (snap.exists()) {
            const data = snap.data() as LockStatus;
            setLocalItem('lock_status', data);
            callback(data);
          } else {
            callback(getLocalItem<LockStatus>('lock_status', INITIAL_LOCK_STATUS));
          }
        },
        (err) => {
          console.warn('LockStatus snapshot error:', err);
          callback(getLocalItem<LockStatus>('lock_status', INITIAL_LOCK_STATUS));
        }
      );
    } catch (err) {
      console.warn('LockStatus subscribe error:', err);
    }
  }

  callback(getLocalItem<LockStatus>('lock_status', INITIAL_LOCK_STATUS));
  return () => {};
}

/**
 * 5. Realtime Listener for Announcements / Notifications
 * Real-time stream from notifications Firestore collection.
 * Filtered by targetYear === "All" || targetYear === user.year.
 */
export function subscribeNotifications(
  userYear: string,
  callback: (notifs: NotificationItem[]) => void
): Unsubscribe {
  if (isFirebaseReady() && db) {
    try {
      const notifsRef = collection(db, 'notifications');
      return onSnapshot(
        notifsRef,
        (snap) => {
          const list: NotificationItem[] = [];
          snap.forEach((d) => {
            list.push({ id: d.id, ...d.data() } as NotificationItem);
          });
          const filtered = list.filter(
            (n) => !n.targetYear || n.targetYear === 'All' || n.targetYear === userYear
          );
          // Sort descending by timestamp
          filtered.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
          if (filtered.length > 0) {
            setLocalItem('notifications', filtered);
            callback(filtered);
            return;
          }
          callback(INITIAL_NOTIFICATIONS.filter((n) => n.targetYear === 'All' || n.targetYear === userYear));
        },
        (err) => {
          console.warn('Notifications stream error:', err);
          const cached = getLocalItem<NotificationItem[]>('notifications', INITIAL_NOTIFICATIONS);
          callback(cached.filter((n) => n.targetYear === 'All' || n.targetYear === userYear));
        }
      );
    } catch (err) {
      console.warn('Notifications subscribe error:', err);
    }
  }

  const cached = getLocalItem<NotificationItem[]>('notifications', INITIAL_NOTIFICATIONS);
  callback(cached.filter((n) => n.targetYear === 'All' || n.targetYear === userYear));
  return () => {};
}

/**
 * 6. Get Daily Mess Menu with fallback
 * Path: menus/{YYYY-MM-DD}
 */
export async function getDailyMenu(dateStr: string, dateObj: Date): Promise<DailyMenu> {
  if (isFirebaseReady() && db) {
    try {
      const menuRef = doc(db, 'menus', dateStr);
      const snap = await getDoc(menuRef);
      if (snap.exists()) {
        return snap.data() as DailyMenu;
      }
    } catch (err) {
      console.warn('Menu fetch warning, using fallback:', err);
    }
  }

  // Return standard weekly fallback menu for the day of week
  return getFallbackMenuForDate(dateObj);
}

/**
 * 7. Missed Count Request Submission
 * Path: requests/{studentId}_{YYYY-MM-DD}
 */
export async function submitMissedCountRequest(
  request: Omit<MissedCountRequest, 'id' | 'timestamp'>
): Promise<void> {
  const docId = `${request.studentId}_${request.date}`;
  const record: MissedCountRequest = {
    ...request,
    id: docId,
    timestamp: Date.now()
  };

  setLocalItem(`request_${docId}`, record);

  if (isFirebaseReady() && db) {
    try {
      const reqRef = doc(db, 'requests', docId);
      await setDoc(reqRef, record, { merge: true });
    } catch (err) {
      console.warn('Firestore request save warning:', err);
    }
  }
}

/**
 * 8. Realtime Listener for Missed Count Request
 */
export function subscribeMissedCountRequest(
  studentId: string,
  dateStr: string,
  callback: (req: MissedCountRequest | null) => void
): Unsubscribe {
  const docId = `${studentId}_${dateStr}`;

  if (isFirebaseReady() && db) {
    try {
      const reqRef = doc(db, 'requests', docId);
      return onSnapshot(
        reqRef,
        (snap) => {
          if (snap.exists()) {
            const data = snap.data() as MissedCountRequest;
            setLocalItem(`request_${docId}`, data);
            callback(data);
          } else {
            callback(getLocalItem<MissedCountRequest | null>(`request_${docId}`, null));
          }
        },
        (err) => {
          console.warn('Request snapshot error:', err);
          callback(getLocalItem<MissedCountRequest | null>(`request_${docId}`, null));
        }
      );
    } catch (err) {
      console.warn('Request subscribe error:', err);
    }
  }

  callback(getLocalItem<MissedCountRequest | null>(`request_${docId}`, null));
  return () => {};
}

/**
 * 9. Authenticate Student
 * Supports:
 * - Email + Password
 * - Student Admin ID + Password
 * - Roll Number + Password
 */
export async function authenticateStudent(
  identifier: string,
  passwordInput: string
): Promise<StudentUser> {
  const cleanId = identifier.trim();
  const cleanPass = passwordInput.trim();

  if (!cleanId || !cleanPass) {
    throw new Error('Please enter your credentials');
  }

  // Quick check for Demo user if offline or demo login
  if (
    cleanId.toLowerCase() === DEMO_STUDENT_USER.email.toLowerCase() ||
    cleanId.toLowerCase() === DEMO_STUDENT_USER.adminId.toLowerCase() ||
    cleanId.toLowerCase() === DEMO_STUDENT_USER.rollNumber.toLowerCase() ||
    cleanId.toLowerCase() === 'demo'
  ) {
    if (cleanPass === 'password123' || cleanPass === 'demo' || cleanId.toLowerCase() === 'demo') {
      const user = getLocalItem<StudentUser>('active_user', DEMO_STUDENT_USER);
      setLocalItem('active_user', user);
      return user;
    }
  }

  // If live Firebase Firestore is ready, look up user
  if (isFirebaseReady() && db) {
    try {
      const usersRef = collection(db, 'users');

      // Check by email, adminId, or rollNumber
      const qEmail = query(usersRef, where('email', '==', cleanId));
      const qAdmin = query(usersRef, where('adminId', '==', cleanId));
      const qRoll = query(usersRef, where('rollNumber', '==', cleanId));

      let userSnap = await getDocs(qEmail);
      if (userSnap.empty) {
        userSnap = await getDocs(qAdmin);
      }
      if (userSnap.empty) {
        userSnap = await getDocs(qRoll);
      }

      if (!userSnap.empty) {
        const docSnap = userSnap.docs[0];
        const userData = { uid: docSnap.id, ...docSnap.data() } as StudentUser;

        // Verify password if stored
        if (userData.password && userData.password !== cleanPass) {
          throw new Error('Incorrect password. Please try again.');
        }

        setLocalItem('active_user', userData);
        return userData;
      }
    } catch (err: any) {
      console.warn('Firestore auth query error:', err);
      if (err.message && err.message.includes('password')) {
        throw err;
      }
    }
  }

  // If local active user exists and matches
  const storedUser = getLocalItem<StudentUser | null>('active_user', null);
  if (
    storedUser &&
    (storedUser.email === cleanId ||
      storedUser.adminId === cleanId ||
      storedUser.rollNumber === cleanId)
  ) {
    if (!storedUser.password || storedUser.password === cleanPass) {
      return storedUser;
    }
  }

  // Dynamic user creation if testing or first-time student login
  if (cleanPass.length >= 4) {
    const isEmail = cleanId.includes('@');
    const dynamicUser: StudentUser = {
      uid: `std_${cleanId.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}`,
      name: cleanId.split('@')[0].toUpperCase(),
      email: isEmail ? cleanId : `${cleanId.toLowerCase()}@smys.edu`,
      role: 'student',
      year: '3rd Year',
      rollNumber: isEmail ? '22CS099' : cleanId,
      adminId: isEmail ? 'SMYS-2024-99' : `SMYS-${cleanId}`,
      password: cleanPass,
      breakfastPref: true,
      lunchPref: true,
      snackPref: true,
      dinnerPref: true,
      isLeave: false
    };

    setLocalItem('active_user', dynamicUser);
    return dynamicUser;
  }

  throw new Error('Invalid credentials. Check your Email, Admin ID, or Roll Number.');
}

/**
 * 10. Update Lock Status in Firestore (For test / admin simulation toggle)
 */
export async function updateActiveLockStatus(newStatus: Partial<LockStatus>): Promise<void> {
  const current = getLocalItem<LockStatus>('lock_status', INITIAL_LOCK_STATUS);
  const updated = { ...current, ...newStatus };
  setLocalItem('lock_status', updated);

  if (isFirebaseReady() && db) {
    try {
      const lockRef = doc(db, 'lockstatus', 'active_lock_status');
      await setDoc(lockRef, updated, { merge: true });
    } catch (err) {
      console.warn('Lock status update error:', err);
    }
  }
}
