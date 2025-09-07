import { View, Text, Pressable, TextInput, Alert } from 'react-native';
import { useState } from 'react';
import { useAuth } from '../_layout';
import { db } from '../../firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { Redirect } from 'expo-router';

export default function Onboarding() {
  const { user } = useAuth();
  const [role, setRole] = useState<'senior' | 'org'>('senior');
  const [bio, setBio] = useState('');
  const [skills, setSkills] = useState(''); // カンマ区切り
  const [saving, setSaving] = useState(false);

  if (!user) return <Redirect href="/(auth)/login" />;

  const onSave = async () => {
    try {
      setSaving(true);
      await setDoc(
        doc(db, 'users', user.uid),
        {
          role,
          profile: {
            bio,
            skills: skills
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean),
          },
          onboardingDone: true,
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      );
    } catch (e: any) {
      Alert.alert('保存失敗', e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={{ padding: 24, gap: 16 }}>
      <Text style={{ fontSize: 22, fontWeight: '700' }}>初回設定</Text>

      <Text style={{ fontWeight: '600' }}>役割を選択</Text>
      <View style={{ flexDirection: 'row', gap: 12 }}>
        <Pressable
          onPress={() => setRole('senior')}
          style={{
            padding: 12,
            borderWidth: 1,
            borderRadius: 8,
            backgroundColor: role === 'senior' ? '#eee' : 'transparent',
          }}
        >
          <Text>シニア</Text>
        </Pressable>
        <Pressable
          onPress={() => setRole('org')}
          style={{
            padding: 12,
            borderWidth: 1,
            borderRadius: 8,
            backgroundColor: role === 'org' ? '#eee' : 'transparent',
          }}
        >
          <Text>自治体/教育機関</Text>
        </Pressable>
      </View>

      <Text style={{ fontWeight: '600' }}>自己紹介</Text>
      <TextInput
        placeholder="これまでの経験、得意なことなど"
        value={bio}
        onChangeText={setBio}
        multiline
        style={{ borderWidth: 1, borderRadius: 8, padding: 12, minHeight: 80 }}
      />

      <Text style={{ fontWeight: '600' }}>スキル（カンマ区切り）</Text>
      <TextInput
        placeholder="例: 木工, 読み聞かせ, 料理"
        value={skills}
        onChangeText={setSkills}
        style={{ borderWidth: 1, borderRadius: 8, padding: 12 }}
      />

      <Pressable
        onPress={onSave}
        style={{
          backgroundColor: '#111',
          padding: 14,
          borderRadius: 10,
          alignItems: 'center',
        }}
      >
        <Text style={{ color: '#fff', fontWeight: '600' }}>
          {saving ? '保存中…' : '完了する'}
        </Text>
      </Pressable>
    </View>
  );
}
