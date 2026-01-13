import React from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import { colors, typography, spacing, borderRadius } from './design-system';

interface SeasonalBannerProps {
    onPress?: () => void;
}

export function SeasonalBanner({ onPress }: SeasonalBannerProps) {
    return (
        <Pressable
            onPress={onPress}
            style={({ pressed }) => [
                styles.container,
                pressed && styles.pressed,
            ]}
        >
            <View style={styles.content}>
                <View style={styles.textContainer}>
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>LIMITED EVENT</Text>
                    </View>
                    <Text style={styles.title}>Winter Bloom Celebration ❄️</Text>
                    <Text style={styles.subtitle}>
                        Collect winter-ready badges and get tips for low-light seasons.
                    </Text>
                </View>
                <View style={styles.iconContainer}>
                    <Text style={styles.icon}>🏆</Text>
                </View>
            </View>

            {/* Decorative blurred circles for glassmorphism/premium look */}
            <View style={[styles.decorCircle, styles.circle1]} />
            <View style={[styles.decorCircle, styles.circle2]} />
        </Pressable>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#FFD93D', // Yellow from design.md
        borderRadius: borderRadius.xl,
        padding: spacing.lg,
        marginBottom: spacing.xl,
        overflow: 'hidden',
        // Gradient effect via multiple background colors isn't native, 
        // but we can use background color and decorative elements.
        // For a real gradient we'd use expo-linear-gradient, but let's keep it simple and premium.
        shadowColor: '#FF6B6B', // Coral from design.md
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
        elevation: 8,
    },
    pressed: {
        transform: [{ scale: 0.98 }],
        opacity: 0.95,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        zIndex: 2, // Above decorative circles
    },
    textContainer: {
        flex: 1,
        paddingRight: spacing.md,
    },
    badge: {
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        alignSelf: 'flex-start',
        paddingHorizontal: spacing.sm,
        paddingVertical: 2,
        borderRadius: borderRadius.full,
        marginBottom: spacing.xs,
    },
    badgeText: {
        fontSize: 10,
        fontFamily: 'PlusJakartaSans-ExtraBold',
        color: '#2D5A27', // Forest Green
        letterSpacing: 1,
    },
    title: {
        fontSize: typography.fontSize.lg,
        color: '#2D5A27', // Forest Green
        fontFamily: 'PlusJakartaSans-ExtraBold',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: typography.fontSize.sm,
        color: 'rgba(45, 90, 39, 0.8)', // Forest Green with opacity
        fontFamily: 'PlusJakartaSans-Medium',
        lineHeight: 18,
    },
    iconContainer: {
        width: 60,
        height: 60,
        backgroundColor: 'rgba(255, 255, 255, 0.4)',
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    icon: {
        fontSize: 32,
    },
    decorCircle: {
        position: 'absolute',
        borderRadius: 100,
        zIndex: 1,
    },
    circle1: {
        width: 120,
        height: 120,
        backgroundColor: '#FF6B6B', // Coral
        top: -40,
        right: -20,
        opacity: 0.4,
    },
    circle2: {
        width: 80,
        height: 80,
        backgroundColor: '#B8A9E8', // Lavender
        bottom: -20,
        left: 20,
        opacity: 0.3,
    },
});
