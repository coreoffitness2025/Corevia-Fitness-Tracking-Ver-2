import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome5';

const GuideItem = ({ title, icon, screenName }) => {
    const navigation = useNavigation();
    return (
        <TouchableOpacity style={styles.itemContainer} onPress={() => navigation.navigate(screenName)}>
            <Icon name={icon} size={24} color="#007bff" style={styles.icon} />
            <Text style={styles.itemText}>{title}</Text>
        </TouchableOpacity>
    );
};

const GuideScreen = () => {
    const guides = [
        { title: '1RM 계산기', icon: 'calculator', screenName: 'OneRepMaxCalculator' },
        { title: '목표 칼로리 계산기', icon: 'bullseye', screenName: 'CalorieCalculator' },
        { title: '음식 영양성분 확인', icon: 'utensils', screenName: 'NutritionGuide' },
        { title: '운동 무게 추천', icon: 'dumbbell', screenName: 'WorkoutWeightGuide' },
        { title: '운동 검색 (설명)', icon: 'search', screenName: 'ExerciseList' },
        { title: '식단 추천', icon: 'concierge-bell', screenName: 'MealPlan' },
        { title: '핸드북', icon: 'book-open', screenName: 'Handbook' },
        { title: '운동 프로그램 추천', icon: 'star', screenName: 'ProgramRecommendation' },
    ];

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>운동 & 영양 가이드</Text>
                <Text style={styles.headerSubtitle}>궁금한 정보를 확인하고 목표를 달성하세요</Text>
            </View>
            <View style={styles.grid}>
                {guides.map((item) => (
                    <GuideItem key={item.title} {...item} />
                ))}
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        padding: 24,
        backgroundColor: '#007bff',
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 8,
    },
    headerSubtitle: {
        fontSize: 16,
        color: 'white',
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        padding: 16,
    },
    itemContainer: {
        width: '48%',
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 20,
        marginBottom: 16,
        alignItems: 'center',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    icon: {
        marginBottom: 12,
    },
    itemText: {
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
        color: '#333',
    },
});

export default GuideScreen; 