import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, useWindowDimensions } from 'react-native';
import YoutubeIframe from 'react-native-youtube-iframe';
import { EXERCISE_DATA } from '../../data/exerciseData';
import Icon from 'react-native-vector-icons/FontAwesome5';

const DetailRow = ({ label, items, icon, color }) => (
    <View style={styles.detailRow}>
        <View style={styles.labelContainer}>
            <Icon name={icon} size={16} color={color} />
            <Text style={[styles.detailLabel, { color }]}>{label}</Text>
        </View>
        <View style={styles.tagContainer}>
            {items.map((item, index) => <Text key={index} style={styles.tag}>{item}</Text>)}
        </View>
    </View>
);

const getYoutubeVideoId = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
};

const ExerciseDetailScreen = ({ route }) => {
  const { exerciseId } = route.params;
  const exercise = EXERCISE_DATA.find(ex => ex.id === exerciseId);
  const [playing, setPlaying] = useState(false);
  const { width } = useWindowDimensions();
  const videoId = getYoutubeVideoId(exercise?.videoUrl);
  
  const onStateChange = useCallback((state) => {
    if (state === "ended") {
      setPlaying(false);
      Alert.alert("영상 종료", "영상이 모두 재생되었습니다.");
    }
  }, []);

  if (!exercise) {
    return (
        <View style={styles.container}>
            <Text>운동 정보를 찾을 수 없습니다.</Text>
        </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
        <View style={styles.header}>
            <Text style={styles.title}>{exercise.name}</Text>
            <View style={styles.metaContainer}>
                <View style={styles.metaChip}>
                    <Text style={styles.metaText}>{exercise.level}</Text>
                </View>
                <View style={styles.metaChip}>
                    <Text style={styles.metaText}>{exercise.part}</Text>
                </View>
            </View>
        </View>

        <Text style={styles.description}>{exercise.description}</Text>
        
        {videoId && (
            <View style={styles.videoContainer}>
                <YoutubeIframe
                    height={(width - 32) * 9 / 16}
                    play={playing}
                    videoId={videoId}
                    onChangeState={onStateChange}
                />
            </View>
        )}

        <View style={styles.detailsSection}>
            <DetailRow label="주요 근육" items={exercise.muscles} icon="bullseye" color="#28a745" />
            <DetailRow label="사용 장비" items={exercise.equipment} icon="cogs" color="#17a2b8" />
        </View>
        
        <View style={styles.instructionsContainer}>
            <Text style={styles.instructionsTitle}>수행 방법</Text>
            {exercise.instructions.map((step, index) => (
            <View key={index} style={styles.stepContainer}>
                <Text style={styles.stepNumber}>{index + 1}</Text>
                <Text style={styles.stepText}>{step}</Text>
            </View>
            ))}
        </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        backgroundColor: '#fff',
    },
    header: {
        padding: 16,
        paddingBottom: 8,
    },
    title: {
        fontSize: 26,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    metaContainer: {
        flexDirection: 'row',
    },
    metaChip: {
        backgroundColor: '#e9ecef',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 15,
        marginRight: 10,
    },
    metaText: {
        fontSize: 14,
        fontWeight: '500',
        textTransform: 'capitalize',
    },
    description: { 
        fontSize: 16, 
        lineHeight: 24, 
        paddingHorizontal: 16,
        marginBottom: 20,
        color: '#495057',
    },
    videoContainer: {
        marginHorizontal: 16,
        marginBottom: 20,
        borderRadius: 12,
        overflow: 'hidden',
        elevation: 3,
        shadowColor: '#000',
    },
    detailsSection: {
        paddingHorizontal: 16,
        marginBottom: 20,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: '#f0f0f0',
        paddingVertical: 10,
    },
    detailRow: { 
        alignItems: 'flex-start', 
        marginBottom: 15 
    },
    labelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    detailLabel: { 
        fontSize: 16, 
        fontWeight: 'bold',
        marginLeft: 8,
    },
    tagContainer: { 
        flexDirection: 'row', 
        flexWrap: 'wrap', 
        flex: 1,
        marginLeft: 24,
    },
    tag: { 
        backgroundColor: '#f8f9fa', 
        borderColor: '#dee2e6',
        borderWidth: 1,
        color: '#495057', 
        paddingHorizontal: 12, 
        paddingVertical: 6, 
        borderRadius: 15, 
        marginRight: 8, 
        marginBottom: 8, 
        fontSize: 14 
    },
    instructionsContainer: { 
        paddingHorizontal: 16,
        marginBottom: 30,
    },
    instructionsTitle: { 
        fontSize: 18, 
        fontWeight: 'bold', 
        marginBottom: 15,
        color: '#343a40',
    },
    stepContainer: {
        flexDirection: 'row',
        marginBottom: 12,
        alignItems: 'flex-start',
    },
    stepNumber: {
        backgroundColor: '#007bff',
        color: 'white',
        width: 24,
        height: 24,
        borderRadius: 12,
        textAlign: 'center',
        lineHeight: 24,
        fontWeight: 'bold',
        marginRight: 12,
    },
    stepText: {
        flex: 1,
        fontSize: 16, 
        lineHeight: 24,
        color: '#343a40',
    },
});

export default ExerciseDetailScreen; 