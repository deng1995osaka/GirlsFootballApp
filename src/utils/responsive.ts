import { Dimensions, PixelRatio } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// 以 iPhone 8 为基准进行缩放计算 (375 x 667)
const scale = SCREEN_WIDTH / 375;
const verticalScale = SCREEN_HEIGHT / 667;

// 宽度百分比
export const wp = (percentage: number): number => {
  return SCREEN_WIDTH * (percentage / 100);
};

// 高度百分比
export const hp = (percentage: number): number => {
  return SCREEN_HEIGHT * (percentage / 100);
};

// 字体大小标准化
export function normalize(size: number): number {
  const newSize = size * scale;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
} 