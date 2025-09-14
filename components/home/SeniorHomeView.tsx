import { auth, db } from '@/lib/firebase';
import { Profile } from '@/lib/types';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import React, { useCallback, useState } from 'react';
import { ScrollView, Text, View, TouchableOpacity, Modal } from 'react-native';
import { Section } from './Section';
import { StatCard } from './StatCard';
import { styles } from './styles/seniorHomeStyles';

interface SeniorHomeViewProps {
  profile: Profile;
}

const SeniorHomeView: React.FC<SeniorHomeViewProps> = ({ profile }) => {
  const router = useRouter();
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });
  const [myEventsStats, setMyEventsStats] = useState({
    totalEvents: 0,
    totalApplications: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  const fetchApplicationStats = useCallback(async () => {
    if (!auth.currentUser) return;

    try {
      setIsLoading(true);

      // 申し込み統計を取得
      const applicationsRef = collection(db, 'applications');
      const q = query(
        applicationsRef,
        where('applicantId', '==', auth.currentUser.uid),
      );
      const querySnapshot = await getDocs(q);

      let total = 0;
      let pending = 0;
      let approved = 0;
      let rejected = 0;

      querySnapshot.forEach((doc) => {
        const application = doc.data();
        total++;

        switch (application.status) {
          case 'pending':
            pending++;
            break;
          case 'approved':
            approved++;
            break;
          case 'rejected':
            rejected++;
            break;
        }
      });

      setStats({ total, pending, approved, rejected });

      // 主催イベント統計を取得
      const eventsRef = collection(db, 'events');
      const eventsQuery = query(
        eventsRef,
        where('organizerId', '==', auth.currentUser.uid),
        where('isActive', '==', true),
      );
      const eventsSnapshot = await getDocs(eventsQuery);

      // 主催イベントへの申し込み数を取得
      const applicationsToMyEventsQuery = query(
        applicationsRef,
        where('organizerId', '==', auth.currentUser.uid),
      );
      const applicationsToMyEventsSnapshot = await getDocs(
        applicationsToMyEventsQuery,
      );

      setMyEventsStats({
        totalEvents: eventsSnapshot.size,
        totalApplications: applicationsToMyEventsSnapshot.size,
      });
    } catch (error) {
      console.error('申し込み統計の取得に失敗しました:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchApplicationStats();
    }, [fetchApplicationStats]),
  );

  // ログアウト等のクイックアクションは非表示

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.topBar}>
        <TouchableOpacity
          accessibilityLabel="メニュー"
          onPress={() => setMenuOpen((v) => !v)}
          style={styles.burger}
        >
          <View style={styles.burgerLine} />
          <View style={styles.burgerLine} />
          <View style={styles.burgerLine} />
        </TouchableOpacity>
      </View>
      {menuOpen && (
        <View style={styles.dropdown}>
          <Text style={styles.dropdownTitle}>メニュー</Text>
          <TouchableOpacity
            style={styles.dropdownItem}
            onPress={() => {
              setMenuOpen(false);
              router.push('/(app)');
            }}
          >
            <Text style={styles.dropdownItemText}>ホーム</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.dropdownItem}
            onPress={() => {
              setMenuOpen(false);
              router.push('/(app)/profile');
            }}
          >
            <Text style={styles.dropdownItemText}>プロフィール</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.dropdownItem}
            onPress={() => {
              setMenuOpen(false);
              router.push('/(app)/create-event');
            }}
          >
            <Text style={styles.dropdownItemText}>イベント作成</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.dropdownItem}
            onPress={async () => {
              try {
                setMenuOpen(false);
                await signOut(auth);
                router.replace('/(auth)/login');
              } catch (e) {
                // noop
              }
            }}
          >
            <Text style={styles.dropdownItemText}>ログアウト</Text>
          </TouchableOpacity>
        </View>
      )}
      {/* ウェルカムセクション */}
      <View style={styles.welcomeSection}>
        <Text style={styles.greeting}>
          おはようございます、{profile.seniorProfile?.nickname || profile.name}
          さん
        </Text>
        <Text style={styles.subtitle}>
          今日も新しい出会いと学びを見つけましょう
        </Text>
      </View>

      {/* プロフィール概要 */}
      <Section title="あなたのプロフィール">
        <View style={styles.profileSummary}>
          <View style={styles.profileRow}>
            <Text style={styles.profileLabel}>活動エリア:</Text>
            <Text style={styles.profileValue}>
              {profile.area
                ? `${profile.area.pref} ${profile.area.city}`
                : '未設定'}
            </Text>
          </View>
          <View style={styles.profileRow}>
            <Text style={styles.profileLabel}>趣味・関心:</Text>
            <Text style={styles.profileValue}>
              {profile.seniorProfile?.hobbies?.join(', ') || '未設定'}
            </Text>
          </View>
        </View>
      </Section>

      {/* 申し込み統計 */}
      <Section title="申し込み状況">
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>読み込み中...</Text>
          </View>
        ) : (
          <View style={styles.statsContainer}>
            <StatCard
              title="総申し込み数"
              value={stats.total}
              color="#6b7280"
              onPress={() => router.push('/(app)/my-applications')}
            />
            <StatCard
              title="承認待ち"
              value={stats.pending}
              color="#f59e0b"
              onPress={() => router.push('/(app)/my-applications')}
            />
            <StatCard
              title="承認済み"
              value={stats.approved}
              color="#10b981"
              onPress={() => router.push('/(app)/my-applications')}
            />
            <StatCard
              title="不承認"
              value={stats.rejected}
              color="#ef4444"
              onPress={() => router.push('/(app)/my-applications')}
            />
          </View>
        )}
      </Section>

      {/* 主催イベント統計 */}
      <Section title="私のイベント状況">
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>読み込み中...</Text>
          </View>
        ) : (
          <View style={styles.statsContainer}>
            <StatCard
              title="作成イベント数"
              value={myEventsStats.totalEvents}
              color="#8b5cf6"
              onPress={() => router.push('/(app)/my-events')}
            />
            <StatCard
              title="受けた申し込み"
              value={myEventsStats.totalApplications}
              color="#059669"
              onPress={() => router.push('/(app)/my-events-applications')}
            />
          </View>
        )}
      </Section>

      {/* クイックアクションを非表示にしました */}

      {/* 未実装セクションは削除済み */}
    </ScrollView>
  );
};

// styles are imported from ./styles/seniorHomeStyles

export default SeniorHomeView;
