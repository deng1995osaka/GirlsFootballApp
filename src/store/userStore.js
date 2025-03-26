import { supabase } from '../lib/supabase';

export const userStore = {
  // 获取用户资料
  async getUserProfile() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('未登录');

    const { data, error } = await supabase
      .from('profiles')
      .select(`
        *,
        team_members (
          teams (*)
        )
      `)
      .eq('id', user.id)
      .single();

    if (error) throw error;
    return data;
  },

  // 更新用户资料
  async updateProfile(profileData) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('未登录');

    const { data, error } = await supabase
      .from('profiles')
      .update({
        nickname: profileData.nickname,
        jersey_number: profileData.number,
        positions: profileData.selectedPositions,
        avatar_url: profileData.avatar
      })
      .eq('id', user.id);

    if (error) throw error;
    return data;
  }
};