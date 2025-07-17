import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Vibration, TouchableOpacity } from 'react-native';
import { Audio } from 'expo-av';
import Icon from 'react-native-vector-icons/FontAwesome5';

interface WorkoutTimerProps {
    isVisible: boolean;
    onClose: () => void;
    onComplete?: () => void;
    initialTime?: number;
}

const WorkoutTimer: React.FC<WorkoutTimerProps> = ({ 
    isVisible, 
    onClose, 
    onComplete, 
    initialTime = 60 
}) => {
    const [seconds, setSeconds] = useState(initialTime);
    const [isActive, setIsActive] = useState(false);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const soundRef = useRef<Audio.Sound | null>(null);

    useEffect(() => {
        // Reset timer when component becomes visible
        if (isVisible) {
            setSeconds(initialTime);
        }
        
        return () => {
            // Cleanup when component unmounts
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
            if (soundRef.current) {
                soundRef.current.unloadAsync();
            }
        };
    }, [isVisible, initialTime]);

    useEffect(() => {
        if (isActive) {
            intervalRef.current = setInterval(() => {
                setSeconds(prev => {
                    if (prev <= 1) {
                        clearInterval(intervalRef.current!);
                        setIsActive(false);
                        playAlarmSound();
                        Vibration.vibrate([500, 500, 500]); // Vibrate on finish
                        onComplete?.();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } else {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        }
        
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [isActive, onComplete]);

    const playAlarmSound = async () => {
        try {
            const { sound } = await Audio.Sound.createAsync(
                require('../../../assets/sounds/timer-alarm.mp3')
            );
            soundRef.current = sound;
            await sound.playAsync();
        } catch (error) {
            console.error('Error playing sound:', error);
        }
    };

    const toggle = () => setIsActive(!isActive);
    
    const reset = (time: number) => {
        setIsActive(false);
        setSeconds(time);
    };

    const formatTime = () => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    if (!isVisible) return null;

    return (
        <View style={styles.modalContainer}>
            <View style={styles.timerContainer}>
                <Text style={styles.title}>다음 세트 준비 시간</Text>
                <Text style={styles.timeText}>{formatTime()}</Text>
                
                <View style={styles.buttonRow}>
                    <TouchableOpacity 
                        style={[styles.button, isActive ? styles.pauseButton : styles.startButton]} 
                        onPress={toggle}
                    >
                        <Icon name={isActive ? 'pause' : 'play'} size={20} color="white" />
                        <Text style={styles.buttonText}>{isActive ? '일시정지' : '시작'}</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                        style={[styles.button, styles.resetButton]} 
                        onPress={() => reset(initialTime)}
                    >
                        <Icon name="undo" size={20} color="white" />
                        <Text style={styles.buttonText}>리셋</Text>
                    </TouchableOpacity>
                </View>
                
                <View style={styles.presetRow}>
                    <TouchableOpacity style={styles.presetButton} onPress={() => reset(30)}>
                        <Text style={styles.presetText}>30초</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.presetButton} onPress={() => reset(60)}>
                        <Text style={styles.presetText}>60초</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.presetButton} onPress={() => reset(90)}>
                        <Text style={styles.presetText}>90초</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.presetButton} onPress={() => reset(120)}>
                        <Text style={styles.presetText}>120초</Text>
                    </TouchableOpacity>
                </View>
                
                <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                    <Text style={styles.closeButtonText}>닫기</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
    timerContainer: {
        width: '80%',
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 24,
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 12,
        color: '#333',
    },
    timeText: {
        fontSize: 72,
        fontWeight: 'bold',
        marginVertical: 20,
        color: '#007bff',
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        marginBottom: 20,
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        minWidth: 120,
    },
    startButton: {
        backgroundColor: '#007bff',
    },
    pauseButton: {
        backgroundColor: '#ffc107',
    },
    resetButton: {
        backgroundColor: '#6c757d',
    },
    buttonText: {
        color: 'white',
        fontWeight: '600',
        fontSize: 16,
        marginLeft: 8,
    },
    presetRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        marginBottom: 20,
        flexWrap: 'wrap',
    },
    presetButton: {
        padding: 10,
        margin: 5,
        backgroundColor: '#f0f0f0',
        borderRadius: 8,
    },
    presetText: {
        fontSize: 16,
        color: '#007bff',
        fontWeight: '500',
    },
    closeButton: {
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
        backgroundColor: '#f8f9fa',
        borderWidth: 1,
        borderColor: '#dee2e6',
    },
    closeButtonText: {
        fontSize: 16,
        color: '#6c757d',
        fontWeight: '500',
    },
});

export default WorkoutTimer; 