import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRoute } from '@react-navigation/native';
import Markdown from 'react-native-markdown-display';
import { HANDBOOK_DATA } from '../data/handbookData';

const HandbookDetailScreen = () => {
    const route = useRoute();
    const { articleId } = route.params as { articleId: string };
    
    const article = HANDBOOK_DATA.find(item => item.id === articleId);

    if (!article) {
        return (
            <View style={styles.centered}>
                <Text>아티클을 찾을 수 없습니다.</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>{article.title}</Text>
                <Text style={styles.meta}>
                    작성자: {article.author} | 게시일: {article.publishedDate}
                </Text>
            </View>
            <View style={styles.contentContainer}>
                <Markdown style={markdownStyles}>
                    {article.content}
                </Markdown>
            </View>
        </ScrollView>
    );
};

const markdownStyles = {
    heading1: {
        fontSize: 24,
        fontWeight: 'bold',
        marginTop: 24,
        marginBottom: 12,
        borderBottomWidth: 1,
        borderColor: '#eee',
        paddingBottom: 8,
    },
    heading2: {
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 20,
        marginBottom: 10,
    },
    body: {
        fontSize: 16,
        lineHeight: 26,
    },
    strong: {
        fontWeight: 'bold',
    },
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    title: {
        fontSize: 26,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    meta: {
        fontSize: 14,
        color: '#888',
    },
    contentContainer: {
        padding: 20,
    },
});

export default HandbookDetailScreen; 