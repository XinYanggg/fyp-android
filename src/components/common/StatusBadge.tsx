import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CheckCircle2, AlertTriangle, AlertCircle } from 'lucide-react-native';
import { Colors, BorderRadius, Spacing } from '../../constants/theme';

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
        {confidence !== undefined && ` (${Math.round(confidence * 100)}%)`}
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
