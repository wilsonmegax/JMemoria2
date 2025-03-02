import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import { TowerControl as GameController, Settings, Trophy } from 'lucide-react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#7C4DFF',
        tabBarInactiveTintColor: '#9E9E9E',
        tabBarStyle: {
          backgroundColor: '#1A1A2E',
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
          height: Platform.OS === 'ios' ? 90 : 70,
          paddingBottom: Platform.OS === 'ios' ? 30 : 10,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        headerStyle: {
          backgroundColor: '#1A1A2E',
        },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Jogar',
          tabBarIcon: ({ color, size }) => (
            <GameController size={size} color={color} />
          ),
          headerTitle: 'Jogo da Memória',
        }}
      />
      <Tabs.Screen
        name="leaderboard"
        options={{
          title: 'Recordes',
          tabBarIcon: ({ color, size }) => (
            <Trophy size={size} color={color} />
          ),
          headerTitle: 'Recordes',
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Configurações',
          tabBarIcon: ({ color, size }) => (
            <Settings size={size} color={color} />
          ),
          headerTitle: 'Configurações',
        }}
      />
    </Tabs>
  );
}