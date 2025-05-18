import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  View, 
  StyleSheet, 
  FlatList, 
  Text, 
  RefreshControl, 
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Dimensions,
  ImageBackground,
  ScrollView,
  TextInput,
  Modal,
  useWindowDimensions,
} from 'react-native';
import { useNavigation } from 'expo-router';
import { useTheme } from '../contexts/ThemeContext';
import { Image } from 'expo-image';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import SearchBar from '../components/SearchBar';
import CategoryList from '../components/CategoryList';
import ProductCard from '../components/ProductCard';
import { Product } from '../contexts/CartContext';
import { api } from '../services/api';
import Carousel from 'react-native-reanimated-carousel';
import { MainLayout } from '../layouts';

// Banner data for carousel
const banners = [
  { id: '1', image: require('../assets/images/banner.jpg') },
  { id: '2', image: require('../assets/images/banner.jpg') },
  { id: '3', image: require('../assets/images/banner.jpg') }
];

export default function HomeScreen() {
  const navigation = useNavigation();
  const { colors, theme } = useTheme();
  const carouselRef = useRef(null);
  const { width, height } = useWindowDimensions();
  
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [newProducts, setNewProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeSlide, setActiveSlide] = useState(0);
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

  // Render các item cho carousel
  const renderBannerItem = ({ item }: { item: { id: string, image: any } }) => {
    return (
      <Image
        source={item.image}
        style={styles.bannerImage}
        contentFit="cover"
      />
    );
  };

  // Tính toán kích thước động cho sản phẩm dựa trên kích thước màn hình
  const getProductCardWidth = () => {
    // Trên màn hình nhỏ, để lề nhỏ hơn
    if (width < 350) {
      return width / 2 - 12;
    }
    // Màn hình thông thường
    return width / 2 - 16;
  };

  // Tính kích thước cho hiển thị danh mục
  const getCategoryItemWidth = () => {
    if (width < 350) {
      return 70; // Nhỏ hơn cho màn hình nhỏ
    }
    return 80; // Kích thước thông thường
  };

  // Tính padding cho content
  const getContentPadding = () => {
    if (width < 350) {
      return 8;
    }
    return 16;
  };

  // Render danh mục
  const renderCategoryItem = ({ item }: { item: any }) => {
    return (
      <TouchableOpacity 
        style={[styles.categoryItem, { backgroundColor: colors.cardBackground, width: getCategoryItemWidth() }]}
        onPress={() => handleCategorySelect(item.id)}
      >
        <View style={[styles.categoryIconContainer, { backgroundColor: colors.primary + '20' }]}>
          <Ionicons name="cube-outline" size={24} color={colors.primary} />
        </View>
        <Text style={[styles.categoryName, { color: colors.text }]} numberOfLines={1}>
          {item.name}
        </Text>
      </TouchableOpacity>
    );
  };

  // Xử lý khi nhấn vào sản phẩm
  const handleProductPress = (productId: string) => {
    // @ts-ignore - Router type definition might be missing
    navigation.navigate('product/[id]', { id: productId });
  };

  // Render sản phẩm
  const renderProductItem = ({ item }: { item: Product }) => (
    <View style={[styles.productCard, { width: getProductCardWidth() }]}>
      <TouchableOpacity 
        onPress={() => handleProductPress(item.id)}
        style={[styles.productCardInner, { backgroundColor: colors.cardBackground }]}
      >
        <Image
          source={{ uri: item.image }}
          style={styles.productImage}
          contentFit="cover"
          transition={300}
        />
        <View style={styles.productInfo}>
          <Text style={[styles.productName, { color: colors.text }]} numberOfLines={2}>
            {item.name}
          </Text>
          <Text style={[styles.productPrice, { color: colors.primary }]}>
            {new Intl.NumberFormat('vi-VN', {
              style: 'currency',
              currency: 'VND',
              minimumFractionDigits: 0
            }).format(item.price)}
          </Text>
          <TouchableOpacity
            style={[styles.addToCartButton, { backgroundColor: colors.primary }]}
            onPress={() => {/* Thêm vào giỏ hàng */}}
          >
            <Ionicons name="cart-outline" size={16} color="white" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </View>
  );

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

  // Toggle search mode and focus on search input
  const toggleSearchMode = useCallback(() => {
    setSearchMode(true);
  }, []);

  // Banner Carousel
  const renderCarousel = () => (
    <View style={styles.carouselContainer}>
      <Carousel
        ref={carouselRef}
        width={width}
        height={width * 0.5}
        data={banners}
        renderItem={renderBannerItem}
        onSnapToItem={(index) => setActiveSlide(index)}
        loop
        autoPlay={true}
        autoPlayInterval={5000}
      />
      <View style={styles.paginationContainer}>
        {banners.map((_, index) => (
          <View
            key={index}
            style={[
              styles.paginationDot,
              { backgroundColor: index === activeSlide ? colors.primary : '#E0E0E0' }
            ]}
          />
        ))}
      </View>
    </View>
  );

  // Logo navigation handler
  const handleLogoPress = useCallback(() => {
    // @ts-ignore - Router type definition might be missing
    navigation.navigate('(tabs)');
  }, [navigation]);

  const handleCartPress = useCallback(() => {
    // @ts-ignore - Router type definition might be missing
    navigation.navigate('cart');
  }, [navigation]);

  const handleSearchPress = useCallback(() => {
    setSearchMode(true);
  }, []);

  const handleSearchClear = useCallback(() => {
    setSearchQuery('');
    handleSearch('');
  }, [handleSearch]);

  if (isLoading && !isRefreshing) {
    return (
      <MainLayout
        showLogo={true}
        showCart={true}
        showSearch={true}
        onLogoPress={handleLogoPress}
        onCartPress={handleCartPress}
        onSearchPress={handleSearchPress}
        onSearchChange={handleSearch}
        onSearchClear={handleSearchClear}
        searchValue={searchQuery}
        isSearchActive={searchMode}
        scrollEnabled={false}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.text }]}>Đang tải dữ liệu...</Text>
        </View>
      </MainLayout>
    );
  }

  // Render màn hình danh sách sản phẩm (khi đang tìm kiếm hoặc xem tất cả)
  if (searchMode) {
    return (
      <MainLayout
        showBackButton={true}
        showLogo={false}
        showCart={true}
        showSearch={true}
        onBackPress={() => setSearchMode(false)}
        onCartPress={handleCartPress}
        onSearchPress={handleSearchPress}
        onSearchChange={handleSearch}
        onSearchClear={handleSearchClear}
        searchValue={searchQuery}
        isSearchActive={true}
        scrollEnabled={false}
      >
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
        <FlatList
          data={filteredProducts}
          renderItem={renderProductItem}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.productColumnWrapper}
          contentContainerStyle={styles.productListContent}
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
        />
      </MainLayout>
    );
  }

  // Render trang chủ chính với nhiều section
  return (
    <MainLayout
      showLogo={true}
      showCart={true}
      showSearch={true}
      onLogoPress={handleLogoPress}
      onCartPress={handleCartPress}
      onSearchPress={handleSearchPress}
      onSearchChange={handleSearch}
      onSearchClear={handleSearchClear}
      searchValue={searchQuery}
      isSearchActive={searchMode}
      scrollEnabled={true}
      refreshing={isRefreshing}
      onRefresh={handleRefresh}
    >
      {/* Banner Carousel */}
      {renderCarousel()}

      {/* Danh mục sản phẩm */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Danh mục sản phẩm</Text>
          <TouchableOpacity onPress={() => handleSeeAll()}>
            <Text style={[styles.seeAllText, { color: colors.primary }]}>Xem tất cả</Text>
          </TouchableOpacity>
        </View>
        
        <FlatList
          data={categories.slice(0, 4)}
          horizontal
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.categoryItemNew}
              onPress={() => handleCategorySelect(item.id)}
            >
              <View style={styles.categoryIconCircle}>
                <Ionicons name="cube-outline" size={24} color={colors.primary} />
              </View>
              <Text style={styles.categoryItemText} numberOfLines={1}>{item.name}</Text>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryListContainer}
          scrollEnabled={true}
        />
      </View>

      {/* Sản phẩm nổi bật */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Sản phẩm mới nhất</Text>
          <TouchableOpacity onPress={() => handleSeeAll()}>
            <Text style={[styles.seeAllText, { color: colors.primary }]}>Xem tất cả</Text>
          </TouchableOpacity>
        </View>
        
        <FlatList
          data={products}
          renderItem={({ item }) => (
            <View style={styles.productCardNew}>
              <TouchableOpacity 
                onPress={() => handleProductPress(item.id)}
                style={styles.productCardContent}
              >
                <Image
                  source={{ uri: item.image }}
                  style={styles.productImageNew}
                  contentFit="cover"
                  transition={300}
                />
                <View style={styles.productInfoNew}>
                  <Text style={styles.productNameNew} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={[styles.productPriceNew, { color: colors.primary }]}>
                    {new Intl.NumberFormat('vi-VN', {
                      style: 'currency',
                      currency: 'VND',
                      minimumFractionDigits: 0
                    }).format(item.price)}
                  </Text>
                </View>
                <TouchableOpacity
                  style={[styles.addCartButtonNew, { backgroundColor: colors.primary }]}
                >
                  <Ionicons name="cart-outline" size={18} color="white" />
                </TouchableOpacity>
              </TouchableOpacity>
            </View>
          )}
          numColumns={2}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.productGridContainer}
          columnWrapperStyle={styles.productColumnWrapper}
          scrollEnabled={false}
        />
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.footerTop}>
          <Image
            source={require('../assets/images/logo.jpg')}
            style={styles.footerLogo}
            contentFit="contain"
          />
          <Text style={styles.footerTagline}>Vì sức khỏe của gia đình bạn</Text>
          <View style={styles.socialLinks}>
            <TouchableOpacity style={styles.socialButton}>
              <Ionicons name="logo-facebook" size={24} color="#3b5998" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialButton}>
              <Ionicons name="logo-instagram" size={24} color="#e1306c" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialButton}>
              <Ionicons name="logo-youtube" size={24} color="#ff0000" />
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.footerInfo}>
          <View style={styles.footerInfoItem}>
            <Ionicons name="call-outline" size={18} color={colors.primary} />
            <Text style={styles.footerInfoText}>Hotline: 1900 6789</Text>
          </View>
          <View style={styles.footerInfoItem}>
            <Ionicons name="mail-outline" size={18} color={colors.primary} />
            <Text style={styles.footerInfoText}>Email: support@milkshop.vn</Text>
          </View>
          <View style={styles.footerInfoItem}>
            <Ionicons name="location-outline" size={18} color={colors.primary} />
            <Text style={styles.footerInfoText}>Địa chỉ: 123 Đường ABC, Quận XYZ, TP. HCM</Text>
          </View>
        </View>
        
        <View style={styles.copyright}>
          <Text style={styles.copyrightText}>© 2023 Milk Shop. All rights reserved.</Text>
        </View>
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
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  sectionContainer: {
    marginVertical: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '500',
  },
  carouselContainer: {
    marginVertical: 12,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  categoriesContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  categoriesScroll: {
    paddingVertical: 8,
  },
  categoryItem: {
    alignItems: 'center',
    marginRight: 16,
    borderRadius: 8,
    padding: 12,
    width: 80,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  categoryTag: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  categoryTagText: {
    fontSize: 14,
    fontWeight: '500',
  },
  categoryIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 12,
    textAlign: 'center',
  },
  horizontalProductsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  productCard: {
    padding: 8,
  },
  productCardInner: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productImage: {
    width: '100%',
    height: 150,
    backgroundColor: '#f0f0f0',
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    height: 40,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  addToCartButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 12,
    right: 12,
  },
  productColumnWrapper: {
    justifyContent: 'space-between',
  },
  productListContent: {
    paddingHorizontal: 8,
    paddingBottom: 24,
  },
  mainPromoBanner: {
    marginVertical: 16,
    borderRadius: 12,
    overflow: 'hidden',
    height: 160,
  },
  mainBannerImage: {
    width: '100%',
    height: '100%',
  },
  bannerOverlay: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  bannerTitle: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  bannerSubtitle: {
    color: 'white',
    fontSize: 14,
    marginBottom: 16,
  },
  bannerButton: {
    backgroundColor: 'white',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  bannerButtonText: {
    color: '#333',
    fontWeight: '600',
  },
  trustBadgesContainer: {
    padding: 20,
    borderRadius: 12,
    marginVertical: 16,
  },
  trustBadgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  trustBadge: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 20,
  },
  trustBadgeIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  trustBadgeTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
    textAlign: 'center',
  },
  trustBadgeDesc: {
    fontSize: 12,
    textAlign: 'center',
  },
  footer: {
    backgroundColor: '#f8f8f8',
    paddingTop: 30,
    paddingBottom: 20,
  },
  footerTop: {
    alignItems: 'center',
    marginBottom: 20,
  },
  footerLogo: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 10,
  },
  footerTagline: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  socialLinks: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  socialButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  footerInfo: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  footerInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  footerInfoText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 10,
  },
  copyright: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 15,
    alignItems: 'center',
  },
  copyrightText: {
    fontSize: 12,
    color: '#999',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    height: 300,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
  bottomPadding: {
    height: 30,
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  categoriesWrapper: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    flexDirection: 'row',
  },
  categoryBox: {
    alignItems: 'center',
    marginRight: 16,
    borderRadius: 8,
    padding: 12,
    width: 80,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  categoryIconWrapper: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryBoxName: {
    fontSize: 12,
    textAlign: 'center',
  },
  featuredProductsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  featuredProductCard: {
    padding: 8,
  },
  featuredProductImage: {
    width: '100%',
    height: 150,
    backgroundColor: '#f0f0f0',
  },
  featuredProductInfo: {
    padding: 12,
  },
  featuredProductName: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    height: 40,
  },
  featuredProductPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  addToCartCircleButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 12,
    right: 12,
  },
  categoryItemNew: {
    width: 80,
    alignItems: 'center',
    marginRight: 16,
  },
  categoryIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f8e7f8',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  categoryItemText: {
    textAlign: 'center',
    fontSize: 12,
    color: '#333',
  },
  categoryListContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  productCardNew: {
    flex: 1,
    margin: 4,
    maxWidth: '50%',
  },
  productCardContent: {
    backgroundColor: 'white',
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  productImageNew: {
    width: '100%',
    height: 120,
    backgroundColor: '#f0f0f0',
  },
  productInfoNew: {
    padding: 8,
  },
  productNameNew: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  productPriceNew: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  addCartButtonNew: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 8,
    right: 8,
  },
  productGridContainer: {
    paddingHorizontal: 12,
    paddingBottom: 16,
  },
}); 