import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { MapCanvas } from '@/src/components/MapCanvas';
import { Card, Chip, Meter, PrimaryButton } from '@/src/components/ui';
import { isOpen, milesBetween, priceLabel, sortedStops } from '@/src/matching';
import { INTERESTS, STATUS_LABEL } from '@/src/types';
import { useStore } from '@/src/store';
import { colors } from '@/src/theme';

export default function HangoutDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const store = useStore();
  const hangout = store.hangout(id);
  if (!hangout) {
    return <View style={styles.screen}><Text style={styles.mute}>Hangout vanished.</Text></View>;
  }
  const report = store.matchFor(hangout);
  const crew = store.group(hangout.groupID);
  const stops = sortedStops(hangout);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <MapCanvas
        camera={stops[0]?.place.coordinate ?? report.meetingPoint ?? store.you.home}
        pins={stops.map((stop, index) => ({
          id: stop.id,
          title: `${index + 1}. ${stop.place.name}`,
          coordinate: stop.place.coordinate,
          kind: 'stop' as const,
        }))}
        path={stops.map((s) => s.place.coordinate)}
        style={{ height: 220 }}
      />
      <Card>
        <View style={styles.row}>
          <Text style={{ fontSize: 28 }}>{crew?.emoji ?? '🎯'}</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>{hangout.title}</Text>
            <Text style={styles.mute}>{crew?.name}</Text>
          </View>
          <Chip text={STATUS_LABEL[hangout.status]} />
        </View>
        <Text style={{ color: colors.cream, fontWeight: '700' }}>{hangout.vibe}</Text>
        <Text style={styles.mute}>
          {new Date(hangout.start).toLocaleString()} → {new Date(hangout.end).toLocaleTimeString()}
        </Text>
        <Text style={styles.mute}>
          {hangout.interests.map((i) => INTERESTS.find((x) => x.id === i)?.label).join(' · ')}
        </Text>
        {report.notes.map((note) => (
          <Text key={note} style={styles.mute}>{note}</Text>
        ))}
      </Card>
      <Card>
        <Meter label="Interests" value={report.interest} />
        <Meter label="Budget" value={report.budget} tint={colors.good} />
        <Meter label="Timeline" value={report.timeline} tint={colors.grape} />
        <Meter label="Distance" value={report.distance} tint={colors.hot} />
      </Card>
      <Card>
        <View style={styles.row}>
          <Text style={styles.title}>Route</Text>
          <Pressable onPress={() => router.push(`/add-stop/${hangout.id}`)}>
            <Text style={styles.lime}>+ Add location</Text>
          </Pressable>
        </View>
        {stops.length === 0 ? (
          <Text style={styles.mute}>Drop every location on the map. Sidequest checks whether it’s open and how far each friend has to travel.</Text>
        ) : null}
        {stops.map((stop, index) => (
          <Pressable
            key={stop.id}
            onLongPress={() => store.removeStop(hangout.id, stop.id)}
            style={styles.stop}>
            <View style={styles.badge}><Text style={styles.badgeText}>{index + 1}</Text></View>
            <View style={{ flex: 1, gap: 4 }}>
              <View style={styles.row}>
                <Text style={styles.title}>{stop.place.name}</Text>
                <Chip text={isOpen(stop.place) ? 'Open' : 'Closed'} tone={isOpen(stop.place) ? colors.lime : colors.hot} />
              </View>
              <Text style={styles.mute}>{stop.place.address}</Text>
              <Text style={styles.mute}>
                {priceLabel(stop.place.priceLevel)}
                {stop.place.rating ? ` · ★ ${stop.place.rating.toFixed(1)}` : ''}
                {report.meetingPoint ? ` · ${milesBetween(stop.place.coordinate, report.meetingPoint).toFixed(1)} mi from meet` : ''}
              </Text>
              {stop.notes ? <Text style={{ color: colors.cream }}>{stop.notes}</Text> : null}
            </View>
          </Pressable>
        ))}
      </Card>
      {hangout.status === 'completed' ? (
        <PrimaryButton title="Write a review" onPress={() => router.push(`/lobby/${hangout.id}`)} />
      ) : hangout.status === 'live' || hangout.status === 'lobby' ? (
        <PrimaryButton title={hangout.status === 'live' ? 'Rejoin live hangout' : 'Back to lobby'} onPress={() => router.push(`/lobby/${hangout.id}`)} />
      ) : (
        <PrimaryButton
          title="Open game lobby"
          onPress={() => {
            store.startLobby(hangout.id);
            router.push(`/lobby/${hangout.id}`);
          }}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.ink },
  content: { padding: 16, gap: 12, paddingBottom: 40 },
  title: { color: colors.cream, fontSize: 16, fontWeight: '800', flex: 1 },
  mute: { color: colors.mute },
  lime: { color: colors.lime, fontWeight: '800' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  stop: { flexDirection: 'row', gap: 12, paddingVertical: 6 },
  badge: { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.lime, alignItems: 'center', justifyContent: 'center' },
  badgeText: { color: colors.ink, fontWeight: '800' },
});
