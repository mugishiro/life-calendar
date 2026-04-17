import { memo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import type { AppTheme } from '../theme';
import type { WeekMemoMap } from '../types';
import type { CalendarYearWeek } from '../utils/lifeCalendar';

interface YearWeekGridProps {
  onSelectWeek: (weekIndex: number) => void;
  selectedWeekIndex: number | null;
  theme: AppTheme;
  weeks: CalendarYearWeek[];
  weekMemos: WeekMemoMap;
}

function getMonthKey(value: string) {
  return value.slice(0, 7);
}

function getDayRangeLabel(startDate: string, endDate: string) {
  return `${startDate.slice(8, 10)}-${endDate.slice(8, 10)}`;
}

function groupWeeksByMonth(weeks: CalendarYearWeek[]) {
  const months = new Map<string, CalendarYearWeek[]>();

  for (const week of weeks) {
    const monthKey = getMonthKey(week.startDate);
    const current = months.get(monthKey) ?? [];
    current.push(week);
    months.set(monthKey, current);
  }

  return Array.from(months.entries());
}

function fillMonthWeeks(weeks: CalendarYearWeek[]) {
  const filled = [...weeks];

  while (filled.length < 5) {
    filled.push({
      endDate: '',
      isCurrent: false,
      lifeWeekIndex: null,
      phase: 'outside',
      startDate: '',
      weekNumber: -1,
    });
  }

  return filled.slice(0, 5);
}

function getChipTextColor(
  theme: AppTheme,
  phase: CalendarYearWeek['phase'],
  hasMemo: boolean,
) {
  if (phase === 'future' || phase === 'outside') {
    return theme.colors.text;
  }

  if (hasMemo) {
    return theme.mode === 'light' ? '#ffffff' : '#062434';
  }

  return theme.colors.primaryText;
}

function YearWeekGridComponent({
  onSelectWeek,
  selectedWeekIndex,
  theme,
  weeks,
  weekMemos,
}: YearWeekGridProps) {
  const monthGroups = groupWeeksByMonth(weeks);

  return (
    <ScrollView
      bounces={false}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {monthGroups.map(([monthKey, monthWeeks]) => (
        <View
          key={monthKey}
          style={[
            styles.monthSection,
            {
              backgroundColor: theme.colors.surfaceMuted,
            },
          ]}
        >
          <Text style={[styles.monthTitle, { color: theme.colors.text }]}>
            {monthKey.slice(5, 7)}
          </Text>

          <View style={styles.monthWeeks}>
            {fillMonthWeeks(monthWeeks).map((week, index) => {
              const hasMappedWeek = week.lifeWeekIndex !== null;
              const isSelected =
                hasMappedWeek &&
                selectedWeekIndex !== null &&
                selectedWeekIndex === week.lifeWeekIndex;
              const hasMemo =
                week.lifeWeekIndex !== null &&
                Boolean(weekMemos[String(week.lifeWeekIndex)]?.trim());
              const backgroundColor =
                week.phase === 'current'
                  ? theme.colors.current
                  : hasMemo
                    ? theme.colors.memo
                    : week.phase === 'outside'
                      ? theme.colors.surface
                      : week.phase === 'past'
                        ? theme.colors.past
                        : theme.colors.future;

              const isPlaceholder = week.weekNumber === -1;
              const chipTextColor = getChipTextColor(theme, week.phase, hasMemo);
              const chipDateColor =
                week.phase === 'future' || week.phase === 'outside'
                  ? theme.colors.mutedText
                  : chipTextColor;

              return (
                <Pressable
                  key={`${monthKey}-${index}`}
                  disabled={!hasMappedWeek || isPlaceholder}
                  onPress={() => {
                    if (week.lifeWeekIndex !== null) {
                      onSelectWeek(week.lifeWeekIndex);
                    }
                  }}
                  style={[
                    styles.weekChip,
                    {
                      backgroundColor,
                      opacity: isPlaceholder ? 0 : hasMappedWeek ? 1 : 0.5,
                    },
                    isSelected ? styles.weekChipSelected : null,
                  ]}
                >
                  {!isPlaceholder ? (
                    <>
                      <Text
                        style={[
                          styles.weekChipNumber,
                          {
                            color: chipTextColor,
                          },
                        ]}
                      >
                        {String(week.weekNumber).padStart(2, '0')}
                      </Text>
                      <Text
                        adjustsFontSizeToFit
                        minimumFontScale={0.72}
                        numberOfLines={1}
                        style={[
                          styles.weekChipDate,
                          {
                            color: chipDateColor,
                          },
                          hasMemo || week.phase === 'current' || week.phase === 'past'
                            ? styles.weekChipDateStrong
                            : null,
                        ]}
                      >
                        {getDayRangeLabel(week.startDate, week.endDate)}
                      </Text>
                    </>
                  ) : null}
                </Pressable>
              );
            })}
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

export const YearWeekGrid = memo(
  YearWeekGridComponent,
  (prevProps, nextProps) =>
    prevProps.selectedWeekIndex === nextProps.selectedWeekIndex &&
    prevProps.theme === nextProps.theme &&
    prevProps.weeks === nextProps.weeks &&
    prevProps.weekMemos === nextProps.weekMemos,
);

const styles = StyleSheet.create({
  content: {
    paddingBottom: 10,
    paddingHorizontal: 8,
    paddingTop: 2,
  },
  monthSection: {
    borderRadius: 18,
    marginBottom: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: '800',
    lineHeight: 20,
    marginBottom: 10,
  },
  monthWeeks: {
    flexDirection: 'row',
    gap: 6,
  },
  weekChip: {
    borderRadius: 14,
    flex: 1,
    minHeight: 56,
    minWidth: 0,
    paddingHorizontal: 6,
    paddingVertical: 8,
  },
  weekChipDate: {
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 13,
    textAlign: 'center',
  },
  weekChipDateStrong: {
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  weekChipNumber: {
    fontSize: 16,
    fontWeight: '800',
    lineHeight: 18,
    marginBottom: 6,
  },
  weekChipSelected: {
    transform: [{ scale: 1.05 }],
  },
});
