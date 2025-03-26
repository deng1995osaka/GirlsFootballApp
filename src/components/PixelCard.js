import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { normalize, wp, hp } from '../utils/responsive';
import { colors, fonts, typography, layout } from '../styles/main';

const PixelCard = ({ playerData }) => {
  const {
    nickname = '球员昵称',
    number = '23',
    positions = []
  } = playerData || {};

  // 确保 positions 是有效的数字数组，过滤掉无效值
  const safePositions = Array.isArray(positions) 
    ? positions
        .map(pos => parseInt(pos, 10))
        .filter(pos => !isNaN(pos) && pos >= 0 && pos <= 10)
    : [];

  // 2. 位置映射表，用于验证位置的有效性
  const POSITION_MAP = {
    0: '门将',
    1: '左后卫',
    2: '左中后卫',
    3: '右中后卫',
    4: '右后卫',
    5: '左中场',
    6: '防守型中场',
    7: '右中场',
    8: '左前锋',
    9: '中锋',
    10: '右前锋'
  };

  // 3. 解析位置的辅助函数
  const getPositionNumber = (rowIndex, colIndex) => {
    try {
      const row = fieldLayout[rowIndex];
      if (!row) return null;

      const char = row[colIndex];
      if (char !== 'p') return null;

      const posNumber = parseInt(row[colIndex + 1], 10);
      return !isNaN(posNumber) && POSITION_MAP.hasOwnProperty(posNumber) 
        ? posNumber 
        : null;
    } catch (error) {
      console.error('Position parsing error:', error);
      return null;
    }
  };

  // 球场布局数据
  const fieldLayout = [
    " llllllllllllllllllllllllllll ",
    "l             l              l",
    "l             l     p8       l",    // 左前锋
    "l      p1     l              l",    // 左后卫
    "llll          p6          llll",    // 防守型中场
    "l   l       lllll        l   l",
    "l   l p2   l  l  l       l   l",    // 左中后卫
    "l   l      l  l  l       l   l",
    "l p0l      p5 l  l     p9l   l",    // 门将、左中场、中锋
    "l   l      l  l  l       l   l",
    "l   l p3   l  l  l       l   l",    // 右中后卫
    "l   l       lllll        l   l",
    "llll          p7          llll",    // 右中场
    "l      p4     l              l",    // 右后卫
    "l             l     p10      l",    // 右前锋
    "l             l              l",
    " llllllllllllllllllllllllllll "
  ];

  const renderFieldPixel = (char, index) => {
    try {
      if (char === 'l') {
        return <View key={index} style={styles.linePixel} />;
      } 
      
      if (char === 'p') {
        const rowIndex = Math.floor(index / 29);
        const colIndex = index % 29;
        
        // 4. 使用辅助函数获取位置编号
        const posNumber = getPositionNumber(rowIndex, colIndex);
        
        // 如果位置无效，返回空像素
        if (posNumber === null) {
          return <View key={index} style={styles.emptyPixel} />;
        }

        // 检查位置是否被选中
        const isSelected = safePositions.includes(posNumber);

        return (
          <View 
            key={index} 
            style={[
              styles.positionPixel,
              isSelected && styles.selectedPosition
            ]} 
          />
        );
      }

      return <View key={index} style={styles.emptyPixel} />;
    } catch (error) {
      console.error('Pixel rendering error:', error);
      return <View key={index} style={styles.emptyPixel} />;
    }
  };

  // 5. 添加完整的错误边界和状态检查
  try {
    if (!fieldLayout || !Array.isArray(fieldLayout) || fieldLayout.length === 0) {
      throw new Error('Invalid field layout');
    }

    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.playerNumber}>{number}</Text>
          <Text style={styles.playerName}>{nickname}</Text>
          
          <View style={styles.fieldDiagram}>
            {fieldLayout.map((row, rowIndex) => (
              <View key={rowIndex} style={styles.fieldRow}>
                {Array.from(row).map((char, colIndex) => 
                  renderFieldPixel(char, rowIndex * 29 + colIndex)
                )}
              </View>
            ))}
          </View>
        </View>
      </View>
    );
  } catch (error) {
    console.error('PixelCard render error:', error);
    return (
      <View style={[styles.container, styles.errorContainer]}>
        <Text style={styles.errorText}>显示出现问题</Text>
      </View>
    );
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    aspectRatio: 0.667,
    backgroundColor: colors.bgWhite,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: layout.borderRadius.medium,
    padding: wp(2.5),
   
  },
  content: {
    flex: 1,
    alignItems: 'center',
    marginTop: hp(3),
  },
  playerNumber: {
    fontSize: normalize(70),
    color: colors.textPrimary,
    marginBottom: hp(0),
    fontFamily: fonts.pixel,
  },
  playerName: {
    fontSize: typography.size.base,
    color: colors.textPrimary,
    marginBottom: hp(3),
    fontFamily: fonts.pixel,
  },
  fieldDiagram: {
    width: '100%',
    aspectRatio: 29/17,
    marginTop: hp(0),
    marginBottom: hp(5),
  },
  fieldRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  emptyPixel: {
    width: wp(0.75),
    height: wp(0.75),
    margin: wp(0.125),
  },
  linePixel: {
    width: wp(0.75),
    height: wp(0.75),
    margin: wp(0.125),
    
    backgroundColor: '#BBBCBA',
  },
  positionPixel: {
    width: wp(0.75),
    height: wp(0.75),
    margin: wp(0.125),
    
    backgroundColor: colors.textPrimary,
    
  },
  selectedPosition: {
    backgroundColor: '#FF1519',
  },
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: typography.size.base,
    color: colors.textPrimary,
    fontFamily: fonts.pixel,
  },
});

export default PixelCard;