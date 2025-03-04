import { create } from 'zustand';
import { GameState, GameDifficulty, CardType } from '../types/game';
import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

// Card images - cartoon animals and objects
const cardImages = [
  'https://cdn-icons-png.flaticon.com/512/3069/3069172.png', // Lion
  'https://cdn-icons-png.flaticon.com/512/3069/3069170.png', // Elephant
  'https://cdn-icons-png.flaticon.com/512/3069/3069186.png', // Giraffe
  'https://cdn-icons-png.flaticon.com/512/3069/3069162.png', // Monkey
  'https://cdn-icons-png.flaticon.com/512/3069/3069163.png', // Panda
  'https://cdn-icons-png.flaticon.com/512/3069/3069754.png', // Penguin
  'https://cdn-icons-png.flaticon.com/512/3069/3069224.png', // Turtle
  'https://cdn-icons-png.flaticon.com/512/3069/3069269.png', // Whale
  'https://cdn-icons-png.flaticon.com/512/3069/3069290.png', // Crocodile
  'https://cdn-icons-png.flaticon.com/512/3069/3069325.png', // Fox
  'https://cdn-icons-png.flaticon.com/512/3069/3069339.png', // Owl
  
  'https://cdn-icons-png.flaticon.com/512/3069/3069364.png', // Rabbit
  'https://cdn-icons-png.flaticon.com/512/3069/3069369.png', // Squirrel
  'https://cdn-icons-png.flaticon.com/512/3069/3069380.png', // Tiger
  'https://cdn-icons-png.flaticon.com/512/3069/3069396.png', // Zebra
  'https://cdn-icons-png.flaticon.com/512/3069/3069397.png', // Bear
  'https://cdn-icons-png.flaticon.com/512/3069/3069398.png', // Deer
  'https://cdn-icons-png.flaticon.com/512/3069/3069399.png', // Hippo
  
];

// Get number of pairs based on difficulty
const getPairsCount = (difficulty: GameDifficulty): number => {
  switch (difficulty) {
    case 'easy': return 6;
    case 'medium': return 10;
    case 'hard': return 15;
    default: return 6;
  }
};

// Shuffle cards
const shuffleCards = (difficulty: GameDifficulty): CardType[] => {
  const pairsCount = getPairsCount(difficulty);
  const selectedImages = [...cardImages].slice(0, pairsCount);
  
  let cards: CardType[] = [];
  selectedImages.forEach((image, index) => {
    // Create two cards with the same image (a pair)
    cards.push(
      { id: index * 2, imageUrl: image, isFlipped: false, isMatched: false },
      { id: index * 2 + 1, imageUrl: image, isFlipped: false, isMatched: false }
    );
  });
  
  // Shuffle the cards
  return cards.sort(() => Math.random() - 0.5);
};

// Computer memory (for single player mode)
let computerMemory: Record<string, number> = {};

const initialState: GameState = {
  cards: [],
  flippedCards: [],
  matchedPairs: 0,
  totalPairs: 0,
  moves: 0,
  gameStarted: false,
  gameOver: false,
  currentPlayer: 1,
  player1Score: 0,
  player2Score: 0,
  computerScore: 0,
  playerScore: 0,
  difficulty: 'easy',
  soundEnabled: true,
  hapticEnabled: true,
  timer: 0,
  bestScores: {
    easy: 0,
    medium: 0,
    hard: 0
  }
};

export const useGameStore = create<GameState & {
  startGame: (difficulty: GameDifficulty) => void;
  flipCard: (cardId: number) => void;
  checkMatch: () => void;
  switchPlayer: () => void;
  computerMove: () => void;
  resetGame: () => void;
  updateTimer: () => void;
  toggleSound: () => void;
  toggleHaptic: () => void;
  setDifficulty: (difficulty: GameDifficulty) => void;
  updateBestScore: (difficulty: GameDifficulty, score: number) => void;
}>((set, get) => ({
  ...initialState,
  
  startGame: (difficulty) => {
    const cards = shuffleCards(difficulty);
    const totalPairs = getPairsCount(difficulty);
    computerMemory = {}; // Reset computer memory
    
    set({
      cards,
      flippedCards: [],
      matchedPairs: 0,
      totalPairs,
      moves: 0,
      gameStarted: true,
      gameOver: false,
      currentPlayer: 1,
      player1Score: 0,
      player2Score: 0,
      computerScore: 0,
      playerScore: 0,
      difficulty,
      timer: 0
    });
  },
  
  flipCard: (cardId) => {
    const { cards, flippedCards, gameOver, hapticEnabled } = get();
    
    if (gameOver) return;
    
    // Find the card
    const cardIndex = cards.findIndex(card => card.id === cardId);
    if (cardIndex === -1) return;
    
    const card = cards[cardIndex];
    
    // Can't flip if already flipped or matched
    if (card.isFlipped || card.isMatched) return;
    
    // Can't flip more than 2 cards at once
    if (flippedCards.length >= 2) return;
    
    // Provide haptic feedback if enabled
    if (hapticEnabled && Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    // Update card state
    const updatedCards = [...cards];
    updatedCards[cardIndex] = { ...card, isFlipped: true };
    
    // Add to flipped cards
    const updatedFlippedCards = [...flippedCards, card];
    
    // Store card in computer memory
    computerMemory[card.imageUrl] = cardId;
    
    set({
      cards: updatedCards,
      flippedCards: updatedFlippedCards,
      moves: get().moves + (flippedCards.length === 1 ? 1 : 0)
    });
    
    // Check for match if we have 2 flipped cards
    if (updatedFlippedCards.length === 2) {
      setTimeout(() => {
        get().checkMatch();
      }, 1000);
    }
  },
  
  checkMatch: () => {
    const { 
      cards, 
      flippedCards, 
      matchedPairs, 
      totalPairs, 
      currentPlayer,
      player1Score,
      player2Score,
      computerScore,
      playerScore,
      hapticEnabled
    } = get();
    
    if (flippedCards.length !== 2) return;
    
    const [card1, card2] = flippedCards;
    const isMatch = card1.imageUrl === card2.imageUrl;
    
    // Provide haptic feedback for match if enabled
    if (isMatch && hapticEnabled && Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    
    // Update cards
    const updatedCards = cards.map(card => {
      if (flippedCards.some(fc => fc.id === card.id)) {
        return { ...card, isFlipped: false, isMatched: isMatch ? true : card.isMatched };
      }
      return card;
    });
    
    // Update scores
    let updatedPlayer1Score = player1Score;
    let updatedPlayer2Score = player2Score;
    let updatedComputerScore = computerScore;
    let updatedPlayerScore = playerScore;
    
    if (isMatch) {
      // In single player mode
      updatedPlayerScore = playerScore + 1;
      
      // In two player mode
      if (currentPlayer === 1) {
        updatedPlayer1Score = player1Score + 1;
      } else {
        updatedPlayer2Score = player2Score + 1;
      }
    }
    
    const updatedMatchedPairs = isMatch ? matchedPairs + 1 : matchedPairs;
    const gameOver = updatedMatchedPairs === totalPairs;
    
    // If game is over, update best score
    if (gameOver) {
      const { difficulty, timer, bestScores } = get();
      const currentBestScore = bestScores[difficulty];
      
      if (currentBestScore === 0 || timer < currentBestScore) {
        get().updateBestScore(difficulty, timer);
      }
      
      // Provide haptic feedback for game over if enabled
      if (hapticEnabled && Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    }
    
    set({
      cards: updatedCards,
      flippedCards: [],
      matchedPairs: updatedMatchedPairs,
      player1Score: updatedPlayer1Score,
      player2Score: updatedPlayer2Score,
      computerScore: updatedComputerScore,
      playerScore: updatedPlayerScore,
      gameOver
    });
    
    // Switch player if no match in two player mode
    if (!isMatch) {
      setTimeout(() => {
        get().switchPlayer();
      }, 500);
    }
  },
  
  switchPlayer: () => {
    const { currentPlayer } = get();
    set({ currentPlayer: currentPlayer === 1 ? 2 : 1 });
  },
  
  computerMove: () => {
    const { cards, gameOver } = get();
    if (gameOver) return;
    
    // Get unmatched cards
    const unmatchedCards = cards.filter(card => !card.isMatched);
    
    // Try to find a match in memory
    const knownPairs: Record<string, number[]> = {};
    
    // Group cards by image URL
    Object.entries(computerMemory).forEach(([imageUrl, cardId]) => {
      if (!knownPairs[imageUrl]) {
        knownPairs[imageUrl] = [];
      }
      
      // Check if the card is still unmatched
      const cardStillUnmatched = unmatchedCards.some(card => card.id === cardId);
      if (cardStillUnmatched) {
        knownPairs[imageUrl].push(cardId);
      }
    });
    
    // Find a pair
    const knownPair = Object.values(knownPairs).find(pair => pair.length >= 2);
    
    if (knownPair && knownPair.length >= 2) {
      // Computer knows a pair, flip those cards
      setTimeout(() => {
        get().flipCard(knownPair[0]);
        
        setTimeout(() => {
          get().flipCard(knownPair[1]);
        }, 1000);
      }, 1000);
    } else {
      // Random move - flip two random unmatched cards
      const randomIndices:any = [];
      while (randomIndices.length < 2 && unmatchedCards.length >= 2) {
        const randomIndex = Math.floor(Math.random() * unmatchedCards.length);
        if (!randomIndices.includes(randomIndex)) {
          randomIndices.push(randomIndex);
        }
      }
      
      if (randomIndices.length === 2) {
        setTimeout(() => {
          get().flipCard(unmatchedCards[randomIndices[0]].id);
          
          setTimeout(() => {
            get().flipCard(unmatchedCards[randomIndices[1]].id);
          }, 1000);
        }, 1000);
      }
    }
  },
  
  resetGame: () => {
    computerMemory = {}; // Reset computer memory
    set({
      ...initialState,
      soundEnabled: get().soundEnabled,
      hapticEnabled: get().hapticEnabled,
      difficulty: get().difficulty,
      bestScores: get().bestScores
    });
  },
  
  updateTimer: () => {
    const { gameStarted, gameOver } = get();
    if (gameStarted && !gameOver) {
      set(state => ({ timer: state.timer + 1 }));
    }
  },
  
  toggleSound: () => {
    set(state => ({ soundEnabled: !state.soundEnabled }));
  },
  
  toggleHaptic: () => {
    set(state => ({ hapticEnabled: !state.hapticEnabled }));
  },
  
  setDifficulty: (difficulty) => {
    set({ difficulty });
  },
  
  updateBestScore: (difficulty, score) => {
    set(state => ({
      bestScores: {
        ...state.bestScores,
        [difficulty]: score
      }
    }));
  }
}));