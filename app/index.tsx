import { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import { router } from 'expo-router';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withSequence, 
  withDelay,
  withTiming,
  Easing
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Play, Users, Trophy, Settings } from 'lucide-react-native';
import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

export default function WelcomeScreen() {
  const titleScale = useSharedValue(0);
  const logoRotate = useSharedValue(0);
  const buttonOpacity = useSharedValue(0);
  
  useEffect(() => {
    titleScale.value = withSequence(
      withDelay(300, withSpring(1.2)),
      withSpring(1)
    );
    
    logoRotate.value = withSequence(
      withDelay(500, withTiming(2 * Math.PI, { duration: 1000 })),
      withTiming(0, { duration: 0 })
    );
    
    buttonOpacity.value = withDelay(1200, withTiming(1, { duration: 800 }));
  }, []);
  
  const titleStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: titleScale.value }]
    };
  });
  
  const logoStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { rotate: `${logoRotate.value}rad` },
        { scale: titleScale.value }
      ]
    };
  });
  
  const buttonContainerStyle = useAnimatedStyle(() => {
    return {
      opacity: buttonOpacity.value,
      transform: [{ translateY: withTiming(buttonOpacity.value * 0 + (1 - buttonOpacity.value) * 50, { duration: 800 }) }]
    };
  });
  
  const handleButtonPress = (route: any) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    router.push(route);
  };

  return (
    <LinearGradient
      colors={['#4c669f', '#3b5998', '#192f6a']}
      style={styles.container}
    >
      <View style={styles.content}>
        <Animated.View style={[styles.logoContainer, logoStyle]}>
          <Image 
            source={require('../assets/images/logo.png')} 
            style={styles.logo}
          />
        </Animated.View>
        
        <Animated.Text style={[styles.title, titleStyle]}>
          Memory Match
        </Animated.Text>
        
        <Animated.View style={[styles.buttonContainer, buttonContainerStyle]}>
          <Pressable 
            style={styles.button} 
            onPress={() => handleButtonPress('(tabs)/single-player')}
          >
            <Play color="#fff" size={24} />
            <Text style={styles.buttonText}>Single Player</Text>
          </Pressable>
          
          <Pressable 
            style={styles.button} 
            onPress={() => handleButtonPress('(tabs)/two-player')}
          >
            <Users color="#fff" size={24} />
            <Text style={styles.buttonText}>Two Players</Text>
          </Pressable>
          
          <Pressable 
            style={styles.button} 
            onPress={() => handleButtonPress('(tabs)/leaderboard')}
          >
            <Trophy color="#fff" size={24} />
            <Text style={styles.buttonText}>Leaderboard</Text>
          </Pressable>
          
          <Pressable 
            style={styles.button} 
            onPress={() => handleButtonPress('(tabs)/settings')}
          >
            <Settings color="#fff" size={24} />
            <Text style={styles.buttonText}>Settings</Text>
          </Pressable>
        </Animated.View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    width: '100%',
  },
  logoContainer: {
    marginBottom: 20,
  },
  logo: {
    width: 120,
    height: 120,
  },
  title: {
    fontSize: 42,
    fontFamily: 'Nunito-ExtraBold',
    color: '#fff',
    marginBottom: 60,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 5,
  },
  buttonContainer: {
    width: '80%',
    maxWidth: 300,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'Nunito-Bold',
    marginLeft: 15,
  },
});