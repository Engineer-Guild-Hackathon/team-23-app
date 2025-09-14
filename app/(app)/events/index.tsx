import { db } from '@/lib/firebase';
import { EventPost, Gender, ITLevel } from '@/lib/types';
import { Stack, useRouter } from 'expo-router';
import { collection, getDocs, orderBy, query, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import {
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function EventsScreen() {
  const router = useRouter();
  const [events, setEvents] = useState<EventPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchEvents = async () => {
    try {
      const eventsQuery = query(
        collection(db, 'events'),
        where('isActive', '==', true),
        orderBy('createdAt', 'desc'),
      );

      const snapshot = await getDocs(eventsQuery);
      const eventsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as EventPost[];

      setEvents(eventsData);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchEvents();
  };

  const getGenderLabel = (gender: Gender) => {
    switch (gender) {
      case 'any':
        return '性別不問';
      case 'male':
        return '男性';
      case 'female':
        return '女性';
      case 'other':
        return 'その他';
      case 'no_answer':
        return '回答不要';
      default:
        return gender;
    }
  };

  const getITLevelLabel = (level: ITLevel) => {
    switch (level) {
      case '不問':
        return 'ITスキル不問';
      case '初心者':
        return '初心者歓迎';
      case '基礎レベル':
        return '基礎レベル';
      case '中級レベル':
        return '中級レベル';
      case '上級レベル':
        return '上級レベル';
      default:
        return level;
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const EventCard = ({ event }: { event: EventPost }) => (
    <TouchableOpacity
      style={styles.eventCard}
      onPress={() => router.push(`/(app)/events/${event.id}`)}
    >
      <View style={styles.eventHeader}>
        <Text style={styles.eventTitle}>{event.title}</Text>
        <View style={styles.badgeContainer}>
          <View
            style={[
              styles.roleBadge,
              event.createdByRole === 'senior'
                ? styles.seniorBadge
                : styles.orgBadge,
            ]}
          >
            <Text
              style={[
                styles.roleBadgeText,
                event.createdByRole === 'senior'
                  ? styles.seniorBadgeText
                  : styles.orgBadgeText,
              ]}
            >
              {event.createdByRole === 'senior' ? 'シニア主催' : '組織主催'}
            </Text>
          </View>
          <View style={styles.organizationBadge}>
            <Text style={styles.organizationName}>
              {event.organizationName}
            </Text>
          </View>
        </View>
      </View>

      <Text style={styles.eventDescription} numberOfLines={3}>
        {event.description}
      </Text>

      <View style={styles.eventMeta}>
        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>地域:</Text>
          <Text style={styles.metaValue}>
            {event.area.pref} {event.area.city}
          </Text>
        </View>

        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>対象:</Text>
          <Text style={styles.metaValue}>
            {event.targetAgeGroups.join('・')} /{' '}
            {getGenderLabel(event.targetGender)}
          </Text>
        </View>

        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>ITレベル:</Text>
          <Text style={styles.metaValue}>{getITLevelLabel(event.itLevel)}</Text>
        </View>

        {event.requiredSkills.length > 0 && (
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>募集スキル:</Text>
            <Text style={styles.metaValue}>
              {event.requiredSkills.slice(0, 3).join('・')}
              {event.requiredSkills.length > 3 && '...'}
            </Text>
          </View>
        )}

        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>投稿日:</Text>
          <Text style={styles.metaValue}>{formatDate(event.createdAt)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <Text>イベントを読み込み中...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Stack.Screen
          options={{
            title: 'イベント一覧',
            headerLeft: () => (
              <TouchableOpacity
                onPress={() => router.back()}
                style={styles.headerButton}
              >
                <Text style={styles.headerButtonText}>戻る</Text>
              </TouchableOpacity>
            ),
            headerRight: () => (
              <TouchableOpacity
                onPress={() => router.push('/(app)/create-event')}
                style={styles.headerButton}
              >
                <Text style={styles.headerButtonText}>投稿</Text>
              </TouchableOpacity>
            ),
          }}
        />

        {/* 戻るボタン（画面内） */}
        <View style={styles.topBar}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Text style={styles.backButtonText}>← ホームへ戻る</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/(app)/create-event')}
            style={styles.createButton}
          >
            <Text style={styles.createButtonText}>+ 新規投稿</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {events.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>イベントがありません</Text>
              <Text style={styles.emptyDescription}>
                まだイベントが投稿されていません。{'\n'}
                組織の方は新しいイベントを投稿してみましょう。
              </Text>
            </View>
          ) : (
            <>
              <Text style={styles.listHeader}>
                {events.length}件のイベントが見つかりました
              </Text>
              {events.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingTop: 8,
  },
  headerButton: {
    backgroundColor: '#4f46e5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginRight: 8,
  },
  headerButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  listHeader: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 16,
    textAlign: 'center',
  },
  eventCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  eventHeader: {
    marginBottom: 12,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  organizationBadge: {
    backgroundColor: '#f0f9ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  organizationName: {
    fontSize: 12,
    color: '#1e40af',
    fontWeight: '600',
  },
  eventDescription: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 16,
  },
  eventMeta: {
    gap: 6,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaLabel: {
    fontSize: 12,
    color: '#6b7280',
    width: 80,
    fontWeight: '500',
  },
  metaValue: {
    fontSize: 12,
    color: '#111827',
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    marginTop: 8,
  },
  backButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    minHeight: 44,
    justifyContent: 'center',
  },
  backButtonText: {
    color: '#4f46e5',
    fontSize: 16,
    fontWeight: '500',
  },
  createButton: {
    backgroundColor: '#4f46e5',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    minHeight: 44,
    justifyContent: 'center',
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  badgeContainer: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 4,
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    alignSelf: 'flex-end',
  },
  seniorBadge: {
    backgroundColor: '#fef3c7',
  },
  orgBadge: {
    backgroundColor: '#dbeafe',
  },
  roleBadgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  seniorBadgeText: {
    color: '#92400e',
  },
  orgBadgeText: {
    color: '#1e40af',
  },
});
