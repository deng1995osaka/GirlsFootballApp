import { useState } from 'react';
import { Alert } from 'react-native';
import { supabase } from '@lib/supabase';
import Toast from 'react-native-toast-message';

/**
 * 用户档案检查 Hook
 * @param {Object} navigation - 导航对象
 * @returns {Object} - 返回状态和处理函数
 */
export const useProfileCheck = (navigation) => {
    const checkProfile = async () => {
        try {
            // 1. 检查登录状态
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                navigation.navigate('Login');
                return false;
            }

            // 2. 检查用户档案
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (profileError) {
                Alert.alert('错误', '获取用户信息失败');
                return false;
            }

            // 3. 检查是否完善资料
            if (!profile || profile.nickname === null) {
                Toast.show({
                    type: 'info',
                    text1: '请先填写 PLAYER 档案',
                    text2: '点击此处前往填写',
                    onPress: () => navigation.navigate('EditProfile'),
                    visibilityTime: 4000,
                    autoHide: true,
                    position: 'top',
                });
                return false;
            }

            return true;
        } catch (error) {
            Alert.alert('错误', '操作失败，请重试');
            return false;
        }
    };

    return {
        checkProfile
    };
}; 