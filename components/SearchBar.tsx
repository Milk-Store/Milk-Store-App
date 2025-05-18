import React, { memo, useState, useCallback } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

interface SearchBarProps {
  onSearch: (text: string) => void;
  placeholder?: string;
  style?: StyleProp<ViewStyle>;
  initialValue?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  placeholder = 'Tìm kiếm sản phẩm...',
  style,
  initialValue = '',
}) => {
  const { colors, theme } = useTheme();
  const [searchText, setSearchText] = useState<string>(initialValue);

  const handleTextChange = useCallback((text: string) => {
    setSearchText(text);
  }, []);

  const handleSearch = useCallback(() => {
    onSearch(searchText);
  }, [searchText, onSearch]);

  const handleClear = useCallback(() => {
    setSearchText('');
    onSearch('');
  }, [onSearch]);

  return (
    <View 
      style={[
        styles.container, 
        { 
          backgroundColor: colors.cardBackground,
          borderColor: colors.separator,
        },
        style
      ]}
    >
      <TouchableOpacity 
        onPress={handleSearch}
        style={styles.searchIcon}
      >
        <Ionicons 
          name="search-outline" 
          size={20} 
          color={colors.gray} 
        />
      </TouchableOpacity>
      <TextInput
        style={[
          styles.input,
          { color: colors.text }
        ]}
        placeholder={placeholder}
        placeholderTextColor={colors.gray}
        value={searchText}
        onChangeText={handleTextChange}
        onSubmitEditing={handleSearch}
        returnKeyType="search"
        clearButtonMode="never"
      />
      {searchText.length > 0 && (
        <TouchableOpacity 
          onPress={handleClear}
          style={styles.clearButton}
        >
          <Ionicons 
            name="close-circle" 
            size={18} 
            color={colors.gray} 
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 15,
    height: '100%',
    padding: 0,
  },
  clearButton: {
    marginLeft: 8,
    padding: 4,
  },
});

export default memo(SearchBar); 