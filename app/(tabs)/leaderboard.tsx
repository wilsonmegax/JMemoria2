import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming,
  withSequence,
  withDelay
} from 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Medal } from 'lucide-react-native';

const { width } = Dimensions.get('window');

type ScoreEntry = {
  id: string;
  playerName: string;
  mode: 'single' | 'multi';
  moves: number;
  time: number;
  date: string;
};

export default function LeaderboardScreen() {
  const [scores, setScores] = useState<ScoreEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadScores();
  }, []);

  const loadScores = async () => {
    try {
      const storedScores = await AsyncStorage.getItem('memoryGameScores');
      if (storedScores) {
        const parsedScores = JSON.parse(storedScores) as ScoreEntry[];
        // Sort by moves (ascending) and then by time (ascending)
        const sortedScores = parsedScores.sort((a, b) => {
          if (a.moves !== b.moves) {
            return a.moves - b.moves;
          }
          return a.time - b.time;
        });
        setScores(sortedScores);
      }
    } catch (error) {
      console.error('Error loading scores:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const getMedalColor = (index: number) => {
    switch (index) {
      case 0: return '#FFD700'; // Gold
      case 1: return '#C0C0C0'; // Silver
      case 2: return '#CD7F32'; // Bronze
      default: return '#9E9E9E'; // Gray
    }
  };

  const renderItem = ({ item, index }: { item: ScoreEntry; index: number }) => {
    const animatedOpacity = useSharedValue(0);
    const animatedTranslateY = useSharedValue(50);

    useEffect(() => {
      animatedOpacity.value = withDelay(
        index * 100,
        withTiming(1, { duration: 500 })
      );
      animatedTranslateY.value = withDelay(
        index * 100,
        withTiming(0, { duration: 500 })
      );
    }, []);

    const animatedStyle = useAnimatedStyle(() => {
      return {
        opacity: animatedOpacity.value,
        transform: [{ translateY: animatedTranslateY.value }],
      };
    });

    return (
      <Animated.View style={[styles.scoreItem, animatedStyle]}>
        <View style={styles.rankContainer}>
          <Medal size={24} color={getMedalColor(index)} />
          <Text style={styles.rankText}>{index + 1}</Text>
        </View>
        <View style={styles.scoreDetails}>
          <Text style={styles.playerName}>{item.playerName}</Text>
          <Text style={styles.scoreMode}>
            {item.mode === 'single' ? 'Um Jogador' : 'Dois Jogadores'}
          </Text>
        </View>
        <View style={styles.scoreStats}>
          <Text style={styles.scoreText}>{item.moves} jogadas</Text>
          <Text style={styles.scoreText}>{formatTime(item.time)}</Text>
        </View>
      </Animated.View>
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
        <Text style={styles.headerTitle}>Melhores Pontuações</Text>
        <Text style={styles.headerSubtitle}>
          Classificação baseada em menos jogadas e tempo
        </Text>
      </Animated.View>

      {loading ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Carregando recordes...</Text>
        </View>
      ) : scores.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Nenhum recorde ainda!</Text>
          <Text style={styles.emptySubtext}>
            Jogue algumas partidas para aparecer aqui.
          </Text>
        </View>
      ) : (
        <FlatList
          data={scores}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
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
  listContent: {
    padding: 16,
  },
  scoreItem: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  rankContainer: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 4,
  },
  scoreDetails: {
    flex: 1,
    marginLeft: 12,
  },
  playerName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  scoreMode: {
    color: '#E0E0E0',
    fontSize: 12,
    marginTop: 4,
  },
  scoreStats: {
    alignItems: 'flex-end',
  },
  scoreText: {
    color: '#FFFFFF',
    fontSize: 14,
    marginBottom: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  emptySubtext: {
    color: '#E0E0E0',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
});