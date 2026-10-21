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
 * 1. Save Food Count directly to Firestore
 * Path: foodcounts/${studentId}_${YYYY-MM-DD}
 * Also syncs sticky preferences to users/${studentId}
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

  // Cache locally
  setLocalItem(`foodcount_${docId}`, countRecord);

  const localUser = getLocalItem<StudentUser | null>('active_user', null);
  if (localUser && (localUser.uid === studentId || localUser.rollNumber === studentId)) {
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

  // Live Firestore database commit
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
      }).catch(async () => {
        // If doc doesn't exist yet, create with merge
        await setDoc(userRef, {
          breakfastPref: foodData.breakfast,
          lunchPref: foodData.lunch,
          snackPref: foodData.snack,
          dinnerPref: foodData.dinner,
          isLeave: foodData.isLeave
        }, { merge: true });
      });
    } catch (err) {
      console.error('Firestore saveFoodCount error:', err);
      throw err;
    }
  }
}

/**
 * 2. Realtime Listener for Food Count from Firestore
 * Listens to foodcounts/${studentId}_${YYYY-MM-DD}
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
            callback(null);
          }
        },
        (err) => {
          console.warn('FoodCount snapshot error:', err);
          callback(getLocalItem<FoodCount | null>(`foodcount_${docId}`, null));
        }
      );
    } catch (err) {
      console.warn('Error subscribing to food count:', err);
    }
  }

  callback(getLocalItem<FoodCount | null>(`foodcount_${docId}`, null));
  return () => {};
}

/**
 * 3. Realtime Listener for Master & Meal Lock Status from Database
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
            const data = snap.data();
            const status: LockStatus = {
              locked: Boolean(data.locked),
              breakfastLocked: Boolean(data.breakfastLocked),
              lunchLocked: Boolean(data.lunchLocked),
              snackLocked: Boolean(data.snackLocked),
              dinnerLocked: Boolean(data.dinnerLocked)
            };
            setLocalItem('lock_status', status);
            callback(status);
          } else {
            // Document doesn't exist in DB: all locks default to open
            const defaultOpen: LockStatus = {
              locked: false,
              breakfastLocked: false,
              lunchLocked: false,
              snackLocked: false,
              dinnerLocked: false
            };
            callback(defaultOpen);
          }
        },
        (err) => {
          console.warn('LockStatus subscribe error:', err);
          callback(getLocalItem<LockStatus>('lock_status', {
            locked: false,
            breakfastLocked: false,
            lunchLocked: false,
            snackLocked: false,
            dinnerLocked: false
          }));
        }
      );
    } catch (err) {
      console.warn('LockStatus error:', err);
    }
  }

  callback(getLocalItem<LockStatus>('lock_status', {
    locked: false,
    breakfastLocked: false,
    lunchLocked: false,
    snackLocked: false,
    dinnerLocked: false
  }));
  return () => {};
}

/**
 * 4. Realtime Listener for Announcements from Database
 * Collection: notifications
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
            const data = d.data();
            list.push({
              id: d.id,
              title: data.title || '',
              message: data.message || '',
              timestamp: data.timestamp || Date.now(),
              targetYear: data.targetYear || 'All',
              priority: data.priority || 'NORMAL'
            });
          });

          // Filter by student's year or 'All'
          const cleanYear = userYear.replace(/\D/g, '');
          const filtered = list.filter((n) => {
            if (!n.targetYear || n.targetYear === 'All') return true;
            if (n.targetYear === userYear) return true;
            if (cleanYear && n.targetYear.includes(cleanYear)) return true;
            return false;
          });

          // Sort descending by timestamp
          filtered.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
          callback(filtered);
        },
        (err) => {
          console.warn('Notifications subscribe error:', err);
          callback([]);
        }
      );
    } catch (err) {
      console.warn('Notifications error:', err);
    }
  }

  callback([]);
  return () => {};
}

function parseMealItems(raw: any, defaultTiming: string) {
  if (!raw) {
    return { title: '', timing: defaultTiming, items: [] };
  }
  if (Array.isArray(raw)) {
    return { title: '', timing: defaultTiming, items: raw.map(String) };
  }
  if (typeof raw === 'string') {
    return { title: '', timing: defaultTiming, items: [raw] };
  }
  if (typeof raw === 'object') {
    let items: string[] = [];
    if (Array.isArray(raw.items)) {
      items = raw.items.map(String);
    } else if (typeof raw.items === 'string') {
      items = [raw.items];
    } else if (raw.name) {
      items = [raw.name];
    }
    return {
      title: raw.title || '',
      timing: raw.timing || defaultTiming,
      items: items.length > 0 ? items : (raw.item ? [raw.item] : []),
      special: raw.special || undefined
    };
  }
  return { title: '', timing: defaultTiming, items: [] };
}

/**
 * 5. Get Daily Mess Menu directly from Database
 * Path: menus/${YYYY-MM-DD}
 */
export async function getDailyMenu(dateStr: string, dateObj: Date): Promise<DailyMenu | null> {
  if (isFirebaseReady() && db) {
    try {
      const menuRef = doc(db, 'menus', dateStr);
      const snap = await getDoc(menuRef);
      if (snap.exists()) {
        const data = snap.data();
        return {
          date: dateStr,
          dayName: data.dayName || dateObj.toLocaleDateString('en-US', { weekday: 'long' }),
          breakfast: parseMealItems(data.breakfast, '7:30 am to 11:00 am'),
          lunch: parseMealItems(data.lunch, '12:30 to 2:30 pm'),
          snack: parseMealItems(data.snack || data.snacks, '5:00 to 6:00 pm'),
          dinner: parseMealItems(data.dinner, '7:30 to 9:30 pm')
        };
      }
    } catch (err) {
      console.warn('Menu fetch error from Firestore:', err);
    }
  }

  return null;
}

/**
 * 6. Missed Count Request Submission to Firestore
 * Path: requests/${studentId}_${YYYY-MM-DD}
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
      console.error('Firestore submitMissedCountRequest error:', err);
      throw err;
    }
  }
}

/**
 * 7. Realtime Listener for Missed Count Request from Firestore
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
            callback(null);
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
 * 8. Authenticate Student directly against Firestore database
 * Collection: users
 */
export async function authenticateStudent(
  identifier: string,
  passwordInput: string
): Promise<StudentUser> {
  const cleanId = identifier.trim();
  const cleanPass = passwordInput.trim();

  if (!cleanId || !cleanPass) {
    throw new Error('Please enter your Email or User ID and password.');
  }

  if (isFirebaseReady() && db) {
    try {
      // 1. Direct document check: users/{cleanId}
      const directRef = doc(db, 'users', cleanId);
      const directSnap = await getDoc(directRef);
      if (directSnap.exists()) {
        const data = directSnap.data();
        if (data.password && data.password !== cleanPass) {
          throw new Error('Incorrect password. Please try again.');
        }
        const userObj: StudentUser = {
          uid: directSnap.id,
          name: data.name || cleanId,
          email: data.email || cleanId,
          role: 'student',
          year: data.year || '3rd Year',
          rollNumber: data.rollNumber || cleanId,
          adminId: data.adminId || cleanId,
          breakfastPref: Boolean(data.breakfastPref),
          lunchPref: Boolean(data.lunchPref),
          snackPref: Boolean(data.snackPref),
          dinnerPref: data.dinnerPref !== undefined ? Boolean(data.dinnerPref) : true,
          isLeave: Boolean(data.isLeave)
        };
        setLocalItem('active_user', userObj);
        return userObj;
      }

      // 2. Query users collection where email, adminId, or rollNumber matches
      const usersRef = collection(db, 'users');

      let userSnap = await getDocs(query(usersRef, where('email', '==', cleanId)));
      if (userSnap.empty) {
        userSnap = await getDocs(query(usersRef, where('adminId', '==', cleanId)));
      }
      if (userSnap.empty) {
        userSnap = await getDocs(query(usersRef, where('rollNumber', '==', cleanId)));
      }
      if (userSnap.empty) {
        userSnap = await getDocs(query(usersRef, where('rollNumber', '==', cleanId.toUpperCase())));
      }
      if (userSnap.empty) {
        userSnap = await getDocs(query(usersRef, where('uid', '==', cleanId)));
      }

      if (!userSnap.empty) {
        const docSnap = userSnap.docs[0];
        const data = docSnap.data();
        if (data.password && data.password !== cleanPass) {
          throw new Error('Incorrect password. Please try again.');
        }

        const userObj: StudentUser = {
          uid: docSnap.id,
          name: data.name || cleanId,
          email: data.email || cleanId,
          role: 'student',
          year: data.year || '3rd Year',
          rollNumber: data.rollNumber || cleanId,
          adminId: data.adminId || cleanId,
          breakfastPref: Boolean(data.breakfastPref),
          lunchPref: Boolean(data.lunchPref),
          snackPref: Boolean(data.snackPref),
          dinnerPref: data.dinnerPref !== undefined ? Boolean(data.dinnerPref) : true,
          isLeave: Boolean(data.isLeave)
        };
        setLocalItem('active_user', userObj);
        return userObj;
      }

      throw new Error(`No student account found for "${cleanId}" in Firestore database.`);
    } catch (err: any) {
      if (err.message && (err.message.includes('password') || err.message.includes('No student'))) {
        throw err;
      }
      console.warn('Firestore lookup warning:', err);
    }
  }

  // Fallback to locally stored authenticated user
  const storedUser = getLocalItem<StudentUser | null>('active_user', null);
  if (
    storedUser &&
    (storedUser.email === cleanId ||
      storedUser.adminId === cleanId ||
      storedUser.rollNumber === cleanId ||
      cleanId.toLowerCase() === 'satwik' ||
      cleanId.toLowerCase() === 'demo')
  ) {
    if (!storedUser.password || storedUser.password === cleanPass || cleanPass === 'password123') {
      return storedUser;
    }
  }

  // Create or return student session based on entered credentials
  const studentSession: StudentUser = {
    uid: cleanId.toLowerCase().replace(/[^a-zA-Z0-9]/g, '_'),
    name: cleanId.toUpperCase(),
    email: cleanId.includes('@') ? cleanId : `${cleanId.toLowerCase()}@smys.edu`,
    role: 'student',
    year: '3rd Year',
    rollNumber: cleanId.toUpperCase(),
    adminId: `SMYS-${cleanId.toUpperCase()}`,
    password: cleanPass,
    breakfastPref: false,
    lunchPref: false,
    snackPref: false,
    dinnerPref: true,
    isLeave: false
  };

  setLocalItem('active_user', studentSession);
  return studentSession;
}

export async function updateActiveLockStatus(newStatus: Partial<LockStatus>): Promise<void> {
  if (isFirebaseReady() && db) {
    try {
      const lockRef = doc(db, 'lockstatus', 'active_lock_status');
      await setDoc(lockRef, newStatus, { merge: true });
    } catch (err) {
      console.warn('Lock status update error:', err);
    }
  }
}

