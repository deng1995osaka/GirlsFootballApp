import React from 'react';
import { 
  View, 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  Image,
  Alert 
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { colors, fonts, typography } from '../styles/main';
import { wp, hp } from '../utils/responsive';
import UniformRenderer from './UniformRenderer';

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
      // 如果是自定义上传，直接调用回调
      onImageSelected();
      return;
    }

    try {
      // 原有的图片选择逻辑
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('需要权限', '请允许访问相册以选择图片');
        return;
      }

      // 选择图片
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0];
        
        try {
          // 处理图片
          const processedImage = await processImage(asset.uri);
          onImageSelected(processedImage.uri);
        } catch (error) {
          Alert.alert('错误', error.message);
        }
      }
    } catch (error) {
      console.error('选择图片错误:', error);
      Alert.alert('错误', '选择图片时出现错误');
    }
  };

  return (
    <View style={styles.section}>
      <TouchableOpacity 
        style={[styles.container, style]} 
        onPress={handlePress}
      >
        {value ? (
          <View style={styles.imageWrapper}>
            {isUniform ? (
              <>
                <View style={styles.uniformContainer}>
                  {[1, 2, 3].map((_, index) => (
                    <UniformRenderer 
                      key={index}
                      pixels={typeof value === 'string' ? JSON.parse(value).pixels : value.pixels}
                      style={styles.uniformPreview}
                    />
                  ))}
                </View>
                <View style={styles.overlay}>
                  <Text style={styles.overlayText}>重新设计{text}</Text>
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
                  <Text style={styles.overlayText}>更换{text}</Text>
                </View>
              </>
            )}
          </View>
        ) : (
          <Text style={styles.text}>
            {isUniform ? `设计${text}` : (hasImage ? `更换${text}` : `上传${text}`)}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: hp(2),
  },
  container: {
    height: hp(15),
    backgroundColor: colors.bgWhite,
    borderRadius: wp(0),
    borderWidth: 1,
    borderColor: colors.line,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'visible',
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
    width: '30%',  // 这样每个队服图案占据容器宽度的30%
    height: '100%',
  },
});