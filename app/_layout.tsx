import { Stack } from 'expo-router';
import { useEffect, useState, createContext, useContext } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { View, ActivityIndicator } from 'react-native';

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
    const unsub = onAuthStateChanged(auth, async (u: User | null) => {
      if (!u) {
        setUser(null);
        setLoading(false);
        return;
      }

      const snap = await getDoc(doc(db, 'users', u.uid));
      const data = snap.exists() ? snap.data() : {};
      setUser({
        uid: u.uid,
        email: u.email,
        role: (data.role as AppUser['role']) ?? undefined,
        onboardingDone: Boolean(data.onboardingDone),
      });
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
    <AuthContext.Provider value={{ user, loading }}>
      <Stack screenOptions={{ headerShown: false }} />
    </AuthContext.Provider>
  );
}
