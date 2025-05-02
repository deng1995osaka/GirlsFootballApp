import { supabase } from '@lib/supabase';

export const teamsStore = {
  async getTeamsList() {
    try {
      const { data, error } = await supabase
        .from('teams')
        .select('*');

      if (error) throw error;

      const mappedData = data.map(team => {
        return {
          team_id: team.team_id,
          name: team.name,
          region: team.region,
          city: team.city,
          established: new Date(team.established).getFullYear() + '年成立',
          contact: {
            platform: team.social_platform,
            id: team.social_id
          },
          court: team.court,
          rules: team.rules,
          stats: {
            training: parseInt(team.training_sessions) || 0,
            matches: parseInt(team.games_played) || 0
          },
          images: {
            uniform: team.team_uniform,
            logo: team.team_logo
          }
        };
      });

      return mappedData;

    } catch (error) {
      console.error('获取球队列表失败:', error);
      throw error;
    }
  }
};