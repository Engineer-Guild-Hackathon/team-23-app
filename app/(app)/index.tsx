import { db } from '@/lib/firebase';
import { Profile } from '@/lib/types';
import { doc, getDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
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
          setProfile(profileDoc.data() as Profile);
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
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text>プロフィールを読み込み中...</Text>
      </View>
    );
  }

  const getRoleLabel = (role?: string) => {
    switch (role) {
      case 'senior':
        return '個人ユーザー';
      case 'org':
        return '組織ユーザー';
      default:
        return '未設定';
    }
  };

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 24 }}>
      <View style={{ alignItems: 'center', marginBottom: 32 }}>
        <Text style={{ fontSize: 28, fontWeight: '700', marginBottom: 8 }}>
          ようこそ！
        </Text>
        <Text style={{ fontSize: 18, color: '#6b7280' }}>
          {profile?.name || user?.email}
        </Text>
      </View>

      <View
        style={{
          backgroundColor: '#f9fafb',
          borderRadius: 12,
          padding: 20,
          marginBottom: 20,
        }}
      >
        <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 12 }}>
          アカウント情報
        </Text>
        <InfoRow label="役割" value={getRoleLabel(user?.role)} />
        <InfoRow label="メールアドレス" value={user?.email || '—'} />
        <InfoRow
          label="活動エリア"
          value={
            profile?.area ? `${profile.area.pref} ${profile.area.city}` : '—'
          }
        />
      </View>

      {user?.role === 'senior' && profile?.seniorProfile && (
        <View
          style={{
            backgroundColor: '#f0f9ff',
            borderRadius: 12,
            padding: 20,
            marginBottom: 20,
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 12 }}>
            個人プロフィール
          </Text>
          <InfoRow
            label="ニックネーム"
            value={profile.seniorProfile.nickname}
          />
          <InfoRow
            label="性別"
            value={
              profile.seniorProfile.gender === 'male'
                ? '男性'
                : profile.seniorProfile.gender === 'female'
                  ? '女性'
                  : profile.seniorProfile.gender === 'other'
                    ? 'その他'
                    : '回答しない'
            }
          />
          <InfoRow label="生年月日" value={profile.seniorProfile.birthDate} />
          <InfoRow
            label="趣味"
            value={profile.seniorProfile.hobbies.join('、') || '—'}
          />
          <InfoRow
            label="スキル"
            value={profile.seniorProfile.skills.join('、') || '—'}
          />
        </View>
      )}

      {user?.role === 'org' && profile?.orgProfile && (
        <View
          style={{
            backgroundColor: '#f0fdf4',
            borderRadius: 12,
            padding: 20,
            marginBottom: 20,
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 12 }}>
            組織プロフィール
          </Text>
          <InfoRow label="組織名" value={profile.orgProfile.organizationName} />
          <InfoRow
            label="組織種別"
            value={
              profile.orgProfile.organizationType === 'education'
                ? '教育機関'
                : profile.orgProfile.organizationType === 'government'
                  ? '地方自治体'
                  : profile.orgProfile.organizationType === 'npo'
                    ? 'NPO・NGO'
                    : '企業'
            }
          />
          <InfoRow label="連絡先" value={profile.orgProfile.contactEmail} />
          <InfoRow
            label="設立年"
            value={profile.orgProfile.establishedYear?.toString() || '—'}
          />
          <InfoRow
            label="提供サービス"
            value={profile.orgProfile.services.join('、') || '—'}
          />
          <InfoRow
            label="対象者"
            value={profile.orgProfile.targetAudience.join('、') || '—'}
          />
        </View>
      )}

      {profile?.bio && (
        <View
          style={{ backgroundColor: '#fefce8', borderRadius: 12, padding: 20 }}
        >
          <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 12 }}>
            自己紹介・組織紹介
          </Text>
          <Text style={{ lineHeight: 24, color: '#374151' }}>
            {profile.bio}
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <View style={{ flexDirection: 'row', marginBottom: 8 }}>
    <Text style={{ width: 100, fontSize: 14, color: '#6b7280' }}>{label}:</Text>
    <Text style={{ flex: 1, fontSize: 14, color: '#111827' }}>{value}</Text>
  </View>
);
