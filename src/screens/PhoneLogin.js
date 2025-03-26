import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image,
  TextInput,
  SafeAreaView,
} from 'react-native';
import { colors, fonts, typography } from '../styles/main';
import { normalize, wp, hp } from '../utils/responsive';
import { supabase } from '../lib/supabase';
import Background from '../components/Background';
import FormInput from '../components/FormInput';
import PixelButton from '../components/PixelButton';
import { sendSmsCode } from '../services/smsService';

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

      // 只在生产环境发送真实短信
      if (!__DEV__) {
        const result = await sendSmsCode(phone, code);
        console.log('短信发送结果:', result);

        if (result.body?.code === 'OK') {
          setCodeSent(true);
          Alert.alert('成功', '验证码已发送，请注意查收');
        } else {
          throw new Error(result.body?.message || '发送失败');
        }
      } else {
        // 开发环境下直接显示验证码
        setCodeSent(true);
        console.log('开发环境验证码:', code);
        Alert.alert('测试验证码', `验证码: ${code}`);
      }
    } catch (error) {
      console.error('发送验证码失败:', error);
      Alert.alert('发送失败', error.message || '请稍后重试');
    } finally {
      setLoading(false);
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
        // 验证成功后，创建或更新用户记录
        const { data: { user }, error: authError } = await supabase.auth.signUp({
          phone: phone,
          password: serverCode // 使用验证码作为临时密码
        });

        if (authError) throw authError;

        // 创建用户档案
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert([
            {
              id: user.id,
              phone: phone,
              updated_at: new Date()
            }
          ]);

        if (profileError) throw profileError;

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
      <SafeAreaView style={styles.safeArea}>
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
                <Text style={styles.title}>★短信登录★</Text>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.prefix}>+86</Text>
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
                />
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
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
