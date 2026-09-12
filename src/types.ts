export type Interest =
  | 'food'
  | 'coffee'
  | 'liveMusic'
  | 'nightlife'
  | 'outdoors'
  | 'games'
  | 'art'
  | 'movies'
  | 'sports'
  | 'shopping'
  | 'wellness'
  | 'lateNight';

export const INTERESTS: { id: Interest; label: string; emoji: string; categories: string[] }[] = [
  { id: 'food', label: 'Food', emoji: '🍜', categories: ['restaurant', 'food'] },
  { id: 'coffee', label: 'Coffee', emoji: '☕', categories: ['cafe'] },
  { id: 'liveMusic', label: 'Live music', emoji: '🎸', categories: ['bar', 'night_club'] },
  { id: 'nightlife', label: 'Nightlife', emoji: '🪩', categories: ['bar', 'night_club'] },
  { id: 'outdoors', label: 'Outdoors', emoji: '🌳', categories: ['park'] },
  { id: 'games', label: 'Games', emoji: '🕹️', categories: ['bowling_alley', 'amusement'] },
  { id: 'art', label: 'Art', emoji: '🎨', categories: ['art_gallery', 'museum'] },
  { id: 'movies', label: 'Movies', emoji: '🎬', categories: ['movie_theater'] },
  { id: 'sports', label: 'Sports', emoji: '🏀', categories: ['gym', 'stadium'] },
  { id: 'shopping', label: 'Shopping', emoji: '🛍️', categories: ['shopping_mall'] },
  { id: 'wellness', label: 'Wellness', emoji: '🧘', categories: ['spa'] },
  { id: 'lateNight', label: 'Late night', emoji: '🌙', categories: ['bar', 'restaurant'] },
];

export function categoriesFor(interests: Interest[]): string[] {
  return [...new Set(interests.flatMap((id) => INTERESTS.find((row) => row.id === id)?.categories ?? []))];
}

export function interestMeta(id: Interest) {
  return INTERESTS.find((item) => item.id === id)!;
}

export type GeoPoint = { latitude: number; longitude: number };

export type Person = {
  id: string;
  name: string;
  handle: string;
  emoji: string;
  accentHex: string;
  interests: Interest[];
  budgetMin: number;
  budgetMax: number;
  home: GeoPoint;
  typicalStartHour: number;
  typicalEndHour: number;
  maxTravelMiles: number;
};

export type FriendGroup = {
  id: string;
  name: string;
  tagline: string;
  emoji: string;
  memberIDs: string[];
  createdAt: string;
};

export type HangoutStatus = 'drafting' | 'scheduled' | 'lobby' | 'live' | 'completed';

export const STATUS_LABEL: Record<HangoutStatus, string> = {
  drafting: 'Draft',
  scheduled: 'On deck',
  lobby: 'In lobby',
  live: 'Live',
  completed: 'Cleared',
};

export type DayHours = { openMinutes: number; closeMinutes: number; closed: boolean };

export type WeeklyHours = { days: DayHours[] };

export type Place = {
  id: string;
  name: string;
  address: string;
  coordinate: GeoPoint;
  category: string;
  priceLevel: number;
  rating: number;
  userRatingsTotal: number;
  hours?: WeeklyHours;
  openNowOverride?: boolean | null;
  googlePlaceID?: string | null;
};

export type QuestStop = {
  id: string;
  place: Place;
  plannedArrival?: string | null;
  notes: string;
  order: number;
};

export type LobbyState = {
  readyIDs: string[];
  lockedIn: boolean;
  launchedAt?: string | null;
  currentStopIndex: number;
};

export type Hangout = {
  id: string;
  title: string;
  vibe: string;
  groupID: string;
  hostID: string;
  interests: Interest[];
  budgetPerPerson: number;
  start: string;
  end: string;
  maxDistanceMiles: number;
  stops: QuestStop[];
  status: HangoutStatus;
  lobby: LobbyState;
};

export type PlaceReview = {
  id: string;
  placeID: string;
  authorID: string;
  hangoutID?: string | null;
  rating: number;
  body: string;
  createdAt: string;
  tags: string[];
};

export type MatchReport = {
  interest: number;
  budget: number;
  timeline: number;
  distance: number;
  overall: number;
  sharedInterests: Interest[];
  sharedBudget?: { min: number; max: number };
  meetingPoint?: GeoPoint;
  tooFarNames: string[];
  notes: string[];
};

export type AppSnapshot = {
  people: Person[];
  groups: FriendGroup[];
  hangouts: Hangout[];
  reviews: PlaceReview[];
  currentUserID: string;
  demoPlaces: Place[];
};

export type MapPin = {
  id: string;
  title: string;
  coordinate: GeoPoint;
  kind: 'stop' | 'candidate' | 'person' | 'meet';
};
