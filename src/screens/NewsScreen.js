import React, { useState, useEffect } from 'react';
import { 
    View,
    StyleSheet, 
    FlatList, 
    ActivityIndicator, 
    TouchableOpacity,
    RefreshControl,
    Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { newsStore } from '@store';
import { supabase } from '@lib/supabase';
import NewsCard from '@components/NewsCard';
import Background from '@components/Background';
import { colors, fonts, typography } from '@styles/main';
import Header from '@components/Header';
import { normalize, wp, hp } from '@utils/responsive';
import AppText from '@components/AppText';
import { useProfileCheck } from '@hooks/useProfileCheck';

const NewsScreen = ({ navigation }) => {
    const [newsData, setNewsData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const { checkProfile } = useProfileCheck(navigation);

    console.log('NewsScreen 组件加载了');

    useEffect(() => {
        checkLoginStatus();
        
        // 监听认证状态变化
        const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setIsLoggedIn(!!session);
        });

        // 订阅新闻变更
        const newsSubscription = supabase
            .channel('public:news')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'news'
            }, payload => {
                console.log('✅ 监听到新闻变更: ', payload);
                loadNewsData(); // 自动刷新
            })
            .subscribe();

        return () => {
            authSubscription.unsubscribe();
            newsSubscription.unsubscribe();
        };
    }, []);

    const checkLoginStatus = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            setIsLoggedIn(!!session);
        } catch (error) {
            console.error('检查登录状态失败:', error);
        }
    };

    const handleAddPress = async () => {
        
        const canProceed = await checkProfile();
        if (canProceed) {
            navigation.navigate('NewsCreate');
        }
    };

    useEffect(() => {
        loadNewsData();
        
        // 添加焦点监听器
        const unsubscribe = navigation.addListener('focus', () => {
            loadNewsData();
        });

        // 清理监听器
        return () => unsubscribe();
    }, [navigation]);

    const loadNewsData = async () => {
        try {
            setIsLoading(true);
            const data = await newsStore.getNewsList();
            setNewsData(data || []);
        } catch (err) {
            console.error('加载新闻失败:', err);
            setError('加载失败，请稍后重试');
        } finally {
            setIsLoading(false);
        }
    };

    const renderNewsCard = ({ item }) => (
        <NewsCard 
            item={item}
            onPress={() => navigation.navigate('NewsDetail', { newsId: item.news_id })}
        />
    );

    return (
        <Background>
            <SafeAreaView style={styles.container}>
                <Header 
                    title="★球星小报★"
                    onAddPress={handleAddPress}
                    showAddButton={true}
                />
                
                <View style={styles.mainContent}>
                    {error ? (
                        <View style={styles.errorContainer}>
                            <AppText style={styles.errorText}>{error}</AppText>
                        </View>
                    ) : isLoading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color={colors.primary} />
                        </View>
                    ) : !newsData.length ? (
                        <View style={styles.emptyContainer}>
                            <AppText style={styles.emptyText}>暂无新闻</AppText>
                        </View>
                    ) : (
                        <FlatList
                            data={newsData}
                            renderItem={renderNewsCard}
                            keyExtractor={item => item.news_id}
                            contentContainerStyle={styles.newsList}
                            showsVerticalScrollIndicator={false}
                            ListEmptyComponent={
                                <View style={styles.emptyContainer}>
                                    <AppText style={styles.emptyText}>暂无新闻</AppText>
                                </View>
                            }
                            ListFooterComponent={<View style={styles.listFooter} />}
                            onRefresh={loadNewsData}
                            refreshing={isLoading}
                            refreshControl={
                                <RefreshControl
                                    refreshing={isLoading}
                                    onRefresh={loadNewsData}
                                />
                            }
                        />
                    )}
                </View>
            </SafeAreaView>
        </Background>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    mainContent: {
        flex: 1,
        paddingTop: hp(1),
    },
    newsList: {
        paddingHorizontal: wp(4),
        paddingTop: hp(1),
        flexGrow: 1,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: wp(4),
    },
    emptyText: {
        color: colors.textPrimary,
        fontSize: typography.size.base,
        fontFamily: fonts.pixel,
        textAlign: 'center',
    },
    listFooter: {
        height: hp(2),
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        fontSize: typography.size.base,
        color: colors.error,
        fontFamily: fonts.pixel,
        marginTop: hp(2),
    }
});

export default NewsScreen;