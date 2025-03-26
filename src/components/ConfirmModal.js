import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Modal from 'react-native-modal';
import { wp, hp } from '../utils/responsive';
import { colors, fonts, typography, layout } from '../styles/main';

const ConfirmModal = ({
  isVisible,
  onClose,
  onConfirm,
  message,
  confirmText = '确定',
  cancelText = '取消',
  isDanger = false,
}) => {
  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={onClose}
      backdropOpacity={0.4}
      animationIn="fadeIn"
      animationOut="fadeOut"
    >
      <View style={styles.container}>
        <Text style={styles.message}>{message}</Text>
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.button, styles.cancelButton]} 
            onPress={onClose}
          >
            <Text style={[styles.buttonText, styles.cancelText]}>
              {cancelText}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.button, styles.confirmButton, isDanger && styles.dangerButton]} 
            onPress={onConfirm}
          >
            <Text style={[styles.buttonText, styles.confirmText]}>
              {confirmText}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.bgWhite,
    width: wp(60),
    alignSelf: 'center',
    borderRadius: wp(4),
    borderWidth: 1,
    borderColor: colors.line,
  },
  message: {
    fontSize: typography.size.base,
    color: colors.textPrimary,
    fontFamily: fonts.pixel,
    textAlign: 'center',
    padding: wp(3),
    paddingVertical: wp(12),
  },
  buttonContainer: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderColor: colors.line,
  },
  button: {
    flex: 1,
    height: hp(5.5),
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: colors.bgWhite,
    borderBottomLeftRadius: wp(4),
  },
  confirmButton: {
    backgroundColor: colors.error,
    borderBottomRightRadius: wp(4),
    borderLeftWidth: 1,
    borderColor: colors.line,
  },
  dangerButton: {
    backgroundColor: colors.error,
  },
  buttonText: {
    fontSize: typography.size.base,
    fontFamily: fonts.pixel,
  },
  cancelText: {
    color: colors.textPrimary,
  },
  confirmText: {
    color: colors.bgWhite,
  },
});

export default ConfirmModal; 