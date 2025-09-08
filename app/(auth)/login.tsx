import { View, Text, TextInput, Pressable, Alert } from 'react-native';
import { Link } from 'expo-router';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase';
import { useState } from 'react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const onLogin = async () => {
    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch (e: any) {
      Alert.alert('ログイン失敗', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center', // 縦方向の中央寄せ
        alignItems: 'center',     // 横方向の中央寄せ
        padding: 24,
      }}
    >
      <View style={{ width: '100%', maxWidth: 400, gap: 12 }}>
        <Text style={{ fontSize: 24, fontWeight: '600', textAlign: 'center' }}>
          ログイン
        </Text>
        <TextInput
          placeholder="メールアドレス"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          style={{ borderWidth: 1, borderRadius: 8, padding: 12 }}
        />
        <TextInput
          placeholder="パスワード"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          style={{ borderWidth: 1, borderRadius: 8, padding: 12 }}
        />
        <Pressable
          onPress={onLogin}
          style={{
            backgroundColor: '#111',
            padding: 14,
            borderRadius: 10,
            alignItems: 'center',
          }}
        >
          <Text style={{ color: '#fff', fontWeight: '600' }}>
            {loading ? '処理中…' : 'ログイン'}
          </Text>
        </Pressable>
        <Link href="/(auth)/register" style={{ textAlign: 'center' }}>
          新規登録はこちら
        </Link>
      </View>
    </View>
  );
}

