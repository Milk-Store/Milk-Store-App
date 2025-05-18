import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import AdminOrders from '../components/admin/AdminOrders';
import AdminCategories from '../components/admin/AdminCategories';
import AdminProducts from '../components/admin/AdminProducts';
import AdminDashboard from '../components/admin/AdminDashboard';
import AdminSettings from '../components/admin/AdminSettings';

type AdminTab = 'dashboard' | 'categories' | 'products' | 'orders' | 'settings';

export default function AdminScreen() {
  const router = useRouter();
  const { colors, theme } = useTheme();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      Alert.alert('Thành công', 'Bạn đã đăng xuất thành công');
      router.replace('/');
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Lỗi', 'Đăng xuất thất bại. Vui lòng thử lại.');
    }
  };

  // Hàm chuyển tab cho AdminDashboard
  const handleTabChange = (tab: string) => {
    if (tab === 'products' || tab === 'categories' || tab === 'orders' || tab === 'dashboard' || tab === 'settings') {
      setActiveTab(tab as AdminTab);
    }
  };

  // Render active tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <AdminDashboard onTabChange={handleTabChange} />;
      case 'categories':
        return <AdminCategories />;
      case 'products':
        return <AdminProducts />;
      case 'orders':
        return <AdminOrders />;
      case 'settings':
        return <AdminSettings onTabChange={handleTabChange} />;
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} />
      
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.cardBackground, borderBottomColor: colors.separator }]}>
        <View>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Quản lý cửa hàng
          </Text>
          <Text style={[styles.headerSubtitle, { color: colors.gray }]}>
            {`Xin chào, ${user?.name || 'Admin'}`}
          </Text>
        </View>
        <TouchableOpacity 
          style={[styles.logoutButton, { backgroundColor: colors.background }]}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={22} color={colors.primary} />
        </TouchableOpacity>
      </View>
      
      {/* Main Content */}
      <View style={styles.content}>
        {renderTabContent()}
      </View>
      
      {/* Bottom Navigation */}
      <View style={[styles.bottomNav, { backgroundColor: colors.cardBackground, borderTopColor: colors.separator }]}>
        <TouchableOpacity 
          style={[
            styles.navItem, 
            activeTab === 'dashboard' && [styles.activeNavItem, { borderColor: colors.primary }]
          ]} 
          onPress={() => setActiveTab('dashboard')}
        >
          <Ionicons 
            name="grid-outline" 
            size={22} 
            color={activeTab === 'dashboard' ? colors.primary : colors.gray} 
          />
          <Text 
            style={[
              styles.navText, 
              { color: activeTab === 'dashboard' ? colors.primary : colors.gray }
            ]}
          >
            Tổng quan
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.navItem, 
            activeTab === 'categories' && [styles.activeNavItem, { borderColor: colors.primary }]
          ]} 
          onPress={() => setActiveTab('categories')}
        >
          <Ionicons 
            name="list-outline" 
            size={22} 
            color={activeTab === 'categories' ? colors.primary : colors.gray} 
          />
          <Text 
            style={[
              styles.navText, 
              { color: activeTab === 'categories' ? colors.primary : colors.gray }
            ]}
          >
            Danh mục
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.navItem, 
            activeTab === 'products' && [styles.activeNavItem, { borderColor: colors.primary }]
          ]} 
          onPress={() => setActiveTab('products')}
        >
          <Ionicons 
            name="cube-outline" 
            size={22} 
            color={activeTab === 'products' ? colors.primary : colors.gray} 
          />
          <Text 
            style={[
              styles.navText, 
              { color: activeTab === 'products' ? colors.primary : colors.gray }
            ]}
          >
            Sản phẩm
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.navItem, 
            activeTab === 'orders' && [styles.activeNavItem, { borderColor: colors.primary }]
          ]} 
          onPress={() => setActiveTab('orders')}
        >
          <Ionicons 
            name="receipt-outline" 
            size={22} 
            color={activeTab === 'orders' ? colors.primary : colors.gray} 
          />
          <Text 
            style={[
              styles.navText, 
              { color: activeTab === 'orders' ? colors.primary : colors.gray }
            ]}
          >
            Đơn hàng
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.navItem, 
            activeTab === 'settings' && [styles.activeNavItem, { borderColor: colors.primary }]
          ]} 
          onPress={() => setActiveTab('settings')}
        >
          <Ionicons 
            name="settings-outline" 
            size={22} 
            color={activeTab === 'settings' ? colors.primary : colors.gray} 
          />
          <Text 
            style={[
              styles.navText, 
              { color: activeTab === 'settings' ? colors.primary : colors.gray }
            ]}
          >
            Cài đặt
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  logoutButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  bottomNav: {
    flexDirection: 'row',
    height: 70,
    borderTopWidth: 1,
    paddingBottom: 10,
  },
  navItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 10,
  },
  activeNavItem: {
    borderTopWidth: 3,
  },
  navText: {
    fontSize: 12,
    marginTop: 4,
  },
}); 