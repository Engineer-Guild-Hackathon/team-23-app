import { Stack, Redirect } from 'expo-router';
import { useAuth } from '../_layout';

export default function AuthLayout() {
  const { user } = useAuth();
  if (user) {
    if (!user.onboardingDone) return <Redirect href="/(onboarding)" />;
    return <Redirect href="/(app)" />;
  }
  return <Stack screenOptions={{ headerShown: false }} />;
}
