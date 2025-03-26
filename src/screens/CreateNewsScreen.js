import React, { useState } from 'react';
import { 
  SafeAreaView, 
  ScrollView, 
  View, 
  Text,
  TouchableOpacity,
  Alert,
} from 'react-native';
import * as FileSystem from 'expo-file-system';
import { supabase } from '../lib/supabase';
import { commonScreenStyles } from '../styles/screenStyles';
import FormInput from '../components/FormInput';
import ImageUploadBox from '../components/ImageUploadBox';

export default function CreateNewsScreen({ navigation, route }) {
  const newsData = route.params?.newsData;
  const isEditing = route.params?.isEditing;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [focusedInput, setFocusedInput] = useState(null);
  const [formData, setFormData] = useState({
    title: newsData?.title || '',
    content: newsData?.content || '',
    image: newsData?.image_url || '',
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const uploadImage = async (uri, userId) => {
    try {
      console.log('开始上传图片:', uri);
      
      // 1. 验证文件
      const fileInfo = await FileSystem.getInfoAsync(uri);
      if (!fileInfo.exists) {
        throw new Error('文件不存在');
      }

      // 2. 生成文件路径
      const timestamp = Date.now();
      const path = `${userId}/${timestamp}_news.jpg`;
      
      // 3. 准备上传数据
      const formDataObj = new FormData();
      formDataObj.append('file', {
        uri: uri,
        type: 'image/jpeg',
        name: 'news.jpg'
      });

      // 4. 获取 session
      const { data: { session } } = await supabase.auth.getSession();
      
      // 5. 上传到 Supabase Storage
      const { data, error } = await supabase.storage
        .from('news')  // 确保这里使用正确的 bucket 名称
        .upload(path, formDataObj, {
          contentType: 'image/jpeg',
          upsert: false
        });

      if (error) throw error;

      // 6. 获取公开URL - 修改这里
      const { data: { publicUrl } } = supabase.storage
        .from('news')
        .getPublicUrl(path);

      console.log('上传成功，publicUrl:', publicUrl); // 添加日志
      return publicUrl;

    } catch (error) {
      console.error('图片上传失败:', error);
      throw error;
    }
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      if (!formData.title.trim() || !formData.content.trim()) {
        Alert.alert('提示', '请填写标题和内容');
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !session) {
        Alert.alert('错误', '请先登录');
        return;
      }

      let imageUrl = formData.image;
      if (formData.image && !formData.image.startsWith('http')) {
        imageUrl = await uploadImage(formData.image, user.id);
      }

      const newsData = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        image_url: imageUrl,
        updated_at: new Date().toISOString(),
      };

      let error;
      if (isEditing) {
        // 更新现有新闻
        const { error: updateError } = await supabase
          .from('news')
          .update(newsData)
          .eq('id', route.params.newsData.id);
        error = updateError;
      } else {
        // 创建新新闻
        const { error: insertError } = await supabase
          .from('news')
          .insert([{
            ...newsData,
            created_by: user.id,
            created_at: new Date().toISOString(),
          }]);
        error = insertError;
      }

      if (error) throw error;

      Alert.alert('成功', isEditing ? '小报更新成功！' : '小报发布成功！', [
        {
          text: '确定',
          onPress: () => {
            if (route.params?.onNewsCreated) {
              route.params.onNewsCreated();
            }
            navigation.goBack();
          }
        }
      ]);

    } catch (error) {
      Alert.alert('错误', error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={commonScreenStyles.container}>
      <View style={commonScreenStyles.headerContainer}>
        <TouchableOpacity 
          style={commonScreenStyles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={commonScreenStyles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={commonScreenStyles.headerTitle}>
          {isEditing ? '编辑小报' : '发小报'}
        </Text>
      </View>

      <ScrollView style={commonScreenStyles.mainContent}>
        <View style={commonScreenStyles.formContainer}>
          <FormInput
            label=""
            value={formData.title}
            onChangeText={(text) => handleInputChange('title', text)}
            placeholder="输入标题"
            isFocused={focusedInput === 'title'}
            onFocus={() => setFocusedInput('title')}
            onBlur={() => setFocusedInput(null)}
          />

          <FormInput
            label=""
            value={formData.content}
            onChangeText={(text) => handleInputChange('content', text)}
            placeholder="输入正文"
            multiline
            isFocused={focusedInput === 'content'}
            onFocus={() => setFocusedInput('content')}
            onBlur={() => setFocusedInput(null)}
          />

          <ImageUploadBox
            text="图片"
            label=""
            hasImage={!!formData.image}
            onImageSelected={(uri) => handleInputChange('image', uri)}
            value={formData.image}
          />
        </View>
      </ScrollView>

      <View style={commonScreenStyles.submitContainer}>
        <TouchableOpacity
          style={commonScreenStyles.submitButton}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          <Text style={commonScreenStyles.submitButtonText}>
            {isSubmitting ? '发布中...' : '发小报'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
