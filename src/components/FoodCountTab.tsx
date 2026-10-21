import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { MissedCountRequest } from '../types';
import {
  saveFoodCount,
  subscribeFoodCount,
  subscribeMissedCountRequest
} from '../services/firestoreService';
import {
  getInitialDate,
  formatDateKey,
  evaluateLockStatus
} from '../utils/rules';
import { MissedCountModal } from './MissedCountModal';
import {
  Lock,
  Info,
  Check,
  Send,
  MessageCircle,
  HelpCircle,
  UserX
} from 'lucide-react';

export const FoodCountTab: React.FC = () => {
  const { user, lockStatus, adminWhatsApp, updateLocalUser } = useAuth();
  const [targetDate] = useState<Date>(() => getInitialDate());

  const [breakfast, setBreakfast] = useState<boolean>(false);
  const [lunchBox, setLunchBox] = useState<boolean>(false);
  const [lunch, setLunch] = useState<boolean>(false);
  const [snack, setSnack] = useState<boolean>(false);
  const [dinner, setDinner] = useState<boolean>(true);
  const [isLeave, setIsLeave] = useState<boolean>(false);

  const [pendingRequest, setPendingRequest] = useState<MissedCountRequest | null>(null);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState<boolean>(false);

  const dateStr = formatDateKey(targetDate);

  // Evaluate Lock Interactivity directly from Database lockStatus & Rule C
  const evalLocks = evaluateLockStatus(
    lockStatus,
    isLeave,
    breakfast,
    lunchBox,
    pendingRequest?.status
  );

  useEffect(() => {
    if (!user) return;

    const unsubscribeFood = subscribeFoodCount(user.uid, dateStr, (countData) => {
      if (countData) {
        setBreakfast(countData.breakfast);
        setLunch(countData.lunch);
        setSnack(countData.snack);
        setDinner(countData.dinner);
        setLunchBox(countData.lunchBox || false);
        setIsLeave(countData.isLeave || false);
      } else {
        setBreakfast(user.breakfastPref ?? false);
        setLunch(user.lunchPref ?? false);
        setSnack(user.snackPref ?? false);
        setDinner(user.dinnerPref ?? true);
        setIsLeave(user.isLeave ?? false);
        setLunchBox(false);
      }
    });

    const unsubscribeReq = subscribeMissedCountRequest(user.uid, dateStr, (reqData) => {
      setPendingRequest(reqData);
    });

    return () => {
      unsubscribeFood();
      unsubscribeReq();
    };
  }, [user, dateStr]);

  if (!user) return null;

  // Leave rule: student CANNOT press leave if any one lock EXCEPT snacks lock is ON.
  // Student can change leave ONLY when master, breakfast, lunch, and dinner locks are all OFF.
  const canToggleLeave =
    !lockStatus.locked &&
    !lockStatus.breakfastLocked &&
    !lockStatus.lunchLocked &&
    !lockStatus.dinnerLocked;

  const handleToggleLeave = async () => {
    if (!canToggleLeave) return;

    const willBeOnLeave = !isLeave;
    let nextBreakfast = breakfast;
    let nextLunchBox = lunchBox;
    let nextLunch = lunch;
    let nextSnack = snack;
    let nextDinner = dinner;

    if (willBeOnLeave) {
      // If student presses leave, his food count will be reset to zero:
      nextBreakfast = false;
      nextLunchBox = false;
      nextLunch = false;
      nextSnack = false;
      nextDinner = false;
    } else {
      // When turning off leave, restore preferences
      nextBreakfast = user.breakfastPref ?? false;
      nextLunchBox = false;
      nextLunch = user.lunchPref ?? false;
      nextSnack = user.snackPref ?? false;
      nextDinner = user.dinnerPref ?? true;
    }

    setIsLeave(willBeOnLeave);
    setBreakfast(nextBreakfast);
    setLunchBox(nextLunchBox);
    setLunch(nextLunch);
    setSnack(nextSnack);
    setDinner(nextDinner);

    try {
      await saveFoodCount(user.uid, dateStr, {
        breakfast: nextBreakfast,
        lunch: nextLunch,
        snack: nextSnack,
        dinner: nextDinner,
        lunchBox: nextLunchBox,
        isLeave: willBeOnLeave
      });

      updateLocalUser((prev) => ({
        ...prev,
        breakfastPref: nextBreakfast,
        lunchPref: nextLunch,
        snackPref: nextSnack,
        dinnerPref: nextDinner,
        isLeave: willBeOnLeave
      }));
    } catch (err) {
      console.error('Error saving leave to database:', err);
    }
  };

  // Toggle meal and atomic sync to Firestore
  const handleToggle = async (mealKey: 'breakfast' | 'lunchBox' | 'lunch' | 'snack' | 'dinner') => {
    if (isLeave) return; // All meals locked when on leave!

    let nextBreakfast = breakfast;
    let nextLunchBox = lunchBox;
    let nextLunch = lunch;
    let nextSnack = snack;
    let nextDinner = dinner;

    if (mealKey === 'breakfast') {
      nextBreakfast = !breakfast;
      if (!nextBreakfast) nextLunchBox = false;
    } else if (mealKey === 'lunchBox') {
      nextLunchBox = !lunchBox;
      if (nextLunchBox) {
        nextLunch = true; // Lunch Box automatically covers Lunch
      }
    } else if (mealKey === 'lunch') {
      if (lunchBox) {
        return; // Lunch cannot be toggled when Lunch Box is marked!
      }
      nextLunch = !lunch;
    } else if (mealKey === 'snack') {
      nextSnack = !snack;
    } else if (mealKey === 'dinner') {
      nextDinner = !dinner;
    }

    setBreakfast(nextBreakfast);
    setLunchBox(nextLunchBox);
    setLunch(nextLunch);
    setSnack(nextSnack);
    setDinner(nextDinner);

    try {
      await saveFoodCount(user.uid, dateStr, {
        breakfast: nextBreakfast,
        lunch: nextLunch,
        snack: nextSnack,
        dinner: nextDinner,
        lunchBox: nextLunchBox,
        isLeave: isLeave
      });

      updateLocalUser((prev) => ({
        ...prev,
        breakfastPref: nextBreakfast,
        lunchPref: nextLunch,
        snackPref: nextSnack,
        dinnerPref: nextDinner,
        isLeave: isLeave
      }));
    } catch (err) {
      console.error('Error saving count to database:', err);
    }
  };

  return (
    <div className="space-y-4 pb-28 pt-3">
      {/* Title & Date (Matching Screenshot 5) */}
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight">
          Meal Attendance
        </h2>
        <p className="text-sm font-bold text-[#FF5722] mt-0.5">
          Date: {dateStr}
        </p>
      </div>

      {/* Alert Banner (Matching Screenshot 5) */}
      {isLeave ? (
        <div className="rounded-2xl bg-[#38181A] px-4 py-3.5 flex items-center space-x-3 text-white border border-[#542125]">
          <div className="w-5 h-5 rounded-full bg-rose-500/20 flex items-center justify-center text-rose-400 shrink-0">
            <Info className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-medium leading-relaxed text-rose-200">
            You are currently ON LEAVE. All meals are locked and food count is reset to 0.
          </span>
        </div>
      ) : evalLocks.isMasterLocked ? (
        <div className="rounded-2xl bg-[#2D2A35] px-4 py-3.5 flex items-center space-x-3 text-white border border-[#3E384A]">
          <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-white shrink-0">
            <Info className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-medium leading-relaxed">
            The submission window is currently closed.
          </span>
        </div>
      ) : evalLocks.isAnyMainMealLocked ? (
        <div className="rounded-2xl bg-[#2D2A35] px-4 py-3.5 flex items-center space-x-3 text-white border border-[#3E384A]">
          <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-white shrink-0">
            <Info className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-medium leading-relaxed">
            Main meals are finalized. Changes are disabled.
          </span>
        </div>
      ) : null}

      {/* Subheader (Matching Screenshot 5) */}
      <div className="pt-1">
        <h3 className="text-lg font-bold text-white tracking-tight">
          Today's Schedule
        </h3>
        <p className="text-xs text-[#888888] mt-0.5 font-normal">
          Select the meals you'll attend
        </p>
      </div>

      {/* Schedule Items List (Matching Screenshot 5) */}
      <div className="space-y-3">
        {/* On Leave Row */}
        <div className="rounded-2xl bg-[#141416] p-4 flex items-center justify-between border border-[#212328]">
          <div className="flex items-center space-x-3.5">
            <div
              className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                isLeave ? 'bg-[#3E1A1B] text-[#FF5252]' : 'bg-[#282B32] text-[#888888]'
              }`}
            >
              <UserX className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-base font-bold text-white leading-tight">
                On Leave
              </h4>
              <p className="text-xs text-[#888888] mt-0.5">
                {isLeave
                  ? 'Marked away (food count reset to zero)'
                  : !canToggleLeave
                  ? 'Locked by Admin (meal locks are active)'
                  : 'Toggle to mark away & reset meal count'}
              </p>
            </div>
          </div>

          {/* Switch Toggle */}
          <button
            type="button"
            disabled={!canToggleLeave}
            onClick={handleToggleLeave}
            className={`relative inline-flex h-7 w-12 shrink-0 rounded-full transition-colors duration-200 ease-in-out ${
              !canToggleLeave ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
            } ${isLeave ? 'bg-[#FF5252]' : 'bg-[#2A2D33]'}`}
          >
            <span
              className={`inline-flex items-center justify-center h-5 w-5 my-1 transform rounded-full transition duration-200 ease-in-out ${
                isLeave
                  ? 'translate-x-6 bg-white text-[#FF5252]'
                  : 'translate-x-1 bg-[#4A4E57] text-white'
              }`}
            >
              {!canToggleLeave ? (
                <Lock className="w-3 h-3 text-[#2A2D33]" />
              ) : isLeave ? (
                <Check className="w-3 h-3 stroke-[3]" />
              ) : null}
            </span>
          </button>
        </div>
        {/* 1. Breakfast */}
        <div className="rounded-2xl bg-[#141416] p-4 flex items-center justify-between border border-[#212328]">
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-2xl bg-[#282B32] text-[#888888] flex items-center justify-center shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-base font-bold text-white leading-tight">
                Breakfast
              </h4>
              <p className="text-xs text-[#888888] mt-0.5">
                {lockStatus.breakfastLocked ? 'Locked by Admin' : '7:30 am to 11:00 am'}
              </p>
            </div>
          </div>

          {/* Switch Toggle */}
          <button
            type="button"
            disabled={!evalLocks.canEditBreakfast}
            onClick={() => handleToggle('breakfast')}
            className={`relative inline-flex h-7 w-12 shrink-0 rounded-full transition-colors duration-200 ease-in-out cursor-pointer ${
              breakfast && !isLeave ? 'bg-[#FF5722]' : 'bg-[#2A2D33]'
            } ${!evalLocks.canEditBreakfast ? 'cursor-not-allowed opacity-80' : ''}`}
          >
            <span
              className={`inline-flex items-center justify-center h-5 w-5 my-1 transform rounded-full transition duration-200 ease-in-out ${
                breakfast && !isLeave
                  ? 'translate-x-6 bg-white text-[#FF5722]'
                  : 'translate-x-1 bg-[#4A4E57] text-white'
              }`}
            >
              {!evalLocks.canEditBreakfast ? (
                <Lock className="w-3 h-3 text-[#2A2D33]" />
              ) : breakfast ? (
                <Check className="w-3 h-3 stroke-[3]" />
              ) : null}
            </span>
          </button>
        </div>

        {/* 2. Lunch Box */}
        <div className="rounded-2xl bg-[#141416] p-4 flex items-center justify-between border border-[#212328]">
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-2xl bg-[#282B32] text-[#888888] flex items-center justify-center shrink-0">
              <Info className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-base font-bold text-white leading-tight">
                Lunch Box
              </h4>
              <p className="text-xs text-[#888888] mt-0.5">
                Carry-away meal
              </p>
            </div>
          </div>

          {/* Switch Toggle */}
          <button
            type="button"
            disabled={!evalLocks.canEditLunchBox}
            onClick={() => handleToggle('lunchBox')}
            className={`relative inline-flex h-7 w-12 shrink-0 rounded-full transition-colors duration-200 ease-in-out cursor-pointer ${
              lunchBox && !isLeave ? 'bg-[#FF5722]' : 'bg-[#2A2D33]'
            } ${!evalLocks.canEditLunchBox ? 'cursor-not-allowed opacity-80' : ''}`}
          >
            <span
              className={`inline-flex items-center justify-center h-5 w-5 my-1 transform rounded-full transition duration-200 ease-in-out ${
                lunchBox && !isLeave
                  ? 'translate-x-6 bg-white text-[#FF5722]'
                  : 'translate-x-1 bg-[#4A4E57] text-white'
              }`}
            >
              {lunchBox ? <Check className="w-3 h-3 stroke-[3]" /> : null}
            </span>
          </button>
        </div>

        {/* 3. Lunch */}
        <div className="rounded-2xl bg-[#141416] p-4 flex items-center justify-between border border-[#212328]">
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-2xl bg-[#282B32] text-[#888888] flex items-center justify-center shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-base font-bold text-white leading-tight">
                Lunch
              </h4>
              <p className="text-xs text-[#888888] mt-0.5">
                {lunchBox
                  ? 'Covered by Lunch Box'
                  : lockStatus.lunchLocked
                  ? 'Locked by Admin'
                  : '12:30 to 2:30 pm'}
              </p>
            </div>
          </div>

          {/* Switch Toggle */}
          <button
            type="button"
            disabled={!evalLocks.canEditLunch || lunchBox}
            onClick={() => {
              if (!lunchBox && evalLocks.canEditLunch) {
                handleToggle('lunch');
              }
            }}
            className={`relative inline-flex h-7 w-12 shrink-0 rounded-full transition-colors duration-200 ease-in-out ${
              !evalLocks.canEditLunch || lunchBox ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'
            } ${
              (lunch || lunchBox) && !isLeave ? 'bg-[#FF5722]' : 'bg-[#2A2D33]'
            }`}
          >
            <span
              className={`inline-flex items-center justify-center h-5 w-5 my-1 transform rounded-full transition duration-200 ease-in-out ${
                (lunch || lunchBox) && !isLeave
                  ? 'translate-x-6 bg-white text-[#FF5722]'
                  : 'translate-x-1 bg-[#4A4E57] text-white'
              }`}
            >
              {lunchBox ? (
                <Lock className="w-3 h-3 text-[#FF5722]" />
              ) : !evalLocks.canEditLunch ? (
                <Lock className="w-3 h-3 text-[#2A2D33]" />
              ) : lunch ? (
                <Check className="w-3 h-3 stroke-[3]" />
              ) : null}
            </span>
          </button>
        </div>

        {/* 4. Snacks */}
        <div className="rounded-2xl bg-[#141416] p-4 flex items-center justify-between border border-[#212328]">
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-2xl bg-[#282B32] text-[#888888] flex items-center justify-center shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-base font-bold text-white leading-tight">
                Snacks
              </h4>
              <p className="text-xs text-[#888888] mt-0.5">
                {lockStatus.snackLocked ? 'Locked by Admin' : '5:00 to 6:00 pm'}
              </p>
            </div>
          </div>

          {/* Switch Toggle */}
          <button
            type="button"
            disabled={!evalLocks.canEditSnack}
            onClick={() => handleToggle('snack')}
            className={`relative inline-flex h-7 w-12 shrink-0 rounded-full transition-colors duration-200 ease-in-out cursor-pointer ${
              snack && !isLeave ? 'bg-[#FF5722]' : 'bg-[#2A2D33]'
            } ${!evalLocks.canEditSnack ? 'cursor-not-allowed opacity-80' : ''}`}
          >
            <span
              className={`inline-flex items-center justify-center h-5 w-5 my-1 transform rounded-full transition duration-200 ease-in-out ${
                snack && !isLeave
                  ? 'translate-x-6 bg-white text-[#FF5722]'
                  : 'translate-x-1 bg-[#4A4E57] text-white'
              }`}
            >
              {!evalLocks.canEditSnack ? (
                <Lock className="w-3 h-3 text-[#2A2D33]" />
              ) : snack ? (
                <Check className="w-3 h-3 stroke-[3]" />
              ) : null}
            </span>
          </button>
        </div>

        {/* 5. Dinner (Active in Screenshot 5!) */}
        <div className="rounded-2xl bg-[#141416] p-4 flex items-center justify-between border border-[#212328]">
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-2xl bg-[#E53935] text-white flex items-center justify-center font-bold text-lg shrink-0">
              D
            </div>
            <div>
              <h4 className="text-base font-bold text-white leading-tight">
                Dinner
              </h4>
              <p className="text-xs text-[#888888] mt-0.5">
                {lockStatus.dinnerLocked ? 'Locked by Admin' : '07:30 PM - 09:30 PM'}
              </p>
            </div>
          </div>

          {/* Switch Toggle - Active Orange with Checkmark */}
          <button
            type="button"
            disabled={!evalLocks.canEditDinner}
            onClick={() => handleToggle('dinner')}
            className={`relative inline-flex h-7 w-12 shrink-0 rounded-full transition-colors duration-200 ease-in-out cursor-pointer ${
              dinner && !isLeave ? 'bg-[#FF5722]' : 'bg-[#2A2D33]'
            } ${!evalLocks.canEditDinner ? 'cursor-not-allowed opacity-80' : ''}`}
          >
            <span
              className={`inline-flex items-center justify-center h-5 w-5 my-1 transform rounded-full transition duration-200 ease-in-out ${
                dinner && !isLeave
                  ? 'translate-x-6 bg-white text-[#FF5722]'
                  : 'translate-x-1 bg-[#4A4E57] text-white'
              }`}
            >
              {!evalLocks.canEditDinner ? (
                <Lock className="w-3 h-3 text-[#2A2D33]" />
              ) : dinner ? (
                <Check className="w-3.5 h-3.5 stroke-[3] text-[#FF5722]" />
              ) : null}
            </span>
          </button>
        </div>
      </div>

      {/* Missed Count Request Section when Main Meals are Locked */}
      {evalLocks.canRequestMissedCount && (
        <div className="p-4 rounded-2xl bg-[#1F1D26] border border-[#3A324A] space-y-3 mt-4">
          <div className="flex items-start space-x-3">
            <HelpCircle className="w-5 h-5 text-[#FF9800] shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-white">
                Forgot to mark your food count?
              </h4>
              <p className="text-xs text-[#AAAAAA] mt-0.5">
                Main meals are locked. You can send a missed count request to mess administration.
              </p>
            </div>
          </div>

          {pendingRequest ? (
            <div className="p-3 rounded-xl bg-[#141416] border border-[#2B2B30] flex items-center justify-between">
              <div>
                <span className="text-[11px] text-[#888888]">Status: </span>
                <span className="text-xs font-bold text-[#FF9800]">
                  {pendingRequest.status}
                </span>
              </div>
              <a
                href={`https://wa.me/${adminWhatsApp}?text=${encodeURIComponent(
                  `Hi Admin, I (${user.name}) submitted a missed count request for ${dateStr}. Please approve.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center space-x-1"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>WhatsApp Admin</span>
              </a>
            </div>
          ) : (
            <button
              onClick={() => setIsRequestModalOpen(true)}
              className="w-full py-3 rounded-xl bg-[#FF5722] hover:bg-[#F4511E] text-white font-bold text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Send Request to Admin</span>
            </button>
          )}
        </div>
      )}

      {/* Missed Count Modal */}
      <MissedCountModal
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        student={user}
        dateStr={dateStr}
        adminWhatsApp={adminWhatsApp}
        onSubmitted={() => setIsRequestModalOpen(false)}
      />
    </div>
  );
};
