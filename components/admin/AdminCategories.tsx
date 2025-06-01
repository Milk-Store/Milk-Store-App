import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
  Image,
  Platform,
  KeyboardAvoidingView,
  SafeAreaView,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { api } from '../../services/api';
import * as ImagePicker from 'expo-image-picker';

type Category = {
  id: string;
  name: string;
  image: string;
};

export default function AdminCategories() {
  const { colors } = useTheme();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
  const [categoryName, setCategoryName] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPickerVisible, setIsPickerVisible] = useState(false);

  useEffect(() => {
    fetchCategories();
    requestImagePermission();
  }, []);

  const requestImagePermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Quyền truy cập bị từ chối', 'Chúng tôi cần quyền truy cập vào thư viện ảnh của bạn');
    }
  };

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const data = await api.categories.getAll();
      console.log('Categories loaded:', data);
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách danh mục');
    } finally {
      setIsLoading(false);
    }
  };

  const pickImage = async () => {
    try {
      setIsPickerVisible(true);
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      setIsPickerVisible(false);

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedAsset = result.assets[0];
        setImagePreview(selectedAsset.uri);
      }
    } catch (error) {
      setIsPickerVisible(false);
      console.error('Error picking image:', error);
      Alert.alert('Lỗi', 'Không thể chọn hình ảnh');
    }
  };

  const handleAddCategory = () => {
    setModalMode('add');
    setCurrentCategory(null);
    setCategoryName('');
    setImagePreview(null);
    setIsModalVisible(true);
  };

  const handleEditCategory = (category: Category) => {
    setModalMode('edit');
    setCurrentCategory(category);
    setCategoryName(category.name);
    setImagePreview(category.image);
    setIsModalVisible(true);
  };

  const handleDeleteCategory = (categoryId: string) => {
    Alert.alert(
      'Xác nhận xóa',
      'Bạn có chắc chắn muốn xóa danh mục này?',
      [
        { text: 'Hủy', style: 'cancel' },
        { 
          text: 'Xóa', 
          style: 'destructive',
          onPress: () => confirmDeleteCategory(categoryId)
        }
      ]
    );
  };

  const confirmDeleteCategory = async (categoryId: string) => {
    try {
      await api.categories.delete(categoryId);
      setCategories(prevCategories => 
        prevCategories.filter(cat => cat.id !== categoryId)
      );
      Alert.alert('Thành công', 'Đã xóa danh mục');
    } catch (error) {
      console.error('Error deleting category:', error);
      Alert.alert('Lỗi', 'Không thể xóa danh mục');
    }
  };

  const validateForm = () => {
    if (!categoryName.trim()) {
      Alert.alert('Lỗi', 'Tên danh mục không được để trống');
      return false;
    }

    if (!imagePreview) {
      Alert.alert('Lỗi', 'Vui lòng chọn hình ảnh cho danh mục');
      return false;
    }

    return true;
  };

  const handleSaveCategory = async () => {
    if (!validateForm()) return;
    if (!imagePreview) return;

    setIsSubmitting(true);
    try {
      if (modalMode === 'add') {
        const newCategory = await api.categories.create(categoryName.trim(), imagePreview);
        setCategories(prevCategories => [...prevCategories, newCategory]);
        Alert.alert('Thành công', 'Thêm danh mục thành công');
      } else if (modalMode === 'edit' && currentCategory) {
        const updatedCategory = await api.categories.update(
          currentCategory.id, 
          categoryName.trim(),
          imagePreview
        );
        setCategories(prevCategories => 
          prevCategories.map(cat => 
            cat.id === currentCategory.id 
              ? updatedCategory 
              : cat
          )
        );
        Alert.alert('Thành công', 'Cập nhật danh mục thành công');
      }
      setIsModalVisible(false);
    } catch (error) {
      console.error('Error saving category:', error);
      Alert.alert('Lỗi', 'Không thể lưu danh mục');
    } finally {
      setIsSubmitting(false);
    }
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  const renderCategoryItem = ({ item }: { item: Category }) => (
    <View 
      style={[
        styles.categoryItem, 
        { backgroundColor: colors.cardBackground, borderColor: colors.separator }
      ]}
    >
      <View style={styles.categoryContent}>
        <Image 
          source={{ uri: item.image }}
          style={styles.categoryImage}
          resizeMode="cover"
        />
        <Text style={[styles.categoryName, { color: colors.text }]}>{item.name}</Text>
      </View>
      
      <View style={styles.actions}>
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: `${colors.primary}20` }]}
          onPress={() => handleEditCategory(item)}
        >
          <Ionicons name="create-outline" size={20} color={colors.primary} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: `${colors.error}20` }]}
          onPress={() => handleDeleteCategory(item.id)}
        >
          <Ionicons name="trash-outline" size={20} color={colors.error} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Danh mục</Text>
        
        <TouchableOpacity 
          style={[styles.addButton, { backgroundColor: colors.primary }]}
          onPress={handleAddCategory}
        >
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>
      
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={categories}
          renderItem={renderCategoryItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: colors.text }]}>
                Chưa có danh mục nào. Thêm danh mục mới để bắt đầu.
              </Text>
            </View>
          }
        />
      )}
      
      {/* Add/Edit Category Modal */}
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}
        >
          <SafeAreaView style={styles.modalContainer}>
            <TouchableWithoutFeedback onPress={dismissKeyboard}>
              <View style={[styles.modalContent, { backgroundColor: colors.cardBackground }]}>
                <View style={styles.modalHeader}>
                  <Text style={[styles.modalTitle, { color: colors.text }]}>
                    {modalMode === 'add' ? 'Thêm danh mục mới' : 'Chỉnh sửa danh mục'}
                  </Text>
                  <TouchableOpacity 
                    onPress={() => setIsModalVisible(false)}
                    hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
                  >
                    <Ionicons name="close-outline" size={24} color={colors.text} />
                  </TouchableOpacity>
                </View>

                <Text style={[styles.fieldLabel, { color: colors.gray }]}>Tên danh mục *</Text>
                <TextInput
                  style={[styles.input, { color: colors.text, borderColor: colors.separator }]}
                  value={categoryName}
                  onChangeText={setCategoryName}
                  placeholder="Nhập tên danh mục"
                  placeholderTextColor={colors.gray}
                />

                <Text style={[styles.fieldLabel, { color: colors.gray }]}>Hình ảnh *</Text>
                <TouchableOpacity 
                  style={[styles.imageSelector, { borderColor: imagePreview ? colors.primary : colors.separator }]}
                  onPress={pickImage}
                  activeOpacity={0.7}
                  disabled={isPickerVisible}
                >
                  {imagePreview ? (
                    <>
                      <Image 
                        source={{ uri: imagePreview }} 
                        style={styles.previewImage} 
                        resizeMode="cover"
                      />
                      <View style={styles.imageEditOverlay}>
                        <Ionicons name="camera" size={24} color="#FFFFFF" />
                        <Text style={styles.imageEditText}>Đổi ảnh</Text>
                      </View>
                    </>
                  ) : (
                    <View style={styles.placeholderContainer}>
                      <Ionicons name="image-outline" size={32} color={colors.gray} />
                      <Text style={[styles.placeholderText, { color: colors.gray }]}>
                        Bấm để chọn ảnh
                      </Text>
                    </View>
                  )}
                  {isPickerVisible && (
                    <View style={styles.loadingOverlay}>
                      <ActivityIndicator size="large" color={colors.primary} />
                    </View>
                  )}
                </TouchableOpacity>

                <View style={styles.modalButtons}>
                  <TouchableOpacity 
                    style={[styles.modalButton, styles.cancelButton, { borderColor: colors.separator }]}
                    onPress={() => setIsModalVisible(false)}
                    disabled={isSubmitting}
                  >
                    <Text style={[styles.buttonText, { color: colors.text }]}>Hủy</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.modalButton, styles.saveButton, { backgroundColor: colors.primary }]}
                    onPress={handleSaveCategory}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Text style={[styles.buttonText, { color: 'white' }]}>
                        {modalMode === 'add' ? 'Thêm' : 'Cập nhật'}
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </SafeAreaView>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingBottom: 16,
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  categoryContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 16,
  },
  modalContent: {
    borderRadius: 12,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    height: 46,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  imageSelector: {
    height: 150,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 16,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: 150,
    borderRadius: 8,
  },
  placeholderContainer: {
    alignItems: 'center',
  },
  placeholderText: {
    marginTop: 8,
  },
  imageEditOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageEditText: {
    color: '#FFFFFF',
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    height: 46,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 6,
  },
  cancelButton: {
    borderWidth: 1,
  },
  saveButton: {},
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
}); 