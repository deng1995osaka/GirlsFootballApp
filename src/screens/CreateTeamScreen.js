import React, { useState, useRef, useEffect } from 'react';
import { 
  SafeAreaView, 
  ScrollView, 
  View, 
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback
} from 'react-native';
import { SafeAreaView as SafeAreaViewRN } from 'react-native-safe-area-context';
import { colors, typography, fonts } from '@styles/main';
import { normalize, wp, hp } from '@utils/responsive';
import FormInput from '@components/FormInput';
import CascadePicker from '@components/CascadePicker';
import { FORM_CONFIG } from '@config/form';
import ImageUploadBox from '@components/ImageUploadBox';
import { commonScreenStyles } from '@styles/screenStyles';
import DatePicker from '@components/DatePicker';
import { supabase } from '@lib/supabase';
import * as FileSystem from 'expo-file-system';
import { decode } from 'base64-arraybuffer';
import { LOCAL_REGIONS } from '@config/regions';
import AppText from '@components/AppText';
import { useProfileCheck } from '@hooks/useProfileCheck';
import { teamService } from '@services/teamService';
import Toast from 'react-native-toast-message';

const YEARS = Array.from({ length: 25 }, (_, i) => (2024 - i).toString());
const MONTHS = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));

const DATE_REGIONS = [
  {
    name: '选择成立年份',
    cities: YEARS,
  },
  {
    name: '选择成立月份',
    cities: MONTHS,
  }
];

export default function CreateTeamScreen({ navigation, route }) {
  const { teamData, isEditing } = route.params || {};
  const { checkProfile } = useProfileCheck(navigation, false);

  const [focusedInput, setFocusedInput] = useState(null);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [formData, setFormData] = useState({
    teamName: teamData?.name || '',
    teamColor: teamData?.team_color || '',
    location: teamData?.location || '',
    region: teamData?.region || '',
    city: teamData?.city || '',
    establishedYear: teamData?.established ? teamData.established.split('/')[0] : '',
    establishedMonth: teamData?.established ? teamData.established.split('/')[1] : '',
    socialPlatform: teamData?.platform || '',
    socialId: teamData?.contact || '',
    court: teamData?.court || '',
    rules: teamData?.rules || '',
    trainingSessions: teamData?.training_count?.toString() || '',
    gamesPlayed: teamData?.match_count?.toString() || '',
    teamLogo: teamData?.logo_url || '',
    teamUniform: teamData?.uniform_pixels || '',
  });

  const [validFields, setValidFields] = useState({
    teamName: false,
    location: false,
    establishedYear: false,
    establishedMonth: false,
    socialPlatform: false,
    socialId: false,
    court: false,
    teamColor: false,
    rules: false,
    trainingSessions: false,
    gamesPlayed: false,
    teamLogo: null,
    teamUniform: null,
  });

  const [currentPickerMode, setCurrentPickerMode] = useState('year');
  const [isLoading, setIsLoading] = useState(false);
  const [regions] = useState(LOCAL_REGIONS);

  const screenTitle = isEditing ? '编辑球队' : '新建球队';
  const submitButtonText = isEditing ? '保存修改' : '创建球队';

  const validateField = (field, rawValue) => {
    const value = typeof rawValue === 'string' ? rawValue : '';
    switch (field) {
      case 'teamName':
        return value.length >= 2;
      case 'location':
        return value.length > 0;
      case 'establishedYear':
        return /^\d{4}$/.test(value);
      case 'establishedMonth':
        return /^(0?[1-9]|1[0-2])$/.test(value);
      case 'teamColor':
        return /^#[0-9A-Fa-f]{6}$/.test(value);
      case 'trainingSessions':
      case 'gamesPlayed':
        return /^\d+$/.test(value);
      default:
        return value.length > 0;
    }
  };

  const handleInputChange = (field, value) => {
    console.log(`设置 ${field}:`, value); // 调试日志
    
    setFormData(prev => ({
      ...prev,
      [field]: field === 'teamUniform' ? value || {} : value
    }));
    
    setValidFields(prev => ({
      ...prev,
      [field]: validateField(field, value)
    }));
  };

  const validateForm = () => {
    const newErrors = {
      teamName: !formData.teamName.trim(),
      location: !formData.location.trim(),
      establishedYear: !formData.establishedYear,
      establishedMonth: !formData.establishedMonth,
      socialPlatform: !formData.socialPlatform.trim(),
      socialId: !formData.socialId.trim(),
      court: !formData.court.trim(),
      teamColor: !formData.teamColor.trim(),
      rules: !formData.rules.trim(),
      trainingSessions: !formData.trainingSessions.trim(),
      gamesPlayed: !formData.gamesPlayed.trim(),
      teamLogo: !formData.teamLogo,
      teamUniform: !formData.teamUniform,
    };
    setValidFields(newErrors);
    return !Object.values(newErrors).some(error => error);
  };

  const handleSubmit = async () => {
    if (isLoading) return;

    try {
      setIsLoading(true);

      const canProceed = await checkProfile();
      if (!canProceed) {
        setIsLoading(false);
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('请先登录');
      }

      if (!validateForm()) {
        setIsLoading(false);
        return;
      }

      // ✅ 上传队徽（如果是图片对象）
      let logoUrl = formData.teamLogo;
      if (logoUrl && typeof logoUrl !== 'string') {
        logoUrl = await teamService.uploadTeamImage(logoUrl);
      }

      // ✅ 准备提交数据
      const teamData = {
        name: formData.teamName,
        region: formData.region,
        city: formData.city,
        established: `${formData.establishedYear}/${formData.establishedMonth}`,
        platform: formData.socialPlatform || null,
        contact: formData.socialId || null,
        court: formData.court || null,
        rules: formData.rules || null,
        training_count: formData.trainingSessions ? parseInt(formData.trainingSessions) : null,
        match_count: formData.gamesPlayed ? parseInt(formData.gamesPlayed) : null,
        logo_url: logoUrl,
        team_color: formData.teamColor || null,
        uniform_pixels: JSON.stringify(formData.teamUniform),
        created_by: user.id,
        updated_at: new Date().toISOString(),
      };

      // ✅ 调用封装的 service 方法
      if (isEditing) {
        await teamService.updateTeam(route.params.teamData.team_id, teamData);
        Toast.show({ type: 'success', text1: '成功', text2: '球队信息已更新！' });
      } else {
        const { data: { session }, error } = await supabase.auth.getSession();
        console.log("🟢 当前 Session:", session);
        console.log("🟡 当前 Access Token:", session?.access_token);
        
        await teamService.createTeam(teamData);
        Toast.show({ type: 'success', text1: '成功', text2: '球队创建成功！' });
      }

      navigation.goBack();

    } catch (error) {
      console.error('提交球队失败:', error);
      Toast.show({ type: 'error', text1: '错误', text2: error.message || '提交失败，请重试' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDateSelect = (dateObj) => {
    handleInputChange('establishedYear', dateObj.year.toString());
    handleInputChange('establishedMonth', dateObj.month.toString());
    if (dateObj.day === 'skip') {
      handleInputChange('establishedDay', '');
    } else {
      handleInputChange('establishedDay', dateObj.day.toString());
    }
  };

  const handleImageSelected = async (field, imageObj) => {
    try {
      if (!imageObj) return;
      handleInputChange(field, imageObj); // 存完整对象
    } catch (error) {
      Alert.alert('错误', `图片处理失败: ${error.message}`);
    }
  };

  const handleUniformSave = (uniformData) => {
    console.log('收到队服数据:', uniformData);
    handleInputChange('teamUniform', uniformData);
  };

  const handleOpenRegionPicker = () => {
    setShowLocationPicker(true);
  };

  useEffect(() => {
    if (route.params?.uniformData) {
      console.log('收到的队服数据:', route.params?.uniformData);
      handleInputChange('teamUniform', route.params.uniformData);
    }
  }, [route.params?.uniformData]);

  return (
    <SafeAreaViewRN style={commonScreenStyles.container}>
      <View style={commonScreenStyles.headerContainer}>
        <TouchableOpacity 
          style={commonScreenStyles.backButton}
          onPress={() => navigation.goBack()}
        >
          <AppText style={commonScreenStyles.backButtonText}>←</AppText>
        </TouchableOpacity>
        <AppText style={commonScreenStyles.headerTitle}>{screenTitle}</AppText>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView 
            style={commonScreenStyles.mainContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={[commonScreenStyles.formContainer, { paddingBottom: hp(20) }]}>
              <FormInput
                label="Team Name"
                value={formData.teamName}
                onChangeText={(text) => handleInputChange('teamName', text)}
                placeholder={FORM_CONFIG.placeholders.teamName}
                isFocused={focusedInput === 'teamName'}
                onFocus={() => setFocusedInput('teamName')}
                onBlur={() => setFocusedInput(null)}
                isValid={validFields.teamName}
              />

              <FormInput
                label="Location"
                value={formData.location}
                placeholder="选择所在城市"
                onPress={handleOpenRegionPicker}
                editable={false}
                isValid={validFields.location}
              />

              <FormInput
                label="Started From"
                value={formData.establishedYear ? 
                  `${formData.establishedYear}${formData.establishedMonth ? `/${formData.establishedMonth}` : ''}`
                  : undefined}
                placeholder="选择成立时间"
                onPress={() => setShowDatePicker(true)}
                editable={false}
                isValid={validFields.establishedYear && validFields.establishedMonth}
              />

              <FormInput
                label="Platform"
                value={formData.socialPlatform}
                onChangeText={(text) => handleInputChange('socialPlatform', text)}
                placeholder="在哪里运营账号？小红书/公众号..."
                isFocused={focusedInput === 'platform'}
                onFocus={() => setFocusedInput('platform')}
                onBlur={() => setFocusedInput(null)}
                isValid={validFields.socialPlatform}
              />
              
              <FormInput
                value={formData.socialId}
                onChangeText={(text) => handleInputChange('socialId', text)}
                placeholder={formData.socialPlatform ? `请输入${formData.socialPlatform}账号` : "输入账号昵称"}
                isFocused={focusedInput === 'socialId'}
                onFocus={() => setFocusedInput('socialId')}
                onBlur={() => setFocusedInput(null)}
                label="Contact us"
                isValid={validFields.socialId}
              />

              <FormInput
                label="Court"
                value={formData.court}
                onChangeText={(text) => handleInputChange('court', text)}
                placeholder={FORM_CONFIG.placeholders.court}
                isFocused={focusedInput === 'court'}
                onFocus={() => setFocusedInput('court')}
                onBlur={() => setFocusedInput(null)}
                isValid={validFields.court}
              />

              <FormInput
                label="Team Color"
                value={formData.teamColor}
                onChangeText={(text) => {
                  const color = text.startsWith('#') ? text : `#${text}`;
                  const hexOnly = color.replace(/[^0-9A-Fa-f#]/g, '').slice(0, 7); // 限制为 # + 6位
                  handleInputChange('teamColor', hexOnly);
                }}
                placeholder="输入球队代表色(例#000000)"
                isFocused={focusedInput === 'teamColor'}
                onFocus={() => setFocusedInput('teamColor')}
                onBlur={() => setFocusedInput(null)}
                isValid={validFields.teamColor}
              />

              <FormInput
                label="Rules/Introductions"
                value={formData.rules}
                onChangeText={(text) => handleInputChange('rules', text)}
                placeholder={FORM_CONFIG.placeholders.rules}
                isFocused={focusedInput === 'rules'}
                onFocus={() => setFocusedInput('rules')}
                onBlur={() => setFocusedInput(null)}
                isValid={validFields.rules}
              />

              <FormInput
                label="Training Sessions"
                value={formData.trainingSessions}
                onChangeText={(text) => handleInputChange('trainingSessions', text.replace(/[^0-9]/g, ''))}
                placeholder="2024年度球队训练次数？"
                keyboardType="numeric"
                isFocused={focusedInput === 'trainingSessions'}
                onFocus={() => setFocusedInput('trainingSessions')}
                onBlur={() => setFocusedInput(null)}
                isValid={validFields.trainingSessions}
              />

              <FormInput
                label="Games Played"
                value={formData.gamesPlayed}
                onChangeText={(text) => handleInputChange('gamesPlayed', text.replace(/[^0-9]/g, ''))}
                placeholder="2024年度球队约赛次数？"
                keyboardType="numeric"
                isFocused={focusedInput === 'gamesPlayed'}
                onFocus={() => setFocusedInput('gamesPlayed')}
                onBlur={() => setFocusedInput(null)}
                isValid={validFields.gamesPlayed}
              />

              <ImageUploadBox 
                text="队服"
                label=""
                hasImage={!!formData.teamUniform}
                value={formData.teamUniform}
                onImageSelected={() => {
                  if (!formData.teamColor) {
                    Toast.show({
                      type: 'error',
                      text1: '提示',
                      text2: '请先输入球队代表色'
                    });
                    return;
                  }
                  navigation.navigate('UniformDesign', {
                    returnScreen: 'CreateTeam',
                    currentUniform: formData.teamUniform,
                    onUniformSave: handleUniformSave,
                    teamColor: formData.teamColor
                  });
                }}
                isValid={validFields.teamUniform}
                customUpload={true}
                isUniform={true}
              />

              <ImageUploadBox 
                text="队徽"
                label=""
                hasImage={!!formData.teamLogo}
                onImageSelected={(imageObj) => handleImageSelected('teamLogo', imageObj)}
                value={typeof formData.teamLogo === 'string' ? formData.teamLogo : formData.teamLogo?.uri}
                isValid={validFields.teamLogo}
              />
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

      <View style={commonScreenStyles.submitContainer}>
        <TouchableOpacity
          style={commonScreenStyles.submitButton}
          onPress={handleSubmit}
          disabled={isLoading}
        >
          <AppText style={commonScreenStyles.submitButtonText}>{submitButtonText}</AppText>
        </TouchableOpacity>
      </View>

      <CascadePicker
        visible={showLocationPicker}
        onClose={() => setShowLocationPicker(false)}
        onSelect={(cityName) => {
          if (cityName && typeof cityName === 'string') {
            const selectedRegion = regions.find(r => r.cities.includes(cityName));
            if (selectedRegion) {
              handleInputChange('region', selectedRegion.name);
              handleInputChange('city', cityName);
              handleInputChange('location', `${selectedRegion.name}-${cityName}`);
            }
          }
          setShowLocationPicker(false);
        }}
        regions={regions}
        title="选择所在城市"
        showTeams={false}
      />

      <DatePicker
        visible={showDatePicker}
        onClose={() => setShowDatePicker(false)}
        onSelect={handleDateSelect}
        title="选择成立时间"
      />
    </SafeAreaViewRN>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: typography.size.base,
    color: colors.textPrimary,
    fontFamily: fonts.pixel,
    marginBottom: hp(1),
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp(2),
  },
  yearInput: {
    flex: 0.5,
    marginRight: wp(2),
  },
  monthInput: {
    flex: 0.3,
    marginLeft: wp(2),
  },
  dateSeparator: {
    fontSize: typography.size.lg,
    color: colors.textPrimary,
    fontFamily: fonts.pixel,
  },
  uniformSection: {
    marginBottom: hp(2),
  },
  designButton: {
    backgroundColor: colors.primary,
    padding: hp(2),
    borderRadius: 8,
    alignItems: 'center',
  },
  designButtonText: {
    color: colors.white,
    fontSize: typography.size.base,
    fontFamily: fonts.pixel,
  },
});