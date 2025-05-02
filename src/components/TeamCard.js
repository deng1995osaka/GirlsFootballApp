import React, { useState, useRef } from 'react';
import { View, StyleSheet, Image, TouchableOpacity, Alert } from 'react-native';
import AppText from '@components/AppText';
import { normalize, wp, hp } from '@utils/responsive';
import { colors, fonts, typography, layout } from '@styles/main';
import { supabase } from '@lib/supabase';
import VerificationSuccessSheet from '@components/VerificationSuccessSheet';
import ActionListSheet from '@components/ActionListSheet';
import Svg, { Rect, Pattern, Defs } from 'react-native-svg';


// InfoGroup 组件定义
const InfoGroup = ({ label, value }) => (
  <View style={styles.infoGroup}>
    <AppText style={styles.label}>{label}</AppText>
    <View style={styles.separator} />
    <AppText style={styles.value}>{value || '-'}</AppText>
  </View>
);

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

const UniformRenderer = ({ pixels }) => {
  if (!pixels) return null;

  const pixelSize = 1;
  const SHIRT_HEIGHT = SHIRT_PATTERN.length;
  const SHIRT_WIDTH = SHIRT_PATTERN[0].length;

  const MARGIN_TOP = 2;
  const MARGIN_BOTTOM = 2;
  const MARGIN_LEFT = 1;
  const MARGIN_RIGHT = 1;

  const isInsideShirt = (row, col) => {
    if (row === 5) return true;
    if (SHIRT_PATTERN[row][col] === 1) return false;
    
    let crossings = 0;
    for (let i = 0; i <= col; i++) {
      if (SHIRT_PATTERN[row][i] === 1) crossings++;
    }
    return crossings % 2 === 1;
  };

  return (
    <View style={[styles.jerseyBox, { width: (SHIRT_WIDTH + MARGIN_LEFT + MARGIN_RIGHT) * pixelSize }]}>
      <Svg
        width="100%"
        height="100%"
        style={{ flex: 1 }}
        viewBox={`${-MARGIN_LEFT + 1} ${-MARGIN_TOP} ${SHIRT_WIDTH + MARGIN_LEFT + MARGIN_RIGHT} ${SHIRT_HEIGHT + MARGIN_TOP + MARGIN_BOTTOM}`}

        preserveAspectRatio="xMidYMin meet"
      >
        <Defs>
          <Pattern id="checkerboard" width="2" height="2" patternUnits="userSpaceOnUse">
            <Rect x="0" y="0" width="1" height="1" fill="#FFFFFF" />
            <Rect x="1" y="0" width="1" height="1" fill="#C2C2C2" />
            <Rect x="0" y="1" width="1" height="1" fill="#C2C2C2" />
            <Rect x="1" y="1" width="1" height="1" fill="#FFFFFF" />
          </Pattern>
        </Defs>

        {/* 背景方格 */}
        <Rect 
          x={-MARGIN_LEFT + 1}
          y={-MARGIN_TOP}
          width={SHIRT_WIDTH + MARGIN_LEFT + MARGIN_RIGHT}
          height={SHIRT_HEIGHT + MARGIN_TOP + MARGIN_BOTTOM}
          fill="url(#checkerboard)"
        />

        {/* 渲染所有像素 */}
        {pixels.map((row, i) => 
          row.map((color, j) => (
            <Rect
              key={`pixel-${i}-${j}`}
              x={(j + MARGIN_LEFT) * pixelSize}
              y={i * pixelSize}
              width={pixelSize}
              height={pixelSize}
              fill={(!isInsideShirt(i, j) && SHIRT_PATTERN[i][j] !== 1) ? 'url(#checkerboard)' : (color || '#F5F4E2')}
            />
          ))
        )}

        {/* 衣服轮廓 */}
        {SHIRT_PATTERN.map((row, i) => 
          row.map((cell, j) => (
            cell === 1 && (
              <Rect
                key={`outline-${i}-${j}`}
                x={(j + MARGIN_LEFT) * pixelSize}
                y={i * pixelSize}
                width={pixelSize}
                height={pixelSize}
                fill="#565752"
              />
            )
          ))
        )}
      </Svg>
    </View>
  );
};

const TeamCard = ({ team, showMenuButton, navigation, onDelete }) => {
  const [sheetVisible, setSheetVisible] = useState(false);
  const [actionSheetVisible, setActionSheetVisible] = useState(false);
  const buttonRef = useRef(null);
  
  // 解析 uniform_pixels
  let parsedUniformPixels = null;
  try {
    if (team.uniform_pixels) {
      parsedUniformPixels = JSON.parse(team.uniform_pixels);
    }
  } catch (error) {
    console.error("TeamCard - uniform_pixels 解析失败:", error);
  }

  const handleMenuAction = (action) => {
    if (action === 'edit') {
      navigation.navigate('CreateTeam', {
        teamData: team,
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
        .from('teams')
        .delete()
        .eq('team_id', team.team_id);

      if (error) throw error;
      
      console.log("删除成功");
      if (onDelete) onDelete();
    } catch (error) {
      console.error('删除失败:', error);
      Alert.alert('错误', '删除失败，请重试');
    }
    setSheetVisible(false);
  };

  const handleShowMenu = () => {
    setActionSheetVisible(true);
  };

  const contactDisplay = team.contact ? `${team.platform}@${team.contact}` : '-';
  const trainingCount = team.training_count || 0;
  const matchCount = team.match_count || 0;

  return (
    <>
      <View style={styles.card}>
        <View style={[
          styles.leftStrip,
          team.team_color && { backgroundColor: team.team_color }
        ]} />
        <View style={styles.content}>
          {showMenuButton && (
            <View style={styles.menuContainer}>
              <TouchableOpacity
                ref={buttonRef}
                onPress={handleShowMenu}
              >
                <AppText style={styles.menuButtonText}>≡</AppText>
              </TouchableOpacity>
            </View>
          )}
          <View style={styles.headerSection}>
            <View style={styles.headerContent}>
              {parsedUniformPixels && (
                <UniformRenderer 
                  pixels={parsedUniformPixels.pixels}
                />
              )}
              <View style={styles.logoSection}>
                {team.logo_url ? (
                  <Image 
                    source={{ 
                      uri: team.logo_url
                    }}
                    style={styles.logoBox}
                    resizeMode="cover"
                    onError={(error) => {
                      console.log("图片加载错误:", error.nativeEvent.error);
                    }}
                  />
                ) : (
                  <View style={styles.logoBox} />
                )}
                <AppText style={styles.teamName}>{team.name}</AppText>
              </View>
            </View>
          </View>

          <View style={styles.infoRow}>
            <InfoGroup label="Location" value={team.city} />
            <InfoGroup label="Started From" value={team.established} />
          </View>

          <InfoGroup 
            label="Contact us" 
            value={contactDisplay}
          />

          <InfoGroup label="Court" value={team.court} />
          <InfoGroup 
            label="Rules/Introductions" 
            value={team.rules} 
          />

          <View>
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Image 
                  source={require('../../assets/icons/ball.png')}
                  style={styles.statIcon}
                />
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <AppText style={styles.statText}>{trainingCount}</AppText>
                  <AppText 
                    style={styles.statText}
                    onLayout={() => {
                      console.log('次训练 style:', styles.statText);
                      console.log('次训练 fontFamily:', styles.statText.fontFamily);
                    }}
                  >
                    次训练
                  </AppText>
                </View>
              </View>
              <View style={styles.statItem}>
                <Image 
                  source={require('../../assets/icons/field.png')}
                  style={styles.statIcon}
                />
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <AppText style={styles.statText}>{matchCount}</AppText>
                  <AppText style={styles.statText}>场约赛</AppText>
                </View>
              </View>
            </View>
            <AppText style={styles.yearNote}>*2024年度</AppText>
          </View>
        </View>
      </View>

      <VerificationSuccessSheet
        visible={sheetVisible}
        onClose={() => setSheetVisible(false)}
        onConfirm={handleDelete}
        title="删除球队"
        message="(･д･)确定要删除吗？此操作不可恢复。"
        confirmText="删除"
        confirmTextColor={colors.error}
      />

      <ActionListSheet
        visible={actionSheetVisible}
        onClose={() => setActionSheetVisible(false)}
        title="球队操作"
        actions={[
          { 
            label: '编辑球队↩',
            onPress: () => handleMenuAction('edit')
          },
          { 
            label: '删除球队↩',
            onPress: () => handleMenuAction('delete')
          }
        ]}
      />
    </>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: colors.bgWhite,
    borderRadius: layout.borderRadius.large,
    borderWidth: 1,
    borderColor: colors.line,
    marginBottom: hp(2),
    overflow: 'hidden',
  },
  leftStrip: {
    width: wp(8),
    backgroundColor: colors.primary,
    alignSelf: 'stretch',
  },
  content: {
    flex: 1,
    padding: wp(4.5),
    minHeight: 250,
  },
  headerSection: {
    minHeight: hp(20),
    marginBottom: hp(1.5),
    justifyContent: 'center',
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  jerseyBox: {
    flex: 1,
    width: '50%',
    aspectRatio: (SHIRT_PATTERN[0].length + 2) / (SHIRT_PATTERN.length + 4),
    borderWidth: 1,
    borderColor: colors.line,
  },
  logoSection: {
    
    alignItems: 'center',
    width: '50%',
    
  },
  logoBox: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.line,
    marginBottom: hp(1),
    backgroundColor: '#f5f5f5',
    width: wp(20),  // 直接设置大小，而不是缩放
    height: wp(20), // 保持宽高一致
   
  },
  teamName: {
    fontSize: typography.size.xl,
    color: colors.textPrimary,
    fontFamily: fonts.pixel,
    textAlign: 'center',
  },
  infoGroup: {
    flex: 1,
    marginBottom: hp(1.5),
  },
  label: {
    fontSize: typography.size.xs,
    color: colors.textSecondary,
    marginBottom: hp(0.5),
    fontFamily: fonts.pixel,
  },
  separator: {
    height: 1,
    backgroundColor: colors.line,
    marginBottom: hp(0.5),
  },
  value: {
    fontSize: typography.size.base,
    color: colors.textPrimary,
    fontFamily: fonts.pixel,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: wp(4),
    marginBottom: hp(0),
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: hp(1.5),
    marginBottom: hp(0),
  },
  statItem: {
    alignItems: 'center',
  },
  statIcon: {
    width: wp(20),
    height: wp(20) * 0.6,
    marginBottom: hp(1),
  },
  statText: {
    fontSize: typography.size.sm,
    color: colors.textPrimary,
  },
  yearNote: {
    fontSize: typography.size.xs,
    color: colors.textLight,
    textAlign: 'right',
    fontFamily: fonts.pixel,
    marginTop: hp(1),
  },
  menuContainer: {
    position: 'absolute',
    top: hp(1.9),
    right: wp(4),
    zIndex: 1,
  },
  menuButtonText: {
    fontFamily: fonts.pixel,
    fontSize: typography.size.xxl,
    color: colors.textPrimary,
  },
  emptyJerseyBox: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f8f8f8',
  },
});

export default TeamCard;
