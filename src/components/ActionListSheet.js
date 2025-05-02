import React from 'react';
import { View, StyleSheet } from 'react-native';
import AppText from '@components/AppText';
import FormInput from '@components/FormInput';
import { colors, fonts, typography } from '@styles/main';
import { normalize, wp, hp } from '@utils/responsive';
import BottomSheet from '@components/BottomSheet';

const ActionListSheet = ({
  visible,
  title = '',
  actions = [],
  onClose,
}) => {
  if (!visible) return null;

  return (
    <BottomSheet
      visible={visible}
      title={title || '选择操作'}
      onClose={onClose}
      showHeader={false}
      contentStyle={styles.content}
    >
      {actions.map((action, index) => (
        <FormInput
          key={index}
          value={action.label}
          editable={false}
          onPress={() => {
            action.onPress();
            onClose();
          }}
          hideLabel
          style={styles.listItemText}
          marginBottom={0}
        />
      ))}
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  content: {
    padding: wp(6),
    gap: hp(3),
  },
  listItemText: {
    fontSize: typography.size.base,
    color: colors.textPrimary,
    fontFamily: fonts.pixel,
  },
});

export default ActionListSheet; 