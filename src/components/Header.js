import React from 'react';
import { View, TouchableOpacity, StyleSheet, Platform, Dimensions } from 'react-native';
import AppText from '@components/AppText';
import { normalize, wp, hp } from '@utils/responsive';
import { colors, fonts, typography } from '@styles/main';

// 检测是否为刘海屏 iPhone
const { height, width } = Dimensions.get('window');
const isIphoneX = () => {
  return (
    Platform.OS === 'ios' &&
    !Platform.isPad &&
    !Platform.isTVOS &&
    ((height === 780 || width === 780)
      || (height === 812 || width === 812)
      || (height === 844 || width === 844)
      || (height === 896 || width === 896)
      || (height === 926 || width === 926)
      || (height === 932 || width === 932))
  );
};

const Header = ({ 
  title, 
  onAddPress, 
  showAddButton = true,
  additionalStyles, 
  buttonType = "+",
  hideMenuButton = false,
  buttonRef
}) => {
  const shouldShowButton = showAddButton && (!hideMenuButton || buttonType !== "≡");

  return (
    <View style={[styles.header, additionalStyles?.container]}>
      <View style={styles.headerContent}>
        <AppText style={[styles.title, additionalStyles?.title]}>{title}</AppText>
        {shouldShowButton && (
          <TouchableOpacity 
            ref={buttonRef}
            style={[styles.addButton, additionalStyles?.button]} 
            onPress={onAddPress}
          >
            <AppText style={[styles.addButtonText, additionalStyles?.buttonText]}>
              {buttonType === "≡" ? "≡" : "+"}
            </AppText>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingTop: Platform.select({
      ios: isIphoneX() ? hp(4) : hp(2),
      android: hp(2),
    }),
    paddingBottom: hp(1),
    backgroundColor: colors.background,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    paddingHorizontal: wp(4),
  },
  title: {
    fontSize: typography.size.xxxl,
    color: colors.textPrimary,
    fontFamily: fonts.pixel,
    textAlign: 'center',
  },
  addButton: {
    position: 'absolute',
    right: wp(4),
    width: wp(8),
    height: wp(8),
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: typography.size.xxxl,
    color: colors.textPrimary,
    fontFamily: fonts.pixel,
  },
});

export default Header;