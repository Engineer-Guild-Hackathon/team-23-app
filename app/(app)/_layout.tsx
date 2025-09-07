import { Stack, Redirect } from 'expo-router';
import { useAuth } from '../_layout';

export default function AppLayout() {
  const { user } = useAuth();
  if (!user) return <Redirect href="/(auth)/login" />;
  if (!user.onboardingDone) return <Redirect href="/(onboarding)" />;
  return <Stack screenOptions={{ headerShown: false }} />;
}
