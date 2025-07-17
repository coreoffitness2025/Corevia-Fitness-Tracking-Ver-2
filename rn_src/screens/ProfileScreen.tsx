import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getWeightHistory, getPhotoHistory } from '../services/bodyService'; // Assuming getPhotoHistory exists
import BodyProgressView from '../components/body/BodyProgressView';
import AppButton from '../components/common/AppButton';

// Mock function until it's added to service
const getPhotoHistory = async () => []; 

const ProfileScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [weightHistory, setWeightHistory] = useState([]);
  const [photoHistory, setPhotoHistory] = useState([]);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  const fetchData = async () => {
    setLoading(true);
    try {
      const [weights, photos] = await Promise.all([
        getWeightHistory(),
        getPhotoHistory(),
      ]);
      setWeightHistory(weights);
      setPhotoHistory(photos);
    } catch (error) {
      Alert.alert('Error', 'Could not fetch progress data.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <View style={styles.centered}><ActivityIndicator /></View>;
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>My Profile</Text>

      <View style={styles.section}>
          <AppButton 
            title="Settings" 
            onPress={() => navigation.navigate('Settings')}
            variant="secondary"
          />
          <AppButton 
            title="Q&A" 
            onPress={() => navigation.navigate('Qna')}
            variant="secondary"
            style={{ marginTop: 10 }}
          />
      </View>
      
      <BodyProgressView weightHistory={weightHistory} photoHistory={photoHistory} />

      <View style={styles.buttonContainer}>
          <AppButton 
            title="Record Weight" 
            onPress={() => navigation.navigate('WeightRecordModal')} // New modal screen needed
            variant="secondary"
          />
          <AppButton 
            title="Record Photo" 
            onPress={() => navigation.navigate('PhotoRecordModal')} // New modal screen needed
          />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f5f5f5' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, paddingHorizontal: 16 },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 20,
  },
  section: {
    marginBottom: 20,
    paddingHorizontal: 16,
  }
});

export default ProfileScreen; 