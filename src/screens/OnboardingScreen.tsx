import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { DateInput } from '../components/DateInput';
import { getPreferredLanguage, getTranslations } from '../i18n';
import { PrimaryButton } from '../components/PrimaryButton';
import { getTheme } from '../theme';
import type { UserSettings } from '../types';
import { isBirthDateInFuture, isValidLifeExpectancy, parseBirthDate } from '../utils/lifeCalendar';

interface OnboardingScreenProps {
  onSubmit: (settings: UserSettings) => void;
}

export function OnboardingScreen({ onSubmit }: OnboardingScreenProps) {
  const theme = getTheme('light');
  const preferredLanguage = getPreferredLanguage();
  const t = getTranslations(preferredLanguage);
  const [birthDate, setBirthDate] = useState('');
  const [lifeExpectancy, setLifeExpectancy] = useState(80);
  const [errorMessage, setErrorMessage] = useState('');

  function updateLifeExpectancy(nextValue: number) {
    const boundedValue = Math.max(1, Math.min(120, nextValue));
    setLifeExpectancy(boundedValue);
    if (errorMessage) {
      setErrorMessage('');
    }
  }

  function handleBirthDateChange(nextValue: string) {
    setBirthDate(nextValue);
    if (errorMessage) {
      setErrorMessage('');
    }
  }

  function handleSubmit() {
    const parsedBirthDate = parseBirthDate(birthDate);

    if (!parsedBirthDate) {
      setErrorMessage(t.onboardingBirthDateInvalid);
      return;
    }

    if (isBirthDateInFuture(parsedBirthDate.date)) {
      setErrorMessage(t.onboardingBirthDateFuture);
      return;
    }

    if (!isValidLifeExpectancy(lifeExpectancy)) {
      setErrorMessage(t.onboardingLifeExpectancyInvalid);
      return;
    }

    setErrorMessage('');

    onSubmit({
      birthDate: parsedBirthDate.normalized,
      language: preferredLanguage,
      lifeExpectancy,
      selectedCalendarYear: new Date().getFullYear(),
      theme: 'light',
      viewMode: 'life',
    });
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.safeArea}
      >
        <ScrollView
          bounces={false}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={[styles.step, { color: theme.colors.mutedText }]}>{t.onboardingStep}</Text>
          <Text style={[styles.title, { color: theme.colors.text }]}>{t.onboardingTitle}</Text>
          <Text style={[styles.description, { color: theme.colors.mutedText }]}>
            {t.onboardingDescription}
          </Text>

          <View
            style={[
              styles.card,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
                shadowColor: theme.colors.shadow,
              },
            ]}
          >
            <DateInput
              actionLabel={t.commonSelect}
              closeLabel={t.commonClose}
              helperText={t.onboardingBirthDateHelper}
              label={t.onboardingBirthDateLabel}
              maximumDate={new Date()}
              onChange={handleBirthDateChange}
              placeholder={t.onboardingBirthDatePlaceholder}
              theme={theme}
              value={birthDate}
            />

            <Text style={[styles.label, styles.spacingTop, { color: theme.colors.text }]}>
              {t.onboardingLifeExpectancyLabel}
            </Text>
            <View
              style={[
                styles.stepper,
                {
                  backgroundColor: theme.colors.inputBackground,
                  borderColor: theme.colors.border,
                },
              ]}
            >
              <StepperButton
                label="-"
                onPress={() => updateLifeExpectancy(lifeExpectancy - 1)}
                themeColor={theme.colors.primary}
              />
              <View style={styles.stepperCenter}>
                <Text style={[styles.stepperValue, { color: theme.colors.text }]}>
                  {lifeExpectancy}
                </Text>
                <Text style={[styles.stepperUnit, { color: theme.colors.mutedText }]}>
                  {t.commonYears}
                </Text>
              </View>
              <StepperButton
                label="+"
                onPress={() => updateLifeExpectancy(lifeExpectancy + 1)}
                themeColor={theme.colors.primary}
              />
            </View>

            <View
              style={[
                styles.preview,
                {
                  backgroundColor: theme.colors.surfaceMuted,
                  borderColor: theme.colors.border,
                },
              ]}
            >
              <Text style={[styles.previewLabel, { color: theme.colors.mutedText }]}>
                {t.onboardingTotalWeeksLabel}
              </Text>
              <Text style={[styles.previewValue, { color: theme.colors.text }]}>
                {lifeExpectancy * 52} {t.commonWeeksShort}
              </Text>
            </View>

            {errorMessage ? (
              <Text style={[styles.error, { color: theme.colors.current }]}>{errorMessage}</Text>
            ) : null}

            <PrimaryButton label={t.onboardingStart} onPress={handleSubmit} theme={theme} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function StepperButton({
  label,
  onPress,
  themeColor,
}: {
  label: string;
  onPress: () => void;
  themeColor: string;
}) {
  return (
    <Pressable onPress={onPress} style={[styles.stepperButton, { borderColor: themeColor }]}>
      <Text style={[styles.stepperButtonText, { color: themeColor }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 28,
    borderWidth: 1,
    padding: 22,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 1,
    shadowRadius: 24,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 28,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 28,
  },
  error: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 10,
  },
  preview: {
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 18,
    marginTop: 18,
    padding: 16,
  },
  previewLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  previewValue: {
    fontSize: 22,
    fontWeight: '800',
  },
  safeArea: {
    flex: 1,
  },
  spacingTop: {
    marginTop: 18,
  },
  step: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  stepper: {
    alignItems: 'center',
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 72,
    paddingHorizontal: 14,
  },
  stepperButton: {
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  stepperButtonText: {
    fontSize: 24,
    fontWeight: '500',
    marginTop: -2,
  },
  stepperCenter: {
    alignItems: 'center',
  },
  stepperUnit: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  stepperValue: {
    fontSize: 28,
    fontWeight: '800',
  },
  title: {
    fontSize: 34,
    fontWeight: '800',
    marginBottom: 10,
  },
});
