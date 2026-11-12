import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import Constants from 'expo-constants';
import {
  User as UserIcon,
  Shield,
  LogOut,
  Sparkles,
} from 'lucide-react-native';
import { useFarms } from '../../context/FarmContext';
import { useAuth } from '../../context/AuthContext';
import { Colors, BorderRadius, Spacing, Shadows } from '../../constants/theme';

export default function ProfileScreen() {
  const { farms } = useFarms();
  const { user, logout } = useAuth();

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to log out from this device?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive', onPress: () => logout() },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Screen Title */}
        <View style={styles.header}>
          <Text style={styles.title}>Profile & Settings</Text>
          <Text style={styles.subtitle}>Your account and orchards</Text>
        </View>

        {/* User Card */}
        <View style={[styles.userCard, Shadows.md]}>
          {user?.image ? (
            <Image
              source={{ uri: user.image }}
              style={styles.avatarImage}
              accessibilityLabel={user.name || 'User avatar'}
            />
          ) : user ? (
            <View style={[styles.avatarLarge, styles.avatarInitial]}>
              <Text style={styles.avatarInitialText}>
                {user.name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || '?'}
              </Text>
            </View>
          ) : (
            <View style={styles.avatarLarge}>
              <UserIcon size={34} color={Colors.primary} strokeWidth={2.2} />
            </View>
          )}
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user?.name || 'Orchard Manager'}</Text>
            <Text style={styles.userEmail}>{user?.email}</Text>
            <View style={styles.roleBadge}>
              <Shield size={12} color={Colors.primary} />
              <Text style={styles.roleText}>Verified Account</Text>
            </View>
          </View>
        </View>

        {/* Orchards Membership */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            My Estates ({farms.length})
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
                  <Text style={styles.ownerPillText}>
                    {f.ownerEmail === user?.email ? 'Owner' : 'Member'}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={[styles.cardGroup, Shadows.sm]}>
            <View style={styles.cardGroupRow}>
              <View style={styles.rowIconBg}>
                <Sparkles size={18} color={Colors.light.textSecondary} />
              </View>
              <View style={{ flex: 1, marginLeft: Spacing.sm }}>
                <Text style={styles.rowMainText}>durian.health</Text>
                <Text style={styles.rowSubText}>Version {Constants.expoConfig?.version ?? '1.0.0'}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Sign Out Button */}
        {(
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleSignOut}
            style={[styles.signOutButton, Shadows.sm]}
          >
            <LogOut size={18} color={Colors.danger} />
            <Text style={styles.signOutText}>Sign Out from Device</Text>
          </TouchableOpacity>
        )}
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
  avatarImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: Spacing.md,
    borderWidth: 2,
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  avatarInitial: {
    backgroundColor: '#fde68a',
    borderColor: '#fde68a',
  },
  avatarInitialText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#000000',
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
