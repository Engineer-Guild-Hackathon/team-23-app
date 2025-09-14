import { db } from '@/lib/firebase';
import { Profile } from '@/lib/types';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
  Timestamp,
} from 'firebase/firestore';

export class ProfileService {
  static async getProfile(uid: string): Promise<Profile | null> {
    try {
      const profileDoc = await getDoc(doc(db, 'profiles', uid));
      if (profileDoc.exists()) {
        return profileDoc.data() as Profile;
      }
      return null;
    } catch (error) {
      console.error('Error fetching profile:', error);
      throw error;
    }
  }

  static async createProfile(profile: Omit<Profile, 'createdAt' | 'updatedAt' | 'version'>): Promise<void> {
    try {
      const now = Timestamp.now();
      const profileData: Profile = {
        ...profile,
        createdAt: now,
        updatedAt: now,
        version: 1,
      };

      await setDoc(doc(db, 'profiles', profile.uid), profileData);
    } catch (error) {
      console.error('Error creating profile:', error);
      throw error;
    }
  }

  static async updateProfile(
    uid: string,
    updates: Partial<Omit<Profile, 'uid' | 'createdAt' | 'version'>>
  ): Promise<void> {
    try {
      const profileRef = doc(db, 'profiles', uid);
      const currentProfile = await getDoc(profileRef);
      
      if (!currentProfile.exists()) {
        throw new Error('Profile not found');
      }

      const currentData = currentProfile.data() as Profile;
      
      await updateDoc(profileRef, {
        ...updates,
        updatedAt: Timestamp.now(),
        version: currentData.version + 1,
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }

  static async getProfilesByArea(pref: string, city?: string): Promise<Profile[]> {
    try {
      let q = query(
        collection(db, 'profiles'),
        where('area.pref', '==', pref)
      );

      if (city) {
        q = query(q, where('area.city', '==', city));
      }

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => doc.data() as Profile);
    } catch (error) {
      console.error('Error fetching profiles by area:', error);
      throw error;
    }
  }

  static async getProfilesByRole(role: 'senior' | 'org'): Promise<Profile[]> {
    try {
      const q = query(
        collection(db, 'profiles'),
        where('role', '==', role)
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => doc.data() as Profile);
    } catch (error) {
      console.error('Error fetching profiles by role:', error);
      throw error;
    }
  }
}