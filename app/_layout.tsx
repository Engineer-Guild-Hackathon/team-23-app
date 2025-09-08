import { auth, db } from '@/lib/firebase';
import { Stack } from 'expo-router';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { createContext, useContext, useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

interface AppUser {
  uid: string;
  email: string | null;
  role?: 'senior' | 'org' | 'admin';
  onboardingDone?: boolean;
}

const AuthContext = createContext<{
  user: AppUser | null;
  loading: boolean;
}>({ user: null, loading: true });

export const useAuth = () => useContext(AuthContext);

export default function RootLayout() {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('Setting up auth state listener...');
    const unsub = onAuthStateChanged(auth, async (u: User | null) => {
      console.log(
        'Auth state changed:',
        u ? 'User logged in' : 'User logged out',
      );

      if (!u) {
        console.log('No user, setting user to null');
        setUser(null);
        setLoading(false);
        return;
      }

      console.log('User UID:', u.uid);
      console.log('Fetching user data from users collection...');

      try {
        const snap = await getDoc(doc(db, 'users', u.uid));
        console.log('User document exists:', snap.exists());

        const data = snap.exists() ? snap.data() : {};
        console.log('User data:', data);

        const userData = {
          uid: u.uid,
          email: u.email,
          role: (data.role as AppUser['role']) ?? undefined,
          onboardingDone: Boolean(data.onboardingDone),
        };

        console.log('Setting user state:', userData);
        setUser(userData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching user data:', error);
        setLoading(false);
      }
    });
    return () => unsub();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <AuthContext.Provider value={{ user, loading }}>
      <Stack screenOptions={{ headerShown: false }} />
    </AuthContext.Provider>
  );
}
