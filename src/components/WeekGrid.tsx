import { useEffect, useRef } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import type { AppTheme } from '../theme';
import type { WeekMemoMap } from '../types';

interface WeekGridProps {
  totalYears: number;
  elapsedWeeks: number;
  currentWeekIndex: number;
  currentYearIndex: number;
  weekMemos: WeekMemoMap;
  onSelectWeek: (weekIndex: number) => void;
  selectedWeekIndex: number | null;
  theme: AppTheme;
}

const GAP = 2;
const ROW_LABEL_WIDTH = 30;

export function WeekGrid({
  totalYears,
  elapsedWeeks,
  currentWeekIndex,
  currentYearIndex,
  weekMemos,
  onSelectWeek,
  selectedWeekIndex,
  theme,
}: WeekGridProps) {
  const scrollRef = useRef<ScrollView | null>(null);
  const { width } = useWindowDimensions();
  const isCompact = width < 390;
  const availableWidth = width - 32 - ROW_LABEL_WIDTH - GAP * 51;
  const cellSize = Math.max(4, Math.min(isCompact ? 6 : 7, Math.floor(availableWidth / 52)));
  const rowHeight = cellSize + (isCompact ? 8 : 10);
  const initialOffset = Math.max(0, (currentYearIndex - 3) * rowHeight);

  useEffect(() => {
    const timer = setTimeout(() => {
      scrollRef.current?.scrollTo({ animated: false, x: 0, y: initialOffset });
    }, 0);

    return () => clearTimeout(timer);
  }, [initialOffset]);

  function handleRowPress(yearIndex: number, locationX: number) {
    const columnWidth = cellSize + GAP;
    const weekIndex = Math.max(0, Math.min(51, Math.floor(locationX / columnWidth)));
    onSelectWeek(yearIndex * 52 + weekIndex);
  }

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        style={[styles.gridFrame, isCompact ? styles.gridFrameCompact : null]}
      >
        <View style={styles.gridInner}>
          {Array.from({ length: totalYears }, (_, yearIndex) => (
            <View
              key={yearIndex}
              style={[
                styles.row,
                {
                  backgroundColor:
                    yearIndex === currentYearIndex ? theme.colors.surfaceMuted : 'transparent',
                  minHeight: rowHeight,
                },
              ]}
            >
              <View style={styles.rowLabelWrap}>
                <Text
                  numberOfLines={1}
                  style={[
                    styles.rowLabelText,
                    yearIndex % 10 === 0 ? styles.rowLabelTextStrong : null,
                    {
                      color:
                        yearIndex % 10 === 0 ? theme.colors.text : theme.colors.mutedText,
                    },
                  ]}
                >
                  {yearIndex}
                </Text>
              </View>
              <Pressable
                hitSlop={6}
                onPress={(event) => handleRowPress(yearIndex, event.nativeEvent.locationX)}
                style={styles.cellsRow}
              >
                {Array.from({ length: 52 }, (_, weekIndex) => {
                  const absoluteWeekIndex = yearIndex * 52 + weekIndex;
                  const isCurrent = absoluteWeekIndex === currentWeekIndex;
                  const isPast = absoluteWeekIndex < elapsedWeeks;
                  const hasMemo = Boolean(weekMemos[String(absoluteWeekIndex)]?.trim());
                  const backgroundColor = isCurrent
                    ? theme.colors.current
                    : hasMemo
                      ? theme.colors.memo
                      : isPast
                        ? theme.colors.past
                        : theme.colors.future;
                  return (
                    <View
                      key={absoluteWeekIndex}
                      style={[
                        styles.cell,
                        {
                          backgroundColor,
                          height: cellSize,
                          width: cellSize,
                          shadowColor: hasMemo ? theme.colors.memo : theme.colors.current,
                        },
                        isCurrent ? styles.currentCell : null,
                        selectedWeekIndex === absoluteWeekIndex ? styles.selectedCell : null,
                      ]}
                    />
                  );
                })}
              </Pressable>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: 0,
  },
  currentCell: {
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 6,
    transform: [{ scale: 1.08 }],
  },
  cell: {
    borderRadius: 2,
    marginBottom: GAP,
    marginRight: GAP,
    overflow: 'hidden',
    position: 'relative',
  },
  cellsRow: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
  },
  gridFrame: {
    flex: 1,
    minHeight: 0,
    paddingVertical: 0,
  },
  gridFrameCompact: {
    paddingVertical: 0,
  },
  gridInner: {
    paddingBottom: 10,
    paddingHorizontal: 2,
    paddingTop: 4,
  },
  row: {
    alignItems: 'center',
    borderRadius: 8,
    flexDirection: 'row',
    marginBottom: 3,
  },
  rowLabelText: {
    fontSize: 10,
    fontWeight: '600',
    lineHeight: 12,
    minWidth: 20,
    textAlign: 'right',
  },
  rowLabelTextStrong: {
    fontSize: 11,
    fontWeight: '900',
  },
  rowLabelWrap: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingRight: 8,
    width: ROW_LABEL_WIDTH,
  },
  selectedCell: {
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.24,
    shadowRadius: 8,
    transform: [{ scale: 1.14 }],
    zIndex: 1,
  },
});
