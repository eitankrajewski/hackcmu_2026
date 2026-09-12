import { YOU_ID, NIGHT_SHIFT_ID, PARK_RATS_ID, BUDGET_SQUAD_ID } from './ids';
import { closedMondays, everydayHours } from './matching';
import type { AppSnapshot, FriendGroup, Hangout, Person, Place, PlaceReview } from './types';

export { YOU_ID, NIGHT_SHIFT_ID, PARK_RATS_ID, BUDGET_SQUAD_ID };

export const CATALOG: Place[] = [
  { id: 'beehive', name: 'The Beehive', address: '842 Valencia St, San Francisco', coordinate: { latitude: 37.7594, longitude: -122.4214 }, category: 'restaurant', priceLevel: 2, rating: 4.6, userRatingsTotal: 842, hours: everydayHours(17 * 60, 24 * 60) },
  { id: 'el-rio', name: 'El Rio', address: '3158 Mission St, San Francisco', coordinate: { latitude: 37.7473, longitude: -122.4193 }, category: 'bar', priceLevel: 1, rating: 4.5, userRatingsTotal: 2104, hours: everydayHours(16 * 60, 2 * 60) },
  { id: 'zeitgeist', name: 'Zeitgeist', address: '199 Valencia St, San Francisco', coordinate: { latitude: 37.77, longitude: -122.4223 }, category: 'bar', priceLevel: 1, rating: 4.4, userRatingsTotal: 3890, hours: everydayHours(9 * 60, 2 * 60) },
  { id: 'ritual', name: 'Ritual Coffee', address: '1026 Valencia St, San Francisco', coordinate: { latitude: 37.7565, longitude: -122.4212 }, category: 'cafe', priceLevel: 2, rating: 4.5, userRatingsTotal: 1560, hours: everydayHours(7 * 60, 19 * 60) },
  { id: 'dolores', name: 'Dolores Park', address: 'Dolores St & 18th St, San Francisco', coordinate: { latitude: 37.7597, longitude: -122.427 }, category: 'park', priceLevel: 1, rating: 4.7, userRatingsTotal: 12000, hours: everydayHours(6 * 60, 22 * 60) },
  { id: 'playland', name: 'Playland Arcade', address: 'Mission St, San Francisco', coordinate: { latitude: 37.7528, longitude: -122.4186 }, category: 'amusement', priceLevel: 1, rating: 4.3, userRatingsTotal: 640, hours: everydayHours(12 * 60, 23 * 60) },
  { id: 'alamo-mission', name: 'Alamo Drafthouse New Mission', address: '2550 Mission St, San Francisco', coordinate: { latitude: 37.7564, longitude: -122.419 }, category: 'movie_theater', priceLevel: 2, rating: 4.6, userRatingsTotal: 4300, hours: everydayHours(11 * 60, 24 * 60) },
  { id: 'tartine', name: 'Tartine Bakery', address: '600 Guerrero St, San Francisco', coordinate: { latitude: 37.7614, longitude: -122.424 }, category: 'cafe', priceLevel: 2, rating: 4.6, userRatingsTotal: 8900, hours: closedMondays(8 * 60, 17 * 60) },
  { id: 'birite', name: 'Bi-Rite Creamery', address: '3692 18th St, San Francisco', coordinate: { latitude: 37.7616, longitude: -122.4258 }, category: 'food', priceLevel: 1, rating: 4.6, userRatingsTotal: 5400, hours: everydayHours(11 * 60, 22 * 60) },
  { id: 'clarion', name: 'Clarion Alley', address: 'Clarion Alley, San Francisco', coordinate: { latitude: 37.7649, longitude: -122.4205 }, category: 'art_gallery', priceLevel: 1, rating: 4.5, userRatingsTotal: 2100, hours: everydayHours(0, 24 * 60) },
  { id: 'mission-bowling', name: 'Mission Bowling Club', address: '3176 17th St, San Francisco', coordinate: { latitude: 37.7638, longitude: -122.4165 }, category: 'bowling_alley', priceLevel: 2, rating: 4.4, userRatingsTotal: 1800, hours: everydayHours(15 * 60, 24 * 60) },
  { id: 'the-spot', name: 'The Spot', address: '3230 22nd St, San Francisco', coordinate: { latitude: 37.7552, longitude: -122.4201 }, category: 'restaurant', priceLevel: 1, rating: 4.4, userRatingsTotal: 390, hours: everydayHours(17 * 60, 23 * 60) },
  { id: 'phoebe', name: 'Pho 2000', address: '637 Larkin St, San Francisco', coordinate: { latitude: 37.784, longitude: -122.4177 }, category: 'restaurant', priceLevel: 1, rating: 4.3, userRatingsTotal: 980, hours: everydayHours(10 * 60, 3 * 60) },
  { id: 'golden-gate-park', name: 'Golden Gate Park', address: 'Golden Gate Park, San Francisco', coordinate: { latitude: 37.7694, longitude: -122.4862 }, category: 'park', priceLevel: 1, rating: 4.8, userRatingsTotal: 48000, hours: everydayHours(5 * 60, 24 * 60) },
];

export function makePeople(): Person[] {
  return [
    { id: YOU_ID, name: 'You', handle: '@host', emoji: '🦊', accentHex: 'C8F542', interests: ['food', 'liveMusic', 'games', 'coffee', 'lateNight'], budgetMin: 15, budgetMax: 55, home: { latitude: 37.7599, longitude: -122.4148 }, typicalStartHour: 17, typicalEndHour: 24, maxTravelMiles: 8 },
    { id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2', name: 'Maya Chen', handle: '@maya', emoji: '🐸', accentHex: '7B5CFF', interests: ['food', 'art', 'coffee', 'nightlife', 'lateNight'], budgetMin: 20, budgetMax: 70, home: { latitude: 37.7609, longitude: -122.435 }, typicalStartHour: 18, typicalEndHour: 24, maxTravelMiles: 6 },
    { id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3', name: 'Jules Park', handle: '@jules', emoji: '🐻', accentHex: 'FF4D6D', interests: ['liveMusic', 'nightlife', 'food', 'lateNight', 'games'], budgetMin: 25, budgetMax: 80, home: { latitude: 37.7785, longitude: -122.4056 }, typicalStartHour: 19, typicalEndHour: 26, maxTravelMiles: 10 },
    { id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa4', name: 'Rio Alvarez', handle: '@rio', emoji: '🐺', accentHex: '4AE3A8', interests: ['outdoors', 'coffee', 'games', 'food', 'movies'], budgetMin: 10, budgetMax: 40, home: { latitude: 37.7516, longitude: -122.4477 }, typicalStartHour: 16, typicalEndHour: 22, maxTravelMiles: 7 },
    { id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa5', name: 'Samir Shah', handle: '@samir', emoji: '🐼', accentHex: 'FFB020', interests: ['coffee', 'movies', 'games', 'food', 'wellness'], budgetMin: 8, budgetMax: 30, home: { latitude: 37.7694, longitude: -122.4862 }, typicalStartHour: 17, typicalEndHour: 22, maxTravelMiles: 5 },
    { id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa6', name: 'Noor Haddad', handle: '@noor', emoji: '🦉', accentHex: '5CC8FF', interests: ['art', 'outdoors', 'coffee', 'food', 'shopping'], budgetMin: 12, budgetMax: 45, home: { latitude: 37.8044, longitude: -122.2712 }, typicalStartHour: 11, typicalEndHour: 20, maxTravelMiles: 12 },
    { id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa7', name: 'Bee Okonkwo', handle: '@bee', emoji: '🐝', accentHex: 'F5D76E', interests: ['games', 'movies', 'coffee', 'food', 'sports'], budgetMin: 5, budgetMax: 25, home: { latitude: 37.7649, longitude: -122.399 }, typicalStartHour: 18, typicalEndHour: 23, maxTravelMiles: 4 },
  ];
}

export function makeGroups(): FriendGroup[] {
  const daysAgo = (n: number) => new Date(Date.now() - n * 86400000).toISOString();
  return [
    { id: NIGHT_SHIFT_ID, name: 'The Night Shift', tagline: 'Dinner, a show, then wherever is still open.', emoji: '🌃', memberIDs: [YOU_ID, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa4'], createdAt: daysAgo(40) },
    { id: PARK_RATS_ID, name: 'Park Rats', tagline: 'Sun, snacks, and a sidequest if the weather holds.', emoji: '🌤️', memberIDs: [YOU_ID, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa4', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa6'], createdAt: daysAgo(18) },
    { id: BUDGET_SQUAD_ID, name: 'Budget Squad', tagline: 'High hang, low spend. Arcade + noodles energy.', emoji: '🎟️', memberIDs: [YOU_ID, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa5', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa7'], createdAt: daysAgo(12) },
  ];
}

function atHour(base: Date, hour: number, minute = 0) {
  const d = new Date(base);
  d.setHours(hour, minute, 0, 0);
  return d;
}

export function makeHangouts(now = new Date(), places: Place[] = CATALOG): Hangout[] {
  const named = (name: string) => places.find((p) => p.name === name) ?? places[0];
  const tonight = atHour(now, 19);
  const sat = atHour(new Date(now.getTime() + 6 * 86400000), 11, 30);
  const lastWeek = new Date(now.getTime() - 5 * 86400000);
  const stop = (place: Place, notes: string, order: number, when: Date) => ({
    id: `stop-${place.id}-${order}`,
    place,
    plannedArrival: when.toISOString(),
    notes,
    order,
  });

  return [
    {
      id: 'cccccccc-cccc-cccc-cccc-ccccccccccc1',
      title: 'Mission After Dark',
      vibe: 'Eat, wander, then chase whatever is still open.',
      groupID: NIGHT_SHIFT_ID,
      hostID: YOU_ID,
      interests: ['food', 'nightlife', 'lateNight', 'liveMusic'],
      budgetPerPerson: 45,
      start: tonight.toISOString(),
      end: new Date(tonight.getTime() + 4 * 3600000).toISOString(),
      maxDistanceMiles: 4,
      stops: [
        stop(named('The Beehive'), 'Warm-up round + share plates', 0, tonight),
        stop(named('El Rio'), 'Patio if the night is kind', 1, new Date(tonight.getTime() + 5400000)),
        stop(named('Zeitgeist'), 'Backup if El Rio is slammed', 2, new Date(tonight.getTime() + 9000000)),
      ],
      status: 'scheduled',
      lobby: { readyIDs: [], lockedIn: false, currentStopIndex: 0 },
    },
    {
      id: 'cccccccc-cccc-cccc-cccc-ccccccccccc2',
      title: 'Dolores Drift',
      vibe: 'Coffee, park blanket, then a cheap sidequest.',
      groupID: PARK_RATS_ID,
      hostID: YOU_ID,
      interests: ['outdoors', 'coffee', 'food'],
      budgetPerPerson: 22,
      start: sat.toISOString(),
      end: new Date(sat.getTime() + 5 * 3600000).toISOString(),
      maxDistanceMiles: 6,
      stops: [
        stop(named('Ritual Coffee'), 'Grab drinks before the hill', 0, sat),
        stop(named('Dolores Park'), 'South-west slope, usual blanket', 1, new Date(sat.getTime() + 2400000)),
      ],
      status: 'drafting',
      lobby: { readyIDs: [], lockedIn: false, currentStopIndex: 0 },
    },
    {
      id: 'cccccccc-cccc-cccc-cccc-ccccccccccc3',
      title: 'Quarter Run',
      vibe: 'Arcade, movie leftover seats, late noodles.',
      groupID: BUDGET_SQUAD_ID,
      hostID: YOU_ID,
      interests: ['games', 'movies', 'food'],
      budgetPerPerson: 18,
      start: lastWeek.toISOString(),
      end: new Date(lastWeek.getTime() + 4 * 3600000).toISOString(),
      maxDistanceMiles: 3,
      stops: [
        stop(named('Playland Arcade'), '', 0, lastWeek),
        stop(named('Alamo Drafthouse New Mission'), '', 1, new Date(lastWeek.getTime() + 7200000)),
      ],
      status: 'completed',
      lobby: {
        readyIDs: makeGroups()[2].memberIDs,
        lockedIn: true,
        launchedAt: lastWeek.toISOString(),
        currentStopIndex: 1,
      },
    },
  ];
}

export function makeReviews(people: Person[], hangouts: Hangout[]): PlaceReview[] {
  const idFor = (handle: string) => people.find((p) => p.handle === handle)!.id;
  const hangout = hangouts.find((h) => h.title === 'Quarter Run')!.id;
  const daysAgo = (n: number) => new Date(Date.now() - n * 86400000).toISOString();
  return [
    { id: 'rev-1', placeID: 'playland', authorID: idFor('@bee'), hangoutID: hangout, rating: 5, body: 'Machines were actually working and the token-to-fun ratio was criminal in a good way.', createdAt: daysAgo(4), tags: ['cheap', 'loud', 'perfect'] },
    { id: 'rev-2', placeID: 'playland', authorID: idFor('@samir'), hangoutID: hangout, rating: 4, body: 'Great for Budget Squad. Gets packed after 8. Air hockey queued us for 15.', createdAt: daysAgo(4), tags: ['busy'] },
    { id: 'rev-3', placeID: 'alamo-mission', authorID: YOU_ID, hangoutID: hangout, rating: 5, body: 'Late seating was open, nachos split three ways. This is the move.', createdAt: daysAgo(4), tags: ['open late'] },
    { id: 'rev-4', placeID: 'el-rio', authorID: idFor('@maya'), hangoutID: null, rating: 5, body: 'Patio is the whole personality. Go early if you want a table.', createdAt: daysAgo(20), tags: ['patio'] },
  ];
}

export function makeSnapshot(now = new Date()): AppSnapshot {
  const people = makePeople();
  const hangouts = makeHangouts(now, CATALOG);
  return {
    people,
    groups: makeGroups(),
    hangouts,
    reviews: makeReviews(people, hangouts),
    currentUserID: YOU_ID,
    demoPlaces: CATALOG,
  };
}
