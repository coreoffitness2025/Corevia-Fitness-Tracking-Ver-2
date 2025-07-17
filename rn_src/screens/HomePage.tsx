import React, { useMemo, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../stores/authStore';
import { useWorkoutStore } from '../features/workout/store/workoutStore';
import { useFoodLogStore } from '../stores/foodLogStore';
import { format, isToday } from 'date-fns';
import Icon from 'react-native-vector-icons/FontAwesome5';
import AppButton from '../components/AppButton';
import WeightRecordModal from '../components/body/WeightRecordModal';
import BodyPhotoModal from '../components/body/BodyPhotoModal';
import BodyProgressView from '../components/body/BodyProgressView';

const HomePage = () => {
    const navigation = useNavigation();
    const { userProfile, updateUserProfile } = useAuthStore();
    const { workouts } = useWorkoutStore();
    const { foodLogs } = useFoodLogStore();

    const [isWeightModalVisible, setWeightModalVisible] = useState(false);
    const [isPhotoModalVisible, setPhotoModalVisible] = useState(false);
    const [isProgressModalVisible, setProgressModalVisible] = useState(false);

    const handleWeightSuccess = useCallback(() => {
        setWeightModalVisible(false);
        // The store is already updated inside the modal, so we just close it.
        // Optionally, refetch other related data here if needed.
    }, []);

    const handlePhotoSuccess = useCallback(() => {
        setPhotoModalVisible(false);
        // Optionally, refetch photo list data here.
    }, []);


    const todayWorkout = useMemo(() => {
        return workouts.find(w => isToday(new Date(w.date)));
    }, [workouts]);

    const todayCalories = useMemo(() => {
        return foodLogs
            .filter(log => isToday(new Date(log.date)))
            .reduce((sum, log) => sum + (log.calories || 0), 0);
    }, [foodLogs]);

    const WelcomeHeader = () => (
        <View style={styles.header}>
            <Text style={styles.welcomeText}>안녕하세요, {userProfile?.displayName || '회원님'}!</Text>
            <Text style={styles.subText}>오늘도 건강한 하루를 시작해보세요.</Text>
        </View>
    );

    const ProfileCard = () => (
        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('Profile')}>
            <View style={styles.cardHeader}>
                <Icon name="user-circle" size={20} color="#17a2b8" />
                <Text style={styles.cardTitle}>내 프로필</Text>
            </View>
            <View style={styles.profileInfo}>
                <Text>키: {userProfile?.height || '-'} cm</Text>
                <Text>몸무게: {userProfile?.weight || '-'} kg</Text>
                <Text>목표: {userProfile?.fitnessGoal || '-'}</Text>
            </View>
        </TouchableOpacity>
    );
    
    const DailyGoalCard = () => (
        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('Guide', { screen: 'NutritionGuide' })}>
            <View style={styles.cardHeader}>
                <Icon name="bullseye" size={20} color="#28a745" />
                <Text style={styles.cardTitle}>일일 목표</Text>
            </View>
            <Text>목표 칼로리: {userProfile?.targetCalories || 0} kcal</Text>
            <Text>섭취 칼로리: {todayCalories} kcal</Text>
        </TouchableOpacity>
    );

    const BodyStatsCard = () => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <Icon name="child" size={20} color="#6f42c1" />
                <Text style={styles.cardTitle}>내 신체 변화</Text>
            </View>
            <View style={styles.statsInfo}>
                <Text>현재 체중: {userProfile?.weight || '-'} kg</Text>
            </View>
            <View style={styles.statsButtons}>
                <AppButton title="체중 기록" onPress={() => setWeightModalVisible(true)} variant="outline" style={styles.statButton} />
                <AppButton title="바디 체크" onPress={() => setPhotoModalVisible(true)} variant="outline" style={styles.statButton} />
                <AppButton title="변화 추이" onPress={() => setProgressModalVisible(true)} variant="outline" style={styles.statButton} />
            </View>
        </View>
    );

    const RecentActivityCard = ({ title, data, icon, color, navigateTo }) => (
        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate(navigateTo)}>
            <View style={styles.cardHeader}>
                <Icon name={icon} size={20} color={color} />
                <Text style={styles.cardTitle}>{title}</Text>
            </View>
            {data ? (
                <Text>{data.name} ({data.type === 'single' ? '단일' : '복합'})</Text>
            ) : (
                <Text>오늘 기록이 없습니다.</Text>
            )}
        </TouchableOpacity>
    );

    return (
        <ScrollView style={styles.container}>
            <WelcomeHeader />
            <ProfileCard />
            <DailyGoalCard />
            <BodyStatsCard />
            <RecentActivityCard 
                title="오늘의 운동"
                data={todayWorkout}
                icon="dumbbell"
                color="#007bff"
                navigateTo="Workout"
            />
            <WeightRecordModal 
                isVisible={isWeightModalVisible} 
                onClose={() => setWeightModalVisible(false)}
                onSuccess={handleWeightSuccess} 
            />
            <BodyPhotoModal 
                isVisible={isPhotoModalVisible} 
                onClose={() => setPhotoModalVisible(false)}
                onSuccess={handlePhotoSuccess}
            />
            <BodyProgressView 
                isVisible={isProgressModalVisible} 
                onClose={() => setProgressModalVisible(false)} 
            />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        backgroundColor: '#f8f9fa' 
    },
    header: {
        backgroundColor: '#007bff',
        padding: 30,
        paddingBottom: 40,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    welcomeText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 5,
    },
    subText: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.8)',
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 15,
        padding: 20,
        marginHorizontal: 16,
        marginTop: -20, // To overlap with header
        marginBottom: 25,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.15,
        shadowRadius: 5,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 10,
    },
    profileInfo: {
        flexDirection: 'row',
        justifyContent: 'space-around'
    },
    statsInfo: {
        alignItems: 'center',
        marginBottom: 15,
    },
    statsButtons: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    statButton: {
        flex: 1,
        marginHorizontal: 4,
    }
});

export default HomePage; 