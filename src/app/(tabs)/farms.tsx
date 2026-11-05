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
import { useRouter } from 'expo-router';
import {
  Plus,
  MapPin,
  Trees,
  Users,
  ChevronRight,
  Activity,
  X,
} from 'lucide-react-native';
import { useFarms } from '../../context/FarmContext';
import { Colors, BorderRadius, Spacing, Shadows } from '../../constants/theme';

export default function FarmsScreen() {
  const router = useRouter();
  const { farms, setSelectedFarm, addFarm, refreshFarms, isLoading } = useFarms();

  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [newFarmName, setNewFarmName] = useState('');
  const [newFarmLocation, setNewFarmLocation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshFarms();
    } finally {
      setRefreshing(false);
    }
  };

  const handleCreateFarm = async () => {
    if (!newFarmName.trim() || !newFarmLocation.trim()) return;
    setIsSubmitting(true);
    try {
      const created = await addFarm(newFarmName.trim(), newFarmLocation.trim());
      setNewFarmName('');
      setNewFarmLocation('');
      setModalVisible(false);
      router.push(`/farm/${created._id}` as any);
    } catch (err: any) {
      Alert.alert('Create Farm Error', err.message || 'Failed to save orchard to server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar style="dark" />

      {/* Screen Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>My Orchards</Text>
          <Text style={styles.subtitle}>Manage your digital twins & cultivars</Text>
        </View>
        <TouchableOpacity
          onPress={() => setModalVisible(true)}
          style={[styles.addButton, Shadows.sm]}
        >
          <Plus size={18} color="#ffffff" strokeWidth={2.5} />
          <Text style={styles.addButtonText}>Add Farm</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing || isLoading} onRefresh={onRefresh} colors={[Colors.primary]} />
        }
      >
        {farms.map((farm) => {
          return (
            <TouchableOpacity
              key={farm._id}
              activeOpacity={0.8}
              onPress={() => {
                setSelectedFarm(farm);
                router.push(`/farm/${farm._id}` as any);
              }}
              style={[styles.farmCard, Shadows.md]}
            >
              <View style={styles.farmCardTop}>
                <View style={styles.farmInfo}>
                  <Text style={styles.farmName}>{farm.name}</Text>
                  <View style={styles.locationRow}>
                    <MapPin size={13} color={Colors.light.textSecondary} />
                    <Text style={styles.locationText}>{farm.location}</Text>
                  </View>
                </View>
                <View style={styles.healthBadge}>
                  <Activity size={14} color={Colors.primary} />
                  <Text style={styles.healthText}>{farm.healthPercentage}</Text>
                </View>
              </View>

              <View style={styles.statsRow}>
                <View style={styles.statPill}>
                  <Trees size={14} color={Colors.primary} />
                  <Text style={styles.statPillText}>
                    <Text style={{ fontWeight: '700', color: Colors.light.text }}>{farm.trees.length}</Text> Trees
                  </Text>
                </View>

                <View style={styles.statPill}>
                  <Users size={14} color={Colors.accent} />
                  <Text style={styles.statPillText}>
                    <Text style={{ fontWeight: '700', color: Colors.light.text }}>{farm.members.length}</Text> Members
                  </Text>
                </View>

                <View style={[styles.statPill, { marginLeft: 'auto' }]}>
                  <Text style={styles.lastScanText}>Scanned {farm.lastScan}</Text>
                  <ChevronRight size={14} color={Colors.light.textSecondary} />
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Add Farm Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, Shadows.lg]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Orchard</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
                <X size={20} color={Colors.light.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Farm Name</Text>
            <TextInput
              placeholder="e.g. Raub Golden Valley Estate"
              placeholderTextColor={Colors.light.textMuted}
              value={newFarmName}
              onChangeText={setNewFarmName}
              style={styles.textInput}
            />

            <Text style={styles.inputLabel}>Location / District</Text>
            <TextInput
              placeholder="e.g. Raub, Pahang"
              placeholderTextColor={Colors.light.textMuted}
              value={newFarmLocation}
              onChangeText={setNewFarmLocation}
              style={styles.textInput}
            />

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleCreateFarm}
              disabled={isSubmitting || !newFarmName.trim() || !newFarmLocation.trim()}
              style={[
                styles.submitButton,
                (!newFarmName.trim() || !newFarmLocation.trim()) && styles.submitButtonDisabled,
              ]}
            >
              <Text style={styles.submitButtonText}>
                {isSubmitting ? 'Creating Farm...' : 'Create Orchard Twin'}
              </Text>
            </TouchableOpacity>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: Colors.light.text,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    gap: 4,
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  scrollContent: {
    padding: Spacing.lg,
    gap: Spacing.md,
    paddingBottom: Spacing.xxl * 2,
  },
  farmCard: {
    backgroundColor: Colors.light.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  farmCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  farmInfo: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  farmName: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.light.text,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  locationText: {
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
  healthBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.successLight,
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  healthText: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.success,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
    paddingTop: Spacing.md,
  },
  statPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  statPillText: {
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
  lastScanText: {
    fontSize: 11,
    color: Colors.light.textMuted,
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
  closeButton: {
    padding: 4,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 6,
    marginTop: Spacing.sm,
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
    marginBottom: Spacing.sm,
  },
  submitButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    marginTop: Spacing.lg,
  },
  submitButtonDisabled: {
    backgroundColor: Colors.light.border,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
  },
});
