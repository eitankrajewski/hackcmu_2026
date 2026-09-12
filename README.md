# Sidequest

Plan hangouts like co-op missions. Sidequest is a **React Native / Expo** app you can open in VS Code. It scores a friend group’s overlapping **interests**, **budget**, **timeline**, and **distance**, then drops you into a game-style lobby when it’s time to go.

The prototype ships with a Mission District demo catalog so you can tap through crews, routes, open-now checks, and reviews without an API key. Add a Google Maps key to search live places.

## Open it in VS Code

```bash
git clone <this-repo>
cd hackcmu-2026
npm install
npx expo start
```

Then:

- press `w` for the web app in Chrome, or
- scan the QR code with **Expo Go** on your phone, or
- press `i` / `a` for iOS / Android simulators

Web-only shortcut:

```bash
npm run web
```

## Google Maps

1. Create a key in [Google Cloud Console](https://console.cloud.google.com/google/maps-apis).
2. Enable **Maps JavaScript API**, **Places API**, **Geocoding API**, and (for native) **Maps SDK for Android** / **Maps SDK for iOS**.
3. Copy `.env.example` to `.env` and set:

```
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your_real_key
```

4. Also paste the same key into `app.json` under `ios.config.googleMapsApiKey` and `android.config.googleMaps.apiKey` before a native build.

Without a key, maps run in demo mode against the local SF catalog. If a live Places call fails, Sidequest falls back to that catalog instead of emptying the map.

## What you can do

- **Multiple crews** — Night Shift, Park Rats, Budget Squad, plus crews you add
- **Hangout list** — match meters for interests, budget, timeline, and distance
- **Map stops** — search Google Places, filter open now, or drop a pin
- **Game lobby** — Ready Up, ping the squad, Launch Quest, walk the route
- **Crew reviews** — rate stops after a hangout is cleared

## Project layout

```
app/                 Expo Router screens (tabs + lobby + maps)
src/matching.ts      Shared budget / interests / scores
src/places.ts        Google Places JS + REST + demo catalog
src/components/MapCanvas.tsx      react-native-maps (iOS/Android)
src/components/MapCanvas.web.tsx  Google Maps JavaScript API
```
