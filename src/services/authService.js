import { supabase } from '../lib/supabase';
import * as Application from 'expo-application';
import * as SecureStore from 'expo-secure-store';

export const authService = {
  // 检查当前登录状态
  async checkAuth() {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
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

  // 删除账号
  async deleteAccount() {
    try {
      const session = await this.checkAuth();
      if (!session) throw new Error('用户未登录');

      // 1. 删除用户相关数据
      const { error: deleteError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', session.user.id);
      
      if (deleteError) throw deleteError;

      // 2. 删除用户认证信息
      const { error: authError } = await supabase.auth.admin.deleteUser(
        session.user.id
      );
      
      if (authError) throw authError;

      // 3. 清除本地存储
      await SecureStore.deleteItemAsync('device_id');
      
      // 4. 登出
      await this.signOut();

      return true;
    } catch (error) {
      console.error('删除账号失败:', error);
      throw new Error('删除账号失败，请重试');
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