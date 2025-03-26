import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';

import { wp, hp } from '../utils/responsive';
import { colors, fonts, typography, layout } from '../styles/main';

const PixelButton = ({ 
  title, 
  onPress, 
  variant = 'filled', // 'filled' | 'underline'
  style,
  textStyle 
}) => {
  const buttonStyles = [
    styles.button,
    variant === 'filled' && styles.filledButton,
    style
  ];

  const textContainerStyles = [
    variant === 'underline' && styles.underlineContainer
  ].filter(Boolean);

  const textStyles = [
    styles.text,
    variant === 'filled' ? styles.filledText : styles.underlineText,
    textStyle
  ].filter(Boolean);

  return (
    <TouchableOpacity style={buttonStyles} onPress={onPress}>
      <View style={textContainerStyles}>
        <Text style={textStyles}>{title}</Text>
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
    borderRadius: layout.borderRadius.small,
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
    borderBottomColor: colors.primary,
    paddingBottom: 2,
  },
});

export default PixelButton;