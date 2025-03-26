import React, { useState, useRef, useEffect } from 'react';
import { 
  SafeAreaView, 
  ScrollView, 
  View, 
  StyleSheet,
  Text,
  TouchableOpacity,
  Alert
} from 'react-native';
import { colors, typography, fonts } from '../styles/main';
import { wp, hp } from '../utils/responsive';
import FormInput from '../components/FormInput';
import CascadePicker from '../components/CascadePicker';
import { FORM_CONFIG } from '../config/form';
import ImageUploadBox from '../components/ImageUploadBox';
import { commonScreenStyles } from '../styles/screenStyles';
import DatePicker from '../components/DatePicker';
import { supabase } from '../lib/supabase';
import * as FileSystem from 'expo-file-system';
import { decode } from 'base64-arraybuffer';
import { getRegions } from '../config/regions';

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
  const [regions, setRegions] = useState([]);

  const screenTitle = isEditing ? '编辑球队' : '新建球队';
  const submitButtonText = isEditing ? '保存修改' : '创建球队';

  const validateField = (field, value) => {
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

  const uploadImage = async (uri, userId, type) => {
    try {
      const response = await fetch(uri);
      if (!response.ok) {
        throw new Error(`获取文件失败: ${response.status}`);
      }
      
      const blob = await response.blob();

      const timestamp = Date.now();
      const path = `${userId}/${timestamp}_${type}.jpg`;

      const { data, error } = await supabase.storage
        .from('teams')
        .upload(path, blob, {
          contentType: 'image/jpeg',
          cacheControl: '3600',
          upsert: true
        });

      if (error) {
        throw error;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('teams')
        .getPublicUrl(path);

      return publicUrl;

    } catch (error) {
      throw new Error(`${type}上传失败: ${error.message}`);
    }
  };

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      
      // 直接从 route.params 获取最新的 uniformData
      const latestUniform = route.params?.uniformData || formData.teamUniform;
      console.log('最终提交的队服数据:', latestUniform);
      
      if (!formData.teamName || !formData.location || !formData.establishedYear) {
        Alert.alert('错误', '请填写必要信息：球队名称、所在地、成立时间');
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !session) {
        Alert.alert('错误', '请先登录');
        return;
      }

      // 检查 latestUniform 是否为空
      if (!latestUniform) {
        console.error('队服数据为空');
        Alert.alert('错误', '请先设计队服');
        return;
      }

      const teamDataToSubmit = {
        name: formData.teamName,
        location: formData.location,
        region: formData.region,
        city: formData.city,
        established: `${formData.establishedYear}/${formData.establishedMonth}`,
        platform: formData.socialPlatform || null,
        contact: formData.socialId || null,
        court: formData.court || null,
        rules: formData.rules || null,
        training_count: formData.trainingSessions ? parseInt(formData.trainingSessions) : null,
        match_count: formData.gamesPlayed ? parseInt(formData.gamesPlayed) : null,
        logo_url: formData.teamLogo,
        team_color: formData.teamColor || null,
        uniform_pixels: JSON.stringify(latestUniform),  // 直接 stringify，不需要检查
        created_by: user.id
      };

      console.log('准备发送到数据库的数据:', teamDataToSubmit);

      let result;
      if (isEditing) {
        const { data, error } = await supabase
          .from('teams')
          .update(teamDataToSubmit)
          .eq('team_id', teamData.team_id)
          .select();
          
        if (error) throw error;
        result = data;
      } else {
        const { data, error } = await supabase
          .from('teams')
          .insert([teamDataToSubmit])
          .select();
          
        if (error) throw error;
        result = data;
      }

      Alert.alert('成功', isEditing ? '球队信息已更新！' : '球队创建成功！');
      
      if (route.params?.onTeamCreated) {
        route.params.onTeamCreated();
      }
      
      navigation.goBack();
      
    } catch (error) {
      console.error('提交错误:', error); // 调试用
      Alert.alert('错误', (isEditing ? '更新' : '创建') + '失败: ' + error.message);
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

  const handleImageSelected = async (field, uri) => {
    try {
      if (!uri) {
        return;
      }
      handleInputChange(field, uri);
    } catch (error) {
      Alert.alert('错误', `图片处理失败: ${error.message}`);
    }
  };

  const handleUniformSave = (uniformData) => {
    console.log('收到队服数据:', uniformData);
    handleInputChange('teamUniform', uniformData);
  };

  useEffect(() => {
    const loadRegions = async () => {
      try {
        const regionsData = await getRegions();
        setRegions(regionsData);
      } catch (error) {
        Alert.alert('错误', '加载地区数据失败');
      }
    };
    
    loadRegions();
  }, []);

  useEffect(() => {
    if (route.params?.uniformData) {
      console.log('收到的队服数据:', route.params?.uniformData);
      handleInputChange('teamUniform', route.params.uniformData);
    }
  }, [route.params?.uniformData]);

  return (
    <SafeAreaView style={commonScreenStyles.container}>
      <View style={commonScreenStyles.headerContainer}>
        <TouchableOpacity 
          style={commonScreenStyles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={commonScreenStyles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={commonScreenStyles.headerTitle}>{screenTitle}</Text>
      </View>

      <ScrollView style={commonScreenStyles.mainContent}>
        <View style={commonScreenStyles.formContainer}>
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
            onPress={() => setShowLocationPicker(true)}
            editable={false}
            isValid={validFields.location}
          />

          <FormInput
            label="Started"
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
            label="Platform"
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
              handleInputChange('teamColor', color);
            }}
            placeholder="输入球队代表色(例#000000)"
            isFocused={focusedInput === 'teamColor'}
            onFocus={() => setFocusedInput('teamColor')}
            onBlur={() => setFocusedInput(null)}
            isValid={validFields.teamColor}
          />

          <FormInput
            label="Rules"
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
              navigation.navigate('UniformDesign', {
                returnScreen: 'CreateTeam',
                currentUniform: formData.teamUniform,
                onUniformSave: handleUniformSave
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
            onImageSelected={(uri) => handleImageSelected('teamLogo', uri)}
            value={formData.teamLogo}
            isValid={validFields.teamLogo}
          />
        </View>
      </ScrollView>

      <View style={commonScreenStyles.submitContainer}>
        <TouchableOpacity
          style={commonScreenStyles.submitButton}
          onPress={handleSubmit}
          disabled={isLoading}
        >
          <Text style={commonScreenStyles.submitButtonText}>{submitButtonText}</Text>
        </TouchableOpacity>
      </View>

      <CascadePicker
        visible={showLocationPicker}
        onClose={() => setShowLocationPicker(false)}
        onSelect={(city) => {
          const selectedRegion = regions.find(r => r.cities.includes(city));
          if (selectedRegion) {
            handleInputChange('region', selectedRegion.name);
            handleInputChange('city', city);
            handleInputChange('location', `${selectedRegion.name}-${city}`);
          }
          setShowLocationPicker(false);
        }}
        regions={regions}
        title="选择城市"
        showTeams={false}
      />

      <DatePicker
        visible={showDatePicker}
        onClose={() => setShowDatePicker(false)}
        onSelect={handleDateSelect}
        title="选择成立时间"
      />
    </SafeAreaView>
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