export type RoomType = 'boardroom' | 'standard' | 'huddle' | 'training' | 'vip';

export interface Room {
  id: string;
  name: string;
  nameLao: string;
  capacity: number;
  floor: number;
  type: RoomType;
  amenities: string[];
  image: string;
  isVip?: boolean;
  requiresApproval?: boolean;
  description: string;
  descriptionLao: string;
}

export type BookingStatus = 'confirmed' | 'checked-in' | 'pending' | 'cancelled';

export interface Booking {
  id: string;
  refNumber: string; // e.g. MRB-2026-1042
  pinCode: string; // e.g. "4821"
  roomId: string;
  title: string;
  organizer: string;
  email: string;
  department: string;
  attendeesCount: number;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  status: BookingStatus;
  amenitiesRequested: string[];
  catering: {
    coffeeBreak: boolean;
    snacks: boolean;
    lunchBox: boolean;
    waterOnly: boolean;
    specialNotes?: string;
  };
  createdAt: string;
}

export type Language = 'lo' | 'en';

export interface FilterState {
  searchTerm: string;
  status: 'all' | BookingStatus;
  roomId: string;
  date: string;
}
