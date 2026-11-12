import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Zap, Smartphone, BarChart3, Camera, ScanLine, Lightbulb } from 'lucide-react-native';
import { LoginModal } from '../components/common/LoginModal';
import { Colors, BorderRadius, Spacing, Shadows } from '../constants/theme';

const BENEFITS = [
  {
    icon: Zap,
    title: 'Rapid Diagnosis',
    desc: 'Photograph a leaf and get a disease label in seconds.',
    color: '#3b82f6',
  },
  {
    icon: Smartphone,
    title: 'Built for the Field',
    desc: 'Scan trees right where they grow, straight from your phone.',
    color: '#f59e0b',
  },
  {
    icon: BarChart3,
    title: 'Track History',
    desc: 'Monitor disease trends across your farm over time.',
    color: Colors.primary,
  },
];

const STEPS = [
  { icon: Camera, title: 'Upload', desc: 'Take a clear photo of a leaf with your phone.', color: Colors.primary },
  { icon: ScanLine, title: 'Diagnose', desc: 'Our AI identifies the disease and shows its confidence.', color: '#3b82f6' },
  { icon: Lightbulb, title: 'Act & Track', desc: 'Follow the recommended actions and record the result.', color: '#f59e0b' },
];

/**
 * Introduction screen shown to signed-out users.
 * The rest of the app is only reachable after logging in or registering.
 */
export default function WelcomeScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState<'login' | 'register'>('login');

  const open = (mode: 'login' | 'register') => {
    setModalMode(mode);
    setModalVisible(true);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={styles.brandRow}>
          <Text style={styles.brandTitle}>durian</Text>
          <Text style={[styles.brandTitle, { color: Colors.primary }]}>.health</Text>
        </View>

        <Image
          source={require('../../assets/images/durian-farm.jpg')}
          style={styles.heroImage}
          accessibilityLabel="Durian farm"
        />

        <Text style={styles.heroTitle}>Diagnose Durian Tree Health</Text>
        <Text style={styles.heroText}>
          AI-powered leaf disease detection for Malaysian durian farmers to diagnose issues, get tailored
          recommendations, and track tree health over time.
        </Text>

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => open('login')}
          accessibilityRole="button"
          style={[styles.primaryButton, Shadows.md]}
        >
          <Text style={styles.primaryButtonText}>Log In</Text>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => open('register')}
          accessibilityRole="button"
          style={styles.secondaryButton}
        >
          <Text style={styles.secondaryButtonText}>Create Account</Text>
        </TouchableOpacity>

        {/* Benefits */}
        <Text style={styles.sectionTitle}>Why durian.health?</Text>
        {BENEFITS.map(({ icon: Icon, title, desc, color }) => (
          <View key={title} style={[styles.card, Shadows.sm]}>
            <View style={[styles.iconBox, { backgroundColor: color }]}>
              <Icon size={22} color="#ffffff" />
            </View>
            <View style={styles.cardBody}>
              <Text style={styles.cardTitle}>{title}</Text>
              <Text style={styles.cardDesc}>{desc}</Text>
            </View>
          </View>
        ))}

        {/* How it works */}
        <Text style={styles.sectionTitle}>How it works</Text>
        {STEPS.map(({ icon: Icon, title, desc, color }, index) => (
          <View key={title} style={[styles.card, Shadows.sm]}>
            <View style={[styles.iconBox, { backgroundColor: color }]}>
              <Icon size={22} color="#ffffff" />
            </View>
            <View style={styles.cardBody}>
              <Text style={styles.cardTitle}>
                {index + 1}. {title}
              </Text>
              <Text style={styles.cardDesc}>{desc}</Text>
            </View>
          </View>
        ))}

        <Text style={styles.footer}>SDG 12: Responsible Consumption and Production</Text>
      </ScrollView>

      <LoginModal visible={modalVisible} initialMode={modalMode} onClose={() => setModalVisible(false)} />
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
  brandRow: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
  },
  brandTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: Colors.light.text,
    letterSpacing: -0.5,
  },
  heroImage: {
    width: '100%',
    height: 200,
    borderRadius: BorderRadius.xl,
    marginBottom: Spacing.lg,
  },
  heroTitle: {
    fontSize: 30,
    fontWeight: '900',
    color: Colors.light.text,
    lineHeight: 36,
    marginBottom: Spacing.sm,
  },
  heroText: {
    fontSize: 15,
    lineHeight: 22,
    color: Colors.light.textSecondary,
    marginBottom: Spacing.lg,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md + 2,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
  },
  secondaryButton: {
    marginTop: Spacing.sm,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md + 2,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.primary,
    backgroundColor: Colors.light.surface,
  },
  secondaryButtonText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '800',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: Colors.light.text,
    marginTop: Spacing.xl,
    marginBottom: Spacing.md,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.light.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md + 2,
    borderWidth: 1,
    borderColor: Colors.light.border,
    marginBottom: Spacing.sm,
  },
  iconBox: {
    width: 46,
    height: 46,
    borderRadius: BorderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardBody: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.light.text,
  },
  cardDesc: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    marginTop: 2,
    lineHeight: 17,
  },
  footer: {
    textAlign: 'center',
    fontSize: 11,
    color: Colors.light.textMuted,
    marginTop: Spacing.xl,
  },
});
