import React from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import AppText from '@components/AppText';
import { normalize, wp, hp } from '@utils/responsive';
import { colors, fonts, typography, layout } from '@styles/main';

const PixelButton = ({ 
  title, 
  onPress, 
  variant = 'filled', // 'filled' | 'underline'
  style,
  textStyle,
  underlineColor, // 新增属性，用于指定下划线颜色
  status = 'default' // 新增属性，用于指定状态：'success' | 'error' | 'default'
}) => {
  const buttonStyles = [
    styles.button,
    variant === 'filled' && styles.filledButton,
    style
  ];

  const getUnderlineColor = () => {
    if (underlineColor) return underlineColor;
    switch (status) {
      case 'success':
        return '#4CAF50';
      case 'error':
        return '#CD5C5C';
      default:
        return colors.primary;
    }
  };

  const textContainerStyles = [
    variant === 'underline' && {
      ...styles.underlineContainer,
      borderBottomColor: getUnderlineColor()
    }
  ].filter(Boolean);

  const textStyles = [
    styles.text,
    variant === 'filled' ? styles.filledText : styles.underlineText,
    textStyle
  ].filter(Boolean);

  return (
    <TouchableOpacity style={buttonStyles} onPress={onPress}>
      <View style={textContainerStyles}>
        <AppText style={textStyles}>{title}</AppText>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  filledButton: {
    backgroundColor: colors.primary,
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(4),
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.line,
  },
  text: {
    fontSize: typography.size.base,
    fontFamily: fonts.pixel,
  },
  filledText: {
    color: colors.bgWhite,
    fontSize: typography.size.lg,
  },
  underlineText: {
    color: colors.primary,
    fontSize: typography.size.base,
  },
  underlineContainer: {
    borderBottomWidth: 1,
    paddingBottom: 2,
  },
});
export default PixelButton;
