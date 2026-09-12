# Sidequest — working notes

## Expo HAS CHANGED

This project is on **Expo SDK 57 / React Native 0.86 / React 19.2**. Read the
exact versioned docs at https://docs.expo.dev/versions/v57.0.0/ before writing
any code, and check `node_modules/<pkg>/build/*.d.ts` when a summary is unclear —
several SDK APIs were rewritten (`expo-contacts` is now class-based:
`Contacts.Contact.getAllDetails([...])`, with the old API at `expo-contacts/legacy`).

Notable version facts already established here:

- There is **no `babel.config.js`** and none is needed. Adding one that requires
  `babel-preset-expo` breaks bundling unless that package is a direct dependency.
- `@expo/vector-icons` is **not** a transitive dependency of `expo` any more; it
  is installed explicitly.
- `StyleSheet.absoluteFillObject` is gone from RN's public types. Write the four
  offsets out, or use a local `fill` style.
- Animation uses RN's built-in `Animated`. Reanimated and `react-native-worklets`
  were removed as unused — do not re-add them without also adding the babel plugin.

## Layout

- `app/` — Expo Router routes only. Screens hold layout and local state.
- `src/api/` — **every** Supabase call lives here, one module per table group.
  Screens never call `supabase` directly (the one exception is a small dynamic
  import in `app/friends/add.tsx`).
- `src/lib/planState.ts` — single source of truth for "what does this user do
  next?". Home, the group screen and the plan screen all read it. Change the
  state machine here, not in a screen.
- `src/theme/` — all colors, type and radii. No hard-coded hex outside it except
  intentional one-offs (overlay scrims, story chrome).
- `supabase/functions/` — Deno, not bundled into the app. Typecheck with
  `npm run typecheck:functions`; `deno-shims.d.ts` exists only for that.

## Rules that matter

1. **Gemini may only pick from supplied Google Places candidates.** `generate-plan`
   validates the returned `placeId` against the candidate list and fails loudly
   otherwise. Never let the model name a venue.
2. **SUGGEST CHANGE does not call Gemini.** It edits a copy of the current plan
   and creates a new `plan_versions` row for the group to vote on.
3. **Quest content is generated once**, at submit time, and stored. Nothing calls
   an LLM during an outing.
4. **Quest timing uses absolute timestamps** (`plan_challenges.reveal_at`,
   `plans.started_at`). `useNow` only decides re-render frequency. Never count
   down in JS state.
5. **Approval is majority**: `approvals > joined_members / 2`. Settled in
   `settleVotes`, which also promotes the version and syncs the `plans` row.
6. **Server keys never enter the app bundle.** Gemini and Places only via edge
   functions.
7. Anything demo-related keys off `DEMO_MODE` in `src/lib/config.ts`.

## Before saying it works

```bash
npm run typecheck
npm run typecheck:functions
npx expo export --platform ios     # catches import + bundling errors
```
