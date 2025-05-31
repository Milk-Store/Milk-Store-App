import React from 'react';
import { View, StyleSheet, SafeAreaView, StatusBar, Platform } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import Header from '../components/Header';

type CustomerLayoutProps = {
  children: React.ReactNode;
  showBackButton?: boolean;
  showLogo?: boolean;
  showCart?: boolean;
  showSearch?: boolean;
  title?: string;
  onBackPress?: () => void;
  onLogoPress?: () => void;
  onCartPress?: () => void;
  onSearchPress?: () => void;
  onSearchChange?: (text: string) => void;
  onSearchClear?: () => void;
  searchValue?: string;
  isSearchActive?: boolean;
  scrollEnabled?: boolean;
  activeTab: 'home' | 'products' | 'cart' | 'account';
  onHomePress: () => void;
  onProductsPress: () => void;
  onAccountPress: () => void;
};

export default function CustomerLayout({
  children,
  showBackButton = false,
  showLogo = true,
  showCart = true,
  showSearch = false,
  title,
  onBackPress,
  onLogoPress,
  onCartPress,
  onSearchPress,
  onSearchChange,
  onSearchClear,
  searchValue,
  isSearchActive,
  scrollEnabled = true,
  activeTab,
  onHomePress,
  onProductsPress,
  onAccountPress,
}: CustomerLayoutProps) {
  const { colors, theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar 
        barStyle={theme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />
      
      <SafeAreaView style={styles.safeArea}>
        <Header 
          showLogo={showLogo}
          showBackButton={showBackButton}
          showCart={showCart}
          showSearch={showSearch}
          title={title}
          onBackPress={onBackPress}
          onLogoPress={onLogoPress}
          onCartPress={onCartPress}
          onSearchPress={onSearchPress}
          onSearchChange={onSearchChange}
          onSearchClear={onSearchClear}
          searchValue={searchValue}
          isSearchActive={isSearchActive}
        />

        <View style={[styles.content, !scrollEnabled && styles.staticContent]}>
          {children}
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  content: {
    flex: 1,
  },
  staticContent: {
    flexGrow: 1,
  },
}); 