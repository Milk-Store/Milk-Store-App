/**
 * Colors used throughout the app, for both light and dark modes.
 * Modern palette with clean, user-friendly colors.
 */

import { ColorSchemeName } from 'react-native';

// Main colors 
const primaryLight = '#FF5A8C'; // Brighter pink
const primaryDark = '#FF7BA6';
const accentLight = '#FF4077'; // Deeper pink
const accentDark = '#FF5F8F'; 
const successLight = '#4DD663';
const successDark = '#34BE4B';

const Colors = {
  light: {
    // Base colors
    text: '#1F2433',
    background: '#FFFFFF',
    tint: primaryLight,
    
    // UI elements
    tabIconDefault: '#C7C9D9',
    tabIconSelected: primaryLight,
    separator: '#EAECF0',
    cardBackground: '#F9FAFB',
    
    // Brand colors
    primary: primaryLight,
    secondary: '#FFE6EC',
    accent: accentLight,
    
    // Status colors
    success: successLight,
    error: '#FF4D4D',
    warning: '#FFB443',
    info: '#3AA0FF',
    
    // Neutral colors
    gray: '#8F95B2',
    lightGray: '#EBEDF2',
    mediumGray: '#C7C9D9',
    darkGray: '#646A86',
    
    // Shadows
    shadowColor: 'rgba(0, 0, 0, 0.1)',
  },
  dark: {
    // Base colors
    text: '#FFFFFF',
    background: '#121827',
    tint: primaryDark,
    
    // UI elements
    tabIconDefault: '#70768C',
    tabIconSelected: primaryDark,
    separator: '#262D40',
    cardBackground: '#1E2336',
    
    // Brand colors
    primary: primaryDark,
    secondary: '#3D2A38',
    accent: accentDark,
    
    // Status colors
    success: successDark,
    error: '#FF5C5C',
    warning: '#FFB443',
    info: '#49A8FF',
    
    // Neutral colors
    gray: '#8E93A8',
    lightGray: '#2D3446',
    mediumGray: '#4D5673',
    darkGray: '#BEC1CF',
    
    // Shadows
    shadowColor: 'rgba(0, 0, 0, 0.3)',
  },
};

export default Colors;

export function useThemeColor(
  scheme: ColorSchemeName,
  colorName: keyof typeof Colors.light & keyof typeof Colors.dark,
) {
  return Colors[scheme === 'dark' ? 'dark' : 'light'][colorName];
}
