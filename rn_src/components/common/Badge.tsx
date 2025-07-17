import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';

interface BadgeProps {
  text: string;
  color?: string;
  backgroundColor?: string;
  style?: ViewStyle;
}

const Badge = ({ text, color = 'white', backgroundColor = '#007bff', style }: BadgeProps) => {
  return (
    <View style={[styles.badge, { backgroundColor }, style]}>
      <Text style={[styles.text, { color }]}>{text}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    alignSelf: 'flex-start', // Important to not take full width
  },
  text: {
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default Badge; 