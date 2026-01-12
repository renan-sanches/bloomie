import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
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
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <View
                    style={{
                        width: 32,
                        height: 32,
                        backgroundColor: colors.primary,
                        transform: [{ rotate: '3deg' }],
                        borderRadius: 12,
                        alignItems: 'center',
                        justifyContent: 'center',
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 1 },
                        shadowOpacity: 0.1,
                        shadowRadius: 2,
                        elevation: 2,
                    }}
                >
                    <IconSymbol name="leaf.fill" size={20} color="white" />
                </View>
                <Text
                    style={{
                        fontFamily: 'PlusJakartaSans-ExtraBold',
                        fontSize: 20,
                        color: '#131614',
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
        fontWeight: '700',
        color: '#0f172a', // gray-900
        letterSpacing: -0.5,
    },
});
