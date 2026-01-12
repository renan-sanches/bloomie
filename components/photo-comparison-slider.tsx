import React, { useState } from 'react';
import { View, StyleSheet, Dimensions, Platform } from 'react-native';
import { Image } from 'expo-image';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    runOnJS
} from 'react-native-reanimated';
import { colors, borderRadius } from '@/components/ui/design-system';
import * as Haptics from 'expo-haptics';

interface PhotoComparisonSliderProps {
    beforeUri: string;
    afterUri: string;
    height?: number;
    width?: number;
}

export function PhotoComparisonSlider({
    beforeUri,
    afterUri,
    height = 300,
    width = Dimensions.get('window').width - 40
}: PhotoComparisonSliderProps) {
    const sliderPosition = useSharedValue(0.5);
    const startX = useSharedValue(0);

    const triggerHaptic = () => {
        if (Platform.OS !== 'web') {
            Haptics.selectionAsync();
        }
    };

    const gesture = Gesture.Pan()
        .onStart(() => {
            startX.value = sliderPosition.value;
        })
        .onUpdate((event) => {
            const delta = event.translationX / width;
            let newValue = startX.value + delta;

            // Clamp between 0 and 1
            if (newValue < 0) newValue = 0;
            if (newValue > 1) newValue = 1;

            sliderPosition.value = newValue;

            // Optional: haptic feedback when crossing major points
            // if (Math.abs(newValue - 0.5) < 0.01) runOnJS(triggerHaptic)();
        })
        .onEnd(() => {
            // Could snap to center or leave as is
        });

    const animatedBeforeStyle = useAnimatedStyle(() => ({
        width: `${sliderPosition.value * 100}%`,
    }));

    const animatedHandleStyle = useAnimatedStyle(() => ({
        left: `${sliderPosition.value * 100}%`,
    }));

    return (
        <GestureHandlerRootView style={[styles.container, { width, height }]}>
            <View style={styles.imageWrapper}>
                {/* After Image (Background) */}
                <Image
                    source={{ uri: afterUri }}
                    style={[styles.image, { width, height }]}
                    contentFit="cover"
                />

                {/* Before Image (Top, Clipped) */}
                <Animated.View style={[styles.beforeContainer, animatedBeforeStyle]}>
                    <Image
                        source={{ uri: beforeUri }}
                        style={[styles.image, { width, height }]}
                        contentFit="cover"
                    />
                </Animated.View>

                {/* Labels */}
                <View style={styles.labelContainer}>
                    <View style={[styles.label, styles.beforeLabel]}>
                        <Animated.Text style={styles.labelText}>Before</Animated.Text>
                    </View>
                    <View style={[styles.label, styles.afterLabel]}>
                        <Animated.Text style={styles.labelText}>After</Animated.Text>
                    </View>
                </View>

                {/* Slider Handle */}
                <GestureDetector gesture={gesture}>
                    <Animated.View style={[styles.handleContainer, animatedHandleStyle]}>
                        <View style={styles.handleLine} />
                        <View style={styles.handleKnob}>
                            <View style={styles.handleArrowLeft} />
                            <View style={styles.handleArrowRight} />
                        </View>
                    </Animated.View>
                </GestureDetector>
            </View>
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    container: {
        borderRadius: borderRadius.xl,
        overflow: 'hidden',
        backgroundColor: colors.gray100,
        alignSelf: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
    },
    imageWrapper: {
        flex: 1,
        position: 'relative',
    },
    image: {
        position: 'absolute',
        top: 0,
        left: 0,
    },
    beforeContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        height: '100%',
        overflow: 'hidden',
        zIndex: 1,
    },
    handleContainer: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        width: 40,
        marginLeft: -20,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
    },
    handleLine: {
        width: 2,
        height: '100%',
        backgroundColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 4,
    },
    handleKnob: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#FFFFFF',
        position: 'absolute',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    handleArrowLeft: {
        width: 0,
        height: 0,
        backgroundColor: 'transparent',
        borderStyle: 'solid',
        borderRightWidth: 6,
        borderTopWidth: 6,
        borderBottomWidth: 6,
        borderRightColor: colors.primary,
        borderTopColor: 'transparent',
        borderBottomColor: 'transparent',
    },
    handleArrowRight: {
        width: 0,
        height: 0,
        backgroundColor: 'transparent',
        borderStyle: 'solid',
        borderLeftWidth: 6,
        borderTopWidth: 6,
        borderBottomWidth: 6,
        borderLeftColor: colors.primary,
        borderTopColor: 'transparent',
        borderBottomColor: 'transparent',
    },
    labelContainer: {
        position: 'absolute',
        top: 10,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 10,
        zIndex: 5,
        pointerEvents: 'none',
    },
    label: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: borderRadius.sm,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    beforeLabel: {
        alignSelf: 'flex-start',
    },
    afterLabel: {
        alignSelf: 'flex-end',
    },
    labelText: {
        color: '#FFFFFF',
        fontSize: 10,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
});
