import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, Pressable } from 'react-native';
import { useGameStore } from '../store/gameStore';
import Card from './Card';
import { Audio } from 'expo-av';
import { Platform } from 'react-native';
import { RefreshCw } from 'lucide-react-native';

const { width } = Dimensions.get('window');

type GameBoardProps = {
  mode: 'single' | 'two-player';
};

const GameBoard = ({ mode }: GameBoardProps) => {
  const { 
    cards, 
    matchedPairs, 
    totalPairs, 
    moves,
    gameStarted,
    gameOver,
    currentPlayer,
    player1Score,
    player2Score,
    playerScore,
    computerScore,
    difficulty,
    soundEnabled,
    timer,
    bestScores,
    startGame,
    flipCard,
    computerMove,
    resetGame
  } = useGameStore();
  
  const [flipSound, setFlipSound] = useState<Audio.Sound | null>(null);
  const [matchSound, setMatchSound] = useState<Audio.Sound | null>(null);
  const [winSound, setWinSound] = useState<Audio.Sound | null>(null);
  
  // Load sounds
  useEffect(() => {
    if (Platform.OS !== 'web') {
      const loadSounds = async () => {
        const { sound: flip } = await Audio.Sound.createAsync(
          require('../assets/sounds/flip.mp3')
        );
        setFlipSound(flip);
        
        const { sound: match } = await Audio.Sound.createAsync(
          require('../assets/sounds/match.mp3')
        );
        setMatchSound(match);
        
        const { sound: win } = await Audio.Sound.createAsync(
          require('../assets/sounds/win.mp3')
        );
        setWinSound(win);
      };
      
      loadSounds();
      
      return () => {
        if (flipSound) flipSound.unloadAsync();
        if (matchSound) matchSound.unloadAsync();
        if (winSound) winSound.unloadAsync();
      };
    }
  }, []);
  
  // Start game on component mount
  useEffect(() => {
    if (!gameStarted) {
      startGame(difficulty);
    }
  }, []);
  
  // Timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (gameStarted && !gameOver) {
      interval = setInterval(() => {
        useGameStore.getState().updateTimer();
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [gameStarted, gameOver]);
  
  // Computer's turn in single player mode
  useEffect(() => {
    if (mode === 'single' && currentPlayer === 2 && !gameOver) {
      computerMove();
    }
  }, [currentPlayer, mode, gameOver]);
  
  // Play sounds
  const playSound = async (type: 'flip' | 'match' | 'win') => {
    if (!soundEnabled || Platform.OS === 'web') return;
    
    try {
      if (type === 'flip' && flipSound) {
        await flipSound.replayAsync();
      } else if (type === 'match' && matchSound) {
        await matchSound.replayAsync();
      } else if (type === 'win' && winSound) {
        await winSound.replayAsync();
      }
    } catch (error) {
      console.error('Error playing sound:', error);
    }
  };
  
  // Handle card flip
  const handleCardFlip = (cardId: number) => {
    if (
      (mode === 'single' && currentPlayer === 2) || 
      (mode === 'two-player' && gameOver)
    ) {
      return;
    }
    
    playSound('flip');
    flipCard(cardId);
  };
  
  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Determine winner
  const getWinner = () => {
    if (mode === 'single') {
      return 'You Win!';
    } else {
      if (player1Score > player2Score) {
        return 'Player 1 Wins!';
      } else if (player2Score > player1Score) {
        return 'Player 2 Wins!';
      } else {
        return 'It\'s a Tie!';
      }
    }
  };
  
  return (
    <View style={styles.container}>
      {/* Game Info */}
      <View style={styles.infoContainer}>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Time</Text>
          <Text style={styles.infoValue}>{formatTime(timer)}</Text>
        </View>
        
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Moves</Text>
          <Text style={styles.infoValue}>{moves}</Text>
        </View>
        
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Pairs</Text>
          <Text style={styles.infoValue}>{matchedPairs}/{totalPairs}</Text>
        </View>
      </View>
      
      {/* Player Turn Indicator (Two Player Mode) */}
      {mode === 'two-player' && !gameOver && (
        <View style={styles.turnIndicator}>
          <Text style={styles.turnText}>
            {currentPlayer === 1 ? 'Player 1\'s Turn' : 'Player 2\'s Turn'}
          </Text>
        </View>
      )}
      
      {/* Score Display */}
      {mode === 'two-player' ? (
        <View style={styles.scoreContainer}>
          <View style={[styles.playerScore, currentPlayer === 1 && styles.activePlayer]}>
            <Text style={styles.playerLabel}>Player 1</Text>
            <Text style={styles.scoreValue}>{player1Score}</Text>
          </View>
          
          <View style={[styles.playerScore, currentPlayer === 2 && styles.activePlayer]}>
            <Text style={styles.playerLabel}>Player 2</Text>
            <Text style={styles.scoreValue}>{player2Score}</Text>
          </View>
        </View>
      ) : null}
      
      {/* Game Board */}
      <View style={styles.board}>
        {cards.map(card => (
          <Card 
            key={card.id} 
            card={card} 
            onPress={handleCardFlip} 
            totalPairs={totalPairs}
            disabled={gameOver || (mode === 'single' && currentPlayer === 2)}
          />
        ))}
      </View>
      
      {/* Game Over Screen */}
      {gameOver && (
        <View style={styles.gameOverContainer}>
          <Text style={styles.gameOverTitle}>{getWinner()}</Text>
          
          <View style={styles.gameOverStats}>
            <Text style={styles.gameOverText}>Time: {formatTime(timer)}</Text>
            <Text style={styles.gameOverText}>Moves: {moves}</Text>
            
            {mode === 'single' && (
              <Text style={styles.gameOverText}>
                Best Time: {bestScores[difficulty] > 0 ? formatTime(bestScores[difficulty]) : 'N/A'}
              </Text>
            )}
          </View>
          
          <Pressable style={styles.resetButton} onPress={resetGame}>
            <RefreshCw color="#fff" size={20} />
            <Text style={styles.resetButtonText}>Play Again</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 10,
    padding: 10,
  },
  infoItem: {
    alignItems: 'center',
  },
  infoLabel: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Nunito-Regular',
  },
  infoValue: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'Nunito-Bold',
  },
  turnIndicator: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 10,
    padding: 10,
    marginBottom: 15,
    alignItems: 'center',
  },
  turnText: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'Nunito-Bold',
  },
  scoreContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  playerScore: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 10,
    padding: 10,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  activePlayer: {
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderWidth: 2,
    borderColor: '#fff',
  },
  playerLabel: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Nunito-Regular',
  },
  scoreValue: {
    color: '#fff',
    fontSize: 24,
    fontFamily: 'Nunito-Bold',
  },
  board: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  gameOverContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  gameOverTitle: {
    color: '#fff',
    fontSize: 32,
    fontFamily: 'Nunito-ExtraBold',
    marginBottom: 20,
  },
  gameOverStats: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    width: '80%',
    alignItems: 'center',
  },
  gameOverText: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'Nunito-Regular',
    marginBottom: 10,
  },
  resetButton: {
    flexDirection: 'row',
    backgroundColor: '#4c669f',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  resetButtonText: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'Nunito-Bold',
    marginLeft: 10,
  },
});

export default GameBoard;