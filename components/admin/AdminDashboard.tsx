import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { formatCurrency } from '../../utils/format';
import { api } from '../../services/api';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';

export default function AdminDashboard({ onTabChange }: { onTabChange?: (tab: string) => void }) {
  const { colors } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    pendingOrders: 0,
  });

  // Filter states
  const [filterType, setFilterType] = useState<'year' | 'date'>('year');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [fromDate, setFromDate] = useState(new Date());
  const [toDate, setToDate] = useState(new Date());
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);

  // Generate year options (last 5 years)
  const years = Array.from(
    { length: 5 },
    (_, i) => new Date().getFullYear() - i
  );

  useEffect(() => {
    // Clear cache before fetching new data
    api.cache.clearByPattern('/analytics/overview');
    fetchDashboardData();
  }, [filterType, selectedYear, fromDate, toDate]);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      let params = {};
      if (filterType === 'year') {
        params = { year: selectedYear };
      } else {
        params = {
          fromDate: fromDate.toISOString().split('T')[0],
          toDate: toDate.toISOString().split('T')[0],
        };
      }

      const data = await api.analytics.getDashboardOverview(params);
      setStats(data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDateChange = (
    event: Event | any,
    selectedDate: Date | undefined,
    type: 'from' | 'to' = 'from'
  ) => {
    if (Platform.OS === 'android') {
      setShowFromPicker(false);
      setShowToPicker(false);
    }

    if (selectedDate) {
      if (type === 'from') {
        setFromDate(selectedDate);
      } else {
        setToDate(selectedDate);
      }
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

      {/* Filter Controls */}
      <View style={[styles.filterContainer, { backgroundColor: colors.cardBackground }]}>
        <View style={styles.filterTypeContainer}>
          <TouchableOpacity
            style={[
              styles.filterTypeButton,
              { backgroundColor: filterType === 'year' ? colors.primary : 'transparent' }
            ]}
            onPress={() => setFilterType('year')}
          >
            <Text style={{ color: filterType === 'year' ? 'white' : colors.text }}>Theo năm</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterTypeButton,
              { backgroundColor: filterType === 'date' ? colors.primary : 'transparent' }
            ]}
            onPress={() => setFilterType('date')}
          >
            <Text style={{ color: filterType === 'date' ? 'white' : colors.text }}>Theo ngày</Text>
          </TouchableOpacity>
        </View>

        {filterType === 'year' ? (
          <View style={styles.yearPickerContainer}>
            <Picker
              selectedValue={selectedYear}
              onValueChange={(itemValue: number) => setSelectedYear(itemValue)}
              style={[styles.yearPicker, { color: colors.text }]}
            >
              {years.map(year => (
                <Picker.Item key={year} label={year.toString()} value={year} />
              ))}
            </Picker>
          </View>
        ) : (
          <View style={styles.datePickerContainer}>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowFromPicker(true)}
            >
              <Text style={{ color: colors.text }}>
                Từ: {fromDate.toLocaleDateString()}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowToPicker(true)}
            >
              <Text style={{ color: colors.text }}>
                Đến: {toDate.toLocaleDateString()}
              </Text>
            </TouchableOpacity>

            {(showFromPicker || showToPicker) && (
              <DateTimePicker
                value={showFromPicker ? fromDate : toDate}
                mode="date"
                display="default"
                onChange={(event, date) => 
                  handleDateChange(event, date, showFromPicker ? 'from' : 'to')
                }
              />
            )}
          </View>
        )}
      </View>

      {/* Summary Cards */}
      <View style={styles.cardRow}>
        <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
          <View style={[styles.iconCircle, { backgroundColor: `${colors.primary}20` }]}>
            <Ionicons name="cash-outline" size={22} color={colors.primary} />
          </View>
          <Text style={[styles.cardValue, { color: colors.text }]}>
            {formatCurrency(stats.totalRevenue)}
          </Text>
          <Text style={[styles.cardLabel, { color: colors.gray }]}>Doanh thu</Text>
        </View>

        <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
          <View style={[styles.iconCircle, { backgroundColor: `${colors.accent}20` }]}>
            <Ionicons name="receipt-outline" size={22} color={colors.accent} />
          </View>
          <Text style={[styles.cardValue, { color: colors.text }]}>{stats.totalOrders}</Text>
          <Text style={[styles.cardLabel, { color: colors.gray }]}>Tổng đơn hàng</Text>
        </View>
      </View>

      <View style={styles.cardRow}>
        <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
          <View style={[styles.iconCircle, { backgroundColor: '#4CD96420' }]}>
            <Ionicons name="cube-outline" size={22} color="#4CD964" />
          </View>
          <Text style={[styles.cardValue, { color: colors.text }]}>{stats.totalProducts}</Text>
          <Text style={[styles.cardLabel, { color: colors.gray }]}>Tổng sản phẩm</Text>
        </View>

        <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
          <View style={[styles.iconCircle, { backgroundColor: '#FF980020' }]}>
            <Ionicons name="time-outline" size={22} color="#FF9800" />
          </View>
          <Text style={[styles.cardValue, { color: colors.text }]}>
            {stats.pendingOrders}
          </Text>
          <Text style={[styles.cardLabel, { color: colors.gray }]}>Đơn chờ xử lý</Text>
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
            onPress={() => onTabChange?.('products')}
          >
            <Ionicons name="cube-outline" size={24} color={colors.primary} />
            <Text style={[styles.actionText, { color: colors.text }]}>Quản lý sản phẩm</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: colors.cardBackground }]}
            onPress={() => onTabChange?.('categories')}
          >
            <Ionicons name="folder-outline" size={24} color={colors.primary} />
            <Text style={[styles.actionText, { color: colors.text }]}>Quản lý danh mục</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.actionRow}>
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: colors.cardBackground }]}
            onPress={() => onTabChange?.('orders')}
          >
            <Ionicons name="receipt-outline" size={24} color={colors.primary} />
            <Text style={[styles.actionText, { color: colors.text }]}>Quản lý đơn hàng</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: colors.cardBackground }]}
            onPress={() => onTabChange?.('settings')}
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
  filterContainer: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  filterTypeContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  filterTypeButton: {
    flex: 1,
    padding: 8,
    alignItems: 'center',
    borderRadius: 8,
    marginHorizontal: 4,
  },
  yearPickerContainer: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  yearPicker: {
    height: 50,
  },
  datePickerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dateButton: {
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
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