import React, { useState, useEffect } from 'react';
import { DailyMenu } from '../types';
import { getDailyMenu } from '../services/firestoreService';
import {
  getInitialDate,
  formatDateKey,
  formatDisplayDate
} from '../utils/rules';
import {
  ChevronLeft,
  ChevronRight,
  Sun,
  Utensils,
  Coffee,
  Moon,
  Sparkles,
  Calendar,
  RotateCcw,
  Clock
} from 'lucide-react';

export const MenuTab: React.FC = () => {
  // Rule A: Initializes with calculated 7:40 PM date
  const [currentDate, setCurrentDate] = useState<Date>(() => getInitialDate());
  const [menu, setMenu] = useState<DailyMenu | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const initialCalculatedDate = getInitialDate();

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

  const handlePrevDay = () => {
    const prev = new Date(currentDate);
    prev.setDate(prev.getDate() - 1);
    setCurrentDate(prev);
  };

  const handleNextDay = () => {
    const next = new Date(currentDate);
    next.setDate(next.getDate() + 1);
    setCurrentDate(next);
  };

  const handleResetToTarget = () => {
    setCurrentDate(initialCalculatedDate);
  };

  const displayInfo = formatDisplayDate(currentDate);
  const isTargetInitial = formatDateKey(currentDate) === formatDateKey(initialCalculatedDate);

  return (
    <div className="space-y-4 pb-20 pt-2">
      {/* Day Navigation Bar */}
      <div className="bg-white rounded-3xl p-3 shadow-xs border border-orange-100 flex items-center justify-between">
        <button
          onClick={handlePrevDay}
          title="Previous Day"
          className="p-2.5 rounded-2xl bg-slate-50 hover:bg-orange-50 text-slate-700 hover:text-orange-600 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="text-center px-2">
          <div className="flex items-center justify-center space-x-1.5">
            <Calendar className="w-3.5 h-3.5 text-orange-500" />
            <h2 className="text-base font-bold text-slate-800 tracking-tight">
              {displayInfo.main}
            </h2>
          </div>
          <p className="text-[11px] font-medium text-slate-400 mt-0.5">
            {displayInfo.sub}
          </p>
        </div>

        <button
          onClick={handleNextDay}
          title="Next Day"
          className="p-2.5 rounded-2xl bg-slate-50 hover:bg-orange-50 text-slate-700 hover:text-orange-600 transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Auto 7:40 PM Switch Notice & Reset Button */}
      <div className="flex items-center justify-between px-2 text-xs text-slate-500">
        <span className="flex items-center space-x-1">
          <Clock className="w-3.5 h-3.5 text-orange-500" />
          <span>7:40 PM Rule: Switches to Tomorrow automatically</span>
        </span>

        {!isTargetInitial && (
          <button
            onClick={handleResetToTarget}
            className="flex items-center space-x-1 text-orange-600 hover:text-orange-700 font-semibold text-[11px] bg-orange-50 px-2 py-0.5 rounded-lg border border-orange-100"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Target Day</span>
          </button>
        )}
      </div>

      {loading || !menu ? (
        <div className="p-12 text-center text-slate-400 text-xs">
          Loading daily mess menu...
        </div>
      ) : (
        <div className="space-y-3.5">
          {/* 1. Breakfast Card (Orange border / accent) */}
          <div className="bg-white rounded-3xl p-5 border-l-4 border-l-[#FF9800] border border-orange-100/70 shadow-xs relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shadow-xs">
                  <Sun className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">Breakfast</h3>
                  <p className="text-[11px] font-semibold text-orange-600 flex items-center space-x-1">
                    <span>{menu.breakfast.timing || '7:30 AM - 9:00 AM'}</span>
                  </p>
                </div>
              </div>

              {menu.breakfast.special && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-50 text-orange-700 border border-orange-200 flex items-center space-x-1">
                  <Sparkles className="w-3 h-3 text-orange-500" />
                  <span>{menu.breakfast.special}</span>
                </span>
              )}
            </div>

            <ul className="space-y-1.5 pl-1 text-xs text-slate-700">
              {menu.breakfast.items.map((item, idx) => (
                <li key={idx} className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-400"></span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* 2. Lunch Card (Green border / accent) */}
          <div className="bg-white rounded-3xl p-5 border-l-4 border-l-[#4CAF50] border border-emerald-100/70 shadow-xs relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-xs">
                  <Utensils className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">Lunch</h3>
                  <p className="text-[11px] font-semibold text-emerald-600 flex items-center space-x-1">
                    <span>{menu.lunch.timing || '12:30 PM - 2:00 PM'}</span>
                  </p>
                </div>
              </div>

              {menu.lunch.special && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center space-x-1">
                  <Sparkles className="w-3 h-3 text-emerald-500" />
                  <span>{menu.lunch.special}</span>
                </span>
              )}
            </div>

            <ul className="space-y-1.5 pl-1 text-xs text-slate-700">
              {menu.lunch.items.map((item, idx) => (
                <li key={idx} className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* 3. Snacks Card (Purple border / accent) */}
          <div className="bg-white rounded-3xl p-5 border-l-4 border-l-[#9C27B0] border border-purple-100/70 shadow-xs relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center shadow-xs">
                  <Coffee className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">Snacks & Refreshment</h3>
                  <p className="text-[11px] font-semibold text-purple-600 flex items-center space-x-1">
                    <span>{menu.snack.timing || '5:00 PM - 6:00 PM'}</span>
                  </p>
                </div>
              </div>

              {menu.snack.special && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 flex items-center space-x-1">
                  <Sparkles className="w-3 h-3 text-purple-500" />
                  <span>{menu.snack.special}</span>
                </span>
              )}
            </div>

            <ul className="space-y-1.5 pl-1 text-xs text-slate-700">
              {menu.snack.items.map((item, idx) => (
                <li key={idx} className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* 4. Dinner Card (Blue border / accent) */}
          <div className="bg-white rounded-3xl p-5 border-l-4 border-l-[#2196F3] border border-blue-100/70 shadow-xs relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shadow-xs">
                  <Moon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">Dinner</h3>
                  <p className="text-[11px] font-semibold text-blue-600 flex items-center space-x-1">
                    <span>{menu.dinner.timing || '7:30 PM - 9:00 PM'}</span>
                  </p>
                </div>
              </div>

              {menu.dinner.special && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 flex items-center space-x-1">
                  <Sparkles className="w-3 h-3 text-blue-500" />
                  <span>{menu.dinner.special}</span>
                </span>
              )}
            </div>

            <ul className="space-y-1.5 pl-1 text-xs text-slate-700">
              {menu.dinner.items.map((item, idx) => (
                <li key={idx} className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
