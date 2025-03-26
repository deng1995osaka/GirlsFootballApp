import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, SafeAreaView, FlatList, View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import Header from '../components/Header';
import TeamCard from '../components/TeamCard';
import Background from '../components/Background';
import { colors, fonts, typography } from '../styles/main';
import { normalize, wp, hp } from '../utils/responsive';
import { teamsService } from '../services/teamService';
import DropdownMenu from '../components/DropdownMenu';
import { getRegions } from '../config/regions';

export default function TeamsScreen({ navigation }) {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentFilter, setCurrentFilter] = useState('全部');
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [filterItems, setFilterItems] = useState([{ id: '全部', label: '全部' }]);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const filterButtonRef = useRef(null);

  const handleFilterSelect = (id) => {
    setCurrentFilter(id);
    setIsDropdownVisible(false);
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
        data = await teamsService.getAllTeams();
      } else {
        data = await teamsService.getTeamsByLocation(currentFilter);
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

  const renderTeamCard = ({ item }) => (
    <TeamCard 
      team={{
        ...item,
        location: `${item.region} · ${item.city}`,
      }} 
    />
  );

  return (
    <Background>
      <SafeAreaView style={styles.container}>
        <Header 
          title="★女孩踢球★"
          onAddPress={() => navigation.navigate('CreateTeam', {
            onTeamCreated: () => {
              loadTeams();
            }
          })}
        />
        <View style={styles.mainContent}>
          <View style={styles.filterContainer}>
            <TouchableOpacity 
              ref={filterButtonRef}
              style={styles.filterButton}
              onPress={handleShowFilter}
            >
              <Text style={styles.filterText}>
                {currentFilter}
                <Text style={styles.arrowText}> ▼</Text>
              </Text>
            </TouchableOpacity>
            
            <DropdownMenu 
              visible={isDropdownVisible}
              items={filterItems}
              onSelect={handleFilterSelect}
              position="left"
              anchor={menuAnchor}
            />
          </View>
          
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : (
            <FlatList
              data={teams}
              renderItem={renderTeamCard}
              keyExtractor={item => item.team_id}
              contentContainerStyle={styles.listContainer}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>暂无球队数据</Text>
                </View>
              }
              ListFooterComponent={<View style={styles.listFooter} />}
            />
          )}
        </View>
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
    color: colors.textSecondary,
    fontSize: typography.size.base,
    fontFamily: fonts.pixel,
    textAlign: 'center',
  },
});
