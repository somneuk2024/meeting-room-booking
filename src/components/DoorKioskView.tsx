import React, { useState, useEffect } from 'react';
import {
  Clock,
  DoorOpen,
  DoorClosed,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Zap,
  Users,
  ChevronDown,
  Sparkles,
  Maximize2,
  Calendar,
  Layers,
  ArrowRight
} from 'lucide-react';
import { Room, Booking, Language } from '../types';
import { translations } from '../translations';
import {
  getRoomCurrentStatus,
  timeToMinutes,
  minutesToTime,
  generateRefNumber,
  generatePinCode
} from '../utils/conflictChecker';

interface DoorKioskViewProps {
  rooms: Room[];
  bookings: Booking[];
  language: Language;
  initialRoomId?: string;
  onQuickBookWalkIn: (booking: Booking) => void;
  onPinCheckInSuccess: (bookingId: string) => void;
}

export const DoorKioskView: React.FC<DoorKioskViewProps> = ({
  rooms,
  bookings,
  language,
  initialRoomId,
  onQuickBookWalkIn,
  onPinCheckInSuccess
}) => {
  const t = translations[language];

  const [selectedRoomId, setSelectedRoomId] = useState<string>(
    initialRoomId || (rooms[0]?.id ?? '')
  );

  // Real-time ticking clock
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const currentHours = String(now.getHours()).padStart(2, '0');
  const currentMinutes = String(now.getMinutes()).padStart(2, '0');
  const currentSeconds = String(now.getSeconds()).padStart(2, '0');
  const currentTimeStr = `${currentHours}:${currentMinutes}`;
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  const currentRoom = rooms.find((r) => r.id === selectedRoomId) || rooms[0];

  // Room status
  const roomStatus = getRoomCurrentStatus(currentRoom.id, bookings, currentTimeStr, todayStr);
  const { isOccupied, currentBooking, nextBooking, remainingMinutes } = roomStatus;

  // PIN keypad state
  const [pinInput, setPinInput] = useState<string>('');
  const [pinMessage, setPinMessage] = useState<{ type: 'success' | 'error' | null; text: string }>({
    type: null,
    text: ''
  });

  // Handle PIN input
  const handleDigitPress = (digit: string) => {
    if (pinInput.length < 4) {
      const nextPin = pinInput + digit;
      setPinInput(nextPin);
      setPinMessage({ type: null, text: '' });
      if (nextPin.length === 4) {
        verifyPin(nextPin);
      }
    }
  };

  const handleClearPin = () => {
    setPinInput('');
    setPinMessage({ type: null, text: '' });
  };

  const verifyPin = (enteredPin: string) => {
    // Check if there's any booking in this room for today that matches this PIN
    const match = bookings.find(
      (b) =>
        b.roomId === currentRoom.id &&
        b.date === todayStr &&
        b.pinCode === enteredPin &&
        b.status !== 'cancelled'
    );

    if (match) {
      setPinMessage({
        type: 'success',
        text: `${t.pinSuccess} (${match.title})`
      });
      onPinCheckInSuccess(match.id);
      setTimeout(() => {
        setPinInput('');
        setPinMessage({ type: null, text: '' });
      }, 4000);
    } else {
      setPinMessage({
        type: 'error',
        text: t.invalidPin
      });
      setTimeout(() => {
        setPinInput('');
      }, 1500);
    }
  };

  // Quick Walk-In Booking (15 or 30 mins)
  const handleWalkInBook = (durationMins: number) => {
    const startMinutes = now.getHours() * 60 + now.getMinutes();
    const endMinutes = startMinutes + durationMins;

    const startTime = minutesToTime(startMinutes);
    const endTime = minutesToTime(endMinutes);

    const walkInBooking: Booking = {
      id: `walkin-${Date.now()}`,
      refNumber: generateRefNumber(),
      pinCode: generatePinCode(),
      roomId: currentRoom.id,
      title: language === 'lo' ? `ກອງປະຊຸມດ່ວນ Walk-in (${durationMins} ນາທີ)` : `Walk-in Ad-hoc Meeting (${durationMins}m)`,
      organizer: language === 'lo' ? 'ຜູ້ໃຊ້ງານໜ້າຫ້ອງ (Door Walk-in)' : 'Walk-in User',
      email: 'walkin@company.la',
      department: 'ພະແນກປະຕິບັດການ (Operations)',
      attendeesCount: 2,
      date: todayStr,
      startTime,
      endTime,
      status: 'checked-in', // immediately active!
      amenitiesRequested: [],
      catering: {
        coffeeBreak: false,
        snacks: false,
        lunchBox: false,
        waterOnly: true
      },
      createdAt: new Date().toISOString()
    };

    onQuickBookWalkIn(walkInBooking);
    setPinMessage({
      type: 'success',
      text: t.walkInSuccess
    });
    setTimeout(() => {
      setPinMessage({ type: null, text: '' });
    }, 4000);
  };

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      {/* Top Tablet Frame Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900">{t.doorSignTitle}</h2>
            <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
              TABLET DISPLAY (10.1")
            </span>
          </div>
          <p className="text-xs text-slate-500">{t.doorSignSubtitle}</p>
        </div>

        {/* Room Switcher Dropdown */}
        <div className="flex items-center gap-3">
          <label className="text-xs font-bold text-slate-600">{t.switchRoom}:</label>
          <select
            value={selectedRoomId}
            onChange={(e) => {
              setSelectedRoomId(e.target.value);
              handleClearPin();
            }}
            className="px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          >
            {rooms.map((r) => (
              <option key={r.id} value={r.id}>
                {language === 'lo' ? r.nameLao : r.name} (Floor {r.floor})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Realistic Simulated Tablet Casing */}
      <div className="relative p-3 sm:p-5 rounded-[2.5rem] bg-slate-900 shadow-2xl border-4 border-slate-800 ring-1 ring-white/10">
        {/* Tablet camera dot */}
        <div className="w-2.5 h-2.5 rounded-full bg-slate-700 mx-auto mb-3 shadow-inner ring-1 ring-slate-600" />

        {/* Tablet Screen Surface */}
        <div
          className={`rounded-3xl overflow-hidden transition-colors duration-500 text-white min-h-[580px] flex flex-col justify-between p-6 sm:p-10 relative ${
            isOccupied
              ? 'bg-gradient-to-br from-rose-950 via-slate-950 to-rose-900 border border-rose-500/30'
              : 'bg-gradient-to-br from-emerald-950 via-slate-950 to-emerald-900 border border-emerald-500/30'
          }`}
        >
          {/* Background Ambient Glow */}
          <div
            className={`absolute -top-32 -right-32 w-96 h-96 rounded-full blur-3xl opacity-30 pointer-events-none ${
              isOccupied ? 'bg-rose-500' : 'bg-emerald-500'
            }`}
          />

          {/* Screen Top Bar */}
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
            <div>
              <div className="flex items-center gap-2 text-xs text-white/70 font-semibold mb-1">
                <Layers className="w-4 h-4 text-indigo-400" />
                <span>{t.floor} {currentRoom.floor}</span>
                <span>•</span>
                <Users className="w-4 h-4 text-indigo-400" />
                <span>{t.capacity}: {currentRoom.capacity} {language === 'lo' ? 'ຄົນ' : 'Pax'}</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black tracking-tight drop-shadow-md">
                {language === 'lo' ? currentRoom.nameLao : currentRoom.name}
              </h1>
            </div>

            {/* Big Digital Clock */}
            <div className="flex flex-col items-start sm:items-end">
              <div className="text-3xl sm:text-5xl font-black font-mono tracking-wider drop-shadow-md flex items-baseline gap-1">
                <span>{currentHours}:{currentMinutes}</span>
                <span className="text-xl sm:text-2xl font-light text-white/60">:{currentSeconds}</span>
              </div>
              <span className="text-xs text-white/70 font-mono mt-1">
                {now.toLocaleDateString(language === 'lo' ? 'lo-LA' : 'en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })}
              </span>
            </div>
          </div>

          {/* Screen Center Main Status Banner */}
          <div className="relative z-10 my-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Status Information (Left side) */}
            <div className="lg:col-span-7 space-y-6">
              {/* Massive Status Badge */}
              <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-xl">
                <span
                  className={`w-4 h-4 rounded-full ${
                    isOccupied ? 'bg-rose-500 shadow-lg shadow-rose-500/50' : 'bg-emerald-400 shadow-lg shadow-emerald-400/50 animate-pulse'
                  }`}
                />
                <span className="text-xl sm:text-2xl font-black uppercase tracking-wider">
                  {isOccupied ? t.occupied : t.available}
                </span>
              </div>

              {isOccupied && currentBooking ? (
                <div className="space-y-4">
                  <div>
                    <span className="text-xs uppercase tracking-wider text-rose-300 font-bold block mb-1">
                      {t.inProgress}
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
                      {currentBooking.title}
                    </h2>
                    <p className="text-base text-white/80 mt-1">
                      {currentBooking.organizer} ({currentBooking.department})
                    </p>
                  </div>

                  {/* Time Remaining Bar */}
                  <div className="bg-white/10 p-4 rounded-2xl border border-white/15 space-y-2 backdrop-blur-xs">
                    <div className="flex items-center justify-between text-sm font-semibold">
                      <span className="font-mono text-rose-300">
                        {currentBooking.startTime} - {currentBooking.endTime}
                      </span>
                      <span className="font-bold text-white">
                        {t.endsIn} {remainingMinutes} {t.minutes}
                      </span>
                    </div>
                    {/* Progress visual bar */}
                    <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-rose-500 h-full rounded-full transition-all duration-1000"
                        style={{
                          width: `${Math.min(100, Math.max(10, 100 - ((remainingMinutes || 0) / 60) * 100))}%`
                        }}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <span className="text-xs uppercase tracking-wider text-emerald-300 font-bold block mb-1">
                      {language === 'lo' ? 'ຫ້ອງຫວ່າງ ພ້ອມໃຊ້ງານ' : 'ROOM READY FOR USE'}
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
                      {language === 'lo' ? 'ສາມາດເຂົ້າໃຊ້ງານ ຫຼື ຈອງດ່ວນໄດ້ທັນທີ' : 'Available for walk-in or immediate booking'}
                    </h2>
                  </div>

                  {nextBooking ? (
                    <div className="p-4 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-xs">
                      <span className="text-xs text-white/70 block uppercase font-bold">
                        {t.nextMeeting}:
                      </span>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-lg font-bold font-mono text-emerald-300">
                          {nextBooking.startTime}
                        </span>
                        <span className="text-sm font-semibold text-white truncate">
                          {nextBooking.title}
                        </span>
                      </div>
                      <span className="text-xs text-white/60 block mt-0.5">
                        {nextBooking.organizer} ({nextBooking.department})
                      </span>
                    </div>
                  ) : (
                    <div className="p-4 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-xs text-white/80 text-sm">
                      {t.noMoreMeetings}
                    </div>
                  )}

                  {/* Quick Walk-In Buttons */}
                  <div className="pt-2 flex items-center gap-3 flex-wrap">
                    <button
                      onClick={() => handleWalkInBook(15)}
                      className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-900/50 flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
                    >
                      <Zap className="w-4 h-4 text-emerald-200" />
                      <span>{t.quickBook15}</span>
                    </button>
                    <button
                      onClick={() => handleWalkInBook(30)}
                      className="px-5 py-3 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold text-sm border border-white/30 flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
                    >
                      <Clock className="w-4 h-4 text-white" />
                      <span>{t.quickBook30}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* PIN Keypad for Check-In (Right side) */}
            <div className="lg:col-span-5 bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/15 shadow-2xl space-y-4">
              <div className="text-center">
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-300 uppercase tracking-wider mb-1">
                  <KeyRound className="w-4 h-4" />
                  <span>{t.pinCheckInTitle}</span>
                </div>
                <p className="text-[11px] text-white/70">
                  {t.pinKeypadHint}
                </p>
              </div>

              {/* PIN Display Digits */}
              <div className="flex justify-center gap-3 my-2">
                {[0, 1, 2, 3].map((idx) => {
                  const char = pinInput[idx];
                  return (
                    <div
                      key={idx}
                      className={`w-12 h-14 rounded-2xl border-2 flex items-center justify-center font-mono text-2xl font-black shadow-inner transition-all ${
                        char
                          ? 'border-indigo-400 bg-indigo-500/30 text-white'
                          : 'border-white/20 bg-black/20 text-white/40'
                      }`}
                    >
                      {char ? '•' : ''}
                    </div>
                  );
                })}
              </div>

              {/* Pin Feedback Banner */}
              {pinMessage.text && (
                <div
                  className={`p-2.5 rounded-xl text-center text-xs font-bold animate-in fade-in ${
                    pinMessage.type === 'success'
                      ? 'bg-emerald-500/80 text-white border border-emerald-300'
                      : 'bg-rose-500/80 text-white border border-rose-300'
                  }`}
                >
                  {pinMessage.text}
                </div>
              )}

              {/* Numeric Keypad Grid */}
              <div className="grid grid-cols-3 gap-2 pt-2">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                  <button
                    key={digit}
                    onClick={() => handleDigitPress(digit)}
                    className="h-12 rounded-xl bg-white/15 hover:bg-white/25 active:bg-white/40 border border-white/10 text-white font-mono font-bold text-lg transition-all active:scale-95 flex items-center justify-center shadow-xs"
                  >
                    {digit}
                  </button>
                ))}
                <button
                  onClick={handleClearPin}
                  className="h-12 rounded-xl bg-white/10 hover:bg-white/20 active:bg-white/30 text-rose-300 font-bold text-xs uppercase transition-all flex items-center justify-center"
                >
                  {t.clear}
                </button>
                <button
                  onClick={() => handleDigitPress('0')}
                  className="h-12 rounded-xl bg-white/15 hover:bg-white/25 active:bg-white/40 border border-white/10 text-white font-mono font-bold text-lg transition-all active:scale-95 flex items-center justify-center shadow-xs"
                >
                  0
                </button>
                <button
                  onClick={() => pinInput.length === 4 && verifyPin(pinInput)}
                  className="h-12 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-bold text-xs uppercase shadow-md transition-all flex items-center justify-center"
                >
                  {t.enter}
                </button>
              </div>
            </div>
          </div>

          {/* Screen Bottom Bar: Amenities */}
          <div className="relative z-10 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs text-white/70">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-white/90">{t.amenities}:</span>
              {currentRoom.amenities.map((item, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-0.5 rounded-md bg-white/10 text-white/80 border border-white/10 text-[11px]"
                >
                  {item}
                </span>
              ))}
            </div>

            <div className="font-mono text-[11px] text-white/50">
              MRB-DOOR-KIOSK · DEVICE #{currentRoom.id.toUpperCase()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
