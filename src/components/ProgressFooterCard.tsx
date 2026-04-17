import { StyleSheet, Text, View } from 'react-native';

import type { AppTheme } from '../theme';

interface ProgressFooterCardProps {
  isCompact: boolean;
  leftLabel: string;
  progressMeta: string;
  progressPercent: number;
  remainingValue: string;
  theme: AppTheme;
}

export function ProgressFooterCard({
  isCompact,
  leftLabel,
  progressMeta,
  progressPercent,
  remainingValue,
  theme,
}: ProgressFooterCardProps) {
  return (
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
            {leftLabel}
          </Text>
          <Text
            adjustsFontSizeToFit
            minimumFontScale={0.72}
            numberOfLines={1}
            style={[
              styles.footerMetricValue,
              isCompact ? styles.footerMetricValueCompact : null,
              { color: theme.colors.text },
            ]}
          >
            {remainingValue}
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
                  width: `${Math.max(2, Math.round(progressPercent))}%`,
                },
              ]}
            />
            <Text style={[styles.progressMeterText, { color: theme.colors.text }]}>
              {Math.round(progressPercent)}%
            </Text>
          </View>
          <Text
            numberOfLines={1}
            style={[styles.progressMeterMeta, { color: theme.colors.mutedText }]}
          >
            {progressMeta}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
  progressMeterFill: {
    borderRadius: 999,
    height: '100%',
    maxWidth: '100%',
    minWidth: 12,
  },
  progressMeterMeta: {
    alignSelf: 'flex-end',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
    minHeight: 16,
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
  progressMeterTrack: {
    borderRadius: 999,
    height: 18,
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  progressMeterWrap: {
    flex: 1,
    justifyContent: 'center',
    minWidth: 0,
  },
});
