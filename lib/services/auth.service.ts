import { auth, db } from '@/lib/firebase';
import { AppUser } from '@/lib/types';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  User,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export class AuthService {
  static async signUp(email: string, password: string): Promise<AppUser> {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      const userData: AppUser = {
        uid: user.uid,
        email: user.email,
        role: undefined,
        onboardingDone: false,
      };

      await setDoc(doc(db, 'users', user.uid), userData);
      return userData;
    } catch (error) {
      console.error('Error signing up:', error);
      throw error;
    }
  }

  static async signIn(email: string, password: string): Promise<AppUser> {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const userData = await this.fetchUserData(userCredential.user);
      return userData;
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  }

  static async signOut(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  }

  static async fetchUserData(user: User): Promise<AppUser> {
    try {
      const snap = await getDoc(doc(db, 'users', user.uid));
      const data = snap.exists() ? snap.data() : {};

      return {
        uid: user.uid,
        email: user.email,
        role: data.role,
        onboardingDone: Boolean(data.onboardingDone),
      };
    } catch (error) {
      console.error('Error fetching user data:', error);
      throw error;
    }
  }

  static async updateUserData(
    uid: string,
    updates: Partial<AppUser>
  ): Promise<void> {
    try {
      await setDoc(doc(db, 'users', uid), updates, { merge: true });
    } catch (error) {
      console.error('Error updating user data:', error);
      throw error;
    }
  }
}