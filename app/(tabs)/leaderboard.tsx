import React from 'react';
import { View, StyleSheet, Text, SafeAreaView, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useGameStore } from '../../store/gameStore';
import { Trophy } from 'lucide-react-native';

export default function LeaderboardScreen() {
  const { bestScores } = useGameStore();
  
  // Format time
  const formatTime = (seconds: number) => {
    if (seconds === 0) return 'No record yet';
    
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  return (
    <LinearGradient
      colors={['#4c669f', '#3b5998', '#192f6a']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.title}>Leaderboard</Text>
        </View>
        
        <ScrollView style={styles.content}>
          <View style={styles.trophyContainer}>
            <Trophy color="#FFD700" size={80} />
          </View>
          
          <View style={styles.recordsContainer}>
            <Text style={styles.recordsTitle}>Best Times</Text>
            
            <View style={styles.recordItem}>
              <Text style={styles.difficultyLabel}>Easy</Text>
              <Text style={styles.recordValue}>{formatTime(bestScores.easy)}</Text>
            </View>
            
            <View style={styles.recordItem}>
              <Text style={styles.difficultyLabel}>Medium</Text>
              <Text style={styles.recordValue}>{formatTime(bestScores.medium)}</Text>
            </View>
            
            <View style={styles.recordItem}>
              <Text style={styles.difficultyLabel}>Hard</Text>
              <Text style={styles.recordValue}>{formatTime(bestScores.hard)}</Text>
            </View>
          </View>
          
          <View style={styles.infoContainer}>
            <Text style={styles.infoText}>
              Play in single player mode to set new records!
            </Text>
            <Text style={styles.infoText}>
              The faster you complete the game, the better your score.
            </Text>
          </View>
        </ScrollView>
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
    paddingHorizontal: 20,
    marginBottom: 20,
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
  trophyContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  recordsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
  },
  recordsTitle: {
    fontSize: 22,
    fontFamily: 'Nunito-Bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 15,
  },
  recordItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
  },
  difficultyLabel: {
    fontSize: 18,
    fontFamily: 'Nunito-Bold',
    color: '#fff',
  },
  recordValue: {
    fontSize: 18,
    fontFamily: 'Nunito-Regular',
    color: '#fff',
  },
  infoContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 15,
    padding: 20,
  },
  infoText: {
    fontSize: 16,
    fontFamily: 'Nunito-Regular',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10,
  },
});