import { useEffect, useState } from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

import { DateInput } from '../components/DateInput';
import { NumberWheelInput } from '../components/NumberWheelInput';
import { getTranslations, LANGUAGE_OPTIONS } from '../i18n';
import { PrimaryButton } from '../components/PrimaryButton';
import { getTheme } from '../theme';
import type { LanguageCode, ThemeMode, UserSettings } from '../types';
import { isBirthDateInFuture, isValidLifeExpectancy, parseBirthDate } from '../utils/lifeCalendar';

interface SettingsScreenProps {
  settings: UserSettings;
  onBack: () => void;
  onChange: (settings: UserSettings) => void;
}

export function SettingsScreen({ settings, onBack, onChange }: SettingsScreenProps) {
  const [birthDate, setBirthDate] = useState(settings.birthDate);
  const [language, setLanguage] = useState<LanguageCode>(settings.language);
  const [themeMode, setThemeMode] = useState<ThemeMode>(settings.theme);
  const [lifeExpectancy, setLifeExpectancy] = useState(settings.lifeExpectancy);
  const [errorMessage, setErrorMessage] = useState('');
  const t = getTranslations(language);
  const theme = getTheme(themeMode);

  useEffect(() => {
    setBirthDate(settings.birthDate);
    setLanguage(settings.language);
    setThemeMode(settings.theme);
    setLifeExpectancy(settings.lifeExpectancy);
  }, [settings.birthDate, settings.language, settings.lifeExpectancy, settings.theme]);

  function getCommittedBirthDate() {
    const parsedBirthDate = parseBirthDate(birthDate);
    return parsedBirthDate ? parsedBirthDate.normalized : settings.birthDate;
  }

  function commitSettings(nextSettings: UserSettings) {
    onChange(nextSettings);
  }

  function updateLifeExpectancy(nextValue: number) {
    const boundedValue = Math.max(1, Math.min(120, nextValue));
    setLifeExpectancy(boundedValue);

    if (boundedValue !== settings.lifeExpectancy) {
      commitSettings({
        ...settings,
        birthDate: getCommittedBirthDate(),
        language,
        lifeExpectancy: boundedValue,
        theme: themeMode,
      });
    }

    if (errorMessage) {
      setErrorMessage('');
    }
  }

  function handleBirthDateChange(nextValue: string) {
    setBirthDate(nextValue);
    if (errorMessage) {
      setErrorMessage('');
    }

    const parsedBirthDate = parseBirthDate(nextValue);

    if (!parsedBirthDate && nextValue.trim()) {
      setErrorMessage(t.settingsBirthDateInvalid);
      return;
    }

    if (!parsedBirthDate) {
      return;
    }

    if (isBirthDateInFuture(parsedBirthDate.date)) {
      setErrorMessage(t.settingsBirthDateFuture);
      return;
    }

    if (!isValidLifeExpectancy(lifeExpectancy)) {
      setErrorMessage(t.settingsLifeExpectancyInvalid);
      return;
    }

    setErrorMessage('');
    commitSettings({
      ...settings,
      birthDate: parsedBirthDate.normalized,
      language,
      lifeExpectancy,
      theme: themeMode,
    });
  }

  function handleThemeChange(nextThemeMode: ThemeMode) {
    setThemeMode(nextThemeMode);
    commitSettings({
      ...settings,
      birthDate: getCommittedBirthDate(),
      language,
      lifeExpectancy,
      theme: nextThemeMode,
    });
  }

  function handleLanguageChange(nextLanguage: LanguageCode) {
    setLanguage(nextLanguage);
    commitSettings({
      ...settings,
      birthDate: getCommittedBirthDate(),
      language: nextLanguage,
      lifeExpectancy,
      theme: themeMode,
    });
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      <ScrollView bounces={false} contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={onBack} style={styles.backIconButton}>
            <Text style={[styles.backIconText, { color: theme.colors.text }]}>›</Text>
          </Pressable>
          <Text style={[styles.title, { color: theme.colors.text }]}>{t.settingsTitle}</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View
          style={[
            styles.card,
            {
              backgroundColor: 'transparent',
              shadowColor: 'transparent',
            },
          ]}
        >
          <View
            style={[
              styles.sectionCard,
              {
                backgroundColor: theme.colors.inputBackground,
              },
            ]}
          >
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{t.settingsDisplay}</Text>
            <Text style={[styles.label, { color: theme.colors.text }]}>{t.settingsTheme}</Text>
            <View style={styles.toggleRow}>
              <ThemeChip
                label={t.settingsThemeLight}
                selected={themeMode === 'light'}
                onPress={() => handleThemeChange('light')}
                theme={theme}
              />
              <ThemeChip
                label={t.settingsThemeDark}
                selected={themeMode === 'dark'}
                onPress={() => handleThemeChange('dark')}
                theme={theme}
              />
            </View>

            <Text style={[styles.label, styles.spacingTop, { color: theme.colors.text }]}>
              {t.settingsLanguage}
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.languageScroll}
              contentContainerStyle={styles.languageRow}
            >
              {LANGUAGE_OPTIONS.map((option) => (
                <View key={option.code} style={styles.languageChipWrap}>
                  <PrimaryButton
                    label={option.label}
                    onPress={() => handleLanguageChange(option.code)}
                    theme={theme}
                    variant={language === option.code ? 'primary' : 'secondary'}
                  />
                </View>
              ))}
            </ScrollView>
          </View>

          <View
            style={[
              styles.sectionCard,
              {
                backgroundColor: theme.colors.inputBackground,
              },
            ]}
          >
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{t.settingsLife}</Text>
            <DateInput
              actionLabel={t.commonSelect}
              closeLabel={t.commonClose}
              label={t.settingsBirthDateLabel}
              maximumDate={new Date()}
              onChange={handleBirthDateChange}
              placeholder={t.settingsBirthDatePlaceholder}
              theme={theme}
              value={birthDate}
            />
            <Text style={[styles.label, styles.spacingTop, { color: theme.colors.text }]}>
              {t.settingsLifeExpectancyLabel}
            </Text>
            <NumberWheelInput
              actionLabel={t.commonSelect}
              closeLabel={t.commonClose}
              label=""
              max={120}
              min={1}
              onChange={updateLifeExpectancy}
              theme={theme}
              value={lifeExpectancy}
            />
          </View>

          {errorMessage ? (
            <Text style={[styles.error, { color: theme.colors.current }]}>{errorMessage}</Text>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function ThemeChip({
  label,
  selected,
  onPress,
  theme,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  theme: ReturnType<typeof getTheme>;
}) {
  return (
    <View style={styles.themeChipWrap}>
      <PrimaryButton
        label={label}
        onPress={onPress}
        theme={theme}
        variant={selected ? 'primary' : 'secondary'}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    paddingVertical: 4,
  },
  container: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  error: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 14,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  backIconButton: {
    alignItems: 'center',
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  backIconText: {
    fontSize: 28,
    fontWeight: '500',
    lineHeight: 28,
    transform: [{ rotate: '180deg' }],
  },
  headerSpacer: {
    width: 36,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 16,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  languageChipWrap: {
    minWidth: 104,
  },
  languageRow: {
    flexDirection: 'row',
    gap: 8,
    paddingRight: 4,
  },
  languageScroll: {
    marginRight: -4,
  },
  safeArea: {
    flex: 1,
  },
  sectionCard: {
    borderRadius: 22,
    marginBottom: 16,
    padding: 18,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 12,
  },
  spacingTop: {
    marginTop: 22,
  },
  themeChipWrap: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
  },
  toggleRow: {
    flexDirection: 'row',
    gap: 12,
  },
});
