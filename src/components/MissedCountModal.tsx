import React, { useState } from 'react';
import { StudentUser } from '../types';
import { submitMissedCountRequest } from '../services/firestoreService';
import { X, Send, MessageCircle, AlertCircle, CheckCircle } from 'lucide-react';

interface MissedCountModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: StudentUser;
  dateStr: string;
  adminWhatsApp: string;
  onSubmitted: () => void;
}

export const MissedCountModal: React.FC<MissedCountModalProps> = ({
  isOpen,
  onClose,
  student,
  dateStr,
  adminWhatsApp,
  onSubmitted
}) => {
  const [breakfast, setBreakfast] = useState(true);
  const [lunch, setLunch] = useState(true);
  const [dinner, setDinner] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await submitMissedCountRequest({
        studentId: student.uid,
        studentName: student.name,
        studentYear: student.year,
        date: dateStr,
        breakfast,
        lunch,
        dinner,
        status: 'PENDING'
      });
      setIsSuccess(true);
      onSubmitted();
    } catch (err) {
      console.error('Request submission error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const mealsRequestedList = [
    breakfast ? 'Breakfast' : null,
    lunch ? 'Lunch' : null,
    dinner ? 'Dinner' : null
  ].filter(Boolean).join(', ');

  const whatsappMessage = `Hi Admin, I (${student.name}, Roll: ${student.rollNumber}, Year: ${student.year}) missed my food count for ${dateStr}. Please approve my missed count request for: ${mealsRequestedList || 'All Meals'}.`;
  const whatsappUrl = `https://wa.me/${adminWhatsApp}?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl border border-orange-100 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
        >
          <X className="w-5 h-5" />
        </button>

        {!isSuccess ? (
          <>
            <div className="flex items-center space-x-2.5 mb-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-base">
                  Missed Food Count Request
                </h3>
                <p className="text-[11px] text-slate-500">
                  Target Date: {dateStr}
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 mb-4 leading-relaxed bg-amber-50/70 p-3 rounded-xl border border-amber-200/60">
              You were marked <strong>On Leave</strong> when meal slots locked. Select the meals you need admin approval for:
            </p>

            <form onSubmit={handleSubmit} className="space-y-3">
              <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                <span className="text-xs font-semibold text-slate-800">Breakfast (7:30 - 9:00 AM)</span>
                <input
                  type="checkbox"
                  checked={breakfast}
                  onChange={(e) => setBreakfast(e.target.checked)}
                  className="w-4 h-4 rounded text-orange-600 focus:ring-orange-500"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                <span className="text-xs font-semibold text-slate-800">Lunch (12:30 - 2:00 PM)</span>
                <input
                  type="checkbox"
                  checked={lunch}
                  onChange={(e) => setLunch(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                <span className="text-xs font-semibold text-slate-800">Dinner (7:30 - 9:00 PM)</span>
                <input
                  type="checkbox"
                  checked={dinner}
                  onChange={(e) => setDinner(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                />
              </label>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting || (!breakfast && !lunch && !dinner)}
                  className="w-full py-3 px-4 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold text-xs shadow-md shadow-orange-500/20 flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{submitting ? 'Submitting...' : 'Send Request to Admin'}</span>
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="text-center py-4 space-y-4">
            <div className="w-14 h-14 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <CheckCircle className="w-8 h-8" />
            </div>

            <div>
              <h3 className="font-bold text-slate-800 text-base">Request Submitted!</h3>
              <p className="text-xs text-slate-500 mt-1">
                Your request status is now marked as <strong>PENDING</strong> in the system.
              </p>
            </div>

            <div className="pt-2 space-y-2">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-md shadow-emerald-600/20 flex items-center justify-center space-x-2 transition-all"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Send via WhatsApp to Admin</span>
              </a>

              <button
                onClick={onClose}
                className="w-full py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-800"
              >
                Back to Food Count
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
