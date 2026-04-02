import { Pressable, StyleSheet, Text, View } from 'react-native';

import { getTranslations } from '../i18n';
import type { AppTheme } from '../theme';
import type { LanguageCode, ViewMode } from '../types';

interface ViewModeSwitchProps {
  language: LanguageCode;
  onChange: (mode: ViewMode) => void;
  theme: AppTheme;
  value: ViewMode;
}

const MODES: ViewMode[] = ['life', 'year'];

export function ViewModeSwitch({
  language,
  onChange,
  theme,
  value,
}: ViewModeSwitchProps) {
  const t = getTranslations(language);
  const labels: Record<ViewMode, string> = {
    life: t.mainModeLife,
    year: t.mainModeYear,
  };

  return (
    <View
      style={[
        styles.wrap,
        {
          backgroundColor: theme.colors.surfaceMuted,
        },
      ]}
    >
      {MODES.map((mode) => {
        const selected = mode === value;
        return (
          <Pressable
            key={mode}
            onPress={() => onChange(mode)}
            style={[
              styles.segment,
              selected
                ? {
                    backgroundColor: theme.colors.surface,
                    shadowColor: theme.colors.shadow,
                  }
                : null,
            ]}
          >
            <Text
              style={[
                styles.segmentLabel,
                {
                  color: selected ? theme.colors.text : theme.colors.mutedText,
                },
              ]}
            >
              {labels[mode]}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  segment: {
    alignItems: 'center',
    borderRadius: 14,
    flex: 1,
    justifyContent: 'center',
    minHeight: 40,
    paddingHorizontal: 10,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 14,
  },
  segmentLabel: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.1,
  },
  wrap: {
    borderRadius: 18,
    flexDirection: 'row',
    gap: 6,
    marginBottom: 10,
    padding: 6,
  },
});
