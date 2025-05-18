import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ActivityIndicator,
  FlatList,
  Text,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { Product } from '../../contexts/CartContext';
import { api } from '../../services/api';
import { useNavigation } from 'expo-router';
import StyleSheet from '../../styles/StyleSheet';
import { scale, verticalScale } from '../../styles/responsive';
import CategoryItem from '../../components/CategoryItem';
import SectionHeader from '../../components/SectionHeader';
import CarouselBanner from '../../components/CarouselBanner';
import ProductCardResponsive from '../../components/ProductCardResponsive';
import { MainLayout } from '../../layouts';

// Banner data for carousel
const banners = [
  { id: '1', image: require('../../assets/images/banner.jpg') },
  { id: '2', image: require('../../assets/images/banner.jpg') },
  { id: '3', image: require('../../assets/images/banner.jpg') }
];

export default function ProductsScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSearchActive, setIsSearchActive] = useState(false);
  
  // Fetch data (products and categories)
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Fetch categories
      const categoriesData = await api.categories.getAll(true);
      setCategories(categoriesData);
      
      // Fetch all products
      const productsData = await api.products.getAll(true);
      setProducts(productsData);
      
      // Set featured products (top 6)
      setFeaturedProducts(productsData.slice(0, 6));
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  // Handle search
  const handleSearch = useCallback((text: string) => {
    setSearchQuery(text);
    
    if (!text.trim()) {
      // If search is cleared, show products from selected category
      if (selectedCategory === 'all') {
        fetchData();
      } else {
        filterByCategory(selectedCategory);
      }
      return;
    }
    
    // Filter products by search term and selected category
    const searchTerms = text.toLowerCase().split(' ').filter(term => term);
    let filtered = products.filter(product => {
      const matchesSearch = searchTerms.some(term => 
        product.name.toLowerCase().includes(term) || 
        (product.description && product.description.toLowerCase().includes(term))
      );
      
      if (selectedCategory !== 'all') {
        return matchesSearch && product.category_id === selectedCategory;
      }
      
      return matchesSearch;
    });
    
    setProducts(filtered);
  }, [selectedCategory, products, fetchData]);
  
  // Filter products by category
  const filterByCategory = useCallback(async (categoryId: string) => {
    setSelectedCategory(categoryId);
    
    try {
      setIsLoading(true);
      
      if (categoryId === 'all') {
        const productsData = await api.products.getAll(true);
        setProducts(productsData);
      } else {
        const productsData = await api.products.getByCategory(categoryId);
        setProducts(productsData);
      }
    } catch (error) {
      console.error('Error filtering by category:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Handle refresh
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await fetchData();
    setIsRefreshing(false);
  }, [fetchData]);
  
  // Handle product press
  const handleProductPress = useCallback((productId: string) => {
    // @ts-ignore - Router type definition might be missing
    navigation.navigate('product/[id]', { id: productId });
  }, [navigation]);
  
  // Handle add to cart
  const handleAddToCart = useCallback((productId: string) => {
    // Add to cart logic here
    console.log(`Add product ${productId} to cart`);
  }, []);
  
  // Handle see all
  const handleSeeAll = useCallback(() => {
    // Logic to see all products
  }, []);

  // Header callbacks
  const handleLogoPress = useCallback(() => {
    // @ts-ignore - Router type definition might be missing
    navigation.navigate('(tabs)');
  }, [navigation]);

  const handleCartPress = useCallback(() => {
    // @ts-ignore - Router type definition might be missing
    navigation.navigate('cart');
  }, [navigation]);

  const handleSearchPress = useCallback(() => {
    setIsSearchActive(true);
  }, []);

  const handleSearchClear = useCallback(() => {
    setSearchQuery('');
    handleSearch('');
  }, [handleSearch]);
  
  // Footer navigation
  const handleHomePress = useCallback(() => {
    // @ts-ignore - Router type definition might be missing
    navigation.navigate('(tabs)');
  }, [navigation]);
  
  const handleProductsPress = useCallback(() => {
    // Already on products screen
  }, []);
  
  const handleAccountPress = useCallback(() => {
    // @ts-ignore - Router type definition might be missing
    navigation.navigate('(tabs)/account');
  }, [navigation]);
  
  // Content to render inside MainLayout
  const renderContent = () => {
    if (isLoading && !isRefreshing) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.text }]}>Đang tải dữ liệu...</Text>
        </View>
      );
    }

    return (
      <>
        {/* Banner Carousel */}
        {/* <CarouselBanner data={banners} /> */}
        
        {/* Categories */}
        <View style={styles.sectionContainer}>
          <SectionHeader 
            title="Danh mục sản phẩm" 
            onAction={handleSeeAll}
          />
          
          <FlatList
            data={categories}
            renderItem={({ item }) => (
              <CategoryItem
                id={item.id}
                name={item.name}
                selected={selectedCategory === item.id}
                onSelect={filterByCategory}
              />
            )}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesContainer}
          />
        </View>
        
        {/* Featured Products */}
        <View style={styles.sectionContainer}>
          <SectionHeader 
            title="Sản phẩm nổi bật" 
            onAction={handleSeeAll}
          />
          
          <View style={styles.productsGrid}>
            {featuredProducts.map((item) => (
              <ProductCardResponsive
                key={item.id}
                id={item.id}
                name={item.name}
                price={item.price}
                image={item.image}
                discount={item.discount}
                onPress={handleProductPress}
                onAddToCart={handleAddToCart}
              />
            ))}
          </View>
        </View>
        
        {/* All Products */}
        <View style={styles.sectionContainer}>
          <SectionHeader 
            title="Tất cả sản phẩm" 
            onAction={handleSeeAll}
          />
          
          <View style={styles.productsGrid}>
            {products.slice(0, 8).map((item) => (
              <ProductCardResponsive
                key={item.id}
                id={item.id}
                name={item.name}
                price={item.price}
                image={item.image}
                discount={item.discount}
                onPress={handleProductPress}
                onAddToCart={handleAddToCart}
              />
            ))}
          </View>
        </View>
      </>
    );
  };

  return (
    <MainLayout
      showLogo={true}
      showBackButton={false}
      showCart={true}
      showSearch={true}
      activeTab="products"
      searchValue={searchQuery}
      isSearchActive={isSearchActive}
      onLogoPress={handleLogoPress}
      onCartPress={handleCartPress}
      onSearchPress={handleSearchPress}
      onSearchChange={handleSearch}
      onSearchClear={handleSearchClear}
      onHomePress={handleHomePress}
      onProductsPress={handleProductsPress}
      onAccountPress={handleAccountPress}
      refreshing={isRefreshing}
      onRefresh={handleRefresh}
    >
      {renderContent()}
    </MainLayout>
  );
}

const styles = StyleSheet.responsive({
  default: {
    loadingContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    loadingText: {
      marginTop: scale(12),
      fontSize: scale(16),
    },
    sectionContainer: {
      marginVertical: scale(16),
    },
    categoriesContainer: {
      paddingHorizontal: scale(16),
      paddingBottom: scale(8),
    },
    productsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      paddingHorizontal: scale(8),
    },
  },
  
  // Style cho màn hình nhỏ
  xs: {
    loadingText: {
      fontSize: scale(14),
    },
    categoriesContainer: {
      paddingHorizontal: scale(8),
    },
  },
  
  // Style cho máy tính bảng
  lg: {
    loadingText: {
      fontSize: scale(18),
    },
    sectionContainer: {
      marginVertical: scale(24),
    },
    categoriesContainer: {
      paddingHorizontal: scale(24),
    },
    productsGrid: {
      paddingHorizontal: scale(16),
    },
  }
});
