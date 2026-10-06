import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Plus,
  Users,
  Info,
  Calendar,
  Sparkles
} from 'lucide-react';
import { Room, Booking, Language } from '../types';
import { translations } from '../translations';
import { timeToMinutes } from '../utils/conflictChecker';

interface TimelineGridProps {
  rooms: Room[];
  bookings: Booking[];
  language: Language;
  onOpenBookingModal: (roomId?: string, date?: string, startTime?: string) => void;
  onViewSlip: (booking: Booking) => void;
}

export const TimelineGrid: React.FC<TimelineGridProps> = ({
  rooms,
  bookings,
  language,
  onOpenBookingModal,
  onViewSlip
}) => {
  const t = translations[language];

  // Selected date state (defaults to today)
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);

  // Time boundaries: 08:00 to 19:00 (11 hours)
  const START_HOUR = 8;
  const END_HOUR = 19;
  const TOTAL_HOURS = END_HOUR - START_HOUR;
  const TOTAL_MINUTES = TOTAL_HOURS * 60; // 660 minutes

  // Current real-time calculation
  const currentTotalMinutes = now.getHours() * 60 + now.getMinutes();
  const isToday = selectedDate === todayStr;
  const isWithinHours = currentTotalMinutes >= START_HOUR * 60 && currentTotalMinutes <= END_HOUR * 60;
  
  const redLinePercent = isToday && isWithinHours
    ? ((currentTotalMinutes - START_HOUR * 60) / TOTAL_MINUTES) * 100
    : null;

  // Hours array for grid header
  const hours = Array.from({ length: TOTAL_HOURS + 1 }, (_, i) => START_HOUR + i);

  // Navigate date
  const handlePrevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleToday = () => {
    setSelectedDate(todayStr);
  };

  // Filter bookings for this date and not cancelled
  const dateBookings = bookings.filter(
    (b) => b.date === selectedDate && b.status !== 'cancelled'
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900">
              {language === 'lo' ? 'ຕາຕະລາງເວລາການໃຊ້ງານຫ້ອງ (Timeline Grid)' : 'Interactive Timeline Grid'}
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-semibold border border-indigo-100">
              08:00 - 19:00
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span>{t.clickToBookHint}</span>
          </p>
        </div>

        {/* Date Selector Navigation */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleToday}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
              isToday
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {t.today}
          </button>
          <div className="flex items-center bg-slate-100 rounded-lg p-1 border border-slate-200">
            <button
              onClick={handlePrevDay}
              className="p-1 rounded hover:bg-white text-slate-600 transition-colors"
              title="Previous Day"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-1.5 px-3">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer"
              />
            </div>
            <button
              onClick={handleNextDay}
              className="p-1 rounded hover:bg-white text-slate-600 transition-colors"
              title="Next Day"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Grid Container */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {/* Scrollable area */}
        <div className="overflow-x-auto">
          <div className="min-w-[1000px]">
            {/* Header: Time axis */}
            <div className="flex border-b border-slate-200 bg-slate-50/90 text-xs font-semibold text-slate-600">
              <div className="w-64 p-3.5 border-r border-slate-200 shrink-0 flex items-center justify-between">
                <span>{language === 'lo' ? 'ຫ້ອງປະຊຸມ' : 'Meeting Room'}</span>
                <span className="text-[11px] font-normal text-slate-400">{rooms.length} {t.statUnitsRoom}</span>
              </div>
              <div className="flex-1 relative flex">
                {hours.map((hour, index) => (
                  <div
                    key={hour}
                    className={`flex-1 py-3.5 px-1 text-center font-mono text-[11px] border-r border-slate-200/70 ${
                      index === hours.length - 1 ? 'border-r-0' : ''
                    }`}
                  >
                    {String(hour).padStart(2, '0')}:00
                  </div>
                ))}
              </div>
            </div>

            {/* Room Rows */}
            <div className="relative divide-y divide-slate-100">
              {/* Red Line Marker for Current Time */}
              {redLinePercent !== null && (
                <div
                  className="absolute top-0 bottom-0 z-30 pointer-events-none transition-all duration-300"
                  style={{ left: `calc(16rem + (100% - 16rem) * ${redLinePercent / 100})` }}
                >
                  <div className="h-full w-0.5 bg-rose-500 shadow-sm shadow-rose-500/50 relative">
                    <div className="absolute -top-1 -left-1.5 w-3.5 h-3.5 rounded-full bg-rose-600 border-2 border-white shadow-xs flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                    </div>
                    <div className="absolute top-2 left-1.5 bg-rose-600 text-white text-[10px] font-mono font-bold px-1.5 py-0.5 rounded shadow-sm whitespace-nowrap">
                      {now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                    </div>
                  </div>
                </div>
              )}

              {rooms.map((room) => {
                const roomBookings = dateBookings.filter((b) => b.roomId === room.id);

                return (
                  <div key={room.id} className="flex group hover:bg-slate-50/50 transition-colors">
                    {/* Room Info Left Column */}
                    <div className="w-64 p-4 border-r border-slate-200 shrink-0 bg-white group-hover:bg-slate-50/50 transition-colors flex items-center justify-between">
                      <div className="space-y-0.5 pr-2">
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-xs font-bold text-slate-900 line-clamp-1">
                            {language === 'lo' ? room.nameLao : room.name}
                          </h4>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500">
                          <span>{t.floor} {room.floor}</span>
                          <span>•</span>
                          <span className="flex items-center gap-0.5">
                            <Users className="w-3 h-3 text-slate-400" />
                            {room.capacity} {language === 'lo' ? 'ຄົນ' : ''}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => onOpenBookingModal(room.id, selectedDate)}
                        className="p-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 transition-colors shrink-0"
                        title={t.quickBook}
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Timeline Interactive Track */}
                    <div className="flex-1 relative h-20 bg-slate-50/20">
                      {/* Hourly background grid lines & click-to-book slots */}
                      <div className="absolute inset-0 flex">
                        {Array.from({ length: TOTAL_HOURS }).map((_, hIdx) => {
                          const slotHour = START_HOUR + hIdx;
                          const slotTime = `${String(slotHour).padStart(2, '0')}:00`;
                          return (
                            <div
                              key={hIdx}
                              onClick={() => onOpenBookingModal(room.id, selectedDate, slotTime)}
                              title={`${room.nameLao} @ ${slotTime} (${t.clickToBookHint})`}
                              className="flex-1 border-r border-slate-100/90 hover:bg-indigo-50/40 cursor-pointer transition-colors relative group/slot"
                            >
                              <span className="opacity-0 group-hover/slot:opacity-100 absolute inset-0 flex items-center justify-center text-[10px] text-indigo-600 font-semibold pointer-events-none">
                                + {slotTime}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Render Booked Blocks */}
                      {roomBookings.map((b) => {
                        const startMin = timeToMinutes(b.startTime);
                        const endMin = timeToMinutes(b.endTime);

                        // Clamp to timeline range [START_HOUR*60, END_HOUR*60]
                        const visualStart = Math.max(START_HOUR * 60, startMin);
                        const visualEnd = Math.min(END_HOUR * 60, endMin);
                        if (visualStart >= visualEnd) return null;

                        const leftPercent = ((visualStart - START_HOUR * 60) / TOTAL_MINUTES) * 100;
                        const widthPercent = ((visualEnd - visualStart) / TOTAL_MINUTES) * 100;

                        const isCheckedIn = b.status === 'checked-in';
                        const isPending = b.status === 'pending';

                        // Dynamic block color
                        let bgClass = 'bg-indigo-600 text-white border-indigo-700 hover:bg-indigo-700';
                        if (isCheckedIn) bgClass = 'bg-emerald-600 text-white border-emerald-700 hover:bg-emerald-700';
                        if (isPending) bgClass = 'bg-amber-500 text-slate-950 border-amber-600 hover:bg-amber-600';

                        return (
                          <div
                            key={b.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              onViewSlip(b);
                            }}
                            className={`absolute top-2 bottom-2 rounded-xl border p-2 shadow-sm cursor-pointer z-10 transition-all hover:scale-[1.01] hover:shadow-md overflow-hidden flex flex-col justify-between ${bgClass}`}
                            style={{
                              left: `${leftPercent}%`,
                              width: `${Math.max(widthPercent, 4)}%`
                            }}
                            title={`${b.title} (${b.startTime} - ${b.endTime}) - ${b.organizer}`}
                          >
                            <div className="flex items-center justify-between gap-1 leading-none">
                              <span className="font-mono text-[10px] font-bold opacity-90 truncate">
                                {b.startTime} - {b.endTime}
                              </span>
                              <span className="text-[9px] font-mono px-1 py-0.2 bg-black/20 rounded">
                                PIN:{b.pinCode}
                              </span>
                            </div>
                            <div className="font-bold text-xs truncate leading-tight">
                              {b.title}
                            </div>
                            <div className="text-[10px] opacity-80 truncate flex items-center justify-between">
                              <span>{b.organizer}</span>
                              <span className="flex items-center gap-0.5">
                                <Users className="w-2.5 h-2.5" />
                                {b.attendeesCount}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Timeline Legend Bar */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-600">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="font-semibold text-slate-700">{language === 'lo' ? 'ສີສະແດງສະຖານະ:' : 'Legend:'}</span>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-indigo-600" />
              <span>{t.confirmed}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-emerald-600" />
              <span>{t.checkedIn}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-amber-500" />
              <span>{t.pendingApproval}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-rose-500 animate-pulse" />
              <span>{t.currentTime}</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
            <Info className="w-3.5 h-3.5 text-indigo-500" />
            <span>{language === 'lo' ? 'ຄລິກທີ່ບັດກອງປະຊຸມເພື່ອເບິ່ງໃບຢັ້ງຢືນ' : 'Click any meeting block to view & print booking pass'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
