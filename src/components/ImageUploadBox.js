import React, { useState } from 'react';
import { 
  View, 
  TouchableOpacity, 
  StyleSheet, 
  Image,
  Alert,
  Platform
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { colors, fonts, typography } from '@styles/main';
import { normalize, wp, hp } from '@utils/responsive';
import UniformRenderer from '@components/UniformRenderer';
import AppText from '@components/AppText';

export default function ImageUploadBox({ 
  style, 
  text, 
  label, 
  hasImage = false,
  onImageSelected,
  value,
  maxSize = 5 * 1024 * 1024, // 默认最大 5MB
  customUpload = false, // 新增参数
  isUniform = false // 新增参数
}) {
  const processImage = async (uri) => {
    try {
      if (!uri) {
        throw new Error('图片 URI 为空');
      }

      // 检查文件是否存在
      const fileInfo = await FileSystem.getInfoAsync(uri);
      if (!fileInfo.exists) {
        throw new Error('文件不存在');
      }

      // 检查文件大小
      if (fileInfo.size > maxSize) {
        throw new Error(`文件大小超过${maxSize/1024/1024}MB限制`);
      }

      // 获取文件类型
      const fileExtension = uri.split('.').pop().toLowerCase();
      if (!['jpg', 'jpeg', 'png'].includes(fileExtension)) {
        throw new Error('不支持的文件类型，仅支持 JPG 和 PNG');
      }

      return {
        uri,
        size: fileInfo.size,
        type: `image/${fileExtension === 'jpg' ? 'jpeg' : fileExtension}`
      };
    } catch (error) {
      console.error('处理图片错误:', error);
      throw error;
    }
  };

  const handlePress = async () => {
    if (customUpload) {
      console.log('使用自定义上传');
      onImageSelected();
      return;
    }

    try {
      console.log('开始请求相册权限...');
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      console.log('权限状态:', status);
      
      if (status !== 'granted') {
        Alert.alert('需要权限', '请允许访问相册以选择图片');
        return;
      }

      console.log('开始选择图片...');
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,  // 降低初始质量到0.5
      });
      console.log('图片选择结果:', result);

      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0];
        console.log('选中的图片:', asset);
        
        try {
          console.log('开始处理图片...');
          const processedImage = await processImage(asset.uri);
          console.log('图片处理完成:', processedImage);
          onImageSelected(processedImage);
        } catch (error) {
          console.error('处理图片失败:', error);
          Alert.alert('错误', error.message);
        }
      } else {
        console.log('用户取消选择或未选择图片');
      }
    } catch (error) {
      console.error('选择图片错误:', error);
      Alert.alert('错误', '选择图片时出现错误');
    }
  };

  return (
    <View style={styles.section}>
      <View style={[styles.dashedBorder, style]}>
        <TouchableOpacity 
          style={styles.container} 
          onPress={handlePress}
        >
          {value ? (
            <View style={styles.imageWrapper}>
              {isUniform ? (
                <>
                  <View style={styles.uniformContainer}>
                    <UniformRenderer 
                      pixels={typeof value === 'string' ? JSON.parse(value).pixels : value.pixels}
                      style={styles.uniformPreview}
                    />
                  </View>
                  <View style={styles.overlay}>
                    <AppText style={styles.overlayText}>重新设计{text}</AppText>
                  </View>
                </>
              ) : (
                <>
                  <Image 
                    source={{ uri: value }} 
                    style={styles.thumbnail}
                    resizeMode="cover"
                  />
                  <View style={styles.overlay}>
                    <AppText style={styles.overlayText}>更换{text}</AppText>
                  </View>
                </>
              )}
            </View>
          ) : (
            <AppText style={styles.text}>
              {isUniform ? `设计${text}` : (hasImage ? `更换${text}` : `上传${text}`)}
            </AppText>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: hp(2),
  },
  dashedBorder: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: wp(0),
    borderStyle: 'dashed',
  },
  container: {
    height: hp(15),
    backgroundColor: colors.bgWhite,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  imageWrapper: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  text: {
    fontSize: typography.size.base,
    color: colors.textSecondary,
    fontFamily: fonts.pixel,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayText: {
    color: colors.bgWhite,
    fontSize: typography.size.base,
    fontFamily: fonts.pixel,
  },
  uniformContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
    height: '100%',
  },
  uniformPreview: {
    width: '100%',  // 填满容器宽度
    height: '100%', // 填满容器高度
  },
});