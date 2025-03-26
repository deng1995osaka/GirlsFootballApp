import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Pressable } from 'react-native';
import { Portal } from '@gorhom/portal';
import { normalize, wp, hp } from '../utils/responsive';
import { colors, fonts } from '../styles/main';

const DropdownMenu = ({ visible, onSelect, items, position = 'right', anchor, edgeDistance }) => {
  if (!visible) return null;

  // 计算下拉菜单的位置
  const getDropdownPosition = () => {
    if (!anchor) return {};
    
    return {
      position: 'absolute',
      top: anchor.y + anchor.height,
      [position]: anchor.x,
    };
  };

  return (
    <Portal>
      <Pressable 
        style={StyleSheet.absoluteFill} 
        onPress={() => onSelect(null)}
      >
        <View 
          style={[
            styles.dropdown,
            getDropdownPosition(),
            position === 'left' && { left: edgeDistance || wp(4) },
            position === 'right' && { right: edgeDistance || wp(4) },
          ]}
        >
          {items.map((item, index) => (
            <TouchableOpacity 
              key={item.id}
              style={[
                styles.dropdownItem,
                index === items.length - 1 && styles.lastItem,
                item.danger && styles.dropdownItemDanger
              ]}
              onPress={(e) => {
                e.stopPropagation();
                onSelect(item.id);
              }}
            >
              <Text style={[
                styles.dropdownText,
                item.danger && styles.dropdownTextDanger
              ]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Pressable>
    </Portal>
  );
};

const styles = StyleSheet.create({
  dropdown: {
    backgroundColor: colors.bgWhite,
    borderRadius: wp(2),
    borderWidth: 1,
    borderColor: colors.border,
    width: wp(35),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1000,
  },
  dropdownItem: {
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(4),
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  lastItem: {
    borderBottomWidth: 0,
  },
  dropdownItemDanger: {
    borderBottomWidth: 0,
  },
  dropdownText: {
    fontSize: normalize(16),
    color: colors.textPrimary,
    fontFamily: fonts.pixel,
    textAlign: 'center',
  },
  dropdownTextDanger: {
    color: colors.error,
  },
});

export default DropdownMenu; 