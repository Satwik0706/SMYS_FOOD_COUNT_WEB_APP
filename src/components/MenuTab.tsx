import React, { useState, useEffect } from 'react';
import { DailyMenu } from '../types';
import { getDailyMenu } from '../services/firestoreService';
import { getInitialDate, formatDateKey } from '../utils/rules';
import { ChevronLeft, ChevronRight, Utensils, Coffee, Moon } from 'lucide-react';

export const MenuTab: React.FC = () => {
  // Rule A: Initializes with 7:40 PM calculated date
  const [currentDate, setCurrentDate] = useState<Date>(() => getInitialDate());
  const [menu, setMenu] = useState<DailyMenu | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    const dateKey = formatDateKey(currentDate);
    getDailyMenu(dateKey, currentDate).then((data) => {
      if (isMounted) {
        setMenu(data);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [currentDate]);

  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  const todayKey = formatDateKey(today);
  const tomorrowKey = formatDateKey(tomorrow);
  const currentKey = formatDateKey(currentDate);

  const isToday = currentKey === todayKey;
  const isTomorrow = currentKey === tomorrowKey;

  const handlePrevDay = () => {
    // Students can only see Today and Tomorrow
    if (!isToday) {
      setCurrentDate(new Date(today));
    }
  };

  const handleNextDay = () => {
    // Students are able to see only one day ahead of today (Tomorrow)
    if (!isTomorrow) {
      setCurrentDate(new Date(tomorrow));
    }
  };

  const dateStatus = isToday ? 'Today' : 'Tomorrow';
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const formattedDay = `${monthNames[currentDate.getMonth()]} ${currentDate.getDate()}`;

  return (
    <div className="space-y-4 pb-24 pt-3">
      {/* Header (Matching Screenshot 4) */}
      <div>
        <h2 className="text-2xl font-bold text-[#FF5722] tracking-tight">
          Mess Menu
        </h2>
        <p className="text-xs text-[#888888] mt-0.5 font-normal">
          Check out what's cooking in the mess
        </p>
      </div>

      {/* Date Navigation Bar (Matching Screenshot 4) */}
      <div className="rounded-2xl bg-[#202024] p-3 flex items-center justify-between border border-[#2D2D32]">
        <button
          onClick={handlePrevDay}
          disabled={isToday}
          className={`p-2 transition-colors ${
            isToday ? 'text-[#444448] cursor-not-allowed' : 'text-white hover:text-[#FF5722] cursor-pointer'
          }`}
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="text-center">
          <p className="text-xs font-semibold text-[#FF5722] leading-none mb-1">
            {dateStatus}
          </p>
          <h3 className="text-base font-bold text-white tracking-tight leading-none">
            {formattedDay}
          </h3>
        </div>

        <button
          onClick={handleNextDay}
          disabled={isTomorrow}
          className={`p-2 transition-colors ${
            isTomorrow ? 'text-[#444448] cursor-not-allowed' : 'text-white hover:text-[#FF5722] cursor-pointer'
          }`}
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center text-[#777777] text-xs">
          Loading mess menu...
        </div>
      ) : !menu ? (
        <div className="rounded-2xl bg-[#1F1F21] p-10 text-center border border-[#2B2B2E] my-6">
          <p className="text-sm text-[#9E9E9E]">
            No menu posted for this date.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* 1. Breakfast Card (Matching Screenshot 4) */}
          <div className="rounded-3xl overflow-hidden border border-[#1F2C35] shadow-lg">
            {/* Header Bar */}
            <div className="bg-[#0C3549] px-4 py-3 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-[#00A8FF] text-white flex items-center justify-center font-bold shadow-xs">
                  {/* Croissant / Breakfast glyph */}
                  <span className="text-lg">🥐</span>
                </div>
                <h4 className="text-lg font-bold text-white tracking-tight">
                  Breakfast
                </h4>
              </div>

              <div className="px-3 py-1 rounded-xl bg-[#08222F] border border-[#13445C] text-[#29B6F6] text-xs font-semibold">
                {menu.breakfast.timing || '7:30 am to 11:00 am'}
              </div>
            </div>

            {/* Content Body */}
            <div className="bg-[#18181A] px-5 py-4">
              <ul className="space-y-1.5 text-base font-medium text-white">
                {menu.breakfast.items.map((item, idx) => (
                  <li key={idx} className="flex items-center space-x-2.5">
                    <span className="text-[#00A8FF] text-xl leading-none">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* 2. Lunch Card (Matching Screenshot 4) */}
          <div className="rounded-3xl overflow-hidden border border-[#3E3516] shadow-lg">
            {/* Header Bar */}
            <div className="bg-[#3B3410] px-4 py-3 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-[#FFC107] text-slate-900 flex items-center justify-center font-bold shadow-xs">
                  <Utensils className="w-5 h-5 text-slate-900" />
                </div>
                <h4 className="text-lg font-bold text-white tracking-tight">
                  Lunch
                </h4>
              </div>

              <div className="px-3 py-1 rounded-xl bg-[#26210A] border border-[#4F4616] text-[#FFD54F] text-xs font-semibold">
                {menu.lunch.timing || '12:30 to 2:30 pm'}
              </div>
            </div>

            {/* Content Body */}
            <div className="bg-[#18181A] px-5 py-4">
              <ul className="space-y-1.5 text-base font-medium text-white">
                {menu.lunch.items.map((item, idx) => (
                  <li key={idx} className="flex items-center space-x-2.5">
                    <span className="text-[#FFC107] text-xl leading-none">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* 3. Snacks Card */}
          <div className="rounded-3xl overflow-hidden border border-[#351E3D] shadow-lg">
            {/* Header Bar */}
            <div className="bg-[#331C3B] px-4 py-3 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-[#BA68C8] text-white flex items-center justify-center font-bold shadow-xs">
                  <Coffee className="w-5 h-5 text-white" />
                </div>
                <h4 className="text-lg font-bold text-white tracking-tight">
                  Snacks
                </h4>
              </div>

              <div className="px-3 py-1 rounded-xl bg-[#211126] border border-[#4A2554] text-[#CE93D8] text-xs font-semibold">
                {menu.snack.timing || '5:00 to 6:00 pm'}
              </div>
            </div>

            {/* Content Body */}
            <div className="bg-[#18181A] px-5 py-4">
              <ul className="space-y-1.5 text-base font-medium text-white">
                {menu.snack.items.map((item, idx) => (
                  <li key={idx} className="flex items-center space-x-2.5">
                    <span className="text-[#BA68C8] text-xl leading-none">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* 4. Dinner Card */}
          <div className="rounded-3xl overflow-hidden border border-[#2B2338] shadow-lg">
            {/* Header Bar */}
            <div className="bg-[#241F3B] px-4 py-3 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-[#7986CB] text-white flex items-center justify-center font-bold shadow-xs">
                  <Moon className="w-5 h-5 text-white" />
                </div>
                <h4 className="text-lg font-bold text-white tracking-tight">
                  Dinner
                </h4>
              </div>

              <div className="px-3 py-1 rounded-xl bg-[#171426] border border-[#362E54] text-[#9FA8DA] text-xs font-semibold">
                {menu.dinner.timing || '7:30 to 9:30 pm'}
              </div>
            </div>

            {/* Content Body */}
            <div className="bg-[#18181A] px-5 py-4">
              <ul className="space-y-1.5 text-base font-medium text-white">
                {menu.dinner.items.map((item, idx) => (
                  <li key={idx} className="flex items-center space-x-2.5">
                    <span className="text-[#7986CB] text-xl leading-none">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
