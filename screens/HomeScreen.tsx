import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Text,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../contexts/ThemeContext';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Product } from '../contexts/CartContext';
import { api } from '../services/api';
import { CustomerLayout } from '../layouts';
import CarouselBanner from '../components/CarouselBanner';
import { Slider, BannerPopup as BannerPopupType } from '../types';
import Footer from '../components/Footer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ProductCardResponsive from '../components/ProductCardResponsive';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import BannerPopup from '../components/BannerPopup';

// Banner data for carousel
const banners = [
  { id: '1', image: require('../assets/images/banner.jpg') },
  { id: '2', image: require('../assets/images/banner.jpg') },
  { id: '3', image: require('../assets/images/banner.jpg') }
];

export default function HomeScreen() {
  const router = useRouter();
  const { colors, theme } = useTheme();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [sliders, setSliders] = useState<Slider[]>([]);
  const [bannerPopup, setBannerPopup] = useState<BannerPopupType | null>(null);
  const [showBannerPopup, setShowBannerPopup] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);
  const [hasViewedBanner, setHasViewedBanner] = useState(false);

  // Check if banner has been viewed
  useEffect(() => {
    const checkBannerViewed = async () => {
      try {
        const viewed = await AsyncStorage.getItem('bannerViewed');
        setHasViewedBanner(!!viewed);
      } catch (error) {
        console.error('Error checking banner viewed status:', error);
      }
    };
    checkBannerViewed();
  }, []);

  // Fetch all data
  const fetchData = useCallback(async () => {
    try {
      console.log('Starting fetchData...');
      const [
        categoriesResponse,
        hotProductsResponse,
        slidersResponse,
        bannerPopupResponse
      ] = await Promise.all([
        api.categories.getAll(),
        api.products.getHotProducts(),
        api.getSliders(),
        api.getBannerPopup()
      ]);

      setCategories(categoriesResponse);
      setProducts(hotProductsResponse);
      setSliders(slidersResponse || []);

      // Chỉ set banner khi có data mới và chưa có banner
      if (bannerPopupResponse && !bannerPopup) {
        setBannerPopup(bannerPopupResponse);
        setShowBannerPopup(true);
      }

      // Register notification token only if needed
      try {
        const token = await AsyncStorage.getItem('authToken');
        if (token) {
          const pushToken = await Notifications.getExpoPushTokenAsync({
            projectId: Constants.expoConfig?.extra?.eas?.projectId || Constants.expoConfig?.extra?.projectId,
          });
          if (pushToken) {
            await api.notifications.registerToken(pushToken.data);
          }
        }
      } catch (error) {
        // Ignore notification token errors
        console.log('Failed to register notification token:', error);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [bannerPopup]);

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    console.log('Starting refresh...');
    setIsRefreshing(true);
    await fetchData();
    setIsRefreshing(false);
    console.log('Refresh completed');
  }, [fetchData]);

  // Xử lý khi nhấn xem tất cả 
  const handleSeeAll = useCallback(() => {
    // Navigate to products tab
    router.push('/explore');
  }, [router]);

  // Xử lý khi chọn danh mục
  const handleCategorySelect = useCallback((categoryId: string) => {
    // Navigate to products tab with category filter
    router.push({
      pathname: '/explore',
      params: { category: categoryId }
    });
  }, [router]);

  const handleSearchPress = useCallback(() => {
    // Navigate to explore screen and activate search
    router.push({
      pathname: '/explore',
      params: { activateSearch: 'true' }
    });
  }, [router]);

  // Initial data load
  useEffect(() => {
    console.log('Initial data load');
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

  // Render danh mục
  const renderCategoryItem = ({ item }: { item: any }) => {
    return (
      <TouchableOpacity
        style={[styles.categoryItem, { backgroundColor: colors.cardBackground }]}
        onPress={() => handleCategorySelect(item.id)}
      >
        <View style={[styles.categoryIconCircle, { backgroundColor: colors.primary + '20' }]}>
          {item.image ? (
            <Image
              source={{ uri: item.image }}
              style={styles.categoryImage}
              resizeMode="cover"
            />
          ) : (
            <Ionicons name="cube-outline" size={24} color={colors.primary} />
          )}
        </View>
        <Text style={[styles.categoryItemText, { color: colors.text }]} numberOfLines={1}>
          {item.name}
        </Text>
      </TouchableOpacity>
    );
  };

  // Logo navigation handler
  const handleLogoPress = useCallback(() => {
    router.push('/');
  }, [router]);

  const handleCartPress = useCallback(() => {
    router.push('/cart');
  }, [router]);

  const handleProductPress = useCallback((productId: string) => {
    router.push(`/product/${productId}`);
  }, [router]);

  const navigationProps = {
    showLogo: true,
    showBackButton: false,
    showSearch: true,
    onLogoPress: handleLogoPress,
    onCartPress: handleCartPress,
    onSearchPress: handleSearchPress,
    activeTab: 'home' as const,
    onHomePress: () => { },
    onProductsPress: () => router.push('/explore'),
    onAccountPress: () => router.push('/account'),
  };

  const handleBannerClose = useCallback(() => {
    console.log('Closing banner...');
    setShowBannerPopup(false); // Chỉ ẩn banner, không xóa data
  }, []);

  if (isLoading && !isRefreshing) {
    return (
      <CustomerLayout {...navigationProps}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.text }]}>Đang tải dữ liệu...</Text>
        </View>
      </CustomerLayout>
    );
  }

  // Main home screen render
  return (
    <CustomerLayout {...navigationProps}>
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
        {sliders?.length > 0 && (
          <CarouselBanner
            data={sliders.map(slider => ({
              id: slider.id,
              image: slider.image,
              uri: slider.image
            }))}
          />
        )}

        {/* Categories Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Danh mục sản phẩm</Text>
            <TouchableOpacity onPress={handleSeeAll}>
              <Text style={[styles.seeAllText, { color: colors.primary }]}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={categories}
            horizontal
            renderItem={renderCategoryItem}
            keyExtractor={(item) => item.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryListContainer}
          />
        </View>

        {/* Products Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Sản phẩm hot</Text>
            <TouchableOpacity onPress={handleSeeAll}>
              <Text style={[styles.seeAllText, { color: colors.primary }]}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.productsGrid}>
            {products.map(item => (
              <ProductCardResponsive
                key={item.id}
                id={item.id}
                name={item.name}
                price={item.price}
                image={item.image}
                onPress={handleProductPress}
              />
            ))}
          </View>
        </View>
        <Footer />
      </ScrollView>

      {/* Banner Popup */}
      {
        showBannerPopup && (
          <BannerPopup
            banner={bannerPopup}
            onClose={handleBannerClose}
          />
        )
      }


    </CustomerLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
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
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
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
  categoryImage: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
}); 