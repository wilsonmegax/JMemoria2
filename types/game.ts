export type CardType = {
  id: number;
  imageUrl: string;
  isFlipped: boolean;
  isMatched: boolean;
};

export type GameDifficulty = 'easy' | 'medium' | 'hard';

export type GameState = {
  cards: CardType[];
  flippedCards: CardType[];
  matchedPairs: number;
  totalPairs: number;
  moves: number;
  gameStarted: boolean;
  gameOver: boolean;
  currentPlayer: 1 | 2;
  player1Score: number;
  player2Score: number;
  computerScore: number;
  playerScore: number;
  difficulty: GameDifficulty;
  soundEnabled: boolean;
  hapticEnabled: boolean;
  timer: number;
  bestScores: Record<GameDifficulty, number>;
};

export type GameAction = 
  | { type: 'START_GAME'; payload: { difficulty: GameDifficulty } }
  | { type: 'FLIP_CARD'; payload: { cardId: number } }
  | { type: 'CHECK_MATCH' }
  | { type: 'SWITCH_PLAYER' }
  | { type: 'COMPUTER_MOVE' }
  | { type: 'RESET_GAME' }
  | { type: 'UPDATE_TIMER' }
  | { type: 'TOGGLE_SOUND' }
  | { type: 'TOGGLE_HAPTIC' }
  | { type: 'SET_DIFFICULTY'; payload: { difficulty: GameDifficulty } }
  | { type: 'UPDATE_BEST_SCORE'; payload: { difficulty: GameDifficulty; score: number } };