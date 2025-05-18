import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useCart } from '../contexts/CartContext';
import { CartItem } from '../contexts/CartContext';
import { formatCurrency } from '../utils/format';
import Button from '../components/ui/Button';
import { api } from '../services/api';
import { MainLayout } from '../layouts';

export default function CartScreen() {
  const router = useRouter();
  const { colors, theme } = useTheme();
  const { cart, removeFromCart, updateQuantity, clearCart } = useCart();
  
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Check if cart is empty
  const isCartEmpty = useMemo(() => cart.items.length === 0, [cart.items]);
  
  // Handle checkout
  const handleCheckout = async () => {
    if (!phone.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập số điện thoại để tiếp tục.');
      return;
    }
    
    if (isCartEmpty) {
      Alert.alert('Thông báo', 'Giỏ hàng của bạn đang trống.');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      const orderData = {
        phone: phone.trim(),
        items: cart.items.map(item => ({
          product_id: item.product.id,
          quantity: item.quantity
        })),
        total: cart.total
      };
      
      // Call API to create order
      await api.orders.create(orderData as any);
      
      // Clear cart after successful order
      clearCart();
      
      // Show success message
      Alert.alert(
        'Đặt hàng thành công',
        'Cảm ơn bạn đã đặt hàng! Chúng tôi sẽ liên hệ với bạn sớm nhất có thể.',
        [{ text: 'OK', onPress: () => router.replace('/') }]
      );
    } catch (error) {
      console.error('Checkout error:', error);
      Alert.alert(
        'Lỗi',
        'Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại sau.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle back navigation
  const handleBack = () => {
    router.back();
  };
  
  // Handle quantity change
  const handleChangeQuantity = (id: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      // Show confirmation dialog before removing item
      Alert.alert(
        'Xác nhận',
        'Bạn có muốn xóa sản phẩm này khỏi giỏ hàng?',
        [
          { text: 'Hủy', style: 'cancel' },
          { text: 'Xóa', onPress: () => removeFromCart(id) }
        ]
      );
    } else {
      updateQuantity(id, newQuantity);
    }
  };
  
  // Render empty cart
  const renderEmptyCart = () => (
    <View style={styles.emptyCartContainer}>
      <Ionicons name="cart-outline" size={60} color={colors.gray} />
      <Text style={[styles.emptyCartText, { color: colors.text }]}>
        Giỏ hàng của bạn đang trống
      </Text>
      <Button
        title="Tiếp tục mua sắm"
        onPress={() => router.replace('/')}
        variant="primary"
        style={styles.shopButton}
      />
    </View>
  );
  
  // Render a cart item
  const renderItem = ({ item }: { item: CartItem }) => (
    <View 
      style={[
        styles.cartItem, 
        { backgroundColor: colors.cardBackground, borderColor: colors.separator }
      ]}
    >
      <Image 
        source={{ uri: item.product.image }} 
        style={styles.productImage} 
      />
      
      <View style={styles.productInfo}>
        <View style={styles.productDetails}>
          <Text 
            style={[styles.productName, { color: colors.text }]}
            numberOfLines={2}
          >
            {item.product.name}
          </Text>
          <Text style={[styles.productPrice, { color: colors.primary }]}>
            {formatCurrency(item.product.price)}
          </Text>
        </View>
        
        <View style={styles.quantityContainer}>
          <TouchableOpacity
            onPress={() => handleChangeQuantity(item.product.id, item.quantity - 1)}
            style={[styles.quantityBtn, { borderColor: colors.separator }]}
          >
            <Ionicons name="remove" size={16} color={colors.text} />
          </TouchableOpacity>
          
          <Text style={[styles.quantity, { color: colors.text }]}>
            {item.quantity}
          </Text>
          
          <TouchableOpacity
            onPress={() => handleChangeQuantity(item.product.id, item.quantity + 1)}
            style={[styles.quantityBtn, { borderColor: colors.separator }]}
          >
            <Ionicons name="add" size={16} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>
      
      <TouchableOpacity
        onPress={() => removeFromCart(item.product.id)}
        style={styles.removeBtn}
      >
        <Ionicons name="close-circle" size={24} color={colors.error} />
      </TouchableOpacity>
    </View>
  );
  
  return (
    <MainLayout
      showBackButton={true}
      showLogo={false}
      showCart={false}
      showSearch={false}
      title="Giỏ hàng"
      onBackPress={handleBack}
      scrollEnabled={false}
    >
      {isCartEmpty ? (
        renderEmptyCart()
      ) : (
        <FlatList
          data={cart.items}
          renderItem={renderItem}
          keyExtractor={(item) => item.product.id}
          contentContainerStyle={styles.cartList}
          showsVerticalScrollIndicator={false}
        />
      )}
      
      {!isCartEmpty && (
        <View style={[styles.bottomContainer, { borderTopColor: colors.separator }]}>
          {/* Customer Information */}
          <View style={styles.customerInfoContainer}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Thông tin đặt hàng
            </Text>
            
            <View style={[styles.inputContainer, { borderColor: colors.separator, backgroundColor: colors.cardBackground }]}>
              <TextInput
                placeholder="Số điện thoại *"
                value={phone}
                onChangeText={setPhone}
                style={[styles.input, { color: colors.text }]}
                placeholderTextColor={colors.gray}
                keyboardType="phone-pad"
              />
            </View>
          </View>
          
          {/* Order Summary */}
          <View style={styles.summaryContainer}>
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: colors.text }]}>
                Tổng số sản phẩm:
              </Text>
              <Text style={[styles.summaryValue, { color: colors.text }]}>
                {cart.items.reduce((sum, item) => sum + item.quantity, 0)}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: colors.text }]}>
                Tổng tiền:
              </Text>
              <Text style={[styles.summaryValue, { color: colors.primary, fontWeight: 'bold' }]}>
                {formatCurrency(cart.total)}
              </Text>
            </View>
          </View>
          
          {/* Checkout Button */}
          <Button
            title="Đặt hàng"
            onPress={handleCheckout}
            variant="primary"
            size="large"
            fullWidth
            loading={isSubmitting}
          />
        </View>
      )}
    </MainLayout>
  );
}

const styles = StyleSheet.create({
  emptyCartContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyCartText: {
    fontSize: 16,
    marginTop: 16,
    marginBottom: 24,
  },
  shopButton: {
    minWidth: 160,
  },
  cartList: {
    padding: 16,
  },
  cartItem: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#F0F0F0',
  },
  productInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  productDetails: {
    flex: 1,
  },
  productName: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: '600',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  quantityBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantity: {
    fontSize: 14,
    fontWeight: '500',
    marginHorizontal: 8,
    minWidth: 20,
    textAlign: 'center',
  },
  removeBtn: {
    padding: 4,
  },
  bottomContainer: {
    padding: 16,
    borderTopWidth: 1,
  },
  customerInfoContainer: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  inputContainer: {
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 12,
  },
  input: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  summaryContainer: {
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
  },
  summaryValue: {
    fontSize: 14,
  },
}); 