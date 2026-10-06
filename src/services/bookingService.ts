import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  onSnapshot,
  writeBatch
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType, testConnection } from '../firebase';
import { Booking, Room } from '../types';
import { INITIAL_ROOMS, getInitialBookings } from '../data/initialData';

const ROOMS_COLLECTION = 'rooms';
const BOOKINGS_COLLECTION = 'bookings';

// Seed initial rooms and bookings to Firestore if empty
export async function initializeFirestoreData(): Promise<void> {
  try {
    await testConnection();

    // 1. Check rooms
    const roomsSnap = await getDocs(collection(db, ROOMS_COLLECTION)).catch((err) => {
      handleFirestoreError(err, OperationType.GET, ROOMS_COLLECTION);
    });

    if (roomsSnap.empty) {
      console.log('Seeding initial meeting rooms to Firestore...');
      const batch = writeBatch(db);
      for (const room of INITIAL_ROOMS) {
        const roomRef = doc(db, ROOMS_COLLECTION, room.id);
        batch.set(roomRef, room);
      }
      await batch.commit().catch((err) => {
        handleFirestoreError(err, OperationType.WRITE, ROOMS_COLLECTION);
      });
    }

    // 2. Check bookings
    const bookingsSnap = await getDocs(collection(db, BOOKINGS_COLLECTION)).catch((err) => {
      handleFirestoreError(err, OperationType.GET, BOOKINGS_COLLECTION);
    });

    if (bookingsSnap.empty) {
      console.log('Seeding initial sample bookings to Firestore...');
      const initialList = getInitialBookings();
      const batch = writeBatch(db);
      for (const booking of initialList) {
        const bookingRef = doc(db, BOOKINGS_COLLECTION, booking.id);
        batch.set(bookingRef, booking);
      }
      await batch.commit().catch((err) => {
        handleFirestoreError(err, OperationType.WRITE, BOOKINGS_COLLECTION);
      });
    }
  } catch (error) {
    console.warn('Notice during Firestore data initialization:', error);
  }
}

// Subscribe to real-time rooms
export function subscribeToRooms(callback: (rooms: Room[]) => void): () => void {
  const roomsCol = collection(db, ROOMS_COLLECTION);
  return onSnapshot(
    roomsCol,
    (snapshot) => {
      if (!snapshot.empty) {
        const roomsList: Room[] = [];
        snapshot.forEach((d) => {
          roomsList.push(d.data() as Room);
        });
        callback(roomsList);
      } else {
        callback(INITIAL_ROOMS);
      }
    },
    (error) => {
      console.error('Rooms onSnapshot error:', error);
      handleFirestoreError(error, OperationType.GET, ROOMS_COLLECTION);
    }
  );
}

// Subscribe to real-time bookings
export function subscribeToBookings(callback: (bookings: Booking[]) => void): () => void {
  const bookingsCol = collection(db, BOOKINGS_COLLECTION);
  return onSnapshot(
    bookingsCol,
    (snapshot) => {
      const list: Booking[] = [];
      snapshot.forEach((d) => {
        list.push(d.data() as Booking);
      });
      // Sort newest created first
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      callback(list);
    },
    (error) => {
      console.error('Bookings onSnapshot error:', error);
      handleFirestoreError(error, OperationType.GET, BOOKINGS_COLLECTION);
    }
  );
}

// Create new booking in Firestore
export async function createBookingInFirestore(booking: Booking): Promise<void> {
  const path = `${BOOKINGS_COLLECTION}/${booking.id}`;
  try {
    const bookingRef = doc(db, BOOKINGS_COLLECTION, booking.id);
    await setDoc(bookingRef, booking);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Update booking status in Firestore
export async function updateBookingStatusInFirestore(
  bookingId: string,
  status: Booking['status']
): Promise<void> {
  const path = `${BOOKINGS_COLLECTION}/${bookingId}`;
  try {
    const bookingRef = doc(db, BOOKINGS_COLLECTION, bookingId);
    await updateDoc(bookingRef, { status });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}
