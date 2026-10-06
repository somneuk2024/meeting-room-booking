import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  AlertTriangle,
  Clock,
  Calendar,
  Users,
  ShieldAlert,
  Sparkles,
  Check,
  Coffee,
  FileText,
  Building2,
  ChevronRight
} from 'lucide-react';
import { Room, Booking, Language } from '../types';
import { translations } from '../translations';
import {
  checkBookingConflict,
  generateRefNumber,
  generatePinCode,
  timeToMinutes
} from '../utils/conflictChecker';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  rooms: Room[];
  bookings: Booking[];
  language: Language;
  preselectedRoomId?: string;
  preselectedDate?: string;
  preselectedStartTime?: string;
  onBookingCreated: (booking: Booking) => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  rooms,
  bookings,
  language,
  preselectedRoomId,
  preselectedDate,
  preselectedStartTime,
  onBookingCreated
}) => {
  const t = translations[language];

  const now = new Date();
  const defaultDate = preselectedDate || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  
  // Default times
  const defaultStart = preselectedStartTime || '09:00';
  const startMin = timeToMinutes(defaultStart);
  const endHours = Math.floor((startMin + 60) / 60);
  const endMinutes = (startMin + 60) % 60;
  const defaultEnd = `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`;

  const [roomId, setRoomId] = useState<string>(preselectedRoomId || (rooms[0]?.id ?? ''));
  const [title, setTitle] = useState('');
  const [organizer, setOrganizer] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('ພະແນກເຕັກໂນໂລຊີຂໍ້ມູນຂ່າວສານ (IT)');
  const [attendeesCount, setAttendeesCount] = useState<number>(6);
  const [date, setDate] = useState<string>(defaultDate);
  const [startTime, setStartTime] = useState<string>(defaultStart);
  const [endTime, setEndTime] = useState<string>(defaultEnd);

  // Selected Amenities
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);

  // Catering options
  const [catering, setCatering] = useState({
    coffeeBreak: true,
    snacks: false,
    lunchBox: false,
    waterOnly: false,
    specialNotes: ''
  });

  // Keep state synced when props change
  useEffect(() => {
    if (preselectedRoomId) setRoomId(preselectedRoomId);
    if (preselectedDate) setDate(preselectedDate);
    if (preselectedStartTime) {
      setStartTime(preselectedStartTime);
      const sMin = timeToMinutes(preselectedStartTime);
      const eH = Math.floor((sMin + 60) / 60);
      const eM = (sMin + 60) % 60;
      setEndTime(`${String(eH).padStart(2, '0')}:${String(eM).padStart(2, '0')}`);
    }
  }, [preselectedRoomId, preselectedDate, preselectedStartTime, isOpen]);

  const selectedRoom = rooms.find((r) => r.id === roomId);

  // Real-time conflict checking
  const conflictResult = useMemo(() => {
    if (!roomId || !date || !startTime || !endTime) {
      return { hasConflict: false };
    }
    return checkBookingConflict(bookings, roomId, date, startTime, endTime);
  }, [bookings, roomId, date, startTime, endTime]);

  // Capacity check
  const isOverCapacity = selectedRoom ? attendeesCount > selectedRoom.capacity : false;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (conflictResult.hasConflict) return;
    if (!title.trim() || !organizer.trim()) return;

    const newBooking: Booking = {
      id: `book-${Date.now()}`,
      refNumber: generateRefNumber(),
      pinCode: generatePinCode(),
      roomId,
      title: title.trim(),
      organizer: organizer.trim(),
      email: email.trim() || `${organizer.toLowerCase().replace(/\s+/g, '.')}@company.la`,
      department,
      attendeesCount: Number(attendeesCount) || 1,
      date,
      startTime,
      endTime,
      status: selectedRoom?.requiresApproval ? 'pending' : 'confirmed',
      amenitiesRequested: selectedAmenities,
      catering,
      createdAt: new Date().toISOString()
    };

    onBookingCreated(newBooking);
    onClose();
  };

  if (!isOpen) return null;

  const departmentOptions = [
    { value: 'ພະແນກເຕັກໂນໂລຊີຂໍ້ມູນຂ່າວສານ (IT)', label: t.deptIT },
    { value: 'ພະແນກຊັບພະຍາກອນມະນຸດ (HR)', label: t.deptHR },
    { value: 'ພະແນກການເງິນ & ບັນຊີ (Finance)', label: t.deptFinance },
    { value: 'ພະແນກການຕະຫຼາດ & ຂາຍ (Marketing)', label: t.deptMarketing },
    { value: 'ພະແນກປະຕິບັດການ (Operations)', label: t.deptOperations },
    { value: 'ຄະນະບໍລິຫານງານ (Executive Board)', label: t.deptExecutive },
  ];

  const commonAmenities = [
    'Dual 85" 4K Displays',
    'Cisco Webex / Poly Studio 4K',
    'Ceiling Array Microphones',
    'Motorized Laser Projector',
    'Electronic Glass Whiteboard',
    'Air Purifier',
    'Surround Audio System'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-indigo-800 text-white p-6 relative flex items-center justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-white text-xs font-semibold mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>MRB-SYSTEM RESERVATION</span>
            </div>
            <h2 className="text-xl font-bold">{t.newBooking}</h2>
            <p className="text-xs text-indigo-100 mt-0.5">
              {language === 'lo'
                ? 'ລະບົບກວດສອບເວລາຊ້ອນກັນອັດຕະໂນມັດ ແລະ ອອກໃບຢັ້ງຢືນພ້ອມ PIN 4 ຫຼັກ'
                : 'Smart clash-free scheduling with instant PIN generation'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Conflict Banner Alert */}
          {conflictResult.hasConflict && (
            <div className="p-4 rounded-2xl bg-rose-50 border-2 border-rose-400 text-rose-950 flex items-start gap-3 animate-pulse">
              <AlertTriangle className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-rose-800">
                  {t.conflictAlertTitle}
                </h4>
                <p className="text-xs text-rose-700 leading-relaxed font-medium">
                  {conflictResult.message || t.conflictAlertDesc}
                </p>
              </div>
            </div>
          )}

          {/* Over Capacity Warning */}
          {isOverCapacity && selectedRoom && (
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 flex items-center gap-3 text-xs font-medium">
              <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
              <span>
                {t.capacityWarning} (ຫ້ອງນີ້ຈຸໄດ້ສູງສຸດ {selectedRoom.capacity} ຄົນ, ແຕ່ປ້ອນ {attendeesCount} ຄົນ)
              </span>
            </div>
          )}

          {/* VIP Room Notice */}
          {selectedRoom?.requiresApproval && (
            <div className="p-3.5 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-950 flex items-center gap-3 text-xs font-medium">
              <Sparkles className="w-5 h-5 text-indigo-600 shrink-0" />
              <span>{t.vipNotice}</span>
            </div>
          )}

          {/* Section 1: Room & Topic */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                {t.bookingTitle} *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t.titlePlaceholder}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                {t.selectRoom} *
              </label>
              <select
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium bg-white"
              >
                {rooms.map((room) => (
                  <option key={room.id} value={room.id}>
                    {language === 'lo' ? room.nameLao : room.name} (ຊັ້ນ {room.floor} • ຈຸ {room.capacity} ຄົນ {room.isVip ? '• VIP' : ''})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Section 2: Date, Time & Attendees */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                {t.date} *
              </label>
              <div className="relative">
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium bg-white cursor-pointer"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                {t.startTime} *
              </label>
              <input
                type="time"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-mono font-medium bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                {t.endTime} *
              </label>
              <input
                type="time"
                required
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-mono font-medium bg-white"
              />
            </div>
          </div>

          {/* Section 3: Organizer & Department */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                {t.organizerName} *
              </label>
              <input
                type="text"
                required
                value={organizer}
                onChange={(e) => setOrganizer(e.target.value)}
                placeholder="ເຊັ່ນ: ທ່ານ ສົມຈິດ ວິໄລວັນ"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                {t.department} *
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs font-medium bg-white"
              >
                {departmentOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                {t.attendees} *
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={attendeesCount}
                onChange={(e) => setAttendeesCount(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium font-mono"
              />
            </div>
          </div>

          {/* Section 4: Amenities Checklist */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">
              {t.amenities}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {commonAmenities.map((amenity) => {
                const isChecked = selectedAmenities.includes(amenity);
                return (
                  <button
                    type="button"
                    key={amenity}
                    onClick={() => {
                      if (isChecked) {
                        setSelectedAmenities(selectedAmenities.filter((a) => a !== amenity));
                      } else {
                        setSelectedAmenities([...selectedAmenities, amenity]);
                      }
                    }}
                    className={`flex items-center gap-2 p-2 rounded-xl text-xs font-medium border text-left transition-all ${
                      isChecked
                        ? 'bg-indigo-50 border-indigo-500 text-indigo-900 font-semibold'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded flex items-center justify-center border shrink-0 ${
                        isChecked ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300'
                      }`}
                    >
                      {isChecked && <Check className="w-3 h-3" />}
                    </div>
                    <span className="truncate">{amenity}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 5: Catering & Refreshments */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
              <Coffee className="w-4 h-4 text-amber-600" />
              <span>{t.cateringTitle}</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <label className="flex items-center gap-2 cursor-pointer bg-white p-2 rounded-lg border border-slate-200">
                <input
                  type="checkbox"
                  checked={catering.coffeeBreak}
                  onChange={(e) => setCatering({ ...catering, coffeeBreak: e.target.checked })}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span>{t.coffeeBreak}</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer bg-white p-2 rounded-lg border border-slate-200">
                <input
                  type="checkbox"
                  checked={catering.snacks}
                  onChange={(e) => setCatering({ ...catering, snacks: e.target.checked })}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span>{t.snacks}</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer bg-white p-2 rounded-lg border border-slate-200">
                <input
                  type="checkbox"
                  checked={catering.lunchBox}
                  onChange={(e) => setCatering({ ...catering, lunchBox: e.target.checked })}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span>{t.lunchBox}</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer bg-white p-2 rounded-lg border border-slate-200">
                <input
                  type="checkbox"
                  checked={catering.waterOnly}
                  onChange={(e) => setCatering({ ...catering, waterOnly: e.target.checked })}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span>{t.waterOnly}</span>
              </label>
            </div>
            <div>
              <input
                type="text"
                value={catering.specialNotes}
                onChange={(e) => setCatering({ ...catering, specialNotes: e.target.value })}
                placeholder={t.specialNotesPlaceholder}
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-colors"
            >
              {t.close}
            </button>
            <button
              type="submit"
              disabled={conflictResult.hasConflict}
              className={`px-6 py-2.5 rounded-xl text-white font-semibold text-sm shadow-md transition-all flex items-center gap-2 ${
                conflictResult.hasConflict
                  ? 'bg-slate-400 cursor-not-allowed shadow-none'
                  : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/30 hover:scale-[1.02] active:scale-95'
              }`}
            >
              <span>{t.submitBooking}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
