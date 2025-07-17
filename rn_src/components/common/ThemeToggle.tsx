import React from 'react';
import { View, Text, Switch, StyleSheet, useColorScheme } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

const ThemeToggle = () => {
    const { theme, toggleTheme } = useTheme();
    const isDarkMode = theme === 'dark';

    return (
        <View style={styles.container}>
            <Text style={styles.text}>Dark Mode</Text>
            <Switch
                trackColor={{ false: "#767577", true: "#81b0ff" }}
                thumbColor={isDarkMode ? "#f5dd4b" : "#f4f3f4"}
                onValueChange={toggleTheme}
                value={isDarkMode}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
    },
    text: {
        fontSize: 16,
        // The color will be inherited from the parent component's theme
    },
});

export default ThemeToggle; 