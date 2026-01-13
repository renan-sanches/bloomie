import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors, spacing, borderRadius, typography } from './design-system';
import { IconSymbol } from './icon-symbol';
import { Plant, useApp } from '@/lib/store';

interface SmartScheduleSuggestionsProps {
    plant: Plant;
}

export function SmartScheduleSuggestions({ plant }: SmartScheduleSuggestionsProps) {
    const { updatePlant } = useApp();

    // Logic for suggestions
    const getSuggestions = () => {
        const suggestions = [];
        const now = new Date();
        const month = now.getMonth(); // 0-11
        const isWinter = month === 11 || month === 0 || month === 1; // Dec, Jan, Feb

        // 1. Seasonality Suggestion
        if (isWinter && plant.wateringFrequencyDays < 10) {
            suggestions.push({
                id: 'winter-dormancy',
                title: 'Winter Dormancy',
                description: `Plants grow slower in winter. Suggest increasing watering interval to 10 days.`,
                icon: 'snowflake',
                actionLabel: 'Adjust to 10 days',
                onApply: () => updatePlant(plant.id, { wateringFrequencyDays: 10 }),
                color: colors.accentCyan,
            });
        }

        // 2. Thirsty Trend Suggestion
        const thirstyEvents = plant.careHistory.filter(e => e.type === 'water' && e.note?.toLowerCase().includes('thirsty'));
        if (thirstyEvents.length >= 2 && plant.wateringFrequencyDays > 3) {
            const newFreq = Math.max(3, plant.wateringFrequencyDays - 2);
            suggestions.push({
                id: 'more-water',
                title: 'Thirsty Trend',
                description: `${plant.nickname} seems thirsty often. Suggest watering every ${newFreq} days instead of ${plant.wateringFrequencyDays}.`,
                icon: 'drop.fill',
                actionLabel: `Set to ${newFreq} days`,
                onApply: () => updatePlant(plant.id, { wateringFrequencyDays: newFreq }),
                color: colors.accentPink,
            });
        }

        // 3. Historical Average Tuning
        const waterEvents = plant.careHistory.filter(e => e.type === 'water');
        if (waterEvents.length >= 3) {
            const last3 = waterEvents.slice(-3);
            const intervals = [];
            for (let i = 1; i < last3.length; i++) {
                const diff = (new Date(last3[i].date).getTime() - new Date(last3[i - 1].date).getTime()) / (1000 * 3600 * 24);
                intervals.push(diff);
            }
            const avgInterval = Math.round(intervals.reduce((a, b) => a + b, 0) / intervals.length);
            if (avgInterval > 0 && Math.abs(avgInterval - plant.wateringFrequencyDays) >= 2 && avgInterval <= 30) {
                suggestions.push({
                    id: 'historical-tune',
                    title: 'Care Pattern Detected',
                    description: `Based on your recent logs, you water every ${avgInterval} days. Sync your schedule?`,
                    icon: 'calendar',
                    actionLabel: `Set to ${avgInterval} days`,
                    onApply: () => updatePlant(plant.id, { wateringFrequencyDays: avgInterval }),
                    color: colors.primary,
                });
            }
        }

        // 4. High Health Stability
        if (plant.healthScore > 95 && plant.careHistory.length > 5 && suggestions.length === 0) {
            suggestions.push({
                id: 'perfect-balance',
                title: 'Perfect Balance',
                description: 'Your current schedule is working perfectly! No changes needed.',
                icon: 'checkmark.seal.fill',
                actionLabel: 'Keep as is',
                onApply: null,
                color: colors.primary,
            });
        }

        return suggestions;
    };

    const suggestions = getSuggestions();

    if (suggestions.length === 0) return null;

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <IconSymbol name="sparkles" size={20} color={colors.primary} />
                <Text style={styles.title}>Smart Suggestions</Text>
            </View>

            {suggestions.map((suggestion) => (
                <View key={suggestion.id} style={[styles.card, { borderColor: suggestion.color + '30' }]}>
                    <View style={styles.cardHeader}>
                        <View style={[styles.iconContainer, { backgroundColor: suggestion.color + '15' }]}>
                            <IconSymbol name={suggestion.icon as any} size={20} color={suggestion.color} />
                        </View>
                        <View style={styles.textContainer}>
                            <Text style={styles.suggestionTitle}>{suggestion.title}</Text>
                            <Text style={styles.suggestionDesc}>{suggestion.description}</Text>
                        </View>
                    </View>

                    {suggestion.onApply && (
                        <Pressable
                            onPress={() => suggestion.onApply && suggestion.onApply()}
                            style={({ pressed }) => [
                                styles.applyButton,
                                { backgroundColor: suggestion.color },
                                pressed && styles.pressed
                            ]}
                        >
                            <Text style={styles.applyButtonText}>{suggestion.actionLabel}</Text>
                        </Pressable>
                    )}
                </View>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginTop: spacing.xl,
        paddingHorizontal: spacing.lg,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        marginBottom: spacing.md,
    },
    title: {
        fontSize: typography.fontSize.lg,
        fontFamily: typography.fontFamily.display,
        color: colors.gray900,
    },
    card: {
        backgroundColor: colors.surfaceLight,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        borderWidth: 1,
        marginBottom: spacing.md,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        gap: spacing.md,
        marginBottom: spacing.md,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    textContainer: {
        flex: 1,
    },
    suggestionTitle: {
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.display,
        color: colors.gray900,
        marginBottom: 2,
    },
    suggestionDesc: {
        fontSize: typography.fontSize.sm,
        color: colors.gray600,
        lineHeight: 18,
    },
    applyButton: {
        paddingVertical: 10,
        borderRadius: borderRadius.md,
        alignItems: 'center',
    },
    applyButtonText: {
        color: colors.surfaceLight,
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.display,
    },
    pressed: {
        opacity: 0.8,
        transform: [{ scale: 0.98 }],
    },
});
