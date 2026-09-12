import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Card, Chip, Meter } from '@/src/components/ui';
import { useStore } from '@/src/store';
import { colors } from '@/src/theme';
import { STATUS_LABEL, type Hangout, type MatchReport } from '@/src/types';

function tone(status: Hangout['status']) {
  switch (status) {
    case 'drafting':
      return colors.mute;
    case 'scheduled':
      return colors.grape;
    case 'lobby':
      return colors.lime;
    case 'live':
      return colors.hot;
    default:
      return colors.good;
  }
}

export function HangoutCard({ hangout, report }: { hangout: Hangout; report: MatchReport }) {
  const store = useStore();
  const crew = store.group(hangout.groupID);
  return (
    <Pressable onPress={() => router.push(`/hangout/${hangout.id}`)}>
      <Card>
        <View style={styles.row}>
          <Text style={styles.emoji}>{crew?.emoji ?? '🎯'}</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>{hangout.title}</Text>
            <Text style={styles.mute}>{crew?.name ?? 'Crew'}</Text>
          </View>
          <Chip text={STATUS_LABEL[hangout.status]} tone={tone(hangout.status)} />
        </View>
        <Text style={styles.when}>
          {new Date(hangout.start).toLocaleString(undefined, {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
          })}
        </Text>
        <Text style={styles.mute}>
          {hangout.stops.length} stops · ${hangout.budgetPerPerson} · {Math.round(report.overall * 100)}% match
        </Text>
        <Meter label="Fit" value={report.overall} />
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  emoji: { fontSize: 28 },
  title: { color: colors.cream, fontSize: 18, fontWeight: '800' },
  mute: { color: colors.mute, fontSize: 13 },
  when: { color: colors.cream, fontWeight: '700' },
});
