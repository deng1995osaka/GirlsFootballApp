import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fonts, typography, layout } from '@styles/main';
import { normalize, wp, hp } from '@utils/responsive';
import PlayerCard from '@components/PlayerCard';
import PixelCard from '@components/PixelCard';
import TeamCard from '@components/TeamCard';
import Header from '@components/Header';
import PixelButton from '@components/PixelButton';
import Background from '@components/Background';
import GuestView from '@components/GuestView';
import { useNavigation } from '@react-navigation/native';
import { profileService } from '@services/profileService';
import { authService } from '@services/authService';
import { supabase, checkUserProfile } from '@lib/supabase';
import TabContent from '@components/TabContent';
import AppText from '@components/AppText';
import { teamsStore } from '@store/teamsStore';
import { newsStore } from '@store/newsStore';
import { userStore } from '@store/userStore';
import ActionListSheet from '@components/ActionListSheet';
import { DEFAULT_PROFILE } from '@config/profileDefaults';
import { useProfileCheck } from '@hooks/useProfileCheck';

const ProfileScreen = ({ navigation, route }) => {
  const [activeTab, setActiveTab] = useState('我的小报');
  const [profileData, setProfileData] = useState(DEFAULT_PROFILE);
  const [newsCount, setNewsCount] = useState(0);
  const [teamsCount, setTeamsCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isGuest, setIsGuest] = useState(true);
  const [actionSheetVisible, setActionSheetVisible] = useState(false);
  const { checkProfile } = useProfileCheck(navigation);
  const refreshInterval = useRef(null);
  
  // 添加菜单相关的 ref
  const menuButtonRef = useRef(null);

  useEffect(() => {
    checkAuthAndLoadProfile();

    return () => {
      // 清理 profile 订阅
      if (window.profileSubscription) {
        window.profileSubscription.unsubscribe();
        window.profileSubscription = null;
      }
    };
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      if (route.params?.shouldRefresh) {
        console.log('👀 检测到来自编辑页的刷新指令');
        checkAuthAndLoadProfile(); // 重新加载资料
      }
    });

    return unsubscribe;
  }, [navigation, route]);

  useEffect(() => {
    // 每55分钟刷新一次头像URL
    refreshInterval.current = setInterval(async () => {
      if (!isGuest) {
        try {
          const data = await profileService.getProfile();
          setProfileData(prev => ({
            ...prev,
            avatar_url: data.avatar_url
          }));
        } catch (error) {
          console.error('刷新头像URL失败:', error);
        }
      }
    }, 55 * 60 * 1000); // 55分钟

    return () => {
      if (refreshInterval.current) {
        clearInterval(refreshInterval.current);
      }
    };
  }, [isGuest]);

  useEffect(() => {
    if (route.params?.shouldRefresh) {
      loadProfile();
      // 清除刷新标记
      navigation.setParams({ shouldRefresh: false });
    }
  }, [route.params?.shouldRefresh]);

  const checkAuthAndLoadProfile = async () => {
    try {
      setIsLoading(true);
      const session = await supabase.auth.getSession();
      
      if (!session.data.session) {
        setIsGuest(true);
        setIsLoading(false);
        return;
      }
      
      setIsGuest(false);
      await loadProfile();

      // 订阅用户资料变更
      const profileSubscription = supabase
        .channel('public:profiles')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${session.data.session.user.id}`
        }, payload => {
          console.log('✅ 监听到用户资料变更: ', payload);
          loadProfile(); // 自动刷新
        })
        .subscribe();

      // 保存订阅引用以便后续清理
      window.profileSubscription = profileSubscription;
      
    } catch (err) {
      setError('初始化失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  const loadProfile = async () => {
    try {
      const data = await profileService.getProfile();
      
      console.log('🔍 ProfileScreen - loadProfile 原始数据:', data);

      if (!data) {
        console.log('⚠️ ProfileScreen - 没有获取到 profile 数据，使用默认值');
        setProfileData(DEFAULT_PROFILE);
        return;
      }

      const processedData = {
        ...DEFAULT_PROFILE,
        ...data,
        nickname: data.nickname || DEFAULT_PROFILE.nickname,
        jersey_number: data.jersey_number || DEFAULT_PROFILE.jersey_number,
        positions: data.positions || DEFAULT_PROFILE.positions,
        avatar_url: data.avatar_url || DEFAULT_PROFILE.avatar_url,
        news_count: data.news_count || DEFAULT_PROFILE.news_count,
        team_count: data.team_count || DEFAULT_PROFILE.team_count
      };

      console.log('🔍 ProfileScreen - 处理后的 profile 数据:', processedData);

      if (data.team_id) {
        const { data: teamData, error: teamError } = await supabase
          .from('teams')
          .select('name, logo_url')
          .eq('team_id', data.team_id)
          .single();

        if (teamError) throw teamError;

        setProfileData({
          ...processedData,
          team: {
            name: teamData?.name || DEFAULT_PROFILE.team.name,
            logo_url: teamData?.logo_url || DEFAULT_PROFILE.team.logo_url
          }
        });
      } else {
        setProfileData({
          ...processedData,
          team: DEFAULT_PROFILE.team
        });
      }
    } catch (err) {
      console.error('加载用户档案失败:', err);
      setProfileData(DEFAULT_PROFILE);
    }
  };

  const handleCountsUpdate = (type, count) => {
    if (type === 'news') {
      setNewsCount(count);
    } else if (type === 'teams') {
      setTeamsCount(count);
    }
  };

  const handleMenuAction = async (action) => {
    console.log('🔍 ProfileScreen - handleMenuAction:', action);
    if (action === 'logout') {
      try {
        console.log('🔍 ProfileScreen - 开始退出登录');
        const result = await authService.signOut();
        console.log('🔍 ProfileScreen - 退出登录结果:', result);
        setIsGuest(true);
        // 退出后导航到登录页面
        navigation.replace('Login');
      } catch (error) {
        console.error('退出登录失败:', error);
        Alert.alert('错误', '退出登录失败，请重试');
      }
    }
  };

  const renderContent = () => {
    if (error) {
      return (
        <View style={styles.errorContainer}>
          <AppText style={styles.errorText}>{error}</AppText>
          <PixelButton 
            title="重试"
            onPress={checkAuthAndLoadProfile}
          />
        </View>
      );
    }

    if (isGuest) {
      return <GuestView navigation={navigation} />;
    }

    return (
      <View style={styles.container}>
        <ScrollView>
          <View style={styles.cardsContainer}>
            <View style={styles.cardWrapper}>
              {console.log('🔍 ProfileScreen - 传递给 PlayerCard 的数据:', {
                nickname: profileData.nickname,
                teamName: typeof profileData.team?.name === 'string' ? profileData.team.name : '暂无所属球队',
                avatarUrl: profileData.avatar_url,
                teamLogoUrl: profileData.team?.logo_url
              })}
              <PlayerCard 
                nickname={profileData.nickname}
                teamName={typeof profileData.team?.name === 'string' ? profileData.team.name : '暂无所属球队'}
                avatarUrl={profileData.avatar_url}
                teamLogoUrl={profileData.team?.logo_url}
              />
            </View>
            <View style={styles.cardWrapper}>
              <PixelCard playerData={profileData} />
            </View>
          </View>

          <View style={styles.editButtonContainer}>
            <PixelButton 
              title="编辑我的卡片"
              onPress={() => navigation.navigate('EditProfile', { profileData })}
            />
          </View>

          <View style={styles.tabsContainer}>
            <View style={styles.tabsHeader}>
              <TouchableOpacity 
                style={styles.tabButton}
                onPress={() => setActiveTab('我的小报')}
              >
                <AppText style={[
                  styles.tabItem,
                  activeTab === '我的小报' && styles.activeTab
                ]}>
                  {`我的小报(${newsCount})`}
                </AppText>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.tabButton}
                onPress={() => setActiveTab('我的球队')}
              >
                <AppText style={[
                  styles.tabItem,
                  activeTab === '我的球队' && styles.activeTab
                ]}>
                  {`我的球队(${teamsCount})`}
                </AppText>
              </TouchableOpacity>
            </View>
            <TabContent 
              activeTab={activeTab}
              navigation={navigation}
              profileData={profileData}
              onCountsUpdate={handleCountsUpdate}
            />
          </View>
        </ScrollView>
      </View>
    );
  };

  const handleShowMenu = () => {
    setActionSheetVisible(true);
  };

  return (
    <Background>
      <SafeAreaView style={styles.container}>
        <Header 
          title="★我的空间★"
          showAddButton={true}
          buttonType="≡"
          onAddPress={handleShowMenu}
          hideMenuButton={isGuest}
          buttonRef={menuButtonRef}
        />
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          renderContent()
        )}

        <ActionListSheet
          visible={actionSheetVisible}
          onClose={() => setActionSheetVisible(false)}
          title="选择操作"
          actions={[
            { label: '编辑我的卡片↩', onPress: () => navigation.navigate('EditProfile') },
            { label: '退出登录↩', onPress: async () => {
                try {
                  await authService.signOut();
                  setIsGuest(true);
                  navigation.replace('Login');
                } catch (error) {
                  console.error('退出登录失败:', error);
                  Alert.alert('错误', '退出登录失败，请重试');
                }
              }
            },
          ]}
        />
      </SafeAreaView>
    </Background>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  cardsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'stretch',
    paddingHorizontal: wp(4),
  
    gap: wp(2.5),
    marginTop: hp(2),
    marginBottom: hp(2),
  },
  cardWrapper: {
    flex: 0.5,
  },
  placeholderText: {
    color: colors.textLight,
    fontSize: typography.size.base,
    fontFamily: fonts.pixel,
  },
  editButtonContainer: {
    alignItems: 'center',
    paddingTop: hp(0.5),
    paddingBottom: hp(3.5),
  },
  tabsContainer: {
    paddingHorizontal: wp(5),
    backgroundColor: colors.bgWhite,
  },
  tabsHeader: {
    flexDirection: 'row',
    marginBottom: hp(2),
  },
  tabItem: {
    flex: 1,
    textAlign: 'center',
    paddingTop: hp(2.5),
    paddingBottom: hp(0),
    marginRight: wp(5),
    fontSize: typography.size.base,
    color: colors.textPrimary,
    fontFamily: fonts.pixel,
  },
  activeTab: {
    color: colors.primary, 
  },
  tabButton: {
    flex: 1,
  },
  newsCard: {
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  guestContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  guestText: {
    color: colors.textPrimary,
    fontSize: typography.size.base,
    marginBottom: hp(2),
    fontFamily: fonts.pixel,
  },
  guestFeature: {
    color: colors.textPrimary,
    fontSize: typography.size.base,
    marginBottom: hp(2),
    fontFamily: fonts.pixel,
  },
  loginButton: {
    backgroundColor: colors.primary,
    padding: wp(4),
    borderRadius: wp(2),
    marginTop: hp(2),
  },
  loginButtonText: {
    color: colors.bgWhite,
    fontSize: typography.size.base,
    fontFamily: fonts.pixel,
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
    marginBottom: hp(2),
    textAlign: 'center',
  },
  title: {
    fontSize: typography.size.base,
    fontFamily: fonts.pixel,
    color: colors.textPrimary,
    marginBottom: hp(2),
  },
});

export default ProfileScreen; 