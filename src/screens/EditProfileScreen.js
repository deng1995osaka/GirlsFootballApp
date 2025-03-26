import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert
} from 'react-native';
import { colors, fonts, typography } from '../styles/main';
import { normalize, wp, hp } from '../utils/responsive';
import Header from '../components/Header';
import PixelButton from '../components/PixelButton';
import { commonScreenStyles } from '../styles/screenStyles';
import FormInput from '../components/FormInput';
import CascadePicker from '../components/CascadePicker';
import { profileService } from '../services/profileService';
import * as FileSystem from 'expo-file-system';
import { supabase } from '../lib/supabase';
import ImageUploadBox from '../components/ImageUploadBox';
import { decode } from 'base64-arraybuffer';
import { teamsStore } from '../store/teamsStore';

const positions = [
  { id: 0, label: '门将 (GK)', value: 0 },
  { id: 1, label: '左后卫 (LB)', value: 1 },
  { id: 2, label: '左中后卫 (LCB)', value: 2 },
  { id: 3, label: '右中后卫 (RCB)', value: 3 },
  { id: 4, label: '右后卫 (RB)', value: 4 },
  { id: 5, label: '左中场 (LCM)', value: 5 },
  { id: 6, label: '防守型中场 (DM)', value: 6 },
  { id: 7, label: '右中场 (RCM)', value: 7 },
  { id: 8, label: '左前锋 (LW)', value: 8 },
  { id: 9, label: '中锋 (ST)', value: 9 },
  { id: 10, label: '右前锋 (RW)', value: 10 },
];

const TEST_TEAMS = [
  {
    name: '华东地区',
    cities: ['南京', '上海', '杭州', '苏州'],
    teams: {
      '南京': ['见野星期天', '南京城市FC', '南京蓝狐'],
      '上海': ['申花女足', '上海海鸥', '海上女足'],
      '杭州': ['杭州女足', '钱塘女足'],
      '苏州': ['苏州女足']
    }
  },
  {
    name: '华南地区',
    cities: ['广州', '深圳', '厦门'],
    teams: {
      '广州': ['广州女足', '广州城女足'],
      '深圳': ['深圳女足', '深圳湾女足'],
      '厦门': ['厦门海之星']
    }
  },
  {
    name: '华北地区',
    cities: ['北京', '天津'],
    teams: {
      '北京': ['北京女足', '北京北控'],
      '天津': ['天津女足']
    }
  }
];

export default function EditProfileScreen({ navigation }) {
  const [focusedInput, setFocusedInput] = useState(null);
  const [formData, setFormData] = useState({
    nickname: '',
    number: '',
    selectedPositions: [],
    team: '',
    avatar: null
  });
  const [showTeamPicker, setShowTeamPicker] = useState(false);
  const [teamsList, setTeamsList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // 加载用户现有数据
  useEffect(() => {
    loadUserProfile();
    loadTeams();
  }, []);

  const loadUserProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      if (profile) {
        setFormData({
          nickname: profile.nickname || '',
          number: profile.number || '',
          selectedPositions: profile.positions || [],
          team: profile.team || '',
          avatar: profile.avatar_url || null
        });
      }
    } catch (error) {
      console.error('加载用户资料失败:', error);
    }
  };

  const loadTeams = async () => {
    try {
      const teams = await teamsStore.getTeamsList();
      
      const groupedTeams = teams.reduce((acc, team) => {
        const region = team.region;
        const city = team.city;
        
        const existingRegion = acc.find(r => r.name === region);
        if (existingRegion) {
          if (!existingRegion.cities.includes(city)) {
            existingRegion.cities.push(city);
          }
          if (!existingRegion.teams[city]) {
            existingRegion.teams[city] = [];
          }
          existingRegion.teams[city].push({
            name: team.name,
            team_id: team.team_id
          });
        } else {
          acc.push({
            name: region,
            cities: [city],
            teams: {
              [city]: [{
                name: team.name,
                team_id: team.team_id
              }]
            }
          });
        }
        return acc;
      }, []);

      setTeamsList(groupedTeams);
    } catch (error) {
      console.error('加载球队列表失败:', error);
      Alert.alert('提示', '加载球队列表失败');
    }
  };

  const handleSubmit = async () => {
    try {
      setIsLoading(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        Alert.alert('错误', '请先登录');
        return;
      }

      let avatar_url = formData.avatar;

      // 如果有新的头像需要上传
      if (formData.avatar && formData.avatar.startsWith('file://')) {
        try {
          const fileExt = 'jpg';
          const fileName = `${user.id}/${Date.now()}.${fileExt}`;
          
          const formDataObj = new FormData();
          formDataObj.append('file', {
            uri: formData.avatar,
            name: 'avatar.jpg',
            type: 'image/jpeg'
          });

          const response = await fetch(
            `https://sfgcrobnxslmdhnzwhhm.supabase.co/storage/v1/object/avatars/${fileName}`,
            {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
                'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNmZ2Nyb2JueHNsbWRobnp3aGhtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzYyMTc1NTQsImV4cCI6MjA1MTc5MzU1NH0.YCICSnFZNlEjmTFf5jvjdMnv3oaIKp1RLElxTN1YTBA'
              },
              body: formDataObj
            }
          );

          if (!response.ok) throw new Error('图片上传失败');

          const { data: { publicUrl } } = supabase.storage
            .from('avatars')
            .getPublicUrl(fileName);

          avatar_url = publicUrl;
        } catch (error) {
          console.error('图片上传失败:', error);
          throw new Error('图片上传失败');
        }
      }

      // 使用 team_id 而不是 team name
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          nickname: formData.nickname,
          number: formData.number,
          positions: formData.selectedPositions,
          team_id: formData.team.team_id,
          avatar_url: avatar_url,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'id'
        });

      if (profileError) throw profileError;

      Alert.alert('成功', '资料已更新');
      navigation.goBack();

    } catch (error) {
      console.error('保存失败:', error);
      Alert.alert('保存失败', '请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const togglePosition = (positionValue) => {
    if (formData.selectedPositions.includes(positionValue)) {
      handleInputChange('selectedPositions', formData.selectedPositions.filter(id => id !== positionValue));
    } else {
      handleInputChange('selectedPositions', [...formData.selectedPositions, positionValue]);
    }
  };

  return (
    <SafeAreaView style={commonScreenStyles.container}>
      {/* 头部 */}
      <View style={commonScreenStyles.headerContainer}>
        <TouchableOpacity 
          style={commonScreenStyles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={commonScreenStyles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={commonScreenStyles.headerTitle}>编辑我的卡片</Text>
      </View>

      {/* 主要内容 */}
      <ScrollView style={commonScreenStyles.mainContent}>
        <View style={commonScreenStyles.formContainer}>
       

          {/* 昵称 */}
          <FormInput
            label=""
            value={formData.nickname}
            onChangeText={(text) => handleInputChange('nickname', text)}
            placeholder="输入昵称"
            isFocused={focusedInput === 'nickname'}
            onFocus={() => setFocusedInput('nickname')}
            onBlur={() => setFocusedInput(null)}
          />

          {/* 背号 */}
          <FormInput
            label=""
            value={formData.number}
            onChangeText={(text) => handleInputChange('number', text.replace(/[^0-9]/g, '').slice(0, 2))}
            placeholder="输入背号"
            keyboardType="numeric"
            maxLength={2}
            isFocused={focusedInput === 'number'}
            onFocus={() => setFocusedInput('number')}
            onBlur={() => setFocusedInput(null)}
          />

          {/* 所属球队 */}
          <FormInput
            label=""
            value={formData.team.name}
            placeholder="选择所属球队"
            editable={false}
            onPress={() => setShowTeamPicker(true)}
          />

          {/* 球队选择器 Modal */}
          <CascadePicker
            visible={showTeamPicker}
            onClose={() => setShowTeamPicker(false)}
            onSelect={(team) => {
              handleInputChange('team', team);
              setShowTeamPicker(false);
            }}
            regions={teamsList}
            title="选择所属球队"
            showTeams={true}
          />

          {/* 位置选择区域 */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>位置</Text>
            <View style={styles.positionsGrid}>
              {positions.map(position => (
                <TouchableOpacity
                  key={position.id}
                  style={styles.positionItem}
                  onPress={() => togglePosition(position.value)}
                >
                  <View style={[
                    styles.checkbox,
                    formData.selectedPositions.includes(position.value) && styles.checkboxSelected
                  ]}>
                    {formData.selectedPositions.includes(position.value) && (
                      <View style={styles.checkboxInner} />
                    )}
                  </View>
                  <Text style={styles.positionLabel}>{position.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

             {/* 添加头像上传框 */}
             <ImageUploadBox 
            text="图片"
            label=""
            hasImage={!!formData.avatar}
            onImageSelected={(uri) => handleInputChange('avatar', uri)}
            value={formData.avatar}
          />
        </View>
      </ScrollView>

      {/* 提交按钮 */}
      <View style={commonScreenStyles.submitContainer}>
        <TouchableOpacity 
          style={commonScreenStyles.submitButton}
          onPress={handleSubmit}
          disabled={isLoading}
        >
          <Text style={commonScreenStyles.submitButtonText}>保存</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
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
});