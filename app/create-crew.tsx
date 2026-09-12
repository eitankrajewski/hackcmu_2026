import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { Card, PrimaryButton } from '@/src/components/ui';
import { nid } from '@/src/ids';
import { INTERESTS, type Interest, type Person } from '@/src/types';
import { useStore } from '@/src/store';
import { colors } from '@/src/theme';

const EMOJIS = ['🎯', '🌃', '🌤️', '🎟️', '🍜', '🕹️', '🏕️', '🪩', '🚲', '🎨'];

export default function CreateCrewScreen() {
  const store = useStore();
  const [name, setName] = useState('');
  const [tagline, setTagline] = useState('');
  const [emoji, setEmoji] = useState('🎯');
  const [memberIDs, setMemberIDs] = useState<string[]>([store.you.id]);
  const [friendName, setFriendName] = useState('');
  const [friendInterests, setFriendInterests] = useState<Interest[]>(['food', 'coffee']);

  const addFriend = () => {
    if (!friendName.trim()) return;
    const person: Person = {
      id: nid('p'),
      name: friendName.trim(),
      handle: `@${friendName.trim().toLowerCase().replace(/\s+/g, '')}`,
      emoji: '🙂',
      accentHex: '7B5CFF',
      interests: friendInterests,
      budgetMin: 10,
      budgetMax: 40,
      home: { latitude: 37.76, longitude: -122.42 },
      typicalStartHour: 17,
      typicalEndHour: 23,
      maxTravelMiles: 6,
    };
    store.upsertPerson(person);
    setMemberIDs((ids) => [...ids, person.id]);
    setFriendName('');
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <TextInput value={name} onChangeText={setName} placeholder="Crew name" placeholderTextColor={colors.mute} style={styles.input} />
      <TextInput value={tagline} onChangeText={setTagline} placeholder="Tagline" placeholderTextColor={colors.mute} style={styles.input} />
      <View style={styles.row}>
        {EMOJIS.map((item) => (
          <Pressable key={item} onPress={() => setEmoji(item)} style={[styles.em, emoji === item && styles.emOn]}>
            <Text style={{ fontSize: 24 }}>{item}</Text>
          </Pressable>
        ))}
      </View>
      <Text style={styles.label}>Members</Text>
      {store.snapshot.people.map((person) => {
        const on = memberIDs.includes(person.id);
        return (
          <Pressable
            key={person.id}
            onPress={() => {
              if (person.id === store.you.id) return;
              setMemberIDs((ids) => (on ? ids.filter((id) => id !== person.id) : [...ids, person.id]));
            }}
            style={styles.member}>
            <Text style={styles.title}>{person.emoji} {person.name}</Text>
            <Text style={{ color: on ? colors.lime : colors.mute }}>{on ? '✓' : '○'}</Text>
          </Pressable>
        );
      })}
      <Card>
        <Text style={styles.label}>New friend</Text>
        <TextInput value={friendName} onChangeText={setFriendName} placeholder="Name" placeholderTextColor={colors.mute} style={styles.input} />
        <View style={styles.row}>
          {INTERESTS.slice(0, 6).map((item) => {
            const on = friendInterests.includes(item.id);
            return (
              <Pressable key={item.id} onPress={() => setFriendInterests((curr) => (on ? curr.filter((i) => i !== item.id) : [...curr, item.id]))} style={[styles.chip, on && styles.chipOn]}>
                <Text style={{ color: on ? colors.ink : colors.cream }}>{item.emoji}</Text>
              </Pressable>
            );
          })}
        </View>
        <PrimaryButton title="Add friend" onPress={addFriend} disabled={!friendName.trim()} />
      </Card>
      <PrimaryButton
        title="Save crew"
        disabled={!name.trim() || memberIDs.length < 2}
        onPress={() => {
          store.upsertGroup({
            id: nid('crew'),
            name: name.trim(),
            tagline,
            emoji,
            memberIDs: memberIDs.includes(store.you.id) ? memberIDs : [store.you.id, ...memberIDs],
            createdAt: new Date().toISOString(),
          });
          router.back();
        }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.ink },
  content: { padding: 16, gap: 10, paddingBottom: 40 },
  input: { backgroundColor: colors.inkCard, color: colors.cream, borderRadius: 12, padding: 12 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  em: { padding: 8, borderRadius: 20 },
  emOn: { backgroundColor: 'rgba(200,245,66,0.3)' },
  label: { color: colors.cream, fontWeight: '800' },
  member: { backgroundColor: colors.inkCard, borderRadius: 16, padding: 12, flexDirection: 'row', justifyContent: 'space-between' },
  title: { color: colors.cream, fontWeight: '800' },
  chip: { backgroundColor: colors.inkCard, padding: 8, borderRadius: 10 },
  chipOn: { backgroundColor: colors.lime },
});
