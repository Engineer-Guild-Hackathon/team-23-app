import { IconSymbol } from '@/components/ui/IconSymbol';
import { auth, db } from '@/lib/firebase';
import { EventPost, Gender, ITLevel } from '@/lib/types';
import { useRouter } from 'expo-router';
import { collection, getDocs, orderBy, query, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import {
  Alert,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function MyEventsScreen() {
  const router = useRouter();
  const [events, setEvents] = useState<EventPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchMyEvents();
  }, []);

  const fetchMyEvents = async () => {
    if (!auth.currentUser) {
      setLoading(false);
      return;
    }

    try {
      const eventsQuery = query(
        collection(db, 'events'),
        where('organizerId', '==', auth.currentUser.uid),
        where('isActive', '==', true),
        orderBy('createdAt', 'desc'),
      );
      const eventsSnapshot = await getDocs(eventsQuery);

      const eventsData: EventPost[] = eventsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as EventPost[];

      setEvents(eventsData);
    } catch (error) {
      console.error('Error fetching my events:', error);
      Alert.alert('エラー', 'イベント情報の取得に失敗しました。');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchMyEvents();
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
      month: 'long',
      day: 'numeric',
      weekday: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCreatedDate = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <IconSymbol name="chevron.left" size={20} color="#374151" />
          <Text style={styles.backButtonText}>戻る</Text>
        </TouchableOpacity>
        <Text style={styles.title}>私のイベント</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            onPress={() => router.push('/(app)/my-events-applications')}
            style={styles.applicationsButton}
          >
            <Text style={styles.applicationsButtonText}>申し込み管理</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push('/(app)/create-event')}
            style={styles.createButton}
          >
            <Text style={styles.createButtonText}>作成</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>読み込み中...</Text>
          </View>
        ) : events.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📅</Text>
            <Text style={styles.emptyTitle}>主催中のイベントがありません</Text>
            <Text style={styles.emptyDescription}>
              新しいイベントを作成して、興味のある組織やシニアとつながりましょう
            </Text>
            <TouchableOpacity
              style={styles.createEventButton}
              onPress={() => router.push('/(app)/create-event')}
            >
              <Text style={styles.createEventButtonText}>
                イベントを作成する
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.eventsList}>
            {events.map((event) => (
              <TouchableOpacity
                key={event.id}
                style={styles.eventCard}
                onPress={() => router.push(`/(app)/events/${event.id}`)}
              >
                <View style={styles.eventHeader}>
                  <Text style={styles.eventTitle}>{event.title}</Text>
                  <View style={styles.statusBadge}>
                    <Text style={styles.statusText}>募集中</Text>
                  </View>
                </View>

                <Text style={styles.eventDescription} numberOfLines={3}>
                  {event.description}
                </Text>

                <View style={styles.eventMeta}>
                  <View style={styles.metaRow}>
                    <Text style={styles.metaLabel}>📍 開催地:</Text>
                    <Text style={styles.metaValue}>
                      {event.area.pref} {event.area.city}
                    </Text>
                  </View>

                  {event.eventDate && (
                    <View style={styles.metaRow}>
                      <Text style={styles.metaLabel}>📅 開催日:</Text>
                      <Text style={styles.metaValue}>
                        {formatDate(event.eventDate)}
                      </Text>
                    </View>
                  )}

                  <View style={styles.metaRow}>
                    <Text style={styles.metaLabel}>👥 対象:</Text>
                    <Text style={styles.metaValue}>
                      {event.targetAgeGroups.join('・')} /{' '}
                      {getGenderLabel(event.targetGender)}
                    </Text>
                  </View>

                  <View style={styles.metaRow}>
                    <Text style={styles.metaLabel}>💻 ITレベル:</Text>
                    <Text style={styles.metaValue}>
                      {getITLevelLabel(event.itLevel)}
                    </Text>
                  </View>

                  {event.requiredSkills.length > 0 && (
                    <View style={styles.metaRow}>
                      <Text style={styles.metaLabel}>🛠 募集スキル:</Text>
                      <Text style={styles.metaValue}>
                        {event.requiredSkills.slice(0, 3).join('・')}
                        {event.requiredSkills.length > 3 && '...'}
                      </Text>
                    </View>
                  )}

                  <View style={styles.metaRow}>
                    <Text style={styles.metaLabel}>📝 投稿日:</Text>
                    <Text style={styles.metaValue}>
                      {formatCreatedDate(event.createdAt)}
                    </Text>
                  </View>
                </View>

                <View style={styles.eventActions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => router.push('/(app)/my-events-applications')}
                  >
                    <Text style={styles.actionButtonText}>申し込み管理</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.viewButton]}
                    onPress={() => router.push(`/(app)/events/${event.id}`)}
                  >
                    <Text style={styles.viewButtonText}>詳細を見る</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minHeight: 44,
    paddingVertical: 12,
  },
  backButtonText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  applicationsButton: {
    backgroundColor: '#f59e0b',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    minHeight: 44,
    justifyContent: 'center',
  },
  applicationsButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  createButton: {
    backgroundColor: '#4f46e5',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    minHeight: 44,
    justifyContent: 'center',
  },
  createButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  createEventButton: {
    backgroundColor: '#4f46e5',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  createEventButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  eventsList: {
    gap: 16,
  },
  eventCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  eventTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginRight: 12,
    lineHeight: 22,
  },
  statusBadge: {
    backgroundColor: '#10b981',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  eventDescription: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
    marginBottom: 16,
  },
  eventMeta: {
    marginBottom: 16,
  },
  metaRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  metaLabel: {
    width: 80,
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  metaValue: {
    flex: 1,
    fontSize: 12,
    color: '#374151',
  },
  eventActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#4f46e5',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  viewButton: {
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  viewButtonText: {
    color: '#374151',
    fontSize: 12,
    fontWeight: '600',
  },
});
