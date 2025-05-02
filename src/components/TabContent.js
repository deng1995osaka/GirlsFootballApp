import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import AppText from '@components/AppText';
import PixelButton from '@components/PixelButton';
import TeamCard from '@components/TeamCard';
import NewsCard from '@components/NewsCard';
import { colors, fonts, typography } from '@styles/main';
import { normalize, wp, hp } from '@utils/responsive';
import { supabase } from '@lib/supabase';
import { useProfileCheck } from '@hooks/useProfileCheck';

const TabContent = ({ activeTab, navigation, profileData, onCountsUpdate }) => {
  const [news, setNews] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(false);
  const { checkProfile } = useProfileCheck(navigation);

  useEffect(() => {
    console.log('TabContent useEffect 触发', { 
      activeTab, 
      'profileData?.id': profileData?.id,
      'profileData?.news_count': profileData?.news_count,
      'profileData?.team_count': profileData?.team_count 
    });

    if (profileData?.id) {
      // 无论当前标签是什么，都获取两种数据
      fetchNews();
      fetchTeams();
    }
  }, [profileData]); // 只在 profileData 变化时重新获取数据，移除 activeTab 依赖

  const fetchNews = async () => {
    try {
      console.log('执行 fetchNews');
      setLoading(true);
      if (!profileData?.id) {
        console.log('无用户ID，清空新闻数据');
        setNews([]);
        onCountsUpdate?.('news', 0);
        return;
      }

      const { data: newsData, error } = await supabase
        .from('news')
        .select(`
          *,
          profiles:created_by (
            nickname
          )
        `)
        .eq('created_by', profileData.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      console.log('获取新闻数据成功:', newsData);
      setNews(newsData || []);
      onCountsUpdate?.('news', newsData?.length || 0);
    } catch (error) {
      console.error('获取新闻失败:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeams = async () => {
    try {
      console.log('执行 fetchTeams');
      setLoading(true);
      if (!profileData?.id) {
        console.log('无用户ID，清空球队数据');
        setTeams([]);
        onCountsUpdate?.('teams', 0);
        return;
      }

      // 查询用户创建的所有球队
      const { data: teamData, error } = await supabase
        .from('teams')
        .select('*')
        .eq('created_by', profileData.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      console.log('获取球队数据成功:', { count: teamData?.length || 0 });
      setTeams(teamData || []);
      onCountsUpdate?.('teams', teamData?.length || 0);
    } catch (error) {
      console.error('获取球队失败:', error);
    } finally {
      setLoading(false);
    }
  };

  if (activeTab === '我的小报') {
    if (news.length === 0) {
      return (
        <View style={styles.emptyCard}>
          <AppText style={styles.placeholderText}>(･д･)还没有发过小报...</AppText>
          <PixelButton 
            title="发小报↩"
            variant="underline"
            status="default"
            onPress={async () => {
              const canProceed = await checkProfile();
              if (canProceed) {
                navigation.navigate('NewsCreate');
              }
            }}
          />
        </View>
      );
    }

    return (
      <View>
        {news.map(item => (
          item ? (
            <NewsCard 
              key={item?.news_id?.toString() || Math.random().toString()}
              item={item} 
              showMenuButton={true}
              navigation={navigation}
              onPress={() => navigation.navigate('NewsDetail', { newsId: item.news_id })}
              onDelete={() => {
                fetchNews(); // 删除后重新获取数据
              }}
            />
          ) : null
        ))}
      </View>
    );
  }
  
  if (teams.length === 0) {
    return (
      <View style={styles.emptyCard}>
        <AppText style={styles.placeholderText}>(･д･)还没有创建过球队...</AppText>
        <PixelButton 
          title="创建球队↩"
          variant="underline"
          status="default"
          onPress={async () => {
            const canProceed = await checkProfile();
            if (canProceed) {
              navigation.navigate('CreateTeam');
            }
          }}
        />
      </View>
    );
  }
  
  return (
    <View>
      {teams.map(item => (
        <TeamCard 
          key={item?.team_id?.toString() || Math.random().toString()}
          team={item}
          showMenuButton={true}
          navigation={navigation}
          onDelete={() => {
            fetchTeams(); // 删除后重新获取数据
          }}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  emptyCard: {
    width: '100%',
    backgroundColor: colors.bgWhite, 
    borderRadius: wp(5),
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: hp(2),
    padding: wp(4),
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: hp(25),
  },
  placeholderText: {
    color: '#A9A9A9',
    fontFamily: fonts.pixel,
    fontSize: typography.size.base,
    marginBottom: hp(2),
  },
});

export default TabContent; 