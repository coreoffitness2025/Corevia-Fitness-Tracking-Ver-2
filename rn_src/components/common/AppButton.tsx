import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
}

const AppButton = ({ title, onPress, variant = 'primary', loading = false, style, textStyle, disabled = false }: ButtonProps) => {
  const buttonStyles = [styles.button, styles[`${variant}Button`], style];
  const textStyles = [styles.text, styles[`${variant}Text`], textStyle];
  
  if (disabled || loading) {
    buttonStyles.push(styles.disabledButton);
  }

  return (
    <TouchableOpacity onPress={onPress} style={buttonStyles} disabled={disabled || loading}>
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? 'white' : '#007bff'} />
      ) : (
        <Text style={textStyles}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  text: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  primaryButton: {
    backgroundColor: '#007bff',
  },
  primaryText: {
    color: 'white',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#007bff',
  },
  secondaryText: {
    color: '#007bff',
  },
  dangerButton: {
      backgroundColor: '#d9534f',
  },
  dangerText: {
      color: 'white',
  },
  disabledButton: {
    opacity: 0.6,
  },
});

export default AppButton; 