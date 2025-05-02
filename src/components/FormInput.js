import React, { memo } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, fonts, typography } from '@styles/main';
import { normalize, wp, hp } from '@utils/responsive';
import AppText from '@components/AppText';

// 使用 memo 包装混排文本显示组件
const MixedText = memo(({ value, style }) => {
  return (
    <View style={styles.textContainer}>
      <AppText style={style} largerSize={2}>{value}</AppText>
    </View>
  );
});

// 使用 memo 包装占位符文本组件
const PlaceholderText = memo(({ text }) => (
  <AppText style={styles.placeholder}>{text}</AppText>
));

const FormInput = memo(({
  label,
  value,
  onChangeText,
  placeholder,
  onFocus: onFocusProp,
  onBlur: onBlurProp,
  editable = true,
  hideLabel,
  isValid,
  style,
  secureTextEntry,
  onPress,
  marginBottom = hp(4),
  ...props
}) => {
  const displayValue = secureTextEntry ? '●'.repeat(value?.length || 0) : value;
  const isClickable = !editable && onPress;

  const renderContent = () => (
    <View style={styles.contentWrapper}>
      {editable && (
        <TextInput
          style={styles.hiddenInput}
          value={value}
          onChangeText={onChangeText}
          onFocus={onFocusProp}
          onBlur={onBlurProp}
          editable={editable}
          secureTextEntry={secureTextEntry}
          caretHidden={false}
          {...props}
        />
      )}
      <View style={styles.overlayDisplay} pointerEvents="none">
        {(!value || (typeof value === 'object' && !value.name)) && (
          <PlaceholderText text={placeholder} />
        )}
        {typeof value === 'string' && value !== '' && (
          <MixedText value={displayValue} style={[styles.input, style]} />
        )}
        {typeof value === 'object' && value.name && (
          <MixedText value={value.name} style={[styles.input, style]} />
        )}
      </View>
      {isValid && <AppText style={styles.checkmark}>✓</AppText>}
    </View>
  );

  return (
    <View style={[styles.container, { marginBottom }]}>
      <View style={[
        styles.inputContainer,
        !editable && styles.inputDisabled
      ]}>
        {isClickable ? (
          <TouchableOpacity onPress={onPress}>
            {renderContent()}
          </TouchableOpacity>
        ) : (
          renderContent()
        )}
      </View>
      <View style={styles.separator} />
      {!hideLabel && label && (
        <AppText style={styles.label}>{label}</AppText>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginBottom: hp(4),
  },
  inputContainer: {
    backgroundColor: colors.bgLight,
    borderRadius: wp(2),
  },
  contentWrapper: {
    position: 'relative',
    minHeight: hp(3),
  },
  hiddenInput: {
    ...StyleSheet.absoluteFillObject,
    color: 'transparent',
    padding: 0,
    margin: 0,
  },
  overlayDisplay: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  textContainer: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  input: {
    fontSize: typography.size.base,
    color: colors.textPrimary,
  },
  placeholder: {
    fontSize: typography.size.base,
    color: colors.textSecondary,
  },
  separator: {
    height: 1,
    backgroundColor: colors.line,
    marginTop: hp(1),
    width: '100%',
  },
  label: {
    fontSize: typography.size.xs,
    color: colors.textPrimary,
    fontFamily: fonts.pixel,
    marginTop: hp(0.5),
  },
  checkmark: {
    position: 'absolute',
    right: 0,
    color: colors.success,
    fontSize: typography.size.base,
  },
  inputDisabled: {
    opacity: 0.8,
  },
});

FormInput.displayName = 'FormInput';
export default FormInput;