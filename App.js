import React, { useEffect, useCallback, useRef } from 'react';
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
import { supabase } from '@lib/supabase';

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

// 设置Text组件的默认字体
Text.defaultProps = Text.defaultProps || {};
Text.defaultProps.style = { 
  fontFamily: fonts.primary,  // 使用VT323作为默认字体，中文会自动回退到系统字体
  ...Text.defaultProps?.style 
};

SplashScreen.preventAutoHideAsync();

// 创建 NavigationService
const NavigationService = {
  navigationRef: null,
  setNavigationRef: (ref) => {
    NavigationService.navigationRef = ref;
  },
  navigate: (name, params) => {
    NavigationService.navigationRef?.navigate(name, params);
  },
  reset: (state) => {
    NavigationService.navigationRef?.reset(state);
  }
};

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

function RootNavigator() {
  useEffect(() => {
    console.log('🔄 设置 auth 状态监听器');
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('🔔 Auth 状态变化:', {
        event,
        userId: session?.user?.id,
        email: session?.user?.email,
        timestamp: new Date().toISOString()
      });

      if (event === 'SIGNED_IN' && session?.user) {
        console.log('✅ 用户登录成功，跳转 Tabs 页面');
        NavigationService.reset({
          index: 0,
          routes: [{ name: 'Tabs' }],
        });
      }
    });

    return () => {
      console.log('🧹 清理 auth 状态监听器');
      listener?.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const handleUrl = (url) => {
      if (url?.includes('auth/verify')) {
        NavigationService.navigate('Login');
      }
    };

    const subscription = Linking.addEventListener('url', (event) => {
      handleUrl(event.url);
    });

    Linking.getInitialURL().then((url) => {
      if (url) handleUrl(url);
    });

    return () => subscription.remove();
  }, []);

  return (
    <PortalProvider>
      <View style={{ flex: 1 }}>
        <MainNavigator />
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
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  useEffect(() => {
    if (fontError) {
      console.warn('字体加载失败:', fontError);
    }
  }, [fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <NavigationContainer ref={(ref) => NavigationService.setNavigationRef(ref)}>
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

export { NavigationService };
