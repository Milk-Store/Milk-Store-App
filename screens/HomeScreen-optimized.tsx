import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  FlatList, 
  Text, 
  RefreshControl, 
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useNavigation } from 'expo-router';
import { useTheme } from '../contexts/ThemeContext';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Product } from '../contexts/CartContext';
import { api } from '../services/api';
import StyleSheet from '../styles/StyleSheet';
import { scale, verticalScale } from '../styles/responsive';
import Header from '../components/Header';
import CarouselBanner from '../components/CarouselBanner';
import ProductCardResponsive from '../components/ProductCardResponsive';

// Banner data for carousel
const banners = [
  { id: '1', image: require('../assets/images/banner.jpg') },
  { id: '2', image: require('../assets/images/banner.jpg') },
  { id: '3', image: require('../assets/images/banner.jpg') }
];

export default function HomeScreen() {
  const navigation = useNavigation();
  const { colors, theme } = useTheme();
  
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [newProducts, setNewProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchMode, setSearchMode] = useState(false);

  // Fetch categories và products từ API - Chỉ gọi khi lần đầu render hoặc refresh
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Fetch categories
      const categoriesData = await api.categories.getAll(true);
      setCategories(categoriesData);
      
      // Fetch products
      const productsData = await api.products.getAll(true);
      setProducts(productsData);
      
      // Sản phẩm nổi bật - lấy sản phẩm của category đầu tiên (nếu có)
      if (categoriesData.length > 0 && productsData.length > 0) {
        const firstCatId = categoriesData[0].id;
        const firstCatProducts = productsData.filter(p => p.category_id === firstCatId);
        setFeaturedProducts(firstCatProducts.length > 0 ? firstCatProducts : productsData.slice(0, 6));
      } else {
        setFeaturedProducts(productsData.slice(0, 6));
      }
      
      // Sản phẩm mới - lấy sản phẩm của category thứ hai (nếu có)
      if (categoriesData.length > 1 && productsData.length > 0) {
        const secondCatId = categoriesData[1].id;
        const secondCatProducts = productsData.filter(p => p.category_id === secondCatId);
        setNewProducts(secondCatProducts.length > 0 ? secondCatProducts : productsData.slice(6, 12));
      } else {
        setNewProducts(productsData.slice(6, 12));
      }
      
      // Set filtered products mặc định (tất cả sản phẩm)
      setFilteredProducts(productsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Lọc sản phẩm theo danh mục đã chọn
  const filterProductsByCategory = useCallback((categoryId: string, productList: Product[]) => {
    if (categoryId === 'all') {
      return productList;
    }
    return productList.filter(product => product.category_id === categoryId);
  }, []);

  // Xử lý tìm kiếm
  const handleSearch = useCallback((text: string) => {
    setSearchQuery(text);
    
    if (!text.trim()) {
      // Nếu xóa từ khóa tìm kiếm, hiển thị lại sản phẩm theo danh mục đã chọn
      setFilteredProducts(filterProductsByCategory(selectedCategory, products));
      return;
    }
    
    // Lọc sản phẩm theo từ khóa tìm kiếm và danh mục
    const searchTerms = text.toLowerCase().split(' ').filter(term => term);
    const filtered = products.filter(product => {
      const matchesSearch = searchTerms.some(term => 
        product.name.toLowerCase().includes(term) || 
        (product.description && product.description.toLowerCase().includes(term))
      );
      
      // Nếu có chọn danh mục cụ thể, kết hợp điều kiện tìm kiếm với lọc danh mục
      if (selectedCategory !== 'all') {
        return matchesSearch && product.category_id === selectedCategory;
      }
      
      return matchesSearch;
    });
    
    setFilteredProducts(filtered);
  }, [selectedCategory, products, filterProductsByCategory]);

  // Xử lý chọn danh mục
  const handleCategorySelect = useCallback((categoryId: string) => {
    setSelectedCategory(categoryId);
    
    // Nếu đang tìm kiếm, kết hợp bộ lọc tìm kiếm với danh mục
    if (searchQuery.trim() && searchQuery !== 'show-all-products') {
      handleSearch(searchQuery);
    } else {
      // Nếu không có tìm kiếm, lọc trực tiếp theo danh mục từ danh sách sản phẩm đã tải
      setFilteredProducts(filterProductsByCategory(categoryId, products));
    }
    
    // Chuyển sang chế độ hiển thị danh sách sản phẩm
    setSearchMode(true);
  }, [products, searchQuery, handleSearch, filterProductsByCategory]);

  // Xử lý refresh màn hình
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await fetchData();
    setIsRefreshing(false);
  }, [fetchData]);

  // Xử lý khi nhấn xem tất cả 
  const handleSeeAll = useCallback((categoryId?: string) => {
    if (categoryId) {
      setSelectedCategory(categoryId);
      setFilteredProducts(filterProductsByCategory(categoryId, products));
    } else {
      setSelectedCategory('all');
      setFilteredProducts(products);
    }
    
    // Chuyển sang chế độ hiển thị danh sách sản phẩm
    setSearchMode(true);
  }, [products, filterProductsByCategory]);

  // Tải dữ liệu ban đầu
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Xử lý khi nhấn vào sản phẩm
  const handleProductPress = useCallback((productId: string) => {
    // @ts-ignore - Router type definition might be missing
    navigation.navigate('product/[id]', { id: productId });
  }, [navigation]);

  // Xử lý khi thêm vào giỏ hàng
  const handleAddToCart = useCallback((productId: string) => {
    // Logic thêm vào giỏ hàng
    console.log(`Add product ${productId} to cart`);
  }, []);

  // Toggle search mode and focus on search input
  const toggleSearchMode = useCallback(() => {
    setSearchMode(true);
  }, []);

  // Logo navigation handler
  const handleLogoPress = useCallback(() => {
    // @ts-ignore - Router type definition might be missing
    navigation.navigate('(tabs)');
  }, [navigation]);

  // Header callbacks
  const handleCartPress = useCallback(() => {
    // @ts-ignore - Router type definition might be missing
    navigation.navigate('cart');
  }, [navigation]);

  const handleBackPress = useCallback(() => {
    setSearchMode(false);
  }, []);

  const handleSearchClear = useCallback(() => {
    setSearchQuery('');
    handleSearch('');
  }, [handleSearch]);

  // Render khi không có sản phẩm
  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Text style={[styles.emptyText, { color: colors.text }]}>
        {isLoading 
          ? 'Đang tải sản phẩm...' 
          : searchQuery && searchQuery !== 'show-all-products' 
            ? `Không tìm thấy sản phẩm phù hợp với "${searchQuery}"` 
            : selectedCategory !== 'all' 
              ? 'Không có sản phẩm trong danh mục này' 
              : 'Không tìm thấy sản phẩm nào'}
      </Text>
    </View>
  );

  if (isLoading && !isRefreshing) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} />
        <Header 
          showLogo={true}
          showBackButton={false}
          showSearch={true}
          onLogoPress={handleLogoPress}
          onCartPress={handleCartPress}
          onSearchPress={toggleSearchMode}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.text }]}>Đang tải dữ liệu...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Render màn hình danh sách sản phẩm (khi đang tìm kiếm hoặc xem tất cả)
  if (searchMode) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} />
        <Header 
          showLogo={false}
          showBackButton={true}
          showSearch={true}
          searchValue={searchQuery !== 'show-all-products' ? searchQuery : ''}
          onBackPress={handleBackPress}
          onCartPress={handleCartPress}
          onSearchChange={handleSearch}
          onSearchClear={handleSearchClear}
          isSearchActive={true}
        />

        {/* Danh mục sản phẩm */}
        <View style={styles.categoriesContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesScroll}
          >
            <TouchableOpacity
              style={[
                styles.categoryTag,
                {
                  backgroundColor: selectedCategory === 'all' ? colors.primary : colors.cardBackground,
                  borderColor: colors.separator,
                }
              ]}
              onPress={() => handleCategorySelect('all')}
            >
              <Text
                style={[
                  styles.categoryTagText,
                  { color: selectedCategory === 'all' ? 'white' : colors.text }
                ]}
              >
                Tất cả
              </Text>
            </TouchableOpacity>

            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryTag,
                  {
                    backgroundColor: selectedCategory === category.id ? colors.primary : colors.cardBackground,
                    borderColor: colors.separator,
                  }
                ]}
                onPress={() => handleCategorySelect(category.id)}
              >
                <Text
                  style={[
                    styles.categoryTagText,
                    { color: selectedCategory === category.id ? 'white' : colors.text }
                  ]}
                >
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Danh sách sản phẩm */}
        <View style={styles.productsGrid}>
          {filteredProducts.length > 0 ? (
            filteredProducts.map(item => (
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
            ))
          ) : (
            renderEmptyList()
          )}
        </View>
      </SafeAreaView>
    );
  }

  // Render trang chủ chính với nhiều section
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} />
      
      {/* Header with search bar and cart */}
      <Header 
        showLogo={true}
        showBackButton={false}
        showSearch={true}
        onLogoPress={handleLogoPress}
        onCartPress={handleCartPress}
        onSearchPress={toggleSearchMode}
      />

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
        {/* Banner Carousel */}
        <CarouselBanner data={banners} />

        {/* Danh mục sản phẩm */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Danh mục sản phẩm</Text>
            <TouchableOpacity onPress={() => handleSeeAll()}>
              <Text style={[styles.seeAllText, { color: colors.primary }]}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={categories.slice(0, 4)}
            horizontal
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={[styles.categoryItem, { backgroundColor: colors.cardBackground }]}
                onPress={() => handleCategorySelect(item.id)}
              >
                <View style={[styles.categoryIconCircle, { backgroundColor: colors.primary + '20' }]}>
                  <Ionicons name="cube-outline" size={24} color={colors.primary} />
                </View>
                <Text style={[styles.categoryItemText, { color: colors.text }]} numberOfLines={1}>{item.name}</Text>
              </TouchableOpacity>
            )}
            keyExtractor={(item) => item.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryListContainer}
          />
        </View>

        {/* Sản phẩm nổi bật */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Sản phẩm mới nhất</Text>
            <TouchableOpacity onPress={() => handleSeeAll()}>
              <Text style={[styles.seeAllText, { color: colors.primary }]}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.productsGrid}>
            {products.slice(0, 6).map(item => (
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

        {/* Footer */}
        <View style={[styles.footer, { backgroundColor: colors.cardBackground }]}>
          <View style={styles.footerTop}>
            <Image
              source={require('../assets/images/logo.jpg')}
              style={styles.footerLogo}
              contentFit="contain"
            />
            <Text style={[styles.footerTagline, { color: colors.text }]}>Vì sức khỏe của gia đình bạn</Text>
            <View style={styles.socialLinks}>
              <TouchableOpacity style={[styles.socialButton, { backgroundColor: colors.background }]}>
                <Ionicons name="logo-facebook" size={24} color="#3b5998" />
              </TouchableOpacity>
              <TouchableOpacity style={[styles.socialButton, { backgroundColor: colors.background }]}>
                <Ionicons name="logo-instagram" size={24} color="#e1306c" />
              </TouchableOpacity>
              <TouchableOpacity style={[styles.socialButton, { backgroundColor: colors.background }]}>
                <Ionicons name="logo-youtube" size={24} color="#ff0000" />
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.footerInfo}>
            <View style={styles.footerInfoItem}>
              <Ionicons name="call-outline" size={18} color={colors.primary} />
              <Text style={[styles.footerInfoText, { color: colors.text }]}>Hotline: 1900 6789</Text>
            </View>
            <View style={styles.footerInfoItem}>
              <Ionicons name="mail-outline" size={18} color={colors.primary} />
              <Text style={[styles.footerInfoText, { color: colors.text }]}>Email: support@milkshop.vn</Text>
            </View>
            <View style={styles.footerInfoItem}>
              <Ionicons name="location-outline" size={18} color={colors.primary} />
              <Text style={[styles.footerInfoText, { color: colors.text }]}>Địa chỉ: 123 Đường ABC, Quận XYZ, TP. HCM</Text>
            </View>
          </View>
          
          <View style={styles.copyright}>
            <Text style={[styles.copyrightText, { color: colors.mediumGray }]}>© 2023 Milk Shop. All rights reserved.</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.responsive({
  default: {
    container: {
      flex: 1,
    },
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
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: scale(16),
      marginBottom: scale(12),
    },
    sectionTitle: {
      fontSize: scale(18),
      fontWeight: 'bold',
    },
    seeAllText: {
      fontSize: scale(14),
      fontWeight: '500',
    },
    categoriesContainer: {
      paddingHorizontal: scale(16),
      paddingBottom: scale(8),
    },
    categoriesScroll: {
      paddingVertical: scale(8),
    },
    categoryTag: {
      paddingVertical: scale(8),
      paddingHorizontal: scale(16),
      borderRadius: scale(20),
      borderWidth: 1,
      marginRight: scale(8),
    },
    categoryTagText: {
      fontSize: scale(14),
      fontWeight: '500',
    },
    categoryItem: {
      width: scale(80),
      alignItems: 'center',
      marginRight: scale(16),
      borderRadius: scale(8),
      padding: scale(10),
      ...StyleSheet.createShadow(2),
    },
    categoryIconCircle: {
      width: scale(50),
      height: scale(50),
      borderRadius: scale(25),
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: scale(6),
    },
    categoryItemText: {
      textAlign: 'center',
      fontSize: scale(12),
    },
    categoryListContainer: {
      paddingHorizontal: scale(16),
      paddingBottom: scale(8),
    },
    productsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      paddingHorizontal: scale(8),
    },
    footer: {
      paddingTop: scale(30),
      paddingBottom: scale(20),
    },
    footerTop: {
      alignItems: 'center',
      marginBottom: scale(20),
    },
    footerLogo: {
      width: scale(60),
      height: scale(60),
      borderRadius: scale(30),
      marginBottom: scale(10),
    },
    footerTagline: {
      fontSize: scale(14),
      marginBottom: scale(12),
    },
    socialLinks: {
      flexDirection: 'row',
      justifyContent: 'center',
    },
    socialButton: {
      width: scale(40),
      height: scale(40),
      borderRadius: scale(20),
      justifyContent: 'center',
      alignItems: 'center',
      marginHorizontal: scale(8),
      ...StyleSheet.createShadow(2),
    },
    footerInfo: {
      paddingHorizontal: scale(16),
      marginBottom: scale(20),
    },
    footerInfoItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: scale(10),
    },
    footerInfoText: {
      fontSize: scale(14),
      marginLeft: scale(10),
    },
    copyright: {
      borderTopWidth: 1,
      borderTopColor: '#eee',
      paddingTop: scale(15),
      alignItems: 'center',
    },
    copyrightText: {
      fontSize: scale(12),
    },
    emptyContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: scale(24),
      height: verticalScale(300),
      width: '100%',
    },
    emptyText: {
      fontSize: scale(16),
      textAlign: 'center',
    },
  },
  
  // Custom styles for smaller screens
  xs: {
    categoryItem: {
      width: scale(70),
      padding: scale(8),
    },
    categoryIconCircle: {
      width: scale(40),
      height: scale(40),
      borderRadius: scale(20),
    },
    categoryItemText: {
      fontSize: scale(10),
    },
    sectionTitle: {
      fontSize: scale(16),
    },
  },
  
  // Custom styles for larger tablets
  lg: {
    categoryItem: {
      width: scale(100),
      padding: scale(12),
    },
    categoryIconCircle: {
      width: scale(60),
      height: scale(60),
      borderRadius: scale(30),
    },
    categoryItemText: {
      fontSize: scale(14),
    },
    sectionTitle: {
      fontSize: scale(22),
    },
    seeAllText: {
      fontSize: scale(16),
    },
    footerLogo: {
      width: scale(80),
      height: scale(80),
      borderRadius: scale(40),
    },
    footerTagline: {
      fontSize: scale(16),
    },
    socialButton: {
      width: scale(50),
      height: scale(50),
      borderRadius: scale(25),
    },
  },
}); 