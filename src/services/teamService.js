import { supabase } from '../lib/supabase';

export const teamsService = {
  async getAllTeams() {
    try {
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('获取所有球队失败:', error);
      throw error;
    }
  },

  async getTeamsByLocation(region) {
    try {
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .eq('region', region)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('按地区获取球队失败:', error);
      throw error;
    }
  }
};