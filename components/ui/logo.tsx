import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { colors } from '@/components/ui/design-system';

interface LogoProps {
    size?: 'small' | 'medium' | 'large';
    variant?: 'default' | 'brand';
}

export function Logo({ size = 'medium', variant = 'default' }: LogoProps) {
    if (variant === 'brand') {
        return (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                <View
                    style={{
                        width: 56,
                        height: 56,
                        backgroundColor: colors.primary,
                        transform: [{ rotate: '-10deg' }],
                        borderRadius: 16,
                        alignItems: 'center',
                        justifyContent: 'center',
                        ...Platform.select({
                            ios: {
                                shadowColor: colors.primary,
                                shadowOffset: { width: 0, height: 4 },
                                shadowOpacity: 0.2,
                                shadowRadius: 8,
                            },
                            android: {
                                elevation: 8,
                            },
                            web: {
                                boxShadow: `0px 4px 16px rgba(100, 180, 120, 0.2)`,
                            }
                        })
                    }}
                >
                    {/* Using leaf.fill as eco icon - Material Symbols would require additional setup */}
                    <IconSymbol name="leaf.fill" size={30} color="white" />
                </View>
                <Text
                    style={{
                        fontFamily: 'PlusJakartaSans-ExtraBold',
                        fontSize: 28,
                        color: colors.gray900,
                        letterSpacing: -0.5
                    }}
                >
                    Bloomie
                </Text>
            </View>
        );
    }

    const iconSize = size === 'small' ? 24 : size === 'large' ? 32 : 28;
    const textSize = size === 'small' ? 16 : size === 'large' ? 20 : 18;

    return (
        <View style={styles.container}>
            <Ionicons name="leaf" size={iconSize} color="#64b478" />
            <Text style={[styles.text, { fontSize: textSize }]}>Bloomie</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    text: {
        fontFamily: 'PlusJakartaSans-Bold',
        color: '#0f172a', // gray-900
        letterSpacing: -0.5,
    },
});
