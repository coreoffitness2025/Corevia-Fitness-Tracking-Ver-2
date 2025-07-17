import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome5';

const WorkoutScreen = () => {
    const navigation = useNavigation();

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>운동</Text>
                <Text style={styles.headerSubtitle}>오늘의 성장을 기록하고, 어제보다 나은 내일을 만드세요.</Text>
            </View>

            <View style={styles.menuContainer}>
                <TouchableOpacity 
                    style={styles.menuItem}
                    onPress={() => navigation.navigate('WorkoutProgramList')}
                >
                    <Icon name="play-circle" size={30} color="#007bff" />
                    <Text style={styles.menuText}>운동 프로그램 시작하기</Text>
                    <Text style={styles.menuSubText}>만들어 둔 프로그램으로 운동을 시작합니다.</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                    style={styles.menuItem}
                    onPress={() => navigation.navigate('WorkoutLogList')}
                >
                    <Icon name="calendar-check" size={30} color="#6f42c1" />
                    <Text style={styles.menuText}>지난 운동 기록 보기</Text>
                    <Text style={styles.menuSubText}>날짜별 운동 기록과 성장 그래프를 확인합니다.</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                    style={styles.menuItem}
                    onPress={() => navigation.navigate('WorkoutGraph')}
                >
                    <Icon name="chart-line" size={30} color="#28a745" />
                    <Text style={styles.menuText}>운동 성과 분석</Text>
                    <Text style={styles.menuSubText}>주요 운동의 중량 변화를 그래프로 확인합니다.</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    header: {
        backgroundColor: '#007bff',
        padding: 24,
        paddingTop: 50,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: 'white',
    },
    headerSubtitle: {
        fontSize: 16,
        color: 'white',
        marginTop: 8,
    },
    menuContainer: {
        padding: 20,
    },
    menuItem: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 20,
        marginBottom: 20,
        elevation: 3,
    },
    menuText: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 12,
    },
    menuSubText: {
        fontSize: 14,
        color: '#6c757d',
        marginTop: 4,
    }
});

export default WorkoutScreen; 