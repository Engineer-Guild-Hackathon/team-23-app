import { auth, db } from '@/lib/firebase';
import { Profile } from '@/lib/types';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { signOut } from 'firebase/auth';
import { collection, getDocs, query, where } from 'firebase/firestore';
import React, { useCallback, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ActionCard } from './ActionCard';
import { ActionGrid } from './ActionGrid';
import { Section } from './Section';
import { StatCard } from './StatCard';

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

  const handleLogout = () => {
    Alert.alert('ログアウト', 'ログアウトしますか？', [
      { text: 'キャンセル', style: 'cancel' },
      {
        text: 'ログアウト',
        style: 'destructive',
        onPress: async () => {
          try {
            await signOut(auth);
            router.replace('/(auth)/login');
          } catch (error) {
            console.error('Logout error:', error);
            Alert.alert('エラー', 'ログアウトに失敗しました。');
          }
        },
      },
    ]);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
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

      {/* クイックアクション */}
      <Section title="クイックアクション">
        <ActionGrid>
          <ActionCard
            title="活動を探す"
            description="あなたに合った活動を見つけましょう"
            icon="🔍"
            onPress={() => router.push('/(app)/events')}
            color="#059669"
          />
          <ActionCard
            title="活動を作成"
            description="新しい活動を企画・募集"
            icon="✨"
            onPress={() => router.push('/(app)/create-event')}
            color="#3b82f6"
          />
        </ActionGrid>
        <View style={{ height: 8 }} />
        <ActionGrid>
          <ActionCard
            title="私のイベント"
            description="作成したイベントと申し込み管理"
            icon="🏆"
            onPress={() => router.push('/(app)/my-events')}
            color="#8b5cf6"
          />
          <ActionCard
            title="申し込み履歴"
            description="過去の申し込み状況を確認"
            icon="📋"
            onPress={() => router.push('/(app)/my-applications')}
            color="#f59e0b"
          />
        </ActionGrid>
        <View style={{ height: 8 }} />
        <ActionGrid>
          <ActionCard
            title="ログアウト"
            description="アプリからログアウトします"
            icon="🚪"
            onPress={handleLogout}
            color="#ef4444"
          />
        </ActionGrid>
      </Section>

      {/* おすすめセクション */}
      <Section title="あなたにおすすめ">
        <View style={styles.recommendationCard}>
          <Text style={styles.recommendationTitle}>
            {profile.area?.city}周辺で新しい活動が始まりました！
          </Text>
          <Text style={styles.recommendationDescription}>
            あなたの趣味「{profile.seniorProfile?.hobbies?.[0] || '学習'}
            」に関連する活動があります。
          </Text>
          <Text style={styles.recommendationAction}>詳細を見る →</Text>
        </View>
      </Section>

      {/* マッチング状況 */}
      <Section title="マッチング状況">
        <View style={styles.matchingCard}>
          <Text style={styles.matchingTitle}>新しいマッチング</Text>
          <Text style={styles.matchingDescription}>
            まだマッチングはありません。プロフィールを充実させて、より多くの組織と繋がりましょう。
          </Text>
        </View>
      </Section>

      {/* 最近の活動 */}
      <Section title="最近の活動">
        <View style={styles.activityCard}>
          <Text style={styles.activityTitle}>活動履歴はまだありません</Text>
          <Text style={styles.activityDescription}>
            興味のある活動に参加して、充実したシニアライフを始めましょう。
          </Text>
        </View>
      </Section>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  contentContainer: {
    padding: 20,
    paddingTop: 50,
  },
  welcomeSection: {
    backgroundColor: '#f0f9ff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
  },
  greeting: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e40af',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#1e40af',
    opacity: 0.8,
  },
  profileSummary: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
  },
  profileRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  profileLabel: {
    width: 80,
    fontSize: 14,
    color: '#6b7280',
  },
  profileValue: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
  },
  recommendationCard: {
    backgroundColor: '#fef3c7',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  recommendationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400e',
    marginBottom: 8,
  },
  recommendationDescription: {
    fontSize: 14,
    color: '#92400e',
    marginBottom: 12,
  },
  recommendationAction: {
    fontSize: 14,
    fontWeight: '600',
    color: '#d97706',
  },
  matchingCard: {
    backgroundColor: '#f0f9ff',
    borderRadius: 12,
    padding: 16,
  },
  matchingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e40af',
    marginBottom: 8,
  },
  matchingDescription: {
    fontSize: 14,
    color: '#1e40af',
  },
  activityCard: {
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  activityDescription: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    marginHorizontal: -4,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: '#6b7280',
  },
});

export default SeniorHomeView;
