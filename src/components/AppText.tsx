import React from 'react';
import { Text, TextProps, TextStyle } from 'react-native';
import { fonts, typography } from '@styles/main';

function isChinese(char: string): boolean {
  return /[\u4e00-\u9fa5]/.test(char);
}

// 获取更大的字号
function getNextLargerFontSize(currentSize: number, jumpLevels: number = 1): number {
  const sizes = [
    typography.size.xs,    // 12
    typography.size.sm,    // 14
    typography.size.base,  // 16
    typography.size.lg,    // 18
    typography.size.xl,    // 20
    typography.size.xxl,   // 24
    typography.size.xxxl,  // 32
  ];
  
  const currentIndex = sizes.findIndex(size => size === currentSize);
  if (currentIndex === -1) {
    return currentSize * 1.5;
  }
  const targetIndex = Math.min(currentIndex + jumpLevels, sizes.length - 1);
  return sizes[targetIndex];
}

interface AppTextProps extends TextProps {
  largerSize?: number;  // 控制英文字符跳几级字号
}

export default function AppText(props: AppTextProps) {
  const { style, children, largerSize = 1, ...rest } = props;

  const mergedStyle: TextStyle = {
    fontFamily: fonts.primary,
    ...(Array.isArray(style) ? Object.assign({}, ...style) : style),
  };

  if (typeof children === 'string') {
    return (
      <Text {...rest} style={mergedStyle}>
        {children.split('').map((char, index) => {
          const isChineseChar = isChinese(char);
          const currentFontSize = mergedStyle.fontSize || typography.size.base;
          const finalFontSize = isChineseChar ? currentFontSize : getNextLargerFontSize(currentFontSize as number, largerSize);
          return (
            <Text
              key={index}
              style={{
                fontFamily: isChineseChar ? undefined : fonts.primary,
                fontSize: finalFontSize,
              }}
            >
              {char}
            </Text>
          );
        })}
      </Text>
    );
  }

  return (
    <Text {...rest} style={mergedStyle}>
      {children}
    </Text>
  );
} 