import { supabase } from '@lib/supabase';
import { DEFAULT_PROFILE } from '@config/profileDefaults';
import * as FileSystem from 'expo-file-system';
import RNBlobUtil from 'react-native-blob-util';
import * as ImageManipulator from 'expo-image-manipulator';
import { decode } from 'base64-arraybuffer';
import { imageService } from '@services/imageService';

export const profileService = {
  // 获取用户档案
  async getProfile() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('请先登录');
      }

      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          nickname,
          jersey_number,
          positions,
          avatar_url,
          team_id,
          email,
          team:teams!fk_profiles_team(
            team_id,
            name,
            logo_url,
            region,
            city
          )
        `)
        .eq('id', user.id)
        .maybeSingle();

      if (error) throw error;
      
      if (!data) {
        return {
          ...DEFAULT_PROFILE,
          email: user.email
        };
      }

      return {
        id: data.id,
        nickname: data.nickname ?? DEFAULT_PROFILE.nickname,
        jersey_number: data.jersey_number ?? DEFAULT_PROFILE.jersey_number,
        positions: data.positions ?? DEFAULT_PROFILE.positions,
        avatar_url: data.avatar_url ?? DEFAULT_PROFILE.avatar_url,
        team_id: data.team_id ?? DEFAULT_PROFILE.team_id,
        team: data.team || DEFAULT_PROFILE.team,
        email: data.email ?? user.email,
        news_count: DEFAULT_PROFILE.news_count,
        team_count: DEFAULT_PROFILE.team_count,
      };
    } catch (error) {
      throw error;
    }
  },

  // 创建或更新用户档案
  async upsertProfile(profileData) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('请先登录');
      }

      const { data, error } = await supabase
        .from('profiles')
        .upsert({
          ...profileData,
          id: user.id,
          email: user.email,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      throw error;
    }
  },

  // 创建新用户档案（仅在注册时使用）
  async createProfile(userId) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('profiles')
        .upsert([{
          id: userId,
          email: user.email,
          ...DEFAULT_PROFILE,
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      throw error;
    }
  },

  // 上传头像
  async uploadAvatar(file) {
    try {
      // 使用 imageService 上传图片
      const finalUrl = await imageService.uploadImage(file, 'profiles', 'avatar', {
        maxWidth: 400,
        quality: 0.7,
        prefix: 'avatar'
      });
      
      // 异步更新用户资料
      this.upsertProfile({ avatar_url: finalUrl }).catch(error => {
        console.error('更新头像URL失败:', error);
      });

      return finalUrl;
    } catch (error) {
      throw error;
    }
  }
};