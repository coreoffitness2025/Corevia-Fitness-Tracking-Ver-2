import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ScrollView, Alert, FlatList, TouchableOpacity } from 'react-native';
import { useFoodLogStore } from '../stores/foodLogStore';
import { addFoodLogToServer } from '../services/foodService';
import { searchFoodInStore } from '../services/foodDatabaseService';
import { format } from 'date-fns';

const FoodForm = ({ navigation, route }) => {
  const { date } = route.params;
  const [foodName, setFoodName] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const addFoodLog = useFoodLogStore((state) => state.addFoodLog);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchQuery.length > 1) {
        setSearchResults(searchFoodInStore(searchQuery));
      } else {
        setSearchResults([]);
      }
    }, 300); // Debounce search
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const handleSelectFood = (food) => {
    setFoodName(food.Food);
    setCalories(food.Calories || '');
    // Set other macros if available in your CSV
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleSave = async () => {
    if (!foodName || !calories) {
      Alert.alert('Error', 'Food name and calories are required.');
      return;
    }

    const foodData = {
      name: foodName,
      calories: parseFloat(calories) || 0,
      protein: parseFloat(protein) || 0,
      carbs: parseFloat(carbs) || 0,
      fat: parseFloat(fat) || 0,
      date: format(new Date(date), 'yyyy-MM-dd'), // Activate and format date
    };

    try {
      const docId = await addFoodLogToServer(foodData);
      addFoodLog({ id: docId, ...foodData });
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to save food log.');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.label}>Search Food</Text>
      <TextInput
        style={styles.input}
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search for a food..."
      />
      <FlatList
        data={searchResults}
        keyExtractor={(item, index) => `${item.Food}-${index}`}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.searchItem} onPress={() => handleSelectFood(item)}>
            <Text>{item.Food}</Text>
          </TouchableOpacity>
        )}
      />

      <Text style={styles.label}>Food Name</Text>
      <TextInput
        style={styles.input}
        value={foodName}
        onChangeText={setFoodName}
        placeholder="e.g., Chicken Breast"
      />

      <Text style={styles.label}>Calories (kcal)</Text>
      <TextInput
        style={styles.input}
        value={calories}
        onChangeText={setCalories}
        placeholder="e.g., 165"
        keyboardType="numeric"
      />

      <Text style={styles.label}>Protein (g)</Text>
      <TextInput
        style={styles.input}
        value={protein}
        onChangeText={setProtein}
        placeholder="e.g., 31"
        keyboardType="numeric"
      />

      <Text style={styles.label}>Carbohydrates (g)</Text>
      <TextInput
        style={styles.input}
        value={carbs}
        onChangeText={setCarbs}
        placeholder="e.g., 0"
        keyboardType="numeric"
      />

      <Text style={styles.label}>Fat (g)</Text>
      <TextInput
        style={styles.input}
        value={fat}
        onChangeText={setFat}
        placeholder="e.g., 3.6"
        keyboardType="numeric"
      />

      <Button title="Save Food" onPress={handleSave} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
  },
  input: {
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  searchItem: {
    padding: 10,
    backgroundColor: '#f9f9f9',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
});

export default FoodForm; 