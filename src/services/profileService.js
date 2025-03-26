import { supabase } from '../lib/supabase';

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
          *,
          team:teams!fk_profiles_team(*)
        `)
        .eq('id', user.id)
        .single();

      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('getProfile error:', error);
      throw error;
    }
  },

  // 更新用户档案
  async updateProfile(profileData) {
    try {
      // 获取用户信息和 session，使用两个方法确保用户已登录
      const { data: { session } } = await supabase.auth.getSession();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user || !session) {
        throw new Error('请先登录');
      }

      const { data, error } = await supabase
        .from('profiles')
        .update({
          nickname: profileData.nickname,
          jersey_number: profileData.jersey_number,
          positions: profileData.positions,
          avatar_url: profileData.avatar_url,
          team_id: profileData.team_id,
          logo_url: profileData.logo_url
        })
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        console.error('数据库更新错误:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('updateProfile error:', error);
      throw error;
    }
  },

  // 上传头像
  async uploadAvatar(file) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('未登录');

    const fileExt = file.uri.split('.').pop();
    const filePath = `${user.id}/avatar.${fileExt}`;

    // 转换文件格式
    const formData = new FormData();
    formData.append('file', {
      uri: file.uri,
      name: `avatar.${fileExt}`,
      type: `image/${fileExt}`
    });

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, formData, {
        upsert: true
      });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    // 更新用户档案中的头像URL
    await this.updateProfile({
      avatar_url: publicUrl
    });

    return publicUrl;
  }
};