import 'expo-dev-client';
import { StatusBar } from 'expo-status-bar';
import { Alert } from 'react-native';
import { useEffect, useState } from 'react';

import { MainScreen } from './src/screens/MainScreen';
import { OnboardingScreen } from './src/screens/OnboardingScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { SplashScreen } from './src/screens/SplashScreen';
import { getTranslations } from './src/i18n';
import { getTheme } from './src/theme';
import type { UserSettings } from './src/types';
import { loadUserSettings, saveUserSettings } from './src/utils/storage';

type AppScreen = 'onboarding' | 'main' | 'settings';

export default function App() {
  const [isBooting, setIsBooting] = useState(true);
  const [screen, setScreen] = useState<AppScreen>('onboarding');
  const [saveFlashMessage, setSaveFlashMessage] = useState<string | null>(null);
  const [settings, setSettings] = useState<UserSettings | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function bootstrap() {
      const storedSettings = await loadUserSettings();

      if (!isMounted) {
        return;
      }

      setSettings(storedSettings);
      setScreen(storedSettings ? 'main' : 'onboarding');
      setIsBooting(false);
    }

    bootstrap();

    return () => {
      isMounted = false;
    };
  }, []);

  async function handleStart(nextSettings: UserSettings) {
    const t = getTranslations(nextSettings.language);
    try {
      await saveUserSettings(nextSettings);
      setSettings(nextSettings);
      setScreen('main');
    } catch (error) {
      Alert.alert(t.alertSaveFailedTitle, t.alertSettingsSaveFailedMessage);
    }
  }

  async function handleUpdateSettings(nextSettings: UserSettings) {
    const t = getTranslations(nextSettings.language);
    try {
      await saveUserSettings(nextSettings);
      setSettings(nextSettings);
    } catch (error) {
      Alert.alert(t.alertSaveFailedTitle, t.alertSettingsSaveFailedMessage);
    }
  }

  const theme = getTheme(settings?.theme ?? 'light');

  return (
    <>
      <StatusBar style={theme.mode === 'dark' ? 'light' : 'dark'} />
      {isBooting ? <SplashScreen /> : null}
      {!isBooting && screen === 'onboarding' ? (
        <OnboardingScreen onSubmit={handleStart} />
      ) : null}
      {!isBooting && screen === 'main' && settings ? (
        <MainScreen
          flashMessage={saveFlashMessage}
          onChangeSettings={handleUpdateSettings}
          onDismissFlashMessage={() => setSaveFlashMessage(null)}
          settings={settings}
          theme={theme}
          onOpenSettings={() => setScreen('settings')}
        />
      ) : null}
      {!isBooting && screen === 'settings' && settings ? (
        <SettingsScreen
          settings={settings}
          onBack={() => setScreen('main')}
          onChange={handleUpdateSettings}
        />
      ) : null}
    </>
  );
}
