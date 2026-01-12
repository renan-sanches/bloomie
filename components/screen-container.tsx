import React from 'react';
import { View, StyleSheet, ViewProps } from 'react-native';
import { SafeAreaView, Edge } from 'react-native-safe-area-context';

interface ScreenContainerProps extends ViewProps {
    children: React.ReactNode;
    edges?: Edge[];
    containerClassName?: string;
}

export function ScreenContainer({
    children,
    edges = ['top', 'bottom', 'left', 'right'],
    style,
    containerClassName,
    ...props
}: ScreenContainerProps) {
    return (
        <SafeAreaView
            style={[styles.container, style]}
            edges={edges}
            className={containerClassName}
            {...props}
        >
            {children}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
});
