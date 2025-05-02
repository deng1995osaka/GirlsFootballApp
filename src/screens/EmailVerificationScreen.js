import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  StatusBar,
} from 'react-native';
import { colors, fonts, typography } from '@styles/main';
import { normalize, wp, hp } from '@utils/responsive';
import { supabase } from '@lib/supabase';
import Background from '@components/Background';
import PixelButton from '@components/PixelButton';
import BorderBox from '@components/BorderBox';
import { commonScreenStyles } from '@styles/screenStyles';
import AppText from '@components/AppText';
import { SafeAreaView as SafeAreaViewRN } from 'react-native-safe-area-context';
import ActionListSheet from '@components/ActionListSheet';
import Toast from 'react-native-toast-message';
import VerificationSuccessSheet from '@components/VerificationSuccessSheet';
const EmailVerificationScreen = ({ route, navigation }) => {
  const [loading, setLoading] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [focused, setFocused] = useState(false);
  const [showSuccessSheet, setShowSuccessSheet] = useState(false);
  const [verificationError, setVerificationError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [countdown, setCountdown] = useState(0);
  const inputRef = useRef(null);
  const email = route.params?.email;

  // 添加倒计时效果
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [countdown]);

  // 渲染6个验证码框
  const renderCodeBoxes = () => {
    const boxes = [];
    for (let i = 0; i < 6; i++) {
      boxes.push(
        <View key={i} style={styles.codeBox}>
          {verificationCode[i] ? (
            <AppText style={styles.codeText}>{verificationCode[i]}</AppText>
          ) : (
            <View style={[
              styles.dash,
              (focused && i === verificationCode.length) ? styles.dashActive : null
            ]} />
          )}
        </View>
      );
    }
    return boxes;
  };

  const handleVerifyCode = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setVerificationError('请输入6位验证码');
      return;
    }

    setVerificationError('');
    try {
      setLoading(true);
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: verificationCode,
        type: 'signup'
      });

      if (error) {
        Toast.show({
          type: 'error',
          text1: '验证失败',
          text2: '验证码错误或已过期',
          visibilityTime: 3000,
          autoHide: true,
          position: 'top',
        });
        return;
      }

      setShowSuccessSheet(true);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: '错误',
        text2: '验证过程中发生错误',
        visibilityTime: 3000,
        autoHide: true,
        position: 'top',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResendEmail = async () => {
    if (countdown > 0) return; // 如果正在倒计时，不允许重发
    
    if (!email) {
      setEmailError('邮箱地址无效');
      return;
    }

    setEmailError('');
    try {
      setLoading(true);
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      });

      if (error) {
        console.error('重发验证邮件失败:', error);
        Toast.show({
          type: 'error',
          text1: '发送失败',
          text2: '验证邮件发送失败，请稍后重试',
          visibilityTime: 3000,
          autoHide: true,
          position: 'top',
        });
        return;
      }

      // 设置60秒倒计时
      setCountdown(60);

      Toast.show({
        type: 'success',
        text1: '成功',
        text2: '验证邮件已重新发送，请查收',
        visibilityTime: 3000,
        autoHide: true,
        position: 'top',
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: '错误',
        text2: '发送过程中发生错误',
        visibilityTime: 3000,
        autoHide: true,
        position: 'top',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Background>
      <StatusBar barStyle="dark-content" />
      <View style={{ backgroundColor: 'white', zIndex: 1 }}>
        <SafeAreaViewRN style={{ backgroundColor: 'white' }}>
          <View style={commonScreenStyles.headerContainer}>
            <TouchableOpacity 
              style={commonScreenStyles.backButton}
              onPress={() => navigation.goBack()}
            >
              <AppText style={commonScreenStyles.backButtonText}>←</AppText>
            </TouchableOpacity>
            <AppText style={commonScreenStyles.headerTitle}>邮箱验证</AppText>
          </View>
        </SafeAreaViewRN>
      </View>
      <SafeAreaViewRN style={[styles.safeArea, { marginTop: -1 }]}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.container}
        >
          <BorderBox iconSource={null} style={styles.content}>
            <AppText style={styles.titleText}>验证码已发送至</AppText>
            <AppText style={styles.emailText}>{email}</AppText>

            <View style={styles.codeInputContainer}>
              <View style={styles.boxesContainer}>
                {renderCodeBoxes()}
              </View>
              <TextInput
                ref={inputRef}
                value={verificationCode}
                onChangeText={(text) => {
                  const newValue = text.replace(/[^0-9]/g, '').slice(0, 6);
                  setVerificationCode(newValue);
                  if (verificationError) setVerificationError('');
                }}
                keyboardType="number-pad"
                maxLength={6}
                style={styles.hiddenInput}
                autoFocus
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
              />
              {verificationError ? (
                <AppText style={styles.errorText}>{verificationError}</AppText>
              ) : null}
            </View>

            <View style={styles.buttonContainer}>
              <PixelButton
                title={loading ? "验证中..." : "验证"}
                onPress={handleVerifyCode}
                disabled={loading}
                style={styles.verifyButton}
              />
              
              <View style={styles.linkButtonsContainer}>
                <PixelButton
                  title={
                    countdown > 0 
                      ? `重新发送(${countdown}s)` 
                      : (loading ? "发送中..." : "重新发送验证码↩")
                  }
                  onPress={handleResendEmail}
                  disabled={loading || countdown > 0}
                  variant="underline"
                  status="default"
                />
                {emailError ? (
                  <AppText style={styles.errorText}>{emailError}</AppText>
                ) : null}

                <PixelButton
                  title="返回登录↩"
                  onPress={() => navigation.replace('Login')}
                  variant="underline"
                  status="default"
                />
              </View>
            </View>
          </BorderBox>
        </KeyboardAvoidingView>
      </SafeAreaViewRN>

      <VerificationSuccessSheet
        visible={showSuccessSheet}
        onConfirm={() => {
          setShowSuccessSheet(false);
          navigation.replace('Login', {
            isFirstLogin: true,
            email: email
          });
        }}
        onClose={() => setShowSuccessSheet(false)}
        title="(･∀･)验证成功"
        message="请使用刚才的邮箱和密码，完成首次登录。"
      />
    </Background>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: wp(5),
  },
  content: {
    alignItems: 'center',
    width: '100%',
  },
  titleText: {
    fontFamily: fonts.pixel,
    fontSize: typography.size.base,
    color: colors.text,
    textAlign: 'center',
    lineHeight: typography.size.base * 1.2,
  },
  emailText: {
    fontFamily: fonts.pixel,
    fontSize: typography.size.xl,
    color: colors.text,
    textAlign: 'center',
    lineHeight: typography.size.xl * 1.2,
    marginBottom: hp(8),
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
    gap: hp(0),
  },
  verifyButton: {
    width: '55%',
    marginBottom: hp(3),
  },
  linkButtonsContainer: {
    width: '55%',
    alignSelf: 'center',
    alignItems: 'flex-start',
    gap: hp(1),
    marginBottom: hp(2),
  },
  codeInputContainer: {
    width: '100%',
    alignItems: 'center',
    position: 'relative',
  },
  boxesContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: wp(1),
  },
  codeBox: {
    marginBottom: hp(8),
    width: wp(6),
    aspectRatio: 1,
    borderRadius: wp(1),
    
    justifyContent: 'center',
    alignItems: 'center',
  },
  dash: {
    width: '70%',
    height: 1.5,
    backgroundColor: colors.textPrimary,
  },
  dashActive: {
    backgroundColor: colors.primary,
  },
  hiddenInput: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
    fontFamily: fonts.pixel,
  },
  codeText: {
    fontFamily: fonts.pixel,
    fontSize: typography.size.xl,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  errorText: {
    color: 'red',
    fontFamily: fonts.pixel,
    fontSize: typography.size.sm,
    marginTop: hp(1),
    textAlign: 'center',
  },
});

export default EmailVerificationScreen; 