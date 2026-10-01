# ⌚ Home Helper Watch

The **watch companion** for Personal Home Helper: big buttons for the things you do many times a day, made for a small (round) screen.

- 💧 **Water**: +150 / +250 / +500 ml, undo, daily goal
- 🏃 **Run coach**: the same couch-to-5K plan as [Activity Coach](https://github.com/kgiannopoulou/activity-coach). The watch buzzes at every run/walk change, even with the screen off. Afterwards, *"How did it feel?"* adapts the next run
- 🛒 **I finished…**: one tap for milk, coffee, dish soap, toilet paper…, then send them to [Smart Shopping List](https://github.com/kgiannopoulou/smart-shopping-list)
- ⏰ **Reminders**: water every 1–3 hours, meals, and "time to move"

> Part 9 of **Personal Home Helper**. All parts together: [personal-home-helper](https://github.com/kgiannopoulou/personal-home-helper). Separate apps: [food-water-tracker](https://github.com/kgiannopoulou/food-water-tracker), [activity-coach](https://github.com/kgiannopoulou/activity-coach), [kitchen-inventory](https://github.com/kgiannopoulou/kitchen-inventory), [smart-shopping-list](https://github.com/kgiannopoulou/smart-shopping-list), [money-budget](https://github.com/kgiannopoulou/money-budget), [home-chores](https://github.com/kgiannopoulou/home-chores), [planner-life-admin](https://github.com/kgiannopoulou/planner-life-admin), [weather-environment](https://github.com/kgiannopoulou/weather-environment).

## Which watches?

| | |
|---|---|
| **Wear OS** (Samsung Galaxy Watch, Pixel Watch…) | ✅ A real standalone watch app. `plugins/withWearOS.js` marks the Android build as a Wear OS app (`android.hardware.type.watch` + standalone meta-data) |
| **Phone** | ✅ Runs in Expo Go as a quick-actions screen. On a phone it gets a wider layout |
| **Apple Watch** | ❌ Not yet. Apple Watch apps must be native watchOS (SwiftUI) targets, which need Xcode on a Mac. The phone version works on iPhone in the meantime |

The UI adapts to the screen: under 330 px wide it uses watch mode, with extra padding so nothing is cut off by a round face, large tap targets, a dark background (saves battery on OLED), and haptics on every tap.

## Run it

```bash
npm install
npx expo start              # phone: scan the QR code with Expo Go, or press w for web
npm test
npm run typecheck
```

### On a Wear OS watch

Expo Go doesn't run on watches, so build the app:

```bash
npx expo run:android        # with the watch (or a Wear OS emulator) connected over adb
# or in the cloud:
npx eas-cli@latest build -p android --profile preview
```

## Tech

- [Expo](https://expo.dev) SDK 57 · React Native · TypeScript · Expo Router (stack navigation, swipe back)
- `expo-haptics` · `expo-keep-awake` · `expo-notifications` · AsyncStorage
- Run timing is based on the clock, not timers, so it stays correct when the watch screen sleeps
- Jest (`jest-expo`) unit tests

```
plugins/withWearOS.js   # Wear OS config plugin
src/
  app/          # screens: home tiles, water, run, finished, reminders
  components/watch.tsx  # watch UI kit: round-safe layout, tiles, pills, haptics
  lib/
    watch.ts      # water, quick items, run status + phase alerts, reminder plan
    coach.ts      # the run plan (shared with Activity Coach)
```

## Roadmap

- [ ] Sync with the phone app (Wear OS Data Layer) so water and runs show up in Home Helper
- [ ] Apple Watch (watchOS target)
- [ ] Watch-face complication for water
