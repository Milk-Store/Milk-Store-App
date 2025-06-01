import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
  Dimensions,
  Animated,
  Easing,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import AdminOrders from '../components/admin/AdminOrders';
import AdminCategories from '../components/admin/AdminCategories';
import AdminProducts from '../components/admin/AdminProducts';
import AdminDashboard from '../components/admin/AdminDashboard';
import AdminSettings from '../components/admin/AdminSettings';
import Constants from 'expo-constants';
import { api } from '../services/api';

type AdminTab = 'dashboard' | 'categories' | 'products' | 'orders' | 'settings';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? Constants.statusBarHeight : StatusBar.currentHeight || 0;
const isSmallDevice = SCREEN_HEIGHT < 700;

export default function AdminScreen() {
  const router = useRouter();
  const { colors, theme } = useTheme();
  const { user, logout } = useAuth();
  const { notificationCount, clearNotificationCount } = useNotification();
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const shakeAnimation = useRef(new Animated.Value(0)).current;

  // Shake animation when new notification arrives
  useEffect(() => {
    if (notificationCount > 0) {
      Animated.sequence([
        Animated.timing(shakeAnimation, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
          easing: Easing.linear,
        }),
        Animated.timing(shakeAnimation, {
          toValue: -1,
          duration: 100,
          useNativeDriver: true,
          easing: Easing.linear,
        }),
        Animated.timing(shakeAnimation, {
          toValue: 0.5,
          duration: 100,
          useNativeDriver: true,
          easing: Easing.linear,
        }),
        Animated.timing(shakeAnimation, {
          toValue: -0.5,
          duration: 100,
          useNativeDriver: true,
          easing: Easing.linear,
        }),
        Animated.timing(shakeAnimation, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
          easing: Easing.linear,
        }),
      ]).start();
    }
  }, [notificationCount]);

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
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar 
        barStyle={theme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />
      
      {/* Status Bar Spacer */}
      <View style={[styles.statusBarSpacer, { backgroundColor: colors.cardBackground }]} />
      
      {/* Header */}
      <View style={[styles.header, { 
        backgroundColor: colors.cardBackground, 
        borderBottomColor: colors.separator,
      }]}>
        <View style={styles.headerContent}>
          <View>
            <Text style={[styles.headerTitle, { 
              color: colors.text,
              fontSize: isSmallDevice ? 18 : 20,
            }]}>
              Quản lý cửa hàng
            </Text>
            <Text style={[styles.headerSubtitle, { 
              color: colors.gray,
              fontSize: isSmallDevice ? 12 : 14,
            }]}>
              {`Xin chào, ${user?.name || 'Admin'}`}
            </Text>
          </View>
          <View style={styles.headerActions}>
            <Animated.View
              style={{
                transform: [
                  {
                    rotate: shakeAnimation.interpolate({
                      inputRange: [-1, 1],
                      outputRange: ['-20deg', '20deg']
                    })
                  }
                ]
              }}
            >
              <TouchableOpacity 
                style={[styles.iconButton, { backgroundColor: colors.background }]}
                onPress={() => {
                  // Clear cache for dashboard and orders data
                  api.cache.clearByPattern('/analytics/overview');
                  api.cache.clearByPattern('/orders/admin/list');
                  setActiveTab('orders');
                  clearNotificationCount();
                }}
              >
                <Ionicons 
                  name="notifications-outline" 
                  size={isSmallDevice ? 20 : 22} 
                  color={colors.primary} 
                />
                {notificationCount > 0 && (
                  <View style={[styles.badge, { backgroundColor: colors.error }]}>
                    <Text style={styles.badgeText}>
                      {notificationCount > 99 ? '99+' : notificationCount}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </Animated.View>
            
            <TouchableOpacity 
              style={[styles.iconButton, { backgroundColor: colors.background }]}
              onPress={handleLogout}
            >
              <Ionicons 
                name="log-out-outline" 
                size={isSmallDevice ? 20 : 22} 
                color={colors.primary} 
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
      
      {/* Main Content */}
      <View style={styles.content}>
        {renderTabContent()}
      </View>
      
      {/* Bottom Navigation */}
      <View style={[styles.bottomNav, { 
        backgroundColor: colors.cardBackground, 
        borderTopColor: colors.separator,
        height: Platform.OS === 'ios' ? 80 : 70,
        paddingBottom: Platform.OS === 'ios' ? 20 : 10,
      }]}>
        <TouchableOpacity 
          style={[
            styles.navItem, 
            activeTab === 'dashboard' && [styles.activeNavItem, { borderColor: colors.primary }]
          ]} 
          onPress={() => setActiveTab('dashboard')}
        >
          <Ionicons 
            name="grid-outline" 
            size={isSmallDevice ? 20 : 22} 
            color={activeTab === 'dashboard' ? colors.primary : colors.gray} 
          />
          <Text 
            style={[
              styles.navText, 
              { 
                color: activeTab === 'dashboard' ? colors.primary : colors.gray,
                fontSize: isSmallDevice ? 11 : 12,
              }
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
            size={isSmallDevice ? 20 : 22} 
            color={activeTab === 'categories' ? colors.primary : colors.gray} 
          />
          <Text 
            style={[
              styles.navText, 
              { 
                color: activeTab === 'categories' ? colors.primary : colors.gray,
                fontSize: isSmallDevice ? 11 : 12,
              }
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
            size={isSmallDevice ? 20 : 22} 
            color={activeTab === 'products' ? colors.primary : colors.gray} 
          />
          <Text 
            style={[
              styles.navText, 
              { 
                color: activeTab === 'products' ? colors.primary : colors.gray,
                fontSize: isSmallDevice ? 11 : 12,
              }
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
            size={isSmallDevice ? 20 : 22} 
            color={activeTab === 'orders' ? colors.primary : colors.gray} 
          />
          <Text 
            style={[
              styles.navText, 
              { 
                color: activeTab === 'orders' ? colors.primary : colors.gray,
                fontSize: isSmallDevice ? 11 : 12,
              }
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
            size={isSmallDevice ? 20 : 22} 
            color={activeTab === 'settings' ? colors.primary : colors.gray} 
          />
          <Text 
            style={[
              styles.navText, 
              { 
                color: activeTab === 'settings' ? colors.primary : colors.gray,
                fontSize: isSmallDevice ? 11 : 12,
              }
            ]}
          >
            Cài đặt
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  statusBarSpacer: {
    height: STATUSBAR_HEIGHT,
  },
  header: {
    borderBottomWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: isSmallDevice ? 12 : 16,
  },
  headerTitle: {
    fontWeight: 'bold',
  },
  headerSubtitle: {
    marginTop: 4,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    width: isSmallDevice ? 32 : 36,
    height: isSmallDevice ? 32 : 36,
    borderRadius: isSmallDevice ? 16 : 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -5,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  bottomNav: {
    flexDirection: 'row',
    borderTopWidth: 1,
  },
  navItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: isSmallDevice ? 8 : 10,
  },
  activeNavItem: {
    borderTopWidth: 3,
  },
  navText: {
    marginTop: 4,
  },
}); 