import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { MapCanvas } from '@/src/components/MapCanvas';
import { Card, Chip, PrimaryButton } from '@/src/components/ui';
import { isGoogleConfigured } from '@/src/google';
import { isOpen, milesBetween, priceLabel } from '@/src/matching';
import { autocompletePlaces, reverseGeocode, searchPlaces } from '@/src/places';
import { useStore } from '@/src/store';
import { colors } from '@/src/theme';
import type { GeoPoint, Place } from '@/src/types';

export default function AddStopScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const store = useStore();
  const hangout = store.hangout(id);
  const meet = hangout ? store.matchFor(hangout).meetingPoint ?? store.you.home : store.you.home;
  const [query, setQuery] = useState('');
  const [openNow, setOpenNow] = useState(true);
  const [results, setResults] = useState<Place[]>([]);
  const [camera, setCamera] = useState<GeoPoint>(meet);
  const [selected, setSelected] = useState<Place | null>(null);
  const [loading, setLoading] = useState(false);

  const refresh = async (text = query) => {
    if (!hangout) return;
    setLoading(true);
    const keyword = text.trim();
    const list = keyword
      ? await autocompletePlaces(keyword, meet)
      : await searchPlaces({
          near: meet,
          radiusMeters: 2800,
          keyword: hangout.interests[0],
          openNow,
          maxPrice: Math.max(1, Math.round(hangout.budgetPerPerson / 12)),
        });
    const filtered = openNow && keyword ? list.filter((p) => isOpen(p)) : list;
    setResults(filtered);
    if (filtered[0]) setCamera(filtered[0].coordinate);
    setLoading(false);
  };

  useEffect(() => {
    void refresh('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, openNow]);

  if (!hangout) {
    return <View style={styles.screen}><Text style={styles.mute}>Hangout missing.</Text></View>;
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <MapCanvas
        camera={camera}
        pins={[
          { id: 'meet', title: 'Meet', coordinate: meet, kind: 'meet' },
          ...results.slice(0, 20).map((p) => ({ id: p.id, title: p.name, coordinate: p.coordinate, kind: 'candidate' as const })),
        ]}
        onTapCoordinate={async (point) => {
          const place = await reverseGeocode(point);
          setSelected(place);
          setCamera(point);
        }}
        onSelectPin={(pin) => {
          const place = results.find((p) => p.id === pin.id);
          if (place) {
            setSelected(place);
            setCamera(place.coordinate);
          }
        }}
        style={{ height: 280 }}
      />
      <Text style={styles.hint}>
        {isGoogleConfigured() ? 'Tap the map to drop a Google pin' : 'Demo map · tap to drop a pin'}
      </Text>
      <View style={styles.search}>
        <TextInput
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={() => void refresh()}
          placeholder="Search Google Maps places"
          placeholderTextColor={colors.mute}
          style={styles.input}
        />
      </View>
      <Pressable onPress={() => setOpenNow((v) => !v)} style={[styles.pill, openNow && styles.pillOn]}>
        <Text style={styles.pillText}>{openNow ? 'Open now' : 'Any hours'}</Text>
      </Pressable>
      {loading ? <Text style={styles.mute}>Searching…</Text> : null}
      {results.map((place) => (
        <Pressable key={place.id} onPress={() => { setSelected(place); setCamera(place.coordinate); }}>
          <Card>
            <View style={styles.row}>
              <Text style={styles.title}>{place.name}</Text>
              <Chip text={isOpen(place) ? 'Open' : 'Closed'} tone={isOpen(place) ? colors.lime : colors.hot} />
            </View>
            <Text style={styles.mute}>{place.address}</Text>
            <Text style={styles.mute}>
              {priceLabel(place.priceLevel)} · {milesBetween(place.coordinate, meet).toFixed(1)} mi
              {place.rating ? ` · ★ ${place.rating.toFixed(1)}` : ''}
            </Text>
          </Card>
        </Pressable>
      ))}
      {selected ? (
        <Card>
          <Text style={styles.title}>{selected.name}</Text>
          <Text style={styles.mute}>{selected.address}</Text>
          <PrimaryButton
            title="Add this location"
            onPress={() => {
              store.addStop(hangout.id, selected);
              router.back();
            }}
          />
        </Card>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.ink },
  content: { padding: 16, gap: 10, paddingBottom: 48 },
  hint: { color: colors.cream, fontWeight: '700', textAlign: 'center' },
  search: { backgroundColor: colors.inkCard, borderRadius: 12, paddingHorizontal: 12 },
  input: { color: colors.cream, paddingVertical: 12 },
  mute: { color: colors.mute },
  title: { color: colors.cream, fontWeight: '800', flex: 1 },
  row: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  pill: { alignSelf: 'flex-start', backgroundColor: colors.inkCard, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999 },
  pillOn: { backgroundColor: colors.grape },
  pillText: { color: colors.cream, fontWeight: '800' },
});
