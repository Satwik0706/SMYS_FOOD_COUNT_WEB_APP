import { LockStatus } from '../types';

/**
 * Rule A: The 7:30 PM (19:30) Date Switch Rule
 * Daily at 19:30 (7:30 PM), dinner begins, and the app's default date
 * automatically switches to Tomorrow's Date (Date.now() + 1 Day).
 * Both the Food Count Screen and Mess Menu Screen initialize with this calculated date.
 */
export function getInitialDate(): Date {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();

  // Daily at 7:30 PM (19:30), switch default target to Tomorrow
  if (hours > 19 || (hours === 19 && minutes >= 30)) {
    const tomorrow = new Date();
    tomorrow.setDate(now.getDate() + 1);
    return tomorrow;
  }
  return now;
}

/**
 * Format a Date object to YYYY-MM-DD string
 */
export function formatDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Format date for friendly day navigation header:
 * Today (Oct 21) / Tomorrow (Oct 22) / Wednesday (Oct 23)
 */
export function formatDisplayDate(targetDate: Date): { main: string; sub: string } {
  const now = new Date();
  const todayStr = formatDateKey(now);

  const tomorrow = new Date();
  tomorrow.setDate(now.getDate() + 1);
  const tomorrowStr = formatDateKey(tomorrow);

  const targetStr = formatDateKey(targetDate);

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const month = monthNames[targetDate.getMonth()];
  const dayNum = targetDate.getDate();
  const dayName = dayNames[targetDate.getDay()];
  const formattedShort = `${month} ${dayNum}`;

  if (targetStr === todayStr) {
    return {
      main: `Today (${formattedShort})`,
      sub: `${dayName}, ${targetDate.getFullYear()}`
    };
  }

  if (targetStr === tomorrowStr) {
    return {
      main: `Tomorrow (${formattedShort})`,
      sub: `${dayName}, ${targetDate.getFullYear()}`
    };
  }

  return {
    main: `${dayName} (${formattedShort})`,
    sub: `${targetDate.getFullYear()}`
  };
}

/**
 * Rule C: Lock Status Evaluation Logic
 * Evaluates meal toggle interactivity and lock banner alerts.
 */
export function evaluateLockStatus(
  lockStatus: LockStatus,
  isLeave: boolean,
  isBreakfast: boolean,
  isLunchBox: boolean,
  pendingRequestStatus?: string
) {
  // Master & Group Locks
  const isMasterLocked = Boolean(lockStatus?.locked);
  const isAnyMainMealLocked = Boolean(
    lockStatus?.breakfastLocked || lockStatus?.lunchLocked || lockStatus?.dinnerLocked
  );

  // Individual Meal Toggles
  const canEditBreakfast = !isMasterLocked && !isLeave && !lockStatus?.breakfastLocked;
  const canEditLunch = !isMasterLocked && !isLeave && !lockStatus?.lunchLocked;
  const canEditSnack = !isMasterLocked && !isLeave && !lockStatus?.snackLocked;
  const canEditDinner = !isMasterLocked && !isLeave && !lockStatus?.dinnerLocked;
  const canEditLunchBox = !isMasterLocked && !isLeave && !lockStatus?.breakfastLocked && isBreakfast;

  // Availability / On Leave Toggle
  // Student CANNOT press leave if ANY lock except snacks is ON.
  // Student can change leave ONLY when master, breakfast, lunch, and dinner locks are all OFF.
  const canEditLeave =
    !isMasterLocked &&
    !lockStatus?.breakfastLocked &&
    !lockStatus?.lunchLocked &&
    !lockStatus?.dinnerLocked &&
    pendingRequestStatus !== 'PENDING';

  // Request Portal Condition:
  // Appears when student is On Leave AND main meals are locked, but master lock is open
  const canRequestMissedCount = isLeave && isAnyMainMealLocked && !isMasterLocked;

  return {
    isMasterLocked,
    isAnyMainMealLocked,
    canEditBreakfast,
    canEditLunch,
    canEditSnack,
    canEditDinner,
    canEditLunchBox,
    canEditLeave,
    canRequestMissedCount
  };
}

/**
 * Format timestamp into relative or time format
 */
export function formatTimeAgo(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const mins = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);

  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return 'Yesterday';
  return `${days}d ago`;
}
