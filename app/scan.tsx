import { useState, useRef, useEffect } from "react";
import * as FileSystem from "expo-file-system";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Platform,
  ActivityIndicator,
  ImageBackground,
  Dimensions,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as Haptics from "expo-haptics";
import { ScreenContainer } from "@/components/screen-container";
import { colors, borderRadius, typography } from "@/components/ui/design-system";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useApp, type Plant } from "@/lib/store";
import { trpc } from "@/lib/trpc";
import { router } from "expo-router";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
  withSpring,
  SlideInDown,
  FadeIn,
} from "react-native-reanimated";

type ScanMode = "identify" | "diagnose";
type ScanState = "ready" | "scanning" | "result" | "error";

// Store captured photo URI for adding to plant
let capturedPhotoUri: string | null = null;

type IdentificationResult = {
  success: boolean;
  confidence?: number;
  commonName?: string;
  scientificName?: string;
  description?: string;
  careLevel?: "easy" | "moderate" | "expert";
  lightRequirements?: string;
  wateringFrequency?: string;
  humidity?: string;
  toxicity?: string;
  funFact?: string;
  alternatives?: Array<{
    commonName: string;
    scientificName?: string;
    confidence: number;
  }>;
  error?: string;
};

type HealthResult = {
  success: boolean;
  overallHealth?: "healthy" | "mild-issues" | "moderate-issues" | "severe-issues";
  healthScore?: number;
  issues?: Array<{
    name: string;
    severity: "mild" | "moderate" | "severe";
    description: string;
    treatment: string;
  }>;
  recommendations?: string[];
  urgentAction?: string | null;
  error?: string;
};

const SCREEN_HEIGHT = Dimensions.get("window").height;

export default function ScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [mode, setMode] = useState<ScanMode>("identify");
  const [scanState, setScanState] = useState<ScanState>("ready");
  const [facing, setFacing] = useState<"front" | "back">("back");
  const [identifyResult, setIdentifyResult] = useState<IdentificationResult | null>(null);
  const [healthResult, setHealthResult] = useState<HealthResult | null>(null);
  const cameraRef = useRef<CameraView>(null);
  const { addPlant } = useApp();

  // tRPC mutations
  const identifyMutation = trpc.ai.identifyPlant.useMutation();
  const diagnoseMutation = trpc.ai.diagnosePlantHealth.useMutation();

  // Animations
  const scanLineY = useSharedValue(0);
  const pulseScale = useSharedValue(1);
  const resultSheetTranslateY = useSharedValue(SCREEN_HEIGHT);

  useEffect(() => {
    if (scanState === "scanning") {
      scanLineY.value = withRepeat(
        withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      );
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.1, { duration: 1000 }),
          withTiming(1, { duration: 1000 })
        ),
        -1
      );
    } else {
      scanLineY.value = 0;
      pulseScale.value = 1;
    }

    if (scanState === "result") {
      resultSheetTranslateY.value = withSpring(0, { damping: 15 });
    } else {
      resultSheetTranslateY.value = SCREEN_HEIGHT;
    }
  }, [scanState, scanLineY, pulseScale, resultSheetTranslateY]);

  const scanLineStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: scanLineY.value * 280 }],
  }));

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const resultSheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: resultSheetTranslateY.value }],
  }));

  const triggerHaptic = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  const handleCapture = async () => {
    if (!cameraRef.current || scanState === "scanning") return;

    triggerHaptic();
    setScanState("scanning");
    capturedPhotoUri = null;

    try {
      const photo = await cameraRef.current.takePictureAsync({
        base64: true,
        quality: 0.5,
        exif: false,
      });

      if (!photo?.base64) {
        throw new Error("Failed to capture photo");
      }

      // Save photo locally
      if (photo.uri && Platform.OS !== "web") {
        try {
          const fileName = `plant_${Date.now()}.jpg`;
          // @ts-ignore
          const destPath = `${FileSystem.documentDirectory}plants/${fileName}`;

          // @ts-ignore
          const dirInfo = await FileSystem.getInfoAsync(`${FileSystem.documentDirectory}plants`);
          if (!dirInfo.exists) {
            // @ts-ignore
            await FileSystem.makeDirectoryAsync(`${FileSystem.documentDirectory}plants`, { intermediates: true });
          }

          await FileSystem.copyAsync({ from: photo.uri, to: destPath });
          capturedPhotoUri = destPath;
        } catch (saveError) {
          console.warn("Failed to save photo locally:", saveError);
          capturedPhotoUri = photo.uri;
        }
      } else if (photo.uri) {
        capturedPhotoUri = photo.uri;
      }

      if (mode === "identify") {
        const result = await identifyMutation.mutateAsync({ imageBase64: photo.base64 });
        setIdentifyResult(result);
        setScanState(result.success ? "result" : "error");
      } else {
        const result = await diagnoseMutation.mutateAsync({ imageBase64: photo.base64 });
        setHealthResult(result);
        setScanState(result.success ? "result" : "error");
      }

      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (error) {
      console.error("Scan error:", error);
      setScanState("error");
      capturedPhotoUri = null;
    }
  };

  const handleAddPlant = async () => {
    if (!identifyResult?.success || !identifyResult.commonName) return;

    triggerHaptic();

    try {
      const newPlant: any = {
        nickname: identifyResult.commonName,
        species: identifyResult.commonName,
        scientificName: identifyResult.scientificName,
        photo: capturedPhotoUri || undefined,
        wateringFrequencyDays: 7, // Default, logic should be smarter
        mistingFrequencyDays: 3,
        fertilizingFrequencyDays: 30,
        notes: identifyResult.description ? [identifyResult.description] : [],
        location: 'Living Room',
      };

      // Add to store (and firestore)
      await addPlant(newPlant);
      
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      
      // Navigate to home or dashboard
      resetScan();
      router.push("/");
      
    } catch (e) {
      console.error("Error adding plant", e);
    }
  };

  const resetScan = () => {
    setScanState("ready");
    setIdentifyResult(null);
    setHealthResult(null);
  };

  // Permission handling
  if (!permission) return <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /></View>;
  if (!permission.granted) {
    return (
      <ScreenContainer containerClassName="p-6 justify-center items-center">
        <Text style={styles.permissionTitle}>Camera Access Needed</Text>
        <Pressable onPress={requestPermission} style={styles.permissionButton}>
          <Text style={styles.permissionButtonText}>Enable Camera</Text>
        </Pressable>
      </ScreenContainer>
    );
  }

  // Result View (Bottom Sheet)
  const renderResult = () => {
    if (scanState !== "result" && scanState !== "error") return null;

    const isDiagnose = mode === "diagnose";
    const data = isDiagnose ? healthResult : identifyResult;
    const success = data?.success;

    // Determine colors and content based on result
    const title = !success 
      ? "Scan Failed" 
      : isDiagnose 
        ? "Diagnosis Complete" 
        : "Plant Identified";
        
    const subtitle = !success
      ? (data?.error || "Could not analyze image")
      : isDiagnose
        ? (healthResult?.overallHealth === 'healthy' 
            ? "Your plant looks healthy and thriving!" 
            : healthResult?.issues?.[0]?.description || "Issues detected.")
        : (identifyResult?.description || "A beautiful addition to your collection.");

    const iconName = !success ? "exclamationmark.triangle.fill" : isDiagnose ? "heart.text.square.fill" : "leaf.fill";
    const iconColor = !success ? colors.error : isDiagnose ? colors.bloomiePink || "#FF4081" : colors.primary;
    
    // Background Image
    return (
      <View style={[StyleSheet.absoluteFill, { zIndex: 20 }]}>
        <ImageBackground 
          source={{ uri: capturedPhotoUri || undefined }} 
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
        >
          {/* Fallback for blur */}
          <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.6)' }]} />
          
          {/* Header Actions */}
          <View style={styles.resultHeader}>
             <Pressable onPress={resetScan} style={styles.closeButton}>
                <IconSymbol name="xmark" size={20} color="#fff" />
             </Pressable>
          </View>

          {/* Bottom Sheet */}
          <Animated.View style={[styles.bottomSheet, resultSheetStyle]}>
            <View style={styles.dragIndicator} />
            
            <View style={styles.sheetContent}>
              <Text style={styles.sheetTitle}>{title}</Text>
              
              <View style={styles.iconContainer}>
                 <View style={[styles.iconCircle, { backgroundColor: iconColor + '20' }]}>
                    <IconSymbol name={iconName} size={32} color={iconColor} />
                 </View>
                 {isDiagnose && healthResult?.overallHealth !== 'healthy' && (
                    <Text style={[styles.statusText, { color: iconColor }]}>
                       {healthResult?.issues?.[0]?.name || "Issue Detected"}
                    </Text>
                 )}
                 {mode === 'identify' && success && (
                    <Text style={styles.plantNameText}>{identifyResult?.commonName}</Text>
                 )}
              </View>

              <Text style={styles.sheetSubtitle}>{subtitle}</Text>

              <View style={styles.actionButtons}>
                 {mode === 'identify' && success && (
                   <Pressable 
                      style={[styles.actionButton, styles.primaryButton]}
                      onPress={handleAddPlant}
                   >
                      <IconSymbol name="plus.circle.fill" size={20} color="#fff" />
                      <Text style={styles.primaryButtonText}>Add to My Jungle</Text>
                   </Pressable>
                 )}
                 
                 {mode === 'diagnose' && success && (
                   <Pressable style={[styles.actionButton, styles.secondaryButton]}>
                      <IconSymbol name="bandage.fill" size={20} color="#fff" />
                      <Text style={styles.primaryButtonText}>How to fix it</Text>
                   </Pressable>
                 )}
                 
                 {!success && (
                   <Pressable 
                      style={[styles.actionButton, styles.primaryButton]}
                      onPress={resetScan}
                   >
                      <Text style={styles.primaryButtonText}>Try Again</Text>
                   </Pressable>
                 )}
              </View>
            </View>
          </Animated.View>
        </ImageBackground>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Camera View */}
      <CameraView ref={cameraRef} style={styles.camera} facing={facing}>
          {/* Overlay */}
          <View style={styles.overlay}>
            
            {/* Top Hint Pill */}
            <Animated.View entering={FadeIn.delay(500)} style={styles.topPillContainer}>
              <View style={styles.topPill}>
                <Text style={styles.topPillText}>
                   {mode === 'identify' ? "Center plant in frame" : "Focus on the issue"}
                </Text>
              </View>
            </Animated.View>

            {/* Scan Frame */}
            {scanState === "scanning" ? (
                <View style={styles.center}>
                   <Animated.View style={[styles.scanFrame, pulseStyle]}>
                      <View style={[styles.corner, styles.topLeft]} />
                      <View style={[styles.corner, styles.topRight]} />
                      <View style={[styles.corner, styles.bottomLeft]} />
                      <View style={[styles.corner, styles.bottomRight]} />
                      <Animated.View style={[styles.scanLine, scanLineStyle]} />
                   </Animated.View>
                   <Text style={styles.scanningText}>Scanning...</Text>
                </View>
            ) : (
                <View style={{ flex: 1 }} />
            )}

            {/* Bottom Controls */}
            {scanState !== "scanning" && (
                <View style={styles.bottomControls}>
                   <View style={styles.modeSelector}>
                      <Pressable 
                         onPress={() => { triggerHaptic(); setMode('identify'); }}
                         style={[styles.modePill, mode === 'identify' && styles.modePillActive]}
                      >
                         <Text style={[styles.modeText, mode === 'identify' && styles.modeTextActive]}>Identify</Text>
                      </Pressable>
                      <Pressable 
                         onPress={() => { triggerHaptic(); setMode('diagnose'); }}
                         style={[styles.modePill, mode === 'diagnose' && styles.modePillActive]}
                      >
                         <Text style={[styles.modeText, mode === 'diagnose' && styles.modeTextActive]}>Diagnose</Text>
                      </Pressable>
                   </View>

                   <View style={styles.captureRow}>
                      <View style={{ width: 40 }} /> 
                      <Pressable onPress={handleCapture} style={styles.shutterOuter}>
                         <View style={styles.shutterInner} />
                      </Pressable>
                      <Pressable style={styles.galleryButton}>
                         <IconSymbol name="photo.fill" size={24} color="#fff" />
                      </Pressable>
                   </View>
                </View>
            )}
          </View>
      </CameraView>
      
      {/* Result Layer */}
      {renderResult()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  camera: { flex: 1 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.1)', justifyContent: 'space-between', paddingBottom: 40 },
  
  topPillContainer: { alignItems: 'center', marginTop: 60 },
  topPill: { backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  topPillText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  
  scanFrame: { width: 280, height: 280, position: 'relative' },
  corner: { position: 'absolute', width: 40, height: 40, borderColor: colors.accentCyan || '#00E5FF', borderWidth: 4, borderRadius: 12 },
  topLeft: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0 },
  topRight: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0 },
  bottomLeft: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0 },
  bottomRight: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0 },
  scanLine: { position: 'absolute', left: 0, right: 0, height: 2, backgroundColor: colors.accentCyan || '#00E5FF', shadowColor: colors.accentCyan || '#00E5FF', shadowOpacity: 0.8, shadowRadius: 10, shadowOffset: { width: 0, height: 0 } },
  scanningText: { color: '#fff', marginTop: 20, fontSize: 18, fontWeight: '600', letterSpacing: 1 },
  
  bottomControls: { alignItems: 'center', gap: 30 },
  modeSelector: { flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 30, padding: 4 },
  modePill: { paddingVertical: 8, paddingHorizontal: 20, borderRadius: 24 },
  modePillActive: { backgroundColor: '#fff' },
  modeText: { color: '#fff', fontWeight: '600' },
  modeTextActive: { color: '#000' },
  
  captureRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', paddingHorizontal: 40 },
  shutterOuter: { width: 80, height: 80, borderRadius: 40, borderWidth: 4, borderColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  shutterInner: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#fff' },
  galleryButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20 },

  // Result Styles
  resultHeader: { paddingTop: 60, paddingHorizontal: 20, alignItems: 'flex-end' },
  closeButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.3)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  
  bottomSheet: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: colors.surfaceLight || '#FCFAF7',
    borderTopLeftRadius: 32, borderTopRightRadius: 32,
    paddingTop: 12, paddingBottom: 40, paddingHorizontal: 24,
    shadowColor: "#000", shadowOffset: { width: 0, height: -10 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 10
  },
  dragIndicator: { width: 48, height: 6, backgroundColor: '#E0E0E0', borderRadius: 3, alignSelf: 'center', marginBottom: 24 },
  sheetContent: { alignItems: 'center' },
  sheetTitle: { fontSize: 24, fontWeight: '800', color: '#121714', marginBottom: 24, textAlign: 'center' },
  
  iconContainer: { alignItems: 'center', gap: 12, marginBottom: 24 },
  iconCircle: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  statusText: { fontSize: 20, fontWeight: '700' },
  plantNameText: { fontSize: 24, fontWeight: '700', color: colors.gray900 },
  
  sheetSubtitle: { fontSize: 16, color: '#678375', textAlign: 'center', lineHeight: 24, fontWeight: '500', marginBottom: 32 },
  
  actionButtons: { width: '100%', gap: 12 },
  actionButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 18, borderRadius: 30, gap: 10 },
  primaryButton: { backgroundColor: colors.bloomieLime || '#8BC34A', shadowColor: '#8BC34A', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8 },
  secondaryButton: { backgroundColor: colors.bloomieOrange || '#FF9800', shadowColor: '#FF9800', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8 },
  primaryButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  // Permission
  permissionTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 16, color: '#fff' },
  permissionButton: { backgroundColor: colors.primary, padding: 16, borderRadius: 12 },
  permissionButtonText: { color: '#fff', fontWeight: 'bold' },
});
