import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView, TouchableOpacity, Image } from 'react-native';
import { useFoodLogStore } from '../stores/foodLogStore';
import { format, addDays, subDays, isSameDay } from 'date-fns';
import Icon from 'react-native-vector-icons/FontAwesome5';

const FoodLogListScreen = ({ navigation }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const { foodLogs } = useFoodLogStore();

  const filteredLogs = useMemo(() => {
    return foodLogs.filter(log => isSameDay(new Date(log.date), currentDate));
  }, [foodLogs, currentDate]);

  const renderFoodLogItem = ({ item }) => (
    <View style={styles.itemContainer}>
        {item.image && (
            <Image source={{ uri: item.image }} style={styles.itemImage} />
        )}
        <View style={styles.itemContent}>
            <Text style={styles.itemName}>{item.name}</Text>
            {item.notes && (
                <Text style={styles.itemNotes}>{item.notes}</Text>
            )}
            <Text style={styles.itemDate}>{format(new Date(item.createdAt), 'HH:mm')}</Text>
        </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.navButton} onPress={() => setCurrentDate(subDays(currentDate, 1))}>
            <Icon name="chevron-left" size={18} color="#007bff" />
        </TouchableOpacity>
        <Text style={styles.dateText}>{format(currentDate, 'yyyy년 MM월 dd일')}</Text>
        <TouchableOpacity style={styles.navButton} onPress={() => setCurrentDate(addDays(currentDate, 1))}>
            <Icon name="chevron-right" size={18} color="#007bff" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredLogs}
        renderItem={renderFoodLogItem}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={styles.emptyText}>해당 날짜의 식단 기록이 없습니다.</Text>}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { 
      flex: 1, 
      backgroundColor: '#f8f9fa' 
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#dee2e6',
  },
  navButton: {
      padding: 10,
  },
  dateText: { 
      fontSize: 18, 
      fontWeight: 'bold' 
  },
  itemContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    overflow: 'hidden',
  },
  itemImage: {
    width: '100%',
    height: 200,
  },
  itemContent: {
    padding: 15,
  },
  itemName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  itemNotes: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 10,
  },
  itemDate: {
    fontSize: 12,
    color: '#adb5bd',
    textAlign: 'right',
  },
  emptyText: { 
      textAlign: 'center', 
      marginTop: 50, 
      fontSize: 16, 
      color: 'gray' 
  },
});

export default FoodLogListScreen; 