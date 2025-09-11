import {
  DefaultHomeView,
  ErrorScreen,
  LoadingScreen,
  OrgHomeView,
  SeniorHomeView,
} from '@/components/home';
import { db } from '@/lib/firebase';
import { Profile } from '@/lib/types';
import { doc, getDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { useAuth } from '../_layout';

export default function Home() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.uid) return;

      try {
        const profileDoc = await getDoc(doc(db, 'profiles', user.uid));
        if (profileDoc.exists()) {
          const profileData = profileDoc.data() as Profile;
          console.log('Profile loaded:', profileData.role, profileData.name);
          setProfile(profileData);
        } else {
          console.log('No profile found for user:', user.uid);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  if (loading) {
    return <LoadingScreen />;
  }

  if (!profile) {
    return <ErrorScreen message="プロフィールが見つかりません" />;
  }

  // Role別のホーム画面を表示
  switch (profile.role) {
    case 'senior':
      return <SeniorHomeView profile={profile} />;
    case 'org':
      return <OrgHomeView profile={profile} />;
    default:
      return <DefaultHomeView profile={profile} />;
  }
}
