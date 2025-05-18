import React from 'react';
import ProductDetailScreen from '../../screens/ProductDetailScreen';
import { Stack } from 'expo-router';

export default function ProductDetail() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ProductDetailScreen />
    </>
  );
} 