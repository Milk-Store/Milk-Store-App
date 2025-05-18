import AsyncStorage from '@react-native-async-storage/async-storage';
import { Product } from '../contexts/CartContext';
import { Platform } from 'react-native';
import NetInfo from '@react-native-community/netinfo';

// Cấu hình URL API server
// Thay thế bằng địa chỉ IP thực tế của máy chủ trong mạng nội bộ
// Ví dụ: const SERVER_IP = '192.168.1.5'; 
const SERVER_IP = '192.168.1.235'; // IP từ server log
const SERVER_PORT = '8000';
const API_BASE_URL = `http://${SERVER_IP}:${SERVER_PORT}/api`;

// Timeout cho API requests (ms)
const API_TIMEOUT = 15000;
const CACHE_EXPIRY = 5 * 60 * 1000; // 5 phút cache cho GET requests
const MAX_RETRIES = 2;

// Debug API URL
console.log('API URL:', API_BASE_URL);

// Cache structure
interface CacheEntry {
  data: any;
  timestamp: number;
}

// Interface cho queue promise
interface QueueItem {
  resolve: (value: string) => void;
  reject: (reason?: any) => void;
}

// Biến để theo dõi tình trạng refresh token
let isRefreshing = false;
let failedQueue: QueueItem[] = [];
let apiCache: Record<string, CacheEntry> = {};

// Xử lý queue các request thất bại cần thực hiện lại
const processQueue = (error: Error | null | unknown, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

// Check network connection
const checkNetwork = async (): Promise<boolean> => {
  const netInfo = await NetInfo.fetch();
  return netInfo.isConnected ?? false;
};

// Apply timeout to fetch requests
const fetchWithTimeout = (url: string, options: RequestInit, timeout: number): Promise<Response> => {
  return new Promise((resolve, reject) => {
    // Set timeout
    const timer = setTimeout(() => {
      reject(new Error('Request timed out'));
    }, timeout);
    
    fetch(url, options)
      .then(response => {
        clearTimeout(timer);
        resolve(response);
      })
      .catch(err => {
        clearTimeout(timer);
        reject(err);
      });
  });
};

// Clear cache by key pattern
const clearCacheByPattern = (pattern: string) => {
  const keys = Object.keys(apiCache);
  keys.forEach(key => {
    if (key.includes(pattern)) {
      delete apiCache[key];
    }
  });
};

// Hàm refresh token
const refreshAuthToken = async () => {
  try {
    const refreshToken = await AsyncStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }
    
    const response = await fetchWithTimeout(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-client-type': 'mobile',
      },
      body: JSON.stringify({ refreshToken }),
    }, API_TIMEOUT);
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to refresh token');
    }
    
    const { accessToken, refreshToken: newRefreshToken } = data.data;
    
    if (accessToken) {
      await AsyncStorage.setItem('authToken', accessToken);
      
      if (newRefreshToken) {
        await AsyncStorage.setItem('refreshToken', newRefreshToken);
      }
      
      return accessToken;
    }
    
    throw new Error('No token received');
  } catch (error) {
    console.error('Token refresh failed:', error);
    
    // Xóa tokens nếu refresh thất bại
    await AsyncStorage.removeItem('authToken');
    await AsyncStorage.removeItem('refreshToken');
    await AsyncStorage.removeItem('user');
    
    throw error;
  }
};

// Helper function to handle API responses
const handleResponse = async (response: Response) => {
  try {
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'API request failed');
    }
    
    return data.data || data; // Lấy phần data từ response hoặc toàn bộ response
  } catch (error) {
    console.error('Response parsing error:', error);
    throw error;
  }
};

// Helper for API requests with auth token
const fetchApi = async (endpoint: string, method: string = 'GET', body?: any, requiresAuth: boolean = true, useCache: boolean = true, retryCount: number = 0) => {
  try {
    // Check network connection
    const isConnected = await checkNetwork();
    if (!isConnected) {
      // If offline and we have cached data for GET requests, return it
      const cacheKey = `${method}:${endpoint}:${JSON.stringify(body || {})}`;
      if (method === 'GET' && useCache && apiCache[cacheKey]) {
        console.log(`Using cached data for offline request: ${endpoint}`);
        return apiCache[cacheKey].data;
      }
      throw new Error('No internet connection');
    }

    // Check cache for GET requests
    if (method === 'GET' && useCache) {
      const cacheKey = `${method}:${endpoint}`;
      const cachedItem = apiCache[cacheKey];
      
      if (cachedItem && (Date.now() - cachedItem.timestamp) < CACHE_EXPIRY) {
        console.log(`Using cached data for: ${endpoint}`);
        return cachedItem.data;
      }
    }

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'x-client-type': 'mobile', // Đánh dấu client là mobile cho backend
    };

    if (requiresAuth) {
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    const options: RequestInit = {
      method,
      headers,
      // Tắt credentials vì đang sử dụng token trong header
      // credentials: 'include' không hoạt động tốt trên React Native
    };

    if (body && method !== 'GET') {
      options.body = JSON.stringify(body);
    }

    console.log(`Calling API: ${method} ${API_BASE_URL}${endpoint}`);
    const response = await fetchWithTimeout(`${API_BASE_URL}${endpoint}`, options, API_TIMEOUT);
    
    // Kiểm tra nếu token hết hạn
    if (response.status === 401 && requiresAuth) {
      // Nếu đang refresh token, thêm request vào queue
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          headers['Authorization'] = `Bearer ${token}`;
          return fetchWithTimeout(`${API_BASE_URL}${endpoint}`, options, API_TIMEOUT)
            .then(handleResponse);
        }).catch(err => {
          throw err;
        });
      }
      
      isRefreshing = true;
      
      try {
        // Làm mới token
        const newToken = await refreshAuthToken();
        
        // Cập nhật Authorization header với token mới
        headers['Authorization'] = `Bearer ${newToken}`;
        
        // Reset trạng thái refresh
        isRefreshing = false;
        
        // Xử lý queue các request thất bại
        processQueue(null, newToken);
        
        // Thực hiện lại request ban đầu với token mới
        const newResponse = await fetchWithTimeout(`${API_BASE_URL}${endpoint}`, {
          ...options,
          headers,
        }, API_TIMEOUT);
        
        return await handleResponse(newResponse);
      } catch (error) {
        isRefreshing = false;
        processQueue(error, null);
        throw error;
      }
    }
    
    // Handle server errors with retry logic
    if (response.status >= 500 && retryCount < MAX_RETRIES) {
      console.log(`Server error, retrying (${retryCount + 1}/${MAX_RETRIES})...`);
      // Exponential backoff: 1s, 2s, 4s, ...
      const delay = 1000 * Math.pow(2, retryCount); 
      await new Promise(resolve => setTimeout(resolve, delay));
      return fetchApi(endpoint, method, body, requiresAuth, useCache, retryCount + 1);
    }
    
    const data = await handleResponse(response);
    
    // Cache GET request responses
    if (method === 'GET' && useCache) {
      const cacheKey = `${method}:${endpoint}`;
      apiCache[cacheKey] = {
        data,
        timestamp: Date.now()
      };
    }
    
    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// Multipart form data upload function
const uploadWithFormData = async (endpoint: string, formData: FormData, requiresAuth: boolean = true, retryCount: number = 0) => {
  try {
    // Check network connection
    const isConnected = await checkNetwork();
    if (!isConnected) {
      throw new Error('No internet connection');
    }

    const headers: HeadersInit = {
      'x-client-type': 'mobile', // Đánh dấu client là mobile cho backend
    };

    if (requiresAuth) {
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    console.log(`Uploading to: ${API_BASE_URL}${endpoint}`);
    const response = await fetchWithTimeout(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: formData,
      // Bỏ credentials
    }, API_TIMEOUT * 2); // Longer timeout for uploads
    
    // Kiểm tra nếu token hết hạn
    if (response.status === 401 && requiresAuth) {
      try {
        // Làm mới token
        const newToken = await refreshAuthToken();
        
        // Cập nhật header với token mới
        headers['Authorization'] = `Bearer ${newToken}`;
        
        // Thực hiện lại request với token mới
        const newResponse = await fetchWithTimeout(`${API_BASE_URL}${endpoint}`, {
          method: 'POST',
          headers,
          body: formData,
        }, API_TIMEOUT * 2);
        
        return await handleResponse(newResponse);
      } catch (error) {
        throw error;
      }
    }
    
    // Handle server errors with retry logic
    if (response.status >= 500 && retryCount < MAX_RETRIES) {
      console.log(`Server error during upload, retrying (${retryCount + 1}/${MAX_RETRIES})...`);
      const delay = 1000 * Math.pow(2, retryCount);
      await new Promise(resolve => setTimeout(resolve, delay));
      return uploadWithFormData(endpoint, formData, requiresAuth, retryCount + 1);
    }

    return await handleResponse(response);
  } catch (error) {
    console.error('Upload Error:', error);
    throw error;
  }
};

// API functions
export const api = {
  // Cache management
  cache: {
    clear: () => {
      apiCache = {};
      console.log('API cache cleared');
    },
    clearByPattern: (pattern: string) => {
      clearCacheByPattern(pattern);
      console.log(`Cache cleared for pattern: ${pattern}`);
    }
  },

  // Authentication
  auth: {
    login: async (email: string, password: string) => {
      try {
        console.log('Login attempt:', email);
        const data = await fetchApi('/auth/login', 'POST', { email, password }, false, false);
        
        // Lưu thông tin user và token
        if (data.user) {
          await AsyncStorage.setItem('user', JSON.stringify(data.user));
        }
        
        if (data.accessToken) {
          await AsyncStorage.setItem('authToken', data.accessToken);
        }
        
        if (data.refreshToken) {
          await AsyncStorage.setItem('refreshToken', data.refreshToken);
        }
        
        return data;
      } catch (error) {
        console.error('Login failed:', error);
        throw error;
      }
    },
    logout: async () => {
      try {
        await fetchApi('/auth/logout', 'POST', undefined, true, false);
        // Clear cache on logout
        apiCache = {};
        // Xóa dữ liệu local
        await AsyncStorage.removeItem('user');
        await AsyncStorage.removeItem('authToken');
        await AsyncStorage.removeItem('refreshToken');
      } catch (error) {
        // Vẫn xóa dữ liệu local ngay cả khi API lỗi
        apiCache = {};
        await AsyncStorage.removeItem('user');
        await AsyncStorage.removeItem('authToken');
        await AsyncStorage.removeItem('refreshToken');
        throw error;
      }
    },
    register: async (name: string, email: string, password: string) => {
      return await fetchApi('/users/register', 'POST', { name, email, password }, false, false);
    },
    refresh: async () => {
      return await fetchApi('/auth/refresh', 'POST', undefined, true, false);
    }
  },
  
  // Products
  products: {
    getAll: async (forceRefresh: boolean = false): Promise<Product[]> => {
      console.log('Fetching all products');
      return await fetchApi('/products', 'GET', undefined, false, !forceRefresh);
    },
    
    getByCategory: async (categoryId: string, forceRefresh: boolean = false): Promise<Product[]> => {
      return await fetchApi(`/products?category_id=${categoryId}`, 'GET', undefined, false, !forceRefresh);
    },
    
    getById: async (productId: string, forceRefresh: boolean = false): Promise<Product> => {
      return await fetchApi(`/products/${productId}`, 'GET', undefined, false, !forceRefresh);
    },
    
    create: async (productData: any, imageUri?: string): Promise<Product> => {
      if (!imageUri) {
        // Nếu không có ảnh, sử dụng JSON
        const result = await fetchApi('/products', 'POST', productData, true, false);
        // Clear product cache after creating a new product
        clearCacheByPattern('/products');
        return result;
      }
      
      // Nếu có ảnh, sử dụng FormData
      const formData = new FormData();
      
      // Thêm thông tin sản phẩm
      formData.append('name', productData.name);
      formData.append('price', productData.price.toString());
      formData.append('category_id', productData.category_id.toString());
      
      if (productData.description) {
        formData.append('description', productData.description);
      }
      
      // Thêm file ảnh
      const uriParts = imageUri.split('/');
      const fileName = uriParts[uriParts.length - 1];
      
      formData.append('image', {
        uri: Platform.OS === 'android' ? imageUri : imageUri.replace('file://', ''),
        name: fileName,
        type: 'image/jpeg', // Sử dụng jpeg mặc định, cần đoán định dạng thực tế
      } as any);
      
      const result = await uploadWithFormData('/products', formData);
      // Clear product cache after creating a new product
      clearCacheByPattern('/products');
      return result;
    },
    
    update: async (productId: string, productData: any, imageUri?: string): Promise<Product> => {
      if (!imageUri) {
        // Nếu không có ảnh, sử dụng JSON
        const result = await fetchApi(`/products/${productId}`, 'PUT', productData, true, false);
        // Clear relevant cache entries
        clearCacheByPattern('/products');
        return result;
      }
      
      // Nếu có ảnh, sử dụng FormData
      const formData = new FormData();
      
      // Thêm thông tin sản phẩm
      if (productData.name) formData.append('name', productData.name);
      if (productData.price) formData.append('price', productData.price.toString());
      if (productData.category_id) formData.append('category_id', productData.category_id.toString());
      if (productData.description) formData.append('description', productData.description);
      
      // Thêm file ảnh
      const uriParts = imageUri.split('/');
      const fileName = uriParts[uriParts.length - 1];
      
      formData.append('image', {
        uri: Platform.OS === 'android' ? imageUri : imageUri.replace('file://', ''),
        name: fileName,
        type: 'image/jpeg',
      } as any);
      
      const result = await uploadWithFormData(`/products/${productId}`, formData);
      // Clear relevant cache entries
      clearCacheByPattern('/products');
      return result;
    },
    
    delete: async (productId: string): Promise<void> => {
      const result = await fetchApi(`/products/${productId}`, 'DELETE', undefined, true, false);
      // Clear product cache after deleting
      clearCacheByPattern('/products');
      return result;
    }
  },
  
  // Categories
  categories: {
    getAll: async (forceRefresh: boolean = false) => {
      return await fetchApi('/categories', 'GET', undefined, false, !forceRefresh);
    },
    
    create: async (name: string) => {
      const result = await fetchApi('/categories', 'POST', { name }, true, false);
      clearCacheByPattern('/categories');
      return result;
    },
    
    update: async (categoryId: string, name: string) => {
      const result = await fetchApi(`/categories/${categoryId}`, 'PUT', { name }, true, false);
      clearCacheByPattern('/categories');
      return result;
    },
    
    delete: async (categoryId: string) => {
      const result = await fetchApi(`/categories/${categoryId}`, 'DELETE', undefined, true, false);
      clearCacheByPattern('/categories');
      return result;
    }
  },
  
  // Orders
  orders: {
    getAll: async (forceRefresh: boolean = false) => {
      return await fetchApi('/orders', 'GET', undefined, true, !forceRefresh);
    },
    
    create: async (orderData: {
      phone: string;
      orderItems: Array<{ product_id: number; quantity: number }>;
    }) => {
      const result = await fetchApi('/orders', 'POST', orderData, false, false);
      clearCacheByPattern('/orders');
      return result;
    },
    
    update: async (orderId: string, status: string) => {
      const result = await fetchApi(`/orders/${orderId}`, 'PUT', { status }, true, false);
      clearCacheByPattern('/orders');
      return result;
    }
  },
  
  // Users
  users: {
    update: async (userId: string, userData: { name?: string; email?: string; password?: string }) => {
      return await fetchApi(`/users/${userId}`, 'PUT', userData, true, false);
    }
  }
}; 