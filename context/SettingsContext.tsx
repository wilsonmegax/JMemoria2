import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type SettingsContextType = {
  soundEnabled: boolean;
  setSoundEnabled: (value: boolean) => void;
  vibrationEnabled: boolean;
  setVibrationEnabled: (value: boolean) => void;
  difficulty: 'fácil' | 'médio' | 'difícil';
  setDifficulty: (value: 'fácil' | 'médio' | 'difícil') => void;
};

const SettingsContext = createContext<SettingsContextType>({
  soundEnabled: true,
  setSoundEnabled: () => {},
  vibrationEnabled: true,
  setVibrationEnabled: () => {},
  difficulty: 'médio',
  setDifficulty: () => {},
});

export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [vibrationEnabled, setVibrationEnabled] = useState<boolean>(true);
  const [difficulty, setDifficulty] = useState<'fácil' | 'médio' | 'difícil'>('médio');
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  // Load settings from AsyncStorage on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const storedSettings = await AsyncStorage.getItem('memoryGameSettings');
        if (storedSettings) {
          const parsedSettings = JSON.parse(storedSettings);
          setSoundEnabled(parsedSettings.soundEnabled);
          setVibrationEnabled(parsedSettings.vibrationEnabled);
          setDifficulty(parsedSettings.difficulty || 'médio');
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      } finally {
        setIsLoaded(true);
      }
    };

    loadSettings();
  }, []);

  // Save settings to AsyncStorage when they change
  useEffect(() => {
    if (!isLoaded) return;

    const saveSettings = async () => {
      try {
        const settings = {
          soundEnabled,
          vibrationEnabled,
          difficulty,
        };
        await AsyncStorage.setItem('memoryGameSettings', JSON.stringify(settings));
      } catch (error) {
        console.error('Error saving settings:', error);
      }
    };

    saveSettings();
  }, [soundEnabled, vibrationEnabled, difficulty, isLoaded]);

  return (
    <SettingsContext.Provider
      value={{
        soundEnabled,
        setSoundEnabled,
        vibrationEnabled,
        setVibrationEnabled,
        difficulty,
        setDifficulty,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};