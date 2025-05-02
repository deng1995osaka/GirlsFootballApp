import { supabase } from '@lib/supabase';
import * as Application from 'expo-application';
import * as SecureStore from 'expo-secure-store';
import { profileService } from '@services/profileService';

export const authService = {
  // 检查当前登录状态
  async checkAuth() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    } catch (error) {
      console.error('检查登录状态失败:', error);
      return null;
    }
  },

  // 邮箱登录
  async signInWithEmail(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('登录失败:', error);
      throw error;
    }
  },

  // 邮箱注册
  async signUpWithEmail(email, password) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      // 使用 profileService 创建用户档案
      if (data.user) {
        try {
          await profileService.createProfile(data.user.id);
        } catch (profileError) {
          console.error('创建用户档案失败:', profileError);
          // 即使创建档案失败，也返回注册成功的结果
          // 用户可以稍后在编辑档案时重试
        }
      }

      return data;
    } catch (error) {
      console.error('注册失败:', error);
      throw error;
    }
  },

  // 手机号登录（稍后实现）
  async signInWithPhone(phone, password) {
    // TODO: 实现手机号登录
  },

  // Apple登录（稍后实现）
  async signInWithApple() {
    // TODO: 实现Apple登录
  },

  // 登出
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // 清除本地存储的设备ID
      await SecureStore.deleteItemAsync('device_id');
      
      return true;
    } catch (error) {
      console.error('退出登录失败:', error);
      throw new Error('退出登录失败，请重试');
    }
  },

  async getDeviceId() {
    // 获取或生成设备唯一标识
    let deviceId = await SecureStore.getItemAsync('device_id');
    if (!deviceId) {
      deviceId = Application.androidId || // Android
                 await Application.getIosIdForVendorAsync() || // iOS
                 `device_${Date.now()}`; // 后备方案
      await SecureStore.setItemAsync('device_id', deviceId);
    }
    return deviceId;
  }
};