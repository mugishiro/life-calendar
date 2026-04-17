import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { AppTheme } from '../theme';
import type { WeekMemoMap } from '../types';
import type { CalendarYearWeek } from '../utils/lifeCalendar';
import { YearWeekGrid } from './YearWeekGrid';

interface YearModePanelProps {
  calendarYear: number;
  maxCalendarYear: number;
  minCalendarYear: number;
  onSelectWeek: (weekIndex: number) => void;
  onShiftCalendarYear: (delta: number) => void;
  selectedWeekIndex: number | null;
  theme: AppTheme;
  weekMemos: WeekMemoMap;
  weeks: CalendarYearWeek[];
}

export function YearModePanel({
  calendarYear,
  maxCalendarYear,
  minCalendarYear,
  onSelectWeek,
  onShiftCalendarYear,
  selectedWeekIndex,
  theme,
  weekMemos,
  weeks,
}: YearModePanelProps) {
  return (
    <View style={styles.yearView}>
      <View style={styles.yearHeader}>
        <Pressable
          disabled={calendarYear <= minCalendarYear}
          onPress={() => onShiftCalendarYear(-1)}
          style={[
            styles.yearButton,
            {
              backgroundColor: theme.colors.surfaceMuted,
              opacity: calendarYear <= minCalendarYear ? 0.35 : 1,
            },
          ]}
        >
          <Text style={[styles.yearButtonText, { color: theme.colors.text }]}>‹</Text>
        </Pressable>
        <Text style={[styles.yearTitle, { color: theme.colors.text }]}>{calendarYear}</Text>
        <Pressable
          disabled={calendarYear >= maxCalendarYear}
          onPress={() => onShiftCalendarYear(1)}
          style={[
            styles.yearButton,
            {
              backgroundColor: theme.colors.surfaceMuted,
              opacity: calendarYear >= maxCalendarYear ? 0.35 : 1,
            },
          ]}
        >
          <Text style={[styles.yearButtonText, { color: theme.colors.text }]}>›</Text>
        </Pressable>
      </View>
      <YearWeekGrid
        onSelectWeek={onSelectWeek}
        selectedWeekIndex={selectedWeekIndex}
        theme={theme}
        weeks={weeks}
        weekMemos={weekMemos}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  yearButton: {
    alignItems: 'center',
    borderRadius: 14,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  yearButtonText: {
    fontSize: 24,
    fontWeight: '600',
    lineHeight: 24,
  },
  yearHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingHorizontal: 8,
  },
  yearTitle: {
    fontSize: 24,
    fontWeight: '800',
  },
  yearView: {
    flex: 1,
    minHeight: 0,
  },
});
