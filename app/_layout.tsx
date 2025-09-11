import { auth, db } from '@/lib/firebase';
import { AppUser } from '@/lib/types';
import { Stack } from 'expo-router';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { createContext, useContext, useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

const AuthContext = createContext<{
  user: AppUser | null;
  loading: boolean;
  refreshUser: () => Promise<void>;
}>({ user: null, loading: true, refreshUser: async () => {} });

export const useAuth = () => useContext(AuthContext);

export default function RootLayout() {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserData = async (u: User) => {
    try {
      const snap = await getDoc(doc(db, 'users', u.uid));
      const data = snap.exists() ? snap.data() : {};

      const userData: AppUser = {
        uid: u.uid,
        email: u.email,
        role: (data.role as AppUser['role']) ?? undefined,
        onboardingDone: Boolean(data.onboardingDone),
      };

      setUser(userData);
      return userData;
    } catch (error) {
      console.error('Error fetching user data:', error);
      throw error;
    }
  };

  const refreshUser = async () => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      await fetchUserData(currentUser);
    }
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u: User | null) => {
      if (!u) {
        setUser(null);
        setLoading(false);
        return;
      }

      await fetchUserData(u);
      setLoading(false);
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
    <AuthContext.Provider value={{ user, loading, refreshUser }}>
      <Stack screenOptions={{ headerShown: false }} />
    </AuthContext.Provider>
  );
}
