import { Redirect, Stack } from 'expo-router';
import { useAuth } from '../_layout';

export default function OnboardingLayout() {
  const { user, loading } = useAuth();

  console.log('OnboardingLayout - Loading:', loading);
  console.log('OnboardingLayout - User:', user);

  if (loading) {
    console.log('OnboardingLayout still loading');
    return null;
  }

  if (!user) {
    console.log('OnboardingLayout - No user, redirecting to login');
    return <Redirect href="/(auth)/login" />;
  }

  if (user.onboardingDone) {
    console.log('OnboardingLayout - Onboarding done, redirecting to app');
    return <Redirect href="/(app)" />;
  }

  console.log('OnboardingLayout - Showing onboarding stack');
  return <Stack screenOptions={{ headerShown: false }} />;
}
