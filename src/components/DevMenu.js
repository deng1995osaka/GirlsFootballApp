import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Alert,
  DevSettings
} from 'react-native';
import { supabase } from '../lib/supabase';
import { useNavigation } from '@react-navigation/native';

const DevMenu = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [authStatus, setAuthStatus] = useState(null);
  const navigation = useNavigation();

  // 检查认证状态
  const checkAuth = async () => {
    const { data: { session }, error } = await supabase.auth.getSession();
    setAuthStatus({
      isLoggedIn: !!session,
      user: session?.user,
      error
    });
    Alert.alert('认证状态', session ? '已登录' : '未登录');
  };

  // 快速登录
  const quickLogin = async () => {
    try {
      // 先检查是否已登录
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        Alert.alert('提示', '已经登录');
        return;
      }

      // 直接导航到 Login 页面
      navigation.navigate('Login');  // 修改这里，直接导航到 Login
      setIsVisible(false);  // 关闭开发菜单
    } catch (error) {
      console.error('登录错误:', error);
      Alert.alert('错误', error.message);
    }
  };

  // 退出登录
  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      Alert.alert('错误', error.message);
    } else {
      Alert.alert('成功', '已退出登录');
      checkAuth();
    }
  };

  // 清除所有数据
  const clearAllData = async () => {
    try {
      await supabase.auth.signOut();
      // 这里可以添加清除 AsyncStorage 等其他存储的代码
      Alert.alert('成功', '所有数据已清除');
    } catch (error) {
      Alert.alert('错误', error.message);
    }
  };

  // 触发开发者菜单
  const showDevMenu = () => {
    if (__DEV__) {
      // 在开发模式下，显示我们的自定义菜单
      setIsVisible(true);
    }
  };

  return (
    <>
      {/* 修改触发按钮，点击时显示我们的菜单 */}
      <TouchableOpacity
        style={styles.triggerButton}
        onPress={showDevMenu}
      >
        <Text style={styles.triggerText}>🛠️</Text>
      </TouchableOpacity>

      {/* 开发菜单模态框 */}
      <Modal
        visible={isVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.menuContainer}>
            <Text style={styles.title}>开发者菜单</Text>
            
            <ScrollView>
              {/* 认证相关 */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>认证</Text>
                <TouchableOpacity style={styles.button} onPress={checkAuth}>
                  <Text style={styles.buttonText}>检查登录状态</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={quickLogin}>
                  <Text style={styles.buttonText}>快速登录测试账号</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={logout}>
                  <Text style={styles.buttonText}>退出登录</Text>
                </TouchableOpacity>
              </View>

              {/* 数据相关 */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>数据</Text>
                <TouchableOpacity style={styles.button} onPress={clearAllData}>
                  <Text style={styles.buttonText}>清除所有数据</Text>
                </TouchableOpacity>
              </View>

              {/* 显示当前状态 */}
              {authStatus && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>当前状态</Text>
                  <Text>登录状态: {authStatus.isLoggedIn ? '已登录' : '未登录'}</Text>
                  {authStatus.user && (
                    <Text>用户邮箱: {authStatus.user.email}</Text>
                  )}
                </View>
              )}
            </ScrollView>

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setIsVisible(false)}
            >
              <Text style={styles.closeButtonText}>关闭</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  triggerButton: {
    position: 'absolute',
    right: 20,
    top: 40,
    backgroundColor: 'rgba(0,0,0,0.1)',
    padding: 10,
    borderRadius: 20,
    zIndex: 999,
  },
  triggerText: {
    fontSize: 20,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuContainer: {
    width: '80%',
    maxHeight: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 5,
    marginVertical: 5,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
  },
  closeButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#FF3B30',
    borderRadius: 5,
  },
  closeButtonText: {
    color: 'white',
    textAlign: 'center',
  },
});

export default DevMenu; 