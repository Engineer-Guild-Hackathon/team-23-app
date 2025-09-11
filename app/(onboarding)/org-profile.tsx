import { Chips } from '@/components/Chips';
import { auth, db } from '@/lib/firebase';
import { OrgType } from '@/lib/types';
import { Stack, useRouter } from 'expo-router';
import { Timestamp, doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { useMemo, useState } from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const ORG_TYPES = ['education', 'government', 'npo', 'company'] as const;
const ORG_TYPE_LABELS = {
  education: '教育機関',
  government: '地方自治体',
  npo: 'NPO・NGO',
  company: '企業',
};

const SERVICES = [
  '講座・研修',
  'イベント企画',
  'ボランティア募集',
  '相談対応',
  '施設提供',
  '技術指導',
];
const TARGET_AUDIENCE = [
  '60代',
  '70代',
  '80代以上',
  '初心者歓迎',
  '経験者優遇',
  '性別不問',
];

export default function OrgProfileScreen() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [showOrgTypeModal, setShowOrgTypeModal] = useState(false);

  // Step 1: 基本情報
  const [organizationName, setOrganizationName] = useState('');
  const [organizationType, setOrganizationType] =
    useState<OrgType>('education');
  const [contactEmail, setContactEmail] = useState('');

  // Step 2: 詳細情報
  const [establishedYear, setEstablishedYear] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [bio, setBio] = useState('');

  // Step 3: エリア・サービス
  const [pref, setPref] = useState('');
  const [city, setCity] = useState('');
  const [services, setServices] = useState<string[]>([]);
  const [targetAudience, setTargetAudience] = useState<string[]>([]);

  const progress = useMemo(
    () => ({ 1: 25, 2: 50, 3: 75, 4: 100 })[step],
    [step],
  );
  const toggle = (arr: string[], v: string) =>
    arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v];

  const getOrgTypeLabel = (value: OrgType) => {
    return ORG_TYPE_LABELS[value];
  };

  const canNext1 =
    organizationName.trim().length > 0 && contactEmail.trim().length > 0;
  const canNext3 = pref.trim().length > 0 && city.trim().length > 0;

  const onSubmit = async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) {
      Alert.alert('ログインが必要です');
      return;
    }

    try {
      console.log('Saving org profile...');

      // プロフィール情報を保存
      await setDoc(
        doc(db, 'profiles', uid),
        {
          uid,
          role: 'org',
          name: organizationName,
          area: { pref, city },
          bio,
          orgProfile: {
            organizationName,
            organizationType,
            establishedYear: establishedYear ? Number(establishedYear) : null,
            websiteUrl: websiteUrl || null,
            contactEmail,
            contactPhone: contactPhone || null,
            services,
            targetAudience,
          },
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
          version: 1,
        },
        { merge: true },
      );

      // オンボーディング完了フラグとroleを更新
      await setDoc(
        doc(db, 'users', uid),
        {
          role: 'org',
          onboardingDone: true,
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      );

      console.log('Org profile saved successfully');
      Alert.alert('組織プロフィールを保存しました');

      // ユーザー状態の更新を待つ
      setTimeout(() => {
        router.replace('/(app)');
      }, 500);
    } catch (e: any) {
      console.error('Error saving org profile:', e);
      Alert.alert('保存に失敗しました', String(e?.message ?? e));
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <Stack.Screen options={{ title: '組織プロフィール作成' }} />

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
          {step === 1 && '基本情報 (1/3)'}
          {step === 2 && '詳細情報 (2/3)'}
          {step === 3 && 'サービス・対象者 (3/3)'}
          {step === 4 && '確認'}
        </Text>

        {step === 1 && (
          <View style={{ gap: 12 }}>
            <Field label="組織名 *">
              <TextBox
                value={organizationName}
                onChangeText={setOrganizationName}
                placeholder="例：○○市教育委員会"
              />
            </Field>

            <Field label="組織種別 *">
              <TouchableOpacity
                onPress={() => setShowOrgTypeModal(true)}
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
                <Text style={{ fontSize: 16 }}>
                  {getOrgTypeLabel(organizationType)}
                </Text>
                <Text style={{ fontSize: 16, color: '#9ca3af' }}>▼</Text>
              </TouchableOpacity>
            </Field>

            <Field label="連絡先メールアドレス *">
              <TextBox
                value={contactEmail}
                onChangeText={setContactEmail}
                placeholder="contact@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
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
            <Field label="設立年（任意）">
              <TextBox
                placeholder="例：2010"
                value={establishedYear}
                onChangeText={setEstablishedYear}
                keyboardType="number-pad"
                maxLength={4}
              />
            </Field>

            <Field label="ウェブサイトURL（任意）">
              <TextBox
                placeholder="https://example.com"
                value={websiteUrl}
                onChangeText={setWebsiteUrl}
                keyboardType="url"
                autoCapitalize="none"
              />
            </Field>

            <Field label="電話番号（任意）">
              <TextBox
                placeholder="03-1234-5678"
                value={contactPhone}
                onChangeText={setContactPhone}
                keyboardType="phone-pad"
              />
            </Field>

            <Field label="組織紹介（任意）">
              <TextInput
                multiline
                value={bio}
                onChangeText={setBio}
                placeholder="組織の概要や活動内容を簡潔に記載してください"
                style={{
                  borderWidth: 1,
                  borderColor: '#ddd',
                  borderRadius: 8,
                  padding: 12,
                  fontSize: 16,
                  minHeight: 100,
                  textAlignVertical: 'top',
                }}
              />
            </Field>

            <View style={{ flexDirection: 'row', gap: 8 }}>
              <Secondary onPress={() => setStep(1)} text="戻る" />
              <Primary
                onPress={() => setStep(3)}
                text="次へ"
                style={{ flex: 1 }}
              />
            </View>
          </View>
        )}

        {step === 3 && (
          <View style={{ gap: 12 }}>
            <Field label="活動エリア *">
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

            <Field label="提供サービス（複数選択可）">
              <Chips
                values={SERVICES}
                selected={services}
                onToggle={(v) => setServices(toggle(services, v))}
              />
            </Field>

            <Field label="対象者（複数選択可）">
              <Chips
                values={TARGET_AUDIENCE}
                selected={targetAudience}
                onToggle={(v) => setTargetAudience(toggle(targetAudience, v))}
              />
            </Field>

            <View style={{ flexDirection: 'row', gap: 8 }}>
              <Secondary onPress={() => setStep(2)} text="戻る" />
              <Primary
                disabled={!canNext3}
                onPress={() => setStep(4)}
                text="確認に進む"
                style={{ flex: 1 }}
              />
            </View>
          </View>
        )}

        {step === 4 && (
          <View style={{ gap: 12 }}>
            <Summary label="組織名" value={organizationName} />
            <Summary
              label="組織種別"
              value={getOrgTypeLabel(organizationType)}
            />
            <Summary label="連絡先メール" value={contactEmail} />
            <Summary label="設立年" value={establishedYear || '—'} />
            <Summary label="ウェブサイト" value={websiteUrl || '—'} />
            <Summary label="電話番号" value={contactPhone || '—'} />
            <Summary label="活動エリア" value={`${pref} ${city}`} />
            <Summary label="提供サービス" value={services.join('、') || '—'} />
            <Summary label="対象者" value={targetAudience.join('、') || '—'} />

            <View style={{ flexDirection: 'row', gap: 8, marginTop: 20 }}>
              <Secondary onPress={() => setStep(3)} text="戻る" />
              <Primary
                onPress={onSubmit}
                text="この内容で保存"
                style={{ flex: 1 }}
              />
            </View>
          </View>
        )}
      </ScrollView>

      {/* 組織種別選択モーダル */}
      <Modal
        visible={showOrgTypeModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowOrgTypeModal(false)}
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
              組織種別を選択
            </Text>
            {ORG_TYPES.map((type) => (
              <TouchableOpacity
                key={type}
                onPress={() => {
                  setOrganizationType(type);
                  setShowOrgTypeModal(false);
                }}
                style={{
                  paddingVertical: 16,
                  paddingHorizontal: 20,
                  borderBottomWidth: 1,
                  borderBottomColor: '#eee',
                  backgroundColor:
                    organizationType === type ? '#f3f4f6' : '#fff',
                }}
              >
                <Text
                  style={{
                    fontSize: 16,
                    color: organizationType === type ? '#4f46e5' : '#000',
                  }}
                >
                  {getOrgTypeLabel(type)}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              onPress={() => setShowOrgTypeModal(false)}
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
  style = {},
}: {
  text: string;
  onPress: () => void;
  disabled?: boolean;
  style?: any;
}) => (
  <TouchableOpacity
    onPress={onPress}
    disabled={disabled}
    style={[
      {
        backgroundColor: disabled ? '#c7d2fe' : '#4f46e5',
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
      },
      style,
    ]}
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
      minWidth: 80,
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
