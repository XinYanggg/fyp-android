import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import {
  User,
  Shield,
  Server,
  Cpu,
  LogOut,
  Sparkles,
} from 'lucide-react-native';
import { useFarms } from '../../context/FarmContext';
import { Colors, BorderRadius, Spacing, Shadows } from '../../constants/theme';

export default function ProfileScreen() {
  const { farms } = useFarms();

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to log out from this device?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive', onPress: () => Alert.alert('Logged out', 'Session terminated.') },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Screen Title */}
        <View style={styles.header}>
          <Text style={styles.title}>Profile & Settings</Text>
          <Text style={styles.subtitle}>Account credentials and mobile configuration</Text>
        </View>

        {/* User Card */}
        <View style={[styles.userCard, Shadows.md]}>
          <View style={styles.avatarLarge}>
            <User size={36} color={Colors.primary} strokeWidth={2.2} />
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>Orchard Manager</Text>
            <Text style={styles.userEmail}>farmer@durian.health</Text>
            <View style={styles.roleBadge}>
              <Shield size={12} color={Colors.primary} />
              <Text style={styles.roleText}>Farm Owner & Admin</Text>
            </View>
          </View>
        </View>

        {/* Orchards Membership */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Connected Estates</Text>
          <View style={[styles.cardGroup, Shadows.sm]}>
            {farms.map((f, i) => (
              <View
                key={f._id}
                style={[
                  styles.cardGroupRow,
                  i !== farms.length - 1 && styles.rowDivider,
                ]}
              >
                <View>
                  <Text style={styles.rowMainText}>{f.name}</Text>
                  <Text style={styles.rowSubText}>{f.trees.length} trees · {f.location}</Text>
                </View>
                <View style={styles.ownerPill}>
                  <Text style={styles.ownerPillText}>Owner</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Developer & Backend Link Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>System & Backend Architecture</Text>
          <View style={[styles.cardGroup, Shadows.sm]}>
            {/* Next.js Host link */}
            <View style={[styles.cardGroupRow, styles.rowDivider]}>
              <View style={styles.rowIconBg}>
                <Server size={18} color={Colors.primary} />
              </View>
              <View style={{ flex: 1, marginLeft: Spacing.sm }}>
                <Text style={styles.rowMainText}>Next.js Backend Host</Text>
                <Text style={styles.rowSubText}>http://10.0.2.2:3000 (Android Emulator)</Text>
              </View>
              <View style={styles.statusPill}>
                <Text style={styles.statusPillText}>Configured</Text>
              </View>
            </View>

            {/* AI Model Host */}
            <View style={[styles.cardGroupRow, styles.rowDivider]}>
              <View style={styles.rowIconBg}>
                <Cpu size={18} color={Colors.accent} />
              </View>
              <View style={{ flex: 1, marginLeft: Spacing.sm }}>
                <Text style={styles.rowMainText}>AI Prediction Service</Text>
                <Text style={styles.rowSubText}>FastAPI Computer Vision Engine</Text>
              </View>
              <View style={styles.statusPill}>
                <Text style={styles.statusPillText}>Online</Text>
              </View>
            </View>

            {/* Client Version */}
            <View style={styles.cardGroupRow}>
              <View style={styles.rowIconBg}>
                <Sparkles size={18} color={Colors.light.textSecondary} />
              </View>
              <View style={{ flex: 1, marginLeft: Spacing.sm }}>
                <Text style={styles.rowMainText}>Client Version</Text>
                <Text style={styles.rowSubText}>durian.health v1.0.0 (Expo SDK 58)</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Sign Out Button */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleSignOut}
          style={[styles.signOutButton, Shadows.sm]}
        >
          <LogOut size={18} color={Colors.danger} />
          <Text style={styles.signOutText}>Sign Out from Device</Text>
        </TouchableOpacity>
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
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: Colors.light.text,
  },
  subtitle: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
  userCard: {
    backgroundColor: Colors.light.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.light.border,
    marginBottom: Spacing.lg,
  },
  avatarLarge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.light.text,
  },
  userEmail: {
    fontSize: 13,
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.successLight,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
    alignSelf: 'flex-start',
    marginTop: 6,
  },
  roleText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.success,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.light.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
  },
  cardGroup: {
    backgroundColor: Colors.light.surface,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.light.border,
    overflow: 'hidden',
  },
  cardGroupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
  },
  rowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  rowIconBg: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.light.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rowMainText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.light.text,
  },
  rowSubText: {
    fontSize: 11,
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
  ownerPill: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  ownerPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primaryDark,
  },
  statusPill: {
    backgroundColor: Colors.successLight,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.success,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.dangerLight,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: '#fecaca',
    marginTop: Spacing.sm,
  },
  signOutText: {
    color: Colors.danger,
    fontSize: 14,
    fontWeight: '800',
  },
});
