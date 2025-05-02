import { supabase } from '@lib/supabase';
import * as FileSystem from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';
import { decode } from 'base64-arraybuffer';

export const imageService = {
  /**
   * 通用图片上传方法
   * @param {Object} file - 图片文件对象 { uri, type, size }
   * @param {string} bucket - Supabase Storage 的 bucket 名称
   * @param {string} folder - 存储文件夹名称
   * @param {Object} options - 可选配置
   * @param {number} options.maxWidth - 最大宽度，默认 400
   * @param {number} options.quality - 压缩质量，默认 0.7
   * @param {string} options.prefix - 文件名前缀，默认 'image'
   * @returns {Promise<string>} - 返回图片的公开 URL
   */
  async uploadImage(file, bucket, folder, options = {}) {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('未登录');

      // 获取最新的 access token
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;
      if (!accessToken) throw new Error('获取访问令牌失败');

      // 压缩图片
      const compressed = await ImageManipulator.manipulateAsync(
        file.uri,
        [{ resize: { width: options.maxWidth || 400 } }],
        { compress: options.quality || 0.7, format: ImageManipulator.SaveFormat.JPEG }
      );

      // 检查文件是否存在且有效
      const fileInfo = await FileSystem.getInfoAsync(compressed.uri);

      if (!fileInfo.exists || fileInfo.size === 0) {
        throw new Error('图片读取失败：文件不存在或大小为 0');
      }

      // 读取文件内容
      const fileContent = await FileSystem.readAsStringAsync(compressed.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // 转换为 ArrayBuffer
      const buffer = decode(fileContent);

      // 生成唯一的文件名
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(7);
      const storagePath = `${folder}/${user.id}/${timestamp}_${options.prefix || 'image'}_${randomString}.jpg`;

      // 上传到 Supabase Storage
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(storagePath, buffer, {
          contentType: 'image/jpeg',
          upsert: true
        });

      if (error) {
        throw new Error('上传失败: ' + error.message);
      }

      // 获取公开URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(storagePath);

      return `${publicUrl}?t=${Date.now()}`;
    } catch (error) {
      throw error;
    }
  }
};