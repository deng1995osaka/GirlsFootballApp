import React from 'react';
import { View, StyleSheet } from 'react-native';
import AppText from '@components/AppText';
import PixelButton from '@components/PixelButton';
import FormInput from '@components/FormInput';
import { colors, fonts, typography } from '@styles/main';
import { normalize, wp, hp } from '@utils/responsive';
import BottomSheet from '@components/BottomSheet';

const VerificationSuccessSheet = ({
  visible,
  title = '',
  message = '',
  onConfirm,
  onClose,
  confirmText = '确定',
  cancelText = '取消',
  confirmTextColor,
  // 兼容老用法
  email,
  mode = 'confirm',
  actions = [],
}) => {
  if (!visible) return null;

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      showHeader={false}
      headerCenter={<AppText style={styles.title}>{title || '(･∀･)验证成功'}</AppText>}
      contentStyle={styles.content}
    >
      {mode === 'confirm' ? (
        <>
          <AppText style={styles.message}>
            {message || (
              <>请使用刚才的邮箱和密码，{"\n"}完成首次登录。</>
            )}
          </AppText>
          <View style={{flexDirection: 'row', width: '100%', justifyContent: 'center'}}>
            <PixelButton
              title={cancelText}
              onPress={onClose}
              variant="underline"
              status="default"
              style={[styles.button, {marginRight: wp(4)}]}
            />
            <PixelButton
              title={confirmText}
              onPress={onConfirm}
              variant="underline"
              status="error"
              style={[styles.button]}
              textStyle={confirmTextColor ? {color: confirmTextColor} : {}}
            />
          </View>
        </>
      ) : (
        actions.map((action, index) => (
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
        ))
      )}
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: typography.size.lg,
    fontFamily: fonts.pixel,
    color: colors.textPrimary,
  },
  content: {
    padding: wp(6),
    alignItems: 'center',
  },
  message: {
    fontSize: typography.size.base,
    fontFamily: fonts.pixel,
    color: colors.textPrimary,
    textAlign: 'center',
    lineHeight: typography.size.base * 1.5,
    marginBottom: hp(4),
  },
  button: {
    paddingVertical: hp(1),
    minWidth: wp(20),
  },
  listItemText: {
    fontSize: typography.size.base,
    color: colors.textPrimary,
    fontFamily: fonts.pixel,
  },
});

export default VerificationSuccessSheet; 