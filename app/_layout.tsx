import { Stack } from 'expo-router';
import { FirebaseProvider } from '../contexts/FirebaseContext';

export default function RootLayout() {
  return (
    <FirebaseProvider>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="create" />
        <Stack.Screen name="tasks" />
      </Stack>
    </FirebaseProvider>
  );
}
