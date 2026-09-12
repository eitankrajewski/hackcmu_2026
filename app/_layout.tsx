import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { StoreProvider } from '@/src/store';
import { colors } from '@/src/theme';

export default function RootLayout() {
  return (
    <StoreProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.ink },
          headerTintColor: colors.cream,
          headerTitleStyle: { fontWeight: '800' },
          contentStyle: { backgroundColor: colors.ink },
        }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="hangout/[id]" options={{ title: 'Hangout' }} />
        <Stack.Screen name="lobby/[id]" options={{ title: 'Lobby' }} />
        <Stack.Screen name="group/[id]" options={{ title: 'Crew' }} />
        <Stack.Screen name="create-hangout" options={{ title: 'New hangout', presentation: 'modal' }} />
        <Stack.Screen name="create-crew" options={{ title: 'New crew', presentation: 'modal' }} />
        <Stack.Screen name="add-stop/[id]" options={{ title: 'Add a stop', presentation: 'modal' }} />
      </Stack>
    </StoreProvider>
  );
}
