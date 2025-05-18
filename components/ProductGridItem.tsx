import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { formatCurrency } from '../utils/format';

interface ProductGridItemProps {
  id: string;
  name: string;
  price: number;
  image: string;
  discount?: number;
  onPress: (id: string) => void;
  onAddToCart?: (id: string) => void;
}

const ProductGridItem: React.FC<ProductGridItemProps> = ({
  id,
  name,
  price,
  image,
  discount,
  onPress,
  onAddToCart
}) => {
  const { colors } = useTheme();

  const handleAddToCart = (e: any) => {
    e.stopPropagation();
    if (onAddToCart) {
      onAddToCart(id);
    }
  };

  return (
    <View style={styles.productCard}>
      <TouchableOpacity 
        onPress={() => onPress(id)}
        style={[styles.productCardInner, { backgroundColor: colors.cardBackground }]}
      >
        <Image
          source={{ uri: image }}
          style={styles.productImage}
          contentFit="cover"
          transition={300}
        />
        <View style={styles.productInfo}>
          <Text 
            style={[styles.productName, { color: colors.text }]} 
            numberOfLines={1}
          >
            {name}
          </Text>
          <Text style={[styles.productPrice, { color: colors.primary }]}>
            {formatCurrency(price)}
          </Text>
          
          {discount && discount > 0 && (
            <View style={[styles.discountTag, { backgroundColor: '#FF6B6B' }]}>
              <Text style={styles.discountText}>-{discount}%</Text>
            </View>
          )}
          
          <TouchableOpacity
            style={[styles.addToCartButton, { backgroundColor: colors.primary }]}
            onPress={handleAddToCart}
          >
            <Ionicons name="cart-outline" size={16} color="white" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  productCard: {
    flex: 1,
    margin: 4,
    maxWidth: '50%',
  },
  productCardInner: {
    borderRadius: 10,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  productImage: {
    width: '100%',
    height: 120,
    backgroundColor: '#f0f0f0',
  },
  productInfo: {
    padding: 10,
    minHeight: 70,
  },
  productName: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 6,
  },
  productPrice: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  discountTag: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  discountText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  addToCartButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 8,
    right: 8,
  }
});

export default ProductGridItem; 