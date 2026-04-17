import { memo, useState } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';

import type { AppTheme } from '../theme';
import { getFeltTimelineCells } from '../utils/lifeCalendar';

interface FeltWeekGridProps {
  totalYears: number;
  currentWeekIndex: number;
  theme: AppTheme;
}

function findCellIndexByWeek(
  weekIndex: number,
  cells: ReturnType<typeof getFeltTimelineCells>,
) {
  for (let index = 0; index < cells.length; index += 1) {
    const cell = cells[index];

    if (!cell) {
      continue;
    }

    if (weekIndex < cell.startWeekIndex) {
      return Math.max(0, index - 1);
    }

    if (weekIndex >= cell.startWeekIndex && weekIndex <= cell.endWeekIndex) {
      return index;
    }
  }

  return Math.max(cells.length - 1, -1);
}

function getBoundaryLevel(
  cellIndex: number,
  cells: ReturnType<typeof getFeltTimelineCells>,
) {
  const cell = cells[cellIndex];

  if (!cell || cells[cellIndex - 1]?.ageYear === cell.ageYear) {
    return 0;
  }

  if (cell.ageYear === 0 || cell.ageYear % 10 === 0) {
    return 3;
  }

  if (cell.ageYear % 5 === 0) {
    return 2;
  }

  return 1;
}
function FeltWeekGridComponent({
  totalYears,
  currentWeekIndex,
  theme,
}: FeltWeekGridProps) {
  const { width } = useWindowDimensions();
  const isCompact = width < 390;
  const [frameSize, setFrameSize] = useState({
    height: 0,
    width: 0,
  });
  const gap = 1;
  const availableWidth = Math.max(0, frameSize.width - 4);
  const availableHeight = Math.max(0, frameSize.height - 4);
  const minCellWidth = isCompact ? 6 : 7;
  const minCellHeight = isCompact ? 6 : 7;
  const maxColumnsByMinSize = Math.max(
    1,
    Math.floor((availableWidth + gap) / (minCellWidth + gap)),
  );
  const maxRowsByMinSize = Math.max(
    1,
    Math.floor((availableHeight + gap) / (minCellHeight + gap)),
  );
  const cells = getFeltTimelineCells(totalYears, maxColumnsByMinSize * maxRowsByMinSize);
  const currentCellIndex = findCellIndexByWeek(currentWeekIndex, cells);
  const maxColumns = Math.max(1, Math.min(maxColumnsByMinSize, cells.length));
  const minColumns = Math.max(1, Math.ceil(cells.length / maxRowsByMinSize));

  let bestColumns = minColumns;
  let bestRows = Math.max(1, Math.ceil(cells.length / Math.max(minColumns, 1)));
  let bestCellWidth =
    (availableWidth - gap * Math.max(bestColumns - 1, 0)) / bestColumns;
  let bestCellHeight =
    (availableHeight - gap * Math.max(bestRows - 1, 0)) / bestRows;
  let bestScore = Math.min(bestCellWidth, bestCellHeight);

  for (let columns = minColumns; columns <= maxColumns; columns += 1) {
    const rows = Math.max(1, Math.ceil(cells.length / columns));

    if (rows > maxRowsByMinSize) {
      continue;
    }

    const candidateCellWidth = (availableWidth - gap * Math.max(columns - 1, 0)) / columns;
    const candidateCellHeight = (availableHeight - gap * Math.max(rows - 1, 0)) / rows;
    const score = Math.min(candidateCellWidth, candidateCellHeight);

    if (score > bestScore) {
      bestColumns = columns;
      bestRows = rows;
      bestCellWidth = candidateCellWidth;
      bestCellHeight = candidateCellHeight;
      bestScore = score;
    }
  }

  const columns = bestColumns;
  const cellWidth = Math.max(minCellWidth, Math.floor(bestCellWidth));
  const cellHeight = Math.max(minCellHeight, Math.floor(bestCellHeight));
  const rows: Array<typeof cells> = [];

  for (let startIndex = 0; startIndex < cells.length; startIndex += columns) {
    rows.push(cells.slice(startIndex, startIndex + columns));
  }

  return (
    <View
      onLayout={(event) => {
        const nextWidth = Math.round(event.nativeEvent.layout.width);
        const nextHeight = Math.round(event.nativeEvent.layout.height);

        setFrameSize((current) =>
          current.width === nextWidth && current.height === nextHeight
            ? current
            : {
                height: nextHeight,
                width: nextWidth,
              },
        );
      }}
      style={styles.container}
    >
      {frameSize.width > 0 && frameSize.height > 0 ? (
        <View style={styles.gridFrame}>
        {rows.map((row, rowIndex) => (
          <View
            key={rowIndex}
            style={[
              styles.row,
              {
                marginBottom: rowIndex === rows.length - 1 ? 0 : gap,
              },
            ]}
          >
            {row.map((cell, columnIndex) => {
              const feltCellIndex = rowIndex * columns + columnIndex;
              const isCurrent = feltCellIndex === currentCellIndex;
              const boundaryLevel = getBoundaryLevel(feltCellIndex, cells);
              const phase =
                currentCellIndex === -1 || feltCellIndex > currentCellIndex
                  ? 'future'
                  : feltCellIndex === currentCellIndex
                    ? 'current'
                    : 'past';
              const markerWidth =
                boundaryLevel >= 3 ? (cellWidth <= 7 ? 1 : 2) : 1;
              const markerHeight =
                boundaryLevel >= 3
                  ? cellHeight
                  : boundaryLevel === 2
                    ? Math.max(3, Math.floor(cellHeight * 0.72))
                    : Math.max(2, Math.floor(cellHeight * 0.42));
              const markerColor =
                boundaryLevel >= 3
                  ? theme.colors.text
                  : boundaryLevel === 2
                    ? phase === 'future'
                      ? theme.colors.outline
                      : theme.colors.text
                    : theme.colors.outline;
              const currentBorderWidth =
                isCurrent && cellWidth >= 10 && cellHeight >= 10 ? 2 : isCurrent ? 1 : 0;

              return (
                <View
                  key={`${cell.startWeekIndex}-${cell.endWeekIndex}`}
                  style={[
                    styles.cell,
                    {
                      backgroundColor:
                        phase === 'current'
                          ? theme.colors.current
                          : phase === 'past'
                            ? theme.colors.past
                            : theme.colors.future,
                      borderColor: isCurrent ? theme.colors.text : 'transparent',
                      borderWidth: currentBorderWidth,
                      height: cellHeight,
                      marginRight: columnIndex === row.length - 1 ? 0 : gap,
                      width: cellWidth,
                    },
                  ]}
                >
                  {boundaryLevel > 0 ? (
                    <View
                      style={[
                        styles.boundaryMarker,
                        {
                          backgroundColor: markerColor,
                          height: markerHeight,
                          width: markerWidth,
                        },
                      ]}
                    />
                  ) : null}
                  {boundaryLevel >= 3 && cellWidth >= 8 ? (
                    <View
                      style={[
                        styles.decadeCap,
                        {
                          backgroundColor: markerColor,
                          width: Math.max(2, Math.floor(cellWidth * 0.58)),
                        },
                      ]}
                    />
                  ) : null}
                  {isCurrent && cellWidth >= 10 && cellHeight >= 10 ? (
                    <View
                      style={[
                        styles.currentCore,
                        {
                          backgroundColor: theme.colors.text,
                        },
                      ]}
                    />
                  ) : null}
                </View>
              );
            })}
          </View>
        ))}
        </View>
      ) : null}
    </View>
  );
}

export const FeltWeekGrid = memo(
  FeltWeekGridComponent,
  (prevProps, nextProps) =>
    prevProps.totalYears === nextProps.totalYears &&
    prevProps.currentWeekIndex === nextProps.currentWeekIndex &&
    prevProps.theme === nextProps.theme,
);

const styles = StyleSheet.create({
  cell: {
    borderRadius: 2,
    overflow: 'hidden',
    position: 'relative',
  },
  boundaryMarker: {
    left: 0,
    position: 'absolute',
    top: 0,
  },
  container: {
    flex: 1,
    minHeight: 0,
  },
  currentCore: {
    borderRadius: 999,
    height: 4,
    left: '50%',
    position: 'absolute',
    top: '50%',
    transform: [{ translateX: -2 }, { translateY: -2 }],
    width: 4,
  },
  decadeCap: {
    height: 1,
    left: 0,
    position: 'absolute',
    top: 0,
  },
  gridFrame: {
    flex: 1,
    minHeight: 0,
    overflow: 'hidden',
    paddingBottom: 2,
    paddingHorizontal: 2,
    paddingTop: 2,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
});
