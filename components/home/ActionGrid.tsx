import React from 'react';
import { StyleSheet, View } from 'react-native';

interface ActionGridProps {
  children: React.ReactNode;
}

export const ActionGrid: React.FC<ActionGridProps> = ({ children }) => {
  return <View style={styles.grid}>{children}</View>;
};

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
});
