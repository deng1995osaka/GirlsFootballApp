import { supabase } from '../lib/supabase';

export const teamsService = {
  // 获取所有球队
  async getAllTeams() {
    const { data, error } = await supabase
      .from('teams')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // 按地区筛选球队
  async getTeamsByLocation(location) {
    const { data, error } = await supabase
      .from('teams')
      .select('*')
      .eq('location', location)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // 创建新球队
  async createTeam(teamData) {
    const { data, error } = await supabase
      .from('teams')
      .insert([teamData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // 上传球队图片
  async uploadTeamImage(file, path) {
    const { data, error } = await supabase.storage
      .from('team-images')
      .upload(path, file);

    if (error) throw error;
    return data;
  }
};