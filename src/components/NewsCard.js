import React, { useState, useRef } from 'react';
import { View, TouchableOpacity, Image, Text, StyleSheet, Alert } from 'react-native';

import { wp, hp } from '../utils/responsive';
import { colors, fonts, typography, layout } from '../styles/main';
import DropdownMenu from './DropdownMenu';
import { supabase } from '../lib/supabase';
import ConfirmModal from './ConfirmModal';

const NewsCard = ({ item, onPress, showMenuButton = false, navigation, onDelete }) => {
  const [imageError, setImageError] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const buttonRef = useRef(null);

  const menuOptions = [
    { id: 'edit', label: '编辑' },
    { id: 'delete', label: '删除', danger: true }
  ];

  const handleMenuAction = (action) => {
    console.log("执行操作:", action);
    setMenuVisible(false);
    
    if (action === 'edit') {
      console.log("跳转到 NewsCreate");
      navigation.navigate('NewsCreate', {
        newsData: item,
        isEditing: true
      });
    } else if (action === 'delete') {
      setDeleteModalVisible(true);
    }
  };

  const handleDelete = async () => {
    try {
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
    setDeleteModalVisible(false);
  };

  const handleShowMenu = () => {
    buttonRef.current?.measure((x, y, width, height, pageX, pageY) => {
      setMenuAnchor({
        x: pageX,
        y: pageY,
        width,
        height,
      });
      setMenuVisible(true);
    });
  };

  return (
    <>
      <TouchableOpacity 
        style={styles.newsCard}
        onPress={onPress}
      >
        <View style={styles.newsContent}>
          <View style={styles.newsHeader}>
            <Text style={styles.newsTitle} numberOfLines={2}>
              {item.title}
            </Text>
            {showMenuButton && (
              <View style={styles.menuContainer}>
                <TouchableOpacity
                  ref={buttonRef}
                  onPress={handleShowMenu}
                >
                  <Text style={styles.menuButton}>≣</Text>
                </TouchableOpacity>
                
                <DropdownMenu
                  visible={menuVisible}
                  onSelect={(value) => {
                    setMenuVisible(false);
                    if (value) handleMenuAction(value);
                  }}
                  items={menuOptions}
                  anchor={menuAnchor}
                  edgeDistance={wp(5)}
                />
              </View>
            )}
          </View>
          <Text style={styles.newsText} numberOfLines={2}>
            {item.summary || item.content}
          </Text>
          {(!item.image_url || imageError) ? (
            <View style={styles.placeholderImage}>
              <Text style={styles.placeholderText}>◇ 图片未加载 ◇</Text>
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
            <Text style={styles.authorName}>
              ◈{item.profiles?.nickname || '匿名'}◈
            </Text>
          </View>
        </View>
      </TouchableOpacity>

      <ConfirmModal
        isVisible={deleteModalVisible}
        onClose={() => setDeleteModalVisible(false)}
        onConfirm={handleDelete}
        message="确定要删除这条小报吗？"
        confirmText="删除"
        isDanger={true}
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