import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
  Keyboard,
  TouchableWithoutFeedback
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { supabase } from '@lib/supabase';
import { newsService } from '@services/newsService';
import AppText from '@components/AppText';
import FormInput from '@components/FormInput';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, fonts } from '@styles/main';
import { normalize, wp, hp } from '@utils/responsive';
import { commonScreenStyles } from '@styles/screenStyles';
import { useProfileCheck } from '@hooks/useProfileCheck';
import Toast from 'react-native-toast-message';
import ImageUploadBox from '@components/ImageUploadBox';
import Background from '@components/Background';
import * as FileSystem from 'expo-file-system';

const CreateNewsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const isEditing = route.params?.newsData !== undefined;
  const initialData = isEditing ? route.params.newsData : null;
  const { checkProfile } = useProfileCheck(navigation, false);

  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    content: initialData?.content || '',
    image: initialData?.image_url || null
  });
  const [submitting, setSubmitting] = useState(false);
  const [focusedInput, setFocusedInput] = useState(null);
  const [errors, setErrors] = useState({
    title: false,
    content: false
  });

  const validateForm = () => {
    const newErrors = {
      title: !formData.title.trim(),
      content: !formData.content.trim()
    };
    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error);
  };

  const handleSubmit = async () => {
    try {
      if (!validateForm()) return;

      setSubmitting(true);

      // 获取当前用户
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        Toast.show({
          type: 'error',
          text1: '错误',
          text2: '请先登录',
          visibilityTime: 2000,
          autoHide: true,
          position: 'top',
        });
        return;
      }

      // 处理图片上传
      let imageUrl = formData.image;
      if (imageUrl && typeof imageUrl !== 'string') {
        try {
          imageUrl = await newsService.uploadNewsImage(formData.image);
        } catch (error) {
          console.error('图片上传失败:', error);
          Toast.show({
            type: 'error',
            text1: '错误',
            text2: '图片上传失败，请重试',
            visibilityTime: 2000,
            autoHide: true,
            position: 'top',
          });
          setSubmitting(false);
          return;
        }
      }

      // 准备小报数据
      const newsData = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        image_url: imageUrl,
        created_by: user.id,
        updated_at: new Date().toISOString()
      };

      // 创建或更新小报
      if (isEditing) {
        await newsService.updateNews(route.params.newsData.id, newsData);
        Toast.show({
          type: 'success',
          text1: '成功',
          text2: '小报更新成功！',
          visibilityTime: 2000,
          autoHide: true,
          position: 'top',
        });
        navigation.goBack();
      } else {
        await newsService.createNews(newsData);
        Toast.show({
          type: 'success',
          text1: '成功',
          text2: '小报发布成功！',
          visibilityTime: 2000,
          autoHide: true,
          position: 'top',
        });
        navigation.goBack();
      }
    } catch (error) {
      console.error('提交小报失败:', error);
      Toast.show({
        type: 'error',
        text1: '错误',
        text2: error.message || '提交失败，请重试',
        visibilityTime: 2000,
        autoHide: true,
        position: 'top',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={commonScreenStyles.container}>
      <View style={commonScreenStyles.headerContainer}>
        <TouchableOpacity 
          style={commonScreenStyles.backButton}
          onPress={() => navigation.goBack()}
        >
          <AppText style={commonScreenStyles.backButtonText}>←</AppText>
        </TouchableOpacity>
        <AppText style={commonScreenStyles.headerTitle}>
          {isEditing ? '编辑小报' : '发小报'}
        </AppText>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView 
            style={commonScreenStyles.mainContent}
            contentContainerStyle={{ paddingBottom: hp(0) }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={commonScreenStyles.formContainer}>
              <FormInput
                label=""
                value={formData.title}
                onChangeText={(text) => {
                  setFormData(prev => ({ ...prev, title: text }));
                  if (errors.title) {
                    setErrors(prev => ({ ...prev, title: false }));
                  }
                }}
                placeholder="标题"
                onFocus={() => setFocusedInput('title')}
                onBlur={() => setFocusedInput(null)}
                isValid={false}
                style={errors.title && styles.inputError}
                marginBottom={0}
              />
              {errors.title && (
                <AppText style={styles.errorText}>请输入标题</AppText>
              )}
              
              <View style={styles.contentContainer}>
                <Background backgroundType="grid">
                  <TextInput
                    style={[
                      styles.contentInput,
                      errors.content && styles.inputError
                    ]}
                    placeholder="正文"
                    value={formData.content}
                    onChangeText={(text) => {
                      setFormData(prev => ({ ...prev, content: text }));
                      if (errors.content) {
                        setErrors(prev => ({ ...prev, content: false }));
                      }
                    }}
                    multiline
                    textAlignVertical="top"
                    placeholderTextColor={colors.textSecondary}
                    onFocus={() => setFocusedInput('content')}
                    onBlur={() => setFocusedInput(null)}
                    returnKeyType="done"
                    onSubmitEditing={Keyboard.dismiss}
                  />
                </Background>
              </View>
              {errors.content && (
                <AppText style={styles.errorText}>请输入内容</AppText>
              )}
              
              <ImageUploadBox 
                text="图片"
                label=""
                hasImage={!!formData.image}
                onImageSelected={(image) => {
                  if (!image) return;
                  setFormData(prev => ({ ...prev, image }));
                }}
                value={typeof formData.image === 'string' ? formData.image : formData.image?.uri}
              />
              
              {submitting && (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={colors.primary} />
                  <AppText style={styles.loadingText}>正在保存...</AppText>
                </View>
              )}
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

      <View style={commonScreenStyles.submitContainer}>
        <TouchableOpacity
          style={commonScreenStyles.submitButton}
          onPress={handleSubmit}
          disabled={submitting}
        >
          <AppText style={commonScreenStyles.submitButtonText}>
            {submitting ? '发布中...' : '发小报'}
          </AppText>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  titleInput: {
    fontSize: typography.size.lg,
    color: colors.textPrimary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: wp(2),
    marginBottom: wp(2),
    fontFamily: fonts.pixel,
  },
  contentContainer: {
    position: 'relative',
    marginTop: hp(2),
    marginBottom: hp(2),
    height: hp(40),
    overflow: 'hidden',
    borderColor: colors.line,
    borderWidth: 1,
  },
  contentInput: {
    ...typography.body,
    padding: wp(3),
    height: '100%',
    textAlignVertical: 'top',
  },
  inputError: {
    borderColor: colors.error,
    borderBottomColor: colors.error,
  },
  errorText: {
    color: colors.error,
    fontSize: typography.size.sm,
    fontFamily: fonts.pixel,
    marginBottom: wp(2),
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: wp(2),
    color: colors.textPrimary,
    fontSize: typography.size.md,
    fontFamily: fonts.pixel,
  },
});

export default CreateNewsScreen;
