import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform,
  Image,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  runOnJS,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Audio } from 'expo-av';
import { useSettings } from '../../context/SettingsContext';
import { Play, Users } from 'lucide-react-native';

const { width } = Dimensions.get('window');
const cardSize = width / 4 - 16;

const cardImages = [
  'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1560807707-8cc77767d783?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1546527868-ccb7ee7dfa6a?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1508185159346-bb1c5e93ebb4?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1517849845537-4d257902454a?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1535930891776-0c2dfb7fda1a?w=400&h=400&fit=crop',
];

export default function GameScreen() {
  const router = useRouter();
  const { soundEnabled, vibrationEnabled } = useSettings();
  const [gameMode, setGameMode] = useState<null | 'single' | 'multi'>(null);
  
  const playSound = async (soundName: 'flip' | 'match' | 'success' | 'error') => {
    if (!soundEnabled) return;
    
    try {
      const soundMap = {
        flip: require('../../assets/sounds/flip.mp3'),
        match: require('../../assets/sounds/match.mp3'),
        success: require('../../assets/sounds/success.mp3'),
        error: require('../../assets/sounds/error.mp3'),
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
  
  const triggerHaptic = (type: 'light' | 'medium' | 'heavy' | 'success' | 'error') => {
    if (!vibrationEnabled || Platform.OS === 'web') return;
    
    switch (type) {
      case 'light':
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        break;
      case 'medium':
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        break;
      case 'heavy':
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        break;
      case 'success':
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        break;
      case 'error':
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        break;
    }
  };
  
  const startGame = (mode: 'single' | 'multi') => {
    setGameMode(mode);
    router.push({
      pathname: '/game',
      params: { mode },
    });
  };

  return (
    <LinearGradient
      colors={['#1A1A2E', '#16213E', '#0F3460']}
      style={styles.container}
    >
      <View style={styles.content}>
        <Animated.View 
          style={[styles.titleContainer]}
          entering={withSequence(
            withTiming({ opacity: 0, transform: [{ scale: 0.8 }] }, { duration: 0 }),
            withTiming({ opacity: 1, transform: [{ scale: 1 }] }, { duration: 800 })
          )}
        >
          <Text style={styles.title}>Jogo da Memória</Text>
          <Text style={styles.subtitle}>Teste sua memória e divirta-se!</Text>
        </Animated.View>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => {
              triggerHaptic('medium');
              playSound('flip');
              startGame('single');
            }}
          >
            <LinearGradient
              colors={['#7C4DFF', '#5E35B1']}
              style={styles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Play size={24} color="#FFFFFF" />
              <Text style={styles.buttonText}>Um Jogador</Text>
            </LinearGradient>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.button}
            onPress={() => {
              triggerHaptic('medium');
              playSound('flip');
              startGame('multi');
            }}
          >
            <LinearGradient
              colors={['#FF4081', '#C2185B']}
              style={styles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Users size={24} color="#FFFFFF" />
              <Text style={styles.buttonText}>Dois Jogadores</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
        
        <View style={styles.previewContainer}>
          {[0, 1, 2, 3].map((index) => (
            <Animated.View
              key={index}
              style={[styles.previewCard]}
              entering={withDelay(
                index * 200,
                withSequence(
                  withTiming({ opacity: 0, transform: [{ rotateY: '90deg' }] }, { duration: 0 }),
                  withTiming({ opacity: 1, transform: [{ rotateY: '0deg' }] }, { duration: 500 })
                )
              )}
            >
              <Image
                source={{ uri: cardImages[index] }}
                style={styles.previewImage}
                resizeMode="cover"
              />
            </Animated.View>
          ))}
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#E0E0E0',
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
    marginBottom: 40,
  },
  button: {
    width: '100%',
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  previewContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    width: '100%',
    maxWidth: 300,
  },
  previewCard: {
    width: cardSize / 1.5,
    height: cardSize / 1.5,
    margin: 8,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
});