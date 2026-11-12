import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as ImagePicker from 'expo-image-picker';
import {
  Camera,
  Image as ImageIcon,
  ScanLine,
  RotateCcw,
  Sparkles,
  Save,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react-native';
import { useFarms } from '../../context/FarmContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Colors, BorderRadius, Spacing, Shadows } from '../../constants/theme';
import { useRouter } from 'expo-router';

export default function ScanScreen() {
  const router = useRouter();
  const { farms, selectedFarm, saveScan, detectDisease } = useFarms();

  const [imageUri, setImageUri] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<{ disease: string; confidence: number } | null>(null);

  const [targetFarmId, setTargetFarmId] = useState(selectedFarm?._id || farms[0]?._id || '');
  const [targetTreeId, setTargetTreeId] = useState(selectedFarm?.trees[0]?.id || farms[0]?.trees[0]?.id || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const activeFarm = farms.find((f) => f._id === targetFarmId) || selectedFarm || farms[0];

  // Farms load asynchronously: pick sensible defaults once they arrive
  useEffect(() => {
    const farm = farms.find((f) => f._id === targetFarmId) || selectedFarm || farms[0];
    if (!farm) return;
    if (farm._id !== targetFarmId) setTargetFarmId(farm._id);
    if (!farm.trees.some((t) => t.id === targetTreeId)) {
      setTargetTreeId(farm.trees[0]?.id || '');
    }
  }, [farms, selectedFarm, targetFarmId, targetTreeId]);

  const handlePickCamera = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission Denied', 'Camera access is required to photograph durian leaves.');
      return;
    }

    const res = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.9,
    });

    if (!res.canceled && res.assets && res.assets[0]) {
      setImageUri(res.assets[0].uri);
      setResult(null);
      setSavedSuccess(false);
    }
  };

  const handlePickGallery = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission Denied', 'Photo library access is needed to select an image.');
      return;
    }

    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.9,
    });

    if (!res.canceled && res.assets && res.assets[0]) {
      setImageUri(res.assets[0].uri);
      setResult(null);
      setSavedSuccess(false);
    }
  };

  const handleAnalyze = async () => {
    if (!imageUri) return;
    setAnalyzing(true);
    try {
      const diagnosis = await detectDisease(imageUri);
      setResult(diagnosis);
    } catch (err: any) {
      Alert.alert('Analysis Failed', err?.message || 'Could not process leaf image. Please retry.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSaveResult = async () => {
    if (result && Math.round(result.confidence * 100) <= 0) {
      Alert.alert('Cannot Save', 'The model returned 0% confidence. Please retake a clearer photo of the leaf.');
      return;
    }
    if (!result || !targetFarmId || !targetTreeId) {
      Alert.alert('Selection Missing', 'Please select both a farm and a target tree.');
      return;
    }

    try {
      await saveScan(targetFarmId, targetTreeId, result.disease, result.confidence);
    } catch (err: any) {
      Alert.alert('Save Failed', err?.message || 'Could not save the scan. Please retry.');
      return;
    }

    setSavedSuccess(true);
    Alert.alert(
      'Scan Recorded!',
      `Leaf diagnosis (${result.disease}) attached to tree ${targetTreeId}.`,
      [
        {
          text: 'View Tree',
          onPress: () => router.push(`/farm/${targetFarmId}` as any),
        },
        { text: 'OK' },
      ]
    );
  };

  const handleReset = () => {
    setImageUri(null);
    setResult(null);
    setSavedSuccess(false);
  };

  // A result that displays as 0% confidence is not a usable diagnosis
  const isZeroConfidence = !!result && Math.round(result.confidence * 100) <= 0;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>AI Disease Scanner</Text>
          <Text style={styles.subtitle}>Instant leaf health diagnosis powered by Computer Vision</Text>
        </View>

        {/* Viewfinder / Preview Card */}
        <View style={[styles.viewfinderCard, Shadows.md]}>
          {imageUri ? (
            <View style={styles.previewContainer}>
              <Image source={{ uri: imageUri }} style={styles.previewImage} />
              <TouchableOpacity onPress={handleReset} style={styles.resetButton}>
                <RotateCcw size={16} color="#ffffff" />
                <Text style={styles.resetButtonText}>New Photo</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.reticleGuide}>
              <View style={styles.reticleBox}>
                <View style={[styles.corner, styles.cornerTL]} />
                <View style={[styles.corner, styles.cornerTR]} />
                <View style={[styles.corner, styles.cornerBL]} />
                <View style={[styles.corner, styles.cornerBR]} />
                <ScanLine size={48} color={Colors.primary} strokeWidth={1.5} />
              </View>
              <Text style={styles.reticleInstruction}>Position leaf centered within frame</Text>
              <Text style={styles.reticleHint}>Ensure bright lighting and focus on visible spots/lesions</Text>

              {/* Action Buttons */}
              <View style={styles.actionButtonsRow}>
                <TouchableOpacity onPress={handlePickCamera} style={[styles.captureBtn, styles.cameraBtn]}>
                  <Camera size={20} color="#ffffff" strokeWidth={2.5} />
                  <Text style={styles.captureBtnText}>Take Photo</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={handlePickGallery} style={[styles.captureBtn, styles.galleryBtn]}>
                  <ImageIcon size={20} color={Colors.light.text} strokeWidth={2} />
                  <Text style={[styles.captureBtnText, { color: Colors.light.text }]}>Gallery</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* Trigger Analysis Button */}
        {imageUri && !result && (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleAnalyze}
            disabled={analyzing}
            style={[styles.analyzeButton, Shadows.md]}
          >
            {analyzing ? (
              <View style={styles.analyzingRow}>
                <ActivityIndicator color="#ffffff" />
                <Text style={styles.analyzeButtonText}>Evaluating Leaf Pathology...</Text>
              </View>
            ) : (
              <View style={styles.analyzingRow}>
                <Sparkles size={20} color="#ffffff" />
                <Text style={styles.analyzeButtonText}>Diagnose with AI Model</Text>
              </View>
            )}
          </TouchableOpacity>
        )}

        {/* Diagnosis Result Card */}
        {result && (
          <View style={[styles.resultCard, Shadows.lg]}>
            <View style={styles.resultHeader}>
              <View>
                <Text style={styles.resultLabel}>Diagnosis Result</Text>
                <Text style={styles.diseaseTitle}>{result.disease}</Text>
              </View>
              <StatusBadge status={result.disease} confidence={result.confidence} />
            </View>

            {/* Confidence Bar */}
            <View style={styles.confidenceSection}>
              <View style={styles.confidenceLabelRow}>
                <Text style={styles.confidenceLabel}>Confidence Score</Text>
                <Text style={styles.confidencePct}>{Math.round(result.confidence * 100)}%</Text>
              </View>
              <View style={styles.confidenceBarBg}>
                <View
                  style={[
                    styles.confidenceBarFill,
                    {
                      width: `${Math.round(result.confidence * 100)}%`,
                      backgroundColor:
                        result.disease === 'Healthy'
                          ? Colors.success
                          : result.disease.includes('Algal')
                          ? Colors.warning
                          : Colors.danger,
                    },
                  ]}
                />
              </View>
            </View>

            {/* Save to Tree Flow */}
            <View style={styles.saveSection}>
              <Text style={styles.saveSectionTitle}>Assign Scan to Tree Twin</Text>

              {/* Farm Picker Pills */}
              <Text style={styles.pickerLabel}>Select Orchard</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: Spacing.sm }}>
                {farms.map((f) => {
                  const isSelected = f._id === targetFarmId;
                  return (
                    <TouchableOpacity
                      key={f._id}
                      onPress={() => {
                        setTargetFarmId(f._id);
                        if (f.trees.length > 0) setTargetTreeId(f.trees[0].id);
                      }}
                      style={[styles.pill, isSelected && styles.pillActive]}
                    >
                      <Text style={[styles.pillText, isSelected && styles.pillTextActive]}>{f.name}</Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {/* Tree Picker Pills */}
              <Text style={styles.pickerLabel}>Select Tree ID</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: Spacing.md }}>
                {activeFarm?.trees.map((t) => {
                  const isSelected = t.id === targetTreeId;
                  return (
                    <TouchableOpacity
                      key={t.id}
                      onPress={() => setTargetTreeId(t.id)}
                      style={[styles.pill, isSelected && styles.pillActive]}
                    >
                      <Text style={[styles.pillText, isSelected && styles.pillTextActive]}>{t.id} ({t.cultivar.split(' ')[0]})</Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {isZeroConfidence && (
                <View style={styles.warningBox}>
                  <AlertTriangle size={16} color={Colors.danger} />
                  <Text style={styles.warningText}>
                    0% confidence: the model could not recognise this leaf. Retake a clearer photo to save a result.
                  </Text>
                </View>
              )}

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleSaveResult}
                disabled={savedSuccess || isZeroConfidence}
                style={[
                  styles.saveBtn,
                  savedSuccess && styles.saveBtnSuccess,
                  isZeroConfidence && styles.saveBtnDisabled,
                ]}
              >
                <Save size={18} color="#ffffff" />
                <Text style={styles.saveBtnText}>
                  {savedSuccess ? 'Scan Saved to Tree History' : 'Save Scan to Tree Profile'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
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
    marginBottom: Spacing.md,
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
  viewfinderCard: {
    backgroundColor: Colors.light.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.light.border,
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  reticleGuide: {
    alignItems: 'center',
    width: '100%',
    paddingVertical: Spacing.md,
  },
  reticleBox: {
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginBottom: Spacing.md,
  },
  corner: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderColor: Colors.primary,
  },
  cornerTL: { top: 0, left: 0, borderTopWidth: 3, borderLeftWidth: 3 },
  cornerTR: { top: 0, right: 0, borderTopWidth: 3, borderRightWidth: 3 },
  cornerBL: { bottom: 0, left: 0, borderBottomWidth: 3, borderLeftWidth: 3 },
  cornerBR: { bottom: 0, right: 0, borderBottomWidth: 3, borderRightWidth: 3 },
  reticleInstruction: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.light.text,
    marginBottom: 4,
  },
  reticleHint: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    width: '100%',
  },
  captureBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    gap: 8,
  },
  cameraBtn: {
    backgroundColor: Colors.primary,
  },
  galleryBtn: {
    backgroundColor: Colors.light.background,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  captureBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
  previewContainer: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  resetButton: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.65)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: BorderRadius.full,
    gap: 6,
  },
  resetButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  analyzeButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.xl,
    paddingVertical: Spacing.md + 2,
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  analyzingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  analyzeButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
  },
  resultCard: {
    backgroundColor: Colors.light.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.light.border,
    marginBottom: Spacing.lg,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  resultLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.light.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  diseaseTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: Colors.light.text,
    marginTop: 2,
  },
  confidenceSection: {
    marginBottom: Spacing.md,
  },
  confidenceLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  confidenceLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.light.textSecondary,
  },
  confidencePct: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.light.text,
  },
  confidenceBarBg: {
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.light.border,
    overflow: 'hidden',
  },
  confidenceBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  treatmentSection: {
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
    paddingTop: Spacing.md,
    marginBottom: Spacing.md,
  },
  sectionSubhead: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.light.text,
    marginBottom: 4,
  },
  diseaseDescription: {
    fontSize: 13,
    color: Colors.light.textSecondary,
    lineHeight: 18,
  },
  treatmentStepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginTop: 6,
  },
  treatmentStepText: {
    flex: 1,
    fontSize: 12,
    color: Colors.light.text,
    lineHeight: 17,
  },
  saveSection: {
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
    paddingTop: Spacing.md,
  },
  saveSectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.light.text,
    marginBottom: Spacing.sm,
  },
  pickerLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.light.textSecondary,
    marginBottom: 4,
  },
  pill: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.light.background,
    borderWidth: 1,
    borderColor: Colors.light.border,
    marginRight: Spacing.xs,
  },
  pillActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  pillText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.light.textSecondary,
  },
  pillTextActive: {
    color: '#ffffff',
  },
  saveBtn: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    gap: 8,
    marginTop: Spacing.sm,
  },
  saveBtnDisabled: {
    backgroundColor: Colors.light.border,
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.dangerLight,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  warningText: {
    flex: 1,
    color: Colors.danger,
    fontSize: 12,
    fontWeight: '600',
  },
  saveBtnSuccess: {
    backgroundColor: Colors.success,
  },
  saveBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },
});
