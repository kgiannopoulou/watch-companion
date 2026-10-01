import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { colors } from '../components/watch';
import { StoreProvider } from '../lib/store';

export default function RootLayout() {
  return (
    <StoreProvider>
      <StatusBar style="light" />
      {/* Watches swipe back instead of showing headers. */}
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg }, animation: 'slide_from_right' }} />
    </StoreProvider>
  );
}
