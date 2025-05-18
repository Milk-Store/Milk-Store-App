import React, { memo } from 'react';
import { StyleSheet, TouchableOpacity, View, Text, ViewStyle, StyleProp } from 'react-native';
import { Image } from 'expo-image';
import { useNavigation } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { Product } from '../contexts/CartContext';
import { formatCurrency, truncateText } from '../utils/format';

interface ProductCardProps {
  product: Product;
  style?: StyleProp<ViewStyle>;
  showDescription?: boolean;
  onAddToCart?: () => void;
  compact?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  style,
  showDescription = true,
  onAddToCart,
  compact = false,
}) => {
  const navigation = useNavigation();
  const { colors, theme } = useTheme();

  const handlePress = () => {
    // @ts-ignore - Router type definition might be missing
    navigation.navigate('product/[id]', { id: product.id });
  };

  const handleAddToCart = (e: any) => {
    e.stopPropagation();
    if (onAddToCart) {
      onAddToCart();
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        { 
          backgroundColor: colors.cardBackground,
          borderColor: colors.separator,
          shadowColor: colors.shadowColor,
        },
        compact ? styles.compactContainer : {},
        style
      ]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: product.image }}
          style={styles.image}
          contentFit="cover"
          transition={200}
        />
        
        {onAddToCart && (
          <TouchableOpacity 
            style={[styles.addButton, { backgroundColor: colors.primary }]}
            onPress={handleAddToCart}
          >
            <Ionicons name="add" size={20} color="white" />
          </TouchableOpacity>
        )}
      </View>
      
      <View style={styles.contentContainer}>
        <Text
          style={[styles.name, { color: colors.text }]}
          numberOfLines={2}
          ellipsizeMode="tail"
        >
          {product.name}
        </Text>
        
        {showDescription && !compact && (
          <Text
            style={[styles.description, { color: colors.gray }]}
            numberOfLines={2}
            ellipsizeMode="tail"
          >
            {truncateText(product.description, 80)}
          </Text>
        )}
        
        <View style={styles.priceContainer}>
          <Text style={[styles.price, { color: colors.primary }]}>
            {formatCurrency(product.price)}
          </Text>
          
          <View style={[styles.categoryBadge, { backgroundColor: `${colors.primary}15` }]}>
            <Text style={[styles.categoryText, { color: colors.primary }]}>
              {product.category}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    borderWidth: 0,
    overflow: 'hidden',
    width: '48%',
    marginBottom: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  compactContainer: {
    width: 170,
    marginRight: 12,
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 150,
    backgroundColor: '#F0F0F0',
  },
  contentContainer: {
    padding: 12,
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
    lineHeight: 20,
  },
  description: {
    fontSize: 12,
    marginBottom: 8,
    lineHeight: 16,
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
  },
  addButton: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FF5A8C',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '500',
  },
});

export default memo(ProductCard); 