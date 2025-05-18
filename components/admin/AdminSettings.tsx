import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import { useTheme } from '../../contexts/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

type SettingsTab = 'account' | 'appearance';

export default function AdminSettings({ onTabChange }: { onTabChange?: (tab: string) => void }) {
  const { user, logout, updateUserData } = useAuth();
  const { colors, theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<SettingsTab>('account');
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  const validateForm = () => {
    const newErrors: {
      name?: string;
      email?: string;
      password?: string;
      confirmPassword?: string;
    } = {};
    let isValid = true;

    // Validate name
    if (!formData.name.trim()) {
      newErrors.name = 'Tên không được để trống';
      isValid = false;
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim() || !emailRegex.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
      isValid = false;
    }

    // Validate password match if password is provided
    if (formData.password && formData.password.length > 0) {
      if (formData.password.length < 6) {
        newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
        isValid = false;
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleUpdate = async () => {
    try {
      if (!validateForm() || !user?.id) return;

      setIsLoading(true);

      // Prepare update data
      const updateData: { name?: string; email?: string; password?: string } = {};
      
      // Only include fields that have values and have changed
      if (formData.name !== user.name) updateData.name = formData.name;
      if (formData.email !== user.email) updateData.email = formData.email;
      if (formData.password) updateData.password = formData.password;

      // Check if any data is being updated
      if (Object.keys(updateData).length === 0) {
        Alert.alert('Thông báo', 'Không có thông tin nào thay đổi');
        setIsLoading(false);
        return;
      }

      // Call API to update user
      const updatedUser = await api.users.update(user.id, updateData);

      // Update local storage and auth context with updated user data
      if (updatedUser) {
        const updatedUserData = {
          ...user,
          name: updatedUser.name || user.name,
          email: updatedUser.email || user.email,
        };
        
        // Update user data in context to reflect changes immediately
        updateUserData(updatedUserData);
        
        // If email changed, user needs to login again
        if (formData.email !== user.email) {
          Alert.alert(
            'Email đã thay đổi',
            'Bạn cần đăng nhập lại với email mới',
            [{ text: 'OK', onPress: () => logout() }]
          );
        } else {
          Alert.alert(
            'Thành công', 
            'Thông tin tài khoản đã được cập nhật',
            [{ 
              text: 'OK', 
              onPress: () => {
                // Reset password fields
                setFormData(prev => ({
                  ...prev,
                  password: '',
                  confirmPassword: '',
                }));
                
                // Navigate back to dashboard
                if (onTabChange) {
                  onTabChange('dashboard');
                }
              }
            }]
          );
        }
      }
    } catch (error: any) {
      console.error('Error updating user:', error);
      Alert.alert('Lỗi', error?.message || 'Đã xảy ra lỗi khi cập nhật thông tin');
    } finally {
      setIsLoading(false);
    }
  };

  const renderAccountSettings = () => {
    return (
      <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
        <Text style={[styles.title, { color: colors.text }]}>Thông Tin Tài Khoản</Text>
        
        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Tên</Text>
          <TextInput
            style={[
              styles.input,
              { 
                backgroundColor: colors.lightGray,
                color: colors.text,
                borderColor: errors.name ? colors.error : colors.separator 
              }
            ]}
            value={formData.name}
            onChangeText={(text) => setFormData({ ...formData, name: text })}
            placeholder="Nhập tên"
            placeholderTextColor={colors.gray}
          />
          {errors.name && <Text style={[styles.errorText, { color: colors.error }]}>{errors.name}</Text>}
        </View>
        
        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Email</Text>
          <TextInput
            style={[
              styles.input,
              { 
                backgroundColor: colors.lightGray,
                color: colors.text,
                borderColor: errors.email ? colors.error : colors.separator 
              }
            ]}
            value={formData.email}
            onChangeText={(text) => setFormData({ ...formData, email: text })}
            placeholder="Nhập email"
            placeholderTextColor={colors.gray}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          {errors.email && <Text style={[styles.errorText, { color: colors.error }]}>{errors.email}</Text>}
        </View>
        
        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Mật khẩu mới</Text>
          <TextInput
            style={[
              styles.input,
              { 
                backgroundColor: colors.lightGray,
                color: colors.text,
                borderColor: errors.password ? colors.error : colors.separator 
              }
            ]}
            value={formData.password}
            onChangeText={(text) => setFormData({ ...formData, password: text })}
            placeholder="Nhập mật khẩu mới (để trống nếu không thay đổi)"
            placeholderTextColor={colors.gray}
            secureTextEntry
          />
          {errors.password && <Text style={[styles.errorText, { color: colors.error }]}>{errors.password}</Text>}
        </View>
        
        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Xác nhận mật khẩu mới</Text>
          <TextInput
            style={[
              styles.input,
              { 
                backgroundColor: colors.lightGray,
                color: colors.text,
                borderColor: errors.confirmPassword ? colors.error : colors.separator 
              }
            ]}
            value={formData.confirmPassword}
            onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
            placeholder="Nhập lại mật khẩu mới"
            placeholderTextColor={colors.gray}
            secureTextEntry
          />
          {errors.confirmPassword && <Text style={[styles.errorText, { color: colors.error }]}>{errors.confirmPassword}</Text>}
        </View>
        
        <TouchableOpacity 
          style={[styles.updateButton, { backgroundColor: colors.primary }]}
          onPress={handleUpdate}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.updateButtonText}>Cập Nhật Thông Tin</Text>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  const renderAppearanceSettings = () => {
    return (
      <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
        <Text style={[styles.title, { color: colors.text }]}>Giao Diện Ứng Dụng</Text>
        
        <TouchableOpacity 
          style={[styles.settingItem, { borderColor: colors.separator }]}
          onPress={toggleTheme}
        >
          <View style={styles.settingContent}>
            <Ionicons 
              name={theme === 'dark' ? 'moon' : 'sunny'} 
              size={22} 
              color={colors.primary} 
              style={styles.settingIcon} 
            />
            <View>
              <Text style={[styles.settingTitle, { color: colors.text }]}>
                Chế độ tối
              </Text>
              <Text style={[styles.settingDescription, { color: colors.gray }]}>
                {theme === 'dark' ? 'Đang bật' : 'Đang tắt'}
              </Text>
            </View>
          </View>
          <Ionicons 
            name="chevron-forward" 
            size={20} 
            color={colors.gray} 
          />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Settings Navigation */}
      <View style={[styles.tabBar, { backgroundColor: colors.cardBackground, borderBottomColor: colors.separator }]}>
        <TouchableOpacity 
          style={[
            styles.tab, 
            activeTab === 'account' && [styles.activeTab, { borderBottomColor: colors.primary }]
          ]}
          onPress={() => setActiveTab('account')}
        >
          <Text 
            style={[
              styles.tabText, 
              { color: activeTab === 'account' ? colors.primary : colors.gray }
            ]}
          >
            Tài khoản
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.tab, 
            activeTab === 'appearance' && [styles.activeTab, { borderBottomColor: colors.primary }]
          ]}
          onPress={() => setActiveTab('appearance')}
        >
          <Text 
            style={[
              styles.tabText, 
              { color: activeTab === 'appearance' ? colors.primary : colors.gray }
            ]}
          >
            Giao diện
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* Content */}
      <ScrollView style={styles.content}>
        {activeTab === 'account' && renderAccountSettings()}
        {activeTab === 'appearance' && renderAppearanceSettings()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    paddingHorizontal: 16,
  },
  tab: {
    paddingVertical: 12,
    marginRight: 16,
  },
  activeTab: {
    borderBottomWidth: 3,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  card: {
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    height: 46,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 14,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
  },
  updateButton: {
    height: 46,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  updateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  settingContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIcon: {
    marginRight: 12,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  settingDescription: {
    fontSize: 14,
    marginTop: 2,
  },
}); 