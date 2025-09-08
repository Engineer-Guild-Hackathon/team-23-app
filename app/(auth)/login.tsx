import { auth } from '@/lib/firebase';
import { Link } from 'expo-router';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useState } from 'react';
import { Alert, Pressable, Text, TextInput, View } from 'react-native';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const onLogin = async () => {
    try {
      setLoading(true);
      console.log('Attempting login...');

      // ネットワーク接続テスト
      console.log('Testing network connectivity...');
      try {
        const response = await fetch('https://www.google.com', {
          method: 'HEAD',
        });
        console.log(
          'Network test result:',
          response.ok ? 'Connected' : 'Failed',
        );
      } catch (netError) {
        console.log('Network test failed:', netError);
      }

      // Firebase接続テスト（機密情報は出力しない）
      console.log('Testing Firebase connection...');
      console.log('Auth instance available:', !!auth);
      console.log('Auth app available:', !!auth?.app);

      await signInWithEmailAndPassword(auth, email.trim(), password);
      console.log('Login successful');
    } catch (e: any) {
      console.error('Login error code:', e.code);
      console.error('Login error message:', e.message);
      Alert.alert(
        'ログイン失敗',
        `エラーコード: ${e.code}\nメッセージ: ${e.message}`,
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ padding: 24, gap: 12 }}>
      <Text style={{ fontSize: 24, fontWeight: '600' }}>ログイン</Text>
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
      <Link href="/(auth)/register">新規登録はこちら</Link>
    </View>
  );
}
