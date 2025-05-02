import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Image, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppText from '@components/AppText';
import { colors, fonts, typography, layout } from '@styles/main';
import { normalize, wp, hp } from '@utils/responsive';
import Background from '@components/Background';
import { newsStore } from '@store';
import { supabase } from '@lib/supabase';

const NewsDetailScreen = ({ navigation, route }) => {
    const { newsId } = route.params;
    const [news, setNews] = useState(null);
    const [imageError, setImageError] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!newsId) {
            console.error('未收到新闻ID');
            setError('新闻不存在');
            return;
        }
        console.log('正在加载新闻ID:', newsId);
        loadNewsDetail();
    }, [newsId]);

    const loadNewsDetail = async () => {
        try {
            setIsLoading(true);
            const { data, error } = await supabase
                .from('news')
                .select(`
                    *,
                    profiles:created_by (
                        nickname,
                        avatar_url
                    )
                `)
                .eq('news_id', newsId)
                .single();

            if (error) throw error;
            setNews(data);
        } catch (err) {
            console.error('加载新闻详情失败:', err);
            setError('加载失败，请稍后重试');
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <Background>
                <SafeAreaView style={styles.safeArea}>
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={colors.primary} />
                    </View>
                </SafeAreaView>
            </Background>
        );
    }

    if (error || !news) {
        return (
            <Background>
                <SafeAreaView style={styles.safeArea}>
                    <View style={styles.headerContainer}>
                        <TouchableOpacity 
                            style={styles.backButton}
                            onPress={() => navigation.goBack()}
                        >
                            <AppText style={styles.backButtonText}>←</AppText>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.errorContainer}>
                        <AppText style={styles.errorText}>{error || '新闻不存在'}</AppText>
                    </View>
                </SafeAreaView>
            </Background>
        );
    }

    return (
        <Background>
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.headerContainer}>
                    <TouchableOpacity 
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <AppText style={styles.backButtonText}>←</AppText>
                    </TouchableOpacity>
                </View>

                <ScrollView style={styles.content}>
                    <View style={styles.contentContainer}>
                        <AppText style={styles.newsTitle}>{news.title}</AppText>
                        <AppText style={styles.newsAuthor}>◈{news.profiles?.nickname || '匿名'}◈</AppText>
                        
                        {news.summary && (
                            <AppText style={styles.newsSummary}>{'　　' + news.summary}</AppText>
                        )}
                        
                        {/* 图片区域 */}
                        {imageError || !news.image_url ? (
                            <View style={styles.placeholderImage}>
                                <AppText style={styles.placeholderText}>◇ 图片未加载 ◇</AppText>
                            </View>
                        ) : (
                            <Image 
                                source={{ uri: news.image_url }}
                                style={styles.newsImage}
                                resizeMode="contain"
                                onError={(e) => {
                                    console.error('图片加载错误:', {
                                        error: e.nativeEvent,
                                        url: news.image_url,
                                        type: typeof news.image_url
                                    });
                                    setImageError(true);
                                }}
                            />
                        )}
                        
                        <View style={styles.newsText}>
                            {news.content.split('\n')
                                .filter(p => p.trim())
                                .map((paragraph, index) => (
                                    <AppText key={index} style={styles.paragraph}>
                                        {'　　' + paragraph}
                                    </AppText>
                                ))
                            }
                        </View>
                        
                        {news.created_at && (
                            <AppText style={styles.newsFooter}>
                                最后更新于：{new Date(news.created_at).toLocaleDateString('zh-CN', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </AppText>
                        )}
                    </View>
                </ScrollView>
            </SafeAreaView>
        </Background>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    headerContainer: {
        height: hp(3),
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
        borderBottomWidth: 0,
        position: 'relative',
    },
    content: {
        flex: 1,
    },
    contentContainer: {
        backgroundColor: colors.bgWhite,
        margin: wp(4),
        padding: wp(5),
        borderRadius: layout.borderRadius.large,
        borderWidth: 1,
        borderColor: colors.border,
    },
    newsTitle: {
        fontSize: typography.size.xxl,
        color: colors.textPrimary,
        marginBottom: hp(2),
        lineHeight: typography.lineHeight.normal * typography.size.xxl,
        
        fontFamily: fonts.pixel,
    },
    newsAuthor: {
        fontSize: typography.size.sm,
        color: colors.textSecondary,
        marginBottom: hp(3),
        textAlign: 'center',
        fontFamily: fonts.pixel,
    },
    newsSummary: {
        fontSize: typography.size.base,
        color: colors.textPrimary,
        marginBottom: hp(2.5),
        lineHeight: typography.lineHeight.loose * typography.size.base,
        
        maxWidth: wp(80),
        alignSelf: 'center',
        fontFamily: fonts.pixel,
    },
    newsImage: {
        width: '100%',
        height: hp(40),
        marginVertical: hp(2.5),
        backgroundColor: colors.bgLight,
    },
    newsText: {
        marginBottom: hp(2.5),
        maxWidth: wp(90),
        alignSelf: 'center',
    },
    paragraph: {
        fontSize: typography.size.base,
        color: colors.textPrimary,
        lineHeight: typography.lineHeight.normal * typography.size.base,
        marginBottom: hp(2),
        textAlign: 'left',
        fontFamily: fonts.pixel,
    },
    newsFooter: {
        fontSize: typography.size.xs,
        color: colors.textSecondary,
        marginTop: hp(3.5),
        paddingTop: hp(2),
        borderTopWidth: 1,
        borderTopColor: colors.borderColor,
        borderStyle: 'dashed',
        fontFamily: fonts.pixel,
    },
    backButton: {
        position: 'absolute',
        left: wp(4),
        padding: wp(2),
        zIndex: 1,
    },
    backButtonText: {
        fontSize: typography.size.xxl,
        color: colors.textPrimary,
        fontFamily: fonts.pixel,
    },
    placeholderImage: {
        width: '100%',
        height: hp(40),
        marginVertical: hp(2.5),
        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: colors.border,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.bgLight,
    },
    placeholderText: {
        color: colors.textTertiary,
        fontFamily: fonts.pixel,
        fontSize: typography.size.base,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: wp(4),
    },
    errorText: {
        fontSize: typography.size.base,
        color: colors.error,
        fontFamily: fonts.pixel,
        textAlign: 'center',
    }
});

export default NewsDetailScreen; 