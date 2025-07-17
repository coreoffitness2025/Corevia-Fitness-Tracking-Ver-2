import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { MEAL_PLAN_DATA, MealPlan } from '../data/mealPlanData';

const MealPlanScreen = ({ navigation }) => {

  const renderItem = ({ item }: { item: MealPlan }) => (
    <TouchableOpacity 
      style={styles.itemContainer}
      onPress={() => navigation.navigate('MealPlanDetail', { planId: item.id })}
    >
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemDescription}>{item.description}</Text>
        <View style={styles.itemFooter}>
            <Text style={styles.itemMeta}>Goal: {item.goal}</Text>
        </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
        <FlatList
            data={MEAL_PLAN_DATA}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ padding: 10 }}
        />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  itemContainer: {
    backgroundColor: 'white',
    padding: 20,
    margin: 8,
    borderRadius: 8,
    elevation: 2,
  },
  itemName: { fontSize: 20, fontWeight: 'bold', marginBottom: 5 },
  itemDescription: { fontSize: 14, color: '#666', marginBottom: 15 },
  itemFooter: { alignItems: 'flex-start' },
  itemMeta: { fontSize: 12, color: 'white', fontWeight: 'bold', backgroundColor: '#28a745', paddingVertical: 2, paddingHorizontal: 6, borderRadius: 4, overflow: 'hidden' },
});

export default MealPlanScreen; 