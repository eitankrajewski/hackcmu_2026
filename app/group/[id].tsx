import { useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { HangoutCard } from '@/src/components/HangoutCard';
import { MapCanvas } from '@/src/components/MapCanvas';
import { Card } from '@/src/components/ui';
import { INTERESTS } from '@/src/types';
import { useStore } from '@/src/store';
import { colors } from '@/src/theme';

export default function GroupDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const store = useStore();
  const crew = store.group(id);
  if (!crew) {
    return (
      <View style={styles.screen}>
        <Text style={styles.mute}>This crew is gone.</Text>
      </View>
    );
  }
  const people = store.members(crew);
  const report = store.groupInsights(crew);
  const related = store.snapshot.hangouts.filter((h) => h.groupID === crew.id);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Card>
        <Text style={{ fontSize: 42 }}>{crew.emoji}</Text>
        <Text style={styles.title}>{crew.name}</Text>
        <Text style={styles.mute}>{crew.tagline}</Text>
        {report.sharedBudget ? (
          <Text style={styles.lime}>Budget overlap ${report.sharedBudget.min}–${report.sharedBudget.max} per person</Text>
        ) : (
          <Text style={styles.hot}>No budget overlap</Text>
        )}
        <Text style={styles.mute}>
          {report.sharedInterests.map((i) => INTERESTS.find((x) => x.id === i)?.label).join(' · ') || 'No fully shared interests'}
        </Text>
      </Card>
      <MapCanvas
        camera={report.meetingPoint ?? store.you.home}
        pins={[
          ...people.map((p) => ({ id: p.id, title: p.name, coordinate: p.home, kind: 'person' as const })),
          ...(report.meetingPoint ? [{ id: 'meet', title: 'Meet', coordinate: report.meetingPoint, kind: 'meet' as const }] : []),
        ]}
        style={{ height: 220 }}
      />
      <Text style={styles.title}>Roster</Text>
      {people.map((person) => (
        <Card key={person.id}>
          <Text style={{ fontSize: 28 }}>{person.emoji}</Text>
          <Text style={styles.title}>{person.name}</Text>
          <Text style={styles.mute}>
            ${person.budgetMin}–${person.budgetMax} · {person.typicalStartHour}:00–{Math.min(person.typicalEndHour, 24)}:00 · {person.maxTravelMiles} mi
          </Text>
        </Card>
      ))}
      <Text style={styles.title}>Hangouts</Text>
      {related.map((hangout) => (
        <HangoutCard key={hangout.id} hangout={hangout} report={store.matchFor(hangout)} />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.ink },
  content: { padding: 16, gap: 12, paddingBottom: 40 },
  title: { color: colors.cream, fontSize: 18, fontWeight: '800' },
  mute: { color: colors.mute },
  lime: { color: colors.lime, fontWeight: '700' },
  hot: { color: colors.hot, fontWeight: '700' },
});
