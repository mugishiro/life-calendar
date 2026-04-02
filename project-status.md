Project Status Notes

1. Implemented So Far
- Built the Expo-based application scaffold
- Implemented the main flow: `Splash -> Onboarding -> Main -> Settings`
- Added birth date and life expectancy input with local persistence
- Implemented the `Life` view as a full lifespan weekly grid
- Added week detail modal and weekly memo editing
- Added `AsyncStorage` persistence for weekly memos
- Implemented immediate-apply settings
- Added light and dark themes
- Added Japanese, English, Chinese, Spanish, and Hindi translations
- Added the `Year` view
- Added type checking and logic tests

2. Current State
- The MVP is functional end-to-end
- The core view is `Life`
- `Year` is a supporting navigation and inspection view
- Persistence is local only

3. Remaining Work
- Refine week-block density and year navigation in `Year`
- Add a memo list or search flow as memo volume grows
- Add event-week markers
- Review wording and layout across all supported languages
- Improve the README and store-facing copy

4. High-Priority Next Tasks
- Refine the `Year` view experience
- Add a memo list feature
- Add event-week markers
