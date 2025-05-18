import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { formatCurrency, formatDateTime } from '../../utils/format';
import { api } from '../../services/api';
import Button from '../ui/Button';

// Order type definition
type OrderStatus = 'pending' | 'processing' | 'completed' | 'cancelled';

// API response types
interface OrderItemAPI {
  product: {
    id: string | number;
    name: string;
    price: string | number;
  };
  quantity: number;
}

interface OrderAPI {
  id: string | number;
  phone: string;
  customer_name?: string;
  address?: string;
  orderItems: OrderItemAPI[];
  total?: string | number;
  status?: string;
  createdAt?: string;
}

type Order = {
  id: string;
  customer: {
    phone: string;
    name?: string;
    address?: string;
  };
  items: Array<{
    product: {
      id: string;
      name: string;
      price: number;
    };
    quantity: number;
  }>;
  totalAmount: number;
  status: OrderStatus;
  createdAt: string;
};

export default function AdminOrders() {
  const { colors } = useTheme();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filter, setFilter] = useState<OrderStatus | 'all'>('all');
  
  const fetchOrders = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await api.orders.getAll();
      
      // Chuyển đổi dữ liệu từ API sang định dạng Order
      const formattedOrders: Order[] = Array.isArray(data) ? data.map((order: OrderAPI) => ({
        id: order.id.toString(),
        customer: {
          phone: order.phone || '',
          name: order.customer_name || '',
          address: order.address || '',
        },
        items: Array.isArray(order.orderItems) ? order.orderItems.map((item: OrderItemAPI) => ({
          product: {
            id: item.product.id.toString(),
            name: item.product.name,
            price: parseFloat(item.product.price.toString()),
          },
          quantity: item.quantity,
        })) : [],
        totalAmount: order.total ? parseFloat(order.total.toString()) : 0,
        status: (order.status || 'pending') as OrderStatus,
        createdAt: order.createdAt || new Date().toISOString(),
      })) : [];
      
      setOrders(formattedOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách đơn hàng');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update order status
  const handleUpdateStatus = useCallback(async (orderId: string, newStatus: OrderStatus) => {
    try {
      await api.orders.update(orderId, newStatus);
      
      // Update local state to reflect change
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId 
            ? { ...order, status: newStatus }
            : order
        )
      );
      
      Alert.alert('Thành công', 'Đã cập nhật trạng thái đơn hàng');
    } catch (error) {
      console.error('Error updating order status:', error);
      Alert.alert('Lỗi', 'Không thể cập nhật trạng thái đơn hàng');
    }
  }, []);

  // Handle status change action
  const showStatusOptions = (order: Order) => {
    const statusOptions: OrderStatus[] = ['pending', 'processing', 'completed', 'cancelled'];
    
    Alert.alert(
      'Cập nhật trạng thái',
      'Chọn trạng thái mới cho đơn hàng:',
      statusOptions.map(status => ({
        text: getStatusLabel(status),
        onPress: () => handleUpdateStatus(order.id, status),
        style: status === 'cancelled' ? 'destructive' : 'default',
      })),
      { cancelable: true }
    );
  };

  // Handle refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchOrders();
    setIsRefreshing(false);
  };

  // Get human-readable status label
  const getStatusLabel = (status: OrderStatus): string => {
    switch (status) {
      case 'pending': return 'Chờ xử lý';
      case 'processing': return 'Đang xử lý';
      case 'completed': return 'Hoàn thành';
      case 'cancelled': return 'Đã hủy';
      default: return status;
    }
  };

  // Get status color
  const getStatusColor = (status: OrderStatus): string => {
    switch (status) {
      case 'pending': return colors.primary;
      case 'processing': return '#FFA500'; // Orange
      case 'completed': return '#4CD964'; // Green
      case 'cancelled': return colors.error;
      default: return colors.text;
    }
  };

  // Filter orders
  const filteredOrders = filter === 'all' 
    ? orders 
    : orders.filter(order => order.status === filter);

  // Fetch orders on mount
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Render order item
  const renderOrderItem = ({ item }: { item: Order }) => (
    <View 
      style={[
        styles.orderItem, 
        { backgroundColor: colors.cardBackground, borderColor: colors.separator }
      ]}
    >
      <View style={styles.orderHeader}>
        <View>
          <Text style={[styles.orderId, { color: colors.text }]}>
            {`Đơn hàng #${item.id}`}
          </Text>
          <Text style={[styles.orderDate, { color: colors.gray }]}>
            {formatDateTime(item.createdAt)}
          </Text>
        </View>
        <TouchableOpacity 
          style={[
            styles.statusBadge, 
            { backgroundColor: `${getStatusColor(item.status)}20` }
          ]}
          onPress={() => showStatusOptions(item)}
        >
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {getStatusLabel(item.status)}
          </Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.customerInfo}>
        <Text style={[styles.customerName, { color: colors.text }]}>
          {item.customer.name || 'Khách hàng'}
        </Text>
        <Text style={[styles.customerPhone, { color: colors.text }]}>
          {item.customer.phone}
        </Text>
        {item.customer.address && (
          <Text style={[styles.customerAddress, { color: colors.text }]}>
            {item.customer.address}
          </Text>
        )}
      </View>
      
      <View style={[styles.divider, { backgroundColor: colors.separator }]} />
      
      <View>
        {item.items.map((orderItem, index) => (
          <View key={index} style={styles.productItem}>
            <View style={styles.productInfo}>
              <Text 
                style={[styles.productName, { color: colors.text }]}
                numberOfLines={1}
              >
                {orderItem.product.name}
              </Text>
              <Text style={[styles.productMeta, { color: colors.gray }]}>
                {`${formatCurrency(orderItem.product.price)} x ${orderItem.quantity}`}
              </Text>
            </View>
            <Text style={[styles.productTotal, { color: colors.text }]}>
              {formatCurrency(orderItem.product.price * orderItem.quantity)}
            </Text>
          </View>
        ))}
      </View>
      
      <View style={[styles.divider, { backgroundColor: colors.separator }]} />
      
      <View style={styles.totalContainer}>
        <Text style={[styles.totalLabel, { color: colors.text }]}>Tổng cộng:</Text>
        <Text style={[styles.totalAmount, { color: colors.primary }]}>
          {formatCurrency(item.totalAmount)}
        </Text>
      </View>
      
      {item.status === 'pending' && (
        <View style={styles.actionButtons}>
          <Button
            title="Xử lý đơn hàng"
            onPress={() => handleUpdateStatus(item.id, 'processing')}
            variant="primary"
            size="small"
            style={styles.actionButton}
          />
          <Button
            title="Hủy đơn hàng"
            onPress={() => handleUpdateStatus(item.id, 'cancelled')}
            variant="outline"
            size="small"
            style={styles.actionButton}
          />
        </View>
      )}
      
      {item.status === 'processing' && (
        <Button
          title="Đánh dấu hoàn thành"
          onPress={() => handleUpdateStatus(item.id, 'completed')}
          variant="primary"
          fullWidth
        />
      )}
    </View>
  );

  // Render empty list
  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="receipt-outline" size={60} color={colors.gray} />
      <Text style={[styles.emptyText, { color: colors.text }]}>
        {isLoading ? 'Đang tải đơn hàng...' : 'Không tìm thấy đơn hàng nào'}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Đơn hàng</Text>
      </View>
      
      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <ScrollableFilter 
          items={[
            { id: 'all', label: 'Tất cả' },
            { id: 'pending', label: 'Chờ xử lý' },
            { id: 'processing', label: 'Đang xử lý' },
            { id: 'completed', label: 'Hoàn thành' },
            { id: 'cancelled', label: 'Đã hủy' },
          ]}
          selectedId={filter}
          onSelect={(id) => setFilter(id as OrderStatus | 'all')}
          colors={colors}
        />
      </View>
      
      {isLoading && !isRefreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredOrders}
          renderItem={renderOrderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          ListEmptyComponent={renderEmptyList}
        />
      )}
    </View>
  );
}

// Scrollable Filter Component
type FilterItem = {
  id: string;
  label: string;
};

const ScrollableFilter = ({ 
  items, 
  selectedId, 
  onSelect, 
  colors 
}: { 
  items: FilterItem[];
  selectedId: string;
  onSelect: (id: string) => void;
  colors: any;
}) => {
  return (
    <FlatList
      data={items}
      horizontal
      showsHorizontalScrollIndicator={false}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.filterList}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={[
            styles.filterItem,
            selectedId === item.id && [styles.filterItemActive, { borderColor: colors.primary }],
            { backgroundColor: selectedId === item.id ? `${colors.primary}20` : colors.cardBackground }
          ]}
          onPress={() => onSelect(item.id)}
        >
          <Text 
            style={[
              styles.filterText, 
              { color: selectedId === item.id ? colors.primary : colors.text }
            ]}
          >
            {item.label}
          </Text>
        </TouchableOpacity>
      )}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  filterContainer: {
    marginBottom: 16,
  },
  filterList: {
    paddingVertical: 8,
  },
  filterItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  filterItemActive: {
    borderWidth: 1,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
  },
  listContent: {
    paddingBottom: 16,
  },
  orderItem: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  orderId: {
    fontSize: 16,
    fontWeight: '600',
  },
  orderDate: {
    fontSize: 12,
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  customerInfo: {
    marginBottom: 12,
  },
  customerName: {
    fontSize: 15,
    fontWeight: '500',
  },
  customerPhone: {
    fontSize: 14,
    marginTop: 2,
  },
  customerAddress: {
    fontSize: 14,
    marginTop: 2,
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  productItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  productInfo: {
    flex: 1,
    marginRight: 8,
  },
  productName: {
    fontSize: 14,
  },
  productMeta: {
    fontSize: 12,
    marginTop: 2,
  },
  productTotal: {
    fontSize: 14,
    fontWeight: '500',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  actionButtons: {
    flexDirection: 'row',
    marginTop: 16,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
  },
}); 