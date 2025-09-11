import { Profile } from '@/lib/types';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { ActionCard } from './ActionCard';
import { ActionGrid } from './ActionGrid';
import { Section } from './Section';
import { StatCard } from './StatCard';

interface OrgHomeViewProps {
  profile: Profile;
}

export const OrgHomeView: React.FC<OrgHomeViewProps> = ({ profile }) => {
  const getOrgTypeLabel = (orgType?: string) => {
    switch (orgType) {
      case 'education':
        return '教育機関';
      case 'government':
        return '地方自治体';
      case 'npo':
        return 'NPO・NGO';
      case 'company':
        return '企業';
      default:
        return '組織';
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      {/* 組織ダッシュボード */}
      <View style={styles.dashboardSection}>
        <Text style={styles.orgName}>
          {profile.orgProfile?.organizationName || profile.name}
        </Text>
        <Text style={styles.orgType}>
          {getOrgTypeLabel(profile.orgProfile?.organizationType)}
        </Text>
        <View style={styles.statsRow}>
          <StatCard title="登録イベント" value="0" color="#059669" />
          <StatCard title="参加者数" value="0" color="#7c3aed" />
          <StatCard title="マッチング" value="0" color="#dc2626" />
        </View>
      </View>

      {/* 組織情報概要 */}
      <Section title="組織情報">
        <View style={styles.orgSummary}>
          <View style={styles.orgRow}>
            <Text style={styles.orgLabel}>活動エリア:</Text>
            <Text style={styles.orgValue}>
              {profile.area
                ? `${profile.area.pref} ${profile.area.city}`
                : '未設定'}
            </Text>
          </View>
          <View style={styles.orgRow}>
            <Text style={styles.orgLabel}>提供サービス:</Text>
            <Text style={styles.orgValue}>
              {profile.orgProfile?.services?.join('、') || '未設定'}
            </Text>
          </View>
          <View style={styles.orgRow}>
            <Text style={styles.orgLabel}>対象者:</Text>
            <Text style={styles.orgValue}>
              {profile.orgProfile?.targetAudience?.join('、') || '未設定'}
            </Text>
          </View>
          <View style={styles.orgRow}>
            <Text style={styles.orgLabel}>連絡先:</Text>
            <Text style={styles.orgValue}>
              {profile.orgProfile?.contactEmail || '未設定'}
            </Text>
          </View>
        </View>
      </Section>

      {/* クイックアクション */}
      <Section title="クイックアクション">
        <ActionGrid>
          <ActionCard
            title="イベント作成"
            description="新しい活動を企画"
            icon="📅"
            onPress={() => console.log('イベント作成')}
            color="#059669"
          />
          <ActionCard
            title="参加者管理"
            description="申込者を確認"
            icon="👥"
            onPress={() => console.log('参加者管理')}
            color="#7c3aed"
          />
        </ActionGrid>
        <View style={{ height: 8 }} />
        <ActionGrid>
          <ActionCard
            title="シニア検索"
            description="適切な人材を探す"
            icon="🔍"
            onPress={() => console.log('シニア検索')}
            color="#dc2626"
          />
          <ActionCard
            title="分析レポート"
            description="活動成果を確認"
            icon="📊"
            onPress={() => console.log('分析レポート')}
            color="#f59e0b"
          />
        </ActionGrid>
      </Section>

      {/* 進行中のイベント */}
      <Section title="進行中のイベント">
        <View style={styles.eventCard}>
          <Text style={styles.eventTitle}>イベントはまだありません</Text>
          <Text style={styles.eventDescription}>
            新しいイベントを作成して、シニアユーザーとの繋がりを始めましょう。
          </Text>
        </View>
      </Section>

      {/* マッチしたシニア */}
      <Section title="マッチしたシニアユーザー">
        <View style={styles.matchCard}>
          <Text style={styles.matchTitle}>マッチング待ち</Text>
          <Text style={styles.matchDescription}>
            イベントを作成すると、興味のあるシニアユーザーとマッチングできます。
          </Text>
        </View>
      </Section>

      {/* 活動分析 */}
      <Section title="活動分析">
        <View style={styles.analyticsCard}>
          <Text style={styles.analyticsTitle}>分析データを準備中</Text>
          <Text style={styles.analyticsDescription}>
            活動が始まると、参加状況や効果測定のデータをここで確認できます。
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
    padding: 16,
  },
  dashboardSection: {
    backgroundColor: '#f0fdf4',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
  },
  orgName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#166534',
    marginBottom: 4,
  },
  orgType: {
    fontSize: 14,
    color: '#166534',
    opacity: 0.8,
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    marginHorizontal: -4,
  },
  orgSummary: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
  },
  orgRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  orgLabel: {
    width: 100,
    fontSize: 14,
    color: '#6b7280',
  },
  orgValue: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
  },
  eventCard: {
    backgroundColor: '#fef3c7',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400e',
    marginBottom: 8,
  },
  eventDescription: {
    fontSize: 14,
    color: '#92400e',
    textAlign: 'center',
  },
  matchCard: {
    backgroundColor: '#f0f9ff',
    borderRadius: 12,
    padding: 16,
  },
  matchTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e40af',
    marginBottom: 8,
  },
  matchDescription: {
    fontSize: 14,
    color: '#1e40af',
  },
  analyticsCard: {
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  analyticsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  analyticsDescription: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
});
