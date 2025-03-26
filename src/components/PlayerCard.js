import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

import { normalize, wp, hp } from '../utils/responsive';
import { colors, fonts, typography, layout } from '../styles/main';

const PlayerCard = ({ nickname, teamName, avatarUrl, teamLogoUrl }) => {
  return (
    <View style={styles.playerCard}>
      <View style={styles.cardMain}>
        <View style={styles.cardLeft}>
          <View style={styles.avatarContainer}>
            {avatarUrl && (
              <Image 
                source={{ uri: avatarUrl }}
                style={styles.avatarImage}
                resizeMode="cover"
              />
            )}
          </View>
          <Text style={styles.starIcon}>★</Text>
        </View>
        <View style={styles.cardRight}>
          <Text style={styles.playerName}>{nickname || '未设置昵称'}</Text>
        </View>
      </View>
      <View style={styles.cardBottom}>
        <Text style={styles.teamName}>{teamName || '主队'}</Text>
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
    writingDirection: 'vertical-rl',
    textAlign: 'center',
    letterSpacing: wp(0),
    fontFamily: fonts.pixel,
  },
  avatarContainer: {
    position: 'absolute',
    top: 1,
    left: 1,
    right: 1,
    bottom: 1,
    overflow: 'hidden',
    borderTopLeftRadius: layout.borderRadius.medium - 1,
    borderBottomRightRadius: wp(25) - 1,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  starIcon: {
    position: 'absolute',
    top: hp(1),
    left: wp(2.5),
    fontSize: typography.size.xxl,
    color: '#CCCCCC',
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