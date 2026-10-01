import * as Haptics from 'expo-haptics';
import type { ReactNode } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View, type ViewStyle } from 'react-native';

export const colors = {
  bg: '#000000',
  tile: '#1C1C1E',
  tilePressed: '#2C2C2E',
  text: '#FFFFFF',
  muted: '#9A9AA0',
  water: '#4FA8F0',
  run: '#FF9F0A',
  walk: '#30D158',
  shop: '#BF5AF2',
  danger: '#FF453A',
  track: '#2C2C2E',
};

export function tap(kind: 'light' | 'success' | 'warning' = 'light') {
  if (Platform.OS === 'web') return;
  if (kind === 'light') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  else Haptics.notificationAsync(kind === 'success' ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Warning).catch(() => {});
}

/** Watch-sized when the screen is small; keeps content out of the corners of round watch faces. */
export function useWatchLayout() {
  const { width } = useWindowDimensions();
  const isWatch = width < 330;
  return { isWatch, pad: isWatch ? Math.round(width * 0.13) : 20, maxWidth: isWatch ? width : 420 };
}

export function Screen({ children }: { children: ReactNode }) {
  const { pad, maxWidth } = useWatchLayout();
  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={{ padding: pad, paddingBottom: pad * 2, alignItems: 'center' }}>
      <View style={{ width: '100%', maxWidth, gap: 8 }}>{children}</View>
    </ScrollView>
  );
}

export function Tile({
  children,
  onPress,
  color = colors.tile,
  style,
  label,
}: {
  children: ReactNode;
  onPress?: () => void;
  color?: string;
  style?: ViewStyle;
  label?: string;
}) {
  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={label}
      onPress={
        onPress
          ? () => {
              tap();
              onPress();
            }
          : undefined
      }
      style={({ pressed }) => [s.tile, { backgroundColor: pressed && onPress ? colors.tilePressed : color }, style]}
    >
      {children}
    </Pressable>
  );
}

export function Big({ children, color = colors.text }: { children: ReactNode; color?: string }) {
  return <Text style={[s.big, { color }]}>{children}</Text>;
}

export function Label({ children, color = colors.text }: { children: ReactNode; color?: string }) {
  return <Text style={[s.label, { color }]}>{children}</Text>;
}

export function Small({ children }: { children: ReactNode }) {
  return <Text style={s.small}>{children}</Text>;
}

export function Bar({ pct, color }: { pct: number; color: string }) {
  return (
    <View style={s.track}>
      <View style={[s.fill, { width: `${Math.max(0, Math.min(1, pct)) * 100}%`, backgroundColor: color }]} />
    </View>
  );
}

export function Pill({ label, onPress, color = colors.tile, textColor = colors.text }: { label: string; onPress: () => void; color?: string; textColor?: string }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => {
        tap();
        onPress();
      }}
      style={({ pressed }) => [s.pill, { backgroundColor: color, opacity: pressed ? 0.7 : 1 }]}
    >
      <Text style={[s.pillText, { color: textColor }]}>{label}</Text>
    </Pressable>
  );
}

export function Row({ children }: { children: ReactNode }) {
  return <View style={s.row}>{children}</View>;
}

const s = StyleSheet.create({
  tile: { borderRadius: 22, padding: 14, gap: 4 },
  big: { fontSize: 34, fontWeight: '700', fontVariant: ['tabular-nums'] },
  label: { fontSize: 16, fontWeight: '600' },
  small: { fontSize: 13, color: colors.muted },
  track: { height: 8, borderRadius: 4, backgroundColor: colors.track, overflow: 'hidden', marginTop: 4 },
  fill: { height: '100%', borderRadius: 4 },
  pill: { flexGrow: 1, minHeight: 48, borderRadius: 24, paddingHorizontal: 14, alignItems: 'center', justifyContent: 'center' },
  pillText: { fontSize: 16, fontWeight: '700' },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
});
