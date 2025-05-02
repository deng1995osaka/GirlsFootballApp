import React, { useEffect, useCallback } from 'react';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View, Image, Linking, TouchableOpacity } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { createStackNavigator } from '@react-navigation/stack';
import { colors, fonts, typography } from './src/styles/main';
import { TransitionPresets } from '@react-navigation/stack';
import { PortalProvider } from '@gorhom/portal';
import { normalize, wp, hp } from './src/utils/responsive';
import { icons } from './src/constants/icons';
import Toast, { BaseToast } from 'react-native-toast-message';
import { toastConfig } from './src/config/toastConfig';

import TeamsScreen from './src/screens/TeamsScreen';
import NewsScreen from './src/screens/NewsScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import CreateTeamScreen from './src/screens/CreateTeamScreen';
import CreateNewsScreen from './src/screens/CreateNewsScreen';
import NewsDetailScreen from './src/screens/NewsDetailScreen';
import EditProfileScreen from './src/screens/EditProfileScreen';
import LoginScreen from './src/screens/LoginScreen';
import UniformDesignScreen from './src/screens/UniformDesignScreen';
import EmailVerificationScreen from './src/screens/EmailVerificationScreen';
import PhoneLogin from './src/screens/PhoneLogin';

// 设置Text组件的默认字体
Text.defaultProps = Text.defaultProps || {};
Text.defaultProps.style = { 
  fontFamily: fonts.primary,  // 使用VT323作为默认字体，中文会自动回退到系统字体
  ...Text.defaultProps?.style 
};

SplashScreen.preventAutoHideAsync();

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#BCBCBC',
          borderTopWidth: 1,
          borderTopColor: colors.line,
        },
        tabBarLabelStyle: {
          fontFamily: fonts.primary,  // 使用VT323像素字体
          fontSize: typography.size.xs,
          zIndex: 2
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: '#454545',
      }}
    >
      <Tab.Screen 
        name="Teams" 
        component={TeamsScreen}
        options={{
          title: '球队',
          tabBarIcon: ({ focused }) => (
            <Image 
              source={focused ? icons.tabBar.teams.active : icons.tabBar.teams.inactive}
              style={{ width: wp(7.5), height: hp(3) }}
            />
          ),
          tabBarActiveTintColor: colors.textPrimary,
        }}
      />
      <Tab.Screen 
        name="News" 
        component={NewsScreen}
        options={{
          title: '球星小报',
          tabBarIcon: ({ focused }) => (
            <Image 
              source={focused ? icons.tabBar.news.active : icons.tabBar.news.inactive}
              style={{ width: 30, height: 24 }}
            />
          ),
          tabBarActiveTintColor: colors.textPrimary,
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          title: '我的空间',
          tabBarIcon: ({ focused }) => (
            <Image 
              source={focused ? icons.tabBar.profile.active : icons.tabBar.profile.inactive}
              style={{ width: 30, height: 24 }}
            />
          ),
          tabBarActiveTintColor: colors.textPrimary,
        }}
      />
    </Tab.Navigator>
  );
}

function MainNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Tabs"
      screenOptions={{
        headerShown: false
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="PhoneLogin" component={PhoneLogin} />
      <Stack.Screen name="EmailVerification" component={EmailVerificationScreen} />
      <Stack.Screen name="Tabs" component={TabNavigator} />
      <Stack.Screen name="CreateTeam" component={CreateTeamScreen} />
      <Stack.Screen name="NewsCreate" component={CreateNewsScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen 
        name="NewsDetail" 
        component={NewsDetailScreen}
        options={{ 
          ...TransitionPresets.SlideFromRightIOS
        }}
      />
      <Stack.Screen name="UniformDesign" component={UniformDesignScreen} />
    </Stack.Navigator>
  );
}

function DeepLinkHandler() {
  const navigation = useNavigation();

  useEffect(() => {
    const handleDeepLink = async (event) => {
      const url = event?.url;
      if (!url) return;

      try {
        const handleUrl = (inputUrl) => {
          if (inputUrl.includes('auth/verify')) {
            setTimeout(() => navigation.navigate('Login'), 0);
          }
        };

        const subscription = Linking.addEventListener('url', (event) => {
          handleUrl(event.url);
        });

        const initialUrl = await Linking.getInitialURL();
        if (initialUrl) handleUrl(initialUrl);

        await Linking.canOpenURL('girlsfootball://auth/verify');
        await Linking.canOpenURL('exp://auth/verify');

        handleUrl(url);

        return () => {
          subscription.remove();
        };
      } catch (error) {
        // 留空处理
      }
    };

    const subscription = Linking.addEventListener('url', handleDeepLink);

    Linking.getInitialURL().then((url) => {
      if (url) handleDeepLink({ url });
    }).catch(() => {});

    return () => {
      subscription.remove();
    };
  }, [navigation]);

  return null;
}

function RootNavigator() {
  return (
    <PortalProvider>
      <View style={{ flex: 1 }}>
        <MainNavigator />
        <DeepLinkHandler />
      </View>
    </PortalProvider>
  );
}

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    'VT323-Regular': require('./assets/fonts/VT323-Regular.ttf'),
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded || fontError) {
      // 字体加载完成或出错时，隐藏启动屏幕
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  useEffect(() => {
    // 如果字体加载出错，打印错误信息
    if (fontError) {
      console.warn('字体加载失败:', fontError);
    }
  }, [fontError]);

  // 如果字体未加载完成且没有错误，保持显示启动屏幕
  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <NavigationContainer>
      <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
        <RootNavigator />
      </View>
      <Toast 
        config={toastConfig} 
        topOffset={hp(4)}
        visibilityTime={2000}
      />
    </NavigationContainer>
  );
}
