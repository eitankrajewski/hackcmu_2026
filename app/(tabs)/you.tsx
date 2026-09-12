import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Card, GhostButton } from '@/src/components/ui';
import { isGoogleConfigured } from '@/src/google';
import { INTERESTS } from '@/src/types';
import { useStore } from '@/src/store';
import { colors } from '@/src/theme';

export default function YouScreen() {
  const store = useStore();
  const mine = store.snapshot.reviews.filter((r) => r.authorID === store.you.id);
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Card>
        <Text style={{ fontSize: 42 }}>{store.you.emoji}</Text>
        <Text style={styles.title}>{store.you.name}</Text>
        <Text style={styles.mute}>{store.you.handle}</Text>
        <Text style={styles.mute}>
          ${store.you.budgetMin}–${store.you.budgetMax} · free {store.you.typicalStartHour}:00–{Math.min(store.you.typicalEndHour, 24)}:00 · {store.you.maxTravelMiles} mi
        </Text>
        <Text style={styles.mute}>
          {store.you.interests.map((id) => INTERESTS.find((i) => i.id === id)?.label).join(' · ')}
        </Text>
      </Card>
      <Card>
        <Text style={styles.title}>How matching works</Text>
        <Text style={styles.mute}>
          Each hangout is scored from four signals pulled off the crew: overlapping interests, the budget window everyone can live with, whether the time sits inside typical availability, and how far each person is from the stops you drop on the map.
        </Text>
      </Card>
      <Card>
        <Text style={styles.title}>Google Maps</Text>
        <Text style={isGoogleConfigured() ? styles.good : styles.mute}>
          {isGoogleConfigured()
            ? 'Live Maps JavaScript API + Places search is on.'
            : 'Running on the Mission District demo catalog. Set EXPO_PUBLIC_GOOGLE_MAPS_API_KEY in .env (Maps JavaScript API, Places API, Geocoding API).'}
        </Text>
      </Card>
      <Text style={styles.title}>Your reviews</Text>
      {mine.length === 0 ? <Text style={styles.mute}>Clear a hangout, then rate the stops.</Text> : null}
      {mine.map((review) => {
        const place = store.snapshot.demoPlaces.find((p) => p.id === review.placeID);
        const author = store.person(review.authorID);
        return (
          <Card key={review.id}>
            <Text style={styles.title}>{place?.name ?? 'Place'}</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={styles.mute}>{author?.emoji} {author?.name}</Text>
              <Text style={styles.lime}>{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</Text>
            </View>
            <Text style={{ color: colors.cream }}>{review.body}</Text>
          </Card>
        );
      })}
      <GhostButton title="Reset demo data" onPress={() => store.resetDemo()} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.ink },
  content: { padding: 16, gap: 14, paddingBottom: 40 },
  title: { color: colors.cream, fontSize: 18, fontWeight: '800' },
  mute: { color: colors.mute, lineHeight: 22 },
  good: { color: colors.good, fontWeight: '700' },
  lime: { color: colors.lime, fontWeight: '700' },
});
