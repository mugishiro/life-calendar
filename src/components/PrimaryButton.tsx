import { Pressable, StyleSheet, Text } from 'react-native';

import type { AppTheme } from '../theme';

interface PrimaryButtonProps {
  disabled?: boolean;
  label: string;
  onPress: () => void;
  theme: AppTheme;
  variant?: 'primary' | 'secondary';
}

export function PrimaryButton({
  disabled = false,
  label,
  onPress,
  theme,
  variant = 'primary',
}: PrimaryButtonProps) {
  const isPrimary = variant === 'primary';

  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: isPrimary ? theme.colors.primary : theme.colors.surfaceMuted,
          borderColor: isPrimary ? theme.colors.primary : theme.colors.border,
          opacity: disabled ? 0.45 : pressed ? 0.88 : 1,
        },
      ]}
    >
      <Text
        numberOfLines={1}
        style={[
          styles.label,
          { color: isPrimary ? theme.colors.primaryText : theme.colors.text },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    borderRadius: 18,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 54,
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
