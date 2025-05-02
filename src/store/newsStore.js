import { supabase } from '@lib/supabase';

export const newsStore = {
  // 获取新闻列表
  async getNewsList() {
    try {
      const { data, error } = await supabase
        .from('news')
        .select(`
          *,
          profiles:created_by (
            nickname,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('获取新闻列表失败:', error);
      throw error;
    }
  },

  // 获取新闻详情
  async getNewsById(id) {
    try {
      const { data, error } = await supabase
        .from('news')
        .select(`
          news_id,
          title,
          content,
          summary,
          image_url,
          created_at,
          author
        `)
        .eq('news_id', id)  // 这里也改为 news_id
        .single();

      if (error) {
        console.error('获取新闻详情失败:', error);
        throw error;
      }

      // 如果有作者ID，查询作者信息
      if (data.author) {
        const { data: authorData } = await supabase
          .from('profiles')
          .select('nickname')
          .eq('id', data.author)
          .single();

        return {
          ...data,
          author: authorData?.nickname || '匿名'
        };
      }

      return {
        ...data,
        author: '匿名'
      };
    } catch (error) {
      console.error('获取新闻详情时发生错误:', error);
      throw error;
    }
  },

  // 创建新闻
  async createNews({ title, content, image, summary }) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // 开启事务，确保数据一致性
      const { data, error } = await supabase
        .rpc('create_news_and_update_count', {
          p_title: title,
          p_content: content,
          p_summary: summary || content.substring(0, 100),
          p_image_url: image,
          p_author: user?.id
        });

      if (error) {
        console.error('创建新闻失败:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('创建新闻时发生错误:', error);
      throw error;
    }
  }
}; 