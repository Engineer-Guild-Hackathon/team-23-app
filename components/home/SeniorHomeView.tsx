import { Profile } from '@/lib/types';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { ActionCard } from './ActionCard';
import { ActionGrid } from './ActionGrid';
import { Section } from './Section';

interface SeniorHomeViewProps {
  profile: Profile;
}

export const SeniorHomeView: React.FC<SeniorHomeViewProps> = ({ profile }) => {
  const router = useRouter();
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
            <Text style={styles.profileLabel}>趣味:</Text>
            <Text style={styles.profileValue}>
              {profile.seniorProfile?.hobbies?.join('、') || '未設定'}
            </Text>
          </View>
          <View style={styles.profileRow}>
            <Text style={styles.profileLabel}>スキル:</Text>
            <Text style={styles.profileValue}>
              {profile.seniorProfile?.skills?.join('、') || '未設定'}
            </Text>
          </View>
        </View>
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
            title="組織を探す"
            description="近くの組織をチェック"
            icon="🏢"
            onPress={() => console.log('組織検索')}
            color="#7c3aed"
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
});
