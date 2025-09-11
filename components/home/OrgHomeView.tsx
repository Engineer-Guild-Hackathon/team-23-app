import { auth, db } from '@/lib/firebase';
import { EventPost, Profile } from '@/lib/types';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { collection, getDocs, query, where } from 'firebase/firestore';
import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { ActionCard } from './ActionCard';
import { ActionGrid } from './ActionGrid';
import { Section } from './Section';
import { StatCard } from './StatCard';

interface OrgHomeViewProps {
  profile: Profile;
}

export const OrgHomeView: React.FC<OrgHomeViewProps> = ({ profile }) => {
  const router = useRouter();
  const [eventCount, setEventCount] = useState(0);
  const [activeEventCount, setActiveEventCount] = useState(0);
  const [activeEvents, setActiveEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEventCount = async () => {
    if (!auth.currentUser) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const eventsQuery = query(
        collection(db, 'events'),
        where('organizerId', '==', auth.currentUser.uid),
      );
      const eventsSnapshot = await getDocs(eventsQuery);

      // 全イベント数
      setEventCount(eventsSnapshot.size);

      // 進行中のイベント数（今日以降のイベント）
      const now = new Date();
      const activeEventsData: EventPost[] = [];

      eventsSnapshot.docs.forEach((doc) => {
        const eventData = { id: doc.id, ...doc.data() } as EventPost;
        if (eventData.eventDate) {
          const eventDate = eventData.eventDate.toDate();
          if (eventDate >= now) {
            activeEventsData.push(eventData);
          }
        }
      });

      // 開催日時でソート（近い日付から）
      activeEventsData.sort((a, b) => {
        const dateA = a.eventDate?.toDate() || new Date(0);
        const dateB = b.eventDate?.toDate() || new Date(0);
        return dateA.getTime() - dateB.getTime();
      });

      setActiveEventCount(activeEventsData.length);
      setActiveEvents(activeEventsData.slice(0, 3)); // 最大3件まで表示
    } catch (error) {
      console.error('Error fetching event count:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchEventCount();
    }, []),
  );

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
          <StatCard
            title="登録イベント"
            value={loading ? '...' : eventCount.toString()}
            color="#059669"
          />
          <StatCard
            title="進行中イベント"
            value={loading ? '...' : activeEventCount.toString()}
            color="#7c3aed"
          />
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
            onPress={() => router.push('/(app)/create-event')}
            color="#059669"
          />
          <ActionCard
            title="イベント一覧"
            description="投稿されたイベントを確認"
            icon="📋"
            onPress={() => router.push('/(app)/events')}
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
        {loading ? (
          <View style={styles.loadingState}>
            <Text style={styles.loadingText}>読み込み中...</Text>
          </View>
        ) : activeEvents.length > 0 ? (
          <View style={styles.eventsList}>
            {activeEvents.map((event) => (
              <TouchableOpacity
                key={event.id}
                style={styles.eventCard}
                onPress={() => router.push(`/(app)/events/${event.id}`)}
              >
                <View style={styles.eventHeader}>
                  <Text style={styles.eventTitle} numberOfLines={2}>
                    {event.title}
                  </Text>
                  <Text style={styles.eventDate}>
                    {event.eventDate
                      ? new Date(event.eventDate.toDate()).toLocaleDateString(
                          'ja-JP',
                          {
                            month: 'short',
                            day: 'numeric',
                            weekday: 'short',
                          },
                        )
                      : ''}
                  </Text>
                </View>
                <Text style={styles.eventDescription} numberOfLines={2}>
                  {event.description}
                </Text>
                <View style={styles.eventMeta}>
                  <Text style={styles.eventLocation}>
                    📍 {event.area.pref} {event.area.city}
                  </Text>
                  <Text style={styles.eventAgeGroups}>
                    👥 {event.targetAgeGroups.join('・')}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
            {activeEvents.length >= 3 && (
              <TouchableOpacity
                style={styles.viewAllButton}
                onPress={() => router.push('/(app)/events')}
              >
                <Text style={styles.viewAllText}>すべて見る →</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>📅</Text>
            <Text style={styles.emptyStateTitle}>
              進行中のイベントがありません
            </Text>
            <Text style={styles.emptyStateDescription}>
              新しいイベントを作成して、シニアの方々とのつながりを始めましょう
            </Text>
          </View>
        )}
      </Section>

      {/* 最近のマッチング */}
      <Section title="最近のマッチング">
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateIcon}>🤝</Text>
          <Text style={styles.emptyStateTitle}>マッチングがありません</Text>
          <Text style={styles.emptyStateDescription}>
            イベントを開催して、素晴らしいマッチングを作りましょう
          </Text>
        </View>
      </Section>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  contentContainer: {
    padding: 16,
    paddingTop: 45,
    paddingBottom: 32,
  },
  dashboardSection: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  orgName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  orgType: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  orgSummary: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
  },
  orgRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  orgLabel: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
    flex: 1,
  },
  orgValue: {
    fontSize: 14,
    color: '#1f2937',
    flex: 2,
    textAlign: 'right',
  },
  emptyState: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  emptyStateDescription: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  loadingState: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
  },
  eventsList: {
    gap: 12,
  },
  eventCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
    marginRight: 8,
  },
  eventDate: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '500',
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  eventDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 8,
  },
  eventMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  eventLocation: {
    fontSize: 12,
    color: '#6b7280',
  },
  eventAgeGroups: {
    fontSize: 12,
    color: '#6b7280',
  },
  viewAllButton: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    marginTop: 8,
  },
  viewAllText: {
    fontSize: 14,
    color: '#4f46e5',
    fontWeight: '500',
  },
});
