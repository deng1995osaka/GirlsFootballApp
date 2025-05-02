import { supabase } from '@lib/supabase';
import { imageService } from '@services/imageService';

export const newsService = {
  /**
   * 上传新闻图片
   * @param {Object} file - 图片文件对象 { uri, type, size }
   * @param {string} newsId - 新闻ID
   * @returns {Promise<string>} - 返回图片的公开 URL
   */
  async uploadNewsImage(file, newsId = null) {
    try {
      // 使用 imageService 上传图片
      const finalUrl = await imageService.uploadImage(file, 'news', 'news', {
        maxWidth: 800,
        quality: 0.7,
        prefix: 'news'
      });

      // ✅ 如果有 newsId，自动更新 news 表中的 image_url 字段
      if (newsId) {
        this.updateNews(newsId, { image_url: finalUrl }).catch(error => {
          console.error('更新新闻图片URL失败:', error);
        });
      }

      return finalUrl;
    } catch (error) {
      console.error('新闻图片上传失败:', error);
      throw error;
    }
  },

  /**
   * 创建新闻
   * @param {Object} newsData - 新闻数据
   * @returns {Promise<Object>} - 返回创建的新闻数据
   */
  async createNews(newsData) {
    try {
      const { data, error } = await supabase
        .from('news')
        .insert([newsData])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('创建新闻失败:', error);
      throw error;
    }
  },

  /**
   * 更新新闻
   * @param {string} newsId - 新闻ID
   * @param {Object} updates - 要更新的字段
   * @returns {Promise<Object>} - 返回更新后的新闻数据
   */
  async updateNews(newsId, updates) {
    try {
      const { data, error } = await supabase
        .from('news')
        .update(updates)
        .eq('id', newsId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('更新新闻失败:', error);
      throw error;
    }
  },

  /**
   * 获取所有新闻
   * @returns {Promise<Array>} - 返回新闻列表
   */
  async getAllNews() {
    try {
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('获取新闻列表失败:', error);
      throw error;
    }
  },

  /**
   * 获取用户创建的新闻
   * @param {string} userId - 用户ID
   * @returns {Promise<Array>} - 返回用户创建的新闻列表
   */
  async getUserNews(userId) {
    try {
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .eq('created_by', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('获取用户新闻列表失败:', error);
      throw error;
    }
  }
}; 