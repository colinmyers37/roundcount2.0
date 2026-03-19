import { Tabs } from 'expo-router';
import { Text } from 'react-native';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#1a1a1a',
        tabBarInactiveTintColor: '#999',
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: 'Dashboard', tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>📊</Text> }}
      />
      <Tabs.Screen
        name="firearms"
        options={{ title: 'Firearms', tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>🔫</Text> }}
      />
      <Tabs.Screen
        name="sessions"
        options={{ title: 'Sessions', tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>🎯</Text> }}
      />
      <Tabs.Screen
        name="maintenance"
        options={{ title: 'Maintenance', tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>🔧</Text> }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: 'Profile', tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>👤</Text> }}
      />
    </Tabs>
  );
}
