import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { HANDBOOK_DATA, HandbookArticle } from '../data/handbookData';

const CATEGORIES = ['전체', '운동', '영양', '부상 방지', '마인드셋'];

const HandbookScreen = () => {
    const navigation = useNavigation();
    const [selectedCategory, setSelectedCategory] = useState('전체');

    const filteredData = selectedCategory === '전체'
        ? HANDBOOK_DATA
        : HANDBOOK_DATA.filter(item => item.category === selectedCategory);

    const renderCategoryTabs = () => (
        <View style={styles.tabContainer}>
            <FlatList
                data={CATEGORIES}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={[styles.tab, selectedCategory === item && styles.selectedTab]}
                        onPress={() => setSelectedCategory(item)}
                    >
                        <Text style={[styles.tabText, selectedCategory === item && styles.selectedTabText]}>{item}</Text>
                    </TouchableOpacity>
                )}
                keyExtractor={item => item}
                horizontal
                showsHorizontalScrollIndicator={false}
            />
        </View>
    );
    
    const renderArticleItem = ({ item }: { item: HandbookArticle }) => (
        <TouchableOpacity 
            style={styles.articleContainer}
            onPress={() => navigation.navigate('HandbookDetail', { articleId: item.id })}
        >
            <Text style={styles.articleCategory}>{item.category}</Text>
            <Text style={styles.articleTitle}>{item.title}</Text>
            <Text style={styles.articleSummary}>{item.summary}</Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            {renderCategoryTabs()}
            <FlatList
                data={filteredData}
                renderItem={renderArticleItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    tabContainer: {
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#dee2e6',
        backgroundColor: 'white',
    },
    tab: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        marginRight: 10,
        backgroundColor: '#e9ecef',
    },
    selectedTab: {
        backgroundColor: '#007bff',
    },
    tabText: {
        color: '#495057',
        fontWeight: '600',
    },
    selectedTabText: {
        color: 'white',
    },
    listContent: {
        padding: 15,
    },
    articleContainer: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 20,
        marginBottom: 15,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,
    },
    articleCategory: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#007bff',
        marginBottom: 8,
    },
    articleTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    articleSummary: {
        fontSize: 14,
        color: '#6c757d',
        lineHeight: 20,
    },
});

export default HandbookScreen; 