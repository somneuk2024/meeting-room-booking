import React, { useState } from 'react';
import {
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  Printer,
  Calendar,
  Users,
  Building,
  CheckCircle2,
  Trash2,
  Check,
  X,
  FileText
} from 'lucide-react';
import { Booking, Room, BookingStatus, Language } from '../types';
import { translations } from '../translations';

interface ReservationsViewProps {
  bookings: Booking[];
  rooms: Room[];
  language: Language;
  onApprove: (bookingId: string) => void;
  onReject: (bookingId: string) => void;
  onCheckIn: (bookingId: string) => void;
  onCancel: (bookingId: string) => void;
  onViewSlip: (booking: Booking) => void;
}

export const ReservationsView: React.FC<ReservationsViewProps> = ({
  bookings,
  rooms,
  language,
  onApprove,
  onReject,
  onCheckIn,
  onCancel,
  onViewSlip
}) => {
  const t = translations[language];

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedRoomId, setSelectedRoomId] = useState<string>('all');

  // Filter bookings
  const filteredBookings = bookings.filter((b) => {
    // Search term
    const matchesSearch =
      b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.organizer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.refNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.pinCode.includes(searchTerm);

    // Status
    const matchesStatus = selectedStatus === 'all' || b.status === selectedStatus;

    // Room
    const matchesRoom = selectedRoomId === 'all' || b.roomId === selectedRoomId;

    return matchesSearch && matchesStatus && matchesRoom;
  });

  const getStatusBadge = (status: BookingStatus) => {
    switch (status) {
      case 'checked-in':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{t.checkedIn}</span>
          </span>
        );
      case 'confirmed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800 border border-indigo-200">
            <Check className="w-3.5 h-3.5" />
            <span>{t.confirmed}</span>
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200 animate-pulse">
            <Clock className="w-3.5 h-3.5" />
            <span>{t.pendingApproval}</span>
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
            <X className="w-3.5 h-3.5" />
            <span>{t.cancelled}</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Search / Filters Toolbar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-slate-900">{t.reservations}</h2>
            <p className="text-xs text-slate-500">
              {language === 'lo'
                ? 'ຄົ້ນຫາ, ອະນຸມັດຫ້ອງ VIP, ເຊັກອິນ ແລະ ພິມໃບຢັ້ງຢືນການຈອງ'
                : 'Manage bookings, approve VIP requests, check-in, and print passes'}
            </p>
          </div>
          <span className="text-xs font-semibold px-3 py-1 bg-slate-100 text-slate-700 rounded-lg self-start sm:self-auto">
            {filteredBookings.length} {t.statUnitsMeeting}
          </span>
        </div>

        {/* Filters Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* Search bar */}
          <div className="sm:col-span-6 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Room Filter */}
          <div className="sm:col-span-3">
            <select
              value={selectedRoomId}
              onChange={(e) => setSelectedRoomId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="all">{t.allRooms}</option>
              {rooms.map((r) => (
                <option key={r.id} value={r.id}>
                  {language === 'lo' ? r.nameLao : r.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="sm:col-span-3">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="all">{t.allStatuses}</option>
              <option value="confirmed">{t.confirmed}</option>
              <option value="checked-in">{t.checkedIn}</option>
              <option value="pending">{t.pendingApproval}</option>
              <option value="cancelled">{t.cancelled}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bookings Table / List */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {filteredBookings.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <FileText className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p className="text-sm">{t.noBookingsFound}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">{t.refNo}</th>
                  <th className="py-3 px-4">{t.meetingTitle}</th>
                  <th className="py-3 px-4">{t.roomCol}</th>
                  <th className="py-3 px-4">{t.timeCol}</th>
                  <th className="py-3 px-4">{t.organizerCol}</th>
                  <th className="py-3 px-4">{t.statusCol}</th>
                  <th className="py-3 px-4 text-right">{t.actionsCol}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {filteredBookings.map((b) => {
                  const room = rooms.find((r) => r.id === b.roomId);
                  const isPending = b.status === 'pending';
                  const isCheckedIn = b.status === 'checked-in';
                  const isCancelled = b.status === 'cancelled';

                  return (
                    <tr key={b.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Ref & PIN */}
                      <td className="py-3.5 px-4 font-mono font-semibold">
                        <div className="text-slate-900">{b.refNumber}</div>
                        <div className="text-[10px] text-indigo-600 font-bold">PIN: {b.pinCode}</div>
                      </td>

                      {/* Topic */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="font-bold text-slate-900 line-clamp-1">{b.title}</div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <Users className="w-3 h-3" />
                          <span>{b.attendeesCount} {language === 'lo' ? 'ຄົນ' : 'attendees'}</span>
                        </div>
                      </td>

                      {/* Room */}
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-800 block">
                          {room ? (language === 'lo' ? room.nameLao : room.name) : b.roomId}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {t.floor} {room?.floor || 1}
                        </span>
                      </td>

                      {/* Date & Time */}
                      <td className="py-3.5 px-4 font-mono">
                        <div className="font-bold text-indigo-700">{b.startTime} - {b.endTime}</div>
                        <div className="text-[11px] text-slate-500">{b.date}</div>
                      </td>

                      {/* Organizer */}
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-900">{b.organizer}</div>
                        <div className="text-[10px] text-slate-500">{b.department}</div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        {getStatusBadge(b.status)}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Approval buttons for Pending */}
                          {isPending && (
                            <>
                              <button
                                onClick={() => onApprove(b.id)}
                                title={t.approve}
                                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors flex items-center gap-1 shadow-xs"
                              >
                                <Check className="w-3 h-3" />
                                <span>{t.approve}</span>
                              </button>
                              <button
                                onClick={() => onReject(b.id)}
                                title={t.reject}
                                className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs transition-colors flex items-center gap-1 shadow-xs"
                              >
                                <X className="w-3 h-3" />
                                <span>{t.reject}</span>
                              </button>
                            </>
                          )}

                          {/* Check-In button if confirmed */}
                          {!isCheckedIn && !isPending && !isCancelled && (
                            <button
                              onClick={() => onCheckIn(b.id)}
                              title={t.checkIn}
                              className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-colors"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                          )}

                          {/* Print Pass Slip */}
                          {!isCancelled && (
                            <button
                              onClick={() => onViewSlip(b)}
                              title={t.printSlip}
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                            >
                              <Printer className="w-4 h-4" />
                            </button>
                          )}

                          {/* Cancel button */}
                          {!isCancelled && (
                            <button
                              onClick={() => onCancel(b.id)}
                              title={t.cancelBooking}
                              className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
