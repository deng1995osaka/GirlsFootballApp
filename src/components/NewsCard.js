import React, { useState, useRef } from 'react';
import { View, TouchableOpacity, Image, StyleSheet, Alert } from 'react-native';
import AppText from '@components/AppText';

import { normalize, wp, hp } from '@utils/responsive';
import { colors, fonts, typography, layout } from '@styles/main';
import { supabase } from '@lib/supabase';
import VerificationSuccessSheet from '@components/VerificationSuccessSheet';
import ActionListSheet from '@components/ActionListSheet';

const NewsCard = ({ item, onPress, showMenuButton = false, navigation, onDelete }) => {
  const [imageError, setImageError] = useState(false);
  const [sheetVisible, setSheetVisible] = useState(false);
  const [actionSheetVisible, setActionSheetVisible] = useState(false);
  const buttonRef = useRef(null);

  const handleMenuAction = (action) => {
    if (action === 'edit') {
      navigation.navigate('NewsCreate', {
        newsData: item,
        isEditing: true
      });
    } else if (action === 'delete') {
      setSheetVisible(true);
    }
  };

  const handleDelete = async () => {
    try {
      // 先检查认证状态
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        Alert.alert('错误', '请先登录');
        return;
      }

      const { error } = await supabase
        .from('news')
        .delete()
        .eq('news_id', item.news_id);

      if (error) throw error;
      
      console.log("删除成功");
      if (onDelete) onDelete();
    } catch (error) {
      console.error('删除失败:', error);
      Alert.alert('错误', '删除失败，请重试');
    }
    setSheetVisible(false);
  };

  const handleShowMenu = (e) => {
    // 阻止事件冒泡，防止触发卡片的 onPress
    e.stopPropagation();
    setActionSheetVisible(true);
  };

  // 如果没有提供 onPress 回调，则默认导航到详情页
  const handleCardPress = () => {
    if (onPress) {
      onPress();
    } else if (navigation && item.news_id) {
      navigation.navigate('NewsDetail', { newsId: item.news_id });
    }
  };

  return (
    <>
      <TouchableOpacity 
        style={styles.newsCard}
        onPress={handleCardPress}
      >
        <View style={styles.newsContent}>
          <View style={styles.newsHeader}>
            <AppText style={styles.newsTitle} numberOfLines={2}>
              {item.title}
            </AppText>
            {showMenuButton && (
              <View style={styles.menuContainer}>
                <TouchableOpacity
                  ref={buttonRef}
                  onPress={handleShowMenu}
                >
                  <AppText style={styles.menuButton}>≡</AppText>
                </TouchableOpacity>
              </View>
            )}
          </View>
          <AppText style={styles.newsText} numberOfLines={2}>
            {item.summary || item.content}
          </AppText>
          {(!item.image_url || imageError) ? (
            <View style={styles.placeholderImage}>
              <AppText style={styles.placeholderText}>◇ 图片未加载 ◇</AppText>
            </View>
          ) : (
            <Image 
              source={{ uri: item.image_url }}
              style={styles.newsImage}
              resizeMode="cover"
              onError={(e) => {
                console.error('图片加载错误:', {
                  error: e.nativeEvent,
                  url: item.image_url,
                  type: typeof item.image_url
                });
                setImageError(true);
              }}
            />
          )}
          <View style={styles.newsMeta}>
            <AppText style={styles.authorName}>
              ◈{item.profiles?.nickname || '匿名'}◈
            </AppText>
          </View>
        </View>
      </TouchableOpacity>

      <VerificationSuccessSheet
        visible={sheetVisible}
        onClose={() => setSheetVisible(false)}
        onConfirm={handleDelete}
        title="删除小报"
        message="(･д･)确定要删除吗？此操作不可恢复。"
        confirmText="删除"
        confirmTextColor={colors.error}
      />

      <ActionListSheet
        visible={actionSheetVisible}
        onClose={() => setActionSheetVisible(false)}
        title="小报操作"
        actions={[
          { 
            label: '编辑小报↩',
            onPress: () => handleMenuAction('edit')
          },
          { 
            label: '删除小报↩',
            onPress: () => handleMenuAction('delete')
          }
        ]}
      />
    </>
  );
};

const styles = StyleSheet.create({
  newsCard: {
    width: '100%',
    backgroundColor: colors.bgWhite, 
    borderRadius: layout.borderRadius.large,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: hp(2),
    padding: wp(4),
  },
  newsContent: {
    gap: hp(1),
  },
  newsHeader: {
    marginBottom: hp(0.5),
    position: 'relative',
  },
  newsTitle: {
    fontSize: typography.size.lg,
    fontFamily: fonts.pixel,
    color: colors.textPrimary,
    lineHeight: wp(6),
  },
  newsText: {
    fontSize: typography.size.base,
    fontFamily: fonts.pixel,
    color: colors.textSecondary,
    lineHeight: wp(5),
  },
  newsImage: {
    width: '100%',
    height: hp(25),
    borderRadius: 0,
    marginVertical: hp(1),
    borderWidth: 1,
    borderColor: colors.line,
  },
  placeholderImage: {
    width: '100%',
    height: hp(25),
    borderRadius: 0,
    marginVertical: hp(1),
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#A9A9A9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#A9A9A9',
    fontFamily: fonts.pixel,
    fontSize: typography.size.base,
  },
  newsMeta: {
    marginTop: hp(0.5),
  },
  authorName: {
    fontSize: typography.size.sm,
    fontFamily: fonts.pixel,
    color: colors.textTertiary,
  },
  menuContainer: {
    position: 'absolute',
    top: 0,
    right: 0,
  },
  menuButton: {
    fontFamily: fonts.pixel,
    fontSize: typography.size.xxl,
    color: colors.textPrimary,
    paddingTop: hp(0),
    
  },
});

export default NewsCard;