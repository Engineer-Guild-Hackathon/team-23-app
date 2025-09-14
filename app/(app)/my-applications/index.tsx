import { IconSymbol } from '@/components/ui/IconSymbol';
import { auth, db } from '@/lib/firebase';
import { ApplicationStatus, EventApplication, EventPost } from '@/lib/types';
import { Stack, useRouter } from 'expo-router';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from 'firebase/firestore';
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

interface ApplicationWithEvent extends EventApplication {
  eventTitle?: string;
  eventDate?: any;
  eventLocation?: string;
  organizationName?: string;
}

export default function MyApplicationsScreen() {
  const router = useRouter();
  const [applications, setApplications] = useState<ApplicationWithEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchMyApplications();
  }, []);

  const fetchMyApplications = async () => {
    if (!auth.currentUser) {
      setLoading(false);
      return;
    }

    try {
      const applicationsQuery = query(
        collection(db, 'applications'),
        where('applicantId', '==', auth.currentUser.uid),
      );
      const applicationsSnapshot = await getDocs(applicationsQuery);

      const applicationsData: ApplicationWithEvent[] = [];

      for (const appDoc of applicationsSnapshot.docs) {
        const appData = {
          id: appDoc.id,
          ...appDoc.data(),
        } as ApplicationWithEvent;

        // イベント情報を取得
        try {
          const eventDoc = await getDoc(doc(db, 'events', appData.eventId));

          if (eventDoc.exists()) {
            const eventData = eventDoc.data() as EventPost;
            appData.eventTitle = eventData.title;
            appData.eventDate = eventData.eventDate;
            appData.eventLocation = `${eventData.area.pref} ${eventData.area.city}`;
            appData.organizationName = eventData.organizationName;
          }
        } catch (error) {
          console.error('Error fetching event data:', error);
        }

        applicationsData.push(appData);
      }

      // 新しい申込みから順にソート
      applicationsData.sort((a, b) => {
        const dateA = a.appliedAt?.toDate() || new Date(0);
        const dateB = b.appliedAt?.toDate() || new Date(0);
        return dateB.getTime() - dateA.getTime();
      });

      setApplications(applicationsData);
    } catch (error) {
      console.error('Error fetching applications:', error);
      Alert.alert('エラー', '申し込み履歴の取得に失敗しました。');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchMyApplications();
  };

  const getStatusColor = (status: ApplicationStatus) => {
    switch (status) {
      case 'pending':
        return '#fbbf24';
      case 'approved':
        return '#10b981';
      case 'rejected':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const getStatusText = (status: ApplicationStatus) => {
    switch (status) {
      case 'pending':
        return '承認待ち';
      case 'approved':
        return '承認済み';
      case 'rejected':
        return '不承認';
      default:
        return '不明';
    }
  };

  // 絵文字は使用しないため、ステータスアイコンは省略

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('ja-JP', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatEventDate = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'short',
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <IconSymbol name="arrow.left" size={20} color="#374151" />
          <Text style={styles.backButtonText}>戻る</Text>
        </TouchableOpacity>
        <Text style={styles.title}>申し込み履歴</Text>
        <View style={styles.placeholder} />
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
        ) : applications.length === 0 ? (
          <View style={styles.emptyContainer}>
            
            <Text style={styles.emptyTitle}>申し込み履歴がありません</Text>
            <Text style={styles.emptyDescription}>
              興味のあるイベントに申し込んでみましょう
            </Text>
            <TouchableOpacity
              style={styles.exploreButton}
              onPress={() => router.push('/(app)/events')}
            >
              <Text style={styles.exploreButtonText}>イベントを探す</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.applicationsList}>
            {applications.map((application) => (
              <TouchableOpacity
                key={application.id}
                style={styles.applicationCard}
                onPress={() =>
                  router.push(`/(app)/events/${application.eventId}`)
                }
              >
                <View style={styles.applicationHeader}>
                  <View style={styles.applicationInfo}>
                    <Text style={styles.eventTitle} numberOfLines={2}>
                      {application.eventTitle || 'イベント名不明'}
                    </Text>
                    <Text style={styles.organizationName}>
                      主催: {application.organizationName || '組織名不明'}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor:
                          getStatusColor(application.status) + '20',
                      },
                    ]}
                  >
                    
                    <Text
                      style={[
                        styles.statusText,
                        { color: getStatusColor(application.status) },
                      ]}
                    >
                      {getStatusText(application.status)}
                    </Text>
                  </View>
                </View>

                {application.eventDate && (
                  <View style={styles.eventDetailsRow}>
                    <Text style={styles.eventDetailLabel}>開催日時:</Text>
                    <Text style={styles.eventDetailValue}>
                      {formatEventDate(application.eventDate)}
                    </Text>
                  </View>
                )}

                {application.eventLocation && (
                  <View style={styles.eventDetailsRow}>
                    <Text style={styles.eventDetailLabel}>場所:</Text>
                    <Text style={styles.eventDetailValue}>
                      {application.eventLocation}
                    </Text>
                  </View>
                )}

                <View style={styles.applicationFooter}>
                  <Text style={styles.applicationDate}>
                    申込み日時: {formatDate(application.appliedAt)}
                  </Text>
                  {application.status === 'approved' && (
                    <Text style={styles.approvedNote}>参加が承認されました</Text>
                  )}
                  {application.organizationResponse && (
                    <View style={styles.responseContainer}>
                      <Text style={styles.responseLabel}>
                        組織からのメッセージ:
                      </Text>
                      <Text style={styles.responseText}>
                        {application.organizationResponse}
                      </Text>
                    </View>
                  )}
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
  placeholder: {
    width: 80,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingTop: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  exploreButton: {
    backgroundColor: '#4f46e5',
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  exploreButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  applicationsList: {
    gap: 16,
  },
  applicationCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  applicationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  applicationInfo: {
    flex: 1,
    marginRight: 12,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
    lineHeight: 24,
  },
  organizationName: {
    fontSize: 14,
    color: '#6b7280',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  statusIcon: {
    fontSize: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  eventDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  eventDetailLabel: {
    fontSize: 14,
    color: '#6b7280',
    width: 100,
  },
  eventDetailValue: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
  },
  applicationFooter: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  applicationDate: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 8,
  },
  approvedNote: {
    fontSize: 14,
    color: '#059669',
    fontWeight: '500',
    marginBottom: 8,
  },
  responseContainer: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  responseLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  responseText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
});
