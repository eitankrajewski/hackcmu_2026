import { Tabs } from 'expo-router';
import { Text } from 'react-native';

import { colors } from '@/src/theme';

function Icon({ label }: { label: string }) {
  return <Text style={{ fontSize: 18 }}>{label}</Text>;
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: colors.ink },
        headerTintColor: colors.cream,
        headerTitleStyle: { fontWeight: '800' },
        tabBarStyle: { backgroundColor: colors.ink, borderTopColor: colors.inkCard },
        tabBarActiveTintColor: colors.lime,
        tabBarInactiveTintColor: colors.mute,
      }}>
      <Tabs.Screen
        name="index"
        options={{ title: 'Hangouts', tabBarIcon: () => <Icon label="🗺️" /> }}
      />
      <Tabs.Screen
        name="crews"
        options={{ title: 'Crews', tabBarIcon: () => <Icon label="👥" /> }}
      />
      <Tabs.Screen
        name="discover"
        options={{ title: 'Open now', tabBarIcon: () => <Icon label="✨" /> }}
      />
      <Tabs.Screen
        name="you"
        options={{ title: 'You', tabBarIcon: () => <Icon label="🦊" /> }}
      />
    </Tabs>
  );
}
