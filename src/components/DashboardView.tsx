import React from 'react';
import {
  DoorOpen,
  DoorClosed,
  CalendarCheck,
  Clock4,
  Users,
  Sparkles,
  ChevronRight,
  Tablet,
  CheckCircle2,
  Calendar,
  Layers,
  Printer,
  ShieldCheck,
  Video,
  Projector,
  Mic,
  Tv
} from 'lucide-react';
import { Room, Booking, Language } from '../types';
import { translations } from '../translations';
import { getRoomCurrentStatus, timeToMinutes } from '../utils/conflictChecker';

interface DashboardViewProps {
  rooms: Room[];
  bookings: Booking[];
  language: Language;
  onOpenBookingModal: (roomId?: string, date?: string, startTime?: string) => void;
  onOpenKiosk: (roomId: string) => void;
  onCheckIn: (bookingId: string) => void;
  onViewSlip: (booking: Booking) => void;
  onViewTimeline: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  rooms,
  bookings,
  language,
  onOpenBookingModal,
  onOpenKiosk,
  onCheckIn,
  onViewSlip,
  onViewTimeline
}) => {
  const t = translations[language];

  // Current real-time clock
  const now = new Date();
  const currentHours = String(now.getHours()).padStart(2, '0');
  const currentMinutes = String(now.getMinutes()).padStart(2, '0');
  const currentTimeStr = `${currentHours}:${currentMinutes}`;
  
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  // Filter today's active bookings
  const todaysBookings = bookings.filter(
    (b) => b.date === todayStr && b.status !== 'cancelled'
  );

  // Calculate live room states
  let availableCount = 0;
  let occupiedCount = 0;

  const roomStatusList = rooms.map((room) => {
    const status = getRoomCurrentStatus(room.id, bookings, currentTimeStr, todayStr);
    if (status.isOccupied) {
      occupiedCount++;
    } else {
      availableCount++;
    }
    return {
      room,
      ...status
    };
  });

  // Calculate stats
  let totalBookedMinutes = 0;
  let totalAttendees = 0;

  todaysBookings.forEach((b) => {
    const dur = timeToMinutes(b.endTime) - timeToMinutes(b.startTime);
    totalBookedMinutes += Math.max(0, dur);
    totalAttendees += b.attendeesCount || 0;
  });

  const totalBookedHours = (totalBookedMinutes / 60).toFixed(1);

  // Sorted today's agenda
  const sortedAgenda = [...todaysBookings].sort(
    (a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime)
  );

  const getAmenityIcon = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('projector')) return <Projector className="w-3.5 h-3.5" />;
    if (lower.includes('video') || lower.includes('webex') || lower.includes('camera')) return <Video className="w-3.5 h-3.5" />;
    if (lower.includes('mic')) return <Mic className="w-3.5 h-3.5" />;
    return <Tv className="w-3.5 h-3.5" />;
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Banner / Quick Action Bar */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 shadow-xl border border-slate-800">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-indigo-500/10 to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>MRB-SYSTEM · Intelligent Room Scheduling</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {language === 'lo'
                ? 'ພາບລວມສະຖານະຫ້ອງປະຊຸມແບບ Real-time'
                : 'Real-time Meeting Room Status & Schedule'}
            </h1>
            <p className="text-slate-300 text-sm leading-relaxed">
              {language === 'lo'
                ? 'ກວດສອບສະຖານະຫ້ອງຫວ່າງ, ຈັດການກອງປະຊຸມ, ຈອງດ່ວນຜ່ານແທັບເລັດ ແລະ ລະບົບປ້ອງກັນການຈອງຊ້ອນອັດຕະໂນມັດ'
                : 'Monitor active rooms, prevent booking conflicts in real-time, print meeting passes, and control door sign displays.'}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onOpenBookingModal()}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-md shadow-indigo-600/30 transition-all hover:scale-[1.02] active:scale-95 flex items-center gap-2"
            >
              <span>{t.newBooking}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={onViewTimeline}
              className="px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-slate-700 font-semibold text-sm transition-all flex items-center gap-2"
            >
              <Calendar className="w-4 h-4 text-indigo-400" />
              <span>{t.viewTimeline}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 5 Real-Time Summary Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Available Rooms */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-500">{t.statAvailableRooms}</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DoorOpen className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 font-mono">{availableCount}</span>
            <span className="text-xs text-slate-500">/ {rooms.length} {t.statUnitsRoom}</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>{language === 'lo' ? 'ພ້ອມໃຊ້ງານທັນທີ' : 'Ready for walk-in'}</span>
          </div>
        </div>

        {/* Occupied Rooms */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-500">{t.statOccupiedRooms}</span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <DoorClosed className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 font-mono">{occupiedCount}</span>
            <span className="text-xs text-slate-500">/ {rooms.length} {t.statUnitsRoom}</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-rose-600 font-medium">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span>{language === 'lo' ? 'ກຳລັງດຳເນີນການ' : 'In active session'}</span>
          </div>
        </div>

        {/* Today Meetings */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-500">{t.statTodayMeetings}</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <CalendarCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 font-mono">{todaysBookings.length}</span>
            <span className="text-xs text-slate-500">{t.statUnitsMeeting}</span>
          </div>
          <div className="mt-2 text-xs text-slate-500">
            {language === 'lo' ? 'ຕາມຕາຕະລາງມື້ນີ້' : 'Scheduled for today'}
          </div>
        </div>

        {/* Booked Hours */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-500">{t.statBookedHours}</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock4 className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 font-mono">{totalBookedHours}</span>
            <span className="text-xs text-slate-500">{t.statUnitsHours}</span>
          </div>
          <div className="mt-2 text-xs text-slate-500">
            {language === 'lo' ? 'ລວມທຸກຫ້ອງປະຊຸມ' : 'Across all rooms'}
          </div>
        </div>

        {/* Total Attendees */}
        <div className="col-span-2 lg:col-span-1 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-500">{t.statTotalAttendees}</span>
            <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 font-mono">{totalAttendees}</span>
            <span className="text-xs text-slate-500">{t.statUnitsPeople}</span>
          </div>
          <div className="mt-2 text-xs text-slate-500">
            {language === 'lo' ? 'ຄາດຄະເນເຂົ້າຮ່ວມ' : 'Expected attendees'}
          </div>
        </div>
      </div>

      {/* Room Status Cards Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {language === 'lo' ? 'ສະຖານະຫ້ອງປະຊຸມທັງໝົດ' : 'All Meeting Rooms Live Status'}
            </h2>
            <p className="text-xs text-slate-500">
              {language === 'lo'
                ? 'ສະແດງສະຖານະແບບ Real-time ພ້ອມປຸ່ມຈອງດ່ວນ ຫຼື ເຂົ້າເບິ່ງຈໍ Kiosk'
                : 'Real-time occupied status with quick book and door kiosk access'}
            </p>
          </div>
          <span className="text-xs font-medium px-2.5 py-1 bg-slate-100 rounded-lg text-slate-600 border border-slate-200">
            {currentTimeStr} • {rooms.length} {language === 'lo' ? 'ຫ້ອງ' : 'rooms'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {roomStatusList.map(({ room, isOccupied, currentBooking, nextBooking, remainingMinutes }) => (
            <div
              key={room.id}
              className={`rounded-2xl border transition-all duration-200 overflow-hidden bg-white shadow-xs hover:shadow-md flex flex-col justify-between ${
                isOccupied ? 'border-rose-200' : 'border-slate-200'
              }`}
            >
              {/* Image & Badges */}
              <div className="relative h-44 overflow-hidden bg-slate-100">
                <img
                  src={room.image}
                  alt={room.name}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />

                {/* Top Badges */}
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-md bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-semibold flex items-center gap-1">
                      <Layers className="w-3 h-3 text-indigo-400" />
                      <span>{t.floor} {room.floor}</span>
                    </span>
                    {room.isVip && (
                      <span className="px-2 py-0.5 rounded-md bg-amber-500/90 text-slate-950 text-[11px] font-bold flex items-center gap-1 shadow-xs">
                        <ShieldCheck className="w-3 h-3" />
                        <span>VIP</span>
                      </span>
                    )}
                  </div>

                  {/* Status Pill */}
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold shadow-md backdrop-blur-md ${
                      isOccupied
                        ? 'bg-rose-500/95 text-white'
                        : 'bg-emerald-500/95 text-white'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${isOccupied ? 'bg-white' : 'bg-white animate-pulse'}`} />
                    <span>{isOccupied ? t.occupied : t.available}</span>
                  </span>
                </div>

                {/* Title on Image */}
                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <h3 className="text-base font-bold leading-tight drop-shadow-sm">
                    {language === 'lo' ? room.nameLao : room.name}
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-slate-200 mt-1">
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-indigo-300" />
                      <span>{t.capacity}: {room.capacity} {language === 'lo' ? 'ຄົນ' : 'people'}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                {/* Status Detail Banner */}
                {isOccupied && currentBooking ? (
                  <div className="p-3 rounded-xl bg-rose-50/80 border border-rose-200/70 text-rose-950 space-y-1">
                    <div className="flex items-center justify-between text-xs font-semibold text-rose-700">
                      <span>{t.inProgress} ({currentBooking.startTime} - {currentBooking.endTime})</span>
                      <span className="bg-rose-100 text-rose-800 px-2 py-0.5 rounded font-mono text-[11px]">
                        {t.endsIn} {remainingMinutes} {t.minutes}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-slate-800 line-clamp-1">
                      {currentBooking.title}
                    </p>
                    <p className="text-[11px] text-slate-600 line-clamp-1">
                      {currentBooking.organizer} • {currentBooking.department}
                    </p>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200/60 text-emerald-950 space-y-1">
                    <div className="flex items-center justify-between text-xs font-semibold text-emerald-700">
                      <span>{t.available} (Ready Now)</span>
                    </div>
                    {nextBooking ? (
                      <p className="text-xs text-slate-700">
                        <span className="text-slate-500">{t.nextMeeting}: </span>
                        <strong className="font-mono text-indigo-600">{nextBooking.startTime}</strong> ({nextBooking.title})
                      </p>
                    ) : (
                      <p className="text-xs text-emerald-700">{t.noMoreMeetings}</p>
                    )}
                  </div>
                )}

                {/* Key Amenities */}
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                    {t.amenities}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {room.amenities.slice(0, 3).map((item, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[11px] border border-slate-200/60"
                      >
                        {getAmenityIcon(item)}
                        <span className="truncate max-w-[150px]">{item}</span>
                      </span>
                    ))}
                    {room.amenities.length > 3 && (
                      <span className="px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-500 text-[11px]">
                        +{room.amenities.length - 3}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                  <button
                    onClick={() => onOpenBookingModal(room.id, todayStr)}
                    className="flex-1 py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <span>{t.quickBook}</span>
                  </button>
                  <button
                    onClick={() => onOpenKiosk(room.id)}
                    title={t.viewKiosk}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors border border-slate-200 flex items-center justify-center gap-1"
                  >
                    <Tablet className="w-4 h-4 text-slate-600" />
                    <span className="hidden sm:inline">Kiosk</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Today's Agenda (ຕາຕະລາງລາຍການກອງປະຊຸມມື້ນີ້) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <CalendarCheck className="w-5 h-5 text-indigo-600" />
              <span>{language === 'lo' ? 'ຕາຕະລາງກອງປະຊຸມມື້ນີ້ (Today\'s Agenda)' : 'Today\'s Agenda'}</span>
            </h2>
            <p className="text-xs text-slate-500">
              {language === 'lo'
                ? 'ລາຍການກອງປະຊຸມທັງໝົດໃນມື້ນີ້ ພ້ອມປຸ່ມກົດເຊັກອິນເຂົ້າຫ້ອງ ແລະ ພິມໃບຢັ້ງຢືນ'
                : 'Full schedule for today with instant check-in action and booking slips'}
            </p>
          </div>
          <span className="text-xs font-semibold px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg border border-indigo-100 self-start sm:self-auto">
            {todaysBookings.length} {t.statUnitsMeeting}
          </span>
        </div>

        {sortedAgenda.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Calendar className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p className="text-sm">{t.noMoreMeetings}</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {sortedAgenda.map((booking) => {
              const room = rooms.find((r) => r.id === booking.roomId);
              const isCheckedIn = booking.status === 'checked-in';
              const isPending = booking.status === 'pending';

              return (
                <div
                  key={booking.id}
                  className="p-4 sm:p-5 hover:bg-slate-50/70 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-4">
                    {/* Time Badge */}
                    <div className="flex flex-col items-center justify-center w-20 py-2 rounded-xl bg-slate-100 text-slate-800 border border-slate-200 font-mono text-center shrink-0">
                      <span className="text-sm font-bold text-indigo-600">{booking.startTime}</span>
                      <span className="text-[10px] text-slate-400">ເຖິງ</span>
                      <span className="text-xs font-semibold">{booking.endTime}</span>
                    </div>

                    {/* Meeting Content */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                          {booking.refNumber}
                        </span>
                        <span className="text-xs font-mono font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                          PIN: {booking.pinCode}
                        </span>
                        <span className="text-xs font-semibold text-slate-700 bg-amber-50 text-amber-800 border border-amber-200/60 px-2 py-0.5 rounded">
                          {room ? (language === 'lo' ? room.nameLao : room.name) : booking.roomId}
                        </span>
                        {/* Status */}
                        {isCheckedIn && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            {t.checkedIn}
                          </span>
                        )}
                        {isPending && (
                          <span className="text-[11px] font-semibold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                            {t.pendingApproval}
                          </span>
                        )}
                      </div>

                      <h4 className="text-sm font-bold text-slate-900">
                        {booking.title}
                      </h4>

                      <div className="flex items-center gap-4 text-xs text-slate-500 flex-wrap">
                        <span>
                          <strong>{t.organizerName}:</strong> {booking.organizer}
                        </span>
                        <span>•</span>
                        <span>{booking.department}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5" />
                          <span>{booking.attendeesCount} {language === 'lo' ? 'ຄົນ' : 'attendees'}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions for this meeting */}
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    {!isCheckedIn && !isPending && (
                      <button
                        onClick={() => onCheckIn(booking.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{t.checkIn}</span>
                      </button>
                    )}
                    <button
                      onClick={() => onViewSlip(booking)}
                      title={t.printSlip}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-200 transition-colors"
                    >
                      <Printer className="w-3.5 h-3.5 text-slate-500" />
                      <span>{t.printSlip}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
