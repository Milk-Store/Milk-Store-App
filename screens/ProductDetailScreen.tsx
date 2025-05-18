import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useCart } from '../contexts/CartContext';
import { Product } from '../contexts/CartContext';
import { api } from '../services/api';
import { formatCurrency } from '../utils/format';
import Button from '../components/ui/Button';
import { MainLayout } from '../layouts';

export default function ProductDetailScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const { colors, theme } = useTheme();
  const { addToCart } = useCart();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categoryName, setCategoryName] = useState<string>('');
  
  const productId = params.id as string;
  
  const fetchProductDetails = useCallback(async () => {
    if (!productId) {
      setError('Không tìm thấy sản phẩm');
      setIsLoading(false);
      return;
    }
    
    try {
      setIsLoading(true);
      const data = await api.products.getById(productId);
      setProduct(data);
      
      // Lấy thông tin tên danh mục
      if (data.category_id && data.category_id !== 'all') {
        try {
          const categories = await api.categories.getAll();
          const category = categories.find((cat: {id: string; name: string}) => cat.id === data.category_id);
          if (category) {
            setCategoryName(category.name);
          }
        } catch (error) {
          console.error('Error fetching category name:', error);
        }
      }
    } catch (error) {
      console.error('Error fetching product details:', error);
      setError('Không thể tải thông tin sản phẩm');
    } finally {
      setIsLoading(false);
    }
  }, [productId]);
  
  useEffect(() => {
    fetchProductDetails();
  }, [fetchProductDetails]);
  
  const handleBack = () => {
    router.back();
  };
  
  const handleIncreaseQuantity = () => {
    setQuantity(prev => prev + 1);
  };
  
  const handleDecreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };
  
  const handleAddToCart = () => {
    if (product) {
      addToCart({ product, quantity });
      router.push('/cart');
    }
  };

  const handleCartPress = () => {
    router.push('/cart');
  };
  
  if (isLoading) {
    return (
      <MainLayout
        showBackButton={true}
        showLogo={false}
        showCart={true}
        onBackPress={handleBack}
        onCartPress={handleCartPress}
        scrollEnabled={false}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </MainLayout>
    );
  }
  
  if (error || !product) {
    return (
      <MainLayout
        showBackButton={true}
        showLogo={false}
        showCart={true}
        onBackPress={handleBack}
        onCartPress={handleCartPress}
        scrollEnabled={false}
      >
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: colors.error }]}>{error || 'Lỗi không xác định'}</Text>
          <Button 
            title="Quay lại" 
            onPress={handleBack} 
            variant="primary"
            style={styles.backButtonError}
          />
        </View>
      </MainLayout>
    );
  }
  
  return (
    <MainLayout
      showBackButton={true}
      showLogo={false}
      showCart={true}
      onBackPress={handleBack}
      onCartPress={handleCartPress}
      scrollEnabled={true}
      title={product.name}
    >
      {/* Product Content */}
      <View>
        {/* Product Image */}
        <Image
          source={{ uri: product.image }}
          style={styles.image}
          contentFit="cover"
          transition={300}
        />
        
        {/* Product Info */}
        <View style={styles.infoContainer}>
          <Text style={[styles.name, { color: colors.text }]}>{product.name}</Text>
          <Text style={[styles.price, { color: colors.primary }]}>{formatCurrency(product.price)}</Text>
          
          {/* Category Info */}
          {categoryName && (
            <View style={[styles.categoryBadge, { backgroundColor: colors.primary + '20' }]}>
              <Text style={[styles.categoryText, { color: colors.primary }]}>
                {categoryName}
              </Text>
            </View>
          )}
          
          <View style={styles.divider} />
          
          {/* Description */}
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Mô tả sản phẩm</Text>
          <Text style={[styles.description, { color: colors.text }]}>{product.description}</Text>
          
          <View style={styles.divider} />
          
          {/* Quantity Selection */}
          <View style={styles.quantityContainer}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Số lượng</Text>
            <View style={styles.quantityControls}>
              <TouchableOpacity 
                style={[styles.quantityButton, { borderColor: colors.separator }]} 
                onPress={handleDecreaseQuantity}
                disabled={quantity <= 1}
              >
                <Ionicons 
                  name="remove" 
                  size={20} 
                  color={quantity <= 1 ? colors.gray : colors.text} 
                />
              </TouchableOpacity>
              
              <Text style={[styles.quantityText, { color: colors.text }]}>{quantity}</Text>
              
              <TouchableOpacity 
                style={[styles.quantityButton, { borderColor: colors.separator }]} 
                onPress={handleIncreaseQuantity}
              >
                <Ionicons name="add" size={20} color={colors.text} />
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.divider} />
          
          {/* Total Price */}
          <View style={styles.totalContainer}>
            <Text style={[styles.totalLabel, { color: colors.text }]}>Tổng tiền:</Text>
            <Text style={[styles.totalPrice, { color: colors.primary }]}>
              {formatCurrency(product.price * quantity)}
            </Text>
          </View>
        </View>
      </View>
      
      {/* Bottom Action */}
      <View 
        style={[
          styles.bottomContainer, 
          { backgroundColor: colors.cardBackground, borderTopColor: colors.separator }
        ]}
      >
        <Button
          title="Thêm vào giỏ hàng"
          onPress={handleAddToCart}
          variant="primary"
          size="large"
          fullWidth
        />
      </View>
    </MainLayout>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  backButtonError: {
    marginTop: 10,
  },
  image: {
    width: '100%',
    height: 350,
    backgroundColor: '#F0F0F0',
  },
  infoContainer: {
    padding: 24,
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  price: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginBottom: 16,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#EEEEEE',
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '600',
    marginHorizontal: 16,
    minWidth: 24,
    textAlign: 'center',
  },
  totalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '600',
  },
  totalPrice: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  bottomContainer: {
    padding: 16,
    borderTopWidth: 1,
  },
}); 