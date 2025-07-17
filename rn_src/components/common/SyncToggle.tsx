import React, { useState, useEffect } from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';
import { startSyncService, stopSyncService, isSyncServiceRunning } from '../../lib/syncService'; // Assuming isSyncServiceRunning exists

const SyncToggle = () => {
    // We need a way to know the initial state of the service.
    // This requires a small modification to syncService.
    const [isEnabled, setIsEnabled] = useState(isSyncServiceRunning());

    const toggleSwitch = () => {
        const newState = !isEnabled;
        setIsEnabled(newState);
        if (newState) {
            startSyncService();
        } else {
            stopSyncService();
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.text}>Enable Auto-Sync</Text>
            <Switch
                onValueChange={toggleSwitch}
                value={isEnabled}
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
    },
});

export default SyncToggle; 