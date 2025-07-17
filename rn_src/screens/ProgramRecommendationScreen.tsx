import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { RECOMMENDED_PROGRAMS, RecommendedProgram } from '../data/programRecommendationData';
import Icon from 'react-native-vector-icons/FontAwesome5';

const GOALS = ['전체', '근력 향상', '근비대', '체지방 감소'];

const ProgramRecommendationScreen = () => {
    const navigation = useNavigation();
    const [selectedGoal, setSelectedGoal] = useState('전체');

    const filteredData = selectedGoal === '전체'
        ? RECOMMENDED_PROGRAMS
        : RECOMMENDED_PROGRAMS.filter(item => item.goal === selectedGoal);
    
    const renderGoalTabs = () => (
        <View style={styles.tabContainer}>
            <FlatList
                data={GOALS}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={[styles.tab, selectedGoal === item && styles.selectedTab]}
                        onPress={() => setSelectedGoal(item)}
                    >
                        <Text style={[styles.tabText, selectedGoal === item && styles.selectedTabText]}>{item}</Text>
                    </TouchableOpacity>
                )}
                keyExtractor={item => item}
                horizontal
                showsHorizontalScrollIndicator={false}
            />
        </View>
    );

    const renderProgramItem = ({ item }: { item: RecommendedProgram }) => (
        <TouchableOpacity 
            style={styles.programContainer}
            onPress={() => navigation.navigate('ProgramRecommendationDetail', { programName: item.name })}
        >
            <View style={styles.programHeader}>
                <Text style={styles.programTitle}>{item.name}</Text>
                <View style={styles.levelBadge}>
                    <Text style={styles.levelText}>{item.level}</Text>
                </View>
            </View>
            <Text style={styles.programDescription}>{item.description}</Text>
            <View style={styles.programMeta}>
                <View style={styles.metaItem}>
                    <Icon name="bullseye" size={14} color="#555" />
                    <Text style={styles.metaText}>{item.goal}</Text>
                </View>
                <View style={styles.metaItem}>
                    <Icon name="calendar-alt" size={14} color="#555" />
                    <Text style={styles.metaText}>{item.duration}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            {renderGoalTabs()}
            <FlatList
                data={filteredData}
                renderItem={renderProgramItem}
                keyExtractor={(item) => item.name}
                contentContainerStyle={styles.listContent}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    tabContainer: {
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#dee2e6',
        backgroundColor: 'white',
    },
    tab: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        marginRight: 10,
        backgroundColor: '#e9ecef',
    },
    selectedTab: {
        backgroundColor: '#28a745', // Green color for goal
    },
    tabText: {
        color: '#495057',
        fontWeight: '600',
    },
    selectedTabText: {
        color: 'white',
    },
    listContent: {
        padding: 15,
    },
    programContainer: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 20,
        marginBottom: 15,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,
    },
    programHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    programTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        flex: 1, 
        marginRight: 10,
    },
    levelBadge: {
        backgroundColor: '#6c757d',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    levelText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
    },
    programDescription: {
        fontSize: 14,
        color: '#6c757d',
        lineHeight: 20,
        marginBottom: 12,
    },
    programMeta: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
        paddingTop: 12,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 20,
    },
    metaText: {
        marginLeft: 6,
        fontSize: 14,
        color: '#333',
    },
});

export default ProgramRecommendationScreen; 