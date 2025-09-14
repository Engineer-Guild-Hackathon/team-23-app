import { db } from '@/lib/firebase';
import { EventPost, EventApplication, ApplicationStatus } from '@/lib/types';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
  orderBy,
  limit,
  Timestamp,
  addDoc,
} from 'firebase/firestore';

export class EventService {
  static async createEvent(event: Omit<EventPost, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const now = Timestamp.now();
      const eventData: Omit<EventPost, 'id'> = {
        ...event,
        createdAt: now,
        updatedAt: now,
      };

      const docRef = await addDoc(collection(db, 'events'), eventData);
      return docRef.id;
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  }

  static async getEvent(eventId: string): Promise<EventPost | null> {
    try {
      const eventDoc = await getDoc(doc(db, 'events', eventId));
      if (eventDoc.exists()) {
        return { id: eventDoc.id, ...eventDoc.data() } as EventPost;
      }
      return null;
    } catch (error) {
      console.error('Error fetching event:', error);
      throw error;
    }
  }

  static async getEventsByOrganizer(organizerId: string): Promise<EventPost[]> {
    try {
      const q = query(
        collection(db, 'events'),
        where('organizerId', '==', organizerId),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }) as EventPost);
    } catch (error) {
      console.error('Error fetching events by organizer:', error);
      throw error;
    }
  }

  static async getActiveEvents(limitCount?: number): Promise<EventPost[]> {
    try {
      let q = query(
        collection(db, 'events'),
        where('isActive', '==', true),
        orderBy('eventDate', 'asc')
      );

      if (limitCount) {
        q = query(q, limit(limitCount));
      }

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }) as EventPost);
    } catch (error) {
      console.error('Error fetching active events:', error);
      throw error;
    }
  }

  static async updateEvent(
    eventId: string,
    updates: Partial<Omit<EventPost, 'id' | 'createdAt'>>
  ): Promise<void> {
    try {
      await updateDoc(doc(db, 'events', eventId), {
        ...updates,
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error('Error updating event:', error);
      throw error;
    }
  }

  static async applyToEvent(application: Omit<EventApplication, 'id' | 'appliedAt' | 'updatedAt'>): Promise<string> {
    try {
      const now = Timestamp.now();
      const applicationData: Omit<EventApplication, 'id'> = {
        ...application,
        appliedAt: now,
        updatedAt: now,
      };

      const docRef = await addDoc(collection(db, 'applications'), applicationData);
      return docRef.id;
    } catch (error) {
      console.error('Error applying to event:', error);
      throw error;
    }
  }

  static async getApplicationsByApplicant(applicantId: string): Promise<EventApplication[]> {
    try {
      const q = query(
        collection(db, 'applications'),
        where('applicantId', '==', applicantId),
        orderBy('appliedAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }) as EventApplication);
    } catch (error) {
      console.error('Error fetching applications by applicant:', error);
      throw error;
    }
  }

  static async getApplicationsByEvent(eventId: string): Promise<EventApplication[]> {
    try {
      const q = query(
        collection(db, 'applications'),
        where('eventId', '==', eventId),
        orderBy('appliedAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }) as EventApplication);
    } catch (error) {
      console.error('Error fetching applications by event:', error);
      throw error;
    }
  }

  static async updateApplicationStatus(
    applicationId: string,
    status: ApplicationStatus,
    organizationResponse?: string
  ): Promise<void> {
    try {
      const updates: Partial<EventApplication> = {
        status,
        updatedAt: Timestamp.now(),
      };

      if (organizationResponse) {
        updates.organizationResponse = organizationResponse;
      }

      await updateDoc(doc(db, 'applications', applicationId), updates);
    } catch (error) {
      console.error('Error updating application status:', error);
      throw error;
    }
  }
}