import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, Alert, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming,
  withSequence,
  withDelay
} from 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSettings } from '../../context/SettingsContext';
import { Volume2, VolumeX, Vibrate, Trash2, Info } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

export default function SettingsScreen() {
  const { 
    soundEnabled, 
    setSoundEnabled, 
    vibrationEnabled, 
    setVibrationEnabled,
    difficulty,
    setDifficulty
  } = useSettings();

  const triggerHaptic = () => {
    if (vibrationEnabled && Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const clearScores = async () => {
    Alert.alert(
      'Limpar Recordes',
      'Tem certeza que deseja apagar todos os recordes? Esta ação não pode ser desfeita.',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Limpar',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('memoryGameScores');
              if (vibrationEnabled && Platform.OS !== 'web') {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              }
              Alert.alert('Sucesso', 'Todos os recordes foram apagados.');
            } catch (error) {
              console.error('Error clearing scores:', error);
              Alert.alert('Erro', 'Não foi possível apagar os recordes.');
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const showAbout = () => {
    Alert.alert(
      'Sobre o Jogo',
      'Jogo da Memória v1.0\n\nUm jogo divertido para testar sua memória. Encontre todos os pares de cartas no menor número de jogadas possível.\n\nDesenvolvido com React Native e Expo.',
      [{ text: 'OK' }]
    );
  };

  return (
    <LinearGradient
      colors={['#1A1A2E', '#16213E', '#0F3460']}
      style={styles.container}
    >
      <Animated.View 
        style={styles.headerContainer}
        entering={withSequence(
          withTiming({ opacity: 0, transform: [{ translateY: -20 }] }, { duration: 0 }),
          withTiming({ opacity: 1, transform: [{ translateY: 0 }] }, { duration: 500 })
        )}
      >
        <Text style={styles.headerTitle}>Configurações</Text>
        <Text style={styles.headerSubtitle}>
          Personalize sua experiência de jogo
        </Text>
      </Animated.View>

      <View style={styles.settingsContainer}>
        <Animated.View 
          style={styles.settingItem}
          entering={withDelay(100, withTiming({ opacity: 1, transform: [{ translateX: 0 }] }, { duration: 500 }))}
          layout={{ opacity: 0, transform: [{ translateX: -50 }] }}
        >
          <View style={styles.settingIconContainer}>
            {soundEnabled ? (
              <Volume2 size={24} color="#7C4DFF" />
            ) : (
              <VolumeX size={24} color="#9E9E9E" />
            )}
          </View>
          <View style={styles.settingTextContainer}>
            <Text style={styles.settingTitle}>Sons</Text>
            <Text style={styles.settingDescription}>
              Ativar efeitos sonoros do jogo
            </Text>
          </View>
          <Switch
            value={soundEnabled}
            onValueChange={(value) => {
              setSoundEnabled(value);
              triggerHaptic();
            }}
            trackColor={{ false: '#767577', true: '#5E35B1' }}
            thumbColor={soundEnabled ? '#7C4DFF' : '#f4f3f4'}
            ios_backgroundColor="#3e3e3e"
          />
        </Animated.View>

        <Animated.View 
          style={styles.settingItem}
          entering={withDelay(200, withTiming({ opacity: 1, transform: [{ translateX: 0 }] }, { duration: 500 }))}
          layout={{ opacity: 0, transform: [{ translateX: -50 }] }}
        >
          <View style={styles.settingIconContainer}>
            <Vibrate size={24} color={vibrationEnabled ? '#7C4DFF' : '#9E9E9E'} />
          </View>
          <View style={styles.settingTextContainer}>
            <Text style={styles.settingTitle}>Vibração</Text>
            <Text style={styles.settingDescription}>
              Ativar feedback tátil durante o jogo
            </Text>
          </View>
          <Switch
            value={vibrationEnabled}
            onValueChange={(value) => {
              setVibrationEnabled(value);
              if (value && Platform.OS !== 'web') {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              }
            }}
            trackColor={{ false: '#767577', true: '#5E35B1' }}
            thumbColor={vibrationEnabled ? '#7C4DFF' : '#f4f3f4'}
            ios_backgroundColor="#3e3e3e"
          />
        </Animated.View>

        <Animated.View 
          style={styles.settingItem}
          entering={withDelay(300, withTiming({ opacity: 1, transform: [{ translateX: 0 }] }, { duration: 500 }))}
          layout={{ opacity: 0, transform: [{ translateX: -50 }] }}
        >
          <View style={styles.settingTextContainer}>
            <Text style={styles.settingTitle}>Dificuldade</Text>
            <Text style={styles.settingDescription}>
              Escolha o nível de dificuldade
            </Text>
          </View>
        </Animated.View>

        <View style={styles.difficultyContainer}>
          {['fácil', 'médio', 'difícil'].map((level) => (
            <TouchableOpacity
              key={level}
              style={[
                styles.difficultyButton,
                difficulty === level && styles.difficultyButtonActive,
              ]}
              onPress={() => {
                setDifficulty(level);
                triggerHaptic();
              }}
            >
              <Text
                style={[
                  styles.difficultyButtonText,
                  difficulty === level && styles.difficultyButtonTextActive,
                ]}
              >
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={clearScores}
          >
            <Trash2 size={20} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Limpar Recordes</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={showAbout}
          >
            <Info size={20} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Sobre</Text>
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    padding: 20,
    alignItems: 'center',
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#E0E0E0',
    textAlign: 'center',
  },
  settingsContainer: {
    flex: 1,
    padding: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  settingIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  settingDescription: {
    color: '#E0E0E0',
    fontSize: 12,
    marginTop: 4,
  },
  difficultyContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  difficultyButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  difficultyButtonActive: {
    backgroundColor: '#7C4DFF',
  },
  difficultyButtonText: {
    color: '#E0E0E0',
    fontWeight: '600',
  },
  difficultyButtonTextActive: {
    color: '#FFFFFF',
  },
  actionButtonsContainer: {
    marginTop: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
  },
});