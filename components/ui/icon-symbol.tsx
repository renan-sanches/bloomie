import React from 'react';
import { Text, TextProps } from 'react-native';

// SF Symbols mapping to Unicode/Emoji equivalents
const SYMBOL_MAP: Record<string, string> = {
    'house.fill': '🏠',
    'calendar': '📅',
    'camera.fill': '📷',
    'leaf.fill': '🌿',
    'person.fill': '👤',
    'chevron.left': '‹',
    'chevron.right': '›',
    'xmark': '✕',
    'paperplane.fill': '✈',
    'plus': '+',
    'checkmark': '✓',
    'magnifyingglass': '🔍',
    'slider.horizontal.3': '⚙️',
    'sparkles': '✨',
    'snowflake': '❄️',
    'drop.fill': '💧',
    'checkmark.seal.fill': '✅',
    'heart.fill': '❤️',
    'safari.fill': '🧭',
    'photo.fill': '🖼️',
    'camera.rotate': '🔄',
};

interface IconSymbolProps extends TextProps {
    name: string;
    size?: number;
    color?: string;
}

export function IconSymbol({ name, size = 24, color = '#000', style, ...props }: IconSymbolProps) {
    const symbol = SYMBOL_MAP[name] || '•';

    return (
        <Text
            style={[
                {
                    fontSize: size,
                    color,
                    lineHeight: size,
                },
                style,
            ]}
            {...props}
        >
            {symbol}
        </Text>
    );
}
