import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, createElement, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { nid } from './ids';
import { matchReport, sharedBudget, sharedInterests, sortedStops } from './matching';
import { makeSnapshot } from './sampleData';
import type { AppSnapshot, FriendGroup, Hangout, Person, Place, PlaceReview } from './types';

const KEY = 'sidequest.snapshot.v1';

type Store = {
  snapshot: AppSnapshot;
  ready: boolean;
  you: Person;
  person: (id: string) => Person | undefined;
  group: (id: string) => FriendGroup | undefined;
  hangout: (id: string) => Hangout | undefined;
  members: (group: FriendGroup) => Person[];
  upcoming: () => Hangout[];
  matchFor: (hangout: Hangout) => ReturnType<typeof matchReport>;
  groupInsights: (group: FriendGroup) => ReturnType<typeof matchReport>;
  reviewsFor: (placeID: string) => PlaceReview[];
  crewRating: (placeID: string) => number | undefined;
  upsertPerson: (person: Person) => void;
  upsertGroup: (group: FriendGroup) => void;
  upsertHangout: (hangout: Hangout) => void;
  addStop: (hangoutID: string, place: Place, notes?: string) => void;
  removeStop: (hangoutID: string, stopID: string) => void;
  startLobby: (hangoutID: string) => void;
  toggleReady: (hangoutID: string, personID: string) => void;
  pingSquad: (hangoutID: string) => void;
  launchHangout: (hangoutID: string) => void;
  advanceStop: (hangoutID: string) => void;
  addReview: (review: PlaceReview) => void;
  resetDemo: () => void;
};

const StoreContext = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [snapshot, setSnapshot] = useState<AppSnapshot>(makeSnapshot());
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(KEY);
        if (raw) setSnapshot(JSON.parse(raw) as AppSnapshot);
      } catch {
        /* demo data */
      } finally {
        setReady(true);
      }
    })();
  }, []);

  const persist = useCallback((next: AppSnapshot) => {
    setSnapshot(next);
    void AsyncStorage.setItem(KEY, JSON.stringify(next));
  }, []);

  const person = useCallback((id: string) => snapshot.people.find((p) => p.id === id), [snapshot.people]);
  const group = useCallback((id: string) => snapshot.groups.find((g) => g.id === id), [snapshot.groups]);
  const hangout = useCallback((id: string) => snapshot.hangouts.find((h) => h.id === id), [snapshot.hangouts]);
  const you = snapshot.people.find((p) => p.id === snapshot.currentUserID) ?? snapshot.people[0];

  const members = useCallback(
    (crew: FriendGroup) => crew.memberIDs.map(person).filter((p): p is Person => !!p),
    [person],
  );

  const patchHangout = useCallback(
    (id: string, fn: (h: Hangout) => Hangout) => {
      persist({
        ...snapshot,
        hangouts: snapshot.hangouts.map((h) => (h.id === id ? fn(h) : h)),
      });
    },
    [persist, snapshot],
  );

  const value = useMemo<Store>(() => ({
    snapshot,
    ready,
    you,
    person,
    group,
    hangout,
    members,
    upcoming: () => snapshot.hangouts.filter((h) => h.status !== 'completed').sort((a, b) => a.start.localeCompare(b.start)),
    matchFor: (h) => {
      const crew = group(h.groupID);
      return matchReport(h, crew ? members(crew) : []);
    },
    groupInsights: (crew) => {
      const people = members(crew);
      const dummy: Hangout = {
        id: 'insight',
        title: '',
        vibe: '',
        groupID: crew.id,
        hostID: snapshot.currentUserID,
        interests: sharedInterests(people),
        budgetPerPerson: sharedBudget(people)?.max ?? 30,
        start: new Date().toISOString(),
        end: new Date(Date.now() + 3 * 3600000).toISOString(),
        maxDistanceMiles: 8,
        stops: [],
        status: 'drafting',
        lobby: { readyIDs: [], lockedIn: false, currentStopIndex: 0 },
      };
      return matchReport(dummy, people);
    },
    reviewsFor: (placeID) => snapshot.reviews.filter((r) => r.placeID === placeID).sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    crewRating: (placeID) => {
      const list = snapshot.reviews.filter((r) => r.placeID === placeID);
      if (!list.length) return undefined;
      return list.reduce((s, r) => s + r.rating, 0) / list.length;
    },
    upsertPerson: (p) => {
      const exists = snapshot.people.some((x) => x.id === p.id);
      persist({
        ...snapshot,
        people: exists ? snapshot.people.map((x) => (x.id === p.id ? p : x)) : [...snapshot.people, p],
      });
    },
    upsertGroup: (g) => {
      const exists = snapshot.groups.some((x) => x.id === g.id);
      persist({
        ...snapshot,
        groups: exists ? snapshot.groups.map((x) => (x.id === g.id ? g : x)) : [...snapshot.groups, g],
      });
    },
    upsertHangout: (h) => {
      const exists = snapshot.hangouts.some((x) => x.id === h.id);
      persist({
        ...snapshot,
        hangouts: exists ? snapshot.hangouts.map((x) => (x.id === h.id ? h : x)) : [...snapshot.hangouts, h],
      });
    },
    addStop: (hangoutID, place, notes = '') => {
      const catalog = snapshot.demoPlaces.some((p) => p.id === place.id)
        ? snapshot.demoPlaces.map((p) => (p.id === place.id ? place : p))
        : [...snapshot.demoPlaces, place];
      persist({
        ...snapshot,
        demoPlaces: catalog,
        hangouts: snapshot.hangouts.map((h) => {
          if (h.id !== hangoutID) return h;
          return {
            ...h,
            stops: [
              ...h.stops,
              {
                id: nid('stop'),
                place,
                notes,
                order: h.stops.length,
                plannedArrival: new Date(new Date(h.start).getTime() + h.stops.length * 3600000).toISOString(),
              },
            ],
          };
        }),
      });
    },
    removeStop: (hangoutID, stopID) => {
      patchHangout(hangoutID, (h) => ({
        ...h,
        stops: h.stops.filter((s) => s.id !== stopID).map((s, i) => ({ ...s, order: i })),
      }));
    },
    startLobby: (hangoutID) => {
      patchHangout(hangoutID, (h) => ({
        ...h,
        status: 'lobby',
        lobby: { readyIDs: [snapshot.currentUserID], lockedIn: false, currentStopIndex: 0 },
      }));
    },
    toggleReady: (hangoutID, personID) => {
      patchHangout(hangoutID, (h) => {
        const on = h.lobby.readyIDs.includes(personID);
        return {
          ...h,
          lobby: {
            ...h.lobby,
            readyIDs: on ? h.lobby.readyIDs.filter((id) => id !== personID) : [...h.lobby.readyIDs, personID],
          },
        };
      });
    },
    pingSquad: (hangoutID) => {
      const h = hangout(hangoutID);
      const crew = h ? group(h.groupID) : undefined;
      if (!h || !crew) return;
      const others = crew.memberIDs.filter((id) => id !== snapshot.currentUserID && !h.lobby.readyIDs.includes(id));
      others.forEach((id, index) => {
        setTimeout(() => {
          setSnapshot((current) => {
            const next = {
              ...current,
              hangouts: current.hangouts.map((item) => {
                if (item.id !== hangoutID) return item;
                if (item.lobby.readyIDs.includes(id)) return item;
                return { ...item, lobby: { ...item.lobby, readyIDs: [...item.lobby.readyIDs, id] } };
              }),
            };
            void AsyncStorage.setItem(KEY, JSON.stringify(next));
            return next;
          });
        }, 650 + index * 420);
      });
    },
    launchHangout: (hangoutID) => {
      patchHangout(hangoutID, (h) => ({
        ...h,
        status: 'live',
        lobby: { ...h.lobby, lockedIn: true, launchedAt: new Date().toISOString() },
      }));
    },
    advanceStop: (hangoutID) => {
      patchHangout(hangoutID, (h) => {
        const stops = sortedStops(h);
        if (h.lobby.currentStopIndex + 1 < stops.length) {
          return { ...h, lobby: { ...h.lobby, currentStopIndex: h.lobby.currentStopIndex + 1 } };
        }
        return { ...h, status: 'completed' };
      });
    },
    addReview: (review) => persist({ ...snapshot, reviews: [review, ...snapshot.reviews] }),
    resetDemo: () => persist(makeSnapshot()),
  }), [group, hangout, members, patchHangout, persist, person, ready, snapshot, you]);

  return createElement(StoreContext.Provider, { value }, children);
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside StoreProvider');
  return ctx;
}
