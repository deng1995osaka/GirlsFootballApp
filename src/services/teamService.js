import { supabase } from '@lib/supabase';
import * as FileSystem from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';
import { decode } from 'base64-arraybuffer';
import { imageService } from '@services/imageService';

export const teamService = {
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
  },

  // 上传球队图片（队徽）
  async uploadTeamImage(file, teamId = null) {
    try {
      const finalUrl = await imageService.uploadImage(file, 'teams', 'team', {
        maxWidth: 400,
        quality: 0.7,
        prefix: 'team'
      });

      // ✅ 如果有 teamId，自动更新
      if (teamId) {
        await this.updateTeam(teamId, { logo_url: finalUrl });
      }

      return finalUrl;
    } catch (error) {
      console.error('队徽上传失败:', error);
      throw error;
    }
  },
  
  // 创建球队
  async createTeam(teamData) {
    try {
      const { data, error } = await supabase
        .from('teams')
        .insert([teamData])
        .select()
        .single();
        
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('创建球队失败:', error);
      throw error;
    }
  },

  // 更新球队信息
  async updateTeam(teamId, updates) {
    try {
      const { data, error } = await supabase
        .from('teams')
        .update(updates)
        .eq('team_id', teamId)
        .select()
        .single();
        
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('更新球队失败:', error);
      throw error;
    }
  }
};