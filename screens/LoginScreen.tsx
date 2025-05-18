import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/ui/Button';

export default function LoginScreen() {
  const router = useRouter();
  const { colors, theme } = useTheme();
  const { login, isAuthenticated, isLoading: authLoading } = useAuth();
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Redirect to admin dashboard if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/admin');
    }
  }, [isAuthenticated, router]);
  
  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập tên đăng nhập và mật khẩu');
      return;
    }
    
    try {
      setIsLoading(true);
      const result = await login(username, password);
      
      if (!result.success) {
        Alert.alert('Đăng nhập thất bại', result.message || 'Tên đăng nhập hoặc mật khẩu không đúng');
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Lỗi', 'Đã xảy ra lỗi khi đăng nhập');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleBack = () => {
    router.replace('/');
  };
  
  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };
  
  if (authLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} />
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: colors.text }]}>Đang tải...</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={[styles.backButton, { backgroundColor: colors.cardBackground }]} 
          onPress={handleBack}
        >
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
      </View>
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <View style={styles.content}>
          {/* Logo */}
          <View style={styles.logoContainer}>
            <Image 
              source={require('../assets/images/react-logo.png')} 
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={[styles.appName, { color: colors.primary }]}>Milk Shop</Text>
            <Text style={[styles.adminText, { color: colors.text }]}>Đăng nhập Admin</Text>
          </View>
          
          {/* Login Form */}
          <View style={styles.formContainer}>
            <View 
              style={[
                styles.inputContainer, 
                { backgroundColor: colors.cardBackground, borderColor: colors.separator }
              ]}
            >
              <Ionicons name="person-outline" size={20} color={colors.gray} style={styles.inputIcon} />
              <TextInput
                placeholder="Tên đăng nhập"
                value={username}
                onChangeText={setUsername}
                style={[styles.input, { color: colors.text }]}
                placeholderTextColor={colors.gray}
                autoCapitalize="none"
              />
            </View>
            
            <View 
              style={[
                styles.inputContainer, 
                { backgroundColor: colors.cardBackground, borderColor: colors.separator }
              ]}
            >
              <Ionicons name="lock-closed-outline" size={20} color={colors.gray} style={styles.inputIcon} />
              <TextInput
                placeholder="Mật khẩu"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                style={[styles.input, { color: colors.text }]}
                placeholderTextColor={colors.gray}
              />
              <TouchableOpacity onPress={toggleShowPassword} style={styles.toggleButton}>
                <Ionicons 
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'} 
                  size={20} 
                  color={colors.gray} 
                />
              </TouchableOpacity>
            </View>
            
            <Button
              title="Đăng nhập"
              onPress={handleLogin}
              variant="primary"
              size="large"
              fullWidth
              loading={isLoading}
              style={styles.loginButton}
            />
            
            <TouchableOpacity onPress={handleBack} style={styles.backToShopButton}>
              <Text style={[styles.backToShopText, { color: colors.text }]}>
                Quay lại cửa hàng
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
  },
  header: {
    position: 'absolute',
    top: 16,
    left: 16,
    zIndex: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 16,
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  adminText: {
    fontSize: 16,
  },
  formContainer: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 16,
    height: 50,
  },
  inputIcon: {
    marginHorizontal: 12,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 16,
  },
  toggleButton: {
    padding: 12,
  },
  loginButton: {
    marginTop: 16,
  },
  backToShopButton: {
    marginTop: 24,
    alignItems: 'center',
  },
  backToShopText: {
    fontSize: 14,
  },
}); 