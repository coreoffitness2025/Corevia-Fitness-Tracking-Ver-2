import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, ScrollView } from 'react-native';
import AppButton from '../components/common/AppButton'; // 커스텀 버튼 사용

const OneRepMaxCalculatorScreen = () => {
  const [weight, setWeight] = useState('');
  const [reps, setReps] = useState('');
  const [oneRepMax, setOneRepMax] = useState(0);

  const calculateOneRepMax = () => {
    const numWeight = Number(weight);
    const numReps = Number(reps);

    if (isNaN(numWeight) || isNaN(numReps) || numWeight <= 0 || numReps <= 0) {
      setOneRepMax(0);
      Alert.alert('입력 오류', '유효한 중량과 반복횟수를 입력해주세요.');
      return;
    }
    
    if (numReps === 1) {
        setOneRepMax(numWeight);
        return;
    }

    // Brzycki 공식으로 복원
    const max = numWeight * (36 / (37 - numReps));
    setOneRepMax(Math.round(max));
  };

  const getTrainingIntensity = (oneRM: number) => {
    if (oneRM <= 0) return null;
    return {
      strength: { min: oneRM * 0.85, max: oneRM * 0.95 },
      hypertrophy: { min: oneRM * 0.7, max: oneRM * 0.8 },
      endurance: { min: oneRM * 0.6, max: oneRM * 0.7 }
    };
  };

  const intensity = getTrainingIntensity(oneRepMax);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>1RM 계산기</Text>
      
      <Text style={styles.label}>들어올린 중량 (kg)</Text>
      <TextInput
        style={styles.input}
        value={weight}
        onChangeText={setWeight}
        placeholder="예: 100"
        keyboardType="numeric"
      />

      <Text style={styles.label}>최대 반복횟수 (15회 이하 권장)</Text>
      <TextInput
        style={styles.input}
        value={reps}
        onChangeText={setReps}
        placeholder="예: 5"
        keyboardType="numeric"
      />

      <AppButton title="계산하기" onPress={calculateOneRepMax} />

      {oneRepMax > 0 && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultLabel}>예상 1RM</Text>
          <Text style={styles.resultValue}>{oneRepMax.toFixed(1)} kg</Text>

          {intensity && (
            <View style={styles.intensityContainer}>
              <Text style={styles.intensityTitle}>목적별 훈련 강도</Text>
              <View style={styles.intensityBox}>
                <Text style={styles.intensityLabel}>근력 증가 (1-5회)</Text>
                <Text style={styles.intensityValue}>{intensity.strength.min.toFixed(1)}kg - {intensity.strength.max.toFixed(1)}kg</Text>
              </View>
              <View style={styles.intensityBox}>
                <Text style={styles.intensityLabel}>근비대 (8-12회)</Text>
                <Text style={styles.intensityValue}>{intensity.hypertrophy.min.toFixed(1)}kg - {intensity.hypertrophy.max.toFixed(1)}kg</Text>
              </View>
              <View style={styles.intensityBox}>
                <Text style={styles.intensityLabel}>근지구력 (15+회)</Text>
                <Text style={styles.intensityValue}>{intensity.endurance.min.toFixed(1)}kg - {intensity.endurance.max.toFixed(1)}kg</Text>
              </View>
            </View>
          )}

           <View style={styles.noticeContainer}>
              <Text style={styles.noticeText}>⚠️ 추정값이므로 실제 1RM과 다를 수 있습니다.</Text>
              <Text style={styles.noticeText}>⚠️ 전문가 지도 하에 실제 1RM 테스트를 권장합니다.</Text>
            </View>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: 'white' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  label: { fontSize: 16, marginBottom: 5, color: '#333' },
  input: { backgroundColor: '#f0f0f0', padding: 15, borderRadius: 8, marginBottom: 20, fontSize: 16 },
  resultContainer: { marginTop: 30, alignItems: 'center', padding: 20, backgroundColor: '#f8f9fa', borderRadius: 8 },
  resultLabel: { fontSize: 18, color: '#333' },
  resultValue: { fontSize: 36, fontWeight: 'bold', color: '#007bff', marginVertical: 10 },
  intensityContainer: { width: '100%', marginTop: 20 },
  intensityTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' },
  intensityBox: { backgroundColor: '#e9ecef', padding: 15, borderRadius: 8, marginBottom: 10 },
  intensityLabel: { fontSize: 16, fontWeight: '500' },
  intensityValue: { fontSize: 16, color: '#495057', marginTop: 5 },
  noticeContainer: { marginTop: 20, padding: 10, backgroundColor: '#fff3cd', borderRadius: 8 },
  noticeText: { fontSize: 12, color: '#856404', textAlign: 'center' },
});

export default OneRepMaxCalculatorScreen; 