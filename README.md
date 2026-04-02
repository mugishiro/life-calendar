# Life Calendar

An Expo / React Native app that visualizes life in weeks.

## Setup

```bash
npm install
```

## Run

```bash
npm start
```

To test with Expo Go:

1. Run `npm start -- --tunnel`
2. Scan the QR code with Expo Go
3. Prefer `Tunnel` if the local network is unstable

## Scripts

```bash
npm run typecheck
npm test
```

## MVP Scope

- Launch flow based on saved data from Splash
- Initial setup for birth date and life expectancy
- Life-wide weekly grid view
- Summary for elapsed weeks, remaining weeks, and progress
- Week detail modal on tap
- Per-week memo saving, up to 200 characters
- Edit birth date, life expectancy, and theme from Settings
- Light / dark theme switching

## Current Behavior

- First launch follows `Splash -> Onboarding -> Main`; later launches follow `Splash -> Main`
- Birth date uses a native date picker on mobile and text input on web
- The life grid auto-scrolls near the current position
- Settings update immediately and return to the main state without a manual save step
