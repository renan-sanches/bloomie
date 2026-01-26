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
import { colors } from "@/components/ui/design-system";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useApp } from "@/lib/store";
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
  FadeIn,
} from "react-native-reanimated";

type ScanMode = "identify" | "diagnose";
type ScanState = "ready" | "scanning" | "result" | "error";

const SCREEN_HEIGHT = Dimensions.get("window").height;

export default function ScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [mode, setMode] = useState<ScanMode>("identify");
  const [scanState, setScanState] = useState<ScanState>("ready");
  const [progress, setProgress] = useState(0);
  const [identifyResult, setIdentifyResult] = useState<any>(null);
  const [healthResult, setHealthResult] = useState<any>(null);
  const cameraRef = useRef<CameraView>(null);
  const { addPlant } = useApp();

  const identifyMutation = trpc.ai.identifyPlant.useMutation();
  const diagnoseMutation = trpc.ai.diagnosePlantHealth.useMutation();

  const scanLineY = useSharedValue(0);
  const pulseScale = useSharedValue(1);

  useEffect(() => {
    if (scanState === "scanning") {
      scanLineY.value = withRepeat(
        withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      );
      pulseScale.value = withRepeat(
        withSequence(withTiming(1.05, { duration: 1000 }), withTiming(1, { duration: 1000 })),
        -1
      );

      // Simulate progress
      const interval = setInterval(() => {
        setProgress(p => (p < 90 ? p + Math.random() * 10 : p));
      }, 300);
      return () => clearInterval(interval);
    } else {
      scanLineY.value = 0;
      pulseScale.value = 1;
      setProgress(0);
    }
  }, [scanState]);

  const scanLineStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: scanLineY.value * 280 }],
  }));

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
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

    try {
      const photo = await cameraRef.current.takePictureAsync({
        base64: true,
        quality: 0.5,
      });

      if (!photo?.base64) throw new Error("Capture failed");

      if (mode === "identify") {
        const result = await identifyMutation.mutateAsync({ imageBase64: photo.base64 });
        setIdentifyResult(result);
        setProgress(100);
        setTimeout(() => setScanState(result.success ? "result" : "error"), 500);
      } else {
        const result = await diagnoseMutation.mutateAsync({ imageBase64: photo.base64 });
        setHealthResult(result);
        setProgress(100);
        setTimeout(() => setScanState(result.success ? "result" : "error"), 500);
      }
    } catch (error) {
      console.error(error);
      setScanState("error");
    }
  };

  const resetScan = () => {
    setScanState("ready");
    setIdentifyResult(null);
    setHealthResult(null);
    setProgress(0);
  };

  if (!permission) return <View style={styles.center}><ActivityIndicator /></View>;
  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text>Need camera permission</Text>
        <Pressable onPress={requestPermission}><Text>Grant</Text></Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView ref={cameraRef} style={styles.camera} facing="back">
        <View style={styles.overlay}>
          {/* Top Bar */}
          <View style={styles.topBar}>
            <Link href="/" asChild>
              <Pressable style={styles.logoBox}>
                <IconSymbol name="leaf.fill" size={20} color="#6366f1" />
                <Text style={styles.logoText}>Bloomie</Text>
              </Pressable>
            </Link>
          </View>

          {/* Center Hint */}
          <View style={styles.hintContainer}>
            <View style={styles.hintPill}>
              <Text style={styles.hintText}>Center leaf in frame</Text>
            </View>
          </View>

          {/* Scan Frame */}
          <View style={styles.frameContainer}>
            <Animated.View style={[styles.scanFrame, pulseStyle]}>
              <View style={[styles.corner, styles.topLeft]} />
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />
              {scanState === 'scanning' && <Animated.View style={[styles.scanLine, scanLineStyle]} />}
            </Animated.View>
          </View>

          {/* Scanning Progress - Design from screen.png */}
          {scanState === 'scanning' && (
            <Animated.View entering={FadeIn} style={styles.progressSheet}>
              <View style={styles.sheetHeader}>
                <View style={styles.aiIcon}>
                  <IconSymbol name="brain.head.profile" size={24} color="#06b6d4" />
                </View>
                <View>
                  <Text style={styles.sheetTitle}>Scanning...</Text>
                  <Text style={styles.sheetSubtitle}>AI PROCESSING</Text>
                </View>
              </View>

              <View style={styles.progressContainer}>
                <View style={styles.progressLabels}>
                  <Text style={styles.progressText}>Analyzing patterns</Text>
                  <Text style={styles.percentageText}>{Math.round(progress)}%</Text>
                </View>
                <View style={styles.progressBarBg}>
                  <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
                </View>
              </View>

              <Pressable style={styles.galleryBtn}>
                <IconSymbol name="photo.on.rectangle.angled" size={18} color="#fff" />
                <Text style={styles.galleryBtnText}>Upload from Gallery</Text>
              </Pressable>
            </Animated.View>
          )}

          {/* Results Sheet - Design from screen.png (result) */}
          {scanState === 'result' && (
            <Animated.View entering={FadeIn} style={styles.resultSheet}>
              <View style={styles.dragIndicator} />
              <Text style={styles.resTitle}>Diagnosis Complete</Text>

              <View style={styles.resIconCircle}>
                <View style={styles.resIconInner}>
                  <IconSymbol
                    name={mode === 'diagnose' ? "drop.fill" : "leaf.fill"}
                    size={32}
                    color={mode === 'diagnose' ? "#f43f5e" : "#10b981"}
                  />
                </View>
              </View>

              <Text style={[styles.resSubject, { color: mode === 'diagnose' ? '#f43f5e' : '#10b981' }]}>
                {mode === 'diagnose' ? "Root Rot Detected" : identifyResult?.commonName}
              </Text>

              <Text style={styles.resDescription}>
                {mode === 'diagnose'
                  ? "It looks like your plant is suffering from overwatering. The roots are struggling to breathe, but don't worry—we can save it!"
                  : identifyResult?.description}
              </Text>

              <View style={styles.resActions}>
                {mode === 'diagnose' && (
                  <Pressable style={styles.howToFixBtn}>
                    <IconSymbol name="bandage.fill" size={18} color="#fff" />
                    <Text style={styles.btnText}>How to fix it</Text>
                  </Pressable>
                )}
                <Pressable style={styles.addToJungleBtn} onPress={() => router.push('/')}>
                  <IconSymbol name="plus.circle.fill" size={18} color="#fff" />
                  <Text style={styles.btnText}>Add to My Jungle</Text>
                </Pressable>
                <Pressable style={styles.cancelBtn} onPress={resetScan}>
                  <Text style={styles.cancelBtnText}>Discard</Text>
                </Pressable>
              </View>
            </Animated.View>
          )}

          {/* Initial Capture Controls */}
          {scanState === 'ready' && (
            <View style={styles.captureContainer}>
              <Pressable style={styles.shutterBtn} onPress={handleCapture}>
                <View style={styles.shutterInner} />
              </Pressable>
            </View>
          )}

        </View>
      </CameraView>
    </View>
  );
}

import { Link } from "expo-router";

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  camera: { flex: 1 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.1)' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  topBar: {
    paddingTop: 60,
    paddingHorizontal: 32,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  logoText: {
    fontSize: 18,
    fontWeight: '900',
    fontFamily: 'PlusJakartaSans-ExtraBold',
    color: '#1e293b',
  },

  hintContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  hintPill: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  hintText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },

  frameContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 100,
  },
  scanFrame: {
    width: 280,
    height: 280,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: '#06b6d4',
    borderWidth: 4,
    borderRadius: 16,
  },
  topLeft: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0 },
  topRight: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0 },
  bottomLeft: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0 },
  bottomRight: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0 },
  scanLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#06b6d4',
    shadowColor: '#06b6d4',
    shadowOpacity: 1,
    shadowRadius: 15,
  },

  progressSheet: {
    position: 'absolute',
    bottom: 40,
    left: 40,
    right: 40,
    backgroundColor: '#fff',
    borderRadius: 32,
    padding: 32,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 30,
    elevation: 10,
    gap: 24,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  aiIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#ecfeff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetTitle: {
    fontSize: 22,
    fontWeight: '900',
    fontFamily: 'PlusJakartaSans-ExtraBold',
    color: '#1e293b',
  },
  sheetSubtitle: {
    fontSize: 11,
    fontWeight: '900',
    color: '#06b6d4',
    letterSpacing: 0.5,
  },
  progressContainer: {
    gap: 12,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressText: {
    fontSize: 14,
    color: '#64748b',
    fontFamily: 'PlusJakartaSans-Medium',
  },
  percentageText: {
    fontSize: 16,
    fontWeight: '800',
    fontFamily: 'PlusJakartaSans-ExtraBold',
    color: '#1e293b',
  },
  progressBarBg: {
    height: 12,
    backgroundColor: '#f1f5f9',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#8b5cf6', // Purple gradient in design
    borderRadius: 6,
  },
  galleryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#8b5cf6',
    paddingVertical: 18,
    borderRadius: 20,
  },
  galleryBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
    fontFamily: 'PlusJakartaSans-ExtraBold',
  },

  resultSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    padding: 40,
    alignItems: 'center',
    gap: 20,
  },
  dragIndicator: {
    width: 48,
    height: 6,
    backgroundColor: '#e2e8f0',
    borderRadius: 3,
    marginBottom: 10,
  },
  resTitle: {
    fontSize: 24,
    fontWeight: '900',
    fontFamily: 'PlusJakartaSans-ExtraBold',
    color: '#1e293b',
  },
  resIconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#fff1f2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resIconInner: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#ffe4e6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resSubject: {
    fontSize: 20,
    fontWeight: '900',
    fontFamily: 'PlusJakartaSans-ExtraBold',
  },
  resDescription: {
    fontSize: 15,
    lineHeight: 24,
    textAlign: 'center',
    color: '#64748b',
    fontFamily: 'PlusJakartaSans-Medium',
    paddingHorizontal: 20,
  },
  resActions: {
    width: '100%',
    gap: 12,
    marginTop: 10,
  },
  howToFixBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#f59e0b',
    paddingVertical: 18,
    borderRadius: 20,
  },
  addToJungleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#84cc16',
    paddingVertical: 18,
    borderRadius: 20,
  },
  btnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
    fontFamily: 'PlusJakartaSans-ExtraBold',
  },
  cancelBtn: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#94a3b8',
  },

  captureContainer: {
    position: 'absolute',
    bottom: 60,
    alignSelf: 'center',
  },
  shutterBtn: {
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 5,
    borderColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shutterInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#fff',
  },
} as any);
