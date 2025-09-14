import { auth, db } from '@/lib/firebase';
import {
  ApplicationStatus,
  EventApplication,
  EventPost,
  Gender,
  ITLevel,
} from '@/lib/types';
import { Stack, useLocalSearchParams } from 'expo-router';
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  Timestamp,
  where,
} from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Alert, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { styles } from './styles/eventDetailStyles';

export default function EventDetailScreen() {
  const params = useLocalSearchParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const [event, setEvent] = useState<EventPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [applicationStatus, setApplicationStatus] =
    useState<ApplicationStatus | null>(null);
  const [isApplying, setIsApplying] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      if (!id || typeof id !== 'string') return;

      try {
        const eventDoc = await getDoc(doc(db, 'events', id));
        if (eventDoc.exists()) {
          const eventData = {
            id: eventDoc.id,
            ...eventDoc.data(),
          } as EventPost;
          setEvent(eventData);

          // 申込み状況をチェック
          if (
            auth.currentUser &&
            auth.currentUser.uid !== eventData.organizerId
          ) {
            await checkApplicationStatus(id, auth.currentUser.uid);
          }
        } else {
          Alert.alert('エラー', 'イベントが見つかりません。');
        }
      } catch (error) {
        console.error('Error fetching event:', error);
        Alert.alert('エラー', 'イベントの読み込みに失敗しました。');
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  const checkApplicationStatus = async (eventId: string, userId: string) => {
    try {
      const applicationsQuery = query(
        collection(db, 'applications'),
        where('eventId', '==', eventId),
        where('applicantId', '==', userId),
      );
      const applicationsSnapshot = await getDocs(applicationsQuery);

      if (!applicationsSnapshot.empty) {
        const applicationData =
          applicationsSnapshot.docs[0].data() as EventApplication;
        setApplicationStatus(applicationData.status);
      }
    } catch (error) {
      console.error('Error checking application status:', error);
    }
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

  const handleApply = async () => {
    if (!auth.currentUser || !event) {
      Alert.alert('エラー', 'ログインが必要です。');
      return;
    }

    if (applicationStatus) {
      Alert.alert('申込み済み', 'すでにこのイベントに申し込んでいます。');
      return;
    }

    Alert.alert('イベント申込み', `「${event.title}」に申し込みますか？`, [
      { text: 'キャンセル', style: 'cancel' },
      {
        text: '申し込む',
        onPress: async () => {
          setIsApplying(true);
          try {
            // ユーザー情報を取得
            if (!auth.currentUser) {
              throw new Error('ログインが必要です');
            }

            const userDoc = await getDoc(
              doc(db, 'profiles', auth.currentUser.uid),
            );
            const userData = userDoc.data();

            // 組織の場合は組織名、シニアの場合はニックネームまたは名前を使用
            let applicantName = 'Unknown';
            if (userData) {
              if (userData.role === 'org') {
                applicantName =
                  userData.orgProfile?.organizationName ||
                  userData.name ||
                  'Unknown';
              } else {
                applicantName =
                  userData.seniorProfile?.nickname ||
                  userData.name ||
                  'Unknown';
              }
            }

            const applicationData: Omit<EventApplication, 'id'> = {
              eventId: event.id,
              applicantId: auth.currentUser!.uid,
              applicantName: applicantName,
              organizerId: event.organizerId,
              status: 'pending',
              appliedAt: Timestamp.now(),
              updatedAt: Timestamp.now(),
            };

            await addDoc(collection(db, 'applications'), applicationData);
            setApplicationStatus('pending');

            const eventCreatorRole = event.createdByRole || 'org';
            const successMessage =
              eventCreatorRole === 'senior'
                ? '申込みが完了しました。活動主催者からの連絡をお待ちください。'
                : '申込みが完了しました。組織からの連絡をお待ちください。';

            Alert.alert('申込み完了', successMessage, [{ text: 'OK' }]);
          } catch (error) {
            console.error('Error applying to event:', error);
            Alert.alert(
              'エラー',
              '申込みに失敗しました。もう一度お試しください。',
            );
          } finally {
            setIsApplying(false);
          }
        },
      },
    ]);
  };

  const isOwnEvent = auth.currentUser?.uid === event?.organizerId;

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centered}>
          <Text>イベント詳細を読み込み中...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!event) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centered}>
          <Text>イベントが見つかりません</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen options={{ title: 'イベント詳細' }} />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.titleSection}>
          <Text style={styles.title}>{event.title}</Text>
          <Text style={styles.sub}>{event.organizationName}</Text>
          <Text style={styles.meta}>投稿日: {formatDate(event.createdAt)}</Text>
        </View>

        <Text style={styles.text}>{event.description}</Text>

        <Text style={styles.meta}>
          {event.eventDate ? `開催: ${formatDate(event.eventDate)}  ` : ''}
          地域: {event.area.pref} {event.area.city}
        </Text>

        <Text style={styles.meta}>
          対象: {event.targetAgeGroups.join('・')} / {getGenderLabel(event.targetGender)} / {getITLevelLabel(event.itLevel)}
        </Text>

        {event.requiredSkills.length > 0 && (
          <Text style={styles.meta}>スキル: {event.requiredSkills.join('、')}</Text>
        )}

        {/* 申込みボタン */}
        {!isOwnEvent && (
          <View style={styles.applyBox}>
            {applicationStatus === 'pending' && (
              <Text style={styles.info}>申込み済み（承認待ち）</Text>
            )}
            {applicationStatus === 'approved' && (
              <Text style={styles.success}>申込み承認済み</Text>
            )}
            {applicationStatus === 'rejected' && (
              <Text style={styles.error}>申込み不承認</Text>
            )}
            {!applicationStatus && (
              <View style={{ marginTop: 8 }}>
                <TouchableOpacity
                  onPress={handleApply}
                  disabled={isApplying}
                  style={[styles.applyButton, isApplying && styles.applyButtonDisabled]}
                >
                  <Text style={styles.applyButtonText}>
                    {isApplying ? '申込み中...' : 'このイベントに申し込む'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
        </View>
      )}

        {/* 自分のイベント用の未実装ボタンは削除済み */}
      </ScrollView>
    </SafeAreaView>
  );
}

// styles imported from ./styles/eventDetailStyles
