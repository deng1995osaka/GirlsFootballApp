import { supabase } from '@lib/supabase';

/**
 * 创建用户档案
 * @param {Object} profileData - 用户档案数据
 * @returns {Promise<{data: Object, error: Error}>}
 */
export const createUserProfile = async (profileData) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .insert([profileData])
      .select()
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('创建用户档案失败:', error);
    return { data: null, error };
  }
};

/**
 * 获取用户档案
 * @param {string} userId - 用户ID
 * @returns {Promise<{data: Object, error: Error}>}
 */
export const getUserProfile = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('获取用户档案失败:', error);
    return { data: null, error };
  }
};

/**
 * 更新用户档案
 * @param {string} userId - 用户ID
 * @param {Object} updates - 要更新的字段
 * @returns {Promise<{data: Object, error: Error}>}
 */
export const updateUserProfile = async (userId, updates) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('更新用户档案失败:', error);
    return { data: null, error };
  }
}; 