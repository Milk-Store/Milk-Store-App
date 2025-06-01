import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';

interface CategoryItemProps {
  id: string;
  name: string;
  image?: string;
  selected?: boolean;
  onSelect: (id: string) => void;
}

export default function CategoryItem({ id, name, image, selected, onSelect }: CategoryItemProps) {
  const { colors } = useTheme();

  return (
    <TouchableOpacity 
      style={[
        styles.container, 
        { 
          backgroundColor: selected ? '#FFF0F7' : colors.cardBackground,
          borderColor: selected ? '#FF4D94' : 'transparent',
          borderWidth: 1,
        }
      ]}
      onPress={() => onSelect(id)}
    >
      <View style={[
        styles.iconCircle, 
        { 
          backgroundColor: selected ? '#FFE5F1' : colors.primary + '20'
        }
      ]}>
        {image ? (
          <Image 
            source={{ uri: image }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <Ionicons 
            name="cube-outline" 
            size={24} 
            color={selected ? '#FF4D94' : colors.primary} 
          />
        )}
      </View>
      <Text 
        style={[
          styles.name, 
          { 
            color: selected ? '#FF4D94' : colors.text,
            fontWeight: selected ? 'bold' : 'normal' 
          }
        ]} 
        numberOfLines={1}
      >
        {name}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
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
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
  name: {
    fontSize: 12,
    textAlign: 'center',
  },
}); 