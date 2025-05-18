import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import StyleSheet from '../styles/StyleSheet';
import { scale, verticalScale, getResponsiveValue } from '../styles/responsive';

export type ProductCardProps = {
  id: string;
  name: string;
  price: number;
  image: string;
  discount?: number;
  category_id?: string;
  description?: string;
  onPress: (id: string) => void;
  onAddToCart?: (id: string) => void;
  cardWidth?: number | string;
  cardHeight?: number | string;
  imageHeight?: number | string;
  showAddToCart?: boolean;
  style?: any;
};

const ProductCardResponsive: React.FC<ProductCardProps> = ({
  id,
  name,
  price,
  image,
  discount,
  onPress,
  onAddToCart,
  cardWidth,
  cardHeight,
  imageHeight,
  showAddToCart = true,
  style,
}) => {
  const { colors } = useTheme();

  // Tính giá đã giảm nếu có discount
  const finalPrice = discount ? price - (price * discount / 100) : price;
  
  // Format giá tiền
  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0
    }).format(value);
  };
  
  // Tạo style cho image
  const getImageStyle = () => {
    const baseStyle: any[] = [styles.image];
    if (imageHeight) {
      baseStyle.push({ height: imageHeight });
    }
    return baseStyle;
  };

  return (
    <View 
      style={[
        styles.container,
        cardWidth && { width: cardWidth },
        cardHeight && { height: cardHeight },
        style
      ]}
    >
      <TouchableOpacity
        style={[styles.card, { backgroundColor: colors.cardBackground }]}
        onPress={() => onPress(id)}
        activeOpacity={0.7}
      >
        {/* Ảnh sản phẩm */}
        <Image
          source={{ uri: image }}
          style={getImageStyle()}
          contentFit="cover"
          transition={300}
        />
        
        {/* Nhãn giảm giá (nếu có) */}
        {discount ? (
          <View style={[styles.discountBadge, { backgroundColor: colors.error }]}>
            <Text style={styles.discountText}>-{discount}%</Text>
          </View>
        ) : null}
        
        <View style={styles.infoContainer}>
          {/* Tên sản phẩm */}
          <Text 
            style={[styles.name, { color: colors.text }]} 
            numberOfLines={2}
          >
            {name}
          </Text>
          
          {/* Giá */}
          <View style={styles.priceContainer}>
            <Text style={[styles.price, { color: colors.primary }]}>
              {formatPrice(finalPrice)}
            </Text>
            
            {discount ? (
              <Text style={styles.originalPrice}>
                {formatPrice(price)}
              </Text>
            ) : null}
          </View>
        </View>
        
        {/* Nút thêm vào giỏ hàng */}
        {showAddToCart && (
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: colors.primary }]}
            onPress={() => onAddToCart && onAddToCart(id)}
          >
            <Ionicons name="cart-outline" size={scale(16)} color="white" />
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.responsive({
  default: {
    container: {
      padding: scale(4),
      width: '50%',
    },
    card: {
      borderRadius: scale(8),
      overflow: 'hidden',
      ...StyleSheet.createShadow(2),
    },
    image: {
      width: '100%',
      height: verticalScale(120),
      backgroundColor: '#f5f5f5',
    },
    infoContainer: {
      padding: scale(10),
    },
    name: {
      fontSize: scale(14),
      fontWeight: '500',
      marginBottom: scale(6),
      height: verticalScale(40),
    },
    priceContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    price: {
      fontSize: scale(14),
      fontWeight: 'bold',
      marginRight: scale(5),
    },
    originalPrice: {
      fontSize: scale(12),
      color: '#999',
      textDecorationLine: 'line-through',
    },
    discountBadge: {
      position: 'absolute',
      top: scale(8),
      left: scale(8),
      paddingHorizontal: scale(6),
      paddingVertical: scale(3),
      borderRadius: scale(4),
    },
    discountText: {
      color: 'white',
      fontSize: scale(10),
      fontWeight: 'bold',
    },
    addButton: {
      position: 'absolute',
      bottom: scale(10),
      right: scale(10),
      width: scale(30),
      height: scale(30),
      borderRadius: scale(15),
      justifyContent: 'center',
      alignItems: 'center',
    },
  },
  
  // Custom styles for smaller screens
  xs: {
    container: {
      padding: scale(2),
    },
    image: {
      height: verticalScale(100),
    },
    infoContainer: {
      padding: scale(6),
    },
    name: {
      fontSize: scale(12),
      height: verticalScale(32),
    },
    price: {
      fontSize: scale(12),
    },
    originalPrice: {
      fontSize: scale(10),
    },
  },
  
  // Custom styles for larger tablets
  lg: {
    container: {
      width: '33.33%',
      padding: scale(8),
    },
    image: {
      height: verticalScale(160),
    },
    name: {
      fontSize: scale(16),
      height: verticalScale(50),
    },
    price: {
      fontSize: scale(18),
    },
    originalPrice: {
      fontSize: scale(14),
    },
    addButton: {
      width: scale(36),
      height: scale(36),
      borderRadius: scale(18),
    },
  },
});

export default ProductCardResponsive; 