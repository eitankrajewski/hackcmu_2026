import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { Card, Meter, PrimaryButton } from '@/src/components/ui';
import { nid } from '@/src/ids';
import { matchReport } from '@/src/matching';
import { INTERESTS, type Hangout, type Interest } from '@/src/types';
import { useStore } from '@/src/store';
import { colors } from '@/src/theme';

export default function CreateHangoutScreen() {
  const store = useStore();
  const [title, setTitle] = useState('');
  const [vibe, setVibe] = useState('');
  const [groupID, setGroupID] = useState(store.snapshot.groups[0]?.id ?? '');
  const [budget, setBudget] = useState(30);
  const [miles, setMiles] = useState(5);
  const [interests, setInterests] = useState<Interest[]>(() => {
    const crew = store.snapshot.groups[0];
    return crew ? store.groupInsights(crew).sharedInterests : [];
  });
  const start = useMemo(() => new Date(Date.now() + 4 * 3600000), []);
  const end = useMemo(() => new Date(Date.now() + 8 * 3600000), []);

  const draft: Hangout | null = groupID
    ? {
        id: 'draft',
        title: title || 'Untitled',
        vibe,
        groupID,
        hostID: store.you.id,
        interests,
        budgetPerPerson: budget,
        start: start.toISOString(),
        end: end.toISOString(),
        maxDistanceMiles: miles,
        stops: [],
        status: 'drafting',
        lobby: { readyIDs: [], lockedIn: false, currentStopIndex: 0 },
      }
    : null;
  const crew = store.group(groupID);
  const report = draft && crew ? matchReport(draft, store.members(crew)) : null;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.label}>Mission name</Text>
      <TextInput value={title} onChangeText={setTitle} placeholder="Thursday gold-run" placeholderTextColor={colors.mute} style={styles.input} />
      <Text style={styles.label}>Vibe</Text>
      <TextInput value={vibe} onChangeText={setVibe} placeholder="Cheap eats, then a sidequest" placeholderTextColor={colors.mute} style={styles.input} />
      <Text style={styles.label}>Crew</Text>
      {store.snapshot.groups.map((crew) => (
        <Pressable
          key={crew.id}
          onPress={() => {
            setGroupID(crew.id);
            setInterests(store.groupInsights(crew).sharedInterests);
          }}
          style={[styles.crew, groupID === crew.id && styles.crewOn]}>
          <Text style={styles.title}>{crew.emoji} {crew.name}</Text>
          <Text style={styles.mute}>{crew.memberIDs.length} people</Text>
        </Pressable>
      ))}
      <Text style={styles.label}>Budget per person · ${budget}</Text>
      <View style={styles.row}>
        <Pressable onPress={() => setBudget((n) => Math.max(5, n - 5))} style={styles.step}><Text style={styles.stepText}>–</Text></Pressable>
        <Pressable onPress={() => setBudget((n) => Math.min(120, n + 5))} style={styles.step}><Text style={styles.stepText}>+</Text></Pressable>
      </View>
      <Text style={styles.label}>Max distance · {miles} mi</Text>
      <View style={styles.row}>
        <Pressable onPress={() => setMiles((n) => Math.max(1, n - 1))} style={styles.step}><Text style={styles.stepText}>–</Text></Pressable>
        <Pressable onPress={() => setMiles((n) => Math.min(20, n + 1))} style={styles.step}><Text style={styles.stepText}>+</Text></Pressable>
      </View>
      <Text style={styles.label}>Interests to optimize for</Text>
      <View style={styles.wrap}>
        {INTERESTS.map((item) => {
          const on = interests.includes(item.id);
          return (
            <Pressable
              key={item.id}
              onPress={() => setInterests((curr) => (on ? curr.filter((i) => i !== item.id) : [...curr, item.id]))}
              style={[styles.chip, on && styles.chipOn]}>
              <Text style={{ color: on ? colors.ink : colors.cream, fontWeight: '800' }}>{item.emoji} {item.label}</Text>
            </Pressable>
          );
        })}
      </View>
      {report ? (
        <Card>
          <Text style={styles.title}>Projected match {Math.round(report.overall * 100)}%</Text>
          <Meter label="Interests" value={report.interest} />
          <Meter label="Budget" value={report.budget} tint={colors.good} />
          <Meter label="Timeline" value={report.timeline} tint={colors.grape} />
          <Meter label="Distance" value={report.distance} tint={colors.hot} />
        </Card>
      ) : null}
      <PrimaryButton
        title="Create plan"
        disabled={!title.trim() || !groupID}
        onPress={() => {
          const id = nid('hang');
          store.upsertHangout({
            ...draft!,
            id,
            title: title.trim(),
            status: 'scheduled',
          });
          router.replace(`/hangout/${id}`);
        }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.ink },
  content: { padding: 16, gap: 10, paddingBottom: 40 },
  label: { color: colors.cream, fontWeight: '800', marginTop: 6 },
  input: { backgroundColor: colors.inkCard, color: colors.cream, borderRadius: 12, padding: 12 },
  crew: { backgroundColor: colors.inkCard, borderRadius: 16, padding: 12 },
  crewOn: { borderWidth: 2, borderColor: colors.lime },
  title: { color: colors.cream, fontWeight: '800' },
  mute: { color: colors.mute },
  row: { flexDirection: 'row', gap: 8 },
  step: { backgroundColor: colors.inkCard, paddingHorizontal: 18, paddingVertical: 10, borderRadius: 12 },
  stepText: { color: colors.cream, fontSize: 20, fontWeight: '800' },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { backgroundColor: colors.inkCard, paddingHorizontal: 10, paddingVertical: 10, borderRadius: 12 },
  chipOn: { backgroundColor: colors.lime },
});
