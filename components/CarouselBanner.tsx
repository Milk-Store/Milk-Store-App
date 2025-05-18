import React, { useState } from 'react';
import { View, StyleSheet, ImageStyle } from 'react-native';
import { useWindowDimensions } from 'react-native';
import { Image } from 'expo-image';
import Carousel from 'react-native-reanimated-carousel';
import { useTheme } from '../contexts/ThemeContext';
import StyleSheet2 from '../styles/StyleSheet';

export type BannerItem = {
  id: string;
  image: any;
  uri?: string;
};

type CarouselBannerProps = {
  data: BannerItem[];
  autoPlay?: boolean;
  autoPlayInterval?: number;
  dotSize?: number;
  dotSpacing?: number;
  imageHeight?: number | string;
  imageWidth?: number | string;
  borderRadius?: number;
  showPagination?: boolean;
  onSnapToItem?: (index: number) => void;
};

const CarouselBanner: React.FC<CarouselBannerProps> = ({
  data,
  autoPlay = true,
  autoPlayInterval = 5000,
  dotSize = 8,
  dotSpacing = 4,
  imageHeight,
  imageWidth,
  borderRadius = 8,
  showPagination = true,
  onSnapToItem,
}) => {
  const { width } = useWindowDimensions();
  const { colors } = useTheme();
  const [activeSlide, setActiveSlide] = useState(0);
  
  // Xử lý khi slide thay đổi
  const handleSnapToItem = (index: number) => {
    setActiveSlide(index);
    if (onSnapToItem) {
      onSnapToItem(index);
    }
  };

  // Render carousel item
  const renderBannerItem = ({ item }: { item: BannerItem }) => {
    const imageStyle: any[] = [
      styles.bannerImage,
      { borderRadius }
    ];
    
    if (imageHeight) {
      imageStyle.push({ height: imageHeight });
    }
    
    if (imageWidth) {
      imageStyle.push({ width: imageWidth });
    }
    
    return (
      <Image
        source={item.uri ? { uri: item.uri } : item.image}
        style={imageStyle}
        contentFit="cover"
        transition={300}
      />
    );
  };

  // Tính toán kích thước carousel
  const calculateWidth = () => {
    if (!imageWidth) return width;
    return typeof imageWidth === 'number' ? imageWidth : parseFloat(imageWidth as string);
  };
  
  const calculateHeight = () => {
    if (!imageHeight) return width * 0.5;
    return typeof imageHeight === 'number' ? imageHeight : parseFloat(imageHeight as string);
  };

  return (
    <View style={styles.carouselContainer}>
      <Carousel
        width={calculateWidth()}
        height={calculateHeight()}
        data={data}
        renderItem={renderBannerItem}
        onSnapToItem={handleSnapToItem}
        loop
        autoPlay={autoPlay}
        autoPlayInterval={autoPlayInterval}
      />
      
      {showPagination && (
        <View style={styles.paginationContainer}>
          {data.map((_, index) => (
            <View
              key={index}
              style={[
                styles.paginationDot,
                {
                  backgroundColor: index === activeSlide ? colors.primary : '#E0E0E0',
                  width: dotSize,
                  height: dotSize,
                  borderRadius: dotSize / 2,
                  marginHorizontal: dotSpacing,
                },
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  carouselContainer: {
    marginVertical: 12,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
});

export default CarouselBanner; 