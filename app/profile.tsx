import { useState } from "react";
import {
    View,
    Text,
    Pressable,
    ScrollView,
    StyleSheet,
    Switch,
    TextInput,
    Alert,
} from "react-native";
import { router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { Logo } from "@/components/ui/logo";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useApp, LEVEL_NAMES, XP_PER_LEVEL, calculateLevel, type Achievement } from "@/lib/store";
import { signOut } from "@/lib/auth";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

export default function ProfileScreen() {
    const { profile, preferences, achievements, updateProfile, updatePreferences } = useApp();
    const [isEditingName, setIsEditingName] = useState(false);
    const [editedName, setEditedName] = useState(profile.username);
    const [isSigningOut, setIsSigningOut] = useState(false);

    const triggerHaptic = () => {
        if (Platform.OS !== "web") {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
    };

    const { level, levelName, progress } = calculateLevel(profile.totalXP);
    const xpToNextLevel = XP_PER_LEVEL - (profile.totalXP % XP_PER_LEVEL);

    const handleSaveName = async () => {
        triggerHaptic();
        await updateProfile({ username: editedName });
        setIsEditingName(false);
    };

    const handleToggle = async (key: keyof typeof preferences, value: boolean) => {
        triggerHaptic();
        await updatePreferences({ [key]: value });
    };

    const handleSignOut = async () => {
        triggerHaptic();
        Alert.alert(
            "Sign Out",
            "Are you sure you want to sign out?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Sign Out",
                    style: "destructive",
                    onPress: async () => {
                        setIsSigningOut(true);
                        try {
                            await signOut();
                            router.replace("/auth/login");
                        } catch (error) {
                            console.error("Sign out error:", error);
                            Alert.alert("Error", "Failed to sign out. Please try again.");
                            setIsSigningOut(false);
                        }
                    },
                },
            ]
        );
    };

    const unlockedAchievements = achievements.filter((a) => a.unlockedAt);
    const lockedAchievements = achievements.filter((a) => !a.unlockedAt);

    const renderAchievementBadge = (achievement: Achievement) => {
        const isUnlocked = !!achievement.unlockedAt;
        return (
            <View
                key={achievement.id}
                style={[styles.achievementBadge, !isUnlocked && styles.achievementLocked]}
            >
                <Text style={[styles.achievementIcon, !isUnlocked && styles.achievementIconLocked]}>
                    {achievement.icon}
                </Text>
                <Text style={[styles.achievementName, !isUnlocked && styles.achievementNameLocked]} numberOfLines={1}>
                    {achievement.name}
                </Text>
                {achievement.target && !isUnlocked && (
                    <Text style={styles.achievementProgress}>
                        {achievement.progress || 0}/{achievement.target}
                    </Text>
                )}
            </View>
        );
    };

    return (
        <ScreenContainer containerClassName="bg-background">
            <ScrollView
                contentContainerStyle={styles.container}
                showsVerticalScrollIndicator={false}
            >
                {/* Logo Header */}
                <View style={styles.logoContainer}>
                    <Logo size="small" />
                </View>

                {/* Profile Header */}
                <View style={styles.profileHeader}>
                    <View style={styles.avatarContainer}>
                        <Text style={styles.avatarEmoji}>🌱</Text>
                        <View style={styles.levelBadge}>
                            <Text style={styles.levelBadgeText}>{level}</Text>
                        </View>
                    </View>

                    {isEditingName ? (
                        <View style={styles.editNameContainer}>
                            <TextInput
                                style={styles.nameInput}
                                value={editedName}
                                onChangeText={setEditedName}
                                autoFocus
                                returnKeyType="done"
                                onSubmitEditing={handleSaveName}
                            />
                            <Pressable onPress={handleSaveName} style={styles.saveButton}>
                                <Text style={styles.saveButtonText}>Save</Text>
                            </Pressable>
                        </View>
                    ) : (
                        <Pressable onPress={() => { triggerHaptic(); setIsEditingName(true); }}>
                            <Text style={styles.username}>{profile.username}</Text>
                        </Pressable>
                    )}

                    <Text style={styles.levelName}>{levelName}</Text>

                    {/* XP Progress */}
                    <View style={styles.xpContainer}>
                        <View style={styles.xpBar}>
                            <View style={[styles.xpProgress, { width: `${progress * 100}%` }]} />
                        </View>
                        <Text style={styles.xpText}>{xpToNextLevel} XP to next level</Text>
                    </View>

                    {/* Stats */}
                    <View style={styles.statsRow}>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{profile.totalPlantsAdded}</Text>
                            <Text style={styles.statLabel}>Plants</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{profile.currentStreak}</Text>
                            <Text style={styles.statLabel}>Day Streak</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{profile.tasksCompleted}</Text>
                            <Text style={styles.statLabel}>Tasks Done</Text>
                        </View>
                    </View>
                </View>

                {/* Achievements */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Achievements</Text>
                    <View style={styles.achievementsGrid}>
                        {unlockedAchievements.map(renderAchievementBadge)}
                        {lockedAchievements.map(renderAchievementBadge)}
                    </View>
                </View>

                {/* Notifications */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Notifications</Text>
                    <View style={styles.settingsCard}>
                        <View style={styles.settingRow}>
                            <View style={styles.settingInfo}>
                                <Text style={styles.settingLabel}>Push Notifications</Text>
                                <Text style={styles.settingDescription}>Get reminders for plant care</Text>
                            </View>
                            <Switch
                                value={preferences.notificationsEnabled}
                                onValueChange={(value) => handleToggle("notificationsEnabled", value)}
                                trackColor={{ false: "#e5e7eb", true: "#86efac" }}
                                thumbColor="#FFFFFF"
                            />
                        </View>
                        <View style={styles.settingDivider} />
                        <View style={styles.settingRow}>
                            <View style={styles.settingInfo}>
                                <Text style={styles.settingLabel}>Morning Reminders</Text>
                                <Text style={styles.settingDescription}>Daily care summary at 8am</Text>
                            </View>
                            <Switch
                                value={preferences.morningReminders}
                                onValueChange={(value) => handleToggle("morningReminders", value)}
                                trackColor={{ false: "#e5e7eb", true: "#86efac" }}
                                thumbColor="#FFFFFF"
                            />
                        </View>
                        <View style={styles.settingDivider} />
                        <View style={styles.settingRow}>
                            <View style={styles.settingInfo}>
                                <Text style={styles.settingLabel}>Weekly Summaries</Text>
                                <Text style={styles.settingDescription}>Your plant care recap</Text>
                            </View>
                            <Switch
                                value={preferences.weeklySummaries}
                                onValueChange={(value) => handleToggle("weeklySummaries", value)}
                                trackColor={{ false: "#e5e7eb", true: "#86efac" }}
                                thumbColor="#FFFFFF"
                            />
                        </View>
                    </View>
                </View>

                {/* Appearance */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Appearance</Text>
                    <View style={styles.settingsCard}>
                        <View style={styles.settingRow}>
                            <View style={styles.settingInfo}>
                                <Text style={styles.settingLabel}>High Contrast</Text>
                                <Text style={styles.settingDescription}>Increase text contrast</Text>
                            </View>
                            <Switch
                                value={preferences.highContrast}
                                onValueChange={(value) => handleToggle("highContrast", value)}
                                trackColor={{ false: "#e5e7eb", true: "#86efac" }}
                                thumbColor="#FFFFFF"
                            />
                        </View>
                        <View style={styles.settingDivider} />
                        <View style={styles.settingRow}>
                            <View style={styles.settingInfo}>
                                <Text style={styles.settingLabel}>Reduced Motion</Text>
                                <Text style={styles.settingDescription}>Minimize animations</Text>
                            </View>
                            <Switch
                                value={preferences.reducedMotion}
                                onValueChange={(value) => handleToggle("reducedMotion", value)}
                                trackColor={{ false: "#e5e7eb", true: "#86efac" }}
                                thumbColor="#FFFFFF"
                            />
                        </View>
                        <View style={styles.settingDivider} />
                        <View style={styles.settingRow}>
                            <View style={styles.settingInfo}>
                                <Text style={styles.settingLabel}>Haptic Feedback</Text>
                                <Text style={styles.settingDescription}>Vibration on interactions</Text>
                            </View>
                            <Switch
                                value={preferences.hapticFeedbackEnabled}
                                onValueChange={(value) => handleToggle("hapticFeedbackEnabled", value)}
                                trackColor={{ false: "#e5e7eb", true: "#86efac" }}
                                thumbColor="#FFFFFF"
                            />
                        </View>
                    </View>
                </View>

                {/* Units */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Units</Text>
                    <View style={styles.unitsRow}>
                        <Pressable
                            onPress={() => { triggerHaptic(); updatePreferences({ units: "metric" }); }}
                            style={[styles.unitButton, preferences.units === "metric" && styles.unitButtonActive]}
                        >
                            <Text style={[styles.unitText, preferences.units === "metric" && styles.unitTextActive]}>
                                Metric (cm)
                            </Text>
                        </Pressable>
                        <Pressable
                            onPress={() => { triggerHaptic(); updatePreferences({ units: "imperial" }); }}
                            style={[styles.unitButton, preferences.units === "imperial" && styles.unitButtonActive]}
                        >
                            <Text style={[styles.unitText, preferences.units === "imperial" && styles.unitTextActive]}>
                                Imperial (in)
                            </Text>
                        </Pressable>
                    </View>
                </View>

                {/* Sign Out Button */}
                <View style={styles.section}>
                    <Pressable
                        onPress={handleSignOut}
                        disabled={isSigningOut}
                        style={({ pressed }) => [
                            styles.signOutButton,
                            pressed && styles.signOutButtonPressed,
                            isSigningOut && styles.signOutButtonDisabled,
                        ]}
                    >
                        <Text style={styles.signOutButtonText}>
                            {isSigningOut ? "Signing Out..." : "Sign Out"}
                        </Text>
                    </Pressable>
                </View>

                {/* App Info */}
                <View style={styles.appInfo}>
                    <Text style={styles.appName}>Bloomie 🌱</Text>
                    <Text style={styles.appVersion}>Version 1.0.0</Text>
                    <Text style={styles.appTagline}>Made with 💚 for plant parents</Text>
                </View>
            </ScrollView>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 16,
        paddingBottom: 100,
    },
    logoContainer: {
        alignItems: "center",
        paddingVertical: 16,
    },
    profileHeader: {
        alignItems: "center",
        paddingVertical: 24,
        backgroundColor: "#FFFFFF",
        borderRadius: 24,
        marginBottom: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
    },
    avatarContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: "#f0fdf4",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 12,
        position: "relative",
    },
    avatarEmoji: {
        fontSize: 48,
    },
    levelBadge: {
        position: "absolute",
        bottom: 0,
        right: 0,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: "#4ade80",
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 3,
        borderColor: "#FFFFFF",
    },
    levelBadgeText: {
        fontSize: 14,
        fontWeight: "800",
        color: "#166534",
    },
    username: {
        fontSize: 24,
        fontWeight: "800",
        color: "#1f2937",
        marginBottom: 4,
    },
    editNameContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginBottom: 4,
    },
    nameInput: {
        fontSize: 24,
        fontWeight: "800",
        color: "#1f2937",
        borderBottomWidth: 2,
        borderBottomColor: "#4ade80",
        paddingVertical: 4,
        minWidth: 150,
        textAlign: "center",
    },
    saveButton: {
        backgroundColor: "#4ade80",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    saveButtonText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#166534",
    },
    levelName: {
        fontSize: 16,
        fontWeight: "600",
        color: "#4ade80",
        marginBottom: 16,
    },
    xpContainer: {
        width: "80%",
        marginBottom: 20,
    },
    xpBar: {
        height: 8,
        backgroundColor: "#e5e7eb",
        borderRadius: 4,
        overflow: "hidden",
        marginBottom: 6,
    },
    xpProgress: {
        height: "100%",
        backgroundColor: "#fbbf24",
        borderRadius: 4,
    },
    xpText: {
        fontSize: 12,
        color: "#6b7280",
        textAlign: "center",
    },
    statsRow: {
        flexDirection: "row",
        width: "100%",
        paddingHorizontal: 20,
    },
    statItem: {
        flex: 1,
        alignItems: "center",
    },
    statValue: {
        fontSize: 22,
        fontWeight: "800",
        color: "#166534",
    },
    statLabel: {
        fontSize: 12,
        color: "#6b7280",
        marginTop: 2,
    },
    statDivider: {
        width: 1,
        backgroundColor: "#e5e7eb",
        marginVertical: 4,
    },
    section: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#1f2937",
        marginBottom: 12,
    },
    achievementsGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 12,
    },
    achievementBadge: {
        width: "30%",
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        padding: 12,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
    },
    achievementLocked: {
        backgroundColor: "#f9fafb",
        opacity: 0.7,
    },
    achievementIcon: {
        fontSize: 28,
        marginBottom: 6,
    },
    achievementIconLocked: {
        opacity: 0.4,
    },
    achievementName: {
        fontSize: 11,
        fontWeight: "600",
        color: "#1f2937",
        textAlign: "center",
    },
    achievementNameLocked: {
        color: "#9ca3af",
    },
    achievementProgress: {
        fontSize: 10,
        color: "#9ca3af",
        marginTop: 2,
    },
    settingsCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
    },
    settingRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 16,
    },
    settingInfo: {
        flex: 1,
        marginRight: 12,
    },
    settingLabel: {
        fontSize: 16,
        fontWeight: "600",
        color: "#1f2937",
        marginBottom: 2,
    },
    settingDescription: {
        fontSize: 13,
        color: "#6b7280",
    },
    settingDivider: {
        height: 1,
        backgroundColor: "#e5e7eb",
        marginHorizontal: 16,
    },
    unitsRow: {
        flexDirection: "row",
        gap: 12,
    },
    unitButton: {
        flex: 1,
        paddingVertical: 14,
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        alignItems: "center",
        borderWidth: 2,
        borderColor: "#e5e7eb",
    },
    unitButtonActive: {
        borderColor: "#4ade80",
        backgroundColor: "#f0fdf4",
    },
    unitText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#6b7280",
    },
    unitTextActive: {
        color: "#166534",
    },
    signOutButton: {
        backgroundColor: "#ef4444",
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    signOutButtonPressed: {
        opacity: 0.8,
    },
    signOutButtonDisabled: {
        opacity: 0.5,
    },
    signOutButtonText: {
        fontSize: 16,
        fontWeight: "700",
        color: "#FFFFFF",
    },
    appInfo: {
        alignItems: "center",
        paddingVertical: 24,
    },
    appName: {
        fontSize: 18,
        fontWeight: "700",
        color: "#1f2937",
        marginBottom: 4,
    },
    appVersion: {
        fontSize: 13,
        color: "#9ca3af",
        marginBottom: 8,
    },
    appTagline: {
        fontSize: 14,
        color: "#4ade80",
        fontWeight: "600",
    },
});
