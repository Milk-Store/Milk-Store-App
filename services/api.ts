import AsyncStorage from '@react-native-async-storage/async-storage';
import { Product } from '../contexts/CartContext';
import { Platform } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';

// Cấu hình URL API server
// Thay thế bằng địa chỉ IP thực tế của máy chủ trong mạng nội bộ
// Ví dụ: const SERVER_IP = '192.168.1.5'; 
const SERVER_IP = '192.168.1.235'; // IP từ server log
const SERVER_PORT = '8000';
const API_BASE_URL = 'https://ca94-14-243-81-73.ngrok-free.app/api';

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

interface AdminProduct {
  id: string;
  name: string;
  description: string;
  image: string;
  price: number;
  category_id: number;
  category?: string | { id: number; name: string };
  status: boolean;
}

interface PaginationData {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

interface OrderAPI {
  id: number;
  phone: string;
  name?: string;
  address?: string;
  orderItems: OrderItemAPI[];
  total: string | number;
  status: string;
  createdAt: string;
}

interface OrderItemAPI {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  product: {
    id: number;
    name: string;
    price: string | number;
    description?: string;
    image?: string;
  };
}

interface OrdersResponse {
  orders: OrderAPI[];
  pagination: PaginationData;
}

interface ProductsResponse {
  products: AdminProduct[];
  pagination: PaginationData;
}

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
          console.log('Login successful');
          await AsyncStorage.setItem('user', JSON.stringify(data.user));

          // Nếu là admin, đăng ký push token
          if (data.user.role === 'ROLE_ADMIN') {
            try {
              const pushToken = await Notifications.getExpoPushTokenAsync({
                projectId: Constants.expoConfig?.extra?.eas?.projectId || Constants.expoConfig?.extra?.projectId,
              });
              if (pushToken) {
                await api.notifications.registerToken(pushToken.data);
              }
            } catch (error) {
              console.error('Failed to register push token:', error);
            }
          }
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
        // Kiểm tra nếu là admin thì hủy đăng ký push token
        const userStr = await AsyncStorage.getItem('user');
        if (userStr) {
          const user = JSON.parse(userStr);
          if (user.role === 'ROLE_ADMIN') {
            try {
              await api.notifications.unregisterToken();
            } catch (error) {
              console.error('Failed to unregister push token:', error);
            }
          }
        }

        const response = await fetchApi('/auth/logout', 'POST', undefined, true, false);
        console.log('Logout successful');

        // Clear cache on logout
        apiCache = {};
        // Xóa dữ liệu local
        await AsyncStorage.removeItem('user');
        await AsyncStorage.removeItem('authToken');
        await AsyncStorage.removeItem('refreshToken');
      } catch (error) {
        // Vẫn xóa dữ liệu local ngay cả khi API lỗi
        console.log('Logout failed:', error);

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
    getAll: async (
      forceRefresh: boolean = false,
      page: number = 1,
      limit: number = 10,
      search: string = '',
      category_id?: number
    ): Promise<ProductsResponse> => {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search }),
        ...(category_id && { category_id: category_id.toString() })
      });
      
      const data = await fetchApi(`/products/admin/list?${queryParams}`, 'GET', undefined, false, !forceRefresh);
      return {
        products: data.products || [],
        pagination: {
          currentPage: data.currentPage,
          totalPages: data.totalPages,
          totalItems: data.totalItems,
          itemsPerPage: data.itemsPerPage
        }
      };
    },

    getHotProducts: async (forceRefresh: boolean = false): Promise<Product[]> => {
      console.log('Fetching hot products');
      return await fetchApi('/products/selling', 'GET', undefined, false, !forceRefresh);
    },

    getByCategory: async (categoryId: string, forceRefresh: boolean = false): Promise<Product[]> => {
      return await fetchApi(`/products?category_id=${categoryId}`, 'GET', undefined, false, !forceRefresh);
    },

    getById: async (productId: string, forceRefresh: boolean = false): Promise<Product> => {
      return await fetchApi(`/products/${productId}`, 'GET', undefined, false, !forceRefresh);
    },

    create: async (
      productData: Omit<AdminProduct, 'id' | 'image'>,
      imageUri?: string
    ): Promise<AdminProduct> => {
      const formData = new FormData();
      
      // Add product data
      Object.entries(productData).forEach(([key, value]) => {
        formData.append(key, value.toString());
      });
      
      // Add image if provided
      if (imageUri) {
        const filename = imageUri.split('/').pop() || 'image.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image/jpeg';
        
        formData.append('image', {
          uri: imageUri,
          name: filename,
          type,
        } as any);
      }
      
      return await fetchApi('/products/admin', 'POST', formData, true);
    },

    update: async (
      id: string,
      productData: Partial<Omit<AdminProduct, 'id' | 'image'>>,
      imageUri?: string
    ): Promise<AdminProduct> => {
      const formData = new FormData();
      
      // Add product data
      Object.entries(productData).forEach(([key, value]) => {
        formData.append(key, value.toString());
      });
      
      // Add image if provided
      if (imageUri) {
        const filename = imageUri.split('/').pop() || 'image.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image/jpeg';
        
        formData.append('image', {
          uri: imageUri,
          name: filename,
          type,
        } as any);
      }
      
      return await fetchApi(`/products/admin/${id}`, 'PUT', formData, true);
    },

    delete: async (id: string): Promise<void> => {
      await fetchApi(`/products/admin/${id}`, 'DELETE');
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
    getAll: async (page: number = 1, forceRefresh: boolean = false) => {
      try {
        const response = await fetchApi(
          `/orders/admin/list?page=${page}&limit=10`,
          'GET',
          undefined,
          true,
          !forceRefresh
        );
        console.log('API Response:', response);
        
        // Trả về đúng format từ response
        return {
          orders: response.orders || [],
          pagination: {
            currentPage: response.currentPage,
            totalPages: response.totalPages,
            totalItems: response.totalItems,
            itemsPerPage: response.itemsPerPage
          }
        };
      } catch (error) {
        console.error('Error in getAll:', error);
        throw error;
      }
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
  },

    // Sliders
  getSliders: async () => {
    try {
      const response = await fetchApi('/sliders', 'GET', undefined, false, true);      
      return response || [];
    } catch (error) {
      console.error('Error fetching sliders:', error);
      return [];
    }
  },

    // Banner Popup
  getBannerPopup: async () => {
    try {
      const response = await fetchApi('/banners/one', 'GET', undefined, false, true);
      return response || null;
    } catch (error) {
      console.error('Error fetching banner popup:', error);
      return null;
    }
  },

  // Notifications
  notifications: {
    registerToken: async (pushToken: string) => {
      return await fetchApi('/notifications/register-token', 'POST', { pushToken }, true, false);
    },
    unregisterToken: async () => {
      return await fetchApi('/notifications/unregister-token', 'POST', undefined, true, false);
    }
  }
}; 