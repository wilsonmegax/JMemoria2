import React from 'react';
import { View, StyleSheet, Text, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import GameBoard from '../../components/GameBoard';

export default function TwoPlayerScreen() {
  return (
    <LinearGradient
      colors={['#4c669f', '#3b5998', '#192f6a']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.title}>Two Player</Text>
        </View>
        
        <GameBoard mode="single" />
      </SafeAreaView>
    </LinearGradient>
  )
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
});