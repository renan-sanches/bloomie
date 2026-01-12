import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface LogoProps {
    size?: 'small' | 'medium' | 'large';
}

export function Logo({ size = 'medium' }: LogoProps) {
    const iconSize = size === 'small' ? 32 : size === 'large' ? 56 : 44;
    const textSize = size === 'small' ? 20 : size === 'large' ? 32 : 24;
    const emojiSize = size === 'small' ? 20 : size === 'large' ? 36 : 28;

    return (
        <View style={styles.container}>
            <View style={[styles.icon, { width: iconSize, height: iconSize, borderRadius: iconSize * 0.36 }]}>
                <Text style={[styles.emoji, { fontSize: emojiSize }]}>🪴</Text>
            </View>
            <Text style={[styles.text, { fontSize: textSize }]}>Bloomie</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    icon: {
        backgroundColor: '#4ade8020',
        justifyContent: 'center',
        alignItems: 'center',
    },
    emoji: {
        lineHeight: undefined, // Let native handle lineHeight for emoji
    },
    text: {
        fontWeight: '700',
        color: '#0f172a',
        letterSpacing: -0.5,
    },
});
