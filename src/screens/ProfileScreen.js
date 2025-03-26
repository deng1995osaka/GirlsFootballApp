import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { colors, fonts, typography, layout } from '../styles/main';
import { normalize, wp, hp } from '../utils/responsive';
import PlayerCard from '../components/PlayerCard';
import PixelCard from '../components/PixelCard';
import TeamCard from '../components/TeamCard';
import Header from '../components/Header';
import PixelButton from '../components/PixelButton';
import Background from '../components/Background';
import GuestView from '../components/GuestView';
import { useNavigation } from '@react-navigation/native';
import { profileService } from '../services/profileService';
import { authService } from '../services/authService';
import { supabase, checkUserProfile } from '../lib/supabase';
import TabContent from '../components/TabContent';

const ProfileScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('我的小报');
  const [profileData, setProfileData] = useState({
    nickname: '未设置昵称',
    number: '',
    positions: [],
    team: null,
    avatar_url: null,
    news_count: 0,
    team_count: 0
  });
  const [newsCount, setNewsCount] = useState(0);
  const [teamsCount, setTeamsCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isGuest, setIsGuest] = useState(true);

  useEffect(() => {
    checkAuthAndLoadProfile();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      checkAuthAndLoadProfile();
    });

    return unsubscribe;
  }, [navigation]);

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
      
    } catch (err) {
      setError('初始化失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  const loadProfile = async () => {
    try {
      const data = await profileService.getProfile();
      
      const defaultValues = {
        nickname: '神秘球员',
        number: '99',
        positions: ['CF'],
        team_id: null,
        avatar_url: null,
        news_count: 0,
        team_count: 0,
        team: {
          name: '女孩踢球FC',
          logo_url: null
        }
      };

      if (!data) {
        setProfileData(defaultValues);
        return;
      }

      const processedData = {
        ...data,
        nickname: data.nickname || defaultValues.nickname,
        number: data.number || defaultValues.number,
        positions: data.positions || defaultValues.positions,
        avatar_url: data.avatar_url || defaultValues.avatar_url,
        news_count: data.news_count || defaultValues.news_count,
        team_count: data.team_count || defaultValues.team_count
      };

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
            name: teamData?.name || defaultValues.team.name,
            logo_url: teamData?.logo_url || defaultValues.team.logo_url
          }
        });
      } else {
        setProfileData({
          ...processedData,
          team: defaultValues.team
        });
      }
    } catch (err) {
      setProfileData({
        nickname: '神秘球员',
        number: '00',
        positions: ['CF'],
        team_id: null,
        avatar_url: null,
        news_count: 0,
        team_count: 0,
        team: {
          name: '未加入球队',
          logo_url: null
        }
      });
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
    if (action === 'logout') {
      try {
        await authService.signOut();
        setIsGuest(true);
      } catch (error) {
        console.error('退出登录失败:', error);
      }
    } else if (action === 'delete') {
      Alert.alert(
        '确认删除',
        '确定要删除账号吗？此操作不可恢复。',
        [
          {
            text: '取消',
            style: 'cancel',
          },
          {
            text: '确定删除',
            style: 'destructive',
            onPress: async () => {
              try {
                await authService.deleteAccount();
                setIsGuest(true);
              } catch (error) {
                console.error('删除账号失败:', error);
                Alert.alert('错误', '删除账号失败，请重试');
              }
            },
          },
        ]
      );
    }
  };

  const renderTabContent = () => {
    if (activeTab === '我的小报') {
      return (
        <View style={styles.newsCard}>
          <Text style={styles.placeholderText}>还没有发过小报...</Text>
          <PixelButton 
            title="☞发小报"
            variant="underline"
            onPress={() => navigation.navigate('CreateNews')}
          />
        </View>
      );
    }
    
    return <TeamCard 
      key={profileData?.team_id?.toString() || Math.random().toString()}
      team={profileData}
      showMenuButton={true}
    />;
  };

  const renderContent = () => {
    if (error) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
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
      <ScrollView>
        <View style={styles.cardsContainer}>
          <View style={styles.cardWrapper}>
            <PlayerCard 
              nickname={profileData.nickname}
              teamName={profileData.team?.name || '未加入球队'}
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
              <Text style={[
                styles.tabItem,
                activeTab === '我的小报' && styles.activeTab
              ]}>
                {`我的小报(${newsCount})`}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.tabButton}
              onPress={() => setActiveTab('我的球队')}
            >
              <Text style={[
                styles.tabItem,
                activeTab === '我的球队' && styles.activeTab
              ]}>
                {`我的球队(${teamsCount})`}
              </Text>
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
    );
  };

  return (
    <Background>
      <SafeAreaView style={styles.container}>
        <Header 
          title="★我的空间★"
          showAddButton={true}
          buttonType="≣"
          onAddPress={handleMenuAction}
        />
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          renderContent()
        )}
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
});

export default ProfileScreen; 