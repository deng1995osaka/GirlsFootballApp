import React, { useState, useEffect } from 'react';
import { 
  View, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView
} from 'react-native';
import AppText from '@components/AppText';
import { colors, fonts, typography } from '@styles/main';
import { normalize, wp, hp } from '@utils/responsive';
import { LOCAL_REGIONS } from '@config/regions';
import { teamsStore } from '@store/teamsStore';
import BottomSheet from '@components/BottomSheet';

const CascadePicker = ({ visible, onClose, onSelect, regions, title, showTeams = false }) => {
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);
  const [step, setStep] = useState(1); // 1: 选择地区, 2: 选择城市, 3: 选择球队
  const [cityTeams, setCityTeams] = useState([]);
  const [teamsList, setTeamsList] = useState([]);

  useEffect(() => {
    if (visible && regions.length === 0) {
      console.log('⚠️ Warning: regions is empty on open');
    }
  }, [visible, regions]);

  useEffect(() => {
    if (visible && showTeams) {
      loadTeamsList();
    }
  }, [visible, showTeams]);

  const loadTeamsList = async () => {
    try {
      const teams = await teamsStore.getTeamsList();
      setTeamsList(teams);
    } catch (error) {
      console.error('加载球队列表失败:', error);
    }
  };

  const handleRegionSelect = (region) => {
    setSelectedRegion(region);
    if (!showTeams) {
      setStep(2);
    } else {
      setStep(2);
    }
  };

  const handleCitySelect = (city) => {
    if (!showTeams) {
      onSelect(city);
      resetAndClose();
    } else {
      setSelectedCity(city);
      const teams = teamsList.filter(team => 
        team.region === selectedRegion.name && team.city === city
      );
      console.log('🔍 CascadePicker - teams for city:', city, teams);
      setCityTeams(teams);
      setTimeout(() => {
        setStep(3);
      }, 0);
    }
  };

  const handleTeamSelect = (team) => {
    onSelect(team);
    resetAndClose();
  };

  const resetAndClose = () => {
    setStep(1);
    setSelectedRegion(null);
    setSelectedCity(null);
    setCityTeams([]);
    onClose();
  };

  const handleBack = () => {
    if (step === 3) {
      setStep(2);
      setSelectedCity(null);
      setCityTeams([]);
    } else if (step === 2) {
      setStep(1);
      setSelectedRegion(null);
    } else {
      resetAndClose();
    }
  };

  const renderContent = () => {
    switch (step) {
      case 1:
        return (
          <ScrollView style={styles.cityList}>
            {LOCAL_REGIONS.map((region) => (
              <TouchableOpacity
                key={`region-${region.name}`}
                style={styles.item}
                onPress={() => handleRegionSelect(region)}
              >
                <AppText style={styles.itemText}>{region.name}</AppText>
              </TouchableOpacity>
            ))}
          </ScrollView>
        );
      case 2:
        return (
          <ScrollView style={styles.cityList}>
            {selectedRegion?.cities.map((city) => (
              <TouchableOpacity
                key={`city-${city}`}
                style={styles.item}
                onPress={() => handleCitySelect(city)}
              >
                <AppText style={styles.itemText}>{city}</AppText>
              </TouchableOpacity>
            ))}
          </ScrollView>
        );
      case 3:
        return (
          <ScrollView style={styles.cityList}>
            {Array.isArray(cityTeams) && cityTeams.length === 0 && (
              <View style={styles.item}>
                <AppText style={[styles.itemText, { color: colors.textSecondary }]}>暂无球队</AppText>
              </View>
            )}
            {Array.isArray(cityTeams) && cityTeams.length > 0 && cityTeams.map((team) => (
              <TouchableOpacity
                key={`team-${team.team_id}`}
                style={styles.item}
                onPress={() => handleTeamSelect({
                  team_id: team.team_id,
                  name: team.name,
                  region: selectedRegion.name,
                  city: selectedCity
                })}
              >
                <AppText style={styles.itemText}>{team.name}</AppText>
              </TouchableOpacity>
            ))}
          </ScrollView>
        );
    }
  };

  return (
    <BottomSheet
      visible={visible}
      title={title}
      onClose={handleBack}
    
      headerLeft={
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <AppText style={styles.backButtonText}>←</AppText>
        </TouchableOpacity>
      }
      contentStyle={styles.content}
    >
      {renderContent()}
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  content: {
    padding: wp(4),
    
  },
  cityList: {
    padding: wp(0),
  },
  item: {
    paddingBottom: hp(2),
    paddingTop: hp(3),
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  itemText: {
    fontSize: typography.size.base,
    color: colors.textPrimary,
    fontFamily: fonts.pixel,
  },
  backButtonText: {
    fontSize: typography.size.xl,
    color: colors.textPrimary,
  },
});

export default CascadePicker; 