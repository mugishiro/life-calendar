import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { AppTheme } from '../theme';

interface MainHeaderProps {
  onOpenSettings: () => void;
  theme: AppTheme;
  title: string;
}

export function MainHeader({ onOpenSettings, theme, title }: MainHeaderProps) {
  return (
    <View style={styles.header}>
      <View style={styles.headerCopy}>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>{title}</Text>
      </View>
      <Pressable onPress={onOpenSettings} style={styles.settingsButton}>
        <Text style={[styles.settingsButtonIcon, { color: theme.colors.text }]}>···</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    justifyContent: 'center',
    marginBottom: 10,
    minHeight: 40,
    paddingRight: 60,
  },
  headerCopy: {
    flexShrink: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
  },
  settingsButton: {
    alignItems: 'center',
    height: 48,
    justifyContent: 'center',
    position: 'absolute',
    right: 0,
    top: 0,
    width: 48,
  },
  settingsButtonIcon: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 1,
    lineHeight: 18,
  },
});
