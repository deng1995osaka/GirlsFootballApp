import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, fonts, typography } from '@styles/main';
import { normalize, wp, hp } from '@utils/responsive';
import AppText from '@components/AppText';

export const toastConfig = {
  success: ({ text1, text2 }) => (
    <View style={[styles.container]}>
      <View style={styles.rowCenter}>
        <AppText style={styles.emojiSuccess}>(･∀･)</AppText>
        <AppText style={styles.title}>{text1}</AppText>
      </View>
      {text2 ? <AppText style={styles.message}>{text2}</AppText> : null}
    </View>
  ),
  error: ({ text1, text2 }) => (
    <View style={[styles.container]}>
      <View style={styles.rowCenter}>
        <AppText style={styles.emojiError}>(･д･)</AppText>
        <AppText style={styles.title}>{text1}</AppText>
      </View>
      {text2 ? <AppText style={styles.message}>{text2}</AppText> : null}
    </View>
  ),
  info: ({ text1, text2, onPress }) => (
    <View style={styles.infoContainer}>
      <View style={styles.infoContent}>
        <AppText style={styles.infoTitle}>{text1}</AppText>
        {text2 ? <AppText style={styles.infoMessage}>{text2}</AppText> : null}
      </View>
      {onPress && (
        <TouchableOpacity 
          onPress={onPress}
          style={styles.infoButton}
        >
          <AppText style={styles.infoButtonText}>去填写</AppText>
        </TouchableOpacity>
      )}
    </View>
  ),
};

const styles = StyleSheet.create({
  container: {
    minHeight: hp(6),
    maxWidth: wp(50),
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(4),
    borderRadius: wp(2),
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    justifyContent: 'center',
  },
  rowCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: hp(0.5),
  },
  emojiSuccess: {
    color: colors.bgWhite,
    fontSize: typography.size.lg,
    fontFamily: fonts.pixel,
    marginRight: wp(2),
  },
  emojiError: {
    color: colors.bgWhite,
    fontSize: typography.size.lg,
    fontFamily: fonts.pixel,
    marginRight: wp(2),
  },
  title: {
    color: colors.bgWhite,
    fontSize: typography.size.lg,
    fontFamily: fonts.pixel,
    textAlign: 'center',
  },
  message: {
    color: colors.bgWhite,
    fontSize: typography.size.sm,
    fontFamily: fonts.pixel,
    textAlign: 'center',
    marginTop: 0,
  },
  button: {
    paddingVertical: hp(1),
    paddingHorizontal: wp(3),
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: wp(1),
    marginTop: hp(1),
    alignSelf: 'center',
  },
  buttonText: {
    color: colors.bgWhite,
    fontSize: typography.size.sm,
    fontFamily: fonts.pixel,
  },
  infoContainer: {
    height: hp(8),
    width: '100%',
    backgroundColor: colors.primary,
    padding: wp(4),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    
  },
  infoContent: {
    flex: 1,
    justifyContent: 'center',
  },
  infoTitle: {
    color: colors.bgWhite,
    fontSize: typography.size.base,
    fontFamily: fonts.pixel,
    marginBottom: hp(0.5),
  },
  infoMessage: {
    color: colors.bgWhite,
    fontSize: typography.size.sm,
    fontFamily: fonts.pixel,
  },
  infoButton: {
    paddingVertical: hp(1),
    paddingHorizontal: wp(3),
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: wp(100),
    height: hp(4),
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoButtonText: {
    color: colors.bgWhite,
    fontSize: typography.size.sm,
    fontFamily: fonts.pixel,
    textAlignVertical: 'center',
  },
});
