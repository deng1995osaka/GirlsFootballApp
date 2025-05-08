import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { colors, fonts, typography } from '@styles/main';
import { normalize, wp, hp } from '@utils/responsive';
import Header from '@components/Header';
import PixelButton from '@components/PixelButton';
import { commonScreenStyles } from '@styles/screenStyles';
import FormInput from '@components/FormInput';
import CascadePicker from '@components/CascadePicker';
import { profileService } from '@services/profileService';
import { authService } from '@services/authService';
import { supabase } from '@lib/supabase';
import ImageUploadBox from '@components/ImageUploadBox';
import Background from '@components/Background';
import { teamsStore } from '@store/teamsStore';
import AppText from '@components/AppText';
import { SafeAreaView as SafeAreaViewRN } from 'react-native-safe-area-context';
import { LOCAL_REGIONS } from '@config/regions';
import { DEFAULT_PROFILE } from '@config/profileDefaults';
import Toast from 'react-native-toast-message';

const positions = [
  { id: 0, label: '门将(GK)', value: 0 },
  { id: 1, label: '左后卫(LB)', value: 1 },
  { id: 2, label: '左中后卫(LCB)', value: 2 },
  { id: 3, label: '右中后卫(RCB)', value: 3 },
  { id: 4, label: '右后卫(RB)', value: 4 },
  { id: 5, label: '左中场(LCM)', value: 5 },
  { id: 6, label: '防守型中场(DM)', value: 6 },
  { id: 7, label: '右中场(RCM)', value: 7 },
  { id: 8, label: '左前锋(LW)', value: 8 },
  { id: 9, label: '中锋 (ST)', value: 9 },
  { id: 10, label: '右前锋(RW)', value: 10 },
];

function buildRegionsWithTeams(teamsList) {
  return LOCAL_REGIONS.map(region => {
    const teamsMap = {};
    region.cities.forEach(city => {
      const cityTeams = teamsList.filter(team =>
        team.region === region.name && team.city === city
      );
      teamsMap[city] = cityTeams.map(team => ({
        name: team.name,
        team_id: team.team_id
      }));
    });

    return {
      name: region.name,
      cities: region.cities,
      teams: teamsMap,  // 每个城市一定有一个 teams 数组
    };
  });
}

export default function EditProfileScreen({ navigation }) {
  const [focusedInput, setFocusedInput] = useState(null);
  const [formData, setFormData] = useState({
    nickname: '',
    jersey_number: '',
    positions: [],
    team: null,
    avatar: null,
    user_code: ''
  });
  const [isTeamPickerVisible, setTeamPickerVisible] = useState(false);
  const [teamsList, setTeamsList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({
    nickname: false,
    jersey_number: false,
    positions: false,
    team: false,
    avatar: false,
    user_code: false
  });
  const [showErrors, setShowErrors] = useState(false);
  const [isFirstEdit, setIsFirstEdit] = useState(false);

  const handleOpenTeamPicker = async () => {
    try {
      const teamsList = await teamsStore.getTeamsList();
      console.log('🔍 EditProfileScreen - teamsList:', teamsList);
      const regionsWithTeams = buildRegionsWithTeams(teamsList);
      console.log('🔍 EditProfileScreen - regionsWithTeams:', regionsWithTeams);
      setTeamsList(regionsWithTeams);
      setTeamPickerVisible(true);
    } catch (error) {
      console.error('加载球队数据失败:', error);
      Alert.alert('错误', '加载球队数据失败，请重试');
    }
  };

  // 加载用户现有数据
  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile, error } = await supabase
        .from('profiles')
        .select(`
          *,
          team:teams!fk_profiles_team(*)
        `)
        .eq('id', user.id)
        .single();

      if (error) throw error;

      if (profile) {
        const isFirst = !profile.user_code?.trim();
        setIsFirstEdit(isFirst);
        // 如果是第一次编辑，清空所有字段
        if (isFirst) {
          setFormData({
            nickname: '',
            jersey_number: '',
            positions: [],
            team: null,
            avatar: null,
            user_code: ''
          });
        } else {
          // 否则使用现有数据
          setFormData({
            nickname: profile.nickname || '',
            jersey_number: profile.jersey_number || '',
            positions: profile.positions || [],
            team: profile.team ? {
              team_id: profile.team.team_id,
              name: profile.team.name,
              region: profile.team.region,
              city: profile.team.city
            } : null,
            team_id: profile.team_id || null,
            avatar: profile.avatar_url || null,
            user_code: profile.user_code || ''
          });
        }
      }
    } catch (error) {
      console.error('加载用户资料失败:', error);
    }
  };

  const validateForm = () => {
    const newErrors = {
      nickname: !formData.nickname.trim(),
      jersey_number: false,
      positions: false,
      team: false,
      avatar: !formData.avatar,
      user_code: !formData.user_code.trim()
    };
    
    setErrors(newErrors);
    setShowErrors(true);
    return !Object.values(newErrors).some(error => error);
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setIsLoading(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        Alert.alert('错误', '请先登录');
        return;
      }

      let avatarUrl = formData.avatar;

      if (typeof avatarUrl !== 'string') {
        console.log('🔍 EditProfileScreen - 开始上传新头像:', formData.avatar);
        try {
          avatarUrl = await profileService.uploadAvatar(formData.avatar);
          console.log('✅ EditProfileScreen - 头像上传成功，返回 URL:', avatarUrl);
        } catch (error) {
          console.error('❌ EditProfileScreen - 图片上传失败:', error);
          throw new Error('图片上传失败');
        }
      }

      console.log('🔍 EditProfileScreen - 准备更新档案，头像 URL:', avatarUrl);
      await profileService.upsertProfile({
        nickname: formData.nickname,
        jersey_number: formData.jersey_number,
        positions: formData.positions,
        team_id: formData.team?.team_id,
        avatar_url: avatarUrl,
        user_code: formData.user_code
      });

      Toast.show({
        type: 'success',
        text1: '成功',
        text2: '资料已更新',
        visibilityTime: 2000,
        autoHide: true,
        position: 'top',
      });

      navigation.getParent()?.setParams({ shouldRefresh: true });
      navigation.goBack();

    } catch (error) {
      console.error('保存失败:', error);
      Alert.alert('保存失败', '请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    if (field === 'user_code' && !isFirstEdit) {
      return;
    }
    setFormData(prev => ({ ...prev, [field]: value }));
    // 当用户开始输入时，清除对应字段的错误状态
    if (showErrors) {
      setErrors(prev => ({ ...prev, [field]: false }));
    }
  };

  const togglePosition = (positionValue) => {
    if (formData.positions.includes(positionValue)) {
      handleInputChange('positions', formData.positions.filter(id => id !== positionValue));
    } else {
      handleInputChange('positions', [...formData.positions, positionValue]);
    }
  };

  return (
    <SafeAreaViewRN style={commonScreenStyles.container}>
      {/* 头部 */}
      <View style={commonScreenStyles.headerContainer}>
        <TouchableOpacity 
          style={commonScreenStyles.backButton}
          onPress={() => navigation.goBack()}
        >
          <AppText style={commonScreenStyles.backButtonText}>←</AppText>
        </TouchableOpacity>
        <AppText style={commonScreenStyles.headerTitle}>编辑我的卡片</AppText>
      </View>

      {/* 主要内容 */}
      <KeyboardAvoidingView 
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 20}
      >
        <ScrollView 
          style={commonScreenStyles.mainContent}
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={commonScreenStyles.formContainer}>
            {/* 用户唯一识别码 */}
            <FormInput
              label=""
              value={formData.user_code}
              onChangeText={(text) => handleInputChange('user_code', text)}
              placeholder="输入用户ID"
              isFocused={focusedInput === 'user_code'}
              onFocus={() => setFocusedInput('user_code')}
              onBlur={() => setFocusedInput(null)}
              error={showErrors && errors.user_code}
              errorText="请输入用户ID"
              editable={isFirstEdit}
            />

            {/* 昵称 */}
            <FormInput
              label=""
              value={formData.nickname}
              onChangeText={(text) => handleInputChange('nickname', text)}
              placeholder="输入昵称"
              isFocused={focusedInput === 'nickname'}
              onFocus={() => setFocusedInput('nickname')}
              onBlur={() => setFocusedInput(null)}
              error={showErrors && errors.nickname}
              errorText="请输入昵称"
            />

            {/* 背号 */}
            <FormInput
              label=""
              value={formData.jersey_number}
              onChangeText={(text) => handleInputChange('jersey_number', text.replace(/[^0-9]/g, '').slice(0, 2))}
              placeholder="输入背号(选填)"
              keyboardType="numeric"
              maxLength={2}
              isFocused={focusedInput === 'jersey_number'}
              onFocus={() => setFocusedInput('jersey_number')}
              onBlur={() => setFocusedInput(null)}
              error={showErrors && errors.jersey_number}
              errorText=""
            />

            {/* 所属球队 */}
            <FormInput
              label=""
              value={formData.team?.name || ''}
              placeholder="选择所属球队(选填)"
              editable={false}
              onPress={handleOpenTeamPicker}
              error={showErrors && errors.team}
              errorText=""
            />

            {/* 球队选择器 Modal */}
            <CascadePicker
              visible={isTeamPickerVisible}
              onClose={() => setTeamPickerVisible(false)}
              onSelect={(team) => {
                handleInputChange('team', team);
                setTeamPickerVisible(false);
              }}
              regions={teamsList}
              title="选择所属球队(选填)"
              showTeams={true}
            />

            {/* 位置选择区域 */}
            <View style={styles.formGroup}>
              <AppText style={styles.label}>位置(选填)</AppText>
              <View style={styles.positionsGrid}>
                {positions.map(position => (
                  <TouchableOpacity
                    key={position.id}
                    style={styles.positionItem}
                    onPress={() => togglePosition(position.value)}
                  >
                    <View style={[
                      styles.checkbox,
                      formData.positions.includes(position.value) && styles.checkboxSelected
                    ]}>
                      {formData.positions.includes(position.value) && (
                        <View style={styles.checkboxInner} />
                      )}
                    </View>
                    <AppText style={styles.positionLabel}>{position.label}</AppText>
                  </TouchableOpacity>
                ))}
              </View>
              {showErrors && errors.positions && (
                <AppText style={styles.errorText}>请至少选择一个位置</AppText>
              )}
            </View>

            {/* 添加头像上传框 */}
            <ImageUploadBox 
              text="图片"
              label=""
              hasImage={!!formData.avatar}
              onImageSelected={(image) => handleInputChange('avatar', image)}
              value={typeof formData.avatar === 'string' ? formData.avatar : formData.avatar?.uri}
              error={showErrors && errors.avatar}
              errorText="请上传头像"
            />
          </View>
        </ScrollView>

        <View style={commonScreenStyles.submitContainer}>
          <TouchableOpacity 
            style={commonScreenStyles.submitButton}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            <AppText style={commonScreenStyles.submitButtonText}>保存</AppText>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaViewRN>
  );
}

const styles = StyleSheet.create({
  formGroup: {
    marginBottom: hp(3),
  },
  label: {
    fontSize: normalize(14),
    color: colors.textPrimary,
    marginBottom: hp(1),
    fontFamily: fonts.pixel,
  },
  positionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: hp(1),
  },
  positionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '50%',
    paddingVertical: hp(1),
    paddingRight: wp(2),
  },
  checkbox: {
    width: wp(4.5),
    height: wp(4.5),
    borderWidth: 1,
    borderColor: colors.line,
    marginRight: wp(2),
    backgroundColor: colors.bgWhite,
  },
  checkboxSelected: {
    borderColor: colors.primary,
  },
  checkboxInner: {
    flex: 1,
    margin: 2,
    backgroundColor: colors.primary,
  },
  positionLabel: {
    fontSize: normalize(14),
    color: colors.textPrimary,
    fontFamily: fonts.pixel,
  },
  errorText: {
    color: colors.error,
    fontSize: typography.size.sm,
    fontFamily: fonts.pixel,
    marginTop: hp(0.5),
  },
});