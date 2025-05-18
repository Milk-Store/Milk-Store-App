import { StyleSheet as RNStyleSheet, Platform } from 'react-native';
import { normalize, scale, verticalScale, getResponsiveValue } from './responsive';

// Mở rộng StyleSheet với các tính năng thêm
const StyleSheet = {
  ...RNStyleSheet,
  
  // Tạo một responsive style dựa trên breakpoint
  responsive: <T extends RNStyleSheet.NamedStyles<T> | RNStyleSheet.NamedStyles<any>>(
    breakpointStyles: {
      xs?: T;
      sm?: T;
      md?: T;
      lg?: T;
      xl?: T;
      default: T;
    }
  ): T => {
    const baseStyles = getResponsiveValue(breakpointStyles);
    return RNStyleSheet.create(baseStyles) as T;
  },
  
  // Helper cho tạo shadow dễ dàng hơn
  createShadow: (elevation: number = 2, color: string = 'rgba(0,0,0,0.1)') => {
    return Platform.select({
      ios: {
        shadowColor: color,
        shadowOffset: { width: 0, height: elevation / 2 },
        shadowOpacity: 0.3,
        shadowRadius: elevation,
      },
      android: {
        elevation,
      },
    });
  },
  
  // Tạo ra một style với các biến động thay vì sử dụng object trực tiếp
  // Giúp tái sử dụng style với giá trị khác nhau
  create: <T extends RNStyleSheet.NamedStyles<T> | RNStyleSheet.NamedStyles<any>>(
    styles: T | (() => T)
  ): T => {
    if (typeof styles === 'function') {
      return RNStyleSheet.create(styles()) as T;
    }
    return RNStyleSheet.create(styles) as T;
  },
  
  // Xử lý style theo điều kiện
  conditionalStyles: (styles: Record<string, boolean>) => {
    return Object.keys(styles)
      .filter(key => styles[key])
      .reduce((result: any, key) => {
        result[key] = true;
        return result;
      }, {});
  },
  
  // Helper để tạo style box
  box: (
    width?: number | string,
    height?: number | string,
    backgroundColor?: string
  ) => {
    const boxStyle: any = {};
    
    if (width !== undefined) {
      boxStyle.width = typeof width === 'number' ? scale(width) : width;
    }
    
    if (height !== undefined) {
      boxStyle.height = typeof height === 'number' ? verticalScale(height) : height;
    }
    
    if (backgroundColor !== undefined) {
      boxStyle.backgroundColor = backgroundColor;
    }
    
    return boxStyle;
  },
  
  // Helper để tạo style text
  text: (
    fontSize?: number,
    color?: string,
    fontWeight?: 'normal' | 'bold' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900'
  ) => {
    const textStyle: any = {};
    
    if (fontSize !== undefined) {
      textStyle.fontSize = normalize(fontSize);
    }
    
    if (color !== undefined) {
      textStyle.color = color;
    }
    
    if (fontWeight !== undefined) {
      textStyle.fontWeight = fontWeight;
    }
    
    return textStyle;
  },
};

export default StyleSheet; 