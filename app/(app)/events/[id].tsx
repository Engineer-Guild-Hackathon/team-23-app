import { IconSymbol } from '@/components/ui/IconSymbol';
import { auth, db } from '@/lib/firebase';
import { EventPost, Gender, ITLevel } from '@/lib/types';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { doc, getDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function EventDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const [event, setEvent] = useState<EventPost | null>(null);
  const [loading, setLoading] = useState(true);

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
        } else {
          Alert.alert('エラー', 'イベントが見つかりません。');
          router.back();
        }
      } catch (error) {
        console.error('Error fetching event:', error);
        Alert.alert('エラー', 'イベントの読み込みに失敗しました。');
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id, router]);

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

  const handleApply = () => {
    // TODO: 申込み機能を実装
    Alert.alert(
      '申込み',
      'この機能は今後実装予定です。\n直接組織にお問い合わせください。',
      [{ text: 'OK' }],
    );
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
      <Stack.Screen options={{ headerShown: false }} />

      {/* Top Bar with Back Button */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <IconSymbol name="arrow.left" size={20} color="#374151" />
          <Text style={styles.backButtonText}>戻る</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
      >
        {/* タイトルセクション */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>{event.title}</Text>
          <View style={styles.organizationBadge}>
            <Text style={styles.organizationName}>
              {event.organizationName}
            </Text>
          </View>
          <Text style={styles.postDate}>
            投稿日: {formatDate(event.createdAt)}
          </Text>
        </View>

        {/* 説明セクション */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📝 イベント説明</Text>
          <Text style={styles.description}>{event.description}</Text>
        </View>

        {/* 実施地域 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📍 実施地域</Text>
          <Text style={styles.sectionContent}>
            {event.area.pref} {event.area.city}
          </Text>
        </View>

        {/* 開催日時 */}
        {event.eventDate && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📅 開催日時</Text>
            <Text style={styles.sectionContent}>
              {formatDate(event.eventDate)}
            </Text>
          </View>
        )}

        {/* 募集対象 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>👥 募集対象</Text>
          <View style={styles.targetInfo}>
            <View style={styles.targetRow}>
              <Text style={styles.targetLabel}>年代:</Text>
              <Text style={styles.targetValue}>
                {event.targetAgeGroups.join('・')}
              </Text>
            </View>
            <View style={styles.targetRow}>
              <Text style={styles.targetLabel}>性別:</Text>
              <Text style={styles.targetValue}>
                {getGenderLabel(event.targetGender)}
              </Text>
            </View>
            <View style={styles.targetRow}>
              <Text style={styles.targetLabel}>ITレベル:</Text>
              <Text style={styles.targetValue}>
                {getITLevelLabel(event.itLevel)}
              </Text>
            </View>
          </View>
        </View>

        {/* 募集スキル */}
        {event.requiredSkills.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🛠 募集スキル</Text>
            <View style={styles.skillsContainer}>
              {event.requiredSkills.map((skill, index) => (
                <View key={index} style={styles.skillChip}>
                  <Text style={styles.skillText}>{skill}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* 申込みボタン */}
        {!isOwnEvent && (
          <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
            <Text style={styles.applyButtonText}>このイベントに申し込む</Text>
          </TouchableOpacity>
        )}

        {/* 自分のイベントの場合の管理ボタン */}
        {isOwnEvent && (
          <View style={styles.ownerActions}>
            <Text style={styles.ownerNote}>あなたが投稿したイベントです</Text>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => {
                Alert.alert('編集', 'イベント編集機能は今後実装予定です。', [
                  { text: 'OK' },
                ]);
              }}
            >
              <Text style={styles.editButtonText}>イベントを編集</Text>
            </TouchableOpacity>
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
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
    paddingTop: 24,
  },
  titleSection: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
    lineHeight: 32,
  },
  organizationBadge: {
    backgroundColor: '#f0f9ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  organizationName: {
    fontSize: 14,
    color: '#1e40af',
    fontWeight: '600',
  },
  postDate: {
    fontSize: 14,
    color: '#6b7280',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  sectionContent: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
  },
  description: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
  },
  targetInfo: {
    gap: 8,
  },
  targetRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  targetLabel: {
    fontSize: 16,
    color: '#6b7280',
    width: 80,
    fontWeight: '500',
  },
  targetValue: {
    fontSize: 16,
    color: '#111827',
    flex: 1,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillChip: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  skillText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  applyButton: {
    backgroundColor: '#4f46e5',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 40,
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  ownerActions: {
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 40,
  },
  ownerNote: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
    textAlign: 'center',
  },
  editButton: {
    backgroundColor: '#059669',
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
});
