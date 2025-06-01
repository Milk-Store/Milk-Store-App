import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface CaptchaProps {
  onValidate: (isValid: boolean) => void;
}

const generateCaptcha = () => {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let captcha = '';
  for (let i = 0; i < 6; i++) {
    captcha += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return captcha;
};

export const Captcha: React.FC<CaptchaProps> = ({ onValidate }) => {
  const [captchaText, setCaptchaText] = useState('');
  const [userInput, setUserInput] = useState('');
  const [isValid, setIsValid] = useState(false);

  const generateNewCaptcha = () => {
    const newCaptcha = generateCaptcha();
    setCaptchaText(newCaptcha);
    setUserInput('');
    setIsValid(false);
    onValidate(false);
  };

  useEffect(() => {
    generateNewCaptcha();
  }, []);

  const validateCaptcha = (input: string) => {
    // Chỉ cho phép chữ và số
    const sanitizedInput = input.replace(/[^A-Za-z0-9]/g, '');
    setUserInput(sanitizedInput);
    
    const valid = sanitizedInput === captchaText;
    if (valid !== isValid) {
      setIsValid(valid);
      onValidate(valid);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.captchaContainer}>
        <Text style={styles.captchaText}>{captchaText}</Text>
        <TouchableOpacity onPress={generateNewCaptcha} style={styles.refreshButton}>
          <Ionicons name="refresh" size={24} color="#666" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Nhập mã Captcha"
          value={userInput}
          onChangeText={validateCaptcha}
          autoCapitalize="characters"
          maxLength={6}
          keyboardType="visible-password"
        />
        {userInput.length > 0 && (
          <Ionicons
            name={isValid ? "checkmark-circle" : "close-circle"}
            size={24}
            color={isValid ? "#4CAF50" : "#F44336"}
            style={styles.validationIcon}
          />
        )}
      </View>
      {userInput.length > 0 && !isValid && (
        <Text style={styles.errorText}>Mã không chính xác, vui lòng thử lại</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  captchaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  captchaText: {
    flex: 1,
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: 4,
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  refreshButton: {
    padding: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    padding: 12,
    fontSize: 16,
  },
  validationIcon: {
    marginRight: 12,
  },
  errorText: {
    color: '#F44336',
    marginTop: 4,
    fontSize: 12,
  },
}); 