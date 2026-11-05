import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CheckCircle2, AlertTriangle, AlertCircle } from 'lucide-react-native';
import { Colors, BorderRadius, Spacing } from '../../constants/theme';

export const formatConfidence = (val?: number | null): string => {
  if (val === undefined || val === null) return '';
  if (val === 0) return '0%';
  // If val is a decimal <= 1 (e.g. 0.94), convert to 94%
  // If val is already a percentage in MongoDB (e.g. 99.99 or 85), use directly
  const pct = val <= 1 && val > 0 ? val * 100 : val;
  return Number.isInteger(pct) ? `${pct}%` : `${Math.round(pct * 100) / 100}%`;
};

interface StatusBadgeProps {
  status: string;
  confidence?: number;
  showIcon?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, confidence, showIcon = true }) => {
  const isHealthy = status.toLowerCase() === 'healthy';
  const isModerate = status.toLowerCase().includes('algal');

  const bgColor = isHealthy
    ? Colors.successLight
    : isModerate
    ? Colors.warningLight
    : Colors.dangerLight;

  const textColor = isHealthy
    ? Colors.success
    : isModerate
    ? Colors.warning
    : Colors.danger;

  const Icon = isHealthy ? CheckCircle2 : isModerate ? AlertTriangle : AlertCircle;

  return (
    <View style={[styles.badge, { backgroundColor: bgColor }]}>
      {showIcon && <Icon size={14} color={textColor} strokeWidth={2.5} style={styles.icon} />}
      <Text style={[styles.label, { color: textColor }]}>
        {status}
        {confidence !== undefined && confidence !== null && ` (${formatConfidence(confidence)})`}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    alignSelf: 'flex-start',
  },
  icon: {
    marginRight: 4,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
