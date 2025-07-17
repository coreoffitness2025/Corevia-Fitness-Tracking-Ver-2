import React from 'react';
import { View, ActivityIndicator, StyleSheet, Modal, Text } from 'react-native';

interface LoadingSpinnerProps {
  isVisible: boolean;
  text?: string;
}

const LoadingSpinner = ({ isVisible, text = 'Loading...' }: LoadingSpinnerProps) => {
  return (
    <Modal
        animationType="fade"
        transparent={true}
        visible={isVisible}
    >
      <View style={styles.container}>
        <View style={styles.spinnerContainer}>
            <ActivityIndicator size="large" color="#007bff" />
            <Text style={styles.text}>{text}</Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
  },
  spinnerContainer: {
      backgroundColor: 'white',
      borderRadius: 10,
      padding: 30,
      alignItems: 'center',
      elevation: 5,
  },
  text: {
    marginTop: 15,
    fontSize: 16,
    color: '#333',
  },
});

export default LoadingSpinner; 