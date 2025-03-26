import React, { useState } from 'react';
import { 
  Modal, 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView,
  Dimensions
} from 'react-native';
import { colors, typography, fonts } from '../styles/main';
import { wp, hp } from '../utils/responsive';

const CascadePicker = ({ visible, onClose, onSelect, regions, title, showTeams = false }) => {
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);
  const [step, setStep] = useState(1); // 1: 选择地区, 2: 选择城市, 3: 选择球队

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
      setStep(3);
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
    onClose();
  };

  const handleBack = () => {
    if (step === 3) {
      setStep(2);
      setSelectedCity(null);
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
            {regions.map((region) => (
              <TouchableOpacity
                key={`region-${region.name}`}
                style={styles.item}
                onPress={() => handleRegionSelect(region)}
              >
                <Text style={styles.itemText}>{region.name}</Text>
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
                <Text style={styles.itemText}>{city}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        );
      case 3:
        return (
          <ScrollView style={styles.cityList}>
            {selectedRegion?.teams?.[selectedCity]?.map((team) => (
              <TouchableOpacity
                key={`team-${team.team_id}`}
                style={styles.item}
                onPress={() => handleTeamSelect({
                  team_id: team.team_id,
                  name: team.name
                })}
              >
                <Text style={styles.itemText}>{team.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        );
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={handleBack}
      statusBarTranslucent={true}
    >
      <View style={styles.modalOverlay}>
        <TouchableOpacity 
          style={styles.backdropTouchable}
          activeOpacity={1}
          onPress={handleBack}
        >
          <View style={styles.modalContainer}>
            <TouchableOpacity 
              activeOpacity={1}
              onPress={e => e.stopPropagation()}
              style={styles.modalContent}
            >
              <View style={styles.header}>
                <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                  <Text style={styles.backButtonText}>←</Text>
                </TouchableOpacity>
                <Text style={styles.title}>
                  {step === 1 ? title : 
                   step === 2 ? selectedRegion?.name : 
                   selectedCity}
                </Text>
                <TouchableOpacity onPress={resetAndClose} style={styles.closeButton}>
                  <Text style={styles.closeButtonText}>×</Text>
                </TouchableOpacity>
              </View>
              
              {renderContent()}
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  backdropTouchable: {
    flex: 1,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    position: 'relative',
    zIndex: 1001,
  },
  modalContent: {
    backgroundColor: colors.bgWhite,
    borderTopLeftRadius: wp(4),
    borderTopRightRadius: wp(4),
    maxHeight: SCREEN_HEIGHT * 0.8,
    position: 'relative',
    zIndex: 1002,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: wp(4),
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  title: {
    fontSize: typography.size.base,
    fontFamily: fonts.pixel,
    color: colors.textPrimary,
  },
  closeButton: {
    padding: wp(2),
    marginRight: -wp(2),
  },
  closeButtonText: {
    fontSize: typography.size.xl,
    color: colors.textSecondary,
    lineHeight: typography.size.xl,
  },
  cityList: {
    padding: wp(4),
  },
  regionContainer: {
    marginBottom: hp(3),
  },
  regionTitle: {
    fontSize: typography.size.sm,
    color: colors.textLight,
    marginBottom: hp(1),
    fontFamily: fonts.pixel,
  },
  citiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -wp(2),
  },
  cityItem: {
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(3),
    marginHorizontal: wp(2),
    marginVertical: hp(0.5),
    backgroundColor: colors.bgLight,
    borderRadius: wp(2),
  },
  cityText: {
    fontSize: typography.size.base,
    color: colors.textPrimary,
    fontFamily: fonts.pixel,
  },
  item: {
    padding: wp(4),
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  itemText: {
    fontSize: typography.size.base,
    color: colors.textPrimary,
    fontFamily: fonts.pixel,
  },
  backButton: {
    padding: wp(2),
  },
  backButtonText: {
    fontSize: typography.size.xl,
    color: colors.textSecondary,
  },
});

export default CascadePicker; 