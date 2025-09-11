import { Chips } from '@/components/Chips';
import { auth, db } from '@/lib/firebase';
import { Gender } from '@/lib/types';
import * as ImagePicker from 'expo-image-picker';
import { Stack, useRouter } from 'expo-router';
import { Timestamp, doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { useMemo, useState } from 'react';
import {
  Alert,
  Image,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const HOBBIES = ['料理', 'スポーツ', '手芸', '音楽', '旅行', '読書'];
const SKILLS = ['ピアノ', '英語', 'IT', '農業', '木工', '子ども対応'];

export default function ProfileScreen() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [showGenderModal, setShowGenderModal] = useState(false);

  // 1 必須
  const [gender, setGender] = useState<Gender>('no_answer');
  const [birthYear, setBirthYear] = useState('');
  const [birthMonth, setBirthMonth] = useState('');
  const [birthDay, setBirthDay] = useState('');
  const [nickname, setNickname] = useState('');

  // 2 任意
  const [bio, setBio] = useState('');
  const [hobbies, setHobbies] = useState<string[]>([]);
  const [skills, setSkills] = useState<string[]>([]);
  const [skillFree, setSkillFree] = useState('');

  // 3 居住/画像
  const [pref, setPref] = useState('');
  const [city, setCity] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  const progress = useMemo(
    () => ({ 1: 25, 2: 55, 3: 85, 4: 100 })[step],
    [step],
  );
  const toggle = (arr: string[], v: string) =>
    arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v];

  const genderOptions = [
    { label: '回答しない', value: 'no_answer' },
    { label: '男性', value: 'male' },
    { label: '女性', value: 'female' },
    { label: 'その他', value: 'other' },
  ];

  const getGenderLabel = (value: Gender) => {
    return (
      genderOptions.find((option) => option.value === value)?.label ||
      '選択してください'
    );
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('写真アクセスが許可されていません');
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (!res.canceled) setPhotoUri(res.assets[0].uri);
  };

  const canNext1 =
    nickname.trim().length > 0 && birthYear && birthMonth && birthDay;

  const onSubmit = async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) {
      Alert.alert('ログインが必要です');
      return;
    }
    try {
      console.log('Saving senior profile...');

      // プロフィール情報を保存
      await setDoc(
        doc(db, 'profiles', uid),
        {
          uid,
          role: 'senior',
          name: nickname, // senior の場合は nickname が name になる
          area: { pref, city },
          bio,
          seniorProfile: {
            nickname,
            gender,
            birthDate: `${birthYear}-${birthMonth}-${birthDay}`,
            hobbies,
            skills: [...skills, ...(skillFree ? [skillFree] : [])],
          },
          // 互換性のため既存フィールドも保持（将来的に削除予定）
          nickname,
          gender,
          birthDate: `${birthYear}-${birthMonth}-${birthDay}`,
          birthTimestamp: Timestamp.fromDate(
            new Date(
              Number(birthYear),
              Number(birthMonth) - 1,
              Number(birthDay),
            ),
          ),
          hobbies,
          skills: [...skills, ...(skillFree ? [skillFree] : [])],
          // photoUrl は後日 Storage で
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
          version: 1,
        },
        { merge: true },
      );

      // オンボーディング完了フラグを更新
      await setDoc(
        doc(db, 'users', uid),
        {
          role: 'senior',
          onboardingDone: true,
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      );

      console.log('Senior profile saved successfully');
      Alert.alert('プロフィールを保存しました');

      // ユーザー状態の更新を待つ
      setTimeout(() => {
        router.replace('/(app)');
      }, 500);
    } catch (e: any) {
      Alert.alert('保存に失敗しました', String(e?.message ?? e));
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <Stack.Screen options={{ title: 'プロフィール作成' }} />
      {/* 進捗バー */}
      <View style={{ height: 8, backgroundColor: '#eee' }}>
        <View
          style={{
            width: `${progress}%`,
            height: 8,
            backgroundColor: '#4f46e5',
          }}
        />
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
        <Text style={{ fontSize: 20, fontWeight: '600' }}>
          {step === 1 && '必須項目 (1/3)'}
          {step === 2 && '任意項目 (2/3)'}
          {step === 3 && '居住/画像 (3/3)'}
          {step === 4 && '確認'}
        </Text>

        {step === 1 && (
          <View style={{ gap: 12 }}>
            <Field label="性別">
              <TouchableOpacity
                onPress={() => setShowGenderModal(true)}
                style={{
                  borderWidth: 1,
                  borderColor: '#ddd',
                  borderRadius: 8,
                  padding: 12,
                  backgroundColor: '#fff',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Text
                  style={{
                    fontSize: 16,
                    color: gender === 'no_answer' ? '#9ca3af' : '#000',
                  }}
                >
                  {getGenderLabel(gender)}
                </Text>
                <Text style={{ fontSize: 16, color: '#9ca3af' }}>▼</Text>
              </TouchableOpacity>
            </Field>

            <Field label="生年月日（西暦）">
              <Row>
                <TextBox
                  placeholder="YYYY"
                  value={birthYear}
                  onChangeText={setBirthYear}
                  keyboardType="number-pad"
                />
                <TextBox
                  placeholder="MM"
                  value={birthMonth}
                  onChangeText={setBirthMonth}
                  keyboardType="number-pad"
                />
                <TextBox
                  placeholder="DD"
                  value={birthDay}
                  onChangeText={setBirthDay}
                  keyboardType="number-pad"
                />
              </Row>
            </Field>

            <Field label="ニックネーム">
              <TextBox
                value={nickname}
                onChangeText={setNickname}
                maxLength={24}
              />
            </Field>

            <Primary
              disabled={!canNext1}
              onPress={() => setStep(2)}
              text="次へ"
            />
          </View>
        )}

        {step === 2 && (
          <View style={{ gap: 12 }}>
            <Field label="自己紹介（任意）">
              <TextInput
                multiline
                value={bio}
                onChangeText={setBio}
                placeholder="簡単な自己紹介を書いてください"
                style={{
                  borderWidth: 1,
                  borderColor: '#ddd',
                  borderRadius: 8,
                  padding: 12,
                  fontSize: 16,
                  minHeight: 120,
                  textAlignVertical: 'top',
                }}
              />
            </Field>

            <Field label="趣味（複数選択可）">
              <Chips
                values={HOBBIES}
                selected={hobbies}
                onToggle={(v) => setHobbies(toggle(hobbies, v))}
              />
            </Field>

            <Field label="スキル（複数選択可）">
              <Chips
                values={SKILLS}
                selected={skills}
                onToggle={(v) => setSkills(toggle(skills, v))}
              />
              <TextBox
                placeholder="自由入力（任意）"
                value={skillFree}
                onChangeText={setSkillFree}
              />
            </Field>

            <Primary onPress={() => setStep(3)} text="次へ" />
          </View>
        )}

        {step === 3 && (
          <View style={{ gap: 12 }}>
            <Field label="居住エリア（都道府県 / 市区町村）">
              <Row>
                <TextBox
                  placeholder="例：東京都"
                  value={pref}
                  onChangeText={setPref}
                />
                <TextBox
                  placeholder="例：渋谷区"
                  value={city}
                  onChangeText={setCity}
                />
              </Row>
            </Field>

            <Field label="プロフィール画像（任意）">
              {photoUri ? (
                <Image
                  source={{ uri: photoUri }}
                  style={{
                    width: 120,
                    height: 120,
                    borderRadius: 60,
                    marginBottom: 8,
                  }}
                />
              ) : null}
              <Secondary
                onPress={pickImage}
                text={photoUri ? '画像を変更' : '画像をアップロード'}
              />
            </Field>

            <Primary onPress={() => setStep(4)} text="確認に進む" />
          </View>
        )}

        {step === 4 && (
          <View style={{ gap: 12 }}>
            <Summary label="ニックネーム" value={nickname} />
            <Summary
              label="性別"
              value={
                {
                  male: '男性',
                  female: '女性',
                  other: 'その他',
                  no_answer: '回答しない',
                }[gender]
              }
            />
            <Summary
              label="生年月日"
              value={`${birthYear}-${birthMonth}-${birthDay}`}
            />
            <Summary label="趣味" value={hobbies.join('、') || '—'} />
            <Summary
              label="スキル"
              value={
                [...skills, ...(skillFree ? [skillFree] : [])].join('、') || '—'
              }
            />
            <Summary
              label="居住エリア"
              value={[pref, city].filter(Boolean).join(' / ') || '—'}
            />
            <Primary onPress={onSubmit} text="この内容で保存" />
          </View>
        )}
      </ScrollView>

      {/* 性別選択モーダル */}
      <Modal
        visible={showGenderModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowGenderModal(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'flex-end',
          }}
        >
          <View
            style={{
              backgroundColor: '#fff',
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              padding: 20,
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: '600',
                marginBottom: 20,
                textAlign: 'center',
              }}
            >
              性別を選択
            </Text>
            {genderOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                onPress={() => {
                  setGender(option.value as Gender);
                  setShowGenderModal(false);
                }}
                style={{
                  paddingVertical: 16,
                  paddingHorizontal: 20,
                  borderBottomWidth: 1,
                  borderBottomColor: '#eee',
                  backgroundColor: gender === option.value ? '#f3f4f6' : '#fff',
                }}
              >
                <Text
                  style={{
                    fontSize: 16,
                    color: gender === option.value ? '#4f46e5' : '#000',
                  }}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              onPress={() => setShowGenderModal(false)}
              style={{
                marginTop: 20,
                paddingVertical: 12,
                alignItems: 'center',
              }}
            >
              <Text style={{ fontSize: 16, color: '#6b7280' }}>キャンセル</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const Field = ({ label, children }: any) => (
  <View>
    <Text style={{ fontSize: 14, color: '#374151', marginBottom: 6 }}>
      {label}
    </Text>
    {children}
  </View>
);

const Row = ({ children }: any) => (
  <View style={{ flexDirection: 'row', gap: 8 }}>{children}</View>
);

const TextBox = (p: any) => (
  <TextInput
    {...p}
    placeholderTextColor="#9ca3af"
    style={[
      {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        flex: 1,
      },
      p.style,
    ]}
  />
);

const Primary = ({
  text,
  onPress,
  disabled = false,
}: {
  text: string;
  onPress: () => void;
  disabled?: boolean;
}) => (
  <TouchableOpacity
    onPress={onPress}
    disabled={disabled}
    style={{
      backgroundColor: disabled ? '#c7d2fe' : '#4f46e5',
      paddingVertical: 14,
      borderRadius: 12,
      alignItems: 'center',
    }}
  >
    <Text style={{ color: 'white', fontWeight: '700', fontSize: 16 }}>
      {text}
    </Text>
  </TouchableOpacity>
);

const Secondary = ({
  text,
  onPress,
}: {
  text: string;
  onPress: () => void;
}) => (
  <TouchableOpacity
    onPress={onPress}
    style={{
      borderWidth: 1,
      borderColor: '#cbd5e1',
      paddingVertical: 12,
      borderRadius: 12,
      alignItems: 'center',
    }}
  >
    <Text style={{ color: '#111827', fontWeight: '600' }}>{text}</Text>
  </TouchableOpacity>
);

const Summary = ({ label, value }: { label: string; value: string }) => (
  <View
    style={{
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: '#eee',
    }}
  >
    <Text style={{ color: '#6b7280', fontSize: 12 }}>{label}</Text>
    <Text style={{ fontSize: 16, marginTop: 2 }}>{value}</Text>
  </View>
);
