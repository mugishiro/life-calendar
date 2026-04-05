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
npm run build:web
```

## Publish To GitHub Pages

This repository is already connected to `git@github.com:mugishiro/life-calendar.git`, so the web app can be published with GitHub Pages.

1. Install dependencies.

```bash
npm install
```

2. Generate and deploy the production web build.

```bash
npm run deploy
```

3. In the GitHub repository settings, open `Pages` and set:

- Source: `Deploy from a branch`
- Branch: `gh-pages`
- Folder: `/ (root)`

After that, the app will be available at:

```text
https://mugishiro.github.io/life-calendar/
```

The Expo app config already sets `baseUrl` to `/life-calendar`, which is required for a project site hosted under GitHub Pages.

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
