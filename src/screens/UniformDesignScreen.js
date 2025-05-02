import React, { useState, useRef, useCallback } from 'react';
import {
  SafeAreaView,
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
  Image,
  ActivityIndicator,
  Share
} from 'react-native';
import { SafeAreaView as SafeAreaViewSafe } from 'react-native-safe-area-context';
import { colors, typography, fonts } from '@styles/main';
import { normalize, wp, hp } from '@utils/responsive';
import { commonScreenStyles } from '@styles/screenStyles';
import ViewShot from 'react-native-view-shot';
import Svg, { Rect } from 'react-native-svg';
import AppText from '@components/AppText';
import UniformRenderer from '@components/UniformRenderer';
import { supabase } from '@lib/supabase';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import { captureRef } from 'react-native-view-shot';

const GRID_SIZE = 14;
const SHIRT_PATTERN = [
  [0,0,0,1,1,0,0,0,0,1,1,0,0,0],
  [0,0,1,0,0,1,1,1,1,0,0,1,0,0],
  [0,1,0,0,0,0,0,0,0,0,0,0,1,0],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,1,0,0,0,0,0,0,1,0,0,1],
  [0,1,1,1,0,0,0,0,0,0,1,1,1,0],
  [0,0,0,1,0,0,0,0,0,0,1,0,0,0],
  [0,0,0,1,0,0,0,0,0,0,1,0,0,0],
  [0,0,0,1,0,0,0,0,0,0,1,0,0,0],
  [0,0,0,1,0,0,0,0,0,0,1,0,0,0],
  [0,0,0,1,0,0,0,0,0,0,1,0,0,0],
  [0,0,0,1,0,0,0,0,0,0,1,0,0,0],
  [0,0,0,0,1,1,1,1,1,1,0,0,0,0]
];

const COLOR_PALETTE = [
  '#528715', '#76B232', '#F9B401', '#00FF00', '#0000FF',
  '#4B0082', '#9400D3', '#FF1493', '#565752', '#000000',
  '#F5F4E2', '#808080',
];

const Pixel = React.memo(({ x, y, size, color, onPress, disabled }) => (
  <Rect
    x={x}
    y={y}
    width={size}
    height={size}
    fill={color}
    stroke="#eee"
    strokeWidth={0.5}
    onPress={disabled ? undefined : onPress}
  />
));

export default function UniformDesignScreen({ navigation, route }) {
  const [selectedColor, setSelectedColor] = useState(COLOR_PALETTE[0]);
  const [colorPalette, setColorPalette] = useState(() => {
    // 获取传入的球队主题色
    const teamColor = route.params?.teamColor;
    // 如果传入的颜色合法且不在现有调色板中，则添加到最前面
    if (teamColor && /^#[0-9A-Fa-f]{6}$/.test(teamColor) && !COLOR_PALETTE.includes(teamColor)) {
      return [teamColor, ...COLOR_PALETTE].slice(0, 20); // 限制总数不超过20个
    }
    return COLOR_PALETTE;
  });
  const [pixelColors, setPixelColors] = useState(
    Array(GRID_SIZE).fill().map((_, i) => 
      Array(GRID_SIZE).fill().map((_, j) => 
        SHIRT_PATTERN[i][j] === 1 ? '#565752' : '#F5F4E2'
      )
    )
  );
  const viewShotRef = useRef();

  const isInsideShirt = (row, col) => {
    if (SHIRT_PATTERN[row][col] === 1) return false;
    
    if (row === 5 && col >= 4 && col <= 9) return true;
    
    let crossings = 0;
    for (let i = 0; i <= col; i++) {
      if (SHIRT_PATTERN[row][i] === 1) crossings++;
    }
    
    return crossings % 2 === 1;
  };

  const handlePixelPress = useCallback((row, col) => {
    if (!isInsideShirt(row, col) && SHIRT_PATTERN[row][col] !== 1) return;

    setPixelColors(prev => {
      const newColors = [...prev];
      newColors[row] = [
        ...newColors[row].slice(0, col),
        newColors[row][col] === selectedColor ? (SHIRT_PATTERN[row][col] === 1 ? '#000000' : '#F5F4E2') : selectedColor,
        ...newColors[row].slice(col + 1)
      ];
      return newColors;
    });
  }, [selectedColor]);

  const generateUniformImage = (pixels, width, height) => {
    // 创建一个canvas元素
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    
    // 绘制像素
    pixels.forEach((row, i) => {
      row.forEach((color, j) => {
        if (color) {
          ctx.fillStyle = color;
          ctx.fillRect(j, i, 1, 1);
        }
      });
    });
    
    // 转换为base64
    return canvas.toDataURL('image/png');
  };

  const handleSave = () => {
    console.log('保存队服数据:', pixelColors);
    
    const uniformData = {
      pixels: pixelColors,
      width: GRID_SIZE,
      height: GRID_SIZE
    };
    
    console.log('准备传递的队服数据:', uniformData);
    
    // 使用回调函数传递数据
    if (route.params?.onUniformSave) {
      route.params.onUniformSave(uniformData);
    }
    
    navigation.goBack();
  };

  const renderGrid = useCallback(() => {
    const pixelSize = 100 / GRID_SIZE;
    
    return (
      <Svg 
        style={styles.grid} 
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid meet"
      >
        {SHIRT_PATTERN.map((row, rowIndex) => (
          row.map((cell, colIndex) => {
            if (cell === 1 || isInsideShirt(rowIndex, colIndex)) {
              const color = pixelColors[rowIndex][colIndex];
              return (
                <Pixel
                  key={`${rowIndex}-${colIndex}`}
                  x={colIndex * pixelSize}
                  y={rowIndex * pixelSize}
                  size={pixelSize}
                  color={color}
                  onPress={() => handlePixelPress(rowIndex, colIndex)}
                  disabled={!isInsideShirt(rowIndex, colIndex) && SHIRT_PATTERN[rowIndex][colIndex] !== 1}
                />
              );
            }
            return null;
          })
        ))}
      </Svg>
    );
  }, [pixelColors, handlePixelPress]);

  return (
    <SafeAreaViewSafe style={commonScreenStyles.container}>
      <View style={commonScreenStyles.headerContainer}>
        <TouchableOpacity 
          style={commonScreenStyles.backButton}
          onPress={() => navigation.goBack()}
        >
          <AppText style={commonScreenStyles.backButtonText}>←</AppText>
        </TouchableOpacity>
        <AppText style={commonScreenStyles.headerTitle}>生成队服</AppText>
      </View>

      <ScrollView style={styles.content}>
        <ViewShot ref={viewShotRef} style={styles.editorContainer}>
          {renderGrid()}
        </ViewShot>

        <View style={styles.colorPicker}>
          {colorPalette.map((color, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.colorOption,
                { backgroundColor: color },
                selectedColor === color && styles.selectedColor
              ]}
              onPress={() => setSelectedColor(color)}
            />
          ))}
        </View>
      </ScrollView>

      <View style={commonScreenStyles.submitContainer}>
        <TouchableOpacity
          style={commonScreenStyles.submitButton}
          onPress={handleSave}
        >
          <AppText style={commonScreenStyles.submitButtonText}>保存队服</AppText>
        </TouchableOpacity>
      </View>
    </SafeAreaViewSafe>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    padding: wp(4),
  },
  editorContainer: {
    aspectRatio: 1,
    backgroundColor: '#f8f8f8',
    padding: wp(2),
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  grid: {
    flex: 1,
    aspectRatio: 1,
  },
  colorPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: wp(2),
    marginTop: hp(2),
    padding: wp(2),
  },
  colorOption: {
    width: wp(8),
    height: wp(8),
    borderRadius: wp(4),
    borderWidth: 1,
    borderColor: '#ddd',
  },
  selectedColor: {
    borderWidth: 2,
    borderColor: '#333',
  },
}); 