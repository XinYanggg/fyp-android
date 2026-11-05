import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import {
  User as UserIcon,
  Shield,
  Server,
  Cpu,
  LogOut,
  LogIn,
  Sparkles,
  RefreshCw,
} from 'lucide-react-native';
import { useFarms } from '../../context/FarmContext';
import { useAuth } from '../../context/AuthContext';
import { LoginModal } from '../../components/common/LoginModal';
import { api } from '../../services/api';
import { Colors, BorderRadius, Spacing, Shadows } from '../../constants/theme';

export default function ProfileScreen() {
  const { farms, isLiveBackend } = useFarms();
  const { user, logout, isServerOnline, checkServerStatus } = useAuth();

  const [loginModalVisible, setLoginModalVisible] = useState(false);
  const [checkingPing, setCheckingPing] = useState(false);

  const handlePing = async () => {
    setCheckingPing(true);
    try {
      const ok = await checkServerStatus();
      if (ok) {
        Alert.alert('Connection Successful', `Backend reached at ${api.getBaseUrl()}`);
      } else {
        Alert.alert(
          'Connection Failed',
          `Could not reach ${api.getBaseUrl()}.\n\nEnsure your Next.js server is running:\nnpm run dev`
        );
      }
    } finally {
      setCheckingPing(false);
    }
  };

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to log out from this device?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: async () => {
          await logout();
          Alert.alert('Signed Out', 'You are now in guest mode.');
        },
      },
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
            <UserIcon size={34} color={Colors.primary} strokeWidth={2.2} />
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user ? user.name || 'Orchard Manager' : 'Guest Farmer'}</Text>
            <Text style={styles.userEmail}>{user ? user.email : 'Local preview session'}</Text>
            <View style={[styles.roleBadge, !user && styles.roleBadgeGuest]}>
              <Shield size={12} color={user ? Colors.primary : Colors.accent} />
              <Text style={[styles.roleText, !user && { color: Colors.accent }]}>
                {user ? 'Verified Next.js Account' : 'Guest Mode'}
              </Text>
            </View>
          </View>
        </View>

        {/* Login / Auth Action Button */}
        {!user ? (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setLoginModalVisible(true)}
            style={[styles.loginPromptButton, Shadows.sm]}
          >
            <LogIn size={18} color="#ffffff" />
            <Text style={styles.loginPromptText}>Sign In with durian.health</Text>
          </TouchableOpacity>
        ) : null}

        {/* Orchards Membership */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Connected Estates ({farms.length})
          </Text>
          <View style={[styles.cardGroup, Shadows.sm]}>
            {farms.map((f, i) => (
              <View
                key={f._id}
                style={[
                  styles.cardGroupRow,
                  i !== farms.length - 1 && styles.rowDivider,
                ]}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.rowMainText}>{f.name}</Text>
                  <Text style={styles.rowSubText}>{f.trees?.length || 0} trees · {f.location}</Text>
                </View>
                <View style={styles.ownerPill}>
                  <Text style={styles.ownerPillText}>{isLiveBackend ? 'MongoDB' : 'Local'}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Developer & Backend Link Section */}
        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionTitle}>System & Backend Architecture</Text>
            <TouchableOpacity onPress={handlePing} disabled={checkingPing} style={styles.pingBtn}>
              {checkingPing ? (
                <ActivityIndicator size="small" color={Colors.primary} />
              ) : (
                <>
                  <RefreshCw size={13} color={Colors.primary} />
                  <Text style={styles.pingBtnText}>Test Ping</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          <View style={[styles.cardGroup, Shadows.sm]}>
            {/* Next.js Host link */}
            <View style={[styles.cardGroupRow, styles.rowDivider]}>
              <View style={styles.rowIconBg}>
                <Server size={18} color={Colors.primary} />
              </View>
              <View style={{ flex: 1, marginLeft: Spacing.sm }}>
                <Text style={styles.rowMainText}>Next.js Backend API</Text>
                <Text style={styles.rowSubText}>{api.getBaseUrl()}</Text>
              </View>
              <View style={[styles.statusPill, isServerOnline ? styles.statusPillOnline : styles.statusPillOffline]}>
                <Text style={[styles.statusPillText, { color: isServerOnline ? Colors.success : Colors.warning }]}>
                  {isServerOnline ? 'Online' : 'Offline'}
                </Text>
              </View>
            </View>

            {/* AI Model Host */}
            <View style={[styles.cardGroupRow, styles.rowDivider]}>
              <View style={styles.rowIconBg}>
                <Cpu size={18} color={Colors.accent} />
              </View>
              <View style={{ flex: 1, marginLeft: Spacing.sm }}>
                <Text style={styles.rowMainText}>AI Prediction Service</Text>
                <Text style={styles.rowSubText}>https://durian-health-api.farnxinyang.com</Text>
              </View>
              <View style={[styles.statusPill, styles.statusPillOnline]}>
                <Text style={[styles.statusPillText, { color: Colors.success }]}>Active</Text>
              </View>
            </View>

            {/* Client Version */}
            <View style={styles.cardGroupRow}>
              <View style={styles.rowIconBg}>
                <Sparkles size={18} color={Colors.light.textSecondary} />
              </View>
              <View style={{ flex: 1, marginLeft: Spacing.sm }}>
                <Text style={styles.rowMainText}>Client Version</Text>
                <Text style={styles.rowSubText}>durian.health Android (Expo SDK 58)</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Sign Out Button (if logged in) */}
        {user ? (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleSignOut}
            style={[styles.signOutButton, Shadows.sm]}
          >
            <LogOut size={18} color={Colors.danger} />
            <Text style={styles.signOutText}>Sign Out from Device</Text>
          </TouchableOpacity>
        ) : null}
      </ScrollView>

      {/* Login Modal */}
      <LoginModal
        visible={loginModalVisible}
        onClose={() => setLoginModalVisible(false)}
      />
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
    marginBottom: Spacing.md,
  },
  avatarLarge: {
    width: 60,
    height: 60,
    borderRadius: 30,
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
  roleBadgeGuest: {
    backgroundColor: Colors.accentLight,
  },
  roleText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.success,
  },
  loginPromptButton: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.xl,
    marginBottom: Spacing.lg,
  },
  loginPromptText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.light.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  pingBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  pingBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
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
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  statusPillOnline: {
    backgroundColor: Colors.successLight,
  },
  statusPillOffline: {
    backgroundColor: Colors.warningLight,
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: '700',
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
