import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { MapCanvas } from '@/src/components/MapCanvas';
import { Card, Chip, GhostButton, PrimaryButton } from '@/src/components/ui';
import { nid } from '@/src/ids';
import { isOpen, hoursSummary, priceLabel, sortedStops } from '@/src/matching';
import { alternatives } from '@/src/places';
import { useStore } from '@/src/store';
import { colors } from '@/src/theme';
import type { Place } from '@/src/types';

export default function LobbyScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const store = useStore();
  const hangout = store.hangout(id);
  const crew = hangout ? store.group(hangout.groupID) : undefined;
  const [reroutes, setReroutes] = useState<Place[]>([]);
  const [showReroute, setShowReroute] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [rating, setRating] = useState(4);
  const [body, setBody] = useState('');
  const [placeID, setPlaceID] = useState(hangout?.stops[0]?.place.id ?? '');

  const members = useMemo(() => (crew ? store.members(crew) : []), [crew, store]);
  if (!hangout || !crew) {
    return <View style={styles.screen}><Text style={styles.mute}>Lobby closed.</Text></View>;
  }
  const readyCount = members.filter((p) => hangout.lobby.readyIDs.includes(p.id)).length;
  const allReady = members.every((p) => hangout.lobby.readyIDs.includes(p.id));
  const stops = sortedStops(hangout);
  const current = stops[hangout.lobby.currentStopIndex] ?? stops[stops.length - 1];

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.kicker}>{hangout.status === 'live' ? 'QUEST LIVE' : 'SQUAD ASSEMBLE'}</Text>
      <Text style={styles.hero}>{hangout.title}</Text>
      <Text style={styles.mute}>{readyCount}/{members.length} ready</Text>
      <View style={styles.grid}>
        {members.map((person) => {
          const ready = hangout.lobby.readyIDs.includes(person.id);
          return (
            <Pressable key={person.id} onPress={() => store.toggleReady(hangout.id, person.id)} style={styles.slot}>
              <Text style={{ fontSize: 36 }}>{person.emoji}</Text>
              <Text style={styles.title}>{person.id === store.you.id ? 'You' : person.name.split(' ')[0]}</Text>
              <Chip text={ready ? 'READY' : 'WAITING'} tone={ready ? colors.lime : colors.mute} />
            </Pressable>
          );
        })}
      </View>
      <Card>
        <Text style={styles.title}>Mission briefing</Text>
        {stops.map((stop, index) => (
          <Text key={stop.id} style={styles.mute}>
            {index + 1}. {stop.place.name} — {isOpen(stop.place) ? `Open · ${hoursSummary(stop.place.hours)}` : 'Closed — reroute available'}
          </Text>
        ))}
      </Card>
      {hangout.status === 'live' && current ? (
        <Card>
          <Text style={styles.kicker}>Current objective</Text>
          <Text style={styles.hero}>{current.place.name}</Text>
          <Text style={styles.mute}>{current.place.address}</Text>
          <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
            <Chip text={isOpen(current.place) ? 'Open' : 'Closed'} tone={isOpen(current.place) ? colors.lime : colors.hot} />
            <Chip text={priceLabel(current.place.priceLevel)} tone={colors.grape} />
          </View>
          <MapCanvas
            camera={current.place.coordinate}
            pins={[{ id: current.id, title: current.place.name, coordinate: current.place.coordinate, kind: 'stop' }]}
            path={stops.map((s) => s.place.coordinate)}
            style={{ height: 180 }}
          />
          {!isOpen(current.place) ? (
            <GhostButton
              title="Find an open sidequest"
              onPress={() => {
                const meet = store.matchFor(hangout).meetingPoint ?? current.place.coordinate;
                setReroutes(alternatives(current.place, meet, Math.max(1, Math.round(hangout.budgetPerPerson / 15))));
                setShowReroute(true);
              }}
            />
          ) : null}
        </Card>
      ) : null}

      {hangout.status !== 'live' && hangout.status !== 'completed' ? (
        <>
          <PrimaryButton
            title={hangout.lobby.readyIDs.includes(store.you.id) ? "You're ready" : 'Ready up'}
            onPress={() => store.toggleReady(hangout.id, store.you.id)}
          />
          <GhostButton title="Ping the squad" onPress={() => store.pingSquad(hangout.id)} />
          <PrimaryButton
            title="Launch quest"
            disabled={!allReady || hangout.stops.length === 0}
            onPress={() => store.launchHangout(hangout.id)}
          />
        </>
      ) : null}

      {hangout.status === 'live' ? (
        <PrimaryButton
          title={hangout.lobby.currentStopIndex + 1 >= stops.length ? 'Clear hangout' : 'Next stop'}
          onPress={() => {
            store.advanceStop(hangout.id);
            const next = store.hangout(hangout.id);
            if (next?.status === 'completed') {
              setPlaceID(stops[0]?.place.id ?? '');
              setReviewOpen(true);
            }
          }}
        />
      ) : null}

      {hangout.status === 'completed' ? (
        <PrimaryButton title="Write a review" onPress={() => setReviewOpen(true)} />
      ) : null}

      <Modal visible={showReroute} animationType="slide" onRequestClose={() => setShowReroute(false)}>
        <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
          <Text style={styles.hero}>Open sidequests</Text>
          {reroutes.length === 0 ? <Text style={styles.mute}>Nothing else is open nearby.</Text> : null}
          {reroutes.map((place) => (
            <Pressable
              key={place.id}
              style={styles.slot}
              onPress={() => {
                store.addStop(hangout.id, place, 'Reroute — original stop was closed');
                setShowReroute(false);
              }}>
              <Text style={styles.title}>{place.name}</Text>
              <Text style={styles.mute}>Open now · {priceLabel(place.priceLevel)} · {place.address}</Text>
            </Pressable>
          ))}
          <GhostButton title="Close" onPress={() => setShowReroute(false)} />
        </ScrollView>
      </Modal>

      <Modal visible={reviewOpen} animationType="slide" onRequestClose={() => setReviewOpen(false)}>
        <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
          <Text style={styles.hero}>Crew review</Text>
          {stops.map((stop) => (
            <Pressable key={stop.id} onPress={() => setPlaceID(stop.place.id)} style={[styles.slot, placeID === stop.place.id && { borderColor: colors.lime, borderWidth: 2 }]}>
              <Text style={styles.title}>{stop.place.name}</Text>
            </Pressable>
          ))}
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {[1, 2, 3, 4, 5].map((n) => (
              <Pressable key={n} onPress={() => setRating(n)}>
                <Text style={{ fontSize: 28 }}>{n <= rating ? '★' : '☆'}</Text>
              </Pressable>
            ))}
          </View>
          <TextInput
            value={body}
            onChangeText={setBody}
            placeholder="How did it actually go?"
            placeholderTextColor={colors.mute}
            multiline
            style={styles.input}
          />
          <PrimaryButton
            title="Post"
            disabled={!placeID || !body.trim()}
            onPress={() => {
              store.addReview({
                id: nid('rev'),
                placeID,
                authorID: store.you.id,
                hangoutID: hangout.id,
                rating,
                body: body.trim(),
                createdAt: new Date().toISOString(),
                tags: [],
              });
              setReviewOpen(false);
              setBody('');
              router.back();
            }}
          />
          <GhostButton title="Close" onPress={() => setReviewOpen(false)} />
        </ScrollView>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.ink },
  content: { padding: 16, gap: 12, paddingBottom: 40 },
  kicker: { color: colors.lime, fontWeight: '900', letterSpacing: 2, textAlign: 'center' },
  hero: { color: colors.cream, fontSize: 32, fontWeight: '800', textAlign: 'center' },
  mute: { color: colors.mute, textAlign: 'center' },
  title: { color: colors.cream, fontWeight: '800' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  slot: { width: '47%', backgroundColor: colors.inkCard, borderRadius: 22, padding: 16, alignItems: 'center', gap: 8 },
  input: { backgroundColor: colors.inkCard, color: colors.cream, borderRadius: 12, padding: 12, minHeight: 100, textAlignVertical: 'top' },
});
