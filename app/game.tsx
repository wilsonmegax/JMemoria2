import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform,
  Image,
  Alert,
  BackHandler,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSettings } from '../context/SettingsContext';
import { ArrowLeft, Pause, Play, RotateCcw } from 'lucide-react-native';

const { width } = Dimensions.get('window');

// Card images from Unsplash
const cardImages = [
  'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1560807707-8cc77767d783?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1546527868-ccb7ee7dfa6a?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1508185159346-bb1c5e93ebb4?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1517849845537-4d257902454a?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1535930891776-0c2dfb7fda1a?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1543852786-1cf6624b9987?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=400&h=400&fit=crop',
];

type Card = {
  id: number;
  imageUrl: string;
  flipped: boolean;
  matched: boolean;
};

export default function GameScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const gameMode = params.mode as 'single' | 'multi';
  const { soundEnabled, vibrationEnabled, difficulty } = useSettings();
  
  // Get card size based on difficulty
  const getCardSize = () => {
    switch (difficulty) {
      case 'fácil': return width / 4 - 16;
      case 'médio': return width / 4 - 16;
      case 'difícil': return width / 5 - 16;
      default: return width / 4 - 16;
    }
  };
  
  const cardSize = getCardSize();
  
  // Get number of pairs based on difficulty
  const getNumberOfPairs = () => {
    switch (difficulty) {
      case 'fácil': return 6;
      case 'médio': return 8;
      case 'difícil': return 12;
      default: return 8;
    }
  };
  
  const numberOfPairs = getNumberOfPairs();
  
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<number>(0);
  const [moves, setMoves] = useState<number>(0);
  const [currentPlayer, setCurrentPlayer] = useState<1 | 2>(1);
  const [player1Score, setPlayer1Score] = useState<number>(0);
  const [player2Score, setPlayer2Score] = useState<number>(0);
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [timer, setTimer] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const backHandlerRef = useRef<any>(null);
  
  // Initialize game
  useEffect(() => {
    initializeGame();
    
    // Handle back button on Android
    if (Platform.OS === 'android') {
      backHandlerRef.current = BackHandler.addEventListener('hardwareBackPress', () => {
        confirmExit();
        return true;
      });
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      if (Platform.OS === 'android' && backHandlerRef.current) {
        backHandlerRef.current.remove();
      }
    };
  }, []);
  
  // Watch for game over
  useEffect(() => {
    if (matchedPairs === numberOfPairs && gameStarted) {
      endGame();
    }
  }, [matchedPairs, gameStarted]);
  
  // Start timer when game starts
  useEffect(() => {
    if (gameStarted && !isPaused) {
      timerRef.current = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [gameStarted, isPaused]);
  
  // Handle flipped cards
  useEffect(() => {
    if (flippedCards.length === 2) {
      const [firstCardId, secondCardId] = flippedCards;
      const firstCard = cards.find((card) => card.id === firstCardId);
      const secondCard = cards.find((card) => card.id === secondCardId);
      
      if (firstCard && secondCard && firstCard.imageUrl === secondCard.imageUrl) {
        // Match found
        setTimeout(() => {
          setCards((prevCards) =>
            prevCards.map((card) =>
              card.id === firstCardId || card.id === secondCardId
                ? { ...card, matched: true }
                : card
            )
          );
          
          setMatchedPairs((prev) => prev + 1);
          
          if (gameMode === 'multi') {
            if (currentPlayer === 1) {
              setPlayer1Score((prev) => prev + 1);
            } else {
              setPlayer2Score((prev) => prev + 1);
            }
          }
          
          playSound('match');
          if (vibrationEnabled && Platform.OS !== 'web') {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          }
          
          setFlippedCards([]);
        }, 500);
      } else {
        // No match
        setTimeout(() => {
          setCards((prevCards) =>
            prevCards.map((card) =>
              card.id === firstCardId || card.id === secondCardId
                ? { ...card, flipped: false }
                : card
            )
          );
          
          if (gameMode === 'multi') {
            setCurrentPlayer((prev) => (prev === 1 ? 2 : 1));
          }
          
          playSound('error');
          if (vibrationEnabled && Platform.OS !== 'web') {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          }
          
          setFlippedCards([]);
        }, 1000);
      }
      
      setMoves((prev) => prev + 1);
    }
  }, [flippedCards]);
  
  const initializeGame = () => {
    // Create pairs of cards
    const cardPairs: Card[] = [];
    
    // Select random images based on number of pairs
    const selectedImages = [...cardImages]
      .sort(() => 0.5 - Math.random())
      .slice(0, numberOfPairs);
    
    // Create pairs
    selectedImages.forEach((imageUrl, index) => {
      cardPairs.push(
        { id: index * 2, imageUrl, flipped: false, matched: false },
        { id: index * 2 + 1, imageUrl, flipped: false, matched: false }
      );
    });
    
    // Shuffle cards
    const shuffledCards = cardPairs.sort(() => 0.5 - Math.random());
    
    setCards(shuffledCards);
    setFlippedCards([]);
    setMatchedPairs(0);
    setMoves(0);
    setCurrentPlayer(1);
    setPlayer1Score(0);
    setPlayer2Score(0);
    setTimer(0);
    setGameStarted(true);
    setGameOver(false);
    setIsPaused(false);
  };
  
  const handleCardPress = (cardId: number) => {
    if (
      flippedCards.length === 2 ||
      cards.find((card) => card.id === cardId)?.flipped ||
      cards.find((card) => card.id === cardId)?.matched ||
      isPaused
    ) {
      return;
    }
    
    playSound('flip');
    if (vibrationEnabled && Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    setCards((prevCards) =>
      prevCards.map((card) =>
        card.id === cardId ? { ...card, flipped: true } : card
      )
    );
    
    setFlippedCards((prev) => [...prev, cardId]);
  };
  
  const endGame = async () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    setGameOver(true);
    setGameStarted(false);
    
    playSound('success');
    if (vibrationEnabled && Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    
    // Save score for single player mode
    if (gameMode === 'single') {
      try {
        const playerName = 'Jogador'; // In a real app, you'd prompt for the name
        
        const newScore = {
          id: Date.now().toString(),
          playerName,
          mode: gameMode,
          moves,
          time: timer,
          date: new Date().toISOString(),
        };
        
        const storedScores = await AsyncStorage.getItem('memoryGameScores');
        const scores = storedScores ? JSON.parse(storedScores) : [];
        
        await AsyncStorage.setItem(
          'memoryGameScores',
          JSON.stringify([...scores, newScore])
        );
      } catch (error) {
        console.error('Error saving score:', error);
      }
    }
    
    // Show game over alert
    if (gameMode === 'single') {
      Alert.alert(
        'Parabéns!',
        `Você completou o jogo em ${moves} jogadas e ${formatTime(timer)}!`,
        [
          {
            text: 'Jogar Novamente',
            onPress: initializeGame,
          },
          {
            text: 'Menu Principal',
            onPress: () => router.back(),
          },
        ]
      );
    } else {
      const winner =
        player1Score > player2Score
          ? 'Jogador 1'
          : player1Score < player2Score
          ? 'Jogador 2'
          : 'Empate';
      
      Alert.alert(
        'Fim de Jogo!',
        `${winner === 'Empate' ? 'Empate!' : `${winner} venceu!`}\n\nJogador 1: ${player1Score} pares\nJogador 2: ${player2Score} pares\nTotal de jogadas: ${moves}`,
        [
          {
            text: 'Jogar Novamente',
            onPress: initializeGame,
          },
          {
            text: 'Menu Principal',
            onPress: () => router.back(),
          },
        ]
      );
    }
  };
  
  const togglePause = () => {
    setIsPaused((prev) => !prev);
    
    if (vibrationEnabled && Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };
  
  const confirmExit = () => {
    if (gameStarted && !gameOver) {
      setIsPaused(true);
      
      Alert.alert(
        'Sair do Jogo',
        'Tem certeza que deseja sair? Seu progresso será perdido.',
        [
          {
            text: 'Cancelar',
            onPress: () => setIsPaused(false),
            style: 'cancel',
          },
          {
            text: 'Sair',
            style: 'destructive',
            onPress: () => router.back(),
          },
        ]
      );
    } else {
      router.back();
    }
  };
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  const playSound = async (soundName: 'flip' | 'match' | 'success' | 'error') => {
    if (!soundEnabled) return;
    
    try {
      const soundMap = {
        flip: require('../assets/sounds/flip.mp3'),
        match: require('../assets/sounds/match.mp3'),
        success: require('../assets/sounds/success.mp3'),
        error: require('../assets/sounds/error.mp3'),
      };
      
      const { sound } = await Audio.Sound.createAsync(soundMap[soundName]);
      await sound.playAsync();
      
      // Unload sound after playing
      sound.setOnPlaybackStatusUpdate(status => {
        if (status.didJustFinish) {
          sound.unloadAsync();
        }
      });
    } catch (error) {
      console.error('Error playing sound:', error);
    }
  };
  
  const renderCard = (card: Card, index: number) => {
    const flipValue = useSharedValue(card.flipped || card.matched ? 180 : 0);
    
    useEffect(() => {
      if (card.flipped || card.matched) {
        flipValue.value = withTiming(180, { duration: 300 });
      } else {
        flipValue.value = withTiming(0, { duration: 300 });
      }
    }, [card.flipped, card.matched]);
    
    const frontAnimatedStyle = useAnimatedStyle(() => {
      return {
        transform: [
          { perspective: 1000 },
          { rotateY: `${flipValue.value}deg` },
        ],
        opacity: flipValue.value > 90 ? 0 : 1,
        backfaceVisibility: 'hidden' as const,
      };
    });
    
    const backAnimatedStyle = useAnimatedStyle(() => {
      return {
        transform: [
          { perspective: 1000 },
          { rotateY: `${flipValue.value - 180}deg` },
        ],
        opacity: flipValue.value > 90 ? 1 : 0,
        backfaceVisibility: 'hidden' as const,
      };
    });
    
    const cardContainerAnimatedStyle = useAnimatedStyle(() => {
      return {
        transform: [
          { scale: card.matched ? withTiming(0.95, { duration: 300 }) : withTiming(1, { duration: 300 }) },
        ],
        opacity: card.matched ? withTiming(0.7, { duration: 300 }) : withTiming(1, { duration: 300 }),
      };
    });
    
    return (
      <Animated.View
        key={card.id}
        style={[
          styles.cardContainer,
          { width: cardSize, height: cardSize * 1.4 },
          cardContainerAnimatedStyle,
        ]}
        entering={withDelay(
          index * 50,
          withSequence(
            withTiming({ opacity: 0, transform: [{ scale: 0.8 }] }, { duration: 0 }),
            withTiming({ opacity: 1, transform: [{ scale: 1 }] }, { duration: 300, easing: Easing.bounce })
          )
        )}
      >
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => handleCardPress(card.id)}
          style={styles.cardTouchable}
          disabled={card.flipped || card.matched || isPaused}
        >
          <Animated.View
            style={[
              styles.cardFace,
              styles.cardFront,
              frontAnimatedStyle,
            ]}
          >
            <LinearGradient
              colors={['#7C4DFF', '#5E35B1']}
              style={styles.cardGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.cardQuestionMark}>?</Text>
            </LinearGradient>
          </Animated.View>
          
          <Animated.View
            style={[
              styles.cardFace,
              styles.cardBack,
              backAnimatedStyle,
            ]}
          >
            <Image
              source={{ uri: card.imageUrl }}
              style={styles.cardImage}
              resizeMode="cover"
            />
          </Animated.View>
        </TouchableOpacity>
      </Animated.View>
    );
  };
  
  return (
    <LinearGradient
      colors={['#1A1A2E', '#16213E', '#0F3460']}
      style={styles.container}
    >
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={confirmExit}
        >
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        
        <View style={styles.gameInfo}>
          <Text style={styles.timerText}>{formatTime(timer)}</Text>
          <Text style={styles.movesText}>{moves} jogadas</Text>
        </View>
        
        <TouchableOpacity
          style={styles.pauseButton}
          onPress={togglePause}
        >
          {isPaused ? (
            <Play size={24} color="#FFFFFF" />
          ) : (
            <Pause size={24} color="#FFFFFF" />
          )}
        </TouchableOpacity>
      </View>
      
      {gameMode === 'multi' && (
        <View style={styles.playersContainer}>
          <View
            style={[
              styles.playerScore,
              currentPlayer === 1 && styles.activePlayer,
            ]}
          >
            <Text style={styles.playerText}>Jogador 1</Text>
            <Text style={styles.scoreText}>{player1Score}</Text>
          </View>
          
          <View
            style={[
              styles.playerScore,
              currentPlayer === 2 && styles.activePlayer,
            ]}
          >
            <Text style={styles.playerText}>Jogador 2</Text>
            <Text style={styles.scoreText}>{player2Score}</Text>
          </View>
        </View>
      )}
      
      {isPaused ? (
        <View style={styles.pauseOverlay}>
          <Text style={styles.pauseText}>Jogo Pausado</Text>
          <TouchableOpacity
            style={styles.resumeButton}
            onPress={togglePause}
          >
            <Play size={24} color="#FFFFFF" />
            <Text style={styles.resumeButtonText}>Continuar</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.restartButton}
            onPress={initializeGame}
          >
            <RotateCcw size={24} color="#FFFFFF" />
            <Text style={styles.restartButtonText}>Reiniciar</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.exitButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color="#FFFFFF" />
            <Text style={styles.exitButtonText}>Sair</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.gameBoard}>
          {cards.map((card, index) => renderCard(card, index))}
        </View>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 50 : 16,
    paddingBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gameInfo: {
    alignItems: 'center',
  },
  timerText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  movesText: {
    color: '#E0E0E0',
    fontSize: 14,
  },
  pauseButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playersContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  playerScore: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    marginHorizontal: 8,
  },
  activePlayer: {
    backgroundColor: 'rgba(124, 77, 255, 0.3)',
    borderWidth: 2,
    borderColor: '#7C4DFF',
  },
  playerText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  scoreText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  gameBoard: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignContent: 'center',
    padding: 8,
  },
  cardContainer: {
    margin: 8,
  },
  cardTouchable: {
    width: '100%',
    height: '100%',
  },
  cardFace: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  cardFront: {
    backgroundColor: '#FFFFFF',
  },
  cardBack: {
    backgroundColor: '#FFFFFF',
  },
  cardGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardQuestionMark: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  pauseOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  pauseText: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 40,
  },
  resumeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#7C4DFF',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    width: 200,
    marginBottom: 16,
  },
  resumeButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  restartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    width: 200,
    marginBottom: 16,
  },
  restartButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  exitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    width: 200,
  },
  exitButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 12,
  },
});