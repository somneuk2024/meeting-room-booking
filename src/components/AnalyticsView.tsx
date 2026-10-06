import React from 'react';
import {
  BarChart3,
  TrendingUp,
  PieChart,
  Download,
  Clock,
  Users,
  Building,
  CheckCircle,
  Sparkles
} from 'lucide-react';
import { Room, Booking, Language } from '../types';
import { translations } from '../translations';
import { timeToMinutes } from '../utils/conflictChecker';

interface AnalyticsViewProps {
  rooms: Room[];
  bookings: Booking[];
  language: Language;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  rooms,
  bookings,
  language
}) => {
  const t = translations[language];

  // Active bookings (not cancelled)
  const validBookings = bookings.filter((b) => b.status !== 'cancelled');

  // 1. Calculate Room Utilization Rates
  // Available operational day = 11 hours (660 mins) per room
  const roomUtilization = rooms.map((room) => {
    const roomMeetings = validBookings.filter((b) => b.roomId === room.id);
    let totalMinutes = 0;
    roomMeetings.forEach((m) => {
      totalMinutes += Math.max(0, timeToMinutes(m.endTime) - timeToMinutes(m.startTime));
    });

    const hours = (totalMinutes / 60).toFixed(1);
    // Rate relative to an 11-hour standard working day
    const ratePercent = Math.min(100, Math.round((totalMinutes / 660) * 100));

    return {
      room,
      meetingsCount: roomMeetings.length,
      hours,
      ratePercent
    };
  }).sort((a, b) => b.ratePercent - a.ratePercent);

  // 2. Peak Booking Hours distribution (08:00 - 18:00)
  const hourCounts: { [hour: number]: number } = {};
  for (let h = 8; h <= 18; h++) {
    hourCounts[h] = 0;
  }

  validBookings.forEach((b) => {
    const startH = Math.floor(timeToMinutes(b.startTime) / 60);
    const endH = Math.ceil(timeToMinutes(b.endTime) / 60);
    for (let h = startH; h < endH; h++) {
      if (hourCounts[h] !== undefined) {
        hourCounts[h]++;
      }
    }
  });

  const maxHourCount = Math.max(...Object.values(hourCounts), 1);

  // 3. Department Breakdown
  const deptCounts: { [dept: string]: number } = {};
  validBookings.forEach((b) => {
    deptCounts[b.department] = (deptCounts[b.department] || 0) + 1;
  });

  const deptList = Object.entries(deptCounts).sort((a, b) => b[1] - a[1]);

  // Quick stats
  let totalMinutesAll = 0;
  validBookings.forEach((b) => {
    totalMinutesAll += Math.max(0, timeToMinutes(b.endTime) - timeToMinutes(b.startTime));
  });
  const avgDurationMinutes = validBookings.length > 0 ? Math.round(totalMinutesAll / validBookings.length) : 0;
  const topDept = deptList[0] ? deptList[0][0] : 'N/A';
  const topRoom = roomUtilization[0]?.room ? (language === 'lo' ? roomUtilization[0].room.nameLao : roomUtilization[0].room.name) : 'N/A';

  // Export CSV function
  const handleExportCSV = () => {
    const headers = ['RefNumber', 'Title', 'Room', 'Date', 'StartTime', 'EndTime', 'Organizer', 'Department', 'Attendees', 'Status'];
    const rows = validBookings.map((b) => {
      const r = rooms.find((rm) => rm.id === b.roomId);
      return [
        b.refNumber,
        `"${b.title.replace(/"/g, '""')}"`,
        `"${r ? r.name : b.roomId}"`,
        b.date,
        b.startTime,
        b.endTime,
        `"${b.organizer.replace(/"/g, '""')}"`,
        `"${b.department.replace(/"/g, '""')}"`,
        b.attendeesCount,
        b.status
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `MRB_Meeting_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-600" />
            <span>{t.analyticsTitle}</span>
          </h2>
          <p className="text-xs text-slate-500">
            {language === 'lo'
              ? 'ສະຖິຕິອັດຕາການນຳໃຊ້ຫ້ອງ, ຊ່ວງເວລາ Peak Hours ແລະ ການໃຊ້ງານຕາມແຕ່ລະພະແນກ'
              : 'Room utilization, peak booking hours, and department usage metrics'}
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-colors self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5" />
          <span>{t.exportReport} (CSV)</span>
        </button>
      </div>

      {/* Top 3 Summary Highlight Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-medium text-slate-500 block">{t.totalHoursBooked}</span>
          <div className="text-3xl font-black text-indigo-600 font-mono mt-1">
            {(totalMinutesAll / 60).toFixed(1)} <span className="text-sm font-sans text-slate-500">{t.statUnitsHours}</span>
          </div>
          <span className="text-xs text-slate-500 mt-2 block">
            {validBookings.length} {t.statUnitsMeeting}
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-medium text-slate-500 block">{t.avgMeetingDuration}</span>
          <div className="text-3xl font-black text-slate-900 font-mono mt-1">
            {avgDurationMinutes} <span className="text-sm font-sans text-slate-500">{t.minutes}</span>
          </div>
          <span className="text-xs text-slate-500 mt-2 block">
            {language === 'lo' ? 'ຕໍ່ກອງປະຊຸມ' : 'per meeting session'}
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-medium text-slate-500 block">{t.topActiveDept}</span>
          <div className="text-lg font-bold text-slate-900 mt-1 line-clamp-1">
            {topDept}
          </div>
          <span className="text-xs text-indigo-600 font-semibold mt-2 block">
            {deptList[0] ? `${deptList[0][1]} ${t.statUnitsMeeting}` : '—'}
          </span>
        </div>
      </div>

      {/* Grid: Utilization Rates & Peak Hours */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Room Utilization Rates */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-600" />
              <span>{t.utilizationRate}</span>
            </h3>
            <p className="text-xs text-slate-500">
              {language === 'lo' ? 'ຄິດໄລ່ຈາກຊ່ວງເວລາເຮັດວຽກ 11 ຊົ່ວໂມງ/ມື້' : 'Calculated based on 11 operating hours per day'}
            </p>
          </div>

          <div className="space-y-4">
            {roomUtilization.map(({ room, hours, ratePercent }) => (
              <div key={room.id} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800">
                    {language === 'lo' ? room.nameLao : room.name}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">{hours} {t.statUnitsHours}</span>
                    <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                      {ratePercent}%
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700 bg-gradient-to-r from-indigo-500 to-indigo-600"
                    style={{ width: `${ratePercent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Peak Booking Hours */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600" />
              <span>{t.peakHours}</span>
            </h3>
            <p className="text-xs text-slate-500">
              {language === 'lo' ? 'ຄວາມໜາແໜ້ນຂອງການຈອງໃນແຕ່ລະຊົ່ວໂມງ' : 'Meeting density across the operating hours'}
            </p>
          </div>

          {/* Histogram Bar Chart */}
          <div className="pt-6 pb-2">
            <div className="flex items-end justify-between gap-1 h-44 border-b border-slate-200 px-2">
              {Object.entries(hourCounts).map(([hStr, count]) => {
                const hour = Number(hStr);
                const heightPercent = maxHourCount > 0 ? (count / maxHourCount) * 100 : 0;
                const isPeak = count === maxHourCount && count > 0;

                return (
                  <div key={hour} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                    <span className="text-[10px] font-mono font-bold text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity">
                      {count}
                    </span>
                    <div
                      className={`w-full rounded-t-md transition-all duration-500 ${
                        isPeak
                          ? 'bg-amber-500 shadow-xs shadow-amber-500/50'
                          : count > 0
                          ? 'bg-indigo-500 hover:bg-indigo-600'
                          : 'bg-slate-200'
                      }`}
                      style={{ height: `${Math.max(heightPercent, 4)}%` }}
                    />
                  </div>
                );
              })}
            </div>
            {/* Hour labels */}
            <div className="flex justify-between px-2 pt-2 text-[10px] font-mono text-slate-400">
              {Object.keys(hourCounts).map((h) => (
                <span key={h} className="flex-1 text-center">
                  {h}h
                </span>
              ))}
            </div>
          </div>

          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/80 text-amber-900 text-xs flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              {language === 'lo'
                ? 'ຊ່ວງເວລາ 10:00 - 11:30 ແລະ 14:00 - 16:00 ມີການໃຊ້ງານສູງສຸດ'
                : 'Peak demand typically occurs at 10:00 - 11:30 and 14:00 - 16:00.'}
            </span>
          </div>
        </div>
      </div>

      {/* Department Breakdown */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Building className="w-4 h-4 text-indigo-600" />
          <span>{t.deptBreakdown}</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {deptList.map(([dept, count], idx) => {
            const pct = Math.round((count / validBookings.length) * 100);
            return (
              <div
                key={dept}
                className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between"
              >
                <div>
                  <span className="text-xs font-bold text-slate-800 line-clamp-1">{dept}</span>
                  <span className="text-[11px] text-slate-500">{count} {t.statUnitsMeeting}</span>
                </div>
                <div className="font-mono text-sm font-bold text-indigo-700 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                  {pct}%
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
