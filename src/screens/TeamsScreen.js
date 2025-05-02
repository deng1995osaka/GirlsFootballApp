import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, FlatList, View, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '@components/Header';
import TeamCard from '@components/TeamCard';
import Background from '@components/Background';
import { colors, fonts, typography } from '@styles/main';
import { normalize, wp, hp } from '@utils/responsive';
import { teamService } from '@services/teamService';
import DropdownMenu from '@components/DropdownMenu';
import { getRegions } from '@config/regions';
import AppText from '@components/AppText';
import { supabase } from '@lib/supabase';
import { useProfileCheck } from '@hooks/useProfileCheck';

export default function TeamsScreen({ navigation }) {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentFilter, setCurrentFilter] = useState('全部');
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [filterItems, setFilterItems] = useState([{ id: '全部', label: '全部' }]);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const filterButtonRef = useRef(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const { checkProfile } = useProfileCheck(navigation);

  useEffect(() => {
    checkLoginStatus();
    
    // 监听认证状态变化
    const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setIsLoggedIn(!!session);
      if (session) {
        const { data: { user } } = await supabase.auth.getUser();
        setCurrentUserId(user?.id);
      } else {
        setCurrentUserId(null);
      }
    });

    // 订阅 teams 表的变更
    const teamsSubscription = supabase
      .channel('public:teams')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'teams'
      }, payload => {
        console.log('✅ 监听到变更: ', payload);
        loadTeams(); // 自动刷新
      })
      .subscribe();

    return () => {
      authSubscription.unsubscribe();
      teamsSubscription.unsubscribe();
    };
  }, []);

  const checkLoginStatus = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      setIsLoggedIn(!!session);
      if (session) {
        const { data: { user } } = await supabase.auth.getUser();
        setCurrentUserId(user?.id);
      }
    } catch (error) {
      console.error('检查登录状态失败:', error);
    }
  };

  const handleAddPress = async () => {
    const canProceed = await checkProfile();
    if (canProceed) {
      navigation.navigate('CreateTeam');
    }
  };

  const handleFilterSelect = (id) => {
    setCurrentFilter(id);
    setIsDropdownVisible(false);
  };

  const refreshTeams = async () => {
    await loadTeams();
  };

  useEffect(() => {
    loadTeams();
    
    // 添加焦点监听
    const unsubscribe = navigation.addListener('focus', () => {
      loadTeams();
    });

    // 清理监听器
    return unsubscribe;
  }, [currentFilter]);

  useEffect(() => {
    const loadRegions = async () => {
      try {
        const regions = await getRegions();
        const items = [
          { id: '全部', label: '全部' },
          ...regions.map(region => ({
            id: region.name,
            label: region.name
          }))
        ];
        setFilterItems(items);
      } catch (error) {
        console.error('加载地区数据失败', error);
      }
    };
    
    loadRegions();
  }, []);

  const loadTeams = async () => {
    try {
      setLoading(true);
      let data;
      if (currentFilter === '全部') {
        data = await teamService.getAllTeams();
      } else {
        data = await teamService.getTeamsByLocation(currentFilter);
      }
      setTeams(data);
    } catch (err) {
      setError('加载失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const handleShowFilter = () => {
    filterButtonRef.current?.measure((x, y, width, height, pageX, pageY) => {
      setMenuAnchor({
        x: pageX,
        y: pageY,
        width,
        height,
      });
      setIsDropdownVisible(true);
    });
  };

  const renderTeamCard = ({ item }) => {
    // 如果是默认球队ID，则不显示
    if (item.team_id === '00000000-0000-0000-0000-000000000001') {
      return null;
    }
    
    return (
      <TeamCard 
        team={item}
        showMenuButton={false}
        navigation={navigation}
        onDelete={() => {
          fetchTeams(); // 删除后重新获取数据
        }}
      />
    );
  };

  return (
    <Background>
      <SafeAreaView style={styles.container}>
        <Header 
          title="★女孩踢球★"
          onAddPress={handleAddPress}
          showAddButton={true}
        />
        
        <View style={styles.filterContainer}>
          <TouchableOpacity 
            ref={filterButtonRef}
            style={styles.filterButton}
            onPress={handleShowFilter}
          >
            <AppText style={styles.filterText}>{currentFilter}</AppText>
            <AppText style={styles.arrowText}>▼</AppText>
          </TouchableOpacity>
        </View>

        <View style={styles.mainContent}>
          {error ? (
            <View style={styles.errorContainer}>
              <AppText style={styles.errorText}>{error}</AppText>
              <TouchableOpacity onPress={refreshTeams}>
                <AppText style={styles.retryText}>重试</AppText>
              </TouchableOpacity>
            </View>
          ) : loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : !teams.length ? (
            <View style={styles.emptyContainer}>
              <AppText style={styles.emptyText}>暂无球队</AppText>
              <TouchableOpacity onPress={refreshTeams}>
                <AppText style={styles.retryText}>刷新</AppText>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              data={teams}
              renderItem={renderTeamCard}
              keyExtractor={item => item.team_id}
              contentContainerStyle={styles.teamsList}
              showsVerticalScrollIndicator={false}
              refreshing={loading}
              onRefresh={refreshTeams}
            />
          )}
        </View>

        <DropdownMenu
          visible={isDropdownVisible}
          anchor={menuAnchor}
          items={filterItems}
          onSelect={handleFilterSelect}
          onClose={() => setIsDropdownVisible(false)}
          edgeDistance={wp(4)}
          position="left"
        />
      </SafeAreaView>
    </Background>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mainContent: {
    flex: 1,
  },
  filterContainer: {
    paddingHorizontal: wp(4),
    paddingTop: hp(0.5),
    paddingBottom: hp(0),
    position: 'relative',
    zIndex: 100,
  },
  filterButton: {
    alignSelf: 'flex-start',
    paddingVertical: hp(1),
    paddingHorizontal: wp(2),
    position: 'relative',
    flexDirection: 'row',
  },
  filterText: {
    fontFamily: fonts.pixel,
    fontSize: typography.size.base,
    color: colors.textPrimary,
  },
  arrowText: {
    fontSize: typography.size.xs,
    color: colors.textPrimary,
    fontFamily: fonts.pixel,
  },
  dropdown: {
    marginTop: hp(1),
    marginLeft: wp(4),
  },
  listContainer: {
    paddingHorizontal: wp(4),
    paddingTop: hp(0),
    flexGrow: 1,
  },
  listFooter: {
    height: hp(2),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: wp(4),
  },
  errorText: {
    color: colors.error,
    fontSize: typography.size.base,
    fontFamily: fonts.pixel,
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: wp(4),
  },
  emptyText: {
    color: colors.textPrimary,
    fontSize: typography.size.base,
    fontFamily: fonts.pixel,
    textAlign: 'center',
  },
  teamsList: {
    paddingHorizontal: wp(4),
    paddingTop: hp(0),
    flexGrow: 1,
  },
  retryText: {
    color: colors.primary,
    fontSize: typography.size.base,
    fontFamily: fonts.pixel,
    textAlign: 'center',
  },
});
