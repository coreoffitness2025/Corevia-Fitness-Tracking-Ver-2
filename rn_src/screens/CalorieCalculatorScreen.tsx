import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import AppButton from '../components/common/AppButton';

const activityLevels = [
    { label: '거의 운동 안함', value: 1.2 },
    { label: '가벼운 활동 (주 1-3회)', value: 1.375 },
    { label: '보통 활동 (주 3-5회)', value: 1.55 },
    { label: '활동적 (주 6-7회)', value: 1.725 },
    { label: '매우 활동적 (매일)', value: 1.9 },
];

const goals = [
    { label: '체중 감량', value: 'loss', multiplier: 0.85 },
    { label: '체중 유지', value: 'maintain', multiplier: 1.0 },
    { label: '근육 증가', value: 'gain', multiplier: 1.15 },
];

const CalorieCalculatorScreen = () => {
    const [gender, setGender] = useState('male');
    const [age, setAge] = useState('');
    const [weight, setWeight] = useState('');
    const [height, setHeight] = useState('');
    const [activityLevel, setActivityLevel] = useState(1.55);
    const [goal, setGoal] = useState('maintain');
    const [result, setResult] = useState(null);

    const calculateCalories = () => {
        const ageNum = parseInt(age, 10);
        const weightNum = parseFloat(weight);
        const heightNum = parseFloat(height);

        if (isNaN(ageNum) || isNaN(weightNum) || isNaN(heightNum) || ageNum <= 0 || weightNum <= 0 || heightNum <= 0) {
            Alert.alert('입력 오류', '모든 필드에 유효한 값을 입력해주세요.');
            return;
        }

        let bmr = (gender === 'male')
            ? 10 * weightNum + 6.25 * heightNum - 5 * ageNum + 5
            : 10 * weightNum + 6.25 * heightNum - 5 * ageNum - 161;
        
        const tdee = bmr * activityLevel;
        const goalMultiplier = goals.find(g => g.value === goal)?.multiplier || 1.0;
        const targetCalories = tdee * goalMultiplier;

        // 매크로 계산 (단백질: 체중*2g, 지방: 총 칼로리의 25%, 나머지 탄수화물)
        const protein = weightNum * 2;
        const fat = (targetCalories * 0.25) / 9;
        const carbs = (targetCalories - (protein * 4) - (fat * 9)) / 4;

        setResult({
            bmr: bmr.toFixed(0),
            tdee: tdee.toFixed(0),
            targetCalories: targetCalories.toFixed(0),
            protein: protein.toFixed(0),
            carbs: carbs.toFixed(0),
            fat: fat.toFixed(0),
        });
    };

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>목표 칼로리 & 영양소 계산기</Text>

            {/* Input Fields: Gender, Age, Weight, Height */}
            <Text style={styles.label}>성별</Text>
            <Picker selectedValue={gender} onValueChange={(v) => setGender(v)}><Picker.Item label="남성" value="male" /><Picker.Item label="여성" value="female" /></Picker>
            <Text style={styles.label}>나이</Text>
            <TextInput style={styles.input} value={age} onChangeText={setAge} keyboardType="numeric" />
            <Text style={styles.label}>체중 (kg)</Text>
            <TextInput style={styles.input} value={weight} onChangeText={setWeight} keyboardType="numeric" />
            <Text style={styles.label}>신장 (cm)</Text>
            <TextInput style={styles.input} value={height} onChangeText={setHeight} keyboardType="numeric" />

            <Text style={styles.label}>활동량</Text>
            <Picker selectedValue={activityLevel} onValueChange={(v) => setActivityLevel(v)}>
                {activityLevels.map(level => <Picker.Item key={level.value} label={level.label} value={level.value} />)}
            </Picker>
            
            <Text style={styles.label}>목표</Text>
            <View style={styles.goalContainer}>
                {goals.map(g => (
                    <TouchableOpacity key={g.value} style={[styles.goalButton, goal === g.value && styles.selectedGoalButton]} onPress={() => setGoal(g.value)}>
                        <Text style={[styles.goalButtonText, goal === g.value && styles.selectedGoalButtonText]}>{g.label}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <AppButton title="계산하기" onPress={calculateCalories} style={{ marginTop: 20 }}/>

            {result && (
                <View style={styles.resultContainer}>
                    <Text style={styles.resultTitle}>계산 결과</Text>
                    {/* BMR, TDEE display */}
                    <View style={styles.resultRow}><Text>기초대사량 (BMR)</Text><Text>{result.bmr} kcal</Text></View>
                    <View style={styles.resultRow}><Text>활동대사량 (TDEE)</Text><Text>{result.tdee} kcal</Text></View>
                    
                    {/* Target Calories */}
                    <View style={styles.targetCalorieBox}>
                        <Text style={styles.targetCalorieLabel}>목표 섭취 칼로리</Text>
                        <Text style={styles.targetCalorieValue}>{result.targetCalories} kcal</Text>
                    </View>

                    {/* Macros */}
                    <View style={styles.macroContainer}>
                        <View style={styles.macroBox}><Text>단백질</Text><Text>{result.protein}g</Text></View>
                        <View style={styles.macroBox}><Text>탄수화물</Text><Text>{result.carbs}g</Text></View>
                        <View style={styles.macroBox}><Text>지방</Text><Text>{result.fat}g</Text></View>
                    </View>
                    {/* <AppButton title="이 결과로 목표 설정" onPress={() => {}} variant="secondary" style={{marginTop: 15}} /> */}
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
  goalContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  goalButton: { flex: 1, padding: 15, borderRadius: 8, borderWidth: 1, borderColor: '#ddd', alignItems: 'center' },
  selectedGoalButton: { backgroundColor: '#007bff', borderColor: '#007bff' },
  goalButtonText: { fontSize: 14, fontWeight: '600' },
  selectedGoalButtonText: { color: 'white' },
  resultContainer: { marginTop: 30, padding: 20, backgroundColor: '#f8f9fa', borderRadius: 8 },
  resultTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
  resultRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
  targetCalorieBox: { alignItems: 'center', backgroundColor: '#e9f5ff', padding: 15, borderRadius: 8, marginVertical: 15 },
  targetCalorieLabel: { fontSize: 16 },
  targetCalorieValue: { fontSize: 28, fontWeight: 'bold', color: '#007bff' },
  macroContainer: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 10 },
  macroBox: { alignItems: 'center' },
});

export default CalorieCalculatorScreen; 