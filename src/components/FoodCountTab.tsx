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
        nextLunch = false; // Mutually exclusive: if Lunch Box is selected, NO Lunch!
      }
    } else if (mealKey === 'lunch') {
      nextLunch = !lunch;
      if (nextLunch) {
        nextLunchBox = false; // Mutually exclusive: if Lunch is selected, NO Lunch Box!
      }
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

      {/* Schedule Items List */}
      <div className="space-y-3">
        {/* On Leave Row */}
        <div
          className={`rounded-2xl p-4 flex items-center justify-between border transition-all duration-200 ${
            !canToggleLeave
              ? 'opacity-40 bg-[#121214] border-[#1A1A1E]'
              : 'bg-[#141416] border-[#212328]'
          }`}
        >
          <div className="flex items-center space-x-3.5">
            <div
              className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 transition-colors ${
                isLeave
                  ? 'bg-[#3E1A1B] text-[#FF5252] border border-[#FF5252]/40 shadow-[0_0_12px_rgba(255,82,82,0.2)]'
                  : !canToggleLeave
                  ? 'bg-[#1C1D21] text-[#60646D] border border-[#252830]'
                  : 'bg-[#282B32] text-[#AAAAAA]'
              }`}
            >
              <UserX className="w-5 h-5" />
            </div>
            <div>
              <h4
                className={`text-base font-bold leading-tight ${
                  !canToggleLeave ? 'text-[#717682]' : 'text-white'
                }`}
              >
                On Leave
              </h4>
              <p
                className={`text-xs mt-0.5 ${
                  !canToggleLeave ? 'text-[#525760]' : 'text-[#888888]'
                }`}
              >
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
              !canToggleLeave ? 'cursor-not-allowed opacity-50 bg-[#1E2024]' : 'cursor-pointer'
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
                <Lock className="w-3 h-3 text-[#3A3E47]" />
              ) : isLeave ? (
                <Check className="w-3 h-3 stroke-[3]" />
              ) : null}
            </span>
          </button>
        </div>

        {/* 1. Breakfast */}
        <div
          className={`rounded-2xl p-4 flex items-center justify-between border transition-all duration-200 ${
            !evalLocks.canEditBreakfast
              ? 'opacity-40 bg-[#121214] border-[#1A1A1E]'
              : 'bg-[#141416] border-[#212328] hover:border-[#2F323A]'
          }`}
        >
          <div className="flex items-center space-x-3.5">
            <div
              className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 transition-colors ${
                !evalLocks.canEditBreakfast
                  ? 'bg-[#1C1D21] text-[#60646D] border border-[#252830]'
                  : 'bg-[#0288D1]/20 text-[#29B6F6] border border-[#0288D1]/40 shadow-[0_0_12px_rgba(2,136,209,0.15)] font-bold text-lg'
              }`}
            >
              {!evalLocks.canEditBreakfast ? (
                <Lock className="w-5 h-5 text-[#60646D]" />
              ) : (
                'B'
              )}
            </div>
            <div>
              <h4
                className={`text-base font-bold leading-tight ${
                  !evalLocks.canEditBreakfast ? 'text-[#717682]' : 'text-white'
                }`}
              >
                Breakfast
              </h4>
              <p
                className={`text-xs mt-0.5 ${
                  !evalLocks.canEditBreakfast ? 'text-[#525760]' : 'text-[#888888]'
                }`}
              >
                {!evalLocks.canEditBreakfast
                  ? lockStatus.breakfastLocked
                    ? 'Locked by Admin'
                    : isLeave
                    ? 'Locked (On Leave)'
                    : 'Locked'
                  : '7:30 am to 11:00 am'}
              </p>
            </div>
          </div>

          {/* Switch Toggle */}
          <button
            type="button"
            disabled={!evalLocks.canEditBreakfast}
            onClick={() => handleToggle('breakfast')}
            className={`relative inline-flex h-7 w-12 shrink-0 rounded-full transition-colors duration-200 ease-in-out ${
              !evalLocks.canEditBreakfast ? 'cursor-not-allowed opacity-50 bg-[#1E2024]' : 'cursor-pointer'
            } ${breakfast && !isLeave ? 'bg-[#FF5722]' : 'bg-[#2A2D33]'}`}
          >
            <span
              className={`inline-flex items-center justify-center h-5 w-5 my-1 transform rounded-full transition duration-200 ease-in-out ${
                breakfast && !isLeave
                  ? 'translate-x-6 bg-white text-[#FF5722]'
                  : 'translate-x-1 bg-[#4A4E57] text-white'
              }`}
            >
              {!evalLocks.canEditBreakfast ? (
                <Lock className="w-3 h-3 text-[#3A3E47]" />
              ) : breakfast ? (
                <Check className="w-3 h-3 stroke-[3]" />
              ) : null}
            </span>
          </button>
        </div>

        {/* 2. Lunch Box */}
        <div
          className={`rounded-2xl p-4 flex items-center justify-between border transition-all duration-200 ${
            !evalLocks.canEditLunchBox
              ? 'opacity-40 bg-[#121214] border-[#1A1A1E]'
              : 'bg-[#141416] border-[#212328] hover:border-[#2F323A]'
          }`}
        >
          <div className="flex items-center space-x-3.5">
            <div
              className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 transition-colors ${
                !evalLocks.canEditLunchBox
                  ? 'bg-[#1C1D21] text-[#60646D] border border-[#252830]'
                  : 'bg-[#00897B]/20 text-[#26A69A] border border-[#00897B]/40 shadow-[0_0_12px_rgba(0,137,123,0.15)] font-bold text-sm'
              }`}
            >
              {!evalLocks.canEditLunchBox ? (
                <Info className="w-5 h-5 text-[#60646D]" />
              ) : (
                'LB'
              )}
            </div>
            <div>
              <h4
                className={`text-base font-bold leading-tight ${
                  !evalLocks.canEditLunchBox ? 'text-[#717682]' : 'text-white'
                }`}
              >
                Lunch Box
              </h4>
              <p
                className={`text-xs mt-0.5 ${
                  !evalLocks.canEditLunchBox ? 'text-[#525760]' : 'text-[#26A69A]'
                }`}
              >
                {!evalLocks.canEditLunchBox
                  ? !breakfast
                    ? 'Requires Breakfast'
                    : 'Locked by Admin'
                  : 'Carry-away meal'}
              </p>
            </div>
          </div>

          {/* Switch Toggle */}
          <button
            type="button"
            disabled={!evalLocks.canEditLunchBox}
            onClick={() => handleToggle('lunchBox')}
            className={`relative inline-flex h-7 w-12 shrink-0 rounded-full transition-colors duration-200 ease-in-out ${
              !evalLocks.canEditLunchBox ? 'cursor-not-allowed opacity-50 bg-[#1E2024]' : 'cursor-pointer'
            } ${lunchBox && !isLeave ? 'bg-[#FF5722]' : 'bg-[#2A2D33]'}`}
          >
            <span
              className={`inline-flex items-center justify-center h-5 w-5 my-1 transform rounded-full transition duration-200 ease-in-out ${
                lunchBox && !isLeave
                  ? 'translate-x-6 bg-white text-[#FF5722]'
                  : 'translate-x-1 bg-[#4A4E57] text-white'
              }`}
            >
              {!evalLocks.canEditLunchBox ? (
                <Lock className="w-3 h-3 text-[#3A3E47]" />
              ) : lunchBox ? (
                <Check className="w-3 h-3 stroke-[3]" />
              ) : null}
            </span>
          </button>
        </div>

        {/* 3. Lunch */}
        <div
          className={`rounded-2xl p-4 flex items-center justify-between border transition-all duration-200 ${
            !evalLocks.canEditLunch
              ? 'opacity-40 bg-[#121214] border-[#1A1A1E]'
              : 'bg-[#141416] border-[#212328] hover:border-[#2F323A]'
          }`}
        >
          <div className="flex items-center space-x-3.5">
            <div
              className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 transition-colors ${
                !evalLocks.canEditLunch
                  ? 'bg-[#1C1D21] text-[#60646D] border border-[#252830]'
                  : 'bg-[#FFA000]/20 text-[#FFC107] border border-[#FFA000]/40 shadow-[0_0_12px_rgba(255,160,0,0.15)] font-bold text-lg'
              }`}
            >
              {!evalLocks.canEditLunch ? (
                <Lock className="w-5 h-5 text-[#60646D]" />
              ) : (
                'L'
              )}
            </div>
            <div>
              <h4
                className={`text-base font-bold leading-tight ${
                  !evalLocks.canEditLunch ? 'text-[#717682]' : 'text-white'
                }`}
              >
                Lunch
              </h4>
              <p
                className={`text-xs mt-0.5 ${
                  !evalLocks.canEditLunch ? 'text-[#525760]' : 'text-[#888888]'
                }`}
              >
                {!evalLocks.canEditLunch
                  ? lockStatus.lunchLocked
                    ? 'Locked by Admin'
                    : isLeave
                    ? 'Locked (On Leave)'
                    : 'Locked'
                  : '12:30 to 2:30 pm'}
              </p>
            </div>
          </div>

          {/* Switch Toggle */}
          <button
            type="button"
            disabled={!evalLocks.canEditLunch}
            onClick={() => handleToggle('lunch')}
            className={`relative inline-flex h-7 w-12 shrink-0 rounded-full transition-colors duration-200 ease-in-out ${
              !evalLocks.canEditLunch ? 'cursor-not-allowed opacity-50 bg-[#1E2024]' : 'cursor-pointer'
            } ${lunch && !isLeave ? 'bg-[#FF5722]' : 'bg-[#2A2D33]'}`}
          >
            <span
              className={`inline-flex items-center justify-center h-5 w-5 my-1 transform rounded-full transition duration-200 ease-in-out ${
                lunch && !isLeave
                  ? 'translate-x-6 bg-white text-[#FF5722]'
                  : 'translate-x-1 bg-[#4A4E57] text-white'
              }`}
            >
              {!evalLocks.canEditLunch ? (
                <Lock className="w-3 h-3 text-[#3A3E47]" />
              ) : lunch ? (
                <Check className="w-3 h-3 stroke-[3]" />
              ) : null}
            </span>
          </button>
        </div>

        {/* 4. Snacks */}
        <div
          className={`rounded-2xl p-4 flex items-center justify-between border transition-all duration-200 ${
            !evalLocks.canEditSnack
              ? 'opacity-40 bg-[#121214] border-[#1A1A1E]'
              : 'bg-[#141416] border-[#212328] hover:border-[#2F323A]'
          }`}
        >
          <div className="flex items-center space-x-3.5">
            <div
              className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 transition-colors ${
                !evalLocks.canEditSnack
                  ? 'bg-[#1C1D21] text-[#60646D] border border-[#252830]'
                  : 'bg-[#AB47BC]/20 text-[#CE93D8] border border-[#AB47BC]/40 shadow-[0_0_12px_rgba(171,71,188,0.15)] font-bold text-lg'
              }`}
            >
              {!evalLocks.canEditSnack ? (
                <Lock className="w-5 h-5 text-[#60646D]" />
              ) : (
                'S'
              )}
            </div>
            <div>
              <h4
                className={`text-base font-bold leading-tight ${
                  !evalLocks.canEditSnack ? 'text-[#717682]' : 'text-white'
                }`}
              >
                Snacks
              </h4>
              <p
                className={`text-xs mt-0.5 ${
                  !evalLocks.canEditSnack ? 'text-[#525760]' : 'text-[#888888]'
                }`}
              >
                {!evalLocks.canEditSnack
                  ? lockStatus.snackLocked
                    ? 'Locked by Admin'
                    : isLeave
                    ? 'Locked (On Leave)'
                    : 'Locked'
                  : '5:00 to 6:00 pm'}
              </p>
            </div>
          </div>

          {/* Switch Toggle */}
          <button
            type="button"
            disabled={!evalLocks.canEditSnack}
            onClick={() => handleToggle('snack')}
            className={`relative inline-flex h-7 w-12 shrink-0 rounded-full transition-colors duration-200 ease-in-out ${
              !evalLocks.canEditSnack ? 'cursor-not-allowed opacity-50 bg-[#1E2024]' : 'cursor-pointer'
            } ${snack && !isLeave ? 'bg-[#FF5722]' : 'bg-[#2A2D33]'}`}
          >
            <span
              className={`inline-flex items-center justify-center h-5 w-5 my-1 transform rounded-full transition duration-200 ease-in-out ${
                snack && !isLeave
                  ? 'translate-x-6 bg-white text-[#FF5722]'
                  : 'translate-x-1 bg-[#4A4E57] text-white'
              }`}
            >
              {!evalLocks.canEditSnack ? (
                <Lock className="w-3 h-3 text-[#3A3E47]" />
              ) : snack ? (
                <Check className="w-3 h-3 stroke-[3]" />
              ) : null}
            </span>
          </button>
        </div>

        {/* 5. Dinner */}
        <div
          className={`rounded-2xl p-4 flex items-center justify-between border transition-all duration-200 ${
            !evalLocks.canEditDinner
              ? 'opacity-40 bg-[#121214] border-[#1A1A1E]'
              : 'bg-[#141416] border-[#212328] hover:border-[#2F323A]'
          }`}
        >
          <div className="flex items-center space-x-3.5">
            <div
              className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 transition-colors ${
                !evalLocks.canEditDinner
                  ? 'bg-[#1C1D21] text-[#60646D] border border-[#252830]'
                  : 'bg-[#E53935] text-white border border-[#FF5252]/40 shadow-[0_0_14px_rgba(229,57,53,0.3)] font-bold text-lg'
              }`}
            >
              {!evalLocks.canEditDinner ? (
                <Lock className="w-5 h-5 text-[#60646D]" />
              ) : (
                'D'
              )}
            </div>
            <div>
              <h4
                className={`text-base font-bold leading-tight ${
                  !evalLocks.canEditDinner ? 'text-[#717682]' : 'text-white'
                }`}
              >
                Dinner
              </h4>
              <p
                className={`text-xs mt-0.5 ${
                  !evalLocks.canEditDinner ? 'text-[#525760]' : 'text-[#888888]'
                }`}
              >
                {!evalLocks.canEditDinner
                  ? lockStatus.dinnerLocked
                    ? 'Locked by Admin'
                    : isLeave
                    ? 'Locked (On Leave)'
                    : 'Locked'
                  : '07:30 PM - 09:30 PM'}
              </p>
            </div>
          </div>

          {/* Switch Toggle */}
          <button
            type="button"
            disabled={!evalLocks.canEditDinner}
            onClick={() => handleToggle('dinner')}
            className={`relative inline-flex h-7 w-12 shrink-0 rounded-full transition-colors duration-200 ease-in-out ${
              !evalLocks.canEditDinner ? 'cursor-not-allowed opacity-50 bg-[#1E2024]' : 'cursor-pointer'
            } ${dinner && !isLeave ? 'bg-[#FF5722]' : 'bg-[#2A2D33]'}`}
          >
            <span
              className={`inline-flex items-center justify-center h-5 w-5 my-1 transform rounded-full transition duration-200 ease-in-out ${
                dinner && !isLeave
                  ? 'translate-x-6 bg-white text-[#FF5722]'
                  : 'translate-x-1 bg-[#4A4E57] text-white'
              }`}
            >
              {!evalLocks.canEditDinner ? (
                <Lock className="w-3 h-3 text-[#3A3E47]" />
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
