import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

interface CategoryItemProps {
  id: string;
  name: string;
  selected?: boolean;
  onSelect: (id: string) => void;
  icon?: React.ReactNode;
}

const CategoryItem: React.FC<CategoryItemProps> = ({ 
  id, 
  name, 
  selected = false, 
  onSelect,
  icon
}) => {
  const { colors } = useTheme();
  
  return (
    <TouchableOpacity 
      style={[
        styles.categoryItem,
        { 
          backgroundColor: colors.cardBackground,
          borderColor: selected ? colors.primary : colors.separator,
          borderWidth: selected ? 2 : 1,
        }
      ]}
      onPress={() => onSelect(id)}
    >
      <View style={[styles.categoryIconContainer, { backgroundColor: `${colors.primary}15` }]}>
        {icon || <Ionicons name="cube-outline" size={24} color={colors.primary} />}
      </View>
      <Text 
        style={[styles.categoryName, { color: colors.text }]}
        numberOfLines={1}
      >
        {name}
      </Text>
      {selected && (
        <View style={[styles.selectedIndicator, { backgroundColor: colors.primary }]} />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  categoryItem: {
    alignItems: 'center',
    marginHorizontal: 6,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 12,
    width: 80,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
    position: 'relative',
  },
  categoryIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  categoryName: {
    fontSize: 12,
    textAlign: 'center',
  },
  selectedIndicator: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: 3,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  }
});

export default CategoryItem; 