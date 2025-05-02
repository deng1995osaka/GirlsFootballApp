import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { DEFAULT_PROFILE } from '../config/profileDefaults';
import { 
  EXPO_PUBLIC_SUPABASE_URL as supabaseUrl, 
  EXPO_PUBLIC_SUPABASE_ANON_KEY as supabaseKey 
} from '@env';

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// 修改测试函数
export const testSupabaseConnection = async () => {
  try {
    // 直接测试认证服务
    const { data, error } = await supabase.auth.getSession();
    
    console.log('Supabase 连接测试:', { data, error });
    return !error;
  } catch (e) {
    console.error('Supabase 连接测试失败:', e);
    return false;
  }
};

// 检查用户邮箱验证状态
export const checkEmailVerification = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.email_confirmed_at != null;
};

// 重新发送验证邮件
export const resendVerificationEmail = async (email) => {
  const { error } = await supabase.auth.resend({
    type: 'signup',
    email: email,
  });
  return { error };
};

// 修改注册函数
export const signUpUser = async (email, password) => {
  try {
    console.log('开始注册流程:', { email });
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          email_confirm_sent: new Date().toISOString()
        }
      }
    });

    if (error) {
      console.error('注册错误:', error);
      if (error.message.includes('Email rate limit exceeded')) {
        return { 
          data: null, 
          error: new Error('发送邮件次数过多，请稍后再试') 
        };
      }
      return { data: null, error };
    }

    // 检查验证码是否发送成功
    if (!data.user) {
      console.error('验证码未发送');
      return {
        data: null,
        error: new Error('验证码发送失败，请重试')
      };
    }

    console.log('注册成功:', data);
    return { data, error: null };
  } catch (error) {
    console.error('注册过程异常:', error);
    return { 
      data: null, 
      error: new Error('注册过程发生异常，请重试') 
    };
  }
};

export const handleLogin = async (email, password) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('登录错误:', error);
      return { data: null, error };
    }

    // 检查邮箱是否已验证
    if (data.user && !data.user.email_confirmed_at) {
      return {
        data: null,
        error: new Error('请先验证您的邮箱后再登录。如需重新发送验证邮件，请使用注册页面的重新发送功能。')
      };
    }

    return { data, error: null };
  } catch (error) {
    console.error('登录过程异常:', error);
    return { 
      data: null, 
      error: new Error('登录过程发生异常，请重试') 
    };
  }
};

// 新增：检查用户是否有 profile
export const checkUserProfile = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select()
      .eq('id', userId)
      .single();
      
    if (error) throw error;
    return { hasProfile: !!data };
  } catch (error) {
    return { hasProfile: false };
  }
};

// 新增：创建用户 profile
export const createUserProfile = async (profileData) => {
  try {
    const sanitizedData = {
      ...profileData,
      positions: Array.isArray(profileData.positions) 
        ? profileData.positions.map(pos => typeof pos === 'string' ? parseInt(pos, 10) : pos)
        : [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    };

    const { data, error } = await supabase
      .from('profiles')
      .upsert([sanitizedData])
      .select()
      .single();

    if (error) {
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    return { 
      data: null, 
      error: new Error('创建用户资料失败，请重试') 
    };
  }
};