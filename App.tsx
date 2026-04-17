import 'expo-dev-client';
import { StatusBar } from 'expo-status-bar';
import { Alert } from 'react-native';
import { useEffect, useState } from 'react';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

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

  async function persistSettings(
    nextSettings: UserSettings,
    onSuccess: () => void,
  ) {
    const t = getTranslations(nextSettings.language);

    try {
      await saveUserSettings(nextSettings);
      onSuccess();
    } catch (error) {
      Alert.alert(t.alertSaveFailedTitle, t.alertSettingsSaveFailedMessage);
    }
  }

  async function handleStart(nextSettings: UserSettings) {
    await persistSettings(nextSettings, () => {
      setSettings(nextSettings);
      setScreen('main');
    });
  }

  async function handleUpdateSettings(nextSettings: UserSettings) {
    await persistSettings(nextSettings, () => {
      setSettings(nextSettings);
    });
  }

  const theme = getTheme(settings?.theme ?? 'light');

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <StatusBar style={theme.mode === 'dark' ? 'light' : 'dark'} />
        {isBooting ? <SplashScreen /> : null}
        {!isBooting && screen === 'onboarding' ? (
          <OnboardingScreen onSubmit={handleStart} />
        ) : null}
        {!isBooting && screen === 'main' && settings ? (
          <MainScreen
            onChangeSettings={handleUpdateSettings}
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
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}
