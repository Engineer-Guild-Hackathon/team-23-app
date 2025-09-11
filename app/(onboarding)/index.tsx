import { db } from '@/lib/firebase';
import { Redirect } from 'expo-router';
import { doc, getDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { useAuth } from '../_layout';

export default function OnboardingIndex() {
  const { user } = useAuth();
  const [checking, setChecking] = useState(true);
  const [hasRole, setHasRole] = useState<boolean | null>(null);
  const [onboardingDone, setOnboardingDone] = useState<boolean | null>(null);

  console.log('OnboardingIndex - User:', user);

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      if (!user) {
        console.log('OnboardingIndex - No user, stopping check');
        setChecking(false);
        return;
      }

      console.log('OnboardingIndex - Checking user status...');
      try {
        // users/{uid} の情報をチェック
        const userSnap = await getDoc(doc(db, 'users', user.uid));
        if (!mounted) return;

        const userData = userSnap.data();
        const hasRole = !!userData?.role;
        const onboardingDone = userData?.onboardingDone === true;

        console.log('OnboardingIndex - User data:', userData);
        console.log('OnboardingIndex - Has role:', hasRole);
        console.log('OnboardingIndex - Onboarding done:', onboardingDone);

        setHasRole(hasRole);
        setOnboardingDone(onboardingDone);
        setChecking(false);
      } catch (error) {
        console.error('OnboardingIndex - Error checking user status:', error);
        setChecking(false);
      }
    };
    run();
    return () => {
      mounted = false;
    };
  }, [user]);

  // 未ログインならログインへ
  if (!user) {
    console.log('OnboardingIndex - No user, redirecting to login');
    return <Redirect href="/(auth)/login" />;
  }

  // 判定中は何も出さない（スプラッシュでもOK）
  if (checking) {
    console.log('OnboardingIndex - Still checking, showing loading');
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text>アカウント状態を確認中...</Text>
      </View>
    );
  }

  // 役割未設定 → 役割選択へ
  if (!hasRole) {
    console.log('OnboardingIndex - No role set, redirecting to role selection');
    return <Redirect href="/(onboarding)/role-select" />;
  }

  // オンボーディング未完了 → 役割に応じたプロフィール作成へ
  if (!onboardingDone) {
    const profileUrl =
      user?.role === 'senior'
        ? '/(onboarding)/profile'
        : '/(onboarding)/org-profile';
    console.log(
      'OnboardingIndex - Onboarding not done, redirecting to:',
      profileUrl,
    );
    return <Redirect href={profileUrl} />;
  }

  // オンボーディング完了 → アプリ本体へ
  console.log('OnboardingIndex - Onboarding complete, redirecting to app');
  return <Redirect href="/(app)" />;
}
