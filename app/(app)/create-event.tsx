import { Chips } from '@/components/Chips';
import { auth, db } from '@/lib/firebase';
import { AgeGroup, Gender, ITLevel, Profile } from '@/lib/types';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Stack, useRouter } from 'expo-router';
import { addDoc, collection, doc, getDoc, Timestamp } from 'firebase/firestore';
import React, { useState } from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const PREFECTURES = [
  '北海道',
  '青森県',
  '岩手県',
  '宮城県',
  '秋田県',
  '山形県',
  '福島県',
  '茨城県',
  '栃木県',
  '群馬県',
  '埼玉県',
  '千葉県',
  '東京都',
  '神奈川県',
  '新潟県',
  '富山県',
  '石川県',
  '福井県',
  '山梨県',
  '長野県',
  '岐阜県',
  '静岡県',
  '愛知県',
  '三重県',
  '滋賀県',
  '京都府',
  '大阪府',
  '兵庫県',
  '奈良県',
  '和歌山県',
  '鳥取県',
  '島根県',
  '岡山県',
  '広島県',
  '山口県',
  '徳島県',
  '香川県',
  '愛媛県',
  '高知県',
  '福岡県',
  '佐賀県',
  '長崎県',
  '熊本県',
  '大分県',
  '宮崎県',
  '鹿児島県',
  '沖縄県',
];

const GENDER_OPTIONS = [
  { label: '性別不問', value: 'any' as Gender },
  { label: '男性', value: 'male' as Gender },
  { label: '女性', value: 'female' as Gender },
];

const AGE_GROUP_OPTIONS: AgeGroup[] = ['50代', '60代', '70代', '80代以上'];

const IT_LEVEL_OPTIONS = [
  { label: 'ITスキル不問', value: '不問' as ITLevel },
  { label: '初心者歓迎', value: '初心者' as ITLevel },
  { label: '基礎レベル', value: '基礎レベル' as ITLevel },
  { label: '中級レベル', value: '中級レベル' as ITLevel },
  { label: '上級レベル', value: '上級レベル' as ITLevel },
];

const SKILL_OPTIONS = [
  'パソコン操作',
  'インターネット',
  'スマートフォン',
  'SNS',
  '料理',
  '園芸',
  '手芸',
  '写真',
  '音楽',
  '読書',
  'スポーツ',
  '語学',
  '書道',
  '絵画',
  'ボランティア',
  '接客',
  '事務',
];

export default function CreateEventScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);

  // フォーム項目
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [pref, setPref] = useState('');
  const [city, setCity] = useState('');
  const [targetGender, setTargetGender] = useState<Gender>('any');
  const [requiredSkills, setRequiredSkills] = useState<string[]>([]);
  const [targetAgeGroups, setTargetAgeGroups] = useState<AgeGroup[]>([]);
  const [itLevel, setItLevel] = useState<ITLevel>('不問');
  const [eventDate, setEventDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  React.useEffect(() => {
    const fetchProfile = async () => {
      const uid = auth.currentUser?.uid;
      if (!uid) return;

      try {
        const profileDoc = await getDoc(doc(db, 'profiles', uid));
        if (profileDoc.exists()) {
          const profileData = profileDoc.data() as Profile;
          setProfile(profileData);
          // 組織の活動エリアをデフォルト値として設定
          if (profileData.area) {
            setPref(profileData.area.pref);
            setCity(profileData.area.city);
          }
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };

    fetchProfile();
  }, []);

  const toggleSkill = (skill: string) => {
    setRequiredSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill],
    );
  };

  const toggleAgeGroup = (ageGroup: AgeGroup) => {
    setTargetAgeGroups((prev) =>
      prev.includes(ageGroup)
        ? prev.filter((ag) => ag !== ageGroup)
        : [...prev, ageGroup],
    );
  };

  const canSubmit =
    title.trim().length > 0 &&
    description.trim().length > 0 &&
    pref.length > 0 &&
    city.trim().length > 0 &&
    targetAgeGroups.length > 0;

  const onSubmit = async () => {
    if (!canSubmit) {
      Alert.alert('入力エラー', '必須項目をすべて入力してください。');
      return;
    }

    const uid = auth.currentUser?.uid;
    if (!uid || !profile) {
      Alert.alert('エラー', 'ログインが必要です。');
      return;
    }

    try {
      setLoading(true);

      const eventData = {
        organizerId: uid,
        organizationName: profile.orgProfile?.organizationName || profile.name,
        title: title.trim(),
        description: description.trim(),
        area: { pref, city: city.trim() },
        targetGender,
        requiredSkills,
        targetAgeGroups,
        itLevel,
        eventDate: Timestamp.fromDate(eventDate),
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        isActive: true,
      };

      await addDoc(collection(db, 'events'), eventData);

      Alert.alert('投稿完了', 'イベント募集を投稿しました！', [
        {
          text: 'OK',
          onPress: () => router.replace('/(app)'),
        },
      ]);
    } catch (error) {
      console.error('Error creating event:', error);
      Alert.alert('エラー', 'イベントの投稿に失敗しました。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Stack.Screen
          options={{
            title: 'イベント募集投稿',
            headerLeft: () => (
              <TouchableOpacity
                onPress={() => router.back()}
                style={styles.headerButton}
              >
                <Text style={styles.headerButtonText}>戻る</Text>
              </TouchableOpacity>
            ),
          }}
        />

        <ScrollView contentContainerStyle={styles.content}>
          {/* 戻るボタン（画面内） */}
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Text style={styles.backButtonText}>← 戻る</Text>
          </TouchableOpacity>
          <Text style={styles.sectionTitle}>基本情報</Text>

          <View style={styles.field}>
            <Text style={styles.label}>タイトル *</Text>
            <TextInput
              style={styles.textInput}
              value={title}
              onChangeText={setTitle}
              placeholder="例：シニア向けスマートフォン教室参加者募集"
              multiline
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>説明 *</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="イベントの詳細、魅力、参加者へのメッセージなどを記載してください"
              multiline
              numberOfLines={4}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>開催日時 *</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.dateButtonText}>
                {eventDate.toLocaleDateString('ja-JP', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  weekday: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={eventDate}
                mode="datetime"
                display="default"
                onChange={(event, selectedDate) => {
                  setShowDatePicker(false);
                  if (selectedDate) {
                    setEventDate(selectedDate);
                  }
                }}
                minimumDate={new Date()}
              />
            )}
          </View>

          <Text style={styles.sectionTitle}>実施地域</Text>

          <View style={styles.field}>
            <Text style={styles.label}>都道府県 *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.chipContainer}>
                {PREFECTURES.map((prefecture) => (
                  <TouchableOpacity
                    key={prefecture}
                    style={[
                      styles.chip,
                      pref === prefecture && styles.chipSelected,
                    ]}
                    onPress={() => setPref(prefecture)}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        pref === prefecture && styles.chipTextSelected,
                      ]}
                    >
                      {prefecture}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>市区町村 *</Text>
            <TextInput
              style={styles.textInput}
              onChangeText={setCity}
              placeholder="例：渋谷区"
            />
          </View>

          <Text style={styles.sectionTitle}>募集対象</Text>

          <View style={styles.field}>
            <Text style={styles.label}>性別</Text>
            <View style={styles.optionContainer}>
              {GENDER_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.optionChip,
                    targetGender === option.value && styles.optionChipSelected,
                  ]}
                  onPress={() => setTargetGender(option.value)}
                >
                  <Text
                    style={[
                      styles.optionChipText,
                      targetGender === option.value &&
                        styles.optionChipTextSelected,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>年代 *</Text>
            <View style={styles.optionContainer}>
              {AGE_GROUP_OPTIONS.map((ageGroup) => (
                <TouchableOpacity
                  key={ageGroup}
                  style={[
                    styles.optionChip,
                    targetAgeGroups.includes(ageGroup) &&
                      styles.optionChipSelected,
                  ]}
                  onPress={() => toggleAgeGroup(ageGroup)}
                >
                  <Text
                    style={[
                      styles.optionChipText,
                      targetAgeGroups.includes(ageGroup) &&
                        styles.optionChipTextSelected,
                    ]}
                  >
                    {ageGroup}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>ITレベル</Text>
            <View style={styles.optionContainer}>
              {IT_LEVEL_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.optionChip,
                    itLevel === option.value && styles.optionChipSelected,
                  ]}
                  onPress={() => setItLevel(option.value)}
                >
                  <Text
                    style={[
                      styles.optionChipText,
                      itLevel === option.value && styles.optionChipTextSelected,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>募集スキル（複数選択可）</Text>
            <Chips
              values={SKILL_OPTIONS}
              selected={requiredSkills}
              onToggle={toggleSkill}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>団体名</Text>
            <Text style={styles.organizationName}>
              {profile?.orgProfile?.organizationName ||
                profile?.name ||
                '読み込み中...'}
            </Text>
          </View>

          <TouchableOpacity
            style={[
              styles.submitButton,
              (!canSubmit || loading) && styles.submitButtonDisabled,
            ]}
            onPress={onSubmit}
            disabled={!canSubmit || loading}
          >
            <Text style={styles.submitButtonText}>
              {loading ? '投稿中...' : 'イベント募集を投稿'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 16,
    paddingTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginTop: 24,
    marginBottom: 16,
  },
  field: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  dateButton: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 16,
    alignItems: 'flex-start',
  },
  dateButtonText: {
    fontSize: 16,
    color: '#374151',
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  chip: {
    backgroundColor: '#f3f4f6',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  chipSelected: {
    backgroundColor: '#4f46e5',
  },
  chipText: {
    fontSize: 14,
    color: '#374151',
  },
  chipTextSelected: {
    color: '#fff',
  },
  optionContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionChip: {
    backgroundColor: '#f3f4f6',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  optionChipSelected: {
    backgroundColor: '#4f46e5',
  },
  optionChipText: {
    fontSize: 14,
    color: '#374151',
  },
  optionChipTextSelected: {
    color: '#fff',
  },
  organizationName: {
    fontSize: 16,
    color: '#4f46e5',
    fontWeight: '600',
    backgroundColor: '#f0f9ff',
    padding: 12,
    borderRadius: 8,
  },
  submitButton: {
    backgroundColor: '#4f46e5',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 40,
  },
  submitButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  headerButton: {
    paddingHorizontal: 8,
  },
  headerButtonText: {
    color: '#4f46e5',
    fontSize: 16,
    fontWeight: '500',
  },
  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    marginTop: 16,
    marginBottom: 24,
    minHeight: 44,
    justifyContent: 'center',
  },
  backButtonText: {
    color: '#4f46e5',
    fontSize: 16,
    fontWeight: '500',
  },
});
