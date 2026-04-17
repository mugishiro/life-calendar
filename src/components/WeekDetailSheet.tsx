import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetTextInput,
  TouchableOpacity,
  type BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MutableRefObject,
  type RefObject,
} from 'react';
import {
  Keyboard,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';

import type { Translations } from '../i18n';
import type { AppTheme } from '../theme';
import type { WeekDetail } from '../utils/lifeCalendar';
import { PrimaryButton } from './PrimaryButton';

interface WeekDetailSheetProps {
  isCompact: boolean;
  isMemoChanged: boolean;
  isSavingMemo: boolean;
  memoDraft: string;
  memoInputRef: RefObject<TextInput | null>;
  onChangeMemo: (nextValue: string) => void;
  onClose: () => void;
  onDoneMemoInput: () => void;
  onSaveMemo: () => void;
  onShiftWeek: (delta: number) => void;
  selectedWeekDetail: WeekDetail | null;
  theme: AppTheme;
  totalWeeks: number;
  translations: Pick<
    Translations,
    | 'mainMemo'
    | 'mainMemoDelete'
    | 'mainMemoPlaceholder'
    | 'mainMemoSave'
    | 'mainMemoSaving'
    | 'mainWeekTitle'
  >;
}

export function WeekDetailSheet({
  isCompact,
  isMemoChanged,
  isSavingMemo,
  memoDraft,
  memoInputRef,
  onChangeMemo,
  onClose,
  onDoneMemoInput,
  onSaveMemo,
  onShiftWeek,
  selectedWeekDetail,
  theme,
  totalWeeks,
  translations,
}: WeekDetailSheetProps) {
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const previousVisibleRef = useRef(selectedWeekDetail !== null);
  const latestSelectedIndexRef = useRef<number | null>(selectedWeekDetail?.weekIndex ?? null);
  const { height: windowHeight } = useWindowDimensions();
  const [renderedWeekDetail, setRenderedWeekDetail] = useState<WeekDetail | null>(
    selectedWeekDetail,
  );

  const snapPoints = useMemo(() => [isCompact ? '88%' : '82%'], [isCompact]);
  const maxDynamicContentSize = useMemo(() => Math.round(windowHeight * 0.9), [windowHeight]);
  const actionLabel = isSavingMemo
    ? translations.mainMemoSaving
    : memoDraft.trim()
      ? translations.mainMemoSave
      : translations.mainMemoDelete;

  useEffect(() => {
    latestSelectedIndexRef.current = selectedWeekDetail?.weekIndex ?? null;
  }, [selectedWeekDetail]);

  useEffect(() => {
    const isVisible = selectedWeekDetail !== null;
    const wasVisible = previousVisibleRef.current;

    if (isVisible && selectedWeekDetail) {
      setRenderedWeekDetail(selectedWeekDetail);

      if (!wasVisible) {
        requestAnimationFrame(() => {
          bottomSheetModalRef.current?.present();
        });
      }
    }

    if (!isVisible && wasVisible) {
      Keyboard.dismiss();
      bottomSheetModalRef.current?.dismiss();
    }

    previousVisibleRef.current = isVisible;
  }, [selectedWeekDetail]);

  const handleSheetDismiss = useCallback(() => {
    Keyboard.dismiss();
    setRenderedWeekDetail(null);

    if (latestSelectedIndexRef.current !== null) {
      onClose();
    }
  }, [onClose]);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        opacity={0.34}
        pressBehavior="close"
      />
    ),
    [],
  );

  const handleMemoInputRef = useCallback(
    (instance: unknown) => {
      (memoInputRef as MutableRefObject<TextInput | null>).current =
        instance as TextInput | null;
    },
    [memoInputRef],
  );

  const weekDetail = renderedWeekDetail ?? selectedWeekDetail;

  if (!weekDetail) {
    return null;
  }

  return (
    <BottomSheetModal
      ref={bottomSheetModalRef}
      animateOnMount
      android_keyboardInputMode="adjustResize"
      backdropComponent={renderBackdrop}
      backgroundStyle={[
        styles.sheetBackground,
        {
          backgroundColor: theme.colors.surface,
          shadowColor: theme.colors.shadow,
        },
      ]}
      enableDynamicSizing={false}
      enablePanDownToClose
      enableDismissOnClose
      enableOverDrag={false}
      handleIndicatorStyle={styles.handleIndicator}
      keyboardBehavior={Platform.OS === 'ios' ? 'interactive' : 'extend'}
      keyboardBlurBehavior="restore"
      maxDynamicContentSize={maxDynamicContentSize}
      onDismiss={handleSheetDismiss}
      snapPoints={snapPoints}
    >
      <BottomSheetScrollView
        bounces={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.sheetHeader, isCompact ? styles.sheetHeaderCompact : null]}>
          <View style={styles.sheetHeaderCopy}>
            <Text style={[styles.sheetTitle, { color: theme.colors.text }]}>
              {translations.mainWeekTitle(weekDetail.ageYear, weekDetail.weekOfYear)}
            </Text>
            <Text style={[styles.sheetRange, { color: theme.colors.mutedText }]}>
              {weekDetail.startDate} - {weekDetail.endDate}
            </Text>
          </View>
          <View style={styles.sheetSwitcher}>
            <TouchableOpacity
              activeOpacity={0.75}
              disabled={weekDetail.weekIndex <= 0}
              onPress={() => onShiftWeek(-1)}
              style={[
                styles.sheetSwitcherButton,
                {
                  backgroundColor: theme.colors.inputBackground,
                  borderColor: theme.colors.border,
                  opacity: weekDetail.weekIndex <= 0 ? 0.35 : 1,
                },
              ]}
            >
              <Text style={[styles.sheetSwitcherText, { color: theme.colors.text }]}>‹</Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.75}
              disabled={weekDetail.weekIndex >= totalWeeks - 1}
              onPress={() => onShiftWeek(1)}
              style={[
                styles.sheetSwitcherButton,
                {
                  backgroundColor: theme.colors.inputBackground,
                  borderColor: theme.colors.border,
                  opacity: weekDetail.weekIndex >= totalWeeks - 1 ? 0.35 : 1,
                },
              ]}
            >
              <Text style={[styles.sheetSwitcherText, { color: theme.colors.text }]}>›</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={[styles.memoLabel, { color: theme.colors.text }]}>
          {translations.mainMemo}
        </Text>
        <View style={styles.memoInputShell}>
          <BottomSheetTextInput
            ref={handleMemoInputRef}
            multiline
            onChangeText={onChangeMemo}
            placeholder={translations.mainMemoPlaceholder}
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
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={onDoneMemoInput}
            style={[
              styles.memoInputDoneButton,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
              },
            ]}
          >
            <Text style={[styles.memoInputDoneIcon, { color: theme.colors.text }]}>✓</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.memoFooter, isCompact ? styles.memoFooterCompact : null]}>
          <Text style={[styles.memoCount, { color: theme.colors.mutedText }]}>
            {memoDraft.length} / 200
          </Text>
          <View style={[styles.memoButton, isCompact ? styles.memoButtonCompact : null]}>
            <PrimaryButton
              disabled={!isMemoChanged || isSavingMemo}
              label={actionLabel}
              onPress={onSaveMemo}
              theme={theme}
            />
          </View>
        </View>
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  handleIndicator: {
    backgroundColor: 'rgba(128, 128, 128, 0.42)',
    width: 44,
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
    marginTop: 4,
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
    paddingBottom: 42,
    paddingHorizontal: 12,
    paddingRight: 46,
    paddingTop: 12,
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
    marginBottom: 14,
    position: 'relative',
  },
  memoLabel: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  scrollContent: {
    paddingBottom: 28,
    paddingHorizontal: 16,
  },
  sheetBackground: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
  },
  sheetHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
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
