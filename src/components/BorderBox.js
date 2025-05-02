import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { colors } from '@styles/main';
import { normalize, wp, hp } from '@utils/responsive';

const BorderBox = ({ children, style, iconSource }) => {
  const [imageWidth, setImageWidth] = useState(wp(8));
  const defaultHeight = wp(8);

  useEffect(() => {
    if (iconSource) {
      const resolvedSource = Image.resolveAssetSource(iconSource);
      // 如果有 width 和 height，说明是本地图片
      if (resolvedSource.width && resolvedSource.height) {
        const aspectRatio = resolvedSource.width / resolvedSource.height;
        setImageWidth(defaultHeight * aspectRatio);
      }
    }
  }, [iconSource]);

  return (
    <View style={[styles.container, style]}>
      {iconSource !== null && (
        <View style={styles.iconContainer}>
          <Image 
            source={iconSource || require('../../assets/icons/shoot.png')}
            style={[
              styles.icon,
              {
                width: imageWidth,
                height: defaultHeight
              }
            ]}
            resizeMode="contain"
          />
        </View>
      )}
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: wp(4),
    padding: wp(6),
    backgroundColor: colors.bgWhite,
  },
  iconContainer: {
    marginTop: hp(2),
    marginBottom: hp(4),
    opacity: 0.8,
  },
  icon: {
    // height 和 width 现在通过组件内部动态设置
  },
});

export default BorderBox; 