import { IconSymbol } from '@/components/ui/IconSymbol';
import { auth, db } from '@/lib/firebase';
import { ApplicationStatus, EventApplication } from '@/lib/types';
import { Stack, useRouter } from 'expo-router';
import {
  collection,
  doc,
  getDocs,
  query,
  Timestamp,
  updateDoc,
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
}

export default function ApplicationsScreen() {
  const router = useRouter();
  const [applications, setApplications] = useState<ApplicationWithEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    if (!auth.currentUser) {
      setLoading(false);
      return;
    }

    try {
      const applicationsQuery = query(
        collection(db, 'applications'),
        where('organizerId', '==', auth.currentUser.uid),
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
          const eventDoc = await getDocs(
            query(
              collection(db, 'events'),
              where('__name__', '==', appData.eventId),
            ),
          );

          if (!eventDoc.empty) {
            const eventData = eventDoc.docs[0].data();
            appData.eventTitle = eventData.title;
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
      Alert.alert('エラー', '申込み情報の取得に失敗しました。');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchApplications();
  };

  const updateApplicationStatus = async (
    applicationId: string,
    newStatus: ApplicationStatus,
  ) => {
    try {
      await updateDoc(doc(db, 'applications', applicationId), {
        status: newStatus,
        updatedAt: Timestamp.now(),
      });

      // ローカル状態を更新
      setApplications((prev) =>
        prev.map((app) =>
          app.id === applicationId
            ? { ...app, status: newStatus, updatedAt: Timestamp.now() }
            : app,
        ),
      );

      const statusText = newStatus === 'approved' ? '承認' : '拒否';
      Alert.alert('更新完了', `申込みを${statusText}しました。`);
    } catch (error) {
      console.error('Error updating application status:', error);
      Alert.alert('エラー', 'ステータスの更新に失敗しました。');
    }
  };

  const handleApprove = (applicationId: string, applicantName: string) => {
    Alert.alert('申込み承認', `${applicantName}さんの申込みを承認しますか？`, [
      { text: 'キャンセル', style: 'cancel' },
      {
        text: '承認',
        onPress: () => updateApplicationStatus(applicationId, 'approved'),
      },
    ]);
  };

  const handleReject = (applicationId: string, applicantName: string) => {
    Alert.alert('申込み拒否', `${applicantName}さんの申込みを拒否しますか？`, [
      { text: 'キャンセル', style: 'cancel' },
      {
        text: '拒否',
        style: 'destructive',
        onPress: () => updateApplicationStatus(applicationId, 'rejected'),
      },
    ]);
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
        return '拒否';
      default:
        return '不明';
    }
  };

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
        <Text style={styles.title}>申込み管理</Text>
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
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyTitle}>申込みがありません</Text>
            <Text style={styles.emptyDescription}>
              イベントへの申込みがあると、ここに表示されます
            </Text>
          </View>
        ) : (
          <View style={styles.applicationsList}>
            {applications.map((application) => (
              <View key={application.id} style={styles.applicationCard}>
                <View style={styles.applicationHeader}>
                  <View style={styles.applicationInfo}>
                    <Text style={styles.applicantName}>
                      {application.applicantName}
                    </Text>
                    <Text style={styles.eventTitle} numberOfLines={2}>
                      {application.eventTitle || 'イベント名不明'}
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

                <Text style={styles.applicationDate}>
                  申込み日時: {formatDate(application.appliedAt)}
                </Text>

                {application.message && (
                  <View style={styles.messageContainer}>
                    <Text style={styles.messageLabel}>申込みメッセージ:</Text>
                    <Text style={styles.messageText}>
                      {application.message}
                    </Text>
                  </View>
                )}

                {application.status === 'pending' && (
                  <View style={styles.actionButtons}>
                    <TouchableOpacity
                      style={styles.approveButton}
                      onPress={() =>
                        handleApprove(application.id, application.applicantName)
                      }
                    >
                      <Text style={styles.approveButtonText}>承認</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.rejectButton}
                      onPress={() =>
                        handleReject(application.id, application.applicantName)
                      }
                    >
                      <Text style={styles.rejectButtonText}>拒否</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
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
  applicantName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  eventTitle: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  applicationDate: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
  },
  messageContainer: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  messageLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  messageText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  approveButton: {
    flex: 1,
    backgroundColor: '#10b981',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  approveButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  rejectButton: {
    flex: 1,
    backgroundColor: '#ef4444',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  rejectButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
});
