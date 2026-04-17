import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Keyboard,
  SafeAreaView,
  StyleSheet,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';

import { MainHeader } from '../components/MainHeader';
import { ProgressFooterCard } from '../components/ProgressFooterCard';
import { ViewModeSwitch } from '../components/ViewModeSwitch';
import { WeekDetailSheet } from '../components/WeekDetailSheet';
import { WeekGrid } from '../components/WeekGrid';
import { YearModePanel } from '../components/YearModePanel';
import { getTranslations } from '../i18n';
import type { AppTheme } from '../theme';
import type { UserSettings, ViewMode, WeekMemoMap } from '../types';
import {
  getCalendarYearWeeks,
  getLifeStats,
  getWeekDetail,
  parseBirthDate,
} from '../utils/lifeCalendar';
import { loadWeekMemos, saveWeekMemo } from '../utils/storage';

interface MainScreenProps {
  onChangeSettings: (settings: UserSettings) => void;
  onOpenSettings: () => void;
  settings: UserSettings;
  theme: AppTheme;
}

interface FooterModel {
  progressMeta: string;
  progressPercent: number;
  remainingValue: string;
}

export function MainScreen({
  onChangeSettings,
  onOpenSettings,
  settings,
  theme,
}: MainScreenProps) {
  const { width } = useWindowDimensions();
  const isCompact = width < 390;
  const t = getTranslations(settings.language);
  const stats = useMemo(
    () => getLifeStats(settings.birthDate, settings.lifeExpectancy),
    [settings.birthDate, settings.lifeExpectancy],
  );
  const parsedBirthDate = useMemo(() => parseBirthDate(settings.birthDate), [settings.birthDate]);
  const memoInputRef = useRef<TextInput | null>(null);
  const modePanels = useRef<Record<ViewMode, Animated.Value>>({
    life: new Animated.Value(settings.viewMode === 'life' ? 1 : 0),
    year: new Animated.Value(settings.viewMode === 'year' ? 1 : 0),
  }).current;
  const totalWeeks = settings.lifeExpectancy * 52;
  const minCalendarYear = parsedBirthDate?.date.getFullYear() ?? new Date().getFullYear();
  const maxCalendarYear = minCalendarYear + settings.lifeExpectancy - 1;
  const calendarYear = Math.max(
    minCalendarYear,
    Math.min(maxCalendarYear, settings.selectedCalendarYear),
  );
  const [memoDraft, setMemoDraft] = useState('');
  const [isSavingMemo, setIsSavingMemo] = useState(false);
  const [selectedWeekIndex, setSelectedWeekIndex] = useState<number | null>(null);
  const [weekMemos, setWeekMemos] = useState<WeekMemoMap>({});
  const calendarYearWeeks = useMemo(
    () => getCalendarYearWeeks(settings.birthDate, settings.lifeExpectancy, calendarYear),
    [calendarYear, settings.birthDate, settings.lifeExpectancy],
  );
  const selectedWeekDetail = useMemo(
    () =>
      selectedWeekIndex === null
        ? null
        : getWeekDetail(settings.birthDate, settings.lifeExpectancy, selectedWeekIndex),
    [selectedWeekIndex, settings.birthDate, settings.lifeExpectancy],
  );
  const selectedWeekMemo =
    selectedWeekIndex === null ? '' : weekMemos[String(selectedWeekIndex)] ?? '';
  const isMemoChanged = selectedWeekIndex !== null && memoDraft !== selectedWeekMemo;
  const yearTotalWeeks = useMemo(
    () => calendarYearWeeks.filter((week) => week.lifeWeekIndex !== null).length,
    [calendarYearWeeks],
  );
  const yearElapsedWeeks = useMemo(
    () => calendarYearWeeks.filter((week) => week.phase === 'past').length,
    [calendarYearWeeks],
  );
  const yearRemainingWeeks = Math.max(yearTotalWeeks - yearElapsedWeeks, 0);
  const yearProgressPercent = yearTotalWeeks === 0 ? 0 : (yearElapsedWeeks / yearTotalWeeks) * 100;
  const footerModel = useMemo<FooterModel>(() => {
    if (settings.viewMode === 'year') {
      return {
        progressMeta: `${yearElapsedWeeks}${t.commonWeeksShort} / ${yearTotalWeeks}${t.commonWeeksShort}`,
        progressPercent: yearProgressPercent,
        remainingValue: `${yearRemainingWeeks}${t.commonWeeksShort}`,
      };
    }

    return {
      progressMeta: `${stats.elapsedWeeks}${t.commonWeeksShort} / ${settings.lifeExpectancy * 52}${t.commonWeeksShort}`,
      progressPercent: stats.progressPercent,
      remainingValue: `${stats.remainingWeeks}${t.commonWeeksShort}`,
    };
  }, [
    settings.lifeExpectancy,
    settings.viewMode,
    stats.elapsedWeeks,
    stats.progressPercent,
    stats.remainingWeeks,
    t.commonWeeksShort,
    yearElapsedWeeks,
    yearProgressPercent,
    yearRemainingWeeks,
    yearTotalWeeks,
  ]);

  useEffect(() => {
    let isMounted = true;

    async function hydrateWeekMemos() {
      const storedMemos = await loadWeekMemos();

      if (isMounted) {
        setWeekMemos(storedMemos);
      }
    }

    hydrateWeekMemos();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const animations = (Object.entries(modePanels) as Array<[ViewMode, Animated.Value]>).map(
      ([mode, value]) =>
        Animated.timing(value, {
          duration: mode === settings.viewMode ? 170 : 120,
          toValue: mode === settings.viewMode ? 1 : 0,
          useNativeDriver: true,
        }),
    );

    Animated.parallel(animations).start();
  }, [modePanels, settings.viewMode]);

  useEffect(() => {
    if (selectedWeekIndex === null) {
      setMemoDraft('');
      return;
    }

    if (selectedWeekIndex >= totalWeeks) {
      setSelectedWeekIndex(stats.currentWeekIndex);
      return;
    }

    setMemoDraft(weekMemos[String(selectedWeekIndex)] ?? '');
  }, [selectedWeekIndex, stats.currentWeekIndex, totalWeeks, weekMemos]);

  const handleSelectWeek = useCallback((weekIndex: number) => {
    setSelectedWeekIndex((current) => (current === weekIndex ? null : weekIndex));
  }, []);

  const handleCloseWeekDetail = useCallback(() => {
    setSelectedWeekIndex(null);
  }, []);

  const handleChangeViewMode = useCallback((nextViewMode: ViewMode) => {
    if (nextViewMode === settings.viewMode) {
      return;
    }

    onChangeSettings({
      ...settings,
      selectedCalendarYear: calendarYear,
      viewMode: nextViewMode,
    });
  }, [calendarYear, onChangeSettings, settings]);

  const handleShiftSelectedWeek = useCallback((delta: number) => {
    setSelectedWeekIndex((current) => {
      if (current === null) {
        return current;
      }

      return Math.max(0, Math.min(totalWeeks - 1, current + delta));
    });
  }, [totalWeeks]);

  const handleShiftCalendarYear = useCallback((delta: number) => {
    const nextYear = Math.max(minCalendarYear, Math.min(maxCalendarYear, calendarYear + delta));

    if (nextYear === settings.selectedCalendarYear) {
      return;
    }

    onChangeSettings({
      ...settings,
      selectedCalendarYear: nextYear,
      viewMode: 'year',
    });
  }, [calendarYear, maxCalendarYear, minCalendarYear, onChangeSettings, settings]);

  const handleMemoChange = useCallback((nextValue: string) => {
    setMemoDraft(nextValue.slice(0, 200));
  }, []);

  const handleDoneMemoInput = useCallback(() => {
    memoInputRef.current?.blur();
    Keyboard.dismiss();
  }, []);

  const handleSaveMemo = useCallback(async () => {
    if (selectedWeekIndex === null || isSavingMemo) {
      return;
    }

    try {
      setIsSavingMemo(true);
      Keyboard.dismiss();
      const nextMemos = await saveWeekMemo(selectedWeekIndex, memoDraft);
      setWeekMemos(nextMemos);
      handleCloseWeekDetail();
    } catch (error) {
      Alert.alert(t.alertSaveFailedTitle, t.alertMemoSaveFailedMessage);
    } finally {
      setIsSavingMemo(false);
    }
  }, [
    handleCloseWeekDetail,
    isSavingMemo,
    memoDraft,
    selectedWeekIndex,
    t.alertMemoSaveFailedMessage,
    t.alertSaveFailedTitle,
  ]);

  function getModePanelStyle(mode: ViewMode) {
    const opacity = modePanels[mode];

    return [
      styles.modePanel,
      {
        opacity,
        transform: [
          {
            translateY: opacity.interpolate({
              inputRange: [0, 1],
              outputRange: [8, 0],
            }),
          },
        ],
        zIndex: settings.viewMode === mode ? 1 : 0,
      },
    ];
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      <View style={styles.container}>
        <MainHeader onOpenSettings={onOpenSettings} theme={theme} title={t.appTitle} />

        <ViewModeSwitch
          language={settings.language}
          onChange={handleChangeViewMode}
          theme={theme}
          value={settings.viewMode}
        />

        <View style={styles.calendarShell}>
          <View style={styles.modeStage}>
            <Animated.View
              pointerEvents={settings.viewMode === 'life' ? 'auto' : 'none'}
              style={getModePanelStyle('life')}
            >
              <WeekGrid
                currentWeekIndex={stats.currentWeekIndex}
                currentYearIndex={stats.currentYearIndex}
                elapsedWeeks={stats.elapsedWeeks}
                onSelectWeek={handleSelectWeek}
                selectedWeekIndex={selectedWeekIndex}
                theme={theme}
                totalYears={settings.lifeExpectancy}
                weekMemos={weekMemos}
              />
            </Animated.View>

            <Animated.View
              pointerEvents={settings.viewMode === 'year' ? 'auto' : 'none'}
              style={getModePanelStyle('year')}
            >
              <YearModePanel
                calendarYear={calendarYear}
                maxCalendarYear={maxCalendarYear}
                minCalendarYear={minCalendarYear}
                onSelectWeek={handleSelectWeek}
                onShiftCalendarYear={handleShiftCalendarYear}
                selectedWeekIndex={selectedWeekIndex}
                theme={theme}
                weekMemos={weekMemos}
                weeks={calendarYearWeeks}
              />
            </Animated.View>
          </View>
        </View>

        <ProgressFooterCard
          isCompact={isCompact}
          leftLabel={t.mainLeft}
          progressMeta={footerModel.progressMeta}
          progressPercent={footerModel.progressPercent}
          remainingValue={footerModel.remainingValue}
          theme={theme}
        />
      </View>

      <WeekDetailSheet
        isCompact={isCompact}
        isMemoChanged={isMemoChanged}
        isSavingMemo={isSavingMemo}
        memoDraft={memoDraft}
        memoInputRef={memoInputRef}
        onChangeMemo={handleMemoChange}
        onClose={handleCloseWeekDetail}
        onDoneMemoInput={handleDoneMemoInput}
        onSaveMemo={handleSaveMemo}
        onShiftWeek={handleShiftSelectedWeek}
        selectedWeekDetail={selectedWeekDetail}
        theme={theme}
        totalWeeks={totalWeeks}
        translations={t}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  calendarShell: {
    flex: 1,
    marginBottom: 8,
    minHeight: 0,
    paddingBottom: 2,
    paddingHorizontal: 6,
    paddingTop: 4,
  },
  container: {
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  modePanel: {
    ...StyleSheet.absoluteFillObject,
    minHeight: 0,
  },
  modeStage: {
    flex: 1,
    minHeight: 0,
    position: 'relative',
  },
  safeArea: {
    flex: 1,
  },
});
