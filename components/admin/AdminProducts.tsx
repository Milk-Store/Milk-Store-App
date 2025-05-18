import React, { useState, useEffect } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
    Dimensions,
    Platform,
    KeyboardAvoidingView,
    SafeAreaView,
    Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { api } from '../../services/api';
import { formatCurrency } from '../../utils/format';
import * as ImagePicker from 'expo-image-picker';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// Định nghĩa interface cho Product
interface Product {
  id: string;
  name: string;
  description: string;
  image: string;
  price: number;
  category_id?: number;
  category?: string | { id: number; name: string };
}

// Định nghĩa interface cho Category
interface Category {
  id: number;
  name: string;
}

// ProductForm Component - Tách riêng form ra thành component riêng
const ProductForm = ({ 
  modalMode, 
  currentProduct, 
  categories, 
  isSubmitting, 
  colors, 
  onCancel, 
  onSave 
}: { 
  modalMode: 'add' | 'edit';
  currentProduct: Product | null;
  categories: Category[];
  isSubmitting: boolean;
  colors: any;
  onCancel: () => void;
  onSave: (productData: {
    name: string;
    price: string;
    description: string; 
    category_id: number | null;
    imageUri: string | null;
  }) => void;
}) => {
  // Form fields
  const [productName, setProductName] = useState(currentProduct?.name || '');
  const [productPrice, setProductPrice] = useState(currentProduct?.price ? currentProduct.price.toString() : '');
  const [productDescription, setProductDescription] = useState(currentProduct?.description || '');
  const [productCategory, setProductCategory] = useState<number | null>(
    currentProduct?.category_id ? parseInt(currentProduct.category_id.toString()) : null
  );
  const [imagePreview, setImagePreview] = useState<string | null>(currentProduct?.image || null);
  const [isPickerVisible, setIsPickerVisible] = useState(false);

  // Function to pick an image from the gallery
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

  // Dismiss keyboard when tapping outside of inputs
  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  const validateForm = () => {
    if (!productName.trim()) {
      Alert.alert('Lỗi', 'Tên sản phẩm không được để trống');
      return false;
    }
    
    if (!productPrice.trim() || isNaN(Number(productPrice))) {
      Alert.alert('Lỗi', 'Giá không hợp lệ');
      return false;
    }
    
    if (!imagePreview) {
      Alert.alert('Lỗi', 'Vui lòng chọn hình ảnh sản phẩm');
      return false;
    }
    
    if (!productDescription.trim()) {
      Alert.alert('Lỗi', 'Mô tả sản phẩm không được để trống');
      return false;
    }
    
    if (productCategory === null) {
      Alert.alert('Lỗi', 'Vui lòng chọn danh mục');
      return false;
    }
    
    return true;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;
    
    onSave({
      name: productName.trim(),
      price: productPrice,
      description: productDescription.trim(),
      category_id: productCategory,
      imageUri: imagePreview
    });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1 }}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
    >
      <SafeAreaView style={styles.modalContainer}>
        <TouchableWithoutFeedback onPress={dismissKeyboard}>
          <View style={[styles.modalContent, { backgroundColor: colors.cardBackground }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {modalMode === 'add' ? 'Thêm sản phẩm mới' : 'Sửa sản phẩm'}
              </Text>
              <TouchableOpacity 
                onPress={onCancel}
                hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
              >
                <Ionicons name="close-outline" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            
            <ScrollView 
              style={styles.formContainer}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.formContentContainer}
              keyboardShouldPersistTaps="handled"
            >
              <Text style={[styles.fieldLabel, { color: colors.gray }]}>Tên sản phẩm *</Text>
              <TextInput
                style={[styles.input, { color: colors.text, borderColor: colors.separator }]}
                value={productName}
                onChangeText={setProductName}
                placeholder="Nhập tên sản phẩm"
                placeholderTextColor={colors.gray}
              />
              
              <Text style={[styles.fieldLabel, { color: colors.gray }]}>Giá *</Text>
              <TextInput
                style={[styles.input, { color: colors.text, borderColor: colors.separator }]}
                value={productPrice}
                onChangeText={setProductPrice}
                placeholder="Nhập giá sản phẩm"
                placeholderTextColor={colors.gray}
                keyboardType="numeric"
              />
              
              <Text style={[styles.fieldLabel, { color: colors.gray }]}>Hình ảnh *</Text>
              <TouchableOpacity 
                style={[styles.imageSelector, 
                  { borderColor: imagePreview ? colors.primary : colors.separator }
                ]}
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
              
              <Text style={[styles.fieldLabel, { color: colors.gray }]}>Danh mục *</Text>
              <View style={[styles.pickerContainer, { borderColor: colors.separator }]}>
                <FlatList
                  data={categories}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  keyExtractor={(item) => item.id.toString()}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={[
                        styles.categoryItem,
                        { 
                          backgroundColor: productCategory === item.id 
                            ? colors.primary 
                            : `${colors.primary}20`,
                        }
                      ]}
                      onPress={() => setProductCategory(item.id)}
                    >
                      <Text 
                        style={[
                          styles.categoryItemText, 
                          { color: productCategory === item.id ? '#FFFFFF' : colors.primary }
                        ]}
                      >
                        {item.name}
                      </Text>
                    </TouchableOpacity>
                  )}
                  ListEmptyComponent={
                    <Text style={[styles.noCategories, { color: colors.gray }]}>
                      Không có danh mục nào
                    </Text>
                  }
                />
              </View>
              
              <Text style={[styles.fieldLabel, { color: colors.gray }]}>Mô tả *</Text>
              <TextInput
                style={[styles.textarea, { color: colors.text, borderColor: colors.separator }]}
                value={productDescription}
                onChangeText={setProductDescription}
                placeholder="Nhập mô tả sản phẩm"
                placeholderTextColor={colors.gray}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
              
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[styles.cancelButton, { borderColor: colors.separator }]}
                  onPress={onCancel}
                  disabled={isSubmitting}
                >
                  <Text style={[styles.cancelButtonText, { color: colors.text }]}>Hủy</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.saveButton, { backgroundColor: colors.primary }]}
                  onPress={handleSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.saveButtonText}>
                      {modalMode === 'add' ? 'Thêm sản phẩm' : 'Cập nhật'}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </TouchableWithoutFeedback>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

export default function AdminProducts() {
  const { colors } = useTheme();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  // Solicitar permisos al montar el componente
  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso denegado', 'Necesitamos permisos para acceder a tu galería de imágenes');
      }
    })();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch products and categories in parallel
      const [productsData, categoriesData] = await Promise.all([
        api.products.getAll(),
        api.categories.getAll()
      ]);
      
      setProducts(productsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error fetching data:', error);
      Alert.alert('Lỗi', 'Không thể tải dữ liệu từ server');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddProduct = () => {
    setModalMode('add');
    setCurrentProduct(null);
    setIsModalVisible(true);
  };

  const handleEditProduct = (product: Product) => {
    setModalMode('edit');
    setCurrentProduct(product);
    setIsModalVisible(true);
  };

  const handleDeleteProduct = (productId: string) => {
    Alert.alert(
      'Xác nhận xóa',
      'Bạn có chắc chắn muốn xóa sản phẩm này?',
      [
        { text: 'Hủy', style: 'cancel' },
        { 
          text: 'Xóa', 
          style: 'destructive',
          onPress: () => confirmDeleteProduct(productId)
        }
      ]
    );
  };

  const confirmDeleteProduct = async (productId: string) => {
    try {
      setIsLoading(true);
      await api.products.delete(productId);
      
      // Update local state
      setProducts(prevProducts => 
        prevProducts.filter(product => product.id !== productId)
      );
      
      Alert.alert('Thành công', 'Đã xóa sản phẩm');
    } catch (error) {
      console.error('Error deleting product:', error);
      Alert.alert('Lỗi', 'Không thể xóa sản phẩm');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProduct = async (formData: {
    name: string;
    price: string;
    description: string;
    category_id: number | null;
    imageUri: string | null;
  }) => {
    if (!formData.category_id || !formData.imageUri) return;
    
    setIsSubmitting(true);

    try {
      const productData = {
        name: formData.name,
        price: Number(formData.price),
        description: formData.description,
        category_id: formData.category_id,
      };

      // Kiểm tra xem đường dẫn hình ảnh có phải là local file URI không
      const isLocalImage = formData.imageUri && (
        formData.imageUri.startsWith('file://') || 
        formData.imageUri.startsWith('content://') || 
        formData.imageUri.includes('ImagePicker')
      );

      if (modalMode === 'add') {
        const newProduct = await api.products.create(
          productData as any,
          isLocalImage ? formData.imageUri : undefined
        );
        
        setProducts(prevProducts => [...prevProducts, newProduct]);
        Alert.alert('Thành công', 'Thêm sản phẩm thành công');
      } else if (modalMode === 'edit' && currentProduct) {
        const updatedProduct = await api.products.update(
          currentProduct.id, 
          productData as any,
          isLocalImage ? formData.imageUri : undefined
        );
        
        // Update local state
        setProducts(prevProducts => 
          prevProducts.map(product => 
            product.id === currentProduct.id 
              ? updatedProduct
              : product
          )
        );
        
        Alert.alert('Thành công', 'Cập nhật sản phẩm thành công');
      }
      
      setIsModalVisible(false);
    } catch (error) {
      console.error('Error saving product:', error);
      Alert.alert('Lỗi', 'Không thể lưu sản phẩm');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render product item inside the component to have access to colors
  const renderProductItem = ({ item }: { item: Product }) => (
    <View style={[styles.productCard, { backgroundColor: colors.cardBackground }]}>
      <Image 
        source={{ uri: item.image }}
        style={styles.productImage}
        resizeMode="cover"
      />
      <View style={styles.productInfo}>
        <Text style={[styles.productName, { color: colors.text }]} numberOfLines={1}>{item.name}</Text>
        <Text style={[styles.productPrice, { color: colors.primary }]}>{formatCurrency(item.price)}</Text>
        
        <View style={styles.categoryContainer}>
          <Ionicons name="list-outline" size={14} color={colors.gray} />
          <Text style={[styles.categoryText, { color: colors.gray }]}>
            {categories.find(cat => cat.id === parseInt(item.category_id?.toString() || '0'))?.name || 'Không có danh mục'}
          </Text>
        </View>
      </View>
      
      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={[styles.editButton, { backgroundColor: `${colors.primary}20` }]}
          onPress={() => handleEditProduct(item)}
        >
          <Ionicons name="create-outline" size={18} color={colors.primary} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.deleteButton, { backgroundColor: `${colors.error}20` }]}
          onPress={() => handleDeleteProduct(item.id)}
        >
          <Ionicons name="trash-outline" size={18} color={colors.error} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Quản lý sản phẩm</Text>
        
        <TouchableOpacity 
          style={[styles.addButton, { backgroundColor: colors.primary }]}
          onPress={handleAddProduct}
        >
          <Ionicons name="add-outline" size={24} color="#FFFFFF" />
          <Text style={styles.addButtonLabel}>Thêm sản phẩm</Text>
        </TouchableOpacity>
      </View>
      
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          renderItem={renderProductItem}
          contentContainerStyle={styles.productsList}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="cube-outline" size={48} color={colors.gray} />
              <Text style={[styles.emptyText, { color: colors.gray }]}>
                Chưa có sản phẩm nào
              </Text>
              <TouchableOpacity 
                style={[styles.emptyButton, { backgroundColor: colors.primary }]}
                onPress={handleAddProduct}
              >
                <Text style={styles.emptyButtonText}>Thêm sản phẩm đầu tiên</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
      
      {/* Product Form Modal */}
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <ProductForm 
          modalMode={modalMode}
          currentProduct={currentProduct}
          categories={categories}
          isSubmitting={isSubmitting}
          colors={colors}
          onCancel={() => setIsModalVisible(false)}
          onSave={handleSaveProduct}
        />
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
    fontSize: 20,
    fontWeight: 'bold',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonLabel: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productsList: {
    paddingBottom: 16,
  },
  productCard: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  productImage: {
    width: 70,
    height: 70,
    borderRadius: 8,
  },
  productInfo: {
    flex: 1,
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  categoryText: {
    fontSize: 14,
    marginLeft: 4,
  },
  actionButtons: {
    flexDirection: 'column',
    justifyContent: 'center',
    paddingLeft: 8,
  },
  editButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  emptyButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 0 : 24,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 20,
    maxHeight: SCREEN_HEIGHT * 0.85,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  formContainer: {
    maxHeight: SCREEN_HEIGHT * 0.7,
  },
  formContentContainer: {
    paddingBottom: 20,
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
  textarea: {
    minHeight: 100,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 16,
  },
  pickerContainer: {
    marginBottom: 16,
  },
  categoryItem: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    marginRight: 8,
  },
  categoryItemText: {
    fontSize: 14,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: 16,
  },
  cancelButton: {
    flex: 1,
    height: 46,
    borderWidth: 1,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 6,
  },
  saveButton: {
    flex: 1,
    height: 46,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 6,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
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
  noCategories: {
    fontSize: 14,
    textAlign: 'center',
    padding: 12,
  },
}); 