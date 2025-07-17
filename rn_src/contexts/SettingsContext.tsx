import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type WeightUnit = 'kg' | 'lbs';

interface SettingsContextType {
  weightUnit: WeightUnit;
  setWeightUnit: (unit: WeightUnit) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) throw new Error('useSettings must be used within a SettingsProvider');
  return context;
};

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [weightUnit, setUnit] = useState<WeightUnit>('kg');

  useEffect(() => {
    const loadSettings = async () => {
      const savedUnit = await AsyncStorage.getItem('weightUnit') as WeightUnit | null;
      if (savedUnit) {
        setUnit(savedUnit);
      }
    };
    loadSettings();
  }, []);

  const setWeightUnit = async (unit: WeightUnit) => {
    setUnit(unit);
    await AsyncStorage.setItem('weightUnit', unit);
  };

  return (
    <SettingsContext.Provider value={{ weightUnit, setWeightUnit }}>
      {children}
    </SettingsContext.Provider>
  );
}; 