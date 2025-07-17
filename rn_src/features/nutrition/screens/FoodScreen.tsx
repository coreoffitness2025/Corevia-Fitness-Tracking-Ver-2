import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, FlatList, TouchableOpacity, Modal } from 'react-native';
// ... other imports
import { format, addDays, subDays } from 'date-fns';
import NutritionSummary from '../components/NutritionSummary';
import Card from '../components/common/Card';
import AppButton from '../components/common/AppButton';

const AddItemMenu = ({ isVisible, onClose, onSelectItem }) => {
    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={isVisible}
            onRequestClose={onClose}
        >
            <TouchableOpacity style={styles.menuOverlay} onPress={onClose}>
                <Card style={styles.menuContainer}>
                    <AppButton title="Add Food" onPress={() => onSelectItem('food')} />
                    <AppButton title="Add Water" onPress={() => onSelectItem('water')} style={{marginTop: 10}} />
                    <AppButton title="Add Supplement" onPress={() => onSelectItem('supplement')} style={{marginTop: 10}} />
                </Card>
            </TouchableOpacity>
        </Modal>
    );
};

const FoodScreen = ({ navigation }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const foodLogs = useFoodLogStore((state) => state.foodLogs);
  const [isMenuVisible, setIsMenuVisible] = useState(false);

  const handleMenuSelect = (itemType) => {
    setIsMenuVisible(false);
    if (itemType === 'food') {
        navigation.navigate('FoodForm', { date: currentDate });
    } else {
        // For water and supplement, we can show them in a different modal or navigate
        // For simplicity, let's just log it for now.
        console.log(`Selected to add ${itemType}`);
        // We would navigate to a dedicated modal for water/supplement forms here
    }
  };

  return (
    <View style={styles.container}>
      {/* Date Selector Header */}
      <View style={styles.header}>
        <Button title="<" onPress={() => setCurrentDate(subDays(currentDate, 1))} />
        <Text style={styles.dateText}>{format(currentDate, 'yyyy-MM-dd')}</Text>
        <Button title=">" onPress={() => setCurrentDate(addDays(currentDate, 1))} />
      </View>

      {/* Nutrition Summary */}
      <NutritionSummary date={currentDate} />

      {/* ... utility buttons, flatlist, FAB ... */}
      <TouchableOpacity style={styles.fab} onPress={() => setIsMenuVisible(true)}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
      <AddItemMenu 
        isVisible={isMenuVisible} 
        onClose={() => setIsMenuVisible(false)}
        onSelectItem={handleMenuSelect}
      />
    </View>
  );
};

const styles = StyleSheet.create({
    // ...
    menuOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.4)',
    },
    menuContainer: {
        margin: 16,
    },
});

export default FoodScreen; 