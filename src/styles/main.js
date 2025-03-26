import { normalize } from '../utils/responsive';

// 字体配置
export const fonts = {
  pixel: 'PixelFont',
};

// 颜色配置
export const colors = {
  primary: '#E67E22',    // 主题色（绿色）
  textPrimary: '#333333', // 主要文字颜色（活跃状态）
  textSecondary: '#999999', // 次要文字颜色（默认输入）
  
  
  error: '#FF0000',      // 错误状态
  success: '#4CAF50',    // 完成状态的对勾颜色
  bgWhite: '#ffffff',
  line: '#131415',
  borderColor: '#dddddd',
};

// 布局配置
export const layout = {
  padding: {
    small: 8,
    medium: 16,
    large: 24,
  },
  borderRadius: {
    small: 10,
    medium: 16,
    large: 20,
  },
};

// 字体大小配置
export const typography = {
  size: {
    xs: normalize(12),    // 最小字号
    sm: normalize(14),    // 小字号
    base: normalize(16),  // 基础字号
    lg: normalize(18),    // 大字号
    xl: normalize(20),    // 特大字号
    xxl: normalize(24),   // 超大字号
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    loose: 1.8,
  },
};

