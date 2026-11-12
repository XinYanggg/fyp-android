import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { LogIn, UserPlus, X, Mail, Lock, User as UserIcon, AlertCircle, CheckCircle2 } from 'lucide-react-native';
import { GoogleLogo } from './GoogleLogo';
import { useAuth } from '../../context/AuthContext';
import { Colors, BorderRadius, Spacing, Shadows } from '../../constants/theme';

interface LoginModalProps {
  visible: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
}

export const LoginModal: React.FC<LoginModalProps> = ({
  visible,
  onClose,
  initialMode = 'login',
}) => {
  const { login, loginWithGoogle, register } = useAuth();

  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Open on the requested tab each time the modal is shown
  useEffect(() => {
    if (visible) {
      setMode(initialMode);
      setErrorMsg(null);
      setSuccessMsg(null);
    }
  }, [visible, initialMode]);

  const resetForm = () => {
    setName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  const switchMode = (newMode: 'login' | 'register') => {
    setMode(newMode);
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  const handleLoginSubmit = async () => {
    if (!email.trim() || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await login(email.trim(), password);
      if (res.success) {
        resetForm();
        onClose();
      } else {
        setErrorMsg(res.error || 'Authentication failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await loginWithGoogle();
      if (res.success) {
        resetForm();
        onClose();
      } else if (!res.cancelled) {
        setErrorMsg(res.error || 'Google sign-in failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async () => {
    if (!name.trim() || !email.trim() || !password) {
      setErrorMsg('Please fill in all required fields.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const res = await register(name.trim(), email.trim(), password);
      if (res.success) {
        if (res.isVerified) {
          // Auto-logged in!
          resetForm();
          onClose();
        } else {
          // Verification email sent
          setSuccessMsg(res.message || 'Account created! Please check your email to verify.');
          setPassword('');
          setConfirmPassword('');
        }
      } else {
        setErrorMsg(res.error || 'Registration failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.modalOverlay}
      >
        <View style={[styles.modalCard, Shadows.lg]}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>
                {mode === 'login' ? 'Welcome Back' : 'Create Account'}
              </Text>
              <Text style={styles.subtitle}>
                {mode === 'login'
                  ? 'Sign in to access your durian orchards'
                  : 'Start managing your orchards with AI'}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color={Colors.light.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Mode Switcher Tabs */}
          <View style={styles.tabSwitcher}>
            <TouchableOpacity
              onPress={() => switchMode('login')}
              style={[styles.tabButton, mode === 'login' && styles.tabButtonActive]}
            >
              <LogIn size={15} color={mode === 'login' ? Colors.primary : Colors.light.textSecondary} />
              <Text style={[styles.tabButtonText, mode === 'login' && styles.tabButtonTextActive]}>
                Sign In
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => switchMode('register')}
              style={[styles.tabButton, mode === 'register' && styles.tabButtonActive]}
            >
              <UserPlus size={15} color={mode === 'register' ? Colors.primary : Colors.light.textSecondary} />
              <Text style={[styles.tabButtonText, mode === 'register' && styles.tabButtonTextActive]}>
                Register
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: Spacing.md }}>
            {/* Error Message */}
            {errorMsg && (
              <View style={styles.errorBox}>
                <AlertCircle size={16} color={Colors.danger} />
                <Text style={styles.errorText}>{errorMsg}</Text>
              </View>
            )}

            {/* Success Message */}
            {successMsg && (
              <View style={styles.successBox}>
                <CheckCircle2 size={16} color={Colors.success} />
                <Text style={styles.successText}>{successMsg}</Text>
              </View>
            )}

            {/* REGISTER-ONLY: Full Name */}
            {mode === 'register' && (
              <>
                <Text style={styles.label}>Full Name</Text>
                <View style={styles.inputContainer}>
                  <UserIcon size={18} color={Colors.light.textSecondary} style={{ marginRight: 8 }} />
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. John Doe"
                    placeholderTextColor={Colors.light.textMuted}
                    value={name}
                    onChangeText={setName}
                  />
                </View>
              </>
            )}

            {/* Email Input */}
            <Text style={styles.label}>Email Address</Text>
            <View style={styles.inputContainer}>
              <Mail size={18} color={Colors.light.textSecondary} style={{ marginRight: 8 }} />
              <TextInput
                style={styles.input}
                placeholder="farmer@durian.health"
                placeholderTextColor={Colors.light.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            {/* Password Input */}
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputContainer}>
              <Lock size={18} color={Colors.light.textSecondary} style={{ marginRight: 8 }} />
              <TextInput
                style={styles.input}
                placeholder={mode === 'register' ? 'At least 6 characters' : '••••••••'}
                placeholderTextColor={Colors.light.textMuted}
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>

            {/* REGISTER-ONLY: Confirm Password */}
            {mode === 'register' && (
              <>
                <Text style={styles.label}>Confirm Password</Text>
                <View style={styles.inputContainer}>
                  <Lock size={18} color={Colors.light.textSecondary} style={{ marginRight: 8 }} />
                  <TextInput
                    style={styles.input}
                    placeholder="Repeat password"
                    placeholderTextColor={Colors.light.textMuted}
                    secureTextEntry
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                  />
                </View>
              </>
            )}

            {/* Submit Button */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={mode === 'login' ? handleLoginSubmit : handleRegisterSubmit}
              disabled={loading}
              style={[styles.submitButton, (loading) && styles.submitButtonDisabled]}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <View style={styles.submitBtnContent}>
                  {mode === 'login' ? (
                    <>
                      <LogIn size={18} color="#ffffff" />
                      <Text style={styles.submitButtonText}>Log In to Orchard</Text>
                    </>
                  ) : (
                    <>
                      <UserPlus size={18} color="#ffffff" />
                      <Text style={styles.submitButtonText}>Create Account</Text>
                    </>
                  )}
                </View>
              )}
            </TouchableOpacity>

            {/* Google Sign-In */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleGoogleSignIn}
              disabled={loading}
              accessibilityRole="button"
              accessibilityLabel="Continue with Google"
              style={[styles.googleButton, loading && styles.submitButtonDisabled]}
            >
              <GoogleLogo size={20} />
              <Text style={styles.googleButtonText}>Continue with Google</Text>
            </TouchableOpacity>

            {/* Switch Mode Prompt */}
            <TouchableOpacity
              onPress={() => switchMode(mode === 'login' ? 'register' : 'login')}
              style={styles.switchModeLink}
            >
              <Text style={styles.switchModeText}>
                {mode === 'login' ? (
                  <>Don't have an account? <Text style={styles.switchModeBold}>Sign up now</Text></>
                ) : (
                  <>Already have an account? <Text style={styles.switchModeBold}>Sign in</Text></>
                )}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: Colors.light.surface,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: Colors.light.text,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
  closeBtn: {
    padding: 4,
  },
  tabSwitcher: {
    flexDirection: 'row',
    backgroundColor: Colors.light.background,
    borderRadius: BorderRadius.lg,
    padding: 3,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    gap: 6,
  },
  tabButtonActive: {
    backgroundColor: Colors.light.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  tabButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.light.textSecondary,
  },
  tabButtonTextActive: {
    color: Colors.primary,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.dangerLight,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
  },
  errorText: {
    flex: 1,
    color: Colors.danger,
    fontSize: 12,
    fontWeight: '600',
  },
  successBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.successLight,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
  },
  successText: {
    flex: 1,
    color: Colors.success,
    fontSize: 12,
    fontWeight: '600',
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 5,
    marginTop: Spacing.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.background,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    height: 46,
    marginBottom: Spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: Colors.light.text,
  },
  submitButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.md,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: Spacing.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.light.border,
  },
  dividerText: {
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: Spacing.md,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.light.border,
    backgroundColor: Colors.light.surface,
  },
  googleButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.light.text,
  },
  switchModeLink: {
    alignItems: 'center',
    marginTop: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  switchModeText: {
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
  switchModeBold: {
    color: Colors.primary,
    fontWeight: '800',
  },
});
