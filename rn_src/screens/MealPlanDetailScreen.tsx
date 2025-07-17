import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { MEAL_PLAN_DATA } from '../data/mealPlanData';

const MealPlanDetailScreen = ({ route }) => {
  const { planId } = route.params;
  const plan = MEAL_PLAN_DATA.find(p => p.id === planId);

  if (!plan) {
    return <View style={styles.container}><Text>Meal Plan not found!</Text></View>;
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{plan.name}</Text>
      <Text style={styles.description}>{plan.description}</Text>
      
      {plan.dailyPlan.map((day) => (
        <View key={day.day} style={styles.dayContainer}>
          <Text style={styles.dayTitle}>Day {day.day} - Approx. {day.totalCalories} kcal</Text>
          {day.meals.map((meal, index) => (
            <View key={index} style={styles.mealContainer}>
              <Text style={styles.mealName}>{meal.name} ({meal.calories} kcal)</Text>
              <Text style={styles.mealItems}>{meal.items.join(', ')}</Text>
            </View>
          ))}
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: 'white' },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 5 },
  description: { fontSize: 16, color: 'gray', marginBottom: 25 },
  dayContainer: { marginBottom: 25 },
  dayTitle: { fontSize: 22, fontWeight: '600', marginBottom: 15, color: '#28a745' },
  mealContainer: { marginBottom: 15, paddingLeft: 10, borderLeftWidth: 3, borderLeftColor: '#f0f0f0' },
  mealName: { fontSize: 18, fontWeight: 'bold' },
  mealItems: { fontSize: 16, color: '#555', fontStyle: 'italic' },
});

export default MealPlanDetailScreen; 