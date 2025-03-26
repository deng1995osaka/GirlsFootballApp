import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

// 预定义地区结构
const REGIONS = {
  '华东地区': ['南京', '上海', '杭州', '苏州'],
  '华南地区': ['广州', '深圳', '厦门', '福州'],
  '华北地区': ['北京', '天津', '石家庄', '济南']
};

export const useTeams = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTeams = async () => {
    try {
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // 按照预定义的地区结构组织数据
      const formattedTeams = Object.entries(REGIONS).map(([regionName, cities]) => ({
        name: regionName,
        cities: cities.map(cityName => ({
          name: cityName,
          teams: data.filter(team => 
            team.region === regionName && 
            team.location === cityName
          ).map(team => ({
            id: team.id,
            name: team.name,     // 使用 name 字段作为显示名称
            logo_url: team.logo_url
          }))
        }))
      }));

      // 过滤掉没有球队的城市
      const filteredTeams = formattedTeams.map(region => ({
        ...region,
        cities: region.cities.filter(city => city.teams.length > 0)
      })).filter(region => region.cities.length > 0);

      setTeams(filteredTeams);
    } catch (error) {
      console.error('获取球队失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  return { teams, loading, refreshTeams: fetchTeams };
}; 