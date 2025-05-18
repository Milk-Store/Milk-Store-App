import { Dimensions, Platform, PixelRatio } from 'react-native';

// Lấy kích thước màn hình
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Scale theo cơ sở là thiết kế trên iPhone 8 (375 x 667)
const widthBaseScale = SCREEN_WIDTH / 375;
const heightBaseScale = SCREEN_HEIGHT / 667;

// Sử dụng width hoặc height tùy thuộc vào tỷ lệ nào lớn hơn
const baseScale = Math.min(widthBaseScale, heightBaseScale);

// Chuyển đổi normal size sang responsive size
export function normalize(size: number): number {
  const newSize = size * baseScale;
  if (Platform.OS === 'ios') {
    return Math.round(PixelRatio.roundToNearestPixel(newSize));
  } else {
    return Math.round(PixelRatio.roundToNearestPixel(newSize)) - 2;
  }
}

// Các kích thước tương đối
export const scale = (size: number) => Math.round(SCREEN_WIDTH / 375 * size);
export const verticalScale = (size: number) => Math.round(SCREEN_HEIGHT / 667 * size);

// Thiết lập các breakpoint cho responsive
export const breakpoints = {
  xs: 320, // Điện thoại nhỏ
  sm: 375, // iPhone 8/X/11/12/13
  md: 414, // iPhone 8 Plus / Android lớn
  lg: 768, // Máy tính bảng nhỏ
  xl: 1024, // Máy tính bảng lớn/iPad
};

// Kiểm tra thiết bị hiện tại nằm trong breakpoint nào
export const getDeviceType = () => {
  const width = SCREEN_WIDTH;
  
  if (width < breakpoints.sm) return 'xs';
  if (width < breakpoints.md) return 'sm';
  if (width < breakpoints.lg) return 'md';
  if (width < breakpoints.xl) return 'lg';
  return 'xl';
};

// Lấy kích thước responsive dựa trên breakpoint
export const getResponsiveValue = <T>(values: {
  xs?: T;
  sm?: T;
  md?: T;
  lg?: T;
  xl?: T;
  default: T;
}): T => {
  const deviceType = getDeviceType();
  
  if (deviceType === 'xs' && values.xs !== undefined) return values.xs;
  if (deviceType === 'sm' && values.sm !== undefined) return values.sm;
  if (deviceType === 'md' && values.md !== undefined) return values.md;
  if (deviceType === 'lg' && values.lg !== undefined) return values.lg;
  if (deviceType === 'xl' && values.xl !== undefined) return values.xl;
  
  return values.default;
};

export const spacing = {
  xs: scale(4),
  sm: scale(8),
  md: scale(16),
  lg: scale(24),
  xl: scale(32),
  xxl: scale(48),
};

export const fonts = {
  size: {
    tiny: normalize(10),
    small: normalize(12),
    regular: normalize(14),
    medium: normalize(16),
    large: normalize(18),
    xlarge: normalize(20),
    xxlarge: normalize(24),
  },
  weight: {
    thin: '300' as const,
    regular: '400' as const,
    medium: '500' as const,
    bold: '700' as const,
    heavy: '900' as const,
  },
};

export default {
  normalize,
  scale,
  verticalScale,
  breakpoints,
  getDeviceType,
  getResponsiveValue,
  spacing,
  fonts,
}; 