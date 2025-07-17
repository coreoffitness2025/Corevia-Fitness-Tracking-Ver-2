import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../../stores/authStore'; 
import { proteinSources, carbSources, fatSources, FoodSource } from '../data/nutritionData';
import AppButton from '../components/common/AppButton'; 

type Category = 'protein' | 'carbs' | 'fats';
const CATEGORIES: { key: Category, name: string, data: FoodSource[], color: string }[] = [
    { key: 'protein', name: '단백질 급원', data: proteinSources, color: '#28a745' },
    { key: 'carbs', name: '탄수화물 급원', data: carbSources, color: '#ffc107' },
    { key: 'fats', name: '지방 급원', data: fatSources, color: '#dc3545' },
];

const calculateMacroNutrientTargetsForGuide = (targetCalories, weight_kg) => {
  if (!targetCalories || !weight_kg) {
    return { proteinTarget: 0, carbsTarget: 0, fatTarget: 0 };
  }
  const proteinGrams = Math.round(weight_kg * 1.6);
  const proteinCalories = proteinGrams * 4;
  const remainingCalories = Math.max(0, targetCalories - proteinCalories);
  const carbsCalories = Math.max(0, remainingCalories * 0.55);
  const fatCalories = Math.max(0, remainingCalories * 0.30);
  return {
    proteinTarget: proteinGrams,
    carbsTarget: Math.round(carbsCalories / 4),
    fatTarget: Math.round(fatCalories / 9)
  };
};

const NutritionGuideScreen = () => {
    const navigation = useNavigation();
    const { userProfile } = useAuthStore();
    const [activeCategory, setActiveCategory] = useState<Category>('protein');
    const [nutritionTargets, setNutritionTargets] = useState({
      targetCalories: 0,
      proteinTarget: 0,
      carbsTarget: 0,
      fatTarget: 0,
    });

    useEffect(() => {
        if (userProfile?.targetCalories && userProfile?.weight) {
            const macros = calculateMacroNutrientTargetsForGuide(userProfile.targetCalories, userProfile.weight);
            setNutritionTargets({
                targetCalories: userProfile.targetCalories,
                ...macros,
            });
        }
    }, [userProfile]);

    const renderFoodSourceItem = ({ item }: { item: FoodSource }) => (
        <View style={styles.itemContainer}>
            <Text style={styles.itemName}>{item.name}</Text>
            <View style={styles.nutrientContainer}>
                <Text style={styles.nutrientText}>단: {item.protein}g</Text>
                <Text style={styles.nutrientText}>탄: {item.carbs}g</Text>
                <Text style={styles.nutrientText}>지: {item.fat}g</Text>
            </View>
        </View>
    );
    
    const selectedData = CATEGORIES.find(c => c.key === activeCategory)?.data || [];

    const NutritionTargetCard = () => (
      <View style={styles.card}>
          <Text style={styles.cardTitle}>일일 영양소 목표</Text>
          <View style={styles.targetGrid}>
              <View style={styles.targetItem}>
                  <Text style={styles.targetLabel}>칼로리</Text>
                  <Text style={styles.targetValue}>{nutritionTargets.targetCalories} kcal</Text>
              </View>
              <View style={styles.targetItem}>
                  <Text style={styles.targetLabel}>단백질</Text>
                  <Text style={styles.targetValue}>{nutritionTargets.proteinTarget} g</Text>
              </View>
              <View style={styles.targetItem}>
                  <Text style={styles.targetLabel}>탄수화물</Text>
                  <Text style={styles.targetValue}>{nutritionTargets.carbsTarget} g</Text>
              </View>
              <View style={styles.targetItem}>
                  <Text style={styles.targetLabel}>지방</Text>
                  <Text style={styles.targetValue}>{nutritionTargets.fatTarget} g</Text>
              </View>
          </View>
          <AppButton 
              title="목표 재설정하기"
              onPress={() => navigation.navigate('CalorieCalculator')}
              variant="secondary"
              style={{ marginTop: 15 }}
          />
      </View>
    );

    return (
        <ScrollView style={styles.container}>
            <NutritionTargetCard />
            
            <View style={styles.card}>
                <Text style={styles.cardTitle}>영양소별 음식 급원 (100g 기준)</Text>
                <View style={styles.tabContainer}>
                    {CATEGORIES.map(category => (
                        <TouchableOpacity
                            key={category.key}
                            style={[styles.tab, activeCategory === category.key && { borderBottomColor: category.color, borderBottomWidth: 3 }]}
                            onPress={() => setActiveCategory(category.key)}
                        >
                            <Text style={[styles.tabText, activeCategory === category.key && { color: category.color }]}>{category.name}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
                <FlatList
                    data={selectedData}
                    renderItem={renderFoodSourceItem}
                    keyExtractor={(item) => item.name}
                    scrollEnabled={false} 
                />
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
        padding: 10,
    },
    card: {
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
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    targetGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    targetItem: {
        width: '48%',
        backgroundColor: '#f8f9fa',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 10,
    },
    targetLabel: {
        fontSize: 14,
        color: '#6c757d',
        marginBottom: 5,
    },
    targetValue: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    tabContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 10,
    },
    tab: {
        paddingVertical: 10,
        paddingHorizontal: 10,
    },
    tabText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#6c757d',
    },
    itemContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    itemName: {
        fontSize: 16,
        fontWeight: '500',
    },
    nutrientContainer: {
        flexDirection: 'row',
    },
    nutrientText: {
        marginLeft: 10,
        fontSize: 14,
    },
});

export default NutritionGuideScreen; 