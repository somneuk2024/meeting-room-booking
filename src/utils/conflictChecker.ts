import { Booking } from '../types';

export const timeToMinutes = (timeStr: string): number => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
};

export const minutesToTime = (minutes: number): string => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};

export interface ConflictCheckResult {
  hasConflict: boolean;
  conflictingBooking?: Booking;
  message?: string;
}

export const checkBookingConflict = (
  bookings: Booking[],
  roomId: string,
  date: string,
  startTime: string,
  endTime: string,
  excludeBookingId?: string
): ConflictCheckResult => {
  const newStartMin = timeToMinutes(startTime);
  const newEndMin = timeToMinutes(endTime);

  if (newStartMin >= newEndMin) {
    return {
      hasConflict: true,
      message: 'ເວລາສິ້ນສຸດ ຕ້ອງຫຼາຍກວ່າເວລາເລີ່ມຕົ້ນ (End time must be after start time)'
    };
  }

  // Filter bookings for the same room & date that are not cancelled
  const roomBookings = bookings.filter(
    (b) =>
      b.roomId === roomId &&
      b.date === date &&
      b.status !== 'cancelled' &&
      b.id !== excludeBookingId
  );

  for (const b of roomBookings) {
    const existingStart = timeToMinutes(b.startTime);
    const existingEnd = timeToMinutes(b.endTime);

    // Overlap condition: start < existingEnd && end > existingStart
    if (newStartMin < existingEnd && newEndMin > existingStart) {
      return {
        hasConflict: true,
        conflictingBooking: b,
        message: `ຊ້ອນກັນກັບ: "${b.title}" (${b.startTime} - ${b.endTime}) ໂດຍ ${b.organizer}`
      };
    }
  }

  return { hasConflict: false };
};

export const getRoomCurrentStatus = (
  roomId: string,
  bookings: Booking[],
  currentTimeStr: string,
  currentDateStr: string
): {
  isOccupied: boolean;
  currentBooking?: Booking;
  nextBooking?: Booking;
  remainingMinutes?: number;
} => {
  const currentMinutes = timeToMinutes(currentTimeStr);

  const activeBookings = bookings
    .filter(
      (b) =>
        b.roomId === roomId &&
        b.date === currentDateStr &&
        b.status !== 'cancelled'
    )
    .sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));

  const currentBooking = activeBookings.find((b) => {
    const start = timeToMinutes(b.startTime);
    const end = timeToMinutes(b.endTime);
    return currentMinutes >= start && currentMinutes < end;
  });

  if (currentBooking) {
    const endMin = timeToMinutes(currentBooking.endTime);
    return {
      isOccupied: true,
      currentBooking,
      remainingMinutes: Math.max(0, endMin - currentMinutes)
    };
  }

  // Next upcoming booking today
  const nextBooking = activeBookings.find((b) => {
    const start = timeToMinutes(b.startTime);
    return start > currentMinutes;
  });

  return {
    isOccupied: false,
    nextBooking
  };
};

export const generateRefNumber = (): string => {
  const year = new Date().getFullYear();
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `MRB-${year}-${rand}`;
};

export const generatePinCode = (): string => {
  return String(Math.floor(1000 + Math.random() * 9000));
};
