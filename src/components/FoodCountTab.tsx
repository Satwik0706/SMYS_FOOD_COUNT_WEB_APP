import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { FoodCount, MissedCountRequest } from '../types';
import {
  saveFoodCount,
  subscribeFoodCount,
  subscribeMissedCountRequest
} from '../services/firestoreService';
import {
  getInitialDate,
  formatDateKey,
  formatDisplayDate,
  evaluateLockStatus
} from '../utils/rules';
import { MissedCountModal } from './MissedCountModal';
import confetti from 'canvas-confetti';
import {
  Sun,
  Utensils,
  Coffee,
  Moon,
  Briefcase,
  Lock,
  Unlock,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Clock,
  Send,
  MessageCircle,
  HelpCircle,
  UserX,
  UserCheck,
  RotateCcw
} from 'lucide-react';

export const FoodCountTab: React.FC = () => {
  const { user, lockStatus, adminWhatsApp, updateLocalUser } = useAuth();
  const [targetDate, setTargetDate] = useState<Date>(() => getInitialDate());
  const [breakfast, setBreakfast] = useState<boolean>(true);
  const [lunch, setLunch] = useState<boolean>(true);
  const [snack, setSnack] = useState<boolean>(true);
  const [dinner, setDinner] = useState<boolean>(true);
  const [lunchBox, setLunchBox] = useState<boolean>(false);
  const [isLeave, setIsLeave] = useState<boolean>(false);

  const [pendingRequest, setPendingRequest] = useState<MissedCountRequest | null>(null);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveMessage, setSaveMessage] = useState<string>('');

  const dateStr = formatDateKey(targetDate);
  const displayDate = formatDisplayDate(targetDate);
  const initialCalculated = getInitialDate();

  // Evaluate Lock Interactivity based on Rule C
  const evalLocks = evaluateLockStatus(
    lockStatus,
    isLeave,
    breakfast,
    lunchBox,
    pendingRequest?.status
  );

  // Subscribe to real-time foodcount doc: foodcounts/{studentId}_{YYYY-MM-DD}
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
        // Fallback to user's sticky preferences
        setBreakfast(user.breakfastPref ?? true);
        setLunch(user.lunchPref ?? true);
        setSnack(user.snackPref ?? true);
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

  // Save handler with atomic Firestore commit and celebratory feedback
  const handleToggleMeal = async (mealKey: 'breakfast' | 'lunch' | 'snack' | 'dinner' | 'lunchBox' | 'isLeave') => {
    let nextBreakfast = breakfast;
    let nextLunch = lunch;
    let nextSnack = snack;
    let nextDinner = dinner;
    let nextLunchBox = lunchBox;
    let nextIsLeave = isLeave;

    if (mealKey === 'isLeave') {
      const willBeOnLeave = !isLeave;
      nextIsLeave = willBeOnLeave;
      if (willBeOnLeave) {
        // Turning ON leave resets all meal counts to 0
        nextBreakfast = false;
        nextLunch = false;
        nextSnack = false;
        nextDinner = false;
        nextLunchBox = false;
      } else {
        // Turning OFF leave restores default preferences
        nextBreakfast = user.breakfastPref ?? true;
        nextLunch = user.lunchPref ?? true;
        nextSnack = user.snackPref ?? true;
        nextDinner = user.dinnerPref ?? true;
      }
    } else if (mealKey === 'breakfast') {
      nextBreakfast = !breakfast;
      if (!nextBreakfast) {
        // If breakfast is off, lunchBox cannot be active
        nextLunchBox = false;
      }
    } else if (mealKey === 'lunchBox') {
      nextLunchBox = !lunchBox;
      if (nextLunchBox) {
        // When lunchBox is active, lunch is included
        nextLunch = true;
      }
    } else if (mealKey === 'lunch') {
      nextLunch = !lunch;
    } else if (mealKey === 'snack') {
      nextSnack = !snack;
    } else if (mealKey === 'dinner') {
      nextDinner = !dinner;
    }

    // Update state immediately for instant response
    setBreakfast(nextBreakfast);
    setLunch(nextLunch);
    setSnack(nextSnack);
    setDinner(nextDinner);
    setLunchBox(nextLunchBox);
    setIsLeave(nextIsLeave);

    setIsSaving(true);
    setSaveMessage('Saving to Firestore...');

    try {
      await saveFoodCount(user.uid, dateStr, {
        breakfast: nextBreakfast,
        lunch: nextLunch,
        snack: nextSnack,
        dinner: nextDinner,
        lunchBox: nextLunchBox,
        isLeave: nextIsLeave
      });

      // Update local context
      updateLocalUser((prev) => ({
        ...prev,
        breakfastPref: nextBreakfast,
        lunchPref: nextLunch,
        snackPref: nextSnack,
        dinnerPref: nextDinner,
        isLeave: nextIsLeave
      }));

      setSaveMessage('Saved in real-time');
      setTimeout(() => setSaveMessage(''), 2500);

      // Micro celebratory confetti
      confetti({
        particleCount: 20,
        spread: 45,
        origin: { y: 0.8 },
        colors: ['#FF9800', '#4CAF50', '#2196F3']
      });
    } catch (err) {
      console.error('Failed to save food count:', err);
      setSaveMessage('Error saving preferences');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDaySelect = (isToday: boolean) => {
    const d = new Date();
    if (!isToday) {
      d.setDate(d.getDate() + 1);
    }
    setTargetDate(d);
  };

  return (
    <div className="space-y-4 pb-24 pt-2">
      {/* Date Switcher Pill Bar */}
      <div className="bg-white rounded-3xl p-3 shadow-xs border border-orange-100 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="p-2 rounded-xl bg-orange-100 text-orange-600">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-800">
              {displayDate.main}
            </h2>
            <p className="text-[11px] text-slate-500 font-medium">
              Target: <span className="font-mono font-semibold text-orange-700">{dateStr}</span>
            </p>
          </div>
        </div>

        {/* Quick Date Switch Buttons (Today / Tomorrow) */}
        <div className="flex items-center p-1 bg-slate-100 rounded-2xl text-xs font-semibold">
          <button
            onClick={() => handleDaySelect(true)}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              formatDateKey(targetDate) === formatDateKey(new Date())
                ? 'bg-white text-orange-600 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Today
          </button>
          <button
            onClick={() => handleDaySelect(false)}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              formatDateKey(targetDate) !== formatDateKey(new Date())
                ? 'bg-white text-orange-600 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Tomorrow
          </button>
        </div>
      </div>

      {/* Auto 7:40 PM Rule Tag */}
      <div className="flex items-center justify-between px-2 text-xs text-slate-500">
        <div className="flex items-center space-x-1.5">
          <Clock className="w-3.5 h-3.5 text-orange-500" />
          <span className="text-[11px]">7:40 PM Rule active (auto tomorrow switch)</span>
        </div>
        {saveMessage && (
          <span className="text-[11px] font-semibold text-emerald-600 flex items-center space-x-1 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100 animate-fade-in">
            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
            <span>{saveMessage}</span>
          </span>
        )}
      </div>

      {/* STATUS ALERT BANNERS */}
      {/* 1. Master Lock Banner */}
      {evalLocks.isMasterLocked && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 flex items-start space-x-3 shadow-xs">
          <Lock className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-xs">Submission Window Closed</h4>
            <p className="text-xs text-rose-700 mt-0.5">
              The submission window is currently closed. Master lock is active.
            </p>
          </div>
        </div>
      )}

      {/* 2. On Leave Banner */}
      {isLeave && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 flex items-start space-x-3 shadow-xs">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-xs">Status: On Leave</h4>
            <p className="text-xs text-rose-700 mt-0.5">
              You are currently ON LEAVE. All meals are locked and count is set to zero.
            </p>
          </div>
        </div>
      )}

      {/* 3. Main Meal Locked Banner */}
      {!evalLocks.isMasterLocked && !isLeave && evalLocks.isAnyMainMealLocked && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start space-x-3 shadow-xs">
          <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-xs">Main Meals Finalized</h4>
            <p className="text-xs text-amber-800 mt-0.5">
              Main meals are finalized. Changes are disabled by hostel mess admin.
            </p>
          </div>
        </div>
      )}

      {/* ON LEAVE / UNAVAILABLE CARD */}
      <div className="bg-white rounded-3xl p-5 shadow-xs border border-orange-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-colors ${
                isLeave ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-500'
              }`}
            >
              {isLeave ? <UserX className="w-5 h-5" /> : <UserCheck className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm">
                Mark as On Leave / Away
              </h3>
              <p className="text-xs text-slate-500">
                {isLeave
                  ? 'You are marked away (food not prepared)'
                  : 'Toggle if leaving hostel for the day'}
              </p>
            </div>
          </div>

          {/* Toggle Switch */}
          <button
            type="button"
            disabled={!evalLocks.canEditLeave}
            onClick={() => handleToggleMeal('isLeave')}
            className={`relative inline-flex h-7 w-13 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed ${
              isLeave ? 'bg-rose-500' : 'bg-slate-200'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                isLeave ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {!evalLocks.canEditLeave && (
          <p className="text-[11px] text-slate-400 mt-2.5 flex items-center space-x-1 pl-1">
            <Lock className="w-3 h-3 text-slate-400" />
            <span>Leave toggle locked after meal lock time or while request is pending</span>
          </p>
        )}
      </div>

      {/* MEAL PREFERENCES CARD */}
      <div className="bg-white rounded-3xl p-5 shadow-xs border border-orange-100 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-bold text-slate-800 text-sm">
              Daily Meal Preferences
            </h3>
            <p className="text-xs text-slate-500">
              Select the meals you plan to have at SMYS Mess
            </p>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">
            Realtime Sync
          </span>
        </div>

        {/* 1. Breakfast Toggle */}
        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-orange-50/40 border border-orange-100/80 transition-all">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-[#FF9800] text-white flex items-center justify-center shadow-xs">
              <Sun className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h4 className="font-bold text-slate-800 text-sm">Breakfast</h4>
                {!evalLocks.canEditBreakfast && (
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                )}
              </div>
              <p className="text-[11px] text-slate-500">7:30 AM - 9:00 AM</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span
              className={`text-xs font-semibold ${
                breakfast && !isLeave ? 'text-orange-600' : 'text-slate-400'
              }`}
            >
              {breakfast && !isLeave ? 'Opted In' : 'No'}
            </span>
            <button
              type="button"
              disabled={!evalLocks.canEditBreakfast}
              onClick={() => handleToggleMeal('breakfast')}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out disabled:opacity-40 disabled:cursor-not-allowed ${
                breakfast && !isLeave ? 'bg-orange-500' : 'bg-slate-300'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  breakfast && !isLeave ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* 1b. Lunch Box Sub-toggle (Appears under Breakfast when Breakfast is active) */}
        {breakfast && !isLeave && (
          <div className="ml-5 p-3 rounded-2xl bg-amber-50/80 border border-amber-200/80 flex items-center justify-between animate-fade-in">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-200/90 text-amber-800 flex items-center justify-center">
                <Briefcase className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <h5 className="font-bold text-slate-800 text-xs">Lunch Box Requested</h5>
                  {!evalLocks.canEditLunchBox && (
                    <Lock className="w-3 h-3 text-slate-400" />
                  )}
                </div>
                <p className="text-[10px] text-amber-900/80">
                  Pack meal for college / off-campus duty
                </p>
              </div>
            </div>

            <button
              type="button"
              disabled={!evalLocks.canEditLunchBox}
              onClick={() => handleToggleMeal('lunchBox')}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out disabled:opacity-40 disabled:cursor-not-allowed ${
                lunchBox ? 'bg-amber-600' : 'bg-slate-300'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  lunchBox ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        )}

        {/* 2. Lunch Toggle */}
        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-emerald-50/40 border border-emerald-100/80 transition-all">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-[#4CAF50] text-white flex items-center justify-center shadow-xs">
              <Utensils className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h4 className="font-bold text-slate-800 text-sm">Lunch</h4>
                {(!evalLocks.canEditLunch || lunchBox) && (
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                )}
              </div>
              <p className="text-[11px] text-slate-500">
                12:30 PM - 2:00 PM {lunchBox ? '(Covered by Lunch Box)' : ''}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span
              className={`text-xs font-semibold ${
                lunch && !isLeave ? 'text-emerald-600' : 'text-slate-400'
              }`}
            >
              {lunch && !isLeave ? 'Opted In' : 'No'}
            </span>
            <button
              type="button"
              disabled={!evalLocks.canEditLunch}
              onClick={() => handleToggleMeal('lunch')}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out disabled:opacity-40 disabled:cursor-not-allowed ${
                lunch && !isLeave ? 'bg-emerald-500' : 'bg-slate-300'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  lunch && !isLeave ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* 3. Snacks Toggle */}
        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-purple-50/40 border border-purple-100/80 transition-all">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-[#9C27B0] text-white flex items-center justify-center shadow-xs">
              <Coffee className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h4 className="font-bold text-slate-800 text-sm">Snacks & Tea</h4>
                {!evalLocks.canEditSnack && (
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                )}
              </div>
              <p className="text-[11px] text-slate-500">5:00 PM - 6:00 PM</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span
              className={`text-xs font-semibold ${
                snack && !isLeave ? 'text-purple-600' : 'text-slate-400'
              }`}
            >
              {snack && !isLeave ? 'Opted In' : 'No'}
            </span>
            <button
              type="button"
              disabled={!evalLocks.canEditSnack}
              onClick={() => handleToggleMeal('snack')}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out disabled:opacity-40 disabled:cursor-not-allowed ${
                snack && !isLeave ? 'bg-purple-600' : 'bg-slate-300'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  snack && !isLeave ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* 4. Dinner Toggle */}
        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-blue-50/40 border border-blue-100/80 transition-all">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-[#2196F3] text-white flex items-center justify-center shadow-xs">
              <Moon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h4 className="font-bold text-slate-800 text-sm">Dinner</h4>
                {!evalLocks.canEditDinner && (
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                )}
              </div>
              <p className="text-[11px] text-slate-500">7:30 PM - 9:00 PM</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span
              className={`text-xs font-semibold ${
                dinner && !isLeave ? 'text-blue-600' : 'text-slate-400'
              }`}
            >
              {dinner && !isLeave ? 'Opted In' : 'No'}
            </span>
            <button
              type="button"
              disabled={!evalLocks.canEditDinner}
              onClick={() => handleToggleMeal('dinner')}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out disabled:opacity-40 disabled:cursor-not-allowed ${
                dinner && !isLeave ? 'bg-blue-500' : 'bg-slate-300'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  dinner && !isLeave ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* MISSED COUNT REQUEST PORTAL */}
      {/* Appears when student is On Leave AND main meals are locked, but master lock is open */}
      {evalLocks.canRequestMissedCount && (
        <div className="p-5 rounded-3xl bg-amber-50 border border-amber-200/90 shadow-xs space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-800 text-sm">
                  Forgot to mark yourself as Present?
                </h4>
                <p className="text-[11px] text-amber-800">
                  Main meals are locked, but you can send a missed count request to Mess Admin.
                </p>
              </div>
            </div>
          </div>

          {pendingRequest ? (
            <div className="p-3.5 rounded-2xl bg-white border border-amber-200 flex flex-col space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">Request Status:</span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    pendingRequest.status === 'PENDING'
                      ? 'bg-amber-100 text-amber-800 border border-amber-200'
                      : pendingRequest.status === 'APPROVED'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : 'bg-rose-100 text-rose-800 border border-rose-200'
                  }`}
                >
                  {pendingRequest.status}
                </span>
              </div>

              <p className="text-[11px] text-slate-500">
                Requested for: {[
                  pendingRequest.breakfast ? 'Breakfast' : null,
                  pendingRequest.lunch ? 'Lunch' : null,
                  pendingRequest.dinner ? 'Dinner' : null
                ].filter(Boolean).join(', ')}
              </p>

              <a
                href={`https://wa.me/${adminWhatsApp}?text=${encodeURIComponent(
                  `Hi Admin, I (${user.name}, Roll: ${user.rollNumber}, Year: ${user.year}) submitted a missed food count request for ${dateStr}. Please verify and approve.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center justify-center space-x-1.5 transition-all"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Send to WhatsApp Admin</span>
              </a>
            </div>
          ) : (
            <button
              onClick={() => setIsRequestModalOpen(true)}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold text-xs shadow-md shadow-orange-500/20 flex items-center justify-center space-x-2 transition-all active:scale-[0.99]"
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
        onSubmitted={() => {
          setIsRequestModalOpen(false);
        }}
      />
    </div>
  );
};
