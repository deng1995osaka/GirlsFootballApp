import React from 'react';
import { View, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Portal } from '@gorhom/portal';
import AppText from '@components/AppText';
import { normalize, wp, hp } from '@utils/responsive';
import { colors, fonts, typography } from '@styles/main';

export default function DropdownMenu({ items, onSelect, visible, anchor, edgeDistance, onClose, position = 'right' }) {
  if (!visible || !anchor) {
    return null;
  }

  const handleOverlayPress = () => {
    if (onClose) {
      onClose();
    }
  };

  const screenWidth = Dimensions.get('window').width;
  const menuWidth = wp(35); // 菜单宽度

  // 根据position计算left值
  const calculateLeft = () => {
    if (position === 'left') {
      return edgeDistance;
    } else {
      // 如果是right定位，则从屏幕右边减去菜单宽度和边距
      return screenWidth - menuWidth - edgeDistance;
    }
  };

  return (
    <Portal>
      <TouchableOpacity 
        style={styles.overlay}
        activeOpacity={1}
        onPress={handleOverlayPress}
      >
        <View style={[
          styles.menu,
          {
            position: 'absolute',
            top: anchor.y + anchor.height,
            left: calculateLeft(),
            width: menuWidth
          }
        ]}>
          {items.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.menuItem,
                item.danger && styles.dangerItem
              ]}
              onPress={() => {
                onSelect(item.id);
              }}
            >
              <AppText style={[
                styles.itemText,
                item.danger && styles.dangerText
              ]}>
                {item.label}
              </AppText>
            </TouchableOpacity>
          ))}
        </View>
      </TouchableOpacity>
    </Portal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
  },
  menu: {
    backgroundColor: colors.bgWhite,
    borderRadius: wp(2),
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  menuItem: {
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(4),
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  dangerItem: {
    borderBottomWidth: 0,
  },
  itemText: {
    fontSize: normalize(16),
    color: colors.textPrimary,
    fontFamily: fonts.pixel,
    textAlign: 'center',
  },
  dangerText: {
    color: colors.error,
  },
}); 