import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { HangoutCard } from '@/src/components/HangoutCard';
import { PrimaryButton } from '@/src/components/ui';
import { isGoogleConfigured } from '@/src/google';
import { useStore } from '@/src/store';
import { colors } from '@/src/theme';

export default function HangoutsScreen() {
  const store = useStore();
  const upcoming = store.upcoming();
  const cleared = store.snapshot.hangouts.filter((h) => h.status === 'completed');

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.hero}>Plan it like a co-op mission.</Text>
      <Text style={styles.lede}>
        Shared interests, overlapping budget, a window that actually works, and a route nobody has to drive across town for.
      </Text>
      {!isGoogleConfigured() ? (
        <View style={styles.banner}>
          <Text style={styles.bannerText}>
            Google Maps is in demo mode. Add EXPO_PUBLIC_GOOGLE_MAPS_API_KEY to search live open places.
          </Text>
        </View>
      ) : null}
      <PrimaryButton title="Plan a hangout" onPress={() => router.push('/create-hangout')} />
      {upcoming.map((hangout) => (
        <HangoutCard key={hangout.id} hangout={hangout} report={store.matchFor(hangout)} />
      ))}
      {cleared.length ? <Text style={styles.section}>Cleared</Text> : null}
      {cleared.map((hangout) => (
        <HangoutCard key={hangout.id} hangout={hangout} report={store.matchFor(hangout)} />
      ))}
      {!upcoming.length && !cleared.length ? (
        <Text style={styles.lede}>Build a crew, then drop stops on the map.</Text>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.ink },
  content: { padding: 16, gap: 14, paddingBottom: 40 },
  hero: { color: colors.cream, fontSize: 28, fontWeight: '800' },
  lede: { color: colors.mute, fontSize: 15, lineHeight: 22 },
  banner: { backgroundColor: colors.lime, borderRadius: 14, padding: 12 },
  bannerText: { color: colors.ink, fontWeight: '700', fontSize: 13 },
  section: { color: colors.cream, fontSize: 18, fontWeight: '800', marginTop: 8 },
});
