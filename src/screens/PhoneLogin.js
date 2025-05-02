import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image,
  TextInput,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  ScrollView,
  Keyboard
} from 'react-native';
import { colors, fonts, typography } from '@styles/main';
import { normalize, wp, hp } from '@utils/responsive';
import { supabase } from '@lib/supabase';
import Background from '@components/Background';
import FormInput from '@components/FormInput';
import PixelButton from '@components/PixelButton';
import { sendSmsCode } from '@services/smsService';
import AppText from '@components/AppText';
import { SafeAreaView as SafeAreaViewRN } from 'react-native-safe-area-context';
import { createUserProfile } from '@services/userService';
import { DEFAULT_PROFILE } from '@config/profileDefaults';

// 判断是否为生产环境
const isProduction = !__DEV__;  // 在 Xcode Release 构建时会自动设置为 true

const PhoneLogin = ({ navigation }) => {
  const [phone, setPhone] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [serverCode, setServerCode] = useState('');

  const validatePhone = (phone) => {
    const phoneRegex = /^1[3-9]\d{9}$/;
    return phoneRegex.test(phone);
  };

  const handleSendCode = async () => {
    if (!validatePhone(phone)) {
      Alert.alert('提示', '请输入有效的手机号');
      return;
    }

    try {
      setLoading(true);
      console.log('开始发送验证码:', { phone });

      const code = Math.random().toString().slice(-6);
      setServerCode(code);

      // 根据环境区分处理方式
      if (!isProduction) {
        // 开发环境：直接显示验证码
        setCodeSent(true);
        console.log('开发环境验证码:', code);
        Alert.alert(
          '测试模式',
          `当前环境: ${isProduction ? '生产' : '开发'}\n测试验证码: ${code}`,
          [{ text: '确定', onPress: () => console.log('验证码已显示') }]
        );
        setLoading(false);
        return;
      }

      try {
        // 生产环境：发送真实短信
        const result = await sendSmsCode(phone, code);
        console.log('短信发送结果:', result);

        if (result.body?.code === 'OK') {
          setCodeSent(true);
          Alert.alert('成功', '验证码已发送，请注意查收');
        } else {
          throw new Error(result.body?.message || '发送失败');
        }
      } catch (error) {
        console.error('发送验证码失败:', error);
        Alert.alert('发送失败', error.message || '请稍后重试');
      } finally {
        setLoading(false);
      }
    } catch (error) {
      console.error('发送验证码失败:', error);
      Alert.alert('发送失败', error.message || '请稍后重试');
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode) {
      Alert.alert('提示', '请输入验证码');
      return;
    }

    try {
      setLoading(true);
      
      if (verificationCode === serverCode) {
        // 使用 signInWithPassword 而不是 signUp
        const { data, error: authError } = await supabase.auth.signInWithPassword({
          phone: phone,
          password: verificationCode
        });

        if (authError) throw authError;

        // 如果用户不存在，创建用户档案
        if (data.user) {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select()
            .eq('id', data.user.id)
            .single();

          if (profileError || !profile) {
            const { error: createError } = await createUserProfile({
              id: data.user.id,
              ...DEFAULT_PROFILE,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });
            if (createError) {
              console.error('创建用户档案失败:', createError);
              // 继续执行，不阻止用户登录
            }
          }
        }

        navigation.replace('Tabs');
      } else {
        Alert.alert('验证失败', '验证码不正确');
      }
    } catch (error) {
      console.error('验证码验证失败:', error);
      Alert.alert('错误', '验证失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Background>
      <SafeAreaViewRN style={styles.safeArea}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.container}
        >
          <View style={styles.dashedContainer}>
            <View style={styles.content}>
              <View style={styles.iconContainer}>
                <Image 
                  source={require('../../assets/icons/shoot.png')}
                  style={styles.icon}
                  resizeMode="contain"
                />
              </View>

              <View style={styles.titleContainer}>
                <AppText style={styles.title}>★短信登录★</AppText>
              </View>

              <View style={styles.inputContainer}>
                <AppText style={styles.prefix}>+86</AppText>
                <TextInput
                  style={styles.input}
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="请输入手机号"
                  keyboardType="phone-pad"
                  maxLength={11}
                  placeholderTextColor={colors.textSecondary}
                  editable={!loading && !codeSent}
                />
              </View>

              {codeSent && (
                <FormInput
                  value={verificationCode}
                  onChangeText={setVerificationCode}
                  placeholder="请输入验证码"
                  keyboardType="number-pad"
                  maxLength={6}
                  editable={!loading}
                />
              )}

              <PixelButton
                title={loading ? "处理中..." : (codeSent ? "登录" : "获取验证码")}
                onPress={codeSent ? handleVerifyCode : handleSendCode}
                disabled={loading}
                style={styles.submitButton}
              />

              <View style={styles.bottomLinks}>
                <PixelButton
                  title="☞返回登录"
                  onPress={() => navigation.navigate('Login')}
                  variant="underline"
                  status="default"
                />
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaViewRN>
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
  dashedContainer: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: wp(4),
    padding: wp(6),
    backgroundColor: colors.bgWhite,
  },
  content: {
    width: '100%',
  },
  iconContainer: {
    marginBottom: hp(4),
    alignItems: 'left',
  },
  icon: {
    width: wp(44),
    height: wp(15),
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
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp(2),
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: wp(2),
    paddingHorizontal: wp(3),
  },
  prefix: {
    fontFamily: fonts.pixel,
    fontSize: typography.size.base,
    color: colors.textSecondary,
    marginRight: wp(2),
  },
  input: {
    flex: 1,
    height: hp(6),
    fontFamily: fonts.pixel,
    fontSize: typography.size.base,
    color: colors.text,
  },
  submitButton: {
    marginTop: hp(4),
  },
  bottomLinks: {
    marginTop: hp(4),
    alignItems: 'center',
  },
});

export default PhoneLogin;
