import { auth, db } from '@/lib/firebase';
import { UserRole } from '@/lib/types';
import { Stack, useRouter } from 'expo-router';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { useState } from 'react';
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';

const ROLE_OPTIONS = [
  {
    role: 'senior' as UserRole,
    icon: '👴',
    title: '個人として利用',
    description: '趣味やスキルを活かして\n地域の活動に参加したい',
    features: [
      '地域イベントへの参加',
      'スキルを活かしたボランティア',
      '同世代との交流',
    ],
  },
  {
    role: 'org' as UserRole,
    icon: '🏢',
    title: '組織として利用',
    description: '教育機関・自治体として\n活動を企画・運営したい',
    features: ['イベント・講座の企画', '地域人材の募集', 'シニア層との連携'],
  },
];

export default function RoleSelectScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const selectRole = async (role: UserRole) => {
    const uid = auth.currentUser?.uid;
    if (!uid) {
      Alert.alert('エラー', 'ログインが必要です');
      return;
    }

    try {
      setLoading(true);
      console.log('Setting user role:', role);

      // usersコレクションにroleを保存
      await setDoc(
        doc(db, 'users', uid),
        {
          role,
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      );

      console.log('Role saved successfully');

      // 適切なプロフィール作成画面へ
      const nextUrl = role === 'senior' ? '/profile' : '/org-profile';
      router.replace(`/(onboarding)${nextUrl}`);
    } catch (error) {
      console.error('Error setting role:', error);
      Alert.alert('エラー', '役割の設定に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <Stack.Screen options={{ title: '利用方法を選択' }} />

      <ScrollView contentContainerStyle={{ padding: 20, gap: 20 }}>
        <View style={{ marginBottom: 20 }}>
          <Text
            style={{
              fontSize: 28,
              fontWeight: '700',
              textAlign: 'center',
              marginBottom: 8,
            }}
          >
            どちらで利用しますか？
          </Text>
          <Text
            style={{
              fontSize: 16,
              color: '#6b7280',
              textAlign: 'center',
              lineHeight: 24,
            }}
          >
            後から変更することも可能です
          </Text>
        </View>

        {ROLE_OPTIONS.map((option) => (
          <TouchableOpacity
            key={option.role}
            onPress={() => selectRole(option.role)}
            disabled={loading}
            style={{
              backgroundColor: '#fff',
              borderWidth: 2,
              borderColor: '#e5e7eb',
              borderRadius: 16,
              padding: 24,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 4,
              opacity: loading ? 0.6 : 1,
            }}
            activeOpacity={0.7}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 12,
              }}
            >
              <Text style={{ fontSize: 32, marginRight: 12 }}>
                {option.icon}
              </Text>
              <View style={{ flex: 1 }}>
                <Text
                  style={{ fontSize: 20, fontWeight: '700', marginBottom: 4 }}
                >
                  {option.title}
                </Text>
                <Text
                  style={{ fontSize: 14, color: '#6b7280', lineHeight: 20 }}
                >
                  {option.description}
                </Text>
              </View>
            </View>

            <View style={{ marginLeft: 44 }}>
              {option.features.map((feature, index) => (
                <View
                  key={index}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginBottom: 4,
                  }}
                >
                  <Text style={{ color: '#10b981', marginRight: 8 }}>•</Text>
                  <Text style={{ fontSize: 14, color: '#374151' }}>
                    {feature}
                  </Text>
                </View>
              ))}
            </View>
          </TouchableOpacity>
        ))}

        <View
          style={{
            backgroundColor: '#f3f4f6',
            borderRadius: 12,
            padding: 16,
            marginTop: 20,
          }}
        >
          <Text
            style={{
              fontSize: 14,
              color: '#6b7280',
              textAlign: 'center',
              lineHeight: 20,
            }}
          >
            💡 設定した役割に応じて、適切なプロフィール作成画面が表示されます
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
