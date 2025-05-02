import { StyleSheet } from 'react-native';
import { colors, typography, fonts } from '@styles/main';
import { normalize, wp, hp } from '@utils/responsive';

export const commonScreenStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgWhite,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: hp(7),
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
    backgroundColor: colors.bgWhite,
    position: 'relative',
    zIndex: 1,
  },
  backButton: {
    position: 'absolute',
    left: wp(4),
    
  },
  backButtonText: {
    fontSize: typography.size.xl,
    color: colors.textPrimary,
    fontFamily: fonts.pixel,
  },
  headerTitle: {
    fontSize: typography.size.lg,
    color: colors.textPrimary,
    fontFamily: fonts.pixel,
  },
  mainContent: {
    flex: 1,
  },
  formContainer: {
    marginTop: hp(2.5),
    padding: wp(4),
  },
  submitContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    padding: wp(1),
    backgroundColor: colors.primary,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: wp(2),
    paddingVertical: hp(2),
    alignItems: 'center',
  },
  submitButtonText: {
    color: colors.bgWhite,
    fontSize: typography.size.base,
    fontFamily: fonts.pixel,
  },
}); 