import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, fonts, typography } from '../styles/main';
import { wp, hp } from '../utils/responsive';

export default function FormInput({
  label,
  value,
  onChangeText,
  placeholder,
  isFocused,
  onFocus,
  onBlur,
  onPress,
  editable = true,
  hideLabel,
  isValid,
  style,
  ...props
}) {
  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={[
          styles.inputContainer,
          isFocused && styles.inputContainerFocused,
          !editable && styles.touchableDisabled,
        ]}
        onPress={onPress}
        disabled={!onPress}
      >
        <View style={styles.inputWrapper}>
          <TextInput
            style={[styles.input, isValid && styles.validInput, style]}
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor={colors.textSecondary}
            onFocus={onFocus}
            onBlur={onBlur}
            editable={editable}
            pointerEvents={onPress ? "none" : "auto"}
            {...props}
          />
          {isValid && (
            <Text style={styles.checkmark}>✓</Text>
          )}
        </View>
      </TouchableOpacity>
      <View style={styles.separator} />
      {!hideLabel && label && (
        <Text style={styles.label}>{label}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: hp(4),
  },
  inputContainer: {
    backgroundColor: colors.bgLight,
    borderRadius: wp(2),
    paddingHorizontal: wp(0),
    paddingVertical: hp(0),
  },
  input: {
    fontSize: typography.size.base,
    color: colors.textPrimary,
    fontFamily: fonts.pixel,
    width: wp(30),
  },
  separator: {
    height: 1,
    backgroundColor: colors.line,
    marginTop: hp(1),
    marginBottom: hp(0.5),
    width: wp(30),
  },
  label: {
    fontSize: typography.size.xs,
    color: colors.textPrimary,
    fontFamily: fonts.pixel,
    marginTop: hp(0.5),
  },
  validationIcon: {
    color: colors.success,
    fontSize: typography.size.base,
    marginLeft: wp(2),
    fontWeight: 'bold',
  },
  dateInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateInput: {
    flex: 1,
    fontSize: typography.size.base,
    color: colors.textSecondary,
    fontFamily: fonts.pixel,
    textAlign: 'center',
    padding: 0,
  },
  dateText: {
    fontFamily: fonts.pixel,
    fontSize: typography.size.base,
    color: colors.textPrimary,
    marginHorizontal: wp(2),
  },
  inputDisabled: {
    color: colors.textSecondary,
  },
  touchableArea: {
    width: '100%',
  },
  pressableInput: {
    color: colors.textPrimary,
  },
  touchableDisabled: {
    opacity: 0.8,
  },
  pressableWrapper: {
    backgroundColor: colors.bgLight,
    borderRadius: wp(2),
  },
  arrowIcon: {
    fontSize: typography.size.base,
    color: colors.textSecondary,
    marginLeft: wp(2),
    fontFamily: fonts.pixel,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp(0),
  },
  checkmark: {
    color: colors.success,
    fontSize: typography.size.base,
    marginLeft: wp(2),
  },
});