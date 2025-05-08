import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Image,
  StatusBar,
  ScrollView,
  Keyboard,
  TouchableWithoutFeedback
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fonts, typography } from '@styles/main';
import { normalize, wp, hp } from '@utils/responsive';
import { supabase } from '@lib/supabase';
import Background from '@components/Background';
import Header from '@components/Header';
import FormInput from '@components/FormInput';
import PixelButton from '@components/PixelButton';
import { testSupabaseConnection, signUpUser, handleLogin, checkUserProfile, createUserProfile } from '@lib/supabase';
import BorderBox from '@components/BorderBox';
import { commonScreenStyles } from '@styles/screenStyles';
import AppText from '@components/AppText';
import { DEFAULT_PROFILE } from '@config/profileDefaults';
import Toast from 'react-native-toast-message';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri, startAsync } from 'expo-auth-session';
import * as Crypto from 'expo-crypto';
import * as Linking from 'expo-linking';
import * as AppleAuthentication from 'expo-apple-authentication';

const LoginScreen = ({ route, navigation }) => {
  const [email, setEmail] = useState(route.params?.email || '');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [appleLoading, setAppleLoading] = useState(false);
  const [mode, setMode] = useState('register'); // 修改默认模式为'register'
  const [error, setError] = useState('');
  const isFirstLogin = route.params?.isFirstLogin;
  const [focusedInput, setFocusedInput] = useState(null);
  const [errors, setErrors] = useState({
    email: false,
    password: false
  });

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('🔔 Auth 状态变化:', { event, session });

      if (event === 'SIGNED_IN') {
        navigation.replace('Tabs');
      }
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const handleEmailChange = (text) => {
    setEmail(text.trim());
  };

  const handlePasswordChange = (text) => {
    setPassword(text);
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    return password.length >= 6;
  };

  const validateForm = () => {
    const newErrors = {
      email: !email.trim(),
      password: !password.trim()
    };
    
    if (email.trim() && !validateEmail(email)) {
      newErrors.email = true;
    }
    
    if (password.trim() && password.length < 6) {
      newErrors.password = true;
    }
    
    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error);
  };

  const handleLoginPress = async () => {
    if (loading) return;
    
    try {
      // 验证表单
      if (!validateForm()) {
        return;
      }
      
      setLoading(true);
      
      const { data, error } = await handleLogin(email, password);
      
      if (error) {
        if (error.message === 'Invalid login credentials') {
          Toast.show({
            type: 'error',
            text1: '登录失败',
            text2: '邮箱或密码不正确。如果你是新用户，请确保已经验证了邮箱。',
            visibilityTime: 3000,
            autoHide: true,
            position: 'top',
          });
        } else {
          Toast.show({
            type: 'error',
            text1: '登录失败',
            text2: error.message,
            visibilityTime: 3000,
            autoHide: true,
            position: 'top',
          });
        }
        return;
      }
      
      if (data?.user) {
        // 检查并创建 profile
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          // 先检查 profile 是否存在
          const { data: existingProfile, error: checkError } = await supabase
            .from('profiles')
            .select()
            .eq('id', user.id)
            .single();

          if (checkError && checkError.code !== 'PGRST116') { // PGRST116 是"未找到记录"的错误码
            console.error('检查 profile 失败:', checkError);
          } else if (!existingProfile) {
            // 只有在 profile 不存在时才创建
            const { error: profileError } = await supabase
              .from('profiles')
              .upsert([{ 
                id: user.id, 
                ...DEFAULT_PROFILE 
              }])
              .select()
              .single();

            if (profileError) {
              console.error('创建 profile 失败:', profileError);
              // 继续执行，不阻止用户进入主页
            }
          }
        }

        Toast.show({
          type: 'success',
          text1: '成功',
          text2: '登录成功',
          visibilityTime: 2000,
          autoHide: true,
          position: 'top',
        });
        navigation.replace('Tabs');
      }
    } catch (error) {
      console.error('登录失败:', error);
      Toast.show({
        type: 'error',
        text1: '错误',
        text2: error.message || '登录失败，请重试',
        visibilityTime: 2000,
        autoHide: true,
        position: 'top',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!email || !password) {
      Alert.alert('提示', '请输入邮箱和密码');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('提示', '请输入有效的邮箱地址');
      return;
    }

    if (!validatePassword(password)) {
      Alert.alert('提示', '密码长度至少需要6位');
      return;
    }

    try {
      setLoading(true);
      const { data: signUpData, error: signUpError } = await signUpUser(email, password);

      if (signUpError) {
        Toast.show({
          type: 'error',
          text1: '注册失败',
          text2: signUpError.message,
          visibilityTime: 3000,
          autoHide: true,
          position: 'top',
        });
        return;
      }

      // 直接导航到验证页面
      navigation.replace('EmailVerification', { email });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: '错误',
        text2: '注册过程中发生错误，请稍后重试',
        visibilityTime: 3000,
        autoHide: true,
        position: 'top',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSuccess = () => {
    navigation.replace('Tabs');
  };

  const handleAppleLogin = async () => {
    try {
      setAppleLoading(true);
      
      // 检查设备是否支持 Apple 登录
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      // 使用获取到的凭证进行 Supabase 登录
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'apple',
        token: credential.identityToken,
      });

      if (error) {
        console.error('❌ Apple 登录失败:', error);
        Toast.show({
          type: 'error',
          text1: '登录失败',
          text2: error.message,
          visibilityTime: 3000,
          autoHide: true,
          position: 'top',
        });
        return;
      }

      if (data?.user) {
        // 检查并创建 profile
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          // 先检查 profile 是否存在
          const { data: existingProfile, error: checkError } = await supabase
            .from('profiles')
            .select()
            .eq('id', user.id)
            .single();

          if (checkError && checkError.code !== 'PGRST116') {
            console.error('检查 profile 失败:', checkError);
          } else if (!existingProfile) {
            // 只有在 profile 不存在时才创建
            const { error: profileError } = await supabase
              .from('profiles')
              .upsert([{ 
                id: user.id, 
                ...DEFAULT_PROFILE,
                // 如果有用户信息，添加到 profile 中
                full_name: credential.fullName?.givenName 
                  ? `${credential.fullName.givenName} ${credential.fullName.familyName || ''}`
                  : DEFAULT_PROFILE.full_name,
                email: credential.email || user.email,
              }])
              .select()
              .single();

            if (profileError) {
              console.error('创建 profile 失败:', profileError);
            }
          }
        }

        Toast.show({
          type: 'success',
          text1: '成功',
          text2: '登录成功',
          visibilityTime: 2000,
          autoHide: true,
          position: 'top',
        });
        navigation.replace('Tabs');
      }
    } catch (err) {
      if (err.code === 'ERR_CANCELED') {
        // 用户取消了登录
        console.log('用户取消了 Apple 登录');
      } else {
        console.error('❌ Apple 登录异常:', err);
        Toast.show({
          type: 'error',
          text1: '错误',
          text2: 'Apple 登录失败，请重试',
          visibilityTime: 3000,
          autoHide: true,
          position: 'top',
        });
      }
    } finally {
      setAppleLoading(false);
    }
  };

  return (
    <Background>
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      <View style={{ backgroundColor: 'white', zIndex: 1 }}>
        <SafeAreaView style={{ backgroundColor: 'white' }}>
          <View style={commonScreenStyles.headerContainer}>
            <TouchableOpacity 
              style={commonScreenStyles.backButton}
              onPress={() => navigation.goBack()}
            >
              <AppText style={commonScreenStyles.backButtonText}>←</AppText>
            </TouchableOpacity>
            <AppText style={commonScreenStyles.headerTitle}>
              {isFirstLogin ? '首次登录' : '登录'}
            </AppText>
          </View>
        </SafeAreaView>
      </View>
      <SafeAreaView style={[styles.safeArea, { marginTop: -1 }]}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.container}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={{ flex: 1 }}>
              <BorderBox
                iconSource={require('../../assets/icons/shoot.png')}
              >
                <View style={styles.content}>
                  <View style={styles.titleContainer}>
                    <AppText style={styles.title}>{mode === 'register' ? '★欢迎加入女孩踢球★' : '★登录★'}</AppText>
                  </View>

                  {error && (
                    <AppText style={styles.errorText}>{error}</AppText>
                  )}

                  <FormInput
                    value={email}
                    onChangeText={handleEmailChange}
                    placeholder="邮箱地址"
                    autoCapitalize="none"
                    keyboardType="email-address"
                    editable={!loading}
                    isValid={validateEmail(email)}
                    style={[
                      errors.email && styles.inputError
                    ]}
                    onFocus={() => setFocusedInput('email')}
                    onBlur={() => setFocusedInput(null)}
                  />
                  {errors.email && (
                    <AppText style={styles.errorText}>
                      {email.trim() ? '请输入有效的邮箱地址' : '请输入邮箱'}
                    </AppText>
                  )}

                  <FormInput
                    value={password}
                    onChangeText={handlePasswordChange}
                    placeholder="密码"
                    secureTextEntry
                    editable={!loading}
                    isValid={validatePassword(password)}
                    style={[
                      errors.password && styles.inputError
                    ]}
                    onFocus={() => setFocusedInput('password')}
                    onBlur={() => setFocusedInput(null)}
                  />
                  {errors.password && (
                    <AppText style={styles.errorText}>
                      {password.trim() ? '密码长度至少需要6位' : '请输入密码'}
                    </AppText>
                  )}

                  <PixelButton
                    title={loading ? "加载中..." : (mode === 'login' ? '登录' : '注册')}
                    onPress={mode === 'login' ? handleLoginPress : handleRegister}
                    disabled={loading}
                    style={styles.submitButton}
                  />
                  {Platform.OS === 'ios' && (
                    <AppleAuthentication.AppleAuthenticationButton
                      buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
                      buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.WHITE_OUTLINE}
                      cornerRadius={100}
                      style={styles.appleButton}
                      onPress={handleAppleLogin}
                      disabled={appleLoading}
                    />
                  )}

                  <View style={styles.linkButtonsContainer}>
                    {mode === 'login' ? (
                      <PixelButton
                        title="注册新账号↩"
                        onPress={() => setMode('register')}
                        variant="underline"
                        status="default"
                      />
                    ) : (
                      <PixelButton
                        title="已有账号?去登录↩"
                        onPress={() => setMode('login')}
                        variant="underline"
                        status="default"
                      />
                    )}
                  </View>
                </View>
              </BorderBox>
            </View>
          </TouchableWithoutFeedback>
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
    width: '100%',
  },
  titleContainer: {
    marginBottom: hp(6),
    alignItems: 'flex-start',
  },
  title: {
    fontFamily: fonts.pixel,
    fontSize: typography.size.xxl,
    color: colors.text,
    textAlign: 'left',
  },
  bottomLinks: {
    marginTop: hp(3),
    marginBottom: hp(5),
    alignItems: 'flex-start',
    gap: hp(2),
  },
  submitButton: {
    width: '65%',
    marginTop: hp(2),
  },
  linkButtonsContainer: {
    marginTop: hp(3),
    marginBottom: hp(5),
    alignItems: 'flex-start',
    gap: hp(2),
  },
  errorText: {
    color: 'red',
    marginBottom: hp(2),
  },
  inputError: {
    borderColor: colors.error,
  },
  appleButton: {
    width: '65%',
    height: hp(6), 
    marginTop: hp(2),
  },
});

export default LoginScreen; 