import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme';

export function Card({ children }: { children: ReactNode }) {
  return <View style={styles.card}>{children}</View>;
}

export function Chip({ text, tone = colors.lime }: { text: string; tone?: string }) {
  return (
    <View style={[styles.chip, { backgroundColor: tone }]}>
      <Text style={styles.chipText}>{text}</Text>
    </View>
  );
}

export function Meter({ label, value, tint = colors.lime }: { label: string; value: number; tint?: string }) {
  const pct = Math.round(Math.max(0, Math.min(1, value)) * 100);
  return (
    <View style={{ gap: 6 }}>
      <View style={styles.meterRow}>
        <Text style={styles.meterLabel}>{label.toUpperCase()}</Text>
        <Text style={[styles.meterValue, { color: tint }]}>{pct}%</Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${Math.max(8, pct)}%` as `${number}%`, backgroundColor: tint }]} />
      </View>
    </View>
  );
}

export function PrimaryButton({
  title,
  onPress,
  disabled,
}: {
  title: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[styles.primary, { opacity: disabled ? 0.4 : 1 }]}>
      <Text style={styles.primaryText}>{title}</Text>
    </Pressable>
  );
}

export function GhostButton({ title, onPress }: { title: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.ghost}>
      <Text style={styles.ghostText}>{title}</Text>
    </Pressable>
  );
}

export function Screen({ children }: { children: ReactNode }) {
  return <View style={styles.screen}>{children}</View>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.ink },
  card: {
    backgroundColor: colors.inkCard,
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    gap: 10,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    alignSelf: 'flex-start',
  },
  chipText: { color: colors.ink, fontWeight: '800', fontSize: 12 },
  meterRow: { flexDirection: 'row', justifyContent: 'space-between' },
  meterLabel: { color: colors.mute, fontSize: 11, fontWeight: '800', letterSpacing: 0.8 },
  meterValue: { fontWeight: '800', fontSize: 12 },
  track: { height: 8, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 99, overflow: 'hidden' },
  fill: { height: 8, borderRadius: 99 },
  primary: {
    backgroundColor: colors.lime,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryText: { color: colors.ink, fontWeight: '800', fontSize: 16 },
  ghost: {
    backgroundColor: colors.inkCard,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  ghostText: { color: colors.cream, fontWeight: '700', fontSize: 16 },
});
