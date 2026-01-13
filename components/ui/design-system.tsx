import React from 'react';
import { View, Text, Pressable, StyleSheet, ViewStyle, TextStyle } from 'react-native';

// Design System Colors
export const colors = {
    // Primary greens
    primary: '#64b478',
    primaryDark: '#4a8a5b',
    primaryLight: '#a8d5b4',

    // Accent colors
    accentWater: '#66BBE6',
    accentMist: '#A3E0E0',
    accentFert: '#E6B08A',
    accentPink: '#F48FB1',
    accentPurple: '#CE93D8',
    accentOrange: '#FFB74D',
    accentCyan: '#66BBE6', // Aliased
    accentCoral: '#E6B08A', // Aliased
    accentAlert: '#F48FB1', // Aliased

    // Backgrounds
    backgroundLight: '#F8F9F8',
    backgroundDark: '#0f172a',
    surfaceLight: '#ffffff',
    surfaceDark: '#2c3630',

    // Neutrals
    gray50: '#f8fafc',
    gray100: '#f1f5f9',
    gray200: '#e2e8f0',
    gray300: '#cbd5e1',
    gray400: '#94a3b8',
    gray500: '#64748b',
    gray600: '#475569',
    gray700: '#334155',
    gray800: '#1e293b',
    gray900: '#131614', // Carbon Text from Guidelines
};

// Typography
export const typography = {
    fontFamily: {
        display: 'PlusJakartaSans-Bold',
        brand: 'PlusJakartaSans-SemiBold',
        body: 'PlusJakartaSans-Regular',
    },
    fontSize: {
        xs: 12,
        sm: 14,
        base: 16,
        lg: 18,
        xl: 20,
        '2xl': 24,
        '3xl': 30,
        '4xl': 36,
    },
    fontWeight: {
        normal: '400' as const,
        medium: '500' as const,
        semibold: '600' as const,
        bold: '700' as const,
    },
};

// Spacing
export const spacing = {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    '2xl': 32,
    '3xl': 48,
};

// Border Radius
export const borderRadius = {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    '2xl': 32,
    '3xl': 40,
    full: 9999,
};

// Shadows
export const shadows = {
    softGreen: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
        elevation: 10,
    },
    cardHover: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 20 },
        shadowOpacity: 0.25,
        shadowRadius: 30,
        elevation: 15,
    },
    vibrantPink: {
        shadowColor: colors.accentPink,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 15,
        elevation: 12,
    },
};

// Card Component
interface CardProps {
    children: React.ReactNode;
    style?: ViewStyle;
    onPress?: () => void;
}

export function Card({ children, style, onPress }: CardProps) {
    if (onPress) {
        return (
            <Pressable
                onPress={onPress}
                style={({ pressed }) => [
                    styles.card,
                    shadows.softGreen,
                    pressed && styles.cardPressed,
                    style,
                ]}
            >
                {children}
            </Pressable>
        );
    }

    return (
        <View
            style={[
                styles.card,
                shadows.softGreen,
                style,
            ]}
        >
            {children}
        </View>
    );
}

// Plant Card Component
interface PlantCardProps {
    name: string;
    species: string;
    image?: string;
    status: 'thirsty' | 'mist' | 'fertilize' | 'thriving' | 'growing' | 'struggling' | 'dormant' | 'dead';
    location?: string;
    onPress?: () => void;
}

const statusConfig = {
    thirsty: { label: 'THIRSTY', color: colors.accentWater },
    thriving: { label: 'THRIVING', color: colors.primary },
    mist: { label: 'MIST ME', color: colors.accentMist },
    growing: { label: 'GROWING', color: colors.accentPurple },
    fertilize: { label: 'FERTILIZE', color: colors.accentFert },
    struggling: { label: 'STRUGGLING', color: colors.accentPink },
    dormant: { label: 'DORMANT', color: colors.gray400 },
    dead: { label: 'REST IN BLOOM', color: colors.gray600 },
};

export function PlantCard({ name, species, status, location, onPress }: PlantCardProps) {
    const statusInfo = statusConfig[status];

    return (
        <Pressable
            onPress={onPress}
            style={({ pressed }) => [
                styles.plantCard,
                shadows.softGreen,
                pressed && styles.cardPressed,
            ]}
        >
            <View style={styles.plantCardImagePlaceholder}>
                {/* Status badge overlaid on image */}
                <View style={[styles.statusBadgeOverlay, { backgroundColor: statusInfo.color }]}>
                    <Text style={styles.statusBadgeText}>{statusInfo.label}</Text>
                </View>
                <Text style={styles.plantCardEmoji}>🌿</Text>
            </View>

            <View style={styles.plantCardContent}>
                <View style={styles.plantCardHeader}>
                    <Text style={styles.plantCardName}>{name}</Text>
                    <Text style={styles.plantCardArrow}>→</Text>
                </View>
                <Text style={styles.plantCardSpecies}>{species}</Text>

                {location && (
                    <View style={styles.plantCardLocation}>
                        <Text style={styles.locationDot}>📍</Text>
                        <Text style={styles.locationText}>{location}</Text>
                    </View>
                )}
            </View>
        </Pressable>
    );
}

// Status Badge Component
interface StatusBadgeProps {
    label: string;
    color: string;
    style?: ViewStyle;
}

export function StatusBadge({ label, color, style }: StatusBadgeProps) {
    return (
        <View style={[styles.statusBadge, { backgroundColor: color }, style]}>
            <Text style={styles.statusBadgeText}>{label}</Text>
        </View>
    );
}

// Filter Pill Component
interface FilterPillProps {
    label: string;
    active?: boolean;
    onPress?: () => void;
}

export function FilterPill({ label, active, onPress }: FilterPillProps) {
    return (
        <Pressable
            onPress={onPress}
            style={({ pressed }) => [
                styles.filterPill,
                active && styles.filterPillActive,
                pressed && styles.filterPillPressed,
            ]}
        >
            <Text style={[styles.filterPillText, active && styles.filterPillTextActive]}>
                {label}
            </Text>
        </Pressable>
    );
}

// Gradient Button Component
interface GradientButtonProps {
    label: string;
    onPress?: () => void;
    variant?: 'primary' | 'secondary';
    style?: ViewStyle;
}

export function GradientButton({ label, onPress, variant = 'primary', style }: GradientButtonProps) {
    return (
        <Pressable
            onPress={onPress}
            style={({ pressed }) => [
                styles.gradientButton,
                variant === 'primary' ? styles.gradientButtonPrimary : styles.gradientButtonSecondary,
                pressed && styles.buttonPressed,
                style,
            ]}
        >
            <Text style={styles.gradientButtonText}>{label}</Text>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    // Card styles
    card: {
        backgroundColor: colors.surfaceLight,
        borderRadius: borderRadius.xl,
        padding: spacing.lg,
        marginBottom: spacing.md,
    },
    cardPressed: {
        opacity: 0.9,
        transform: [{ scale: 0.98 }],
    },

    // Plant Card styles
    plantCard: {
        backgroundColor: colors.surfaceLight,
        borderRadius: borderRadius['2xl'],
        padding: spacing.lg,
        marginBottom: spacing.md,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    plantCardImagePlaceholder: {
        width: '100%',
        height: 160,
        backgroundColor: colors.gray100,
        borderRadius: borderRadius.lg,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.md,
        position: 'relative',
    },
    plantCardEmoji: {
        fontSize: 64,
    },
    plantCardContent: {
        gap: spacing.xs,
    },
    plantCardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    plantCardName: {
        fontSize: typography.fontSize.lg,
        fontFamily: typography.fontFamily.display,
        color: colors.gray900,
        flex: 1,
    },
    plantCardArrow: {
        fontSize: typography.fontSize.lg,
        color: colors.gray400,
    },
    plantCardSpecies: {
        fontSize: typography.fontSize.sm,
        color: colors.gray500,
        fontStyle: 'italic',
    },
    plantCardLocation: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        marginTop: spacing.xs,
    },
    locationDot: {
        fontSize: 12,
    },
    locationText: {
        fontSize: typography.fontSize.xs,
        color: colors.gray600,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    plantCardFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        marginTop: spacing.sm,
    },

    // Status Badge Overlay on Image
    statusBadgeOverlay: {
        position: 'absolute',
        top: spacing.md,
        left: spacing.md,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
        borderRadius: borderRadius.full,
        zIndex: 10,
    },

    // Health Badge
    healthBadge: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
        borderRadius: borderRadius.full,
    },
    healthBadgeText: {
        color: colors.surfaceLight,
        fontSize: typography.fontSize.xs,
        fontFamily: typography.fontFamily.brand,
    },

    // Water Badge
    waterBadge: {
        backgroundColor: colors.accentCyan + '20',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
        borderRadius: borderRadius.full,
    },
    waterBadgeText: {
        color: colors.accentCyan,
        fontSize: typography.fontSize.xs,
        fontFamily: typography.fontFamily.brand,
    },

    // Status Badge
    statusBadge: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
        borderRadius: borderRadius.full,
    },
    statusBadgeText: {
        color: colors.surfaceLight,
        fontSize: typography.fontSize.xs,
        fontFamily: typography.fontFamily.brand,
    },

    // Filter Pill
    filterPill: {
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.full,
        backgroundColor: colors.gray100,
        borderWidth: 1,
        borderColor: colors.gray200,
    },
    filterPillActive: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    filterPillPressed: {
        opacity: 0.8,
    },
    filterPillText: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.brand,
        color: colors.gray700,
    },
    filterPillTextActive: {
        color: colors.surfaceLight,
    },

    // Gradient Button
    gradientButton: {
        paddingHorizontal: spacing.xl,
        paddingVertical: spacing.lg,
        borderRadius: borderRadius.lg,
        alignItems: 'center',
    },
    gradientButtonPrimary: {
        backgroundColor: colors.primary,
    },
    gradientButtonSecondary: {
        backgroundColor: colors.gray700,
    },
    gradientButtonText: {
        color: colors.surfaceLight,
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.display,
    },
    buttonPressed: {
        opacity: 0.9,
    },
});
