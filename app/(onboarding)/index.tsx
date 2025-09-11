import { Redirect } from 'expo-router';
import { useAuth } from '../_layout';

export default function OnboardingIndex() {
  const { user, loading } = useAuth();

  if (loading) {
    return null; // ローディングは親レイアウトで処理
  }

  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  // 役割未設定 → 役割選択へ
  if (!user.role) {
    return <Redirect href="/(onboarding)/role-select" />;
  }

  // オンボーディング未完了 → 役割に応じたプロフィール作成へ
  if (!user.onboardingDone) {
    const profileUrl =
      user.role === 'senior'
        ? '/(onboarding)/profile'
        : '/(onboarding)/org-profile';
    return <Redirect href={profileUrl} />;
  }

  // オンボーディング完了 → アプリ本体へ
  return <Redirect href="/(app)" />;
}
