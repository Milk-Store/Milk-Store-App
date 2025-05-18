import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { formatCurrency } from '../../utils/format';
import { api } from '../../services/api';

export default function AdminDashboard({ onTabChange }: { onTabChange?: (tab: string) => void }) {
  const { colors } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalCategories: 0,
    totalOrders: 0,
    totalRevenue: 0,
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      // Fetch data từ API thực tế
      const [products, categories, orders] = await Promise.all([
        api.products.getAll().catch(() => []),
        api.categories.getAll().catch(() => []),
        api.orders.getAll().catch(() => [])
      ]);
      
      // Tính tổng doanh thu từ đơn hàng (nếu API trả về)
      let revenue = 0;
      if (orders && Array.isArray(orders)) {
        // Giả sử orders có cấu trúc có trường totalAmount
        orders.forEach((order: any) => {
          if (order.totalAmount) {
            revenue += order.totalAmount;
          }
        });
      }
      
      setStats({
        totalProducts: Array.isArray(products) ? products.length : 0,
        totalCategories: Array.isArray(categories) ? categories.length : 0,
        totalOrders: Array.isArray(orders) ? orders.length : 0,
        totalRevenue: revenue || 0,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Hàm xử lý chuyển tab
  const handleNavigateToTab = (tab: string) => {
    if (onTabChange) {
      onTabChange(tab);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        Bảng điều khiển
      </Text>

      {/* Summary Cards */}
      <View style={styles.cardRow}>
        <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
          <View style={[styles.iconCircle, { backgroundColor: `${colors.primary}20` }]}>
            <Ionicons name="cube-outline" size={22} color={colors.primary} />
          </View>
          <Text style={[styles.cardValue, { color: colors.text }]}>{stats.totalProducts}</Text>
          <Text style={[styles.cardLabel, { color: colors.gray }]}>Sản phẩm</Text>
        </View>

        <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
          <View style={[styles.iconCircle, { backgroundColor: `${colors.accent}20` }]}>
            <Ionicons name="list-outline" size={22} color={colors.accent} />
          </View>
          <Text style={[styles.cardValue, { color: colors.text }]}>{stats.totalCategories}</Text>
          <Text style={[styles.cardLabel, { color: colors.gray }]}>Danh mục</Text>
        </View>
      </View>

      <View style={styles.cardRow}>
        <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
          <View style={[styles.iconCircle, { backgroundColor: '#4CD96420' }]}>
            <Ionicons name="receipt-outline" size={22} color="#4CD964" />
          </View>
          <Text style={[styles.cardValue, { color: colors.text }]}>{stats.totalOrders}</Text>
          <Text style={[styles.cardLabel, { color: colors.gray }]}>Tổng đơn hàng</Text>
        </View>

        <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
          <View style={[styles.iconCircle, { backgroundColor: '#FF980020' }]}>
            <Ionicons name="cash-outline" size={22} color="#FF9800" />
          </View>
          <Text style={[styles.cardValue, { color: colors.text }]}>
            {formatCurrency(stats.totalRevenue)}
          </Text>
          <Text style={[styles.cardLabel, { color: colors.gray }]}>Doanh thu</Text>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.actionsContainer}>
        <Text style={[styles.sectionSubtitle, { color: colors.text }]}>
          Truy cập nhanh
        </Text>
        
        <View style={styles.actionRow}>
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: colors.cardBackground }]}
            onPress={() => handleNavigateToTab('products')}
          >
            <Ionicons name="cube-outline" size={24} color={colors.primary} />
            <Text style={[styles.actionText, { color: colors.text }]}>Quản lý sản phẩm</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: colors.cardBackground }]}
            onPress={() => handleNavigateToTab('categories')}
          >
            <Ionicons name="folder-outline" size={24} color={colors.primary} />
            <Text style={[styles.actionText, { color: colors.text }]}>Quản lý danh mục</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.actionRow}>
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: colors.cardBackground }]}
            onPress={() => handleNavigateToTab('orders')}
          >
            <Ionicons name="receipt-outline" size={24} color={colors.primary} />
            <Text style={[styles.actionText, { color: colors.text }]}>Quản lý đơn hàng</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: colors.cardBackground }]}
            onPress={() => handleNavigateToTab('settings')}
          >
            <Ionicons name="settings-outline" size={24} color={colors.primary} />
            <Text style={[styles.actionText, { color: colors.text }]}>Cài đặt</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  sectionSubtitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    marginTop: 8,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  card: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  cardLabel: {
    fontSize: 14,
  },
  actionsContainer: {
    marginTop: 16,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  actionText: {
    marginLeft: 12,
    fontSize: 14,
    fontWeight: '500',
  },
}); 