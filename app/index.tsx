import { Redirect } from 'expo-router';
import { useAuth } from './_layout';

export default function Index() {
  const { user, loading } = useAuth();

  if (loading) {
    return null; // または ActivityIndicator
  }

  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  if (!user.onboardingDone) {
    return <Redirect href="/(onboarding)" />;
  }

  return <Redirect href="/(app)" />;
}
