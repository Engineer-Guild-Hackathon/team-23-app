import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface StatCardProps {
  title: string;
  value: string | number;
  color?: string;
  onPress?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  color = '#4f46e5',
  onPress,
}) => {
  const CardComponent = onPress ? TouchableOpacity : View;

  return (
    <CardComponent style={styles.card} onPress={onPress}>
      <Text style={[styles.value, { color }]}>{value}</Text>
      <Text style={styles.title}>{title}</Text>
    </CardComponent>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
  },
  value: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  title: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
});
