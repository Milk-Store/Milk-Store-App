import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ActivityIndicator,
  FlatList,
  Text,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
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
import { CustomerLayout } from '../../layouts';

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
  const [page, setPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const ITEMS_PER_PAGE = 10;
  
  // Fetch data (products and categories)
  const fetchData = useCallback(async (pageNum: number = 1, shouldRefresh: boolean = true, categoryId: string = selectedCategory) => {
    try {
      if (pageNum === 1) {
        setIsLoading(true);
      }
      
      // Fetch categories if needed
      if (shouldRefresh) {
        const categoriesData = await api.categories.getAll(true);
        setCategories(categoriesData);
      }
      
      // Fetch all products with pagination
      const { products: productsData, total } = await api.products.getAll(
        true,
        pageNum,
        ITEMS_PER_PAGE,
        searchQuery,
        categoryId !== 'all' ? parseInt(categoryId) : undefined
      );
      
      if (shouldRefresh) {
        setProducts(productsData);
      } else {
        setProducts(prev => [...prev, ...productsData]);
      }
      setTotalProducts(total);
      
      // Set featured products (top 6)
      if (pageNum === 1) {
        setFeaturedProducts(productsData.slice(0, 6));
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [searchQuery]);
  
  // Initial data fetch
  useEffect(() => {
    fetchData(1, true, 'all');
  }, [fetchData]);
  
  // Handle search
  const handleSearch = useCallback((text: string) => {
    setSearchQuery(text);
    setPage(1);
    
    if (!text.trim()) {
      // If search is cleared, show products from selected category
      fetchData(1, true, selectedCategory);
      return;
    }
    
    // Fetch products with search query
    fetchData(1, true, selectedCategory);
  }, [fetchData, selectedCategory]);
  
  // Filter products by category
  const filterByCategory = useCallback(async (categoryId: string) => {
    setSelectedCategory(categoryId);
    setPage(1);
    
    try {
      setIsLoading(true);
      await fetchData(1, true, categoryId);
    } catch (error) {
      console.error('Error filtering by category:', error);
    } finally {
      setIsLoading(false);
    }
  }, [fetchData]);
  
  // Handle load more
  const handleLoadMore = useCallback(() => {
    if (isLoadingMore || products.length >= totalProducts) return;
    
    setIsLoadingMore(true);
    const nextPage = page + 1;
    setPage(nextPage);
    fetchData(nextPage, false, selectedCategory);
  }, [isLoadingMore, products.length, totalProducts, page, fetchData, selectedCategory]);
  
  // Handle refresh
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    setPage(1);
    await fetchData(1, true, selectedCategory);
    setIsRefreshing(false);
  }, [fetchData, selectedCategory]);
  
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

  const navigationProps = {
    showLogo: true,
    showBackButton: false,
    showCart: true,
    showSearch: true,
    onLogoPress: handleLogoPress,
    onCartPress: handleCartPress,
    onSearchPress: handleSearchPress,
    activeTab: 'products' as const,
    onHomePress: handleHomePress,
    onProductsPress: handleProductsPress,
    onAccountPress: handleAccountPress,
    onSearchChange: handleSearch,
    onSearchClear: handleSearchClear,
    searchValue: searchQuery,
    isSearchActive: isSearchActive,
  };
  
  // Render footer for loading more
  const renderFooter = () => {
    if (!isLoadingMore) return null;
    
    return (
      <View style={styles.loadingMore}>
        <ActivityIndicator size="small" color={colors.primary} />
        <Text style={[styles.loadingMoreText, { color: colors.text }]}>
          Đang tải thêm...
        </Text>
      </View>
    );
  };

  // Content to render inside CustomerLayout
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
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        onScroll={({ nativeEvent }) => {
          const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
          const paddingToBottom = 20;
          if (layoutMeasurement.height + contentOffset.y >=
              contentSize.height - paddingToBottom) {
            handleLoadMore();
          }
        }}
        scrollEventThrottle={400}
      >
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
        {page === 1 && (
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
        )}
        
        {/* All Products */}
        <View style={styles.sectionContainer}>
          <SectionHeader 
            title="Tất cả sản phẩm" 
            onAction={handleSeeAll}
          />
          
          <View style={styles.productsGrid}>
            {products.map((item) => (
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
          {renderFooter()}
        </View>
      </ScrollView>
    );
  };

  return (
    <CustomerLayout {...navigationProps}>
      {renderContent()}
    </CustomerLayout>
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
    loadingMore: {
      paddingVertical: scale(16),
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
    },
    loadingMoreText: {
      marginLeft: scale(8),
      fontSize: scale(14),
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
