import React, { useCallback, useEffect } from 'react';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View, Image, Linking } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { createStackNavigator } from '@react-navigation/stack';
import { colors, fonts, typography } from './src/styles/main';
import { TransitionPresets } from '@react-navigation/stack';
import DevMenu from './src/components/DevMenu';
import { PortalProvider } from '@gorhom/portal';
import { normalize, wp, hp } from './src/utils/responsive';

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
import WelcomeScreen from './src/screens/WelcomeScreen';
import PhoneLogin from './src/screens/PhoneLogin';

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
          fontFamily: fonts.pixel,
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
              source={focused ? require('./assets/icons/teams_active.png') : require('./assets/icons/teams.png')}
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
              source={focused ? require('./assets/icons/news_active.png') : require('./assets/icons/news.png')}
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
              source={focused ? require('./assets/icons/profile_active.png') : require('./assets/icons/profile.png')}
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

// 创建一个新组件来处理深度链接
function DeepLinkHandler() {
  const navigation = useNavigation();

  useEffect(() => {
    const handleDeepLink = async (event) => {
      const url = event?.url;
      
      if (!url) {
        return;
      }

      try {
        const handleUrl = (inputUrl) => {
          const isVerificationUrl = inputUrl.includes('auth/verify');
          
          if (isVerificationUrl) {
            setTimeout(() => {
              navigation.navigate('Login');
            }, 0);
          }
        };

        const subscription = Linking.addEventListener('url', (event) => {
          handleUrl(event.url);
        });

        const initialUrl = await Linking.getInitialURL();
        if (initialUrl) {
          handleUrl(initialUrl);
        }

        await Linking.canOpenURL('girlsfootball://auth/verify');
        await Linking.canOpenURL('exp://auth/verify');

        handleUrl(url);

        return () => {
          subscription.remove();
        };

      } catch (error) {
        // 保留空的 catch 块以维持错误处理
      }
    };

    const subscription = Linking.addEventListener('url', handleDeepLink);

    Linking.getInitialURL().then(url => {
      if (url) {
        handleDeepLink({ url });
      }
    }).catch(err => {
      // 保留空的 catch 块以维持错误处理
    });

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
        {__DEV__ && <DevMenu />}
      </View>
    </PortalProvider>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    'PixelFont': require('./assets/fonts/pixel-font.ttf'),
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <NavigationContainer onReady={onLayoutRootView}>
      <RootNavigator />
    </NavigationContainer>
  );
}