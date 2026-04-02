import { StyleSheet, Text, TextInput, View } from 'react-native';

import type { DateInputProps } from './DateInput.types';

export function DateInput({
  label,
  value,
  onChange,
  theme,
  placeholder = '1998-04-01',
  helperText,
}: DateInputProps) {
  return (
    <View>
      <Text style={[styles.label, { color: theme.colors.text }]}>{label}</Text>
      <TextInput
        autoCapitalize="none"
        keyboardType="numbers-and-punctuation"
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.mutedText}
        style={[
          styles.input,
          {
            backgroundColor: theme.colors.inputBackground,
            borderColor: theme.colors.border,
            color: theme.colors.text,
          },
        ]}
        value={value}
      />
      {helperText ? <Text style={[styles.helper, { color: theme.colors.mutedText }]}>{helperText}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  helper: {
    fontSize: 12,
    marginTop: 8,
  },
  input: {
    borderRadius: 16,
    borderWidth: 1,
    fontSize: 18,
    fontWeight: '700',
    minHeight: 54,
    paddingHorizontal: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 16,
    marginBottom: 10,
  },
});
