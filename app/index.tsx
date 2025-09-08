import { Redirect } from 'expo-router';
import { useAuth } from './_layout';

export default function Index() {
  const { user, loading } = useAuth();

  console.log('Index screen - Loading:', loading);
  console.log('Index screen - User:', user);

  if (loading) {
    console.log('Still loading, showing loading screen');
    return null; // または ActivityIndicator
  }

  if (!user) {
    console.log('No user, redirecting to login');
    return <Redirect href="/(auth)/login" />;
  }

  if (!user.onboardingDone) {
    console.log('User onboarding not done, redirecting to onboarding');
    return <Redirect href="/(onboarding)" />;
  }

  console.log('User onboarding done, redirecting to app');
  return <Redirect href="/(app)" />;
}
