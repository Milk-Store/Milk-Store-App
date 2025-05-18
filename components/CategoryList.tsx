import React, { memo, useState, useCallback, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  StyleProp,
  ViewStyle,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { api } from '../services/api';

interface Category {
  id: string;
  name: string;
}

interface CategoryListProps {
  style?: StyleProp<ViewStyle>;
  onSelectCategory: (categoryId: string) => void;
  selectedCategory?: string;
}

const CategoryList: React.FC<CategoryListProps> = ({
  style,
  onSelectCategory,
  selectedCategory,
}) => {
  const { colors } = useTheme();
  const [selected, setSelected] = useState<string>(selectedCategory || 'all');
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const data = await api.categories.getAll();
        setCategories(data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleSelect = useCallback((categoryId: string) => {
    setSelected(categoryId);
    onSelectCategory(categoryId);
  }, [onSelectCategory]);

  if (loading) {
    return (
      <View style={[styles.container, style]}>
        <Text style={[styles.title, { color: colors.text }]}>
          Danh mục sản phẩm
        </Text>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <Text style={[styles.title, { color: colors.text }]}>
        Danh mục sản phẩm
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <TouchableOpacity
          style={[
            styles.categoryItem,
            {
              backgroundColor: selected === 'all' ? colors.primary : colors.cardBackground,
              borderColor: colors.separator,
            },
          ]}
          onPress={() => handleSelect('all')}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.categoryText,
              { color: selected === 'all' ? 'white' : colors.text },
            ]}
          >
            Tất cả
          </Text>
        </TouchableOpacity>

        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryItem,
              {
                backgroundColor: selected === category.id ? colors.primary : colors.cardBackground,
                borderColor: colors.separator,
              },
            ]}
            onPress={() => handleSelect(category.id)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.categoryText,
                { color: selected === category.id ? 'white' : colors.text },
              ]}
            >
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  categoryItem: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
  },
  loadingContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    height: 40,
    justifyContent: 'center',
  },
});

export default memo(CategoryList); 