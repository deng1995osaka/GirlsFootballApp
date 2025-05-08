import React, { useState } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { normalize, wp, hp } from '@utils/responsive';
import { colors, fonts, typography, layout } from '@styles/main';
import AppText from '@components/AppText';
import Svg, { Path } from 'react-native-svg';

const CornerBorder = () => {
  const radius = wp(25);
  const strokeWidth = 1;
  const size = radius + strokeWidth;

 

  const d = `
    M ${size} 0
    A ${radius} ${radius} 0 0 1 0 ${size}
  `;


  return (
    <Svg
      width={size}
      height={size}
      style={{
        position: 'absolute',
        bottom: 0,
        right: 0,
        zIndex: 10,
      }}
    >
      <Path
        d={d}
        fill="none"
        stroke={colors.line}
        strokeWidth={strokeWidth}
      />
    </Svg>
  );
};

const Star = () => {
  // 计算五角星的路径
  const size = wp(7);
  const points = 5;
  const radius = size / 2;
  const innerRadius = radius * 0.382; // 黄金分割比例
  let path = '';
  
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? radius : innerRadius;
    const angle = (i * Math.PI) / points;
    const x = radius + r * Math.sin(angle);
    const y = radius - r * Math.cos(angle);
    path += `${i === 0 ? 'M' : 'L'} ${x} ${y} `;
  }
  path += 'Z';

  return (
    <View style={styles.starContainer}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Path
          d={path}
          fill="#BEBEBE"
        />
      </Svg>
    </View>
  );
};

const PlayerCard = ({ nickname, teamName, avatarUrl, teamLogoUrl }) => {
  const [nicknameHeight, setNicknameHeight] = useState(0);
  const displayTeamName = typeof teamName === 'string' ? teamName : '暂无所属球队';

  return (
    <View style={styles.playerCard}>
      <View style={styles.cardMain}>
        <View style={styles.cardLeft}>
          <CornerBorder />
          <View style={styles.avatarContainer}>
            <Image
              source={{ uri: avatarUrl }}
              style={styles.avatarImage}
              onLoad={() => console.log('✅ 头像加载成功')}
              onError={(error) => console.error('❌ 头像加载失败:', error)}
            />
          </View>
          <Star />
        </View>
        <View 
          style={[styles.cardRight, { paddingTop: 4 }]}
          onLayout={(e) => {
            const { height } = e.nativeEvent.layout;
            setNicknameHeight(height);
          }}
        >
          {(nickname || '未设置昵称').split('').map((char, index) => {
            const isChinese = /[\u4e00-\u9fa5]/.test(char);
            return (
              <AppText
                key={index}
                style={[
                  styles.playerName,
                  isChinese ? styles.chineseChar : styles.rotatedChar,
                ]}
              >
                {char}
              </AppText>
            );
          })}
        </View>
      </View>
      <View style={styles.cardBottom}>
        <AppText style={styles.teamName}>{displayTeamName}</AppText>
        <View style={styles.teamBadge}>
          {teamLogoUrl ? (
            <Image 
              source={{ uri: teamLogoUrl }}
              style={styles.teamLogo}
              resizeMode="cover"
            />
          ) : null}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  playerCard: {
    flex: 1,
    aspectRatio: 0.667,
    backgroundColor: '#BEBEBE',
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: layout.borderRadius.medium,
    flexDirection: 'column',
    overflow: 'hidden',
  },
  cardMain: {
    flex: 1,
    flexDirection: 'row',
  },
  cardLeft: {
    width: '80%',
    backgroundColor: colors.bgWhite,
    borderTopLeftRadius: layout.borderRadius.medium,
    borderBottomRightRadius: wp(25),
    position: 'relative',
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.line,
    overflow: 'hidden',
  },
  cardRight: {
    width: '20%',
    backgroundColor: '#BEBEBE',
    alignItems: 'center',
    position: 'relative',
  },
  playerName: {
    fontSize: typography.size.xl,
    color: colors.textPrimary,
    fontFamily: fonts.pixel,
    textAlign: 'center',
  },
  chineseChar: {
    lineHeight: typography.size.xl,
  },
  rotatedChar: {
    transform: [{ rotate: '90deg' }],
    marginBottom: -13,
  },
  avatarContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
    borderTopLeftRadius: layout.borderRadius.medium - 1,
    borderBottomRightRadius: wp(25) - 1,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  starContainer: {
    position: 'absolute',
    top: hp(1),
    left: wp(2.5),
    zIndex: 1,
  },
  cardBottom: {
    height: hp(6),
    backgroundColor: '#BEBEBE',
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: wp(3.75),
    position: 'relative',
  },
  teamName: {
    fontSize: typography.size.sm,
    color: colors.textPrimary,
    fontFamily: fonts.pixel,
  },
  teamBadge: {
    position: 'absolute',
    width: wp(15),
    height: wp(15),
    backgroundColor: '#D3D3D3',
    borderRadius: wp(7.5),
    borderWidth: 1,
    borderColor: colors.line,
    right: wp(2.5),
    bottom: hp(1),
    overflow: 'hidden',
  },
  teamLogo: {
    width: '100%',
    height: '100%',
  },
});

export default PlayerCard;