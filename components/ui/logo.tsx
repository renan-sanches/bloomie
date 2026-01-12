import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface LogoProps {
    size?: 'small' | 'medium' | 'large';
}

export function Logo({ size = 'medium' }: LogoProps) {
    const iconSize = size === 'small' ? 24 : size === 'large' ? 32 : 28;
    const textSize = size === 'small' ? 16 : size === 'large' ? 20 : 18;

    return (
        <View style={styles.container}>
            <Text style={[styles.icon, { fontSize: iconSize }]}>🪴</Text>
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
    icon: {
        color: '#4ade80', // primary green
    },
    text: {
        fontWeight: '700',
        color: '#0f172a', // gray-900
        letterSpacing: -0.5,
    },
});
