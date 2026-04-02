import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';

import { PrimaryButton } from '../components/PrimaryButton';
import { ViewModeSwitch } from '../components/ViewModeSwitch';
import { getTranslations } from '../i18n';
import { WeekGrid } from '../components/WeekGrid';
import { YearWeekGrid } from '../components/YearWeekGrid';
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
  flashMessage: string | null;
  onChangeSettings: (settings: UserSettings) => void;
  onDismissFlashMessage: () => void;
  settings: UserSettings;
  theme: AppTheme;
  onOpenSettings: () => void;
}

export function MainScreen({
  flashMessage,
  onChangeSettings,
  onDismissFlashMessage,
  settings,
  theme,
  onOpenSettings,
}: MainScreenProps) {
  const { width } = useWindowDimensions();
  const isCompact = width < 390;
  const t = getTranslations(settings.language);
  const stats = getLifeStats(settings.birthDate, settings.lifeExpectancy);
  const parsedBirthDate = parseBirthDate(settings.birthDate);
  const memoInputRef = useRef<TextInput | null>(null);
  const closeDragY = useRef(new Animated.Value(0)).current;
  const handleDragState = useRef({
    startY: 0,
  });
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
  const calendarYearWeeks = getCalendarYearWeeks(
    settings.birthDate,
    settings.lifeExpectancy,
    calendarYear,
  );
  const selectedWeekDetail =
    selectedWeekIndex === null
      ? null
      : getWeekDetail(settings.birthDate, settings.lifeExpectancy, selectedWeekIndex);
  const selectedWeekMemo =
    selectedWeekIndex === null ? '' : weekMemos[String(selectedWeekIndex)] ?? '';
  const isMemoChanged = selectedWeekIndex !== null && memoDraft !== selectedWeekMemo;

  useEffect(() => {
    if (!flashMessage) {
      return;
    }

    const timer = setTimeout(() => {
      onDismissFlashMessage();
    }, 2200);

    return () => clearTimeout(timer);
  }, [flashMessage, onDismissFlashMessage]);

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
    closeDragY.setValue(0);
  }, [selectedWeekIndex, closeDragY]);

  useEffect(() => {
    if (selectedWeekIndex === null) {
      setMemoDraft('');
      return;
    }

    if (selectedWeekIndex >= totalWeeks) {
      setSelectedWeekIndex(stats.currentWeekIndex);
    }
  }, [selectedWeekIndex, stats.currentWeekIndex, totalWeeks]);

  useEffect(() => {
    if (selectedWeekIndex === null) {
      return;
    }

    setMemoDraft(weekMemos[String(selectedWeekIndex)] ?? '');
  }, [selectedWeekIndex, weekMemos]);

  function handleSelectWeek(weekIndex: number) {
    setSelectedWeekIndex((current) => (current === weekIndex ? null : weekIndex));
  }

  function handleCloseWeekDetail() {
    handleDragState.current = {
      startY: 0,
    };
    closeDragY.setValue(0);
    setSelectedWeekIndex(null);
  }

  function handleChangeViewMode(nextViewMode: ViewMode) {
    if (nextViewMode === settings.viewMode) {
      return;
    }

    onChangeSettings({
      ...settings,
      selectedCalendarYear: calendarYear,
      viewMode: nextViewMode,
    });
  }

  function handleShiftSelectedWeek(delta: number) {
    if (selectedWeekIndex === null) {
      return;
    }

    const nextWeekIndex = Math.max(0, Math.min(totalWeeks - 1, selectedWeekIndex + delta));
    setSelectedWeekIndex(nextWeekIndex);
  }

  function handleShiftCalendarYear(delta: number) {
    const nextYear = Math.max(minCalendarYear, Math.min(maxCalendarYear, calendarYear + delta));

    if (nextYear === settings.selectedCalendarYear) {
      return;
    }

    onChangeSettings({
      ...settings,
      selectedCalendarYear: nextYear,
      viewMode: 'year',
    });
  }

  function handleMemoChange(nextValue: string) {
    setMemoDraft(nextValue.slice(0, 200));
  }

  function handleDoneMemoInput() {
    memoInputRef.current?.blur();
    Keyboard.dismiss();
  }

  async function handleSaveMemo() {
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
  }

  function handleHandleGrant(pageY: number) {
    handleDragState.current = {
      startY: pageY,
    };
  }

  function handleHandleMove(pageY: number) {
    const dragDistance = Math.max(0, pageY - handleDragState.current.startY);
    const translatedDistance = Math.min(240, dragDistance * 0.72);
    closeDragY.setValue(translatedDistance < 10 ? 0 : translatedDistance);
  }

  function handleHandleEnd() {
    const currentDragY = Number(
      (closeDragY as unknown as { __getValue?: () => number }).__getValue?.() ?? 0,
    );

    if (currentDragY >= 120) {
      Animated.timing(closeDragY, {
        duration: 140,
        toValue: 360,
        useNativeDriver: true,
      }).start(() => {
        handleCloseWeekDetail();
      });
      return;
    }

    Animated.spring(closeDragY, {
      bounciness: 0,
      speed: 20,
      toValue: 0,
      useNativeDriver: true,
    }).start();

    handleDragState.current = {
      startY: 0,
    };
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      <View style={styles.container}>
        {flashMessage ? (
          <View
            style={[
              styles.flashBanner,
              {
                backgroundColor: theme.colors.primary,
                borderColor: theme.colors.primary,
              },
            ]}
          >
            <Text style={[styles.flashBannerText, { color: theme.colors.primaryText }]}>
              {flashMessage}
            </Text>
          </View>
        ) : null}

        <View style={styles.header}>
          <View style={styles.headerCopy}>
            <Text style={[styles.headerTitle, { color: theme.colors.text }]}>{t.appTitle}</Text>
          </View>
          <Pressable
            onPress={onOpenSettings}
            style={styles.settingsButton}
          >
            <Text style={[styles.settingsButtonIcon, { color: theme.colors.text }]}>···</Text>
          </Pressable>
        </View>

        <ViewModeSwitch
          language={settings.language}
          onChange={handleChangeViewMode}
          theme={theme}
          value={settings.viewMode}
        />

        <View
          style={[
            styles.calendarShell,
            {
              backgroundColor: 'transparent',
            },
          ]}
        >
          {settings.viewMode === 'life' ? (
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
          ) : null}

          {settings.viewMode === 'year' ? (
            <View style={styles.yearView}>
              <View style={styles.yearHeader}>
                <Pressable
                  disabled={calendarYear <= minCalendarYear}
                  onPress={() => handleShiftCalendarYear(-1)}
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
                  onPress={() => handleShiftCalendarYear(1)}
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
                onSelectWeek={handleSelectWeek}
                selectedWeekIndex={selectedWeekIndex}
                theme={theme}
                weeks={calendarYearWeeks}
                weekMemos={weekMemos}
              />
            </View>
          ) : null}
        </View>

        <View
          style={[
            styles.footerCard,
            {
              backgroundColor: theme.colors.surface,
              shadowColor: theme.colors.shadow,
            },
          ]}
        >
          <View style={styles.footerStatsRow}>
            <View style={styles.footerMetric}>
              <Text style={[styles.footerMetricLabel, { color: theme.colors.mutedText }]}>
                {t.mainLeft}
              </Text>
              <Text
                style={[
                  styles.footerMetricValue,
                  isCompact ? styles.footerMetricValueCompact : null,
                  { color: theme.colors.text },
                ]}
              >
                {stats.remainingWeeks}
                {t.commonWeeksShort}
              </Text>
            </View>
            <View style={styles.progressMeterWrap}>
              <View
                style={[
                  styles.progressMeterTrack,
                  { backgroundColor: theme.colors.surfaceMuted },
                ]}
              >
                <View
                  style={[
                    styles.progressMeterFill,
                    {
                      backgroundColor: theme.colors.current,
                      width: `${Math.max(2, Math.round(stats.progressPercent))}%`,
                    },
                  ]}
                />
                <Text style={[styles.progressMeterText, { color: theme.colors.text }]}>
                  {Math.round(stats.progressPercent)}%
                </Text>
              </View>
              <Text style={[styles.progressMeterMeta, { color: theme.colors.mutedText }]}>
                {stats.elapsedWeeks}
                {t.commonWeeksShort} / {settings.lifeExpectancy * 52}
                {t.commonWeeksShort}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <Modal
        animationType="slide"
        onRequestClose={handleCloseWeekDetail}
        transparent
        visible={selectedWeekDetail !== null}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalRoot}
        >
          <Pressable style={styles.modalBackdrop} onPress={handleCloseWeekDetail} />
          {selectedWeekDetail ? (
            <Animated.View
              style={[
                styles.modalSheet,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                  shadowColor: theme.colors.shadow,
                  opacity: closeDragY.interpolate({
                    inputRange: [0, 260],
                    outputRange: [1, 0.92],
                  }),
                  transform: [
                    {
                      translateY: closeDragY,
                    },
                  ],
                },
              ]}
            >
              <View
                onMoveShouldSetResponder={() => true}
                onResponderGrant={(event) => handleHandleGrant(event.nativeEvent.pageY)}
                onResponderMove={(event) => handleHandleMove(event.nativeEvent.pageY)}
                onResponderRelease={handleHandleEnd}
                onResponderTerminate={handleHandleEnd}
                onResponderTerminationRequest={() => false}
                onStartShouldSetResponder={() => true}
                style={styles.modalHandleTouchArea}
              >
                <View style={styles.modalHandle} />
              </View>
              <View style={[styles.sheetHeader, isCompact ? styles.sheetHeaderCompact : null]}>
                <View style={styles.sheetHeaderCopy}>
                  <Text style={[styles.sheetTitle, { color: theme.colors.text }]}>
                    {t.mainWeekTitle(selectedWeekDetail.ageYear, selectedWeekDetail.weekOfYear)}
                  </Text>
                  <Text style={[styles.sheetRange, { color: theme.colors.mutedText }]}>
                    {selectedWeekDetail.startDate} - {selectedWeekDetail.endDate}
                  </Text>
                </View>
                <View style={styles.sheetSwitcher}>
                  <Pressable
                    disabled={selectedWeekDetail.weekIndex <= 0}
                    onPress={() => handleShiftSelectedWeek(-1)}
                    style={[
                      styles.sheetSwitcherButton,
                      {
                        backgroundColor: theme.colors.inputBackground,
                        borderColor: theme.colors.border,
                        opacity: selectedWeekDetail.weekIndex <= 0 ? 0.35 : 1,
                      },
                    ]}
                  >
                    <Text style={[styles.sheetSwitcherText, { color: theme.colors.text }]}>‹</Text>
                  </Pressable>
                  <Pressable
                    disabled={selectedWeekDetail.weekIndex >= totalWeeks - 1}
                    onPress={() => handleShiftSelectedWeek(1)}
                    style={[
                      styles.sheetSwitcherButton,
                      {
                        backgroundColor: theme.colors.inputBackground,
                        borderColor: theme.colors.border,
                        opacity: selectedWeekDetail.weekIndex >= totalWeeks - 1 ? 0.35 : 1,
                      },
                    ]}
                  >
                    <Text style={[styles.sheetSwitcherText, { color: theme.colors.text }]}>›</Text>
                  </Pressable>
                </View>
              </View>

              <ScrollView
                bounces={false}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              >
                <Text style={[styles.memoLabel, { color: theme.colors.text }]}>{t.mainMemo}</Text>
                <View style={styles.memoInputShell}>
                  <TextInput
                    ref={memoInputRef}
                    multiline
                    onChangeText={handleMemoChange}
                    placeholder={t.mainMemoPlaceholder}
                    placeholderTextColor={theme.colors.mutedText}
                    style={[
                      styles.memoInput,
                      isCompact ? styles.memoInputCompact : null,
                      {
                        backgroundColor: theme.colors.inputBackground,
                        borderColor: theme.colors.border,
                        color: theme.colors.text,
                      },
                    ]}
                    textAlignVertical="top"
                    value={memoDraft}
                  />
                  <Pressable
                    onPress={handleDoneMemoInput}
                    style={[
                      styles.memoInputDoneButton,
                      {
                        backgroundColor: theme.colors.surface,
                        borderColor: theme.colors.border,
                      },
                    ]}
                  >
                    <Text style={[styles.memoInputDoneIcon, { color: theme.colors.text }]}>✓</Text>
                  </Pressable>
                </View>

                <View style={[styles.memoFooter, isCompact ? styles.memoFooterCompact : null]}>
                  <Text style={[styles.memoCount, { color: theme.colors.mutedText }]}>
                    {memoDraft.length} / 200
                  </Text>
                  <View style={[styles.memoButton, isCompact ? styles.memoButtonCompact : null]}>
                    <PrimaryButton
                      disabled={!isMemoChanged || isSavingMemo}
                      label={
                        isSavingMemo
                          ? t.mainMemoSaving
                          : memoDraft.trim()
                            ? t.mainMemoSave
                            : t.mainMemoDelete
                      }
                      onPress={handleSaveMemo}
                      theme={theme}
                    />
                  </View>
                </View>

              </ScrollView>
            </Animated.View>
          ) : null}
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  calendarShell: {
    flex: 1,
    marginBottom: 8,
    minHeight: 0,
    paddingHorizontal: 6,
    paddingTop: 4,
    paddingBottom: 2,
  },
  container: {
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  flashBanner: {
    borderRadius: 16,
    marginBottom: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  flashBannerText: {
    fontSize: 13,
    fontWeight: '700',
  },
  footerCard: {
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 1,
    shadowRadius: 18,
  },
  footerMetric: {
    flexShrink: 0,
    marginRight: 12,
    width: 92,
  },
  footerMetricLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  footerMetricValue: {
    fontSize: 28,
    fontWeight: '900',
    lineHeight: 32,
  },
  footerMetricValueCompact: {
    fontSize: 24,
    lineHeight: 28,
  },
  footerStatsRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
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
  memoButton: {
    minWidth: 132,
  },
  memoButtonCompact: {
    marginTop: 10,
    width: '100%',
  },
  memoCount: {
    fontSize: 12,
    fontWeight: '600',
  },
  memoFooter: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  memoFooterCompact: {
    alignItems: 'flex-start',
    flexDirection: 'column',
  },
  memoInput: {
    borderRadius: 14,
    borderWidth: 1,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 10,
    minHeight: 112,
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingRight: 46,
    paddingBottom: 42,
  },
  memoInputCompact: {
    minHeight: 132,
  },
  memoInputDoneButton: {
    alignItems: 'center',
    borderRadius: 999,
    borderWidth: 1,
    bottom: 20,
    height: 28,
    justifyContent: 'center',
    position: 'absolute',
    right: 10,
    width: 28,
  },
  memoInputDoneIcon: {
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 14,
  },
  memoInputShell: {
    position: 'relative',
  },
  memoLabel: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  meta: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10, 12, 14, 0.34)',
  },
  modalHandle: {
    alignSelf: 'center',
    backgroundColor: 'rgba(128, 128, 128, 0.42)',
    borderRadius: 999,
    height: 5,
    width: 44,
  },
  modalHandleTouchArea: {
    alignItems: 'center',
    marginBottom: 14,
    paddingBottom: 16,
    paddingHorizontal: 20,
    paddingTop: 12,
    width: '100%',
  },
  modalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '78%',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 24,
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 1,
    shadowRadius: 24,
  },
  progressMeterFill: {
    borderRadius: 999,
    height: '100%',
    maxWidth: '100%',
    minWidth: 12,
  },
  progressMeterTrack: {
    borderRadius: 999,
    height: 18,
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  progressMeterMeta: {
    alignSelf: 'flex-end',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
    textAlign: 'right',
  },
  progressMeterText: {
    fontSize: 10,
    fontWeight: '800',
    left: 0,
    letterSpacing: 0.4,
    lineHeight: 12,
    position: 'absolute',
    right: 0,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  progressMeterWrap: {
    flex: 1,
    justifyContent: 'center',
    minWidth: 0,
  },
  safeArea: {
    flex: 1,
  },
  settingsButton: {
    alignItems: 'center',
    position: 'absolute',
    right: 0,
    top: 0,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  settingsButtonIcon: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 1,
    lineHeight: 18,
  },
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
  sheetHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 12,
  },
  sheetHeaderCompact: {
    alignItems: 'flex-start',
  },
  sheetHeaderCopy: {
    flex: 1,
    paddingRight: 8,
  },
  sheetRange: {
    fontSize: 13,
    lineHeight: 19,
  },
  sheetSwitcher: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 8,
  },
  sheetSwitcherButton: {
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  sheetSwitcherText: {
    fontSize: 22,
    fontWeight: '600',
    lineHeight: 22,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 2,
  },
});
