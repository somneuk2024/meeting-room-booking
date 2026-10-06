import React from 'react';
import {
  X,
  Printer,
  Calendar,
  Clock,
  MapPin,
  Users,
  ShieldCheck,
  Coffee,
  CheckCircle2,
  Share2
} from 'lucide-react';
import { Booking, Room, Language } from '../types';
import { translations } from '../translations';
import { QRCodeSVG } from '../utils/qrCode';

interface BookingSlipModalProps {
  booking: Booking | null;
  room?: Room;
  language: Language;
  onClose: () => void;
}

export const BookingSlipModal: React.FC<BookingSlipModalProps> = ({
  booking,
  room,
  language,
  onClose
}) => {
  if (!booking) return null;
  const t = translations[language];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Controls Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between no-print">
          <span className="text-xs font-mono font-semibold text-slate-300">
            {booking.refNumber}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{t.printNow}</span>
            </button>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Pass Container */}
        <div id="printable-booking-slip" className="p-6 sm:p-8 space-y-6 bg-white text-slate-900">
          {/* Header of Pass */}
          <div className="text-center pb-5 border-b-2 border-dashed border-slate-200">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-600 text-white mb-2 shadow-sm">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-black tracking-tight uppercase text-slate-900">
              {t.officialPass}
            </h3>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              MRB-SYSTEM · OFFICIAL RESERVATION SLIP
            </p>
          </div>

          {/* QR Code & PIN Code Highlight Box */}
          <div className="bg-gradient-to-b from-indigo-50/70 to-slate-50 p-5 rounded-2xl border border-indigo-100 flex flex-col sm:flex-row items-center justify-between gap-5">
            <div className="flex flex-col items-center sm:items-start text-center sm:text-left space-y-1">
              <span className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider">
                {t.pinCodeLabel}
              </span>
              <div className="text-4xl font-extrabold font-mono tracking-widest text-indigo-950 bg-white px-4 py-1.5 rounded-xl border border-indigo-200 shadow-xs">
                {booking.pinCode}
              </div>
              <p className="text-[10px] text-slate-500 max-w-[180px] leading-tight pt-1">
                {t.keepPinWarning}
              </p>
            </div>

            {/* QR Code */}
            <div className="flex flex-col items-center">
              <QRCodeSVG
                value={`MRB-CHECKIN:${booking.refNumber}:${booking.pinCode}:${booking.roomId}`}
                size={110}
              />
              <span className="text-[9px] font-mono text-slate-400 mt-1">
                SCAN TO CHECK-IN
              </span>
            </div>
          </div>

          {/* Meeting Details List */}
          <div className="space-y-3.5 text-xs">
            {/* Subject */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-400 font-semibold block text-[10px] uppercase">
                {t.bookingTitle}
              </span>
              <span className="text-sm font-bold text-slate-900 mt-0.5 block">
                {booking.title}
              </span>
            </div>

            {/* Room & Floor */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 font-semibold block text-[10px] uppercase">
                  {t.roomCol}
                </span>
                <span className="font-bold text-slate-900 mt-0.5 block">
                  {room ? (language === 'lo' ? room.nameLao : room.name) : booking.roomId}
                </span>
                <span className="text-[11px] text-slate-500">
                  {t.floor} {room?.floor || 1}
                </span>
              </div>

              {/* Date & Time */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 font-semibold block text-[10px] uppercase">
                  {t.timeCol}
                </span>
                <span className="font-bold text-indigo-700 mt-0.5 block font-mono">
                  {booking.startTime} - {booking.endTime}
                </span>
                <span className="text-[11px] text-slate-500 font-mono">
                  {booking.date}
                </span>
              </div>
            </div>

            {/* Organizer & Attendees */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 font-semibold block text-[10px] uppercase">
                  {t.organizerName}
                </span>
                <span className="font-bold text-slate-900 mt-0.5 block">
                  {booking.organizer}
                </span>
                <span className="text-[11px] text-slate-500">
                  {booking.department}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 font-semibold block text-[10px] uppercase">
                  {t.attendees}
                </span>
                <span className="font-bold text-slate-900 mt-0.5 block font-mono text-sm">
                  {booking.attendeesCount} {language === 'lo' ? 'ຄົນ' : 'Pax'}
                </span>
                <span className="text-[11px] text-emerald-600 font-semibold">
                  {booking.status.toUpperCase()}
                </span>
              </div>
            </div>

            {/* Catering & Amenities if any */}
            {(booking.catering.coffeeBreak || booking.catering.snacks || booking.catering.lunchBox || booking.catering.specialNotes) && (
              <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 text-amber-900">
                <span className="text-[10px] font-bold uppercase tracking-wider block text-amber-800 mb-1">
                  {t.cateringTitle}
                </span>
                <div className="flex flex-wrap gap-2 text-[11px]">
                  {booking.catering.coffeeBreak && <span>☕ {t.coffeeBreak}</span>}
                  {booking.catering.snacks && <span>🥐 {t.snacks}</span>}
                  {booking.catering.lunchBox && <span>🍱 {t.lunchBox}</span>}
                  {booking.catering.specialNotes && (
                    <span className="block w-full text-slate-600 mt-1 italic">
                      "{booking.catering.specialNotes}"
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer of Pass */}
          <div className="pt-4 border-t-2 border-dashed border-slate-200 text-center space-y-1">
            <p className="text-[11px] text-slate-500">
              {t.scanQrNotice}
            </p>
            <p className="text-[10px] font-mono text-slate-400">
              REF: {booking.refNumber} • {t.issuedOn}: {new Date(booking.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Modal Bottom Buttons */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3 no-print">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-100 transition-colors"
          >
            {t.done}
          </button>
          <button
            onClick={handlePrint}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4" />
            <span>{t.printNow}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
