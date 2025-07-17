import React from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { auth } from '../services/firebase';
import Layout from '../components/common/Layout';
import Card from '../components/common/Card';
import AppButton from '../components/common/AppButton';
import ThemeToggle from '../components/common/ThemeToggle';
import WorkoutSetConfig from '../components/settings/WorkoutSetConfig';
import { useAuth } from '../contexts/AuthContext'; // or useAuthStore

const SettingsScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const textColor = isDark ? '#fff' : '#000';
  const { user, deleteUserAccount } = useAuth(); // Assuming a custom hook that provides these

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        { 
          text: "OK", 
          onPress: () => auth.signOut().catch(error => Alert.alert("Logout Error", error.message))
        }
      ]
    );
  };

  const handleAccountDelete = () => {
      Alert.alert(
          "회원 탈퇴",
          "정말로 계정을 삭제하시겠습니까? 모든 데이터가 영구적으로 삭제되며, 이 작업은 되돌릴 수 없습니다.",
          [
              { text: "취소", style: "cancel" },
              { 
                  text: "삭제", 
                  onPress: async () => {
                      try {
                          await deleteUserAccount(); // This function should handle all cleanup
                          Alert.alert("성공", "계정이 삭제되었습니다.");
                          // AppNavigator will handle redirecting to Login screen
                      } catch (error) {
                          Alert.alert("오류", error.message || "계정 삭제에 실패했습니다.");
                      }
                  },
                  style: "destructive"
              }
          ]
      );
  };


  return (
    <Layout title="Settings" showBackButton={true}>
        <View style={styles.container}>
            <Card>
                <TouchableOpacity style={styles.option} onPress={() => navigation.navigate('Profile')}>
                    <Text style={[styles.optionText, {color: textColor}]}>Profile</Text>
                </TouchableOpacity>
                <View style={styles.divider} />
                <TouchableOpacity style={styles.option} onPress={() => navigation.navigate('Legal')}>
                    <Text style={[styles.optionText, {color: textColor}]}>Legal & Privacy</Text>
                </TouchableOpacity>
            </Card>

            <Card style={{ marginTop: 20 }}>
                <Text style={styles.cardTitle}>General</Text>
                <ThemeToggle />
                <View style={styles.divider} />
                <WorkoutSetConfig />
            </Card>
            
            <Card style={{ marginTop: 20 }}>
                <Text style={styles.cardTitle}>계정 관리</Text>
                <AppButton title="회원 탈퇴" variant="danger" onPress={handleAccountDelete} />
            </Card>

            <View style={styles.logoutButtonContainer}>
                <AppButton title="Logout" variant="danger" onPress={handleLogout} />
            </View>
        </View>
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  option: {
    paddingVertical: 15,
  },
  optionText: {
    fontSize: 18,
  },
  divider: {
      height: 1,
      backgroundColor: '#f0f0f0',
  },
  logoutButtonContainer: {
    marginTop: 30,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'gray',
    textTransform: 'uppercase',
    marginBottom: 10,
  },
});

export default SettingsScreen; 