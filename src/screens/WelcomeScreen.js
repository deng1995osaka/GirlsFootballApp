import React, { useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { colors, fonts, typography } from '../styles/main';
import { wp, hp } from '../utils/responsive';
import Background from '../components/Background';
import BorderBox from '../components/BorderBox';
import PixelButton from '../components/PixelButton';
import { supabase } from '../lib/supabase';
import Header from '../components/Header';

const WelcomeScreen = ({ navigation }) => {
  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      navigation.replace('Tabs');
    }
  };

  return (
    <Background>
      <SafeAreaView style={styles.container}>
        <Header 
          title="★我的空间★"
          showAddButton={false}
          showBackButton={false}
        />
        
        <ScrollView style={styles.scrollView}>
          <BorderBox style={styles.contentBox}>
            <Text style={styles.text}>还没有你的球员档案，快来创建吧！</Text>
            
            <View style={styles.featureList}>
              <Text style={styles.feature}>☞ 创建自己的球员档案</Text>
              <Text style={styles.feature}>☞ 加入球队</Text>
              <Text style={styles.feature}>☞ 发布球星小报</Text>
            </View>

            <PixelButton
              title="登录/注册"
              onPress={() => navigation.navigate('Login')}
              style={styles.loginButton}
            />
          </BorderBox>
        </ScrollView>
      </SafeAreaView>
    </Background>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
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
  text: {
    fontFamily: fonts.pixel,
    fontSize: typography.size.l,
    color: colors.text,
    textAlign: 'left',
    marginBottom: hp(4),
    width: '100%',
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

export default WelcomeScreen; 