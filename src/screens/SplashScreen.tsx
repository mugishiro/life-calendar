import { ActivityIndicator, SafeAreaView, StyleSheet, Text, View } from 'react-native';

import { getPreferredLanguage, getTranslations } from '../i18n';
import { getTheme } from '../theme';

export function SplashScreen() {
  const theme = getTheme('light');
  const t = getTranslations(getPreferredLanguage());

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      <View style={styles.container}>
        <Text style={[styles.title, { color: theme.colors.text }]}>{t.appTitle}</Text>
        <View style={[styles.icon, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.iconText, { color: theme.colors.primary }]}>
            52 × {t.commonYears}
          </Text>
        </View>
        <ActivityIndicator color={theme.colors.primary} size="small" />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  icon: {
    alignItems: 'center',
    borderRadius: 28,
    height: 112,
    justifyContent: 'center',
    marginBottom: 24,
    marginTop: 28,
    width: 112,
  },
  iconText: {
    fontSize: 15,
    fontWeight: '700',
  },
  safeArea: {
    flex: 1,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
