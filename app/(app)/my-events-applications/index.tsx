import { IconSymbol } from '@/components/ui/IconSymbol';
import { auth, db } from '@/lib/firebase';
import { ApplicationStatus, EventApplication } from '@/lib/types';
import { useRouter } from 'expo-router';
import {
  collection,
  doc,
  getDoc,
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
  applicantRole?: string;
  applicantOrganizationType?: string;
}

export default function MyEventsApplicationsScreen() {
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
      // 自分が作成したイベントへの申し込みを取得
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
          const eventDoc = await getDoc(doc(db, 'events', appData.eventId));

          if (eventDoc.exists()) {
            const eventData = eventDoc.data();
            appData.eventTitle = eventData.title;
          }
        } catch (error) {
          console.error('Error fetching event data:', error);
        }

        // 申し込み者の詳細情報を取得
        try {
          const applicantDoc = await getDoc(
            doc(db, 'profiles', appData.applicantId),
          );
          if (applicantDoc.exists()) {
            const applicantData = applicantDoc.data();
            appData.applicantRole = applicantData.role;
            appData.applicantOrganizationType =
              applicantData.orgProfile?.organizationType;
          }
        } catch (error) {
          console.error('Error fetching applicant data:', error);
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
        return status;
    }
  };

  const getOrganizationTypeLabel = (type: string) => {
    switch (type) {
      case 'education':
        return '教育機関';
      case 'government':
        return '行政・自治体';
      case 'npo':
        return 'NPO・NGO';
      case 'company':
        return '企業';
      default:
        return type;
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
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
        <Text style={styles.title}>私のイベントへの申し込み</Text>
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
            <Text style={styles.emptyTitle}>申込みがありません</Text>
            <Text style={styles.emptyDescription}>
              あなたが作成したイベントへの申込みがあると、ここに表示されます
            </Text>
          </View>
        ) : (
          <View style={styles.applicationsList}>
            {applications.map((application) => (
              <View key={application.id} style={styles.applicationCard}>
                <View style={styles.applicationHeader}>
                  <View style={styles.applicationInfo}>
                    <View style={styles.applicantHeader}>
                      <Text style={styles.applicantName}>
                        {application.applicantName}
                      </Text>
                      {application.applicantRole === 'org' && (
                        <View style={styles.orgBadge}>
                          <Text style={styles.orgBadgeText}>組織</Text>
                        </View>
                      )}
                      {application.applicantRole === 'senior' && (
                        <View style={styles.seniorBadge}>
                          <Text style={styles.seniorBadgeText}>シニア</Text>
                        </View>
                      )}
                    </View>
                    {application.applicantRole === 'org' &&
                      application.applicantOrganizationType && (
                        <Text style={styles.organizationType}>
                          {getOrganizationTypeLabel(
                            application.applicantOrganizationType,
                          )}
                        </Text>
                      )}
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
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
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
    fontSize: 16,
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
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  applicationDate: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 8,
  },
  messageContainer: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  messageLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  messageText: {
    fontSize: 14,
    color: '#4b5563',
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
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  approveButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  rejectButton: {
    flex: 1,
    backgroundColor: '#ef4444',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  rejectButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  applicantHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  orgBadge: {
    backgroundColor: '#dbeafe',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  orgBadgeText: {
    color: '#1e40af',
    fontSize: 10,
    fontWeight: '600',
  },
  seniorBadge: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  seniorBadgeText: {
    color: '#92400e',
    fontSize: 10,
    fontWeight: '600',
  },
  organizationType: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
});
