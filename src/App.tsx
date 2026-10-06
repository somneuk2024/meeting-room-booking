/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { TimelineGrid } from './components/TimelineGrid';
import { ReservationsView } from './components/ReservationsView';
import { DoorKioskView } from './components/DoorKioskView';
import { AnalyticsView } from './components/AnalyticsView';
import { BookingModal } from './components/BookingModal';
import { BookingSlipModal } from './components/BookingSlipModal';
import { INITIAL_ROOMS, getInitialBookings } from './data/initialData';
import { Room, Booking, Language } from './types';
import { translations } from './translations';
import { CheckCircle2, AlertCircle, X, CloudCheck } from 'lucide-react';
import {
  initializeFirestoreData,
  subscribeToRooms,
  subscribeToBookings,
  createBookingInFirestore,
  updateBookingStatusInFirestore
} from './services/bookingService';

const LANG_STORAGE_KEY = 'mrb_lang_preference';

export default function App() {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem(LANG_STORAGE_KEY);
    return saved === 'en' ? 'en' : 'lo'; // Default to Lao
  });

  const [currentTab, setCurrentTab] = useState<'dashboard' | 'timeline' | 'reservations' | 'kiosk' | 'analytics'>('dashboard');

  const [rooms, setRooms] = useState<Room[]>(INITIAL_ROOMS);
  const [bookings, setBookings] = useState<Booking[]>(() => getInitialBookings());
  const [firebaseReady, setFirebaseReady] = useState(false);

  // Initialize and subscribe to Firestore
  useEffect(() => {
    let unsubscribeRooms: (() => void) | undefined;
    let unsubscribeBookings: (() => void) | undefined;

    const setupFirebase = async () => {
      try {
        await initializeFirestoreData();
        setFirebaseReady(true);

        unsubscribeRooms = subscribeToRooms((updatedRooms) => {
          if (updatedRooms.length > 0) {
            setRooms(updatedRooms);
          }
        });

        unsubscribeBookings = subscribeToBookings((updatedBookings) => {
          if (updatedBookings.length > 0) {
            setBookings(updatedBookings);
          }
        });
      } catch (err) {
        console.error('Firebase setup failed, using offline cache', err);
      }
    };

    setupFirebase();

    return () => {
      if (unsubscribeRooms) unsubscribeRooms();
      if (unsubscribeBookings) unsubscribeBookings();
    };
  }, []);

  // Save language preference
  const toggleLanguage = () => {
    const nextLang: Language = language === 'lo' ? 'en' : 'lo';
    setLanguage(nextLang);
    localStorage.setItem(LANG_STORAGE_KEY, nextLang);
  };

  // Toast notification
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Booking Modal State
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [modalPrefill, setModalPrefill] = useState<{
    roomId?: string;
    date?: string;
    startTime?: string;
  }>({});

  // Booking Slip Modal State
  const [selectedSlipBooking, setSelectedSlipBooking] = useState<Booking | null>(null);

  // Kiosk initial room selection
  const [kioskRoomId, setKioskRoomId] = useState<string>(INITIAL_ROOMS[0].id);

  const handleOpenBookingModal = (roomId?: string, date?: string, startTime?: string) => {
    setModalPrefill({ roomId, date, startTime });
    setIsBookingModalOpen(true);
  };

  const handleOpenKiosk = (roomId: string) => {
    setKioskRoomId(roomId);
    setCurrentTab('kiosk');
  };

  const handleBookingCreated = async (newBooking: Booking) => {
    // Optimistic local update
    setBookings((prev) => [newBooking, ...prev.filter((b) => b.id !== newBooking.id)]);
    
    // Persist to Firebase Firestore
    try {
      await createBookingInFirestore(newBooking);
    } catch (err) {
      console.error('Failed to save to Firestore:', err);
    }

    showToast(
      language === 'lo'
        ? `ບັນທຶກລົງ Firebase ສຳເລັດ! ເລກອ້າງອີງ: ${newBooking.refNumber} (PIN: ${newBooking.pinCode})`
        : `Saved to Firebase Firestore! Ref: ${newBooking.refNumber} (PIN: ${newBooking.pinCode})`,
      'success'
    );
    // Automatically open the printable booking pass slip
    setSelectedSlipBooking(newBooking);
  };

  const handleCheckIn = async (bookingId: string) => {
    // Optimistic local update
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: 'checked-in' } : b))
    );

    // Persist to Firebase Firestore
    try {
      await updateBookingStatusInFirestore(bookingId, 'checked-in');
    } catch (err) {
      console.error('Failed to update status in Firestore:', err);
    }

    const target = bookings.find((b) => b.id === bookingId);
    showToast(
      language === 'lo'
        ? `ເຊັກອິນສຳເລັດແລ້ວ! "${target?.title || ''}"`
        : `Checked-in successfully! "${target?.title || ''}"`,
      'success'
    );
  };

  const handleApprove = async (bookingId: string) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: 'confirmed' } : b))
    );
    try {
      await updateBookingStatusInFirestore(bookingId, 'confirmed');
    } catch (err) {
      console.error('Failed to update status in Firestore:', err);
    }
    showToast(
      language === 'lo' ? 'ອະນຸມັດການຈອງຮຽບຮ້ອຍແລ້ວ (Firebase Updated)!' : 'Booking request approved & saved to Firebase!',
      'success'
    );
  };

  const handleReject = async (bookingId: string) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: 'cancelled' } : b))
    );
    try {
      await updateBookingStatusInFirestore(bookingId, 'cancelled');
    } catch (err) {
      console.error('Failed to update status in Firestore:', err);
    }
    showToast(
      language === 'lo' ? 'ປະຕິເສດການຈອງແລ້ວ (Firebase Updated)' : 'Booking request rejected & saved to Firebase',
      'info'
    );
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (
      window.confirm(
        language === 'lo'
          ? 'ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການຍົກເລີກການຈອງນີ້?'
          : 'Are you sure you want to cancel this booking?'
      )
    ) {
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status: 'cancelled' } : b))
      );
      try {
        await updateBookingStatusInFirestore(bookingId, 'cancelled');
      } catch (err) {
        console.error('Failed to update status in Firestore:', err);
      }
      showToast(
        language === 'lo' ? 'ຍົກເລີກການຈອງຮຽບຮ້ອຍແລ້ວ' : 'Booking cancelled successfully',
        'info'
      );
    }
  };

  const handleQuickBookWalkIn = async (walkInBooking: Booking) => {
    setBookings((prev) => [walkInBooking, ...prev.filter((b) => b.id !== walkInBooking.id)]);
    try {
      await createBookingInFirestore(walkInBooking);
    } catch (err) {
      console.error('Failed to save walk-in to Firestore:', err);
    }
    showToast(
      language === 'lo'
        ? `ຈອງດ່ວນ Walk-in ສຳເລັດ! ບັນທຶກລົງ Firebase ແລ້ວ`
        : `Walk-in booking created & stored in Firebase!`,
      'success'
    );
  };

  const slipRoom = selectedSlipBooking
    ? rooms.find((r) => r.id === selectedSlipBooking.roomId)
    : undefined;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        language={language}
        onToggleLanguage={toggleLanguage}
        onOpenNewBooking={() => handleOpenBookingModal()}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {currentTab === 'dashboard' && (
          <DashboardView
            rooms={rooms}
            bookings={bookings}
            language={language}
            onOpenBookingModal={handleOpenBookingModal}
            onOpenKiosk={handleOpenKiosk}
            onCheckIn={handleCheckIn}
            onViewSlip={setSelectedSlipBooking}
            onViewTimeline={() => setCurrentTab('timeline')}
          />
        )}

        {currentTab === 'timeline' && (
          <TimelineGrid
            rooms={rooms}
            bookings={bookings}
            language={language}
            onOpenBookingModal={handleOpenBookingModal}
            onViewSlip={setSelectedSlipBooking}
          />
        )}

        {currentTab === 'reservations' && (
          <ReservationsView
            bookings={bookings}
            rooms={rooms}
            language={language}
            onApprove={handleApprove}
            onReject={handleReject}
            onCheckIn={handleCheckIn}
            onCancel={handleCancelBooking}
            onViewSlip={setSelectedSlipBooking}
          />
        )}

        {currentTab === 'kiosk' && (
          <DoorKioskView
            rooms={rooms}
            bookings={bookings}
            language={language}
            initialRoomId={kioskRoomId}
            onQuickBookWalkIn={handleQuickBookWalkIn}
            onPinCheckInSuccess={handleCheckIn}
          />
        )}

        {currentTab === 'analytics' && (
          <AnalyticsView
            rooms={rooms}
            bookings={bookings}
            language={language}
          />
        )}
      </main>

      {/* Booking Form Modal */}
      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        rooms={rooms}
        bookings={bookings}
        language={language}
        preselectedRoomId={modalPrefill.roomId}
        preselectedDate={modalPrefill.date}
        preselectedStartTime={modalPrefill.startTime}
        onBookingCreated={handleBookingCreated}
      />

      {/* Printable Booking Slip Modal */}
      <BookingSlipModal
        booking={selectedSlipBooking}
        room={slipRoom}
        language={language}
        onClose={() => setSelectedSlipBooking(null)}
      />

      {/* Toast Notification Popup */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl bg-slate-900 text-white shadow-2xl border border-slate-800 animate-in slide-in-from-bottom-5 duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold">{toast.message}</span>
          <button
            onClick={() => setToast(null)}
            className="text-slate-400 hover:text-white ml-2 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200/80 py-6 text-center text-xs text-slate-500 no-print">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 font-mono">
            <span className="font-bold text-slate-800">MRB-SYSTEM</span>
            <span>·</span>
            <span>Meeting Room Booking & Management System</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Firebase Firestore: meeting-room-booking</span>
            </span>
            <span className="mx-1">•</span>
            <span>{language === 'lo' ? 'ຮອງຮັບພາສາລາວ & English' : 'Bilingual (LO/EN)'}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
