import { normalize, wp, hp } from '@utils/responsive';

export const fonts = {
  primary: 'VT323-Regular',  // 像素字体，用于英文和数字
  system: 'System',          // 系统字体，用于中文回退
};

export const colors = {
  primary: '#E67E22',    // 主题色
  textPrimary: '#333333', // 主要文字颜色（活跃状态）
  textSecondary: '#999999', // 次要文字颜色（默认输入）
  error: '#CD5C5C',      // 错误状态
  success: '#4CAF50',    // 完成状态
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

export const typography = {
  // 字体大小配置
  size: {
    xs: normalize(12),    // 最小字号
    sm: normalize(14),    // 小字号
    base: normalize(16),  // 基础字号
    lg: normalize(18),    // 大字号
    xl: normalize(20),    // 特大字号
    xxl: normalize(24),   // 超大字号
    xxxl: normalize(32),  // 超超大字号
  },
  // 行高配置
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    loose: 1.8,
  },
  // 字体族配置，使用优先级顺序
  fontFamily: {
    default: `${fonts.primary}, ${fonts.system}`,  // VT323 优先，不支持的字符回退到系统字体
    pixel: fonts.primary,                          // 纯像素字体，仅用于确定是英文/数字的场景
    system: fonts.system,                          // 纯系统字体，用于纯中文场景
  },
}; 