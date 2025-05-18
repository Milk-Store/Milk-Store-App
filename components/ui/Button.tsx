import React, { memo } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  TouchableOpacityProps,
  StyleProp,
  View,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'success' | 'error';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  loading?: boolean;
  disabled?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  elevation?: number;
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  loading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  style,
  textStyle,
  elevation = 2,
  ...rest
}) => {
  const { colors, theme } = useTheme();
  
  // Determine button and text colors based on variant and theme
  let backgroundColor;
  let textColor;
  let borderColor;
  
  switch (variant) {
    case 'primary':
      backgroundColor = colors.primary;
      textColor = 'white';
      borderColor = colors.primary;
      break;
    case 'secondary':
      backgroundColor = colors.secondary;
      textColor = theme === 'light' ? colors.primary : 'white';
      borderColor = colors.secondary;
      break;
    case 'outline':
      backgroundColor = 'transparent';
      textColor = colors.primary;
      borderColor = colors.primary;
      break;
    case 'ghost':
      backgroundColor = 'transparent';
      textColor = colors.primary;
      borderColor = 'transparent';
      break;
    case 'success':
      backgroundColor = colors.success;
      textColor = 'white';
      borderColor = colors.success;
      break;
    case 'error':
      backgroundColor = colors.error;
      textColor = 'white';
      borderColor = colors.error;
      break;
    default:
      backgroundColor = colors.primary;
      textColor = 'white';
      borderColor = colors.primary;
  }
  
  // Apply size-specific styles
  let paddingVertical;
  let paddingHorizontal;
  let fontSize;
  let borderRadius = 12;
  
  switch (size) {
    case 'small':
      paddingVertical = 8;
      paddingHorizontal = 16;
      fontSize = 14;
      borderRadius = 10;
      break;
    case 'medium':
      paddingVertical = 12;
      paddingHorizontal = 20;
      fontSize = 16;
      break;
    case 'large':
      paddingVertical = 16;
      paddingHorizontal = 24;
      fontSize = 18;
      break;
    default:
      paddingVertical = 12;
      paddingHorizontal = 20;
      fontSize = 16;
  }
  
  // Modify styles for disabled state
  if (disabled || loading) {
    backgroundColor = theme === 'light' ? colors.lightGray : colors.mediumGray;
    textColor = theme === 'light' ? colors.mediumGray : colors.lightGray;
    borderColor = 'transparent';
  }
  
  // Shadow settings based on theme and variant
  let shadowStyle = {};
  
  if (variant !== 'outline' && variant !== 'ghost' && !disabled && !loading) {
    shadowStyle = theme === 'light' ? {
      shadowColor: colors.shadowColor,
      shadowOffset: { width: 0, height: elevation },
      shadowOpacity: 0.2,
      shadowRadius: elevation * 2,
      elevation: elevation,
    } : {
      shadowColor: 'transparent',
      elevation: 0,
    };
  }
  
  const buttonStyle: ViewStyle = {
    ...styles.button,
    backgroundColor,
    borderColor,
    paddingVertical,
    paddingHorizontal,
    borderRadius,
    ...shadowStyle,
    ...(fullWidth ? { width: '100%' } : {})
  };
  
  const textStyles = {
    ...styles.text,
    color: textColor,
    fontSize,
  };
  
  return (
    <TouchableOpacity
      style={[buttonStyle, style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      {...rest}
    >
      <View style={styles.content}>
        {leftIcon && !loading && (
          <View style={styles.iconLeft}>
            {leftIcon}
          </View>
        )}
        
        {loading ? (
          <ActivityIndicator size="small" color={textColor} />
        ) : (
          <Text style={[textStyles, textStyle]}>{title}</Text>
        )}
        
        {rightIcon && !loading && (
          <View style={styles.iconRight}>
            {rightIcon}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
});

export default memo(Button); 