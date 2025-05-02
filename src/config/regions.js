import { supabase } from '@lib/supabase';

// 本地备份数据
export const LOCAL_REGIONS = [
  {
    name: '华东地区',
    cities: ['杭州', '南京', '上海', '苏州']
  },
  {
    name: '华南地区',
    cities: ['广州', '南宁', '汕头', '深圳']
  },
  {
    name: '华北地区',
    cities: ['北京', '天津']
  },
  {
    name: '华中地区',
    cities: ['长沙', '武汉']
  },
  {
    name: '西南地区',
    cities: ['成都', '大理', '昆明', '重庆']
  },
  {
    name: '西北地区',
    cities: ['兰州', '西安']
  }
  // ... 其他地区数据 ...
];

// 从 teams 表获取地区数据
export const fetchRegions = async () => {
  try {
    const { data, error } = await supabase
      .from('teams')
      .select('region, city')
      .not('region', 'is', null);

    if (error) throw error;

    // 将数据转换为按地区分组的格式
    const regionMap = data.reduce((acc, team) => {
      if (!team.region || !team.city) return acc;
      
      if (!acc[team.region]) {
        acc[team.region] = new Set();
      }
      acc[team.region].add(team.city);
      return acc;
    }, {});

    // 转换成最终格式
    return Object.entries(regionMap).map(([name, cities]) => ({
      name,
      cities: Array.from(cities)
    }));
  } catch (error) {
    console.warn('获取地区数据失败，使用本地数据', error);
    return LOCAL_REGIONS;
  }
};

// 获取地区数据的函数，带错误处理
export const getRegions = async () => {
  try {
    const regions = await fetchRegions();
    return regions.length > 0 ? regions : LOCAL_REGIONS;
  } catch (error) {
    console.warn('获取地区数据失败，使用本地数据', error);
    return LOCAL_REGIONS;
  }
};

// 获取所有城市列表
export const getAllCities = async () => {
  const regions = await getRegions();
  return regions.reduce((acc, region) => [...acc, ...region.cities], []);
};

// 根据城市名获取所属地区
export const getRegionByCity = async (cityName) => {
  const regions = await getRegions();
  return regions.find(region => region.cities.includes(cityName))?.name;
};

// 验证城市是否有效
export const isValidCity = async (cityName) => {
  const cities = await getAllCities();
  return cities.includes(cityName);
}; 