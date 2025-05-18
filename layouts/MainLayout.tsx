import React from 'react';
import { View, StyleSheet, SafeAreaView, StatusBar, ScrollView, RefreshControl } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import Header from '../components/Header';
import { scale } from '../styles/responsive';

type MainLayoutProps = {
  children: React.ReactNode;
  showLogo?: boolean;
  showBackButton?: boolean;
  showCart?: boolean;
  showSearch?: boolean;
  activeTab?: 'home' | 'products' | 'cart' | 'account';
  searchValue?: string;
  isSearchActive?: boolean;
  title?: string;
  refreshing?: boolean;
  onLogoPress?: () => void;
  onBackPress?: () => void;
  onCartPress?: () => void;
  onSearchPress?: () => void;
  onSearchChange?: (text: string) => void;
  onSearchClear?: () => void;
  onRefresh?: () => void;
  onHomePress?: () => void;
  onProductsPress?: () => void;
  onAccountPress?: () => void;
  scrollEnabled?: boolean;
};

const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  showLogo = true,
  showBackButton = false,
  showCart = true,
  showSearch = true,
  searchValue = '',
  isSearchActive = false,
  title,
  refreshing = false,
  onLogoPress,
  onBackPress,
  onCartPress,
  onSearchPress,
  onSearchChange,
  onSearchClear,
  onRefresh,
  scrollEnabled = true,
}) => {
  const { colors, theme } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} />
      
      {/* Fixed Header */}
      <Header 
        showLogo={showLogo}
        showBackButton={showBackButton}
        showCart={showCart}
        showSearch={showSearch}
        title={title}
        searchValue={searchValue}
        onLogoPress={onLogoPress}
        onBackPress={onBackPress}
        onCartPress={onCartPress}
        onSearchPress={onSearchPress}
        onSearchChange={onSearchChange}
        onSearchClear={onSearchClear}
        isSearchActive={isSearchActive}
      />
      
      {/* Main Content */}
      {scrollEnabled ? (
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            onRefresh ? (
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[colors.primary]}
                tintColor={colors.primary}
              />
            ) : undefined
          }
        >
          {children}
        </ScrollView>
      ) : (
        <View style={styles.content}>
          {children}
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: scale(16),
  },
});

export default MainLayout; 