import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { MapCanvas } from '@/src/components/MapCanvas';
import { Card, Chip } from '@/src/components/ui';
import { isOpen, meetingPoint, milesBetween, priceLabel, sharedBudget, sharedInterests } from '@/src/matching';
import { searchPlaces } from '@/src/places';
import { useStore } from '@/src/store';
import { colors } from '@/src/theme';
import { categoriesFor, type Place } from '@/src/types';

export default function DiscoverScreen() {
  const store = useStore();
  const [groupID, setGroupID] = useState<string | 'me'>('me');
  const [openNow, setOpenNow] = useState(true);
  const [results, setResults] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);

  const origin = useMemo(() => {
    if (groupID !== 'me') {
      const crew = store.group(groupID);
      if (crew) {
        const meet = meetingPoint(store.members(crew));
        if (meet) return meet;
      }
    }
    return store.you.home;
  }, [groupID, store]);

  useEffect(() => {
    let dead = false;
    (async () => {
      setLoading(true);
      const crew = groupID === 'me' ? null : store.group(groupID);
      const people = crew ? store.members(crew) : [store.you];
      const budget = sharedBudget(people);
      const vibe = sharedInterests(people);
      const types = categoriesFor(vibe.length ? vibe : people.flatMap((p) => p.interests));
      const query = {
        near: origin,
        radiusMeters: 4000,
        openNow,
        maxPrice: budget ? Math.max(1, Math.round(budget.max / 20)) : undefined,
      };
      let list = await searchPlaces({ ...query, types });
      if (!list.length) list = await searchPlaces(query);
      if (!dead) {
        setResults(list);
        setLoading(false);
      }
    })();
    return () => {
      dead = true;
    };
  }, [groupID, openNow, origin, store]);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.lede}>Places that are actually open, scored against the crew you pick.</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
        <Pressable onPress={() => setGroupID('me')} style={[styles.pill, groupID === 'me' && styles.pillOn]}>
          <Text style={styles.pillText}>Near me</Text>
        </Pressable>
        {store.snapshot.groups.map((crew) => (
          <Pressable key={crew.id} onPress={() => setGroupID(crew.id)} style={[styles.pill, groupID === crew.id && styles.pillOn]}>
            <Text style={styles.pillText}>{crew.emoji} {crew.name}</Text>
          </Pressable>
        ))}
      </ScrollView>
      <Pressable onPress={() => setOpenNow((v) => !v)} style={[styles.pill, openNow && styles.pillOn]}>
        <Text style={styles.pillText}>{openNow ? 'Only open now' : 'Include closed'}</Text>
      </Pressable>
      <MapCanvas
        camera={origin}
        pins={[
          { id: 'you', title: 'Center', coordinate: origin, kind: 'meet' },
          ...results.slice(0, 15).map((p) => ({ id: p.id, title: p.name, coordinate: p.coordinate, kind: 'candidate' as const })),
        ]}
        style={{ height: 240 }}
      />
      {loading ? <Text style={styles.mute}>Checking what's open…</Text> : null}
      {!loading && results.length === 0 ? (
        <Card>
          <Text style={styles.title}>Nothing open in this window</Text>
          <Text style={styles.mute}>
            {openNow
              ? 'No catalog spots are marked open right now. Tap Include closed, pick another crew, or add a Google Maps key for live Places search.'
              : 'No places matched this crew’s range. Widen budget or drop a pin from a hangout instead.'}
          </Text>
        </Card>
      ) : null}
      {results.map((place) => (
        <Card key={place.id}>
          <View style={styles.row}>
            <Text style={styles.title}>{place.name}</Text>
            <Chip text={isOpen(place) ? 'Open' : 'Closed'} tone={isOpen(place) ? colors.lime : colors.hot} />
          </View>
          <Text style={styles.mute}>{place.address}</Text>
          <Text style={styles.mute}>
            {priceLabel(place.priceLevel)} · {milesBetween(place.coordinate, origin).toFixed(1)} mi
            {place.rating ? ` · ★ ${place.rating.toFixed(1)}` : ''}
            {store.crewRating(place.id) ? ` · crew ★ ${store.crewRating(place.id)!.toFixed(1)}` : ''}
          </Text>
          {store.upcoming().length ? (
            <Pressable
              onPress={() => store.addStop(store.upcoming()[0].id, place)}
              style={styles.add}>
              <Text style={styles.addText}>Add to {store.upcoming()[0].title}</Text>
            </Pressable>
          ) : null}
        </Card>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.ink },
  content: { padding: 16, gap: 12, paddingBottom: 40 },
  lede: { color: colors.mute, fontSize: 15, lineHeight: 22 },
  mute: { color: colors.mute },
  title: { color: colors.cream, fontWeight: '800', fontSize: 16, flex: 1 },
  row: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  pill: { backgroundColor: colors.inkCard, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999 },
  pillOn: { backgroundColor: colors.grape },
  pillText: { color: colors.cream, fontWeight: '700' },
  add: { backgroundColor: colors.lime, borderRadius: 12, padding: 10, alignItems: 'center' },
  addText: { color: colors.ink, fontWeight: '800' },
});
