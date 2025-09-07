import { Stack, Redirect } from 'expo-router';
import { useAuth } from '../_layout';

export default function OnboardingLayout() {
  const { user } = useAuth();
  if (!user) return <Redirect href="/(auth)/login" />;
  if (user.onboardingDone) return <Redirect href="/(app)" />;
  return <Stack screenOptions={{ headerShown: false }} />;
}
