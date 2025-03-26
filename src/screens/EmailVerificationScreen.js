import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { colors, fonts, typography } from '../styles/main';
import { normalize, wp, hp } from '../utils/responsive';
import { supabase } from '../lib/supabase';
import Background from '../components/Background';
import PixelButton from '../components/PixelButton';
import BorderBox from '../components/BorderBox';
import FormInput from '../components/FormInput';
import { commonScreenStyles } from '../styles/screenStyles';

const EmailVerificationScreen = ({ route, navigation }) => {
  const [loading, setLoading] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const email = route.params?.email;

  const handleVerifyCode = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      Alert.alert('错误', '请输入6位验证码');
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: verificationCode,
        type: 'signup'
      });

      if (error) {
        Alert.alert('验证失败', '验证码错误或已过期');
        return;
      }

      Alert.alert('验证成功', '邮箱验证成功', [
        {
          text: '确定',
          onPress: () => navigation.replace('Login')
        }
      ]);
    } catch (error) {
      Alert.alert('错误', '验证过程中发生错误');
    } finally {
      setLoading(false);
    }
  };

  const handleResendEmail = async () => {
    if (!email) {
      Alert.alert('错误', '邮箱地址无效');
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      });

      if (error) {
        console.error('重发验证邮件失败:', error);
        Alert.alert('发送失败', '验证邮件发送失败，请稍后重试');
        return;
      }

      Alert.alert('成功', '验证邮件已重新发送，请查收');
    } catch (error) {
      Alert.alert('错误', '发送过程中发生错误');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Background>
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      <View style={{ backgroundColor: 'white' }}>
        <SafeAreaView style={{ backgroundColor: 'white' }}>
          <View style={commonScreenStyles.headerContainer}>
            <TouchableOpacity 
              style={commonScreenStyles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={commonScreenStyles.backButtonText}>←</Text>
            </TouchableOpacity>
            <Text style={commonScreenStyles.headerTitle}>邮箱验证</Text>
          </View>
        </SafeAreaView>
      </View>
      <SafeAreaView style={[styles.safeArea, { marginTop: -1 }]}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.container}
        >
          <BorderBox iconSource={null}>
            <View style={styles.content}>
              <Text style={styles.message}>
                验证码已发送至：{'\n'}{email}
              </Text>

              <FormInput
                value={verificationCode}
                onChangeText={setVerificationCode}
                placeholder=""
                keyboardType="number-pad"
                maxLength={6}
                style={styles.verificationInput}
                autoFocus
              />

              <View style={styles.buttonContainer}>
                <PixelButton
                  title={loading ? "验证中..." : "验证"}
                  onPress={handleVerifyCode}
                  disabled={loading}
                  style={styles.verifyButton}
                />
                
                <View style={styles.linkButtonsContainer}>
                  <PixelButton
                    title={loading ? "发送中..." : "☞重新发送验证码"}
                    onPress={handleResendEmail}
                    disabled={loading}
                    variant="underline"
                  />

                  <PixelButton
                    title="☞返回登录"
                    onPress={() => navigation.replace('Login')}
                    variant="underline"
                  />
                </View>
              </View>
            </View>
          </BorderBox>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Background>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
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
  message: {
    fontFamily: fonts.pixel,
    fontSize: typography.size.base,
    color: colors.text,
    textAlign: 'center',
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
  verificationInput: {
    width: wp(30),
    marginBottom: hp(0),
  },
  linkButtonsContainer: {
    width: '55%',
    alignSelf: 'center',
    alignItems: 'flex-start',
    gap: hp(1),
    marginBottom: hp(2),
  },
});

export default EmailVerificationScreen; 