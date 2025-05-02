import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { normalize, wp, hp } from '@utils/responsive';
import { colors, fonts, typography, layout } from '@styles/main';
import AppText from '@components/AppText';
import Svg, { Path } from 'react-native-svg';

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
  console.log('🔍 PlayerCard - 接收到的 props:', {
    nickname,
    teamName,
    avatarUrl,
    teamLogoUrl
  });

  // 确保 teamName 是字符串类型
  const displayTeamName = typeof teamName === 'string' ? teamName : '暂无所属球队';

  // 检查昵称第一个字符是否为中文
  const isFirstCharChinese = nickname && /[\u4e00-\u9fa5]/.test(nickname[0]);

  // 根据第一个字符类型设置位置
  const dynamicStyle = {
    top: isFirstCharChinese ? hp(6) : hp(3),
  };

  return (
    <View style={styles.playerCard}>
      <View style={styles.cardMain}>
        <View style={styles.cardLeft}>
          <View style={styles.avatarContainer}>
            {console.log('🧾 最终头像传入的 uri:', avatarUrl)}
            <Image
              source={{ uri: avatarUrl }}
              style={styles.avatarImage}
              onLoad={() => console.log('✅ 头像加载成功')}
              onError={(error) => console.error('❌ 头像加载失败:', error)}
            />
          </View>
          <Star />
        </View>
        <View style={styles.cardRight}>
          <AppText style={[styles.playerName, dynamicStyle]} numberOfLines={1}>{nickname || '未设置昵称'}</AppText>
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
    paddingTop: hp(2),
    alignItems: 'center',
  },
  playerName: {
    fontSize: typography.size.xl,
    color: colors.textPrimary,
    transform: [{ rotate: '90deg' }],
    textAlign: 'center',
    letterSpacing: wp(0),
    fontFamily: fonts.pixel,
    width: hp(20),
    position: 'absolute',
    right: -hp(7.5),
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