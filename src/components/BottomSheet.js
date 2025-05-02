import React from 'react';
import { 
  Modal, 
  View, 
  TouchableOpacity, 
  StyleSheet, 
  Dimensions 
} from 'react-native';
import AppText from '@components/AppText';
import { colors, fonts, typography } from '@styles/main';
import { wp, hp } from '@utils/responsive';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const BottomSheet = ({
  visible,
  title = '',
  onClose,
  onBack,
  disableBackdropClose = false,
  children,
  footer,
  headerLeft = null,
  headerRight = null,
  headerCenter = null,
  showHeader = true,
  disableSwipeClose = false,
  animationType = 'slide',
  maxHeight = 0.8,
  borderRadius = 4,
  backgroundColor = colors.bgWhite,
  overlayColor = 'rgba(0, 0, 0, 0.5)',
  contentStyle = {},
  contentPadding = 4,
  showFooter = false,
  footerStyle = {},
}) => {
  if (!visible) return null;

  const handleBackdropPress = () => {
    if (!disableBackdropClose) {
      onBack?.() || onClose?.();
    }
  };

  return (
    <Modal
      visible={true}
      transparent={true}
      animationType={animationType}
      statusBarTranslucent={true}
    >
      <View style={[styles.modalOverlay, { backgroundColor: overlayColor }]}>
        <TouchableOpacity 
          style={styles.backdropTouchable}
          activeOpacity={1}
          onPress={handleBackdropPress}
        >
          <View style={styles.modalContainer}>
            <TouchableOpacity 
              activeOpacity={1}
              onPress={e => e.stopPropagation()}
              style={[
                styles.modalContent,
                { 
                  backgroundColor,
                  borderTopLeftRadius: wp(borderRadius),
                  borderTopRightRadius: wp(borderRadius),
                  maxHeight: SCREEN_HEIGHT * maxHeight 
                }
              ]}
            >
              {showHeader && (
                <View style={styles.header}>
                  {headerLeft || (
                    <TouchableOpacity onPress={onBack || onClose} style={styles.sideButton}>
                      <AppText style={styles.backButtonText}>←</AppText>
                    </TouchableOpacity>
                  )}
                  {headerCenter || <AppText style={styles.title}>{title}</AppText>}
                  {headerRight || <View style={styles.sideButton} />}
                </View>
              )}

              <View style={[
                styles.content,
                { padding: wp(contentPadding) },
                contentStyle
              ]}>
                {children}
              </View>

              {(showFooter || footer) && (
                <View style={[styles.footer, footerStyle]}>
                  {footer}
                </View>
              )}
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  backdropTouchable: {
    flex: 1,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    zIndex: 1001,
  },
  modalContent: {
    backgroundColor: colors.bgWhite,
    borderTopLeftRadius: wp(4),
    borderTopRightRadius: wp(4),
    maxHeight: SCREEN_HEIGHT * 0.8,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 1002,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: wp(4),
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  title: {
    fontSize: typography.size.base,
    fontFamily: fonts.pixel,
    color: colors.textPrimary,
  },
  backButtonText: {
    fontSize: typography.size.xl,
    color: colors.textPrimary,
  },
  sideButton: {
    width: wp(8),
    alignItems: 'center',
  },
  content: {
    padding: wp(4),
  },
  footer: {
    paddingHorizontal: wp(4),
    paddingVertical: hp(2),
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
});

export default BottomSheet; 