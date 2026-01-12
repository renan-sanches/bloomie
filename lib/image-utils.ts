import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';

/**
 * Converts a URI to base64 string
 */
export async function uriToBase64(uri: string): Promise<string | null> {
    try {
        if (Platform.OS === 'web') {
            // For web, we might need a different approach if the URI is a blob/url
            const response = await fetch(uri);
            const blob = await response.blob();
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    const base64String = reader.result as string;
                    // Remove data:image/...;base64, prefix
                    resolve(base64String.split(',')[1]);
                };
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            });
        }

        // For Native (iOS/Android)
        // If it's a remote URL, we should download it first or use fetch
        if (uri.startsWith('http')) {
            const response = await fetch(uri);
            const blob = await response.blob();
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    const base64String = reader.result as string;
                    resolve(base64String.split(',')[1]);
                };
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            });
        }

        // If it's a local file URI
        const base64 = await FileSystem.readAsStringAsync(uri, {
            encoding: FileSystem.EncodingType.Base64,
        });
        return base64;
    } catch (error) {
        console.error('Error converting URI to base64:', error);
        return null;
    }
}
