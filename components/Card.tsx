import React, { useEffect } from 'react';
import { StyleSheet, Pressable, Image, Dimensions } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  Easing,
  interpolate,
  runOnJS
} from 'react-native-reanimated';
import { CardType } from '../types/game';

const { width } = Dimensions.get('window');

// Calculate card size based on screen width and difficulty
const getCardSize = (totalPairs: number) => {
  const columns = totalPairs <= 6 ? 3 : 4;
  const cardWidth = (width - 40) / columns;
  return { width: cardWidth - 10, height: cardWidth - 10 };
};

type CardProps = {
  card: CardType;
  onPress: (id: number) => void;
  totalPairs: number;
  disabled?: boolean;
};

const Card = ({ card, onPress, totalPairs, disabled = false }: CardProps) => {
  const flipProgress = useSharedValue(0);
  const { width: cardWidth, height: cardHeight } = getCardSize(totalPairs);
  
  useEffect(() => {
    flipProgress.value = withTiming(
      card.isFlipped || card.isMatched ? 1 : 0,
      { duration: 300, easing: Easing.bezier(0.25, 0.1, 0.25, 1) }
    );
  }, [card.isFlipped, card.isMatched]);
  
  const frontAnimatedStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(
      flipProgress.value,
      [0, 1],
      [180, 0]
    );
    
    return {
      transform: [
        { perspective: 1000 },
        { rotateY: `${rotateY}deg` },
      ],
      opacity: flipProgress.value === 0 ? 0 : 1,
    };
  });
  
  const backAnimatedStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(
      flipProgress.value,
      [0, 1],
      [0, -180]
    );
    
    return {
      transform: [
        { perspective: 1000 },
        { rotateY: `${rotateY}deg` },
      ],
      opacity: flipProgress.value === 1 ? 0 : 1,
    };
  });
  
  const cardStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      flipProgress.value,
      [0, 0.5, 1],
      [1, 1.1, 1]
    );
    
    return {
      transform: [{ scale }],
    };
  });
  
  const handlePress = () => {
    if (!disabled && !card.isFlipped && !card.isMatched) {
      onPress(card.id);
    }
  };
  
  return (
    <Pressable onPress={handlePress} disabled={disabled}>
      <Animated.View style={[styles.cardContainer, cardStyle, { width: cardWidth, height: cardHeight }]}>
        {/* Front of card (image) */}
        <Animated.View style={[styles.cardFace, styles.cardFront, frontAnimatedStyle, { width: cardWidth, height: cardHeight }]}>
          <Image source={{ uri: card.imageUrl }} style={styles.cardImage} />
        </Animated.View>
        
        {/* Back of card */}
        <Animated.View style={[styles.cardFace, styles.cardBack, backAnimatedStyle, { width: cardWidth, height: cardHeight }]}>
          <Image 
            source={require('../assets/images/logo.png')} 
            style={styles.cardBackImage} 
          />
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    margin: 5,
    position: 'relative',
  },
  cardFace: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backfaceVisibility: 'hidden',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  cardFront: {
    backgroundColor: '#fff',
    padding: 10,
  },
  cardBack: {
    backgroundColor: '#4c669f',
    borderWidth: 2,
    borderColor: '#fff',
  },
  cardImage: {
    width: '80%',
    height: '80%',
    resizeMode: 'contain',
  },
  cardBackImage: {
    width: '60%',
    height: '60%',
    resizeMode: 'contain',
    opacity: 0.7,
  },
});

export default Card;