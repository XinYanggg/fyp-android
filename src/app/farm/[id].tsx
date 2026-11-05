import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ArrowLeft,
  Plus,
  Trees,
  History,
  X,
  MapPin,
  CheckCircle,
  AlertTriangle,
  Calendar,
} from 'lucide-react-native';
import { useFarms } from '../../context/FarmContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Tree } from '../../types';
import { Colors, BorderRadius, Spacing, Shadows } from '../../constants/theme';

const POPULAR_CULTIVARS = [
  'Musang King (D197)',
  'Black Thorn (D200)',
  'D24 (Sultan)',
  'IOI / Hasmuk (D168)',
  'Red Prawn (D175)',
  'Teka (D198)',
];

export default function FarmDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { farms, addTree, refreshFarms, isLoading } = useFarms();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshFarms();
    } finally {
      setRefreshing(false);
    }
  };

  const farm = farms.find((f) => f._id === id) || farms[0];
  const trees = farm?.trees || [];

  const [filter, setFilter] = useState<'all' | 'healthy' | 'attention'>('all');
  const [addTreeModalVisible, setAddTreeModalVisible] = useState(false);
  const [selectedTreeHistory, setSelectedTreeHistory] = useState<Tree | null>(null);

  const [newTreeId, setNewTreeId] = useState('');
  const [newCultivar, setNewCultivar] = useState(POPULAR_CULTIVARS[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredTrees = trees.filter((tree) => {
    if (filter === 'healthy') return tree.currentDisease === 'Healthy';
    if (filter === 'attention') return tree.currentDisease !== 'Healthy';
    return true;
  });

  const handleCreateTree = async () => {
    if (!newTreeId.trim() || !farm) return;
    setIsSubmitting(true);
    try {
      await addTree(farm._id, newTreeId.trim(), newCultivar);
      setNewTreeId('');
      setAddTreeModalVisible(false);
      Alert.alert('Tree Twin Registered', `Tree ${newTreeId.trim().toUpperCase()} has been saved to this orchard.`);
    } catch (err: any) {
      Alert.alert('Error Registering Tree', err.message || 'Failed to add tree.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar style="dark" />

      {/* Screen Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={22} color={Colors.light.text} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.farmTitle} numberOfLines={1}>{farm?.name}</Text>
          <View style={styles.locationRow}>
            <MapPin size={12} color={Colors.light.textSecondary} />
            <Text style={styles.locationText}>{farm?.location}</Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={() => setAddTreeModalVisible(true)}
          style={styles.addTreeHeaderBtn}
        >
          <Plus size={18} color="#ffffff" strokeWidth={2.5} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing || isLoading} onRefresh={onRefresh} colors={[Colors.primary]} />
        }
      >
        {/* Health Score Summary Card */}
        <View style={[styles.summaryCard, Shadows.sm]}>
          <View style={styles.summaryTop}>
            <View>
              <Text style={styles.summaryLabel}>Digital Twin Orchard Health</Text>
              <Text style={styles.summaryValue}>{farm?.healthPercentage}</Text>
            </View>
            <View style={styles.treeTotalPill}>
              <Trees size={16} color={Colors.primary} />
              <Text style={styles.treeTotalText}>{trees.length} Trees</Text>
            </View>
          </View>

          {/* Quick Filter Tabs */}
          <View style={styles.filterTabsRow}>
            <TouchableOpacity
              onPress={() => setFilter('all')}
              style={[styles.filterTab, filter === 'all' && styles.filterTabActive]}
            >
              <Text style={[styles.filterTabText, filter === 'all' && styles.filterTabTextActive]}>
                All ({trees.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setFilter('healthy')}
              style={[styles.filterTab, filter === 'healthy' && styles.filterTabActive]}
            >
              <CheckCircle size={13} color={filter === 'healthy' ? '#ffffff' : Colors.success} style={{ marginRight: 4 }} />
              <Text style={[styles.filterTabText, filter === 'healthy' && styles.filterTabTextActive]}>
                Healthy ({trees.filter((t) => t.currentDisease === 'Healthy').length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setFilter('attention')}
              style={[styles.filterTab, filter === 'attention' && styles.filterTabActive]}
            >
              <AlertTriangle size={13} color={filter === 'attention' ? '#ffffff' : Colors.danger} style={{ marginRight: 4 }} />
              <Text style={[styles.filterTabText, filter === 'attention' && styles.filterTabTextActive]}>
                Attention ({trees.filter((t) => t.currentDisease !== 'Healthy').length})
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Tree Cards List */}
        <View style={styles.treesList}>
          {filteredTrees.map((tree) => (
            <TouchableOpacity
              key={tree.id}
              activeOpacity={0.8}
              onPress={() => setSelectedTreeHistory(tree)}
              style={[styles.treeCard, Shadows.sm]}
            >
              <View style={styles.treeCardMain}>
                <View style={styles.treeBadgeAndId}>
                  <View style={styles.treeIdBox}>
                    <Text style={styles.treeIdText}>{tree.id}</Text>
                  </View>
                  <View>
                    <Text style={styles.cultivarText}>{tree.cultivar}</Text>
                    <Text style={styles.scanDateText}>Last scan: {tree.lastScan}</Text>
                  </View>
                </View>

                <StatusBadge status={tree.currentDisease} confidence={tree.confidence} />
              </View>

              <View style={styles.treeCardFooter}>
                <View style={styles.historyPill}>
                  <History size={13} color={Colors.light.textSecondary} />
                  <Text style={styles.historyPillText}>{tree.scans.length} Scans recorded</Text>
                </View>
                <Text style={styles.viewTimelineText}>View History →</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Add Tree Modal */}
      <Modal
        visible={addTreeModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setAddTreeModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, Shadows.lg]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Register Tree Twin</Text>
              <TouchableOpacity onPress={() => setAddTreeModalVisible(false)}>
                <X size={20} color={Colors.light.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Tree ID / Tag Number</Text>
            <TextInput
              placeholder="e.g. MK-15, BT-08"
              placeholderTextColor={Colors.light.textMuted}
              value={newTreeId}
              onChangeText={setNewTreeId}
              autoCapitalize="characters"
              style={styles.textInput}
            />

            <Text style={styles.inputLabel}>Cultivar / Variety</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: Spacing.md }}>
              {POPULAR_CULTIVARS.map((cultivar) => {
                const isSelected = cultivar === newCultivar;
                return (
                  <TouchableOpacity
                    key={cultivar}
                    onPress={() => setNewCultivar(cultivar)}
                    style={[styles.cultivarChip, isSelected && styles.cultivarChipActive]}
                  >
                    <Text style={[styles.cultivarChipText, isSelected && styles.cultivarChipTextActive]}>
                      {cultivar}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleCreateTree}
              disabled={isSubmitting || !newTreeId.trim()}
              style={[styles.submitButton, !newTreeId.trim() && styles.submitButtonDisabled]}
            >
              <Text style={styles.submitButtonText}>
                {isSubmitting ? 'Registering Tree...' : 'Register Tree in Twin'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Tree Scan History Modal */}
      <Modal
        visible={!!selectedTreeHistory}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSelectedTreeHistory(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.historyModalCard, Shadows.lg]}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Tree {selectedTreeHistory?.id}</Text>
                <Text style={styles.modalSubtitle}>{selectedTreeHistory?.cultivar}</Text>
              </View>
              <TouchableOpacity onPress={() => setSelectedTreeHistory(null)}>
                <X size={20} color={Colors.light.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.historyListTitle}>Foliage Diagnostic History</Text>
            <ScrollView style={{ maxHeight: 350 }}>
              {selectedTreeHistory?.scans.map((scan, index) => (
                <View key={scan.id || index} style={styles.historyItem}>
                  <View style={styles.historyItemTop}>
                    <StatusBadge status={scan.disease} confidence={scan.confidence} />
                    <View style={styles.timestampRow}>
                      <Calendar size={12} color={Colors.light.textSecondary} />
                      <Text style={styles.timestampText}>{scan.timestamp}</Text>
                    </View>
                  </View>
                  {scan.notes && <Text style={styles.historyNotes}>{scan.notes}</Text>}
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
    gap: Spacing.sm,
  },
  backButton: {
    padding: 6,
  },
  headerTitleContainer: {
    flex: 1,
  },
  farmTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.light.text,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  locationText: {
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
  addTreeHeaderBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl * 2,
  },
  summaryCard: {
    backgroundColor: Colors.light.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.light.border,
    marginBottom: Spacing.md,
  },
  summaryTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.light.textSecondary,
  },
  summaryValue: {
    fontSize: 28,
    fontWeight: '900',
    color: Colors.primary,
  },
  treeTotalPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: BorderRadius.full,
  },
  treeTotalText: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.primaryDark,
  },
  filterTabsRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
    paddingTop: Spacing.md,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.light.background,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  filterTabActive: {
    backgroundColor: Colors.light.text,
    borderColor: Colors.light.text,
  },
  filterTabText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.light.textSecondary,
  },
  filterTabTextActive: {
    color: '#ffffff',
  },
  treesList: {
    gap: Spacing.sm,
  },
  treeCard: {
    backgroundColor: Colors.light.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md + 2,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  treeCardMain: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  treeBadgeAndId: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  treeIdBox: {
    width: 46,
    height: 46,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  treeIdText: {
    fontSize: 14,
    fontWeight: '900',
    color: Colors.primaryDark,
  },
  cultivarText: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.light.text,
  },
  scanDateText: {
    fontSize: 11,
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
  treeCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
    paddingTop: Spacing.sm,
  },
  historyPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  historyPillText: {
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
  viewTimelineText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: Colors.light.surface,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    padding: Spacing.xl,
    paddingBottom: Spacing.xxl,
  },
  historyModalCard: {
    backgroundColor: Colors.light.surface,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    padding: Spacing.xl,
    paddingBottom: Spacing.xxl,
    maxHeight: '75%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  modalTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: Colors.light.text,
  },
  modalSubtitle: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: Colors.light.background,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontSize: 14,
    color: Colors.light.text,
    marginBottom: Spacing.md,
  },
  cultivarChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.light.background,
    borderWidth: 1,
    borderColor: Colors.light.border,
    marginRight: Spacing.xs,
  },
  cultivarChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  cultivarChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.light.textSecondary,
  },
  cultivarChipTextActive: {
    color: '#ffffff',
  },
  submitButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  submitButtonDisabled: {
    backgroundColor: Colors.light.border,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
  },
  historyListTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.light.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.md,
  },
  historyItem: {
    backgroundColor: Colors.light.background,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.light.border,
    marginBottom: Spacing.sm,
  },
  historyItemTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timestampRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timestampText: {
    fontSize: 11,
    color: Colors.light.textSecondary,
  },
  historyNotes: {
    fontSize: 12,
    color: Colors.light.text,
    marginTop: Spacing.sm,
    fontStyle: 'italic',
  },
});
