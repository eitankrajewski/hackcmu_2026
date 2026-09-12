# Sidequest

**Sidequest gets friends out of the group chat and into the real world.**

A group picks a time and a budget. Sidequest reads everyone's interests, travel
limits and past ratings, pulls real nearby places from Google Places, and has
Gemini design one specific outing. The group approves it, opts in, readies up
like a multiplayer lobby, then the real world becomes the game: randomized
challenges, talk cards, shared photos, and a rating that makes the next
recommendation better.

React Native · Expo SDK 57 · TypeScript · Expo Router · Supabase · Gemini · Google Places (New)

---

## The demo loop

```
Profile → Add Friends → Create Group → AI Plan → Suggest/Edit → Approve
   → Opt In → Ready Up → Sidequest → Memories → Rate → Better next recommendation
```

Everything in the app exists to serve that loop.

---

## 1. Setup

### Prerequisites

- Node 20+
- A Supabase project (free tier is fine)
- A Gemini API key — https://aistudio.google.com/apikey
- A Google Cloud key with **Places API (New)** enabled

### Install

```bash
npm install
cp .env.example .env
```

### Database

In the Supabase dashboard → **SQL Editor**, run these two files in order:

1. `supabase/schema.sql` — tables, permissive RLS, realtime publication, storage bucket
2. `supabase/seed.sql` — 7 CMU demo users, friendships, the `SCS Survivors 🔥` group,
   historical ratings, one completed Sidequest, and the `reset_demo()` function

> `schema.sql` starts with `drop table if exists` — re-running it wipes the data.
> `seed.sql` is idempotent and safe to re-run on its own.

Then enable anonymous auth: **Authentication → Sign In / Providers → Anonymous → enable.**

### App environment

Fill in `.env` from **Project Settings → API**:

```
EXPO_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
EXPO_PUBLIC_DEMO_MODE=true
```

### Edge functions

Server keys never enter the mobile bundle — Gemini and Google Places are only
ever called from edge functions.

```bash
npm i -g supabase          # if you do not have the CLI
supabase login
supabase link --project-ref YOUR-PROJECT-REF

supabase secrets set GEMINI_API_KEY=...
supabase secrets set GOOGLE_PLACES_API_KEY=...
# Optional, defaults to gemini-3.8-flash:
supabase secrets set GEMINI_MODEL=gemini-3.8-flash

supabase functions deploy generate-plan
supabase functions deploy search-places
supabase functions deploy generate-quest-content
```

`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are injected automatically.

### Run

```bash
npx expo start --clear
```

Open **Settings** in the app to confirm the Supabase connection is green.

---

## 2. Running the demo

Two devices make the realtime moments land. Open the app, tap
**"Demo: continue as a seeded CMU user"** on the first onboarding step, and pick
**Keyaan** on one device and **Maya** on the other.

| Step | What to do | What to point at |
|------|-----------|------------------|
| 1 | Profile tab | 5-mile radius, interest chips, "What you actually like" — seeded ratings |
| 2 | Groups → SCS Survivors 🔥 | Four members with different radii; the group plans at **3 mi**, Sam's limit |
| 3 | Create plan | Only two questions: when and budget |
| 4 | Pick Saturday 7:00 PM, $20 | The summary card lists what the AI will actually use |
| 5 | **GENERATE SIDEQUEST** | Pipeline steps, then a **real Pittsburgh venue** |
| 6 | Scroll the plan card | **"Why your group"** — names members, their tags, their ratings |
| 7 | 3 challenges, a conversation mode, **SUBMIT PLAN** | Challenges are generated now, not mid-outing |
| 8 | Approve on the second device | Vote tally and roster update live; majority promotes the plan |
| 9 | **I'M IN** on both | Avatar states: ✓ / ✕ / … |
| 10 | Open the lobby, **READY UP** | The other device flips to READY instantly; **EVERYONE'S READY** |
| 11 | **START SIDEQUEST** | Game mode: live timer, destination card |
| 12 | **GET DIRECTIONS** | Hands off to Google Maps with the real place id |
| 13 | Wait 15–30s | **SIDE QUEST UNLOCKED** takes over the screen |
| 14 | **TALK CARDS** | Prompts in the chosen mode |
| 15 | **END SIDEQUEST** → recap | Add photos from the camera roll, long-press one → **ADD TO MY STORY** |
| 16 | Rate ★★★★★ | "…is now part of what Sidequest knows about your group" |
| 17 | Generate another plan | The new rating is in the prompt — this is the feedback loop |

### Between demos

**Settings → Developer → RESET DEMO.** Clears every plan, vote, opt-in, ready
state and quest from the seeded group, and puts Daniel's group invite and friend
request back. Seeded profiles and historical ratings survive.

---

## 3. How the recommendation works

`generate-plan` never asks Gemini to invent a business:

```
group members
  → union of interest tags
  → MIN(max_travel_miles)              ← nobody gets dragged too far
  → each member's rating history by place type
  → creator's GPS (falls back to CMU)
  → Google Places Nearby Search, 3 buckets (food / outdoors / activity)
  → ~18 real candidates
  → Gemini ranks them and designs the activity
  → response validated: the chosen placeId MUST be one we supplied
```

Ratings close the loop. `reviews` stores `place_types[]` and a 1–5 score, and
the next prompt includes lines like:

```
Alex:
- museum: 2.0
- bowling alley: 5.0
```

so the same group asking the same question a week later gets a different answer.

---

## 4. Project layout

```
app/                          Expo Router routes
  index.tsx                   splash + redirect
  onboarding/                 stepped signup, demo persona picker
  (tabs)/                     Home · Groups · Friends · Profile
  group/create · group/[id]
  plan/new                    when + budget + GENERATE SIDEQUEST
  plan/[id]/index             plan, version diff, voting, YOU IN?
  plan/[id]/configure         challenge count + conversation mode + SUBMIT
  plan/[id]/suggest           manual edit + Google Places venue picker
  plan/[id]/ready             READY UP lobby (realtime)
  plan/[id]/quest             game mode: timer, challenges, talk cards
  plan/[id]/recap             memories, stories, ★ rating
  friends/add                 contact matching
  user/[id] · story/[id] · settings

src/
  api/        one module per table group; all Supabase access lives here
  components/ Screen, Button, Card, Avatar, Form, PlanCard, MapPreview, …
  hooks/      useAsync, useRealtime, useLocation, useNow
  lib/        config, supabase, planState, format, phone, maps, geo, picker
  state/      session provider (anon auth + claimed profile)
  theme/      colors, type scale, radii, glow

supabase/
  schema.sql        tables, RLS, realtime, storage
  seed.sql          demo data + reset_demo()
  functions/
    generate-plan            Places + Gemini → one Sidequest
    search-places            normalized Places search for Suggest Change
    generate-quest-content   challenges + talk cards, generated once
```

`src/lib/planState.ts` is the single source of truth for "what does this person
do next?" — Home, the group screen and the plan screen all read from it, so the
app never shows two different next steps for the same plan.

---

## 5. Hackathon shortcuts

These are deliberate, and worth naming before a judge asks:

- **Auth.** `signInAnonymously()`, then the device *claims* a `profiles` row.
  `profiles.id` is not a foreign key to `auth.users`, which is what lets SQL seed
  convincing demo users and lets two phones act as two different people. The
  phone number is for contact matching only, never for login.
- **RLS** is enabled but permissive (`using (true)`), because the demo identity is
  a claimed row rather than an auth user. Production would key policies off
  `auth.uid()`.
- **Contacts** fall back to `src/lib/demoContacts.ts` when device permission fails,
  so the feature stays demoable on a simulator.
- **Location** falls back to CMU coordinates when there is no GPS fix.
- **Maps.** `react-native-maps` needs a Google Maps key per platform for the small
  previews; without one, `MapPreview` degrades to a styled plate with a pin
  rather than a grey void. Directions always work — they hand off to Google Maps.

## 6. Notes for development

```bash
npm run typecheck            # app
npm run typecheck:functions  # Deno edge functions, via local shims
npx expo export --platform ios   # verify the bundle builds
```

Quest timing compares **absolute timestamps** from the database rather than
counting down in JS, so backgrounding the app, reloading, or joining late cannot
desync a running Sidequest.

Not built, on purpose: chat, push notifications, video, in-app camera,
turn-by-turn navigation, a public feed, likes, XP, badges, payment splitting,
reservations, calendar or weather integration.
