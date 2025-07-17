import { useFoodDatabaseStore } from '../stores/foodDatabaseStore';
import { Asset } from 'react-native-unimodules';
import * as FileSystem from 'expo-file-system';

// This is a placeholder using Expo's FileSystem for concept.
// For pure RN CLI, you would use a library like 'react-native-fs'.
// We will assume the CSV is in rn_src/assets/data/nutrition_db.csv

const parseCSV = (csvText: string): any[] => {
    // A simple CSV parser. A more robust library might be better for production.
    const lines = csvText.split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    const data = [];
    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',');
        if (values.length === headers.length) {
            const entry = {};
            for (let j = 0; j < headers.length; j++) {
                entry[headers[j]] = values[j].trim();
            }
            data.push(entry);
        }
    }
    return data;
};

export const loadFoodDatabase = async () => {
    const { isLoaded, loadDatabase } = useFoodDatabaseStore.getState();
    if (isLoaded) {
        return;
    }
    
    try {
        // This logic is conceptual and needs a CLI-compatible file system library
        // to properly locate and read the asset.
        // const asset = Asset.fromModule(require('../assets/data/nutrition_db.csv'));
        // await asset.downloadAsync();
        // const csvText = await FileSystem.readAsStringAsync(asset.localUri);
        
        // For now, let's use placeholder data
        const csvText = `Food,Calories\nChicken Breast,165\nApple,95`;
        const parsedData = parseCSV(csvText);
        loadDatabase(parsedData); // Update the store
        console.log('Food database loaded into Zustand store successfully.');

    } catch (error) {
        console.error('Failed to load food database:', error);
    }
};

export const searchFoodInStore = (query: string): any[] => {
    const { database } = useFoodDatabaseStore.getState();
    if (!query) {
        return [];
    }
    const lowerCaseQuery = query.toLowerCase();
    return database.filter(food => 
        food.Food && food.Food.toLowerCase().includes(lowerCaseQuery)
    ).slice(0, 10);
}; 