import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type NativeSyntheticEvent,
  type NativeScrollEvent,
} from 'react-native';

import type { AppTheme } from '../theme';

interface NumberWheelInputProps {
  actionLabel?: string;
  closeLabel?: string;
  label: string;
  max: number;
  min: number;
  onChange: (value: number) => void;
  theme: AppTheme;
  value: number;
}

const ITEM_HEIGHT = 44;
const VISIBLE_ITEMS = 5;

export function NumberWheelInput({
  actionLabel = 'Select',
  closeLabel = 'Close',
  label,
  max,
  min,
  onChange,
  theme,
  value,
}: NumberWheelInputProps) {
  const scrollRef = useRef<ScrollView | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const values = useMemo(
    () => Array.from({ length: max - min + 1 }, (_, index) => min + index),
    [max, min],
  );
  const selectedIndex = Math.max(0, Math.min(values.length - 1, value - min));
  const verticalPadding = ((VISIBLE_ITEMS - 1) / 2) * ITEM_HEIGHT;

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const timer = setTimeout(() => {
      scrollRef.current?.scrollTo({
        animated: false,
        x: 0,
        y: selectedIndex * ITEM_HEIGHT,
      });
    }, 0);

    return () => clearTimeout(timer);
  }, [isOpen, selectedIndex]);

  function snapToValue(event: NativeSyntheticEvent<NativeScrollEvent>) {
    const nextIndex = Math.round(event.nativeEvent.contentOffset.y / ITEM_HEIGHT);
    const nextValue = values[Math.max(0, Math.min(values.length - 1, nextIndex))];
    onChange(nextValue);
  }

  return (
    <View>
      {label ? <Text style={[styles.label, { color: theme.colors.text }]}>{label}</Text> : null}
      <Pressable
        onPress={() => setIsOpen((current) => !current)}
        style={[
          styles.field,
          {
            backgroundColor: theme.colors.inputBackground,
            borderColor: theme.colors.border,
          },
        ]}
      >
        <Text style={[styles.value, { color: theme.colors.text }]}>{value}</Text>
        <Text style={[styles.action, { color: theme.colors.primary }]}>{actionLabel}</Text>
      </Pressable>

      {isOpen ? (
        <View
          style={[
            styles.pickerCard,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <View style={styles.wheelShell}>
            <View
              pointerEvents="none"
              style={[
                styles.selectionBand,
                {
                  backgroundColor: theme.colors.inputBackground,
                  borderColor: theme.colors.border,
                  top: verticalPadding,
                },
              ]}
            />
            <ScrollView
              ref={scrollRef}
              bounces={false}
              decelerationRate="fast"
              onMomentumScrollEnd={snapToValue}
              onScrollEndDrag={snapToValue}
              showsVerticalScrollIndicator={false}
              snapToAlignment="start"
              snapToInterval={ITEM_HEIGHT}
            >
              <View style={{ paddingVertical: verticalPadding }}>
                {values.map((item) => {
                  const selected = item === value;
                  return (
                    <Pressable
                      key={item}
                      onPress={() => onChange(item)}
                      style={styles.item}
                    >
                      <Text
                        style={[
                          styles.itemLabel,
                          {
                            color: selected ? theme.colors.text : theme.colors.mutedText,
                            fontWeight: selected ? '800' : '600',
                          },
                        ]}
                      >
                        {item}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </ScrollView>
          </View>
          <Pressable onPress={() => setIsOpen(false)} style={styles.closeButton}>
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
  item: {
    alignItems: 'center',
    height: ITEM_HEIGHT,
    justifyContent: 'center',
  },
  itemLabel: {
    fontSize: 22,
    lineHeight: 24,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 16,
    marginBottom: 10,
  },
  pickerCard: {
    borderRadius: 18,
    borderWidth: 1,
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  selectionBand: {
    borderRadius: 12,
    borderWidth: 1,
    height: ITEM_HEIGHT,
    left: 0,
    position: 'absolute',
    right: 0,
  },
  value: {
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 22,
  },
  wheelShell: {
    height: ITEM_HEIGHT * VISIBLE_ITEMS,
    overflow: 'hidden',
    position: 'relative',
  },
});
