import React, { createContext, useContext, useReducer, useMemo, useCallback } from 'react';
import { api } from '../services/api';

// Định nghĩa types
export type Product = {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
  category: string;
  category_id: string;
  category_name?: string;
  discount?: number;
};

export type CartItem = {
  product: Product;
  quantity: number;
};

type CartState = {
  items: CartItem[];
  total: number;
};

type CartAction =
  | { type: 'ADD_TO_CART'; payload: CartItem }
  | { type: 'REMOVE_FROM_CART'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'CLEAR_CART' };

type CartContextType = {
  cart: CartState;
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  checkout: (phone: string) => Promise<any>;
};

// Reducer function
const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'ADD_TO_CART':
      const existingItemIndex = state.items.findIndex(
        item => item.product.id === action.payload.product.id
      );

      if (existingItemIndex !== -1) {
        // Item already exists, update quantity
        const updatedItems = [...state.items];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + action.payload.quantity,
        };
        
        return {
          ...state,
          items: updatedItems,
          total: state.total + (action.payload.product.price * action.payload.quantity),
        };
      } else {
        // Add new item
        return {
          ...state,
          items: [...state.items, action.payload],
          total: state.total + (action.payload.product.price * action.payload.quantity),
        };
      }

    case 'REMOVE_FROM_CART':
      const itemToRemove = state.items.find(item => item.product.id === action.payload);
      if (!itemToRemove) return state;

      return {
        ...state,
        items: state.items.filter(item => item.product.id !== action.payload),
        total: state.total - (itemToRemove.product.price * itemToRemove.quantity),
      };

    case 'UPDATE_QUANTITY':
      const targetItemIndex = state.items.findIndex(
        item => item.product.id === action.payload.id
      );

      if (targetItemIndex === -1) return state;

      const updatedItems = [...state.items];
      const oldQuantity = updatedItems[targetItemIndex].quantity;
      const newQuantity = action.payload.quantity;
      updatedItems[targetItemIndex] = {
        ...updatedItems[targetItemIndex],
        quantity: newQuantity,
      };

      return {
        ...state,
        items: updatedItems,
        total: state.total + 
          ((newQuantity - oldQuantity) * updatedItems[targetItemIndex].product.price),
      };

    case 'CLEAR_CART':
      return {
        items: [],
        total: 0,
      };

    default:
      return state;
  }
};

// Initial state
const initialState: CartState = {
  items: [],
  total: 0,
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, dispatch] = useReducer(cartReducer, initialState);

  const addToCart = useCallback((item: CartItem) => {
    dispatch({ type: 'ADD_TO_CART', payload: item });
  }, []);

  const removeFromCart = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: id });
  }, []);

  const updateQuantity = useCallback((id: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } });
  }, []);

  const clearCart = useCallback(() => {
    dispatch({ type: 'CLEAR_CART' });
  }, []);

  // Phương thức checkout để tạo đơn hàng
  const checkout = useCallback(async (phone: string) => {
    try {
      // Chuẩn bị dữ liệu đơn hàng theo định dạng backend yêu cầu
      const orderData = {
        phone,
        orderItems: cart.items.map(item => ({
          product_id: parseInt(item.product.id),
          quantity: item.quantity
        }))
      };
      
      // Gọi API tạo đơn hàng
      const result = await api.orders.create(orderData);
      
      // Nếu tạo đơn hàng thành công, xóa giỏ hàng
      if (result) {
        clearCart();
      }
      
      return result;
    } catch (error) {
      console.error('Checkout error:', error);
      throw error;
    }
  }, [cart.items, clearCart]);

  const value = useMemo(
    () => ({
      cart,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      checkout
    }),
    [cart, addToCart, removeFromCart, updateQuantity, clearCart, checkout]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}; 