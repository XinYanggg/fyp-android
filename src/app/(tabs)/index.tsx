import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import {
  Trees,
  CheckCircle,
  AlertTriangle,
  ScanLine,
  ChevronRight,
  Sparkles,
  MapPin,
} from 'lucide-react-native';
import { useFarms } from '../../context/FarmContext';
import { MetricCard } from '../../components/common/MetricCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Colors, BorderRadius, Spacing, Shadows } from '../../constants/theme';

export default function DashboardScreen() {
  const router = useRouter();
  const { farms, selectedFarm, setSelectedFarm } = useFarms();

  const currentFarm = selectedFarm || farms[0];
  const trees = currentFarm?.trees || [];

  const healthyTrees = trees.filter((t) => t.currentDisease === 'Healthy').length;
  const alertTrees = trees.filter((t) => t.currentDisease !== 'Healthy').length;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Brand Header */}
        <View style={styles.header}>
          <View>
            <View style={styles.brandRow}>
              <Text style={styles.brandTitle}>durian</Text>
              <Text style={[styles.brandTitle, { color: Colors.primary }]}>.health</Text>
            </View>
            <Text style={styles.brandSubtitle}>AI Orchard Management & Diagnostics</Text>
          </View>
          <View style={styles.avatarPill}>
            <Text style={styles.avatarText}>DH</Text>
          </View>
        </View>

        {/* Farm Selector Pill */}
        <View style={styles.farmSelectorContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.farmPillsRow}>
            {farms.map((farm) => {
              const isSelected = farm._id === currentFarm?._id;
              return (
                <TouchableOpacity
                  key={farm._id}
                  onPress={() => setSelectedFarm(farm)}
                  style={[
                    styles.farmPill,
                    isSelected && styles.farmPillActive,
                  ]}
                >
                  <MapPin size={13} color={isSelected ? '#ffffff' : Colors.light.textSecondary} style={{ marginRight: 4 }} />
                  <Text style={[styles.farmPillText, isSelected && styles.farmPillTextActive]}>
                    {farm.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Health Overview Banner */}
        <View style={[styles.overviewCard, Shadows.md]}>
          <View style={styles.overviewHeader}>
            <View>
              <Text style={styles.overviewLocation}>{currentFarm?.location || 'Pahang, Malaysia'}</Text>
              <Text style={styles.overviewFarmName}>{currentFarm?.name || 'Active Farm'}</Text>
            </View>
            <View style={styles.healthScoreContainer}>
              <Text style={styles.healthScoreValue}>{currentFarm?.healthPercentage || '100%'}</Text>
              <Text style={styles.healthScoreLabel}>Farm Health</Text>
            </View>
          </View>

          {/* Health Progress Bar */}
          <View style={styles.progressBarBg}>
            <View
              style={[
                styles.progressBarFill,
                { width: (currentFarm?.healthPercentage || '100%') as any },
              ]}
            />
          </View>

          <View style={styles.overviewFooter}>
            <Text style={styles.lastScanText}>
              Last scanned: <Text style={{ fontWeight: '600', color: Colors.light.text }}>{currentFarm?.lastScan || 'N/A'}</Text>
            </Text>
            <TouchableOpacity
              onPress={() => router.push(`/farm/${currentFarm?._id}` as any)}
              style={styles.viewFarmLink}
            >
              <Text style={styles.viewFarmLinkText}>View Orchard</Text>
              <ChevronRight size={14} color={Colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Action: AI Disease Scan */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => router.push('/(tabs)/scan' as any)}
          style={[styles.scanActionBanner, Shadows.sm]}
        >
          <View style={styles.scanActionLeft}>
            <View style={styles.scanIconBg}>
              <ScanLine size={24} color="#ffffff" strokeWidth={2.5} />
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.bannerTagRow}>
                <Sparkles size={13} color={Colors.accent} style={{ marginRight: 4 }} />
                <Text style={styles.bannerTagText}>AI Computer Vision</Text>
              </View>
              <Text style={styles.scanActionTitle}>Scan a Leaf Now</Text>
              <Text style={styles.scanActionSubtitle}>Diagnose leaf spot, algal rust, and blights instantly</Text>
            </View>
          </View>
          <ChevronRight size={20} color={Colors.light.textSecondary} />
        </TouchableOpacity>

        {/* Metrics Grid */}
        <View style={styles.metricsGrid}>
          <MetricCard
            label="Total Trees"
            value={trees.length}
            subValue="Registered digital twins"
            icon={<Trees size={18} color={Colors.primary} />}
            accentColor={Colors.primary}
          />
          <MetricCard
            label="Healthy Trees"
            value={healthyTrees}
            subValue={`${trees.length ? Math.round((healthyTrees / trees.length) * 100) : 100}% optimal condition`}
            icon={<CheckCircle size={18} color={Colors.success} />}
            accentColor={Colors.success}
          />
          <MetricCard
            label="Attention Needed"
            value={alertTrees}
            subValue={alertTrees > 0 ? 'Requires fungicide/pruning' : 'All foliage clean'}
            icon={<AlertTriangle size={18} color={alertTrees > 0 ? Colors.danger : Colors.light.textMuted} />}
            accentColor={alertTrees > 0 ? Colors.danger : Colors.light.textMuted}
          />
        </View>

        {/* Recent Trees Status Section */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Recent Tree Statuses</Text>
          <TouchableOpacity onPress={() => router.push(`/farm/${currentFarm?._id}` as any)}>
            <Text style={styles.sectionActionText}>See all ({trees.length})</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.treesList}>
          {trees.slice(0, 4).map((tree) => (
            <TouchableOpacity
              key={tree.id}
              activeOpacity={0.7}
              onPress={() => router.push(`/farm/${currentFarm?._id}` as any)}
              style={[styles.treeCard, Shadows.sm]}
            >
              <View style={styles.treeLeft}>
                <View style={styles.treeIdBadge}>
                  <Text style={styles.treeIdText}>{tree.id}</Text>
                </View>
                <View>
                  <Text style={styles.treeCultivar}>{tree.cultivar}</Text>
                  <Text style={styles.treeScanTime}>Last scan: {tree.lastScan}</Text>
                </View>
              </View>
              <StatusBadge status={tree.currentDisease} confidence={tree.confidence} />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl * 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: Colors.light.text,
    letterSpacing: -0.5,
  },
  brandSubtitle: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
  avatarPill: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.primaryDark,
  },
  farmSelectorContainer: {
    marginBottom: Spacing.md,
  },
  farmPillsRow: {
    gap: Spacing.sm,
  },
  farmPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.light.surface,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  farmPillActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  farmPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.light.textSecondary,
  },
  farmPillTextActive: {
    color: '#ffffff',
  },
  overviewCard: {
    backgroundColor: Colors.light.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.light.border,
    marginBottom: Spacing.md,
  },
  overviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  overviewLocation: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    fontWeight: '500',
  },
  overviewFarmName: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.light.text,
    marginTop: 2,
  },
  healthScoreContainer: {
    alignItems: 'flex-end',
  },
  healthScoreValue: {
    fontSize: 26,
    fontWeight: '900',
    color: Colors.primary,
  },
  healthScoreLabel: {
    fontSize: 11,
    color: Colors.light.textSecondary,
    fontWeight: '600',
  },
  progressBarBg: {
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.light.border,
    overflow: 'hidden',
    marginBottom: Spacing.md,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 4,
  },
  overviewFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastScanText: {
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
  viewFarmLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  viewFarmLinkText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  scanActionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0f291e',
    borderRadius: BorderRadius.xl,
    padding: Spacing.md + 2,
    marginBottom: Spacing.md,
  },
  scanActionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: Spacing.md,
    marginRight: Spacing.sm,
  },
  scanIconBg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  bannerTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.accent,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  scanActionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#ffffff',
  },
  scanActionSubtitle: {
    fontSize: 11,
    color: '#a7f3d0',
    marginTop: 2,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.light.text,
  },
  sectionActionText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
  },
  treesList: {
    gap: Spacing.sm,
  },
  treeCard: {
    backgroundColor: Colors.light.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.light.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  treeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  treeIdBadge: {
    backgroundColor: Colors.light.background,
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: Spacing.xs + 2,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  treeIdText: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.light.text,
  },
  treeCultivar: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.light.text,
  },
  treeScanTime: {
    fontSize: 11,
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
});
