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
import Pagination from '../ui/Pagination';

// Order type definition
type OrderStatus = 'pending' | 'processing' | 'completed' | 'cancelled';

// API response types
interface OrderItemAPI {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  product: {
    id: number;
    name: string;
    price: string | number;
    description?: string;
    image?: string;
  };
}

interface OrderAPI {
  id: number;
  phone: string;
  name?: string;
  address?: string;
  orderItems: OrderItemAPI[];
  total: string | number;
  status: string;
  createdAt: string;
}

interface PaginationData {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

interface OrdersResponse {
  orders: OrderAPI[];
  pagination: PaginationData;
}

interface Order {
  id: number;
  customer: {
    phone: string;
    name?: string;
    address?: string;
  };
  items: Array<{
    product: {
      id: number;
      name: string;
      price: number;
    };
    quantity: number;
  }>;
  totalAmount: number;
  status: OrderStatus;
  createdAt: string;
}

export default function AdminOrders() {
  const { colors } = useTheme();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filter, setFilter] = useState<OrderStatus | 'all'>('all');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [paginationInfo, setPaginationInfo] = useState<PaginationData | null>(null);
  
  const fetchOrders = useCallback(async (pageNumber: number = 1) => {
    try {
      setIsLoading(true);
      const response = await api.orders.getAll(pageNumber);
      console.log('Raw API Response:', response);
      
      if (!response || !response.orders) {
        throw new Error('Invalid data format received from API');
      }

      // Lấy thông tin phân trang
      setPaginationInfo({
        currentPage: response.pagination.currentPage,
        totalPages: response.pagination.totalPages,
        totalItems: response.pagination.totalItems,
        itemsPerPage: response.pagination.itemsPerPage
      });
      
      setHasMore(response.pagination.currentPage < response.pagination.totalPages);

      // Chuyển đổi dữ liệu từ API sang định dạng Order
      const formattedOrders: Order[] = response.orders.map((order: OrderAPI) => {
        if (!order) {
          console.error('Null order found in API response');
          return null;
        }

        return {
          id: order.id,
          customer: {
            phone: order.phone || '',
            name: order.name || '',
            address: order.address,
          },
          items: (order.orderItems || []).map((item: OrderItemAPI) => {
            if (!item || !item.product) {
              console.error('Invalid order item or missing product:', item);
              return null;
            }

            return {
              product: {
                id: item.product.id,
                name: item.product.name || '',
                price: parseFloat(item.product.price?.toString() || '0'),
              },
              quantity: item.quantity || 0,
            };
          }).filter(Boolean),
          totalAmount: parseFloat(order.total?.toString() || '0'),
          status: (order.status || 'pending') as OrderStatus,
          createdAt: order.createdAt || new Date().toISOString(),
        };
      }).filter(Boolean);

      // Cập nhật danh sách orders - thay thế hoàn toàn danh sách cũ
      setOrders(formattedOrders);
      setPage(pageNumber);
    } catch (error) {
      console.error('Error fetching orders:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách đơn hàng');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleUpdateStatus = useCallback(async (orderId: number, newStatus: OrderStatus) => {
    try {
      await api.orders.update(orderId.toString(), newStatus);
      
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

  const handleLoadMore = useCallback(() => {
    if (!isLoading && hasMore) {
      fetchOrders(page + 1);
    }
  }, [isLoading, hasMore, page, fetchOrders]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchOrders(1);
    setIsRefreshing(false);
  };

  const getStatusLabel = (status: OrderStatus): string => {
    switch (status) {
      case 'pending': return 'Chờ xử lý';
      case 'processing': return 'Đang xử lý';
      case 'completed': return 'Hoàn thành';
      case 'cancelled': return 'Đã hủy';
      default: return status;
    }
  };

  const getStatusColor = (status: OrderStatus): string => {
    switch (status) {
      case 'pending': return colors.primary;
      case 'processing': return '#FFA500';
      case 'completed': return '#4CD964';
      case 'cancelled': return colors.error;
      default: return colors.text;
    }
  };

  const filteredOrders = filter === 'all' 
    ? orders 
    : orders.filter(order => order.status === filter);

  useEffect(() => {
    // Clear cache before fetching new data
    api.cache.clearByPattern('/orders/admin/list');
    fetchOrders();
  }, [fetchOrders]);

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
          keyExtractor={(item) => item.id.toString()}
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
          ListFooterComponent={() => (
            <View style={styles.footerContainer}>
              {isLoading && !isRefreshing ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : filteredOrders.length > 0 ? (
                <Text style={[styles.footerText, { color: colors.gray }]}>
                  --- Đã hiển thị hết {filteredOrders.length} đơn hàng của trang {paginationInfo?.currentPage} ---
                </Text>
              ) : null}
            </View>
          )}
        />
      )}
      
      {paginationInfo && (
        <Pagination
          currentPage={paginationInfo.currentPage}
          totalPages={paginationInfo.totalPages}
          totalItems={paginationInfo.totalItems}
          onPageChange={fetchOrders}
          colors={colors}
        />
      )}
    </View>
  );
}

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
  footerContainer: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    fontStyle: 'italic',
  },
}); 