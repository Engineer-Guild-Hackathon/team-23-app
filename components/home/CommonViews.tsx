import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

export const LoadingScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#4f46e5" />
      <Text style={styles.text}>プロフィールを読み込み中...</Text>
    </View>
  );
};

export const ErrorScreen: React.FC<{ message: string }> = ({ message }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.errorIcon}>⚠️</Text>
      <Text style={styles.errorText}>{message}</Text>
    </View>
  );
};

export const DefaultHomeView: React.FC<{ profile: any }> = ({ profile }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.defaultText}>
        こんにちは、{profile?.name || 'ユーザー'}さん
      </Text>
      <Text style={styles.defaultSubtext}>
        プロフィールの設定を完了してください
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#fff',
  },
  text: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#dc2626',
    textAlign: 'center',
  },
  defaultText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  defaultSubtext: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
});
