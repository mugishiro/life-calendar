import DateTimePicker, {
  DateTimePickerAndroid,
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useMemo, useState } from 'react';

import type { DateInputProps } from './DateInput.types';
import { formatDateAsIso, parseBirthDate } from '../utils/lifeCalendar';

export function DateInput({
  label,
  value,
  onChange,
  theme,
  placeholder = 'Select a date',
  helperText,
  maximumDate,
  actionLabel = 'Select',
  closeLabel = 'Close',
}: DateInputProps) {
  const [isPickerVisible, setIsPickerVisible] = useState(false);

  const pickerDate = useMemo(() => {
    const parsed = parseBirthDate(value);

    if (parsed) {
      return parsed.date;
    }

    const referenceDate = maximumDate ?? new Date();
    return new Date(referenceDate.getFullYear() - 25, referenceDate.getMonth(), referenceDate.getDate());
  }, [maximumDate, value]);

  function updateDate(event: DateTimePickerEvent, selectedDate?: Date) {
    if (Platform.OS === 'android') {
      setIsPickerVisible(false);
    }

    if (event.type !== 'set' || !selectedDate) {
      return;
    }

    onChange(formatDateAsIso(selectedDate));
  }

  function openPicker() {
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        mode: 'date',
        onChange: updateDate,
        value: pickerDate,
        maximumDate,
      });
      return;
    }

    setIsPickerVisible((current) => !current);
  }

  return (
    <View>
      <Text style={[styles.label, { color: theme.colors.text }]}>{label}</Text>
      <Pressable
        onPress={openPicker}
        style={[
          styles.field,
          {
            backgroundColor: theme.colors.inputBackground,
            borderColor: theme.colors.border,
          },
        ]}
      >
        <Text
          numberOfLines={1}
          style={[
            styles.value,
            { color: value ? theme.colors.text : theme.colors.mutedText },
          ]}
        >
          {value || placeholder}
        </Text>
        <Text style={[styles.action, { color: theme.colors.primary }]}>{actionLabel}</Text>
      </Pressable>
      {helperText ? <Text style={[styles.helper, { color: theme.colors.mutedText }]}>{helperText}</Text> : null}

      {Platform.OS === 'ios' && isPickerVisible ? (
        <View
          style={[
            styles.pickerCard,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <View style={styles.pickerWrap}>
            <DateTimePicker
              display="spinner"
              mode="date"
              maximumDate={maximumDate}
              onChange={updateDate}
              style={styles.picker}
              themeVariant={theme.mode}
              textColor={theme.colors.text}
              value={pickerDate}
            />
          </View>
          <Pressable onPress={() => setIsPickerVisible(false)} style={styles.closeButton}>
            <Text style={[styles.closeLabel, { color: theme.colors.primary }]}>{closeLabel}</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  action: {
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 12,
  },
  closeButton: {
    alignItems: 'center',
    marginTop: 8,
    paddingVertical: 8,
  },
  closeLabel: {
    fontSize: 15,
    fontWeight: '700',
  },
  field: {
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 54,
    paddingHorizontal: 16,
  },
  helper: {
    fontSize: 12,
    marginTop: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 16,
    marginBottom: 10,
  },
  pickerCard: {
    alignItems: 'stretch',
    borderRadius: 18,
    borderWidth: 1,
    marginTop: 12,
    paddingHorizontal: 6,
    paddingVertical: 8,
  },
  picker: {
    alignSelf: 'center',
    width: 320,
  },
  pickerWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    width: '100%',
  },
  value: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 22,
    minWidth: 0,
  },
});
