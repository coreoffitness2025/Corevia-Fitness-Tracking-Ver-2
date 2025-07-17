import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { signIn } from '../services';
import AppButton from '../../../components/common/AppButton';
import Card from '../../../components/common/Card';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      return Alert.alert('Error', 'Please enter both email and password.');
    }
    setLoading(true);
    try {
      await signIn(email, password);
      // The onAuthStateChanged listener in AuthContext will handle navigation
    } catch (error) {
      // Error is already alerted in the service, but you can add more logic here
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
    >
      <View>
        <Text style={styles.title}>Corevia Fitness</Text>
        <Text style={styles.subtitle}>Welcome back, please login to your account.</Text>

        <Card style={styles.card}>
            <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
            />
            <TextInput
                style={styles.input}
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />
            <AppButton title="Login" onPress={handleLogin} loading={loading} />
        </Card>
        
        <AppButton 
            title="Create Account" 
            variant="secondary" 
            onPress={() => navigation.navigate('Register')}
            style={{marginTop: 20}}
        />
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#f5f5f5' },
    title: { fontSize: 32, fontWeight: 'bold', textAlign: 'center', marginBottom: 10 },
    subtitle: { fontSize: 16, color: 'gray', textAlign: 'center', marginBottom: 30 },
    card: { marginHorizontal: 0 },
    input: { backgroundColor: '#f0f0f0', padding: 15, borderRadius: 8, marginBottom: 15, fontSize: 16 },
});

export default LoginScreen; 