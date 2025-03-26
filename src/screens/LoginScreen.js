import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Image,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { colors, fonts, typography } from '../styles/main';
import { normalize, wp, hp } from '../utils/responsive';
import { supabase } from '../lib/supabase';
import Background from '../components/Background';
import Header from '../components/Header';
import FormInput from '../components/FormInput';
import PixelButton from '../components/PixelButton';
import { testSupabaseConnection, signUpUser, handleLogin, checkUserProfile } from '../lib/supabase';
import BorderBox from '../components/BorderBox';
import { commonScreenStyles } from '../styles/screenStyles';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState('login'); // 'login' 或 'register'

  const handleEmailChange = (text) => {
    setEmail(text);
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

  const handleLoginPress = async () => {
    if (!email || !password) {
      Alert.alert('提示', '请输入邮箱和密码');
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await handleLogin(email, password);

      if (error) {
        if (error.message === 'Invalid login credentials') {
          Alert.alert('登录失败', '邮箱或密码不正确。如果你是新用户，请确保已经验证了邮箱。');
        } else {
          Alert.alert('登录失败', error.message);
        }
        return;
      }

      if (data?.user) {
        // 直接进入主页
        navigation.replace('Tabs');
      }
    } catch (error) {
      Alert.alert('错误', '登录过程中发生错误');
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
      const { data, error } = await signUpUser(email, password);

      if (error) {
        Alert.alert('注册失败', error.message);
        return;
      }

      // 注册成功后直接导航到验证页面
      navigation.replace('EmailVerification', { email });
    } catch (error) {
      Alert.alert('错误', '注册过程中发生错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSuccess = () => {
    navigation.replace('Tabs');
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
            <Text style={commonScreenStyles.headerTitle}>{mode === 'login' ? '登录' : '注册'}</Text>
          </View>
        </SafeAreaView>
      </View>
      <SafeAreaView style={[styles.safeArea, { marginTop: -1 }]}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.container}
        >
          <BorderBox
            iconSource={require('../../assets/icons/shoot.png')}
          >
            <View style={styles.content}>
              <View style={styles.titleContainer}>
                <Text style={styles.title}>{mode === 'login' ? '★登录★' : '★注册★'}</Text>
              </View>

              <FormInput
                value={email}
                onChangeText={handleEmailChange}
                placeholder="邮箱地址"
                autoCapitalize="none"
                keyboardType="email-address"
                editable={!loading}
                isValid={validateEmail(email)}
              />

              <FormInput
                value={password}
                onChangeText={handlePasswordChange}
                placeholder="密码"
                secureTextEntry
                editable={!loading}
                isValid={validatePassword(password)}
              />

              <PixelButton
                title={loading ? '加载中...' : (mode === 'login' ? '登录' : '注册')}
                onPress={mode === 'login' ? handleLoginPress : handleRegister}
                disabled={loading}
                style={styles.submitButton}
              />

              <View style={styles.linkButtonsContainer}>
                <PixelButton
                  title="☞使用短信登录"
                  onPress={() => navigation.navigate('PhoneLogin')}
                  variant="underline"
                />
                <PixelButton
                  title="☞注册新账号"
                  onPress={() => navigation.navigate('Register')}
                  variant="underline"
                />
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
    width: '55%',
    marginTop: hp(2),
  },
  linkButtonsContainer: {
    marginTop: hp(3),
    marginBottom: hp(5),
    alignItems: 'flex-start',
    gap: hp(2),
  },
});

export default LoginScreen; 