import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, fonts, typography } from '../styles/main';
import { wp, hp } from '../utils/responsive';
import BorderBox from './BorderBox';
import PixelButton from './PixelButton';

const GuestView = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <BorderBox 
        style={styles.contentBox}
        iconSource={require('../../assets/icons/kickoff.png')}
      >
        <View>
          <Text style={styles.title}>还没有你的 PLAYER 档案，</Text>
          <Text style={[styles.title, styles.secondLine]}>快来创建吧！</Text>
        </View>
        
        <View style={styles.featureList}>
          <Text style={styles.feature}>☞ 创建自己的 PLAYER 档案</Text>
          <Text style={styles.feature}>☞ 加入球队</Text>
          <Text style={styles.feature}>☞ 发布球星小报</Text>
        </View>

        <PixelButton
          title="登录/注册"
          onPress={() => navigation.navigate('Login')}
          style={styles.loginButton}
        />
      </BorderBox>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: wp(5),
    paddingTop: hp(5),
  },
  contentBox: {
    alignItems: 'flex-start',
    marginTop: hp(4),
    width: '100%',
    marginBottom: hp(4),
  },
  title: {
    fontFamily: fonts.pixel,
    fontSize: typography.size.xl,
    color: colors.text,
    textAlign: 'left',
    width: '100%',
  },
  secondLine: {
    marginBottom: hp(4),
  },
  featureList: {
    width: '100%',
    marginBottom: hp(6),
  },
  feature: {
    fontFamily: fonts.pixel,
    fontSize: typography.size.m,
    color: colors.text,
    marginBottom: hp(2),
  },
  loginButton: {
    width: '55%',
    alignSelf: 'flex-start',
  }
});

export default GuestView;