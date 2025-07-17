import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { Card, AppButton } from '../../components';
import { Layout } from '../../components/Layout';
import { exportWorkoutHistory } from '../../features/profile/services/exportService';
import AppButton from '../components/common/AppButton';
import ThemeToggle from '../components/common/ThemeToggle';
import WorkoutSetConfig from '../components/settings/WorkoutSetConfig';
import SyncToggle from '../components/common/SyncToggle';

const SettingsScreen = ({ navigation }) => {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
      setIsExporting(true);
      await exportWorkoutHistory();
      setIsExporting(false);
  };

  return (
    <Layout title="Settings" showBackButton={true}>
        <View style={styles.container}>
            <Card style={{ marginTop: 20 }}>
                <Text style={styles.cardTitle}>General</Text>
                <ThemeToggle />
                <View style={styles.divider} />
                <WorkoutSetConfig />
            </Card>

            <Card style={{ marginTop: 20 }}>
                <Text style={styles.cardTitle}>Data & Sync</Text>
                <SyncToggle />
                <View style={styles.divider} />
                <AppButton title="Export Workout History" onPress={handleExport} loading={isExporting} variant="secondary" />
            </Card>
            
            <View style={styles.logoutButtonContainer}>
                <AppButton title="Logout" variant="danger" onPress={handleLogout} />
            </View>
        </View>
    </Layout>
  );
};

const styles = {
  container: {
    padding: 20,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  logoutButtonContainer: {
    marginTop: 20,
  },
};

export default SettingsScreen; 