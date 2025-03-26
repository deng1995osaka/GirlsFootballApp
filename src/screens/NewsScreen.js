import React, { useState, useEffect } from 'react';
import { 
    View,
    SafeAreaView, 
    StyleSheet, 
    FlatList, 
    Text,
    ActivityIndicator 
} from 'react-native';
import { newsStore } from '../store';
import NewsCard from '../components/NewsCard';
import Background from '../components/Background';
import { colors, fonts, typography } from '../styles/main';
import Header from '../components/Header';
import { normalize, wp, hp } from '../utils/responsive';

const NewsScreen = ({ navigation }) => {
    const [newsData, setNewsData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

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

    if (error) {
        return (
            <Background>
                <SafeAreaView style={styles.container}>
                    <Header 
                        title="★球星小报★"
                        onAddPress={() => navigation.navigate('NewsCreate')}
                    />
                    <View style={styles.errorContainer}>
                        <Text style={styles.errorText}>{error}</Text>
                    </View>
                </SafeAreaView>
            </Background>
        );
    }

    return (
        <Background>
            <SafeAreaView style={styles.container}>
                <Header 
                    title="★球星小报★"
                    onAddPress={() => navigation.navigate('NewsCreate')}
                />
                
                <View style={styles.mainContent}>
                    {isLoading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color={colors.primary} />
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
                                    <Text style={styles.emptyText}>暂无新闻</Text>
                                </View>
                            }
                            ListFooterComponent={<View style={styles.listFooter} />}
                            onRefresh={loadNewsData}
                            refreshing={isLoading}
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
        paddingTop: hp(5),
    },
    emptyText: {
        fontSize: typography.size.base,
        color: colors.textTertiary,
        fontFamily: fonts.pixel,
        marginTop: hp(2),
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