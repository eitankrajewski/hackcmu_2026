import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Card, PrimaryButton } from '@/src/components/ui';
import { INTERESTS } from '@/src/types';
import { useStore } from '@/src/store';
import { colors } from '@/src/theme';

export default function CrewsScreen() {
  const store = useStore();
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.lede}>
        Keep crews separate so a park day doesn’t inherit a nightlife budget.
      </Text>
      <PrimaryButton title="New crew" onPress={() => router.push('/create-crew')} />
      {store.snapshot.groups.map((crew) => {
        const report = store.groupInsights(crew);
        const people = store.members(crew);
        return (
          <Pressable key={crew.id} onPress={() => router.push(`/group/${crew.id}`)}>
            <Card>
              <View style={styles.row}>
                <Text style={{ fontSize: 32 }}>{crew.emoji}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.title}>{crew.name}</Text>
                  <Text style={styles.mute}>{crew.tagline}</Text>
                </View>
                <Text style={styles.count}>{crew.memberIDs.length}</Text>
              </View>
              <Text style={styles.faces}>{people.map((p) => p.emoji).join(' ')}</Text>
              {report.sharedBudget ? (
                <Text style={styles.lime}>
                  Shared budget ${report.sharedBudget.min}–${report.sharedBudget.max}
                </Text>
              ) : (
                <Text style={styles.hot}>No budget overlap</Text>
              )}
              <Text style={styles.mute}>
                {report.sharedInterests.map((id) => INTERESTS.find((i) => i.id === id)?.label).join(' · ') ||
                  'No fully shared interests'}
              </Text>
            </Card>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.ink },
  content: { padding: 16, gap: 14, paddingBottom: 40 },
  lede: { color: colors.mute, fontSize: 15, lineHeight: 22 },
  row: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  title: { color: colors.cream, fontSize: 18, fontWeight: '800' },
  mute: { color: colors.mute, fontSize: 13 },
  count: { color: colors.cream, fontSize: 22, fontWeight: '800' },
  faces: { fontSize: 22 },
  lime: { color: colors.lime, fontWeight: '700' },
  hot: { color: colors.hot, fontWeight: '700' },
});
