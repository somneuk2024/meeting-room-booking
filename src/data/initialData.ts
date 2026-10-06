import { Room, Booking } from '../types';

export const INITIAL_ROOMS: Room[] = [
  {
    id: 'room-vientiane',
    name: 'Vientiane Grand Boardroom',
    nameLao: 'ຫ້ອງປະຊຸມໃຫຍ່ ວຽງຈັນ',
    capacity: 24,
    floor: 4,
    type: 'vip',
    amenities: [
      'Dual 85" 4K Displays',
      'Cisco Webex / Poly Studio 4K',
      'Ceiling Array Microphones',
      'Motorized Laser Projector',
      'Electronic Glass Whiteboard',
      'Executive Leather Chairs',
      'Coffee & Tea Station'
    ],
    image: 'https://images.unsplash.com/photo-1517502884422-41eaead166d4?auto=format&fit=crop&w=800&q=80',
    isVip: true,
    requiresApproval: true,
    description: 'Premier executive boardroom for board meetings, partner summits, and high-level negotiations.',
    descriptionLao: 'ຫ້ອງປະຊຸມຄະນະບໍລິຫານງານລະດັບສູງ ຮອງຮັບການປະຊຸມທາງໄກຂ້າມປະເທດ ພ້ອມລະບົບສຽງ ແລະ ພາບລະດັບ Ultra HD'
  },
  {
    id: 'room-luangprabang',
    name: 'Luang Prabang Conference Room',
    nameLao: 'ຫ້ອງປະຊຸມ ຫຼວງພະບາງ',
    capacity: 14,
    floor: 3,
    type: 'standard',
    amenities: [
      '75" 4K Smart Display',
      'Logitech Rally Video Bar',
      'Dual Wireless Microphones',
      'Magnetic Glass Whiteboard',
      'High-Speed HDMI & USB-C Dock'
    ],
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80',
    isVip: false,
    requiresApproval: false,
    description: 'Spacious collaborative conference room ideal for cross-departmental reviews and strategic sessions.',
    descriptionLao: 'ຫ້ອງປະຊຸມຂະໜາດກາງ ເໝາະສຳລັບການປະຊຸມລະຫວ່າງພະແນກ ແລະ ການນຳສະເໜີແຜນງານ'
  },
  {
    id: 'room-champasak',
    name: 'Champasak Executive Suite',
    nameLao: 'ຫ້ອງປະຊຸມ ຈຳປາສັກ',
    capacity: 10,
    floor: 3,
    type: 'standard',
    amenities: [
      '65" 4K Touch Interactive Display',
      '4K AI Framing Camera',
      'Boundary Table Microphones',
      'Glass Whiteboard',
      'Air Purifier'
    ],
    image: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=800&q=80',
    isVip: false,
    requiresApproval: false,
    description: 'Comfortable executive conference room with touch screen interactive collaboration.',
    descriptionLao: 'ຫ້ອງປະຊຸມຜູ້ບໍລິຫານ ພ້ອມໜ້າຈໍສຳຜັດແບບ Interactive ສຳລັບການຂຽນໄອເດຍ ແລະ Brainstorm'
  },
  {
    id: 'room-namngum',
    name: 'Nam Ngum Collaboration Pod',
    nameLao: 'ຫ້ອງປະຊຸມ ນ້ຳງື່ມ (Huddle Room)',
    capacity: 6,
    floor: 2,
    type: 'huddle',
    amenities: [
      '55" 4K TV with Wireless AirPlay',
      'Wide-angle Webcam',
      'Tabletop Speakerphone',
      'Mobile Whiteboard'
    ],
    image: 'https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?auto=format&fit=crop&w=800&q=80',
    isVip: false,
    requiresApproval: false,
    description: 'Agile sprint room designed for rapid stand-ups, pair programming, and client video calls.',
    descriptionLao: 'ຫ້ອງປະຊຸມຍ່ອຍຂະໜາດກະທັດຮັດ ສຳລັບການປະຊຸມດ່ວນ, Scrum / Sprint ແລະ ຄุยວຽກແບບໃກ້ຊິດ'
  },
  {
    id: 'room-xiengkhouang',
    name: 'Xieng Khouang Innovation & Training Hall',
    nameLao: 'ຫ້ອງຝຶກອົບຮົມ ຊຽງຂວາງ',
    capacity: 32,
    floor: 2,
    type: 'training',
    amenities: [
      'Dual 120" Laser Projectors',
      'Wireless Lapel & Handheld Microphones',
      'Classroom Modular Desks',
      'Surround Audio System',
      'Live Streaming Setup'
    ],
    image: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=800&q=80',
    isVip: false,
    requiresApproval: false,
    description: 'Spacious auditorium-style hall optimized for workshops, staff training, and company townhalls.',
    descriptionLao: 'ຫ້ອງຝຶກອົບຮົມ ແລະ ສຳມະນາໃຫຍ່ ພ້ອມໂປຣເຈັກເຕີເລເຊີຄູ່ ແລະ ລະບົບສຽງຮອບທິດທາງ'
  },
  {
    id: 'room-vangvieng',
    name: 'Vang Vieng Focus Room',
    nameLao: 'ຫ້ອງ Focus Room ວັງວຽງ',
    capacity: 4,
    floor: 1,
    type: 'huddle',
    amenities: [
      '43" 4K Monitor',
      'Noise-Canceling Acoustic Panels',
      'Jabra Speak 710 Speakerphone',
      'Mini Whiteboard'
    ],
    image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80',
    isVip: false,
    requiresApproval: false,
    description: 'Quiet soundproof room for 1-on-1 interviews, private calls, and intense deep work.',
    descriptionLao: 'ຫ້ອງເກັບສຽງຂະໜາດນ້ອຍ ສຳລັບການສຳພາດງານ, ໂທຫາລູກຄ້າສຳຄັນ ຫຼື ການເຮັດວຽກທີ່ຕ້ອງການສະມາທິສູງ'
  }
];

export const getTodayString = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getInitialBookings = (): Booking[] => {
  const today = getTodayString();
  
  return [
    {
      id: 'book-1',
      refNumber: 'MRB-2026-0914',
      pinCode: '7241',
      roomId: 'room-vientiane',
      title: 'ການປະຊຸມສະພາບໍລິຫານ ໄຕມາດ 4 (Board of Directors Q4 Review)',
      organizer: 'ທ່ານ ສົມສັກ ວົງສາ (Mr. Somsak Vongsa)',
      email: 'somsak.v@company.la',
      department: 'ຄະນະບໍລິຫານງານ (Executive Board)',
      attendeesCount: 18,
      date: today,
      startTime: '09:00',
      endTime: '11:30',
      status: 'confirmed',
      amenitiesRequested: [
        'Dual 85" 4K Displays',
        'Cisco Webex / Poly Studio 4K',
        'Ceiling Array Microphones'
      ],
      catering: {
        coffeeBreak: true,
        snacks: true,
        lunchBox: false,
        waterOnly: false,
        specialNotes: 'ຕ້ອງການອາຫານຫວ່າງ 2 ຊຸດ ແລະ ກາເຟສົດລາວ'
      },
      createdAt: new Date().toISOString()
    },
    {
      id: 'book-2',
      refNumber: 'MRB-2026-1022',
      pinCode: '3189',
      roomId: 'room-luangprabang',
      title: 'ປະຊຸມວາງແຜນພັດທະນາລະບົບ Mobile Banking & Security',
      organizer: 'ມານີນາ ແກ້ວມະນີ (Manina Keomany)',
      email: 'manina.k@company.la',
      department: 'ພະແນກເຕັກໂນໂລຊີຂໍ້ມູນຂ່າວສານ (IT)',
      attendeesCount: 12,
      date: today,
      startTime: '10:00',
      endTime: '12:00',
      status: 'checked-in',
      amenitiesRequested: [
        '75" 4K Smart Display',
        'Magnetic Glass Whiteboard'
      ],
      catering: {
        coffeeBreak: true,
        snacks: false,
        lunchBox: false,
        waterOnly: true,
        specialNotes: 'ຕ້ອງການປັກສຽບສາຍ Lan ແລະ ໄຟຟ້າເພີ່ມ'
      },
      createdAt: new Date().toISOString()
    },
    {
      id: 'book-3',
      refNumber: 'MRB-2026-1188',
      pinCode: '5564',
      roomId: 'room-champasak',
      title: 'ສຳພາດງານຕຳແໜ່ງ Senior Software Engineer & DevOps',
      organizer: 'ນາງ ວິໄລພອນ ສຸລິວົງ (Vilaiphone Soulivong)',
      email: 'hr.recruit@company.la',
      department: 'ພະແນກຊັບພະຍາກອນມະນຸດ (HR)',
      attendeesCount: 5,
      date: today,
      startTime: '13:30',
      endTime: '15:30',
      status: 'confirmed',
      amenitiesRequested: [
        '65" 4K Touch Interactive Display',
        'Air Purifier'
      ],
      catering: {
        coffeeBreak: true,
        snacks: true,
        lunchBox: false,
        waterOnly: false,
        specialNotes: ''
      },
      createdAt: new Date().toISOString()
    },
    {
      id: 'book-4',
      refNumber: 'MRB-2026-1205',
      pinCode: '8912',
      roomId: 'room-namngum',
      title: 'Sprint Retrospective & Demo (IT Mobile Team)',
      organizer: 'ອານຸລັກ ພົມມະຈັນ (Anoulack Phommachanh)',
      email: 'anoulack.p@company.la',
      department: 'ພະແນກເຕັກໂນໂລຊີຂໍ້ມູນຂ່າວສານ (IT)',
      attendeesCount: 6,
      date: today,
      startTime: '14:00',
      endTime: '15:00',
      status: 'confirmed',
      amenitiesRequested: [
        '55" 4K TV with Wireless AirPlay',
        'Mobile Whiteboard'
      ],
      catering: {
        coffeeBreak: false,
        snacks: false,
        lunchBox: false,
        waterOnly: true,
        specialNotes: ''
      },
      createdAt: new Date().toISOString()
    },
    {
      id: 'book-5',
      refNumber: 'MRB-2026-1330',
      pinCode: '4420',
      roomId: 'room-xiengkhouang',
      title: 'ຫຼັກສູດອົບຮົມ Cyber Security Awareness 2026',
      organizer: 'ສອນໄຊ ໄຊຍະວົງ (Sonxay Xayyavong)',
      email: 'sonxay.x@company.la',
      department: 'ພະແນກປະຕິບັດການ (Operations)',
      attendeesCount: 28,
      date: today,
      startTime: '14:00',
      endTime: '17:00',
      status: 'pending',
      amenitiesRequested: [
        'Dual 120" Laser Projectors',
        'Wireless Lapel & Handheld Microphones',
        'Surround Audio System'
      ],
      catering: {
        coffeeBreak: true,
        snacks: true,
        lunchBox: false,
        waterOnly: false,
        specialNotes: 'ຕ້ອງການໄມໂຄຣໂຟນໄຮ້ສາຍ 2 ຕົວ ແລະ ກາເຟ 30 ຈອກ'
      },
      createdAt: new Date().toISOString()
    },
    {
      id: 'book-6',
      refNumber: 'MRB-2026-1490',
      pinCode: '6175',
      roomId: 'room-vangvieng',
      title: 'ປຶກສາຫາລືການຕະຫຼາດອອນລາຍ Brand Campaign Q4',
      organizer: 'ແກ້ວອຸດອນ ຈັນທະວົງ (Keo-oudone Chanthavong)',
      email: 'keo.c@company.la',
      department: 'ພະແນກການຕະຫຼາດ & ຂາຍ (Marketing)',
      attendeesCount: 3,
      date: today,
      startTime: '11:00',
      endTime: '12:00',
      status: 'confirmed',
      amenitiesRequested: [
        '43" 4K Monitor',
        'Jabra Speak 710 Speakerphone'
      ],
      catering: {
        coffeeBreak: false,
        snacks: false,
        lunchBox: false,
        waterOnly: true,
        specialNotes: ''
      },
      createdAt: new Date().toISOString()
    }
  ];
};
