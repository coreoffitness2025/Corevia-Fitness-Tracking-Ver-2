import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useAuth } from '../../../contexts/AuthContext';
import { useWorkoutSettings } from '../../../hooks/useWorkoutSettings';
import AppButton from '../../../components/common/AppButton';
import { Picker } from '@react-native-picker/picker';

// 원본의 타입들을 가져와서 단순화
type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced';
type PreferredSetConfig = '10x5' | '6x3' | '15x5';

const WorkoutWeightGuideScreen = () => {
    const { userProfile } = useAuth();
    const { settings: workoutSettings } = useWorkoutSettings();

    const [experience, setExperience] = useState<ExperienceLevel>('beginner');
    const [oneRepMaxes, setOneRepMaxes] = useState({ squat: 0, deadlift: 0, bench: 0, overheadPress: 0 });
    const [preferredSetConfig, setPreferredSetConfig] = useState<PreferredSetConfig>('10x5');
    const [result, setResult] = useState(null);

    // 사용자 프로필이 로드되면 상태 초기화
    useEffect(() => {
        if (userProfile) {
            setExperience(userProfile.experience?.level || 'beginner');
            setOneRepMaxes({
                squat: userProfile.oneRepMax?.squat || 0,
                deadlift: userProfile.oneRepMax?.deadlift || 0,
                bench: userProfile.oneRepMax?.bench || 0,
                overheadPress: userProfile.oneRepMax?.overheadPress || 0,
            });
        }
        if (workoutSettings) {
            setPreferredSetConfig(workoutSettings.preferredSetup || '10x5');
        }
    }, [userProfile, workoutSettings]);

    const calculateResults = () => {
        // 원본의 복잡한 추천 알고리즘을 여기에 복원
        // 지금은 단순화된 예시 로직
        const percentageOfOneRM = {
            '10x5': 0.7,
            '6x3': 0.85,
            '15x5': 0.6,
        }[preferredSetConfig];

        const recommendedWeights = {
            squat: oneRepMaxes.squat ? Math.round(oneRepMaxes.squat * percentageOfOneRM) : 0,
            deadlift: oneRepMaxes.deadlift ? Math.round(oneRepMaxes.deadlift * percentageOfOneRM) : 0,
            bench: oneRepMaxes.bench ? Math.round(oneRepMaxes.bench * percentageOfOneRM) : 0,
            overheadPress: oneRepMaxes.overheadPress ? Math.round(oneRepMaxes.overheadPress * percentageOfOneRM) : 0,
        };

        setResult({ recommendedWeights });
    };

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>운동 무게 추천</Text>
            
            <Text style={styles.label}>운동 경력</Text>
            <Picker selectedValue={experience} onValueChange={(itemValue) => setExperience(itemValue)}>
                <Picker.Item label="1년 미만 (초급)" value="beginner" />
                <Picker.Item label="3년 미만 (중급)" value="intermediate" />
                <Picker.Item label="3년 이상 (고급)" value="advanced" />
            </Picker>

            <Text style={styles.label}>1RM 정보 (kg)</Text>
            <TextInput placeholder="스쿼트 1RM" style={styles.input} keyboardType="numeric" onChangeText={text => setOneRepMaxes(s => ({...s, squat: Number(text)}))} value={String(oneRepMaxes.squat || '')} />
            <TextInput placeholder="데드리프트 1RM" style={styles.input} keyboardType="numeric" onChangeText={text => setOneRepMaxes(s => ({...s, deadlift: Number(text)}))} value={String(oneRepMaxes.deadlift || '')} />
            <TextInput placeholder="벤치프레스 1RM" style={styles.input} keyboardType="numeric" onChangeText={text => setOneRepMaxes(s => ({...s, bench: Number(text)}))} value={String(oneRepMaxes.bench || '')} />
            <TextInput placeholder="오버헤드프레스 1RM" style={styles.input} keyboardType="numeric" onChangeText={text => setOneRepMaxes(s => ({...s, overheadPress: Number(text)}))} value={String(oneRepMaxes.overheadPress || '')} />

            <Text style={styles.label}>선호하는 세트 구성</Text>
             <Picker selectedValue={preferredSetConfig} onValueChange={(itemValue) => setPreferredSetConfig(itemValue)}>
                <Picker.Item label="10회 x 5세트 (근비대)" value="10x5" />
                <Picker.Item label="6회 x 3세트 (스트렝스)" value="6x3" />
                <Picker.Item label="15회 x 5세트 (근지구력)" value="15x5" />
            </Picker>

            <AppButton title="추천 무게 계산하기" onPress={calculateResults} style={{ marginTop: 20 }}/>

            {result && (
                <View style={styles.resultContainer}>
                    <Text style={styles.resultTitle}>추천 운동 무게</Text>
                    {Object.entries(result.recommendedWeights).map(([key, value]) => (
                        value > 0 && <Text key={key} style={styles.resultText}>{key}: {value}kg</Text>
                    ))}
                </View>
            )}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: 'white' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  label: { fontSize: 16, marginTop: 15, marginBottom: 5 },
  input: { backgroundColor: '#f0f0f0', padding: 15, borderRadius: 8, fontSize: 16, marginBottom: 10 },
  resultContainer: { marginTop: 30, padding: 20, backgroundColor: '#e9f5ff', borderRadius: 8 },
  resultTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  resultText: { fontSize: 16, marginBottom: 5 },
});

export default WorkoutWeightGuideScreen; 