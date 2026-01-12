import { useState, useRef, useEffect } from "react";
import * as FileSystem from "expo-file-system/legacy";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Platform,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as Haptics from "expo-haptics";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useApp, type Plant } from "@/lib/store";
import { trpc } from "@/lib/trpc";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
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

  // Scanning animation
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
  }, [scanState, scanLineY, pulseScale]);

  const scanLineStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: scanLineY.value * 200 }],
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
    capturedPhotoUri = null;

    try {
      const photo = await cameraRef.current.takePictureAsync({
        base64: true,
        quality: 0.7,
      });

      if (!photo?.base64) {
        throw new Error("Failed to capture photo");
      }

      // Save the photo to app's document directory for persistent storage
      if (photo.uri && Platform.OS !== "web") {
        try {
          const fileName = `plant_${Date.now()}.jpg`;
          const destPath = `${FileSystem.documentDirectory}plants/${fileName}`;
          
          // Ensure directory exists
          const dirInfo = await FileSystem.getInfoAsync(`${FileSystem.documentDirectory}plants`);
          if (!dirInfo.exists) {
            await FileSystem.makeDirectoryAsync(`${FileSystem.documentDirectory}plants`, { intermediates: true });
          }
          
          // Copy photo to permanent location
          await FileSystem.copyAsync({
            from: photo.uri,
            to: destPath,
          });
          capturedPhotoUri = destPath;
        } catch (saveError) {
          console.warn("Failed to save photo locally:", saveError);
          // Fall back to original URI
          capturedPhotoUri = photo.uri;
        }
      } else if (photo.uri) {
        capturedPhotoUri = photo.uri;
      }

      if (mode === "identify") {
        const result = await identifyMutation.mutateAsync({
          imageBase64: photo.base64,
        });
        setIdentifyResult(result);
        setScanState(result.success ? "result" : "error");
      } else {
        const result = await diagnoseMutation.mutateAsync({
          imageBase64: photo.base64,
        });
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
      if (mode === "identify") {
        setIdentifyResult({
          success: false,
          error: error instanceof Error ? error.message : "Failed to analyze image",
        });
      } else {
        setHealthResult({
          success: false,
          error: error instanceof Error ? error.message : "Failed to analyze image",
        });
      }
    }
  };

  const handleAddPlant = () => {
    if (!identifyResult?.success || !identifyResult.commonName) return;

    triggerHaptic();

    const newPlant: Plant = {
      id: Date.now().toString(),
      nickname: identifyResult.commonName,
      species: identifyResult.commonName,
      scientificName: identifyResult.scientificName,
      photo: capturedPhotoUri || undefined, // Use the captured photo
      dateAdded: new Date().toISOString(),
      lastWatered: new Date().toISOString(),
      wateringFrequencyDays: 7,
      mistingFrequencyDays: 3,
      fertilizingFrequencyDays: 30,
      rotatingFrequencyDays: 7,
      healthScore: 100,
      hydrationLevel: 80,
      lightExposure: 70,
      humidityLevel: 60,
      personality: "chill-vibes",
      notes: identifyResult.description ? [identifyResult.description] : [],
      photos: capturedPhotoUri ? [{
        id: Date.now().toString(),
        uri: capturedPhotoUri,
        date: new Date().toISOString(),
        note: "Initial photo from plant identification",
      }] : [],
      careHistory: [],
      diagnosisHistory: [],
    };

    addPlant(newPlant);
    capturedPhotoUri = null;
    resetScan();

    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const resetScan = () => {
    setScanState("ready");
    setIdentifyResult(null);
    setHealthResult(null);
  };

  const toggleCamera = () => {
    triggerHaptic();
    setFacing((current) => (current === "back" ? "front" : "back"));
  };

  // Permission handling
  if (!permission) {
    return (
      <ScreenContainer className="items-center justify-center">
        <ActivityIndicator size="large" color="#A8E063" />
      </ScreenContainer>
    );
  }

  if (!permission.granted) {
    return (
      <ScreenContainer className="p-6">
        <View style={styles.permissionContainer}>
          <View style={styles.permissionIcon}>
            <Text style={styles.permissionEmoji}>📷</Text>
          </View>
          <Text style={styles.permissionTitle}>Camera Access Needed</Text>
          <Text style={styles.permissionText}>
            Bloomie needs camera access to identify your plants and check their health.
          </Text>
          <Pressable
            onPress={requestPermission}
            style={({ pressed }) => [
              styles.permissionButton,
              pressed && styles.buttonPressed,
            ]}
          >
            <Text style={styles.permissionButtonText}>Enable Camera</Text>
          </Pressable>
        </View>
      </ScreenContainer>
    );
  }

  // Result screen
  if (scanState === "result" || scanState === "error") {
    return (
      <ScreenContainer>
        <ScrollView contentContainerStyle={styles.resultContainer}>
          {/* Header */}
          <View style={styles.resultHeader}>
            <Pressable onPress={resetScan} style={styles.backButton}>
              <IconSymbol name="chevron.left" size={24} color="#2C3E50" />
            </Pressable>
            <Text style={styles.resultTitle}>
              {mode === "identify" ? "Plant Identified" : "Health Report"}
            </Text>
            <View style={{ width: 40 }} />
          </View>

          {mode === "identify" && identifyResult ? (
            identifyResult.success ? (
              <View style={styles.resultContent}>
                {/* Confidence badge */}
                <View style={styles.confidenceBadge}>
                  <Text style={styles.confidenceText}>
                    {identifyResult.confidence}% Match
                  </Text>
                </View>

                {/* Plant name */}
                <Text style={styles.plantName}>{identifyResult.commonName}</Text>
                <Text style={styles.scientificName}>
                  {identifyResult.scientificName}
                </Text>

                {/* Description */}
                <Text style={styles.description}>{identifyResult.description}</Text>

                {/* Care info cards */}
                <View style={styles.careGrid}>
                  <View style={styles.careCard}>
                    <Text style={styles.careIcon}>💧</Text>
                    <Text style={styles.careLabel}>Water</Text>
                    <Text style={styles.careValue}>{identifyResult.wateringFrequency}</Text>
                  </View>
                  <View style={styles.careCard}>
                    <Text style={styles.careIcon}>☀️</Text>
                    <Text style={styles.careLabel}>Light</Text>
                    <Text style={styles.careValue}>{identifyResult.lightRequirements}</Text>
                  </View>
                  <View style={styles.careCard}>
                    <Text style={styles.careIcon}>💨</Text>
                    <Text style={styles.careLabel}>Humidity</Text>
                    <Text style={styles.careValue}>{identifyResult.humidity}</Text>
                  </View>
                  <View style={styles.careCard}>
                    <Text style={styles.careIcon}>🎯</Text>
                    <Text style={styles.careLabel}>Difficulty</Text>
                    <Text style={styles.careValue}>
                      {identifyResult.careLevel === "easy"
                        ? "Beginner"
                        : identifyResult.careLevel === "moderate"
                        ? "Intermediate"
                        : "Expert"}
                    </Text>
                  </View>
                </View>

                {/* Toxicity warning */}
                {identifyResult.toxicity && (
                  <View
                    style={[
                      styles.toxicityBadge,
                      identifyResult.toxicity.toLowerCase().includes("non-toxic") ||
                      identifyResult.toxicity.toLowerCase().includes("safe")
                        ? styles.safeBadge
                        : styles.toxicBadge,
                    ]}
                  >
                    <Text style={styles.toxicityText}>
                      {identifyResult.toxicity.toLowerCase().includes("non-toxic") ||
                      identifyResult.toxicity.toLowerCase().includes("safe")
                        ? "🐾 Pet Safe"
                        : "⚠️ " + identifyResult.toxicity}
                    </Text>
                  </View>
                )}

                {/* Fun fact */}
                {identifyResult.funFact && (
                  <View style={styles.funFactCard}>
                    <Text style={styles.funFactLabel}>🌟 Fun Fact</Text>
                    <Text style={styles.funFactText}>{identifyResult.funFact}</Text>
                  </View>
                )}

                {/* Alternatives */}
                {identifyResult.alternatives && identifyResult.alternatives.length > 0 && (
                  <View style={styles.alternativesSection}>
                    <Text style={styles.alternativesTitle}>Could also be:</Text>
                    {identifyResult.alternatives.map((alt, index) => (
                      <View key={index} style={styles.alternativeItem}>
                        <Text style={styles.alternativeName}>{alt.commonName}</Text>
                        <Text style={styles.alternativeConfidence}>
                          {alt.confidence}%
                        </Text>
                      </View>
                    ))}
                  </View>
                )}

                {/* Add to collection button */}
                <Pressable
                  onPress={handleAddPlant}
                  style={({ pressed }) => [
                    styles.addButton,
                    pressed && styles.buttonPressed,
                  ]}
                >
                  <IconSymbol name="plus" size={20} color="#FFFFFF" />
                  <Text style={styles.addButtonText}>Add to My Jungle</Text>
                </Pressable>
              </View>
            ) : (
              <View style={styles.errorContent}>
                <Text style={styles.errorEmoji}>🔍</Text>
                <Text style={styles.errorTitle}>Couldn't Identify</Text>
                <Text style={styles.errorText}>
                  {identifyResult.error || "Try taking a clearer photo of the plant."}
                </Text>
              </View>
            )
          ) : mode === "diagnose" && healthResult ? (
            healthResult.success ? (
              <View style={styles.resultContent}>
                {/* Health score */}
                <View
                  style={[
                    styles.healthScoreBadge,
                    healthResult.overallHealth === "healthy"
                      ? styles.healthyBadge
                      : healthResult.overallHealth === "mild-issues"
                      ? styles.mildBadge
                      : healthResult.overallHealth === "moderate-issues"
                      ? styles.moderateBadge
                      : styles.severeBadge,
                  ]}
                >
                  <Text style={styles.healthScoreNumber}>
                    {healthResult.healthScore}%
                  </Text>
                  <Text style={styles.healthScoreLabel}>Health Score</Text>
                </View>

                {/* Status */}
                <Text style={styles.healthStatus}>
                  {healthResult.overallHealth === "healthy"
                    ? "🌟 Looking Great!"
                    : healthResult.overallHealth === "mild-issues"
                    ? "🌱 Minor Issues"
                    : healthResult.overallHealth === "moderate-issues"
                    ? "⚠️ Needs Attention"
                    : "🚨 Urgent Care Needed"}
                </Text>

                {/* Urgent action */}
                {healthResult.urgentAction && (
                  <View style={styles.urgentCard}>
                    <Text style={styles.urgentTitle}>⚡ Immediate Action</Text>
                    <Text style={styles.urgentText}>{healthResult.urgentAction}</Text>
                  </View>
                )}

                {/* Issues */}
                {healthResult.issues && healthResult.issues.length > 0 && (
                  <View style={styles.issuesSection}>
                    <Text style={styles.issuesTitle}>Issues Found</Text>
                    {healthResult.issues.map((issue, index) => (
                      <View key={index} style={styles.issueCard}>
                        <View style={styles.issueHeader}>
                          <Text style={styles.issueName}>{issue.name}</Text>
                          <View
                            style={[
                              styles.severityBadge,
                              issue.severity === "mild"
                                ? styles.mildSeverity
                                : issue.severity === "moderate"
                                ? styles.moderateSeverity
                                : styles.severeSeverity,
                            ]}
                          >
                            <Text style={styles.severityText}>{issue.severity}</Text>
                          </View>
                        </View>
                        <Text style={styles.issueDescription}>{issue.description}</Text>
                        <View style={styles.treatmentBox}>
                          <Text style={styles.treatmentLabel}>💊 Treatment:</Text>
                          <Text style={styles.treatmentText}>{issue.treatment}</Text>
                        </View>
                      </View>
                    ))}
                  </View>
                )}

                {/* Recommendations */}
                {healthResult.recommendations && healthResult.recommendations.length > 0 && (
                  <View style={styles.recommendationsSection}>
                    <Text style={styles.recommendationsTitle}>Recommendations</Text>
                    {healthResult.recommendations.map((rec, index) => (
                      <View key={index} style={styles.recommendationItem}>
                        <Text style={styles.recommendationBullet}>✓</Text>
                        <Text style={styles.recommendationText}>{rec}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            ) : (
              <View style={styles.errorContent}>
                <Text style={styles.errorEmoji}>🔬</Text>
                <Text style={styles.errorTitle}>Analysis Failed</Text>
                <Text style={styles.errorText}>
                  {healthResult.error || "Try taking a clearer photo of the plant."}
                </Text>
              </View>
            )
          ) : null}

          {/* Scan again button */}
          <Pressable
            onPress={resetScan}
            style={({ pressed }) => [
              styles.scanAgainButton,
              pressed && styles.buttonPressed,
            ]}
          >
            <Text style={styles.scanAgainText}>Scan Another Plant</Text>
          </Pressable>
        </ScrollView>
      </ScreenContainer>
    );
  }

  // Camera view
  return (
    <ScreenContainer edges={["left", "right"]}>
      <View style={styles.container}>
        {/* Camera */}
        <CameraView ref={cameraRef} style={styles.camera} facing={facing}>
          {/* Overlay */}
          <View style={styles.overlay}>
            {/* Top controls */}
            <View style={styles.topControls}>
              <Pressable
                onPress={toggleCamera}
                style={({ pressed }) => [
                  styles.iconButton,
                  pressed && styles.buttonPressed,
                ]}
              >
                <IconSymbol name="camera.rotate" size={24} color="#FFFFFF" />
              </Pressable>
            </View>

            {/* Scan frame */}
            <View style={styles.scanFrameContainer}>
              <Animated.View style={[styles.scanFrame, pulseStyle]}>
                <View style={[styles.corner, styles.topLeft]} />
                <View style={[styles.corner, styles.topRight]} />
                <View style={[styles.corner, styles.bottomLeft]} />
                <View style={[styles.corner, styles.bottomRight]} />

                {scanState === "scanning" && (
                  <Animated.View style={[styles.scanLine, scanLineStyle]} />
                )}
              </Animated.View>

              <Text style={styles.scanHint}>
                {scanState === "scanning"
                  ? mode === "identify"
                    ? "Identifying plant..."
                    : "Analyzing health..."
                  : mode === "identify"
                  ? "Position plant in frame"
                  : "Focus on problem area"}
              </Text>
            </View>

            {/* Mode selector */}
            <View style={styles.modeSelector}>
              <Pressable
                onPress={() => {
                  triggerHaptic();
                  setMode("identify");
                }}
                style={[
                  styles.modeButton,
                  mode === "identify" && styles.modeButtonActive,
                ]}
              >
                <Text
                  style={[
                    styles.modeButtonText,
                    mode === "identify" && styles.modeButtonTextActive,
                  ]}
                >
                  🔍 Identify
                </Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  triggerHaptic();
                  setMode("diagnose");
                }}
                style={[
                  styles.modeButton,
                  mode === "diagnose" && styles.modeButtonActive,
                ]}
              >
                <Text
                  style={[
                    styles.modeButtonText,
                    mode === "diagnose" && styles.modeButtonTextActive,
                  ]}
                >
                  🩺 Diagnose
                </Text>
              </Pressable>
            </View>

            {/* Capture button */}
            <View style={styles.captureContainer}>
              <Pressable
                onPress={handleCapture}
                disabled={scanState === "scanning"}
                style={({ pressed }) => [
                  styles.captureButton,
                  pressed && styles.captureButtonPressed,
                  scanState === "scanning" && styles.captureButtonDisabled,
                ]}
              >
                {scanState === "scanning" ? (
                  <ActivityIndicator size="large" color="#A8E063" />
                ) : (
                  <View style={styles.captureInner} />
                )}
              </Pressable>
            </View>
          </View>
        </CameraView>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  topControls: {
    flexDirection: "row",
    justifyContent: "flex-end",
    padding: 20,
    paddingTop: 60,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  scanFrameContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  scanFrame: {
    width: 280,
    height: 280,
    position: "relative",
  },
  corner: {
    position: "absolute",
    width: 40,
    height: 40,
    borderColor: "#A8E063",
    borderWidth: 4,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderTopLeftRadius: 12,
  },
  topRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
    borderTopRightRadius: 12,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderBottomLeftRadius: 12,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderBottomRightRadius: 12,
  },
  scanLine: {
    position: "absolute",
    left: 20,
    right: 20,
    height: 2,
    backgroundColor: "#A8E063",
    shadowColor: "#A8E063",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
  },
  scanHint: {
    marginTop: 24,
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "600",
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  modeSelector: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  modeButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  modeButtonActive: {
    backgroundColor: "#A8E063",
  },
  modeButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  modeButtonTextActive: {
    color: "#2D5A27",
  },
  captureContainer: {
    alignItems: "center",
    paddingBottom: 40,
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.3)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 4,
    borderColor: "#FFFFFF",
  },
  captureButtonPressed: {
    transform: [{ scale: 0.95 }],
  },
  captureButtonDisabled: {
    opacity: 0.7,
  },
  captureInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#FFFFFF",
  },
  buttonPressed: {
    transform: [{ scale: 0.97 }],
    opacity: 0.9,
  },
  // Permission styles
  permissionContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  permissionIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#F5FFF0",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  permissionEmoji: {
    fontSize: 48,
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#2C3E50",
    marginBottom: 12,
    textAlign: "center",
  },
  permissionText: {
    fontSize: 16,
    color: "#687076",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 32,
  },
  permissionButton: {
    backgroundColor: "#A8E063",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 28,
  },
  permissionButtonText: {
    fontSize: 17,
    fontWeight: "600",
    color: "#2D5A27",
  },
  // Result styles
  resultContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  resultHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2C3E50",
  },
  resultContent: {
    gap: 16,
  },
  confidenceBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#A8E063",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  confidenceText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2D5A27",
  },
  plantName: {
    fontSize: 28,
    fontWeight: "700",
    color: "#2C3E50",
  },
  scientificName: {
    fontSize: 16,
    fontStyle: "italic",
    color: "#687076",
    marginTop: -8,
  },
  description: {
    fontSize: 15,
    color: "#2C3E50",
    lineHeight: 22,
  },
  careGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 8,
  },
  careCard: {
    width: "47%",
    backgroundColor: "#F5FFF0",
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
  },
  careIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  careLabel: {
    fontSize: 13,
    color: "#687076",
    marginBottom: 4,
  },
  careValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2C3E50",
    textAlign: "center",
  },
  toxicityBadge: {
    alignSelf: "flex-start",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  safeBadge: {
    backgroundColor: "#E8F5E9",
  },
  toxicBadge: {
    backgroundColor: "#FFF3E0",
  },
  toxicityText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2C3E50",
  },
  funFactCard: {
    backgroundColor: "#FFF9E6",
    padding: 16,
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#FFD93D",
  },
  funFactLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#B8860B",
    marginBottom: 8,
  },
  funFactText: {
    fontSize: 14,
    color: "#2C3E50",
    lineHeight: 20,
  },
  alternativesSection: {
    marginTop: 8,
  },
  alternativesTitle: {
    fontSize: 14,
    color: "#687076",
    marginBottom: 8,
  },
  alternativeItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#E8E4DC",
  },
  alternativeName: {
    fontSize: 15,
    color: "#2C3E50",
  },
  alternativeConfidence: {
    fontSize: 14,
    color: "#687076",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#A8E063",
    paddingVertical: 16,
    borderRadius: 28,
    gap: 8,
    marginTop: 8,
  },
  addButtonText: {
    fontSize: 17,
    fontWeight: "600",
    color: "#2D5A27",
  },
  scanAgainButton: {
    alignItems: "center",
    paddingVertical: 16,
    marginTop: 16,
  },
  scanAgainText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#A8E063",
  },
  // Error styles
  errorContent: {
    alignItems: "center",
    paddingVertical: 40,
  },
  errorEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#2C3E50",
    marginBottom: 8,
  },
  errorText: {
    fontSize: 15,
    color: "#687076",
    textAlign: "center",
    lineHeight: 22,
  },
  // Health result styles
  healthScoreBadge: {
    alignSelf: "center",
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: "center",
    justifyContent: "center",
  },
  healthyBadge: {
    backgroundColor: "#E8F5E9",
  },
  mildBadge: {
    backgroundColor: "#FFF9E6",
  },
  moderateBadge: {
    backgroundColor: "#FFF3E0",
  },
  severeBadge: {
    backgroundColor: "#FFEBEE",
  },
  healthScoreNumber: {
    fontSize: 36,
    fontWeight: "700",
    color: "#2C3E50",
  },
  healthScoreLabel: {
    fontSize: 14,
    color: "#687076",
  },
  healthStatus: {
    fontSize: 22,
    fontWeight: "700",
    color: "#2C3E50",
    textAlign: "center",
  },
  urgentCard: {
    backgroundColor: "#FFEBEE",
    padding: 16,
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#EF5350",
  },
  urgentTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#C62828",
    marginBottom: 8,
  },
  urgentText: {
    fontSize: 14,
    color: "#2C3E50",
    lineHeight: 20,
  },
  issuesSection: {
    gap: 12,
  },
  issuesTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2C3E50",
  },
  issueCard: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E8E4DC",
    gap: 8,
  },
  issueHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  issueName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2C3E50",
    flex: 1,
  },
  severityBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  mildSeverity: {
    backgroundColor: "#FFF9E6",
  },
  moderateSeverity: {
    backgroundColor: "#FFF3E0",
  },
  severeSeverity: {
    backgroundColor: "#FFEBEE",
  },
  severityText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#2C3E50",
    textTransform: "capitalize",
  },
  issueDescription: {
    fontSize: 14,
    color: "#687076",
    lineHeight: 20,
  },
  treatmentBox: {
    backgroundColor: "#F5FFF0",
    padding: 12,
    borderRadius: 12,
  },
  treatmentLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#2D5A27",
    marginBottom: 4,
  },
  treatmentText: {
    fontSize: 14,
    color: "#2C3E50",
    lineHeight: 20,
  },
  recommendationsSection: {
    gap: 8,
  },
  recommendationsTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2C3E50",
  },
  recommendationItem: {
    flexDirection: "row",
    gap: 8,
  },
  recommendationBullet: {
    fontSize: 14,
    color: "#A8E063",
    fontWeight: "700",
  },
  recommendationText: {
    fontSize: 14,
    color: "#2C3E50",
    lineHeight: 20,
    flex: 1,
  },
});
