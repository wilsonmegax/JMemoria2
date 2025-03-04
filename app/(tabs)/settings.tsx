import React from 'react';
import { View, StyleSheet, Text, SafeAreaView, Switch, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useGameStore } from '../../store/gameStore';
import { Settings, Volume2, Vibrate, ArrowLeft } from 'lucide-react-native';
import { router } from 'expo-router';

export default function SettingsScreen() {
  const { 
    soundEnabled, 
    hapticEnabled, 
    difficulty,
    toggleSound,
    toggleHaptic,
    setDifficulty,
    startGame,
    resetGame
  } = useGameStore();
  
  const handleDifficultyChange = (newDifficulty: 'easy' | 'medium' | 'hard') => {
    setDifficulty(newDifficulty);
    resetGame();
    startGame(newDifficulty);
  };
  
  return (
    <LinearGradient
      colors={['#4c669f', '#3b5998', '#192f6a']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.push('/')}>
            <ArrowLeft color="#fff" size={24} />
          </Pressable>
          <Text style={styles.title}>Settings</Text>
          <View style={{ width: 24 }} />
        </View>
        
        <View style={styles.content}>
          <View style={styles.settingsContainer}>
            <View style={styles.settingItem}>
              <View style={styles.settingLabelContainer}>
                <Volume2 color="#fff" size={24} />
                <Text style={styles.settingLabel}>Sound Effects</Text>
              </View>
              <Switch
                value={soundEnabled}
                onValueChange={toggleSound}
                trackColor={{ false: '#767577', true: '#81b0ff' }}
                thumbColor={soundEnabled ? '#f5dd4b' : '#f4f3f4'}
              />
            </View>
            
            <View style={styles.settingItem}>
              <View style={styles.settingLabelContainer}>
                <Vibrate color="#fff" size={24} />
                <Text style={styles.settingLabel}>Haptic Feedback</Text>
              </View>
              <Switch
                value={hapticEnabled}
                onValueChange={toggleHaptic}
                trackColor={{ false: '#767577', true: '#81b0ff' }}
                thumbColor={hapticEnabled ? '#f5dd4b' : '#f4f3f4'}
              />
            </View>
          </View>
          
          <View style={styles.difficultyContainer}>
            <Text style={styles.difficultyTitle}>Game Difficulty</Text>
            
            <View style={styles.difficultyOptions}>
              <Pressable
                style={[
                  styles.difficultyOption,
                  difficulty === 'easy' && styles.selectedDifficulty
                ]}
                onPress={() => handleDifficultyChange('easy')}
              >
                <Text style={[
                  styles.difficultyText,
                  difficulty === 'easy' && styles.selectedDifficultyText
                ]}>
                  Easy
                </Text>
                <Text style={styles.difficultyDescription}>6 Pairs</Text>
              </Pressable>
              
              <Pressable
                style={[
                  styles.difficultyOption,
                  difficulty === 'medium' && styles.selectedDifficulty
                ]}
                onPress={() => handleDifficultyChange('medium')}
              >
                <Text style={[
                  styles.difficultyText,
                  difficulty === 'medium' && styles.selectedDifficultyText
                ]}>
                  Medium
                </Text>
                <Text style={styles.difficultyDescription}>10 Pairs</Text>
              </Pressable>
              
              <Pressable
                style={[
                  styles.difficultyOption,
                  difficulty === 'hard' && styles.selectedDifficulty
                ]}
                onPress={() => handleDifficultyChange('hard')}
              >
                <Text style={[
                  styles.difficultyText,
                  difficulty === 'hard' && styles.selectedDifficultyText
                ]}>
                  Hard
                </Text>
                <Text style={styles.difficultyDescription}>15 Pairs</Text>
              </Pressable>
            </View>
          </View>
          
          <View style={styles.aboutContainer}>
            <Text style={styles.aboutTitle}>About Memory Match</Text>
            <Text style={styles.aboutText}>
              Memory Match is a fun card matching game that tests your memory skills.
              Flip cards to find matching pairs and try to complete the game in the shortest time possible.
            </Text>
            <Text style={styles.versionText}>Version 1.0.0</Text>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingTop: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  backButton: {
    padding: 5,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Nunito-ExtraBold',
    color: '#fff',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  settingsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
  },
  settingLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingLabel: {
    fontSize: 18,
    fontFamily: 'Nunito-Regular',
    color: '#fff',
    marginLeft: 10,
  },
  difficultyContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
  },
  difficultyTitle: {
    fontSize: 20,
    fontFamily: 'Nunito-Bold',
    color: '#fff',
    marginBottom: 15,
  },
  difficultyOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  difficultyOption: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 10,
    padding: 15,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  selectedDifficulty: {
    backgroundColor: '#fff',
  },
  difficultyText: {
    fontSize: 16,
    fontFamily: 'Nunito-Bold',
    color: '#fff',
    marginBottom: 5,
  },
  selectedDifficultyText: {
    color: '#4c669f',
  },
  difficultyDescription: {
    fontSize: 12,
    fontFamily: 'Nunito-Regular',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  aboutContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 15,
    padding: 20,
  },
  aboutTitle: {
    fontSize: 20,
    fontFamily: 'Nunito-Bold',
    color: '#fff',
    marginBottom: 10,
  },
  aboutText: {
    fontSize: 16,
    fontFamily: 'Nunito-Regular',
    color: '#fff',
    marginBottom: 15,
    lineHeight: 22,
  },
  versionText: {
    fontSize: 14,
    fontFamily: 'Nunito-Regular',
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },
});