import { View, Text } from 'react-native';
import { useAuth } from '../_layout';

export default function Home() {
  const { user } = useAuth();
  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
    >
      <Text style={{ fontSize: 22, fontWeight: '700' }}>
        ようこそ、{user?.email}
      </Text>
      <Text style={{ marginTop: 8 }}>
        あなたの役割: {user?.role ?? '未設定'}
      </Text>
    </View>
  );
}
