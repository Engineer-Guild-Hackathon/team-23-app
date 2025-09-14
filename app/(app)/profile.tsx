import { db } from '@/lib/firebase';
import { Profile } from '@/lib/types';
import { Stack, useRouter } from 'expo-router';
import { doc, getDoc } from 'firebase/firestore';
import { useEffect, useMemo, useState } from 'react';
import { Modal, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { styles as menuStyles } from '../../components/home/styles/orgHomeStyles';
import { useAuth } from '../_layout';

const ORG_TYPE_LABELS: Record<string, string> = {
  education: '教育機関',
  government: '地方自治体',
  npo: 'NPO・NGO',
  company: '企業',
};

export default function MyProfileScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      if (!user?.uid) {
        setLoading(false);
        return;
      }
      try {
        const snap = await getDoc(doc(db, 'profiles', user.uid));
        if (snap.exists()) {
          setProfile(snap.data() as Profile);
        }
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [user?.uid]);

  const isOrg = useMemo(() => profile?.role === 'org', [profile?.role]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen options={{ title: 'プロフィール' }} />
      <View style={menuStyles.topBar}>
        <TouchableOpacity
          accessibilityLabel="メニュー"
          onPress={() => setMenuOpen((v) => !v)}
          style={menuStyles.burger}
        >
          <View style={menuStyles.burgerLine} />
          <View style={menuStyles.burgerLine} />
          <View style={menuStyles.burgerLine} />
        </TouchableOpacity>
      </View>
      
      <Modal visible={menuOpen} transparent animationType="fade">
        <View style={menuStyles.overlay}>
          <View style={menuStyles.drawer}>
            <Text style={menuStyles.drawerTitle}>メニュー</Text>
            <TouchableOpacity
              style={menuStyles.drawerItem}
              onPress={() => {
                setMenuOpen(false);
                router.push('/(app)');
              }}
            >
              <Text style={menuStyles.drawerItemText}>ホーム</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={menuStyles.drawerItem}
              onPress={() => {
                setMenuOpen(false);
                router.push('/(app)/profile');
              }}
            >
              <Text style={menuStyles.drawerItemText}>プロフィール</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={menuStyles.drawerItem}
              onPress={() => {
                setMenuOpen(false);
                router.push('/(app)/create-event');
              }}
            >
              <Text style={menuStyles.drawerItemText}>イベント作成</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={menuStyles.drawerItem}
              onPress={async () => {
                try {
                  setMenuOpen(false);
                  const { auth } = await import('@/lib/firebase');
                  const { signOut } = await import('firebase/auth');
                  await signOut(auth);
                  router.replace('/(auth)/login');
                } catch (e) {}
              }}
            >
              <Text style={menuStyles.drawerItemText}>ログアウト</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={menuStyles.backdrop} onPress={() => setMenuOpen(false)} />
        </View>
      </Modal>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        {loading ? (
          <Text style={styles.muted}>読み込み中...</Text>
        ) : !profile ? (
          <Text style={styles.muted}>プロフィールが見つかりません</Text>
        ) : (
          <View style={styles.card}>
            <Text style={styles.name}>{profile.name}</Text>
            <Text style={styles.muted}>種別: {isOrg ? '組織' : '個人'}</Text>
            <View style={styles.section}>
              <Text style={styles.label}>エリア</Text>
              <Text style={styles.value}>
                {profile.area?.pref} {profile.area?.city}
              </Text>
            </View>

            {isOrg ? (
              <>
                <View style={styles.section}>
                  <Text style={styles.label}>組織種別</Text>
                  <Text style={styles.value}>
                    {ORG_TYPE_LABELS[profile.orgProfile?.organizationType ?? ''] || '—'}
                  </Text>
                </View>
                <View style={styles.section}>
                  <Text style={styles.label}>連絡先</Text>
                  <Text style={styles.value}>{profile.orgProfile?.contactEmail || '—'}</Text>
                </View>
                {profile.orgProfile?.contactPhone ? (
                  <View style={styles.section}>
                    <Text style={styles.label}>電話</Text>
                    <Text style={styles.value}>{profile.orgProfile.contactPhone}</Text>
                  </View>
                ) : null}
                {profile.orgProfile?.services?.length ? (
                  <View style={styles.section}>
                    <Text style={styles.label}>提供サービス</Text>
                    <Text style={styles.value}>{profile.orgProfile.services.join('、')}</Text>
                  </View>
                ) : null}
                {profile.orgProfile?.targetAudience?.length ? (
                  <View style={styles.section}>
                    <Text style={styles.label}>対象者</Text>
                    <Text style={styles.value}>{profile.orgProfile.targetAudience.join('、')}</Text>
                  </View>
                ) : null}
                {profile.bio ? (
                  <View style={styles.section}>
                    <Text style={styles.label}>紹介</Text>
                    <Text style={styles.value}>{profile.bio}</Text>
                  </View>
                ) : null}
              </>
            ) : (
              <>
                <View style={styles.section}>
                  <Text style={styles.label}>性別</Text>
                  <Text style={styles.value}>{
                    ({ male: '男性', female: '女性', other: 'その他', no_answer: '回答しない' } as any)[
                      profile.seniorProfile?.gender ?? 'no_answer'
                    ] || '—'
                  }</Text>
                </View>
                {profile.seniorProfile?.birthDate ? (
                  <View style={styles.section}>
                    <Text style={styles.label}>生年月日</Text>
                    <Text style={styles.value}>{profile.seniorProfile.birthDate}</Text>
                  </View>
                ) : null}
                {profile.seniorProfile?.hobbies?.length ? (
                  <View style={styles.section}>
                    <Text style={styles.label}>趣味</Text>
                    <Text style={styles.value}>{profile.seniorProfile.hobbies.join('、')}</Text>
                  </View>
                ) : null}
                {profile.seniorProfile?.skills?.length ? (
                  <View style={styles.section}>
                    <Text style={styles.label}>スキル</Text>
                    <Text style={styles.value}>{profile.seniorProfile.skills.join('、')}</Text>
                  </View>
                ) : null}
                {profile.bio ? (
                  <View style={styles.section}>
                    <Text style={styles.label}>自己紹介</Text>
                    <Text style={styles.value}>{profile.bio}</Text>
                  </View>
                ) : null}
              </>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#000' },
  scroll: { flex: 1 },
  content: { padding: 16, paddingTop: 24 },
  card: { gap: 12 },
  name: { fontSize: 20, fontWeight: '700', color: '#fff' },
  muted: { color: '#9ca3af' },
  section: { gap: 4 },
  label: { color: '#9ca3af', fontSize: 12 },
  value: { color: '#ffffff', fontSize: 14, lineHeight: 20 },
  // hamburger styles are reused from orgHomeStyles via orgStyles
});
