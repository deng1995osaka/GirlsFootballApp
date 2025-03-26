import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Dimensions } from 'react-native';
import { normalize, wp, hp } from '../utils/responsive';
import { colors, fonts } from '../styles/main';
import DropdownMenu from './DropdownMenu';
import ConfirmModal from './ConfirmModal';

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
  showBackButton = false,
  onBackPress,
  additionalStyles, 
  buttonType = "+" 
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const buttonRef = useRef(null);

  const menuItems = [
    { id: 'logout', label: '退出登录' },
    { id: 'delete', label: '删除账号', danger: true }
  ];

  const handleMenuSelect = (id) => {
    setShowDropdown(false);
    if (id === 'delete') {
      setConfirmModalVisible(true);
    } else {
      onAddPress?.(id);
    }
  };

  const handleConfirm = () => {
    setConfirmModalVisible(false);
    onAddPress?.('delete');
  };

  const handleShowMenu = () => {
    buttonRef.current?.measure((x, y, width, height, pageX, pageY) => {
      setMenuAnchor({
        x: pageX,
        y: pageY,
        width,
        height,
      });
      setShowDropdown(true);
    });
  };

  return (
    <>
      <View style={[styles.header, additionalStyles?.container]}>
        <View style={styles.headerContent}>
          {showBackButton && (
            <TouchableOpacity 
              style={styles.backButton}
              onPress={onBackPress}
            >
              <Text style={styles.backButtonText}>←</Text>
            </TouchableOpacity>
          )}
          <Text style={[styles.title, additionalStyles?.title]}>{title}</Text>
          {showAddButton && (
            <>
              <TouchableOpacity 
                ref={buttonRef}
                style={[styles.addButton, additionalStyles?.button]} 
                onPress={() => {
                  if (buttonType === "≣") {
                    handleShowMenu();
                  } else {
                    onAddPress?.();
                  }
                }}
              >
                <Text style={[styles.addButtonText, additionalStyles?.buttonText]}>
                  {buttonType === "≣" ? "≣" : "+"}
                </Text>
              </TouchableOpacity>
              
              <DropdownMenu 
                visible={showDropdown && buttonType === "≣"}
                items={menuItems}
                onSelect={handleMenuSelect}
                anchor={menuAnchor}
                edgeDistance={wp(4)}
              />
            </>
          )}
        </View>
      </View>

      <ConfirmModal
        isVisible={confirmModalVisible}
        onClose={() => setConfirmModalVisible(false)}
        onConfirm={handleConfirm}
        message="确定要删除账号吗？"
        confirmText="删除"
        isDanger={true}
      />
    </>
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
    fontSize: normalize(36),
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
    fontSize: normalize(32),
    color: colors.textPrimary,
    fontFamily: fonts.pixel,
  },
  backButton: {
    position: 'absolute',
    left: wp(1),
    height: '100%',
    justifyContent: 'center',
  },
  backButtonText: {
    fontSize: normalize(32),
    color: colors.textPrimary,
    fontFamily: fonts.pixel,
  },
});

export default Header;