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
import { useNavigation, useLocalSearchParams } from 'expo-router';
import StyleSheet from '../../styles/StyleSheet';
import { scale, verticalScale } from '../../styles/responsive';
import CategoryItem from '../../components/CategoryItem';
import SectionHeader from '../../components/SectionHeader';
import CarouselBanner from '../../components/CarouselBanner';
import ProductCardResponsive from '../../components/ProductCardResponsive';
import { CustomerLayout } from '../../layouts';
import Pagination from '../../components/ui/Pagination';
import Footer from '../../components/Footer';

// Types
interface Category {
  id: string;
  name: string;
  image?: string;
}

interface ProductWithCategory extends Product {
  category_name?: string;
}

// Banner data for carousel
const banners = [
  { id: '1', image: require('../../assets/images/banner.jpg') },
  { id: '2', image: require('../../assets/images/banner.jpg') },
  { id: '3', image: require('../../assets/images/banner.jpg') }
];

export default function ProductsScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const { activateSearch } = useLocalSearchParams();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<ProductWithCategory[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [page, setPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const ITEMS_PER_PAGE = 10;
  
  // Activate search if navigated from home screen
  useEffect(() => {
    if (activateSearch === 'true') {
      setIsSearchActive(true);
    }
  }, [activateSearch]);
  
  // Transform AdminProduct to Product
  const transformProduct = useCallback((adminProduct: any): ProductWithCategory => {
    return {
      id: adminProduct.id,
      name: adminProduct.name,
      price: Number(adminProduct.price),
      image: adminProduct.image,
      description: adminProduct.description,
      category: typeof adminProduct.category === 'object' ? adminProduct.category.name : adminProduct.category,
      category_id: adminProduct.category_id.toString(),
      category_name: typeof adminProduct.category === 'object' ? adminProduct.category.name : undefined,
      discount: adminProduct.discount
    };
  }, []);
  
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
      const response = await api.products.getAll(
        true,
        pageNum,
        ITEMS_PER_PAGE,
        searchQuery,
        categoryId !== 'all' ? parseInt(categoryId) : undefined
      );
      
      const transformedProducts = response.products.map(transformProduct);
      
      // Always set new products, don't append
      setProducts(transformedProducts);
      setTotalProducts(response.pagination.totalItems);
      
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [searchQuery, transformProduct]);
  
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
    isSearchActive,
    setIsSearchActive,
  };
  
  // Thêm hàm tạo unique key
  const generateUniqueKey = (id: string, index: number): string => {
    return `product-${id}-${index}`;
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
      >
        {/* Categories */}
        <View style={styles.sectionContainer}>
          <SectionHeader 
            title="Danh mục sản phẩm" 
            actionText=""
          />
          
          <FlatList
            data={categories}
            renderItem={({ item }) => (
              <CategoryItem
                id={item.id}
                name={item.name}
                image={item.image}
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
        
        {/* All Products */}
        <View style={styles.sectionContainer}>
          <View style={styles.titleContainer}>
            <Text style={[styles.titleText, { color: colors.text }]}>
              Tất cả sản phẩm
            </Text>
          </View>
          
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

          {/* Add Pagination */}
          <Pagination
            currentPage={page}
            totalPages={Math.ceil(totalProducts / ITEMS_PER_PAGE)}
            totalItems={totalProducts}
            onPageChange={(newPage: number) => {
              setPage(newPage);
              fetchData(newPage, false, selectedCategory);
            }}
            colors={colors}
          />
        </View>
        <Footer />

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
    titleContainer: {
      alignItems: 'center',
      marginBottom: scale(16),
      paddingHorizontal: scale(16),
    },
    titleText: {
      fontSize: scale(20),
      fontWeight: 'bold',
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
    titleText: {
      fontSize: scale(18),
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
    titleText: {
      fontSize: scale(24),
    },
  }
});
