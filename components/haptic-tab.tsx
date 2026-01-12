import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

interface HapticTabProps {
    children: React.ReactNode;
    onPress?: () => void;
    onLongPress?: () => void;
    [key: string]: any;
}

export function HapticTab({ children, onPress, onLongPress, ...props }: HapticTabProps) {
    const handlePress = () => {
        if (Platform.OS !== 'web') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        onPress?.();
    };

    const handleLongPress = () => {
        if (Platform.OS !== 'web') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }
        onLongPress?.();
    };

    return (
        <Pressable
            onPress={handlePress}
            onLongPress={handleLongPress}
            {...props}
        >
            {children}
        </Pressable>
    );
}
