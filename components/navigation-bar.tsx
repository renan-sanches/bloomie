import React from 'react';
import { View, Text, Pressable, StyleSheet, Platform, TextInput } from 'react-native';
import { Link, usePathname } from 'expo-router';
import { IconSymbol } from './icon-symbol';
import { colors } from './ui/design-system';
import { useApp } from '@/lib/store';

export function NavigationBar() {
    const pathname = usePathname();
    const { user } = useApp();

    const isActive = (path: string) => {
        if (path === '/') return pathname === '/';
        return pathname.startsWith(path);
    };

    const NavLink = ({ href, label }: { href: string; label: string }) => {
        const active = isActive(href);
        return (
            <Link href={href as any} asChild>
                <Pressable>
                    <Text style={[styles.navLink, active && styles.navLinkActive]}>
                        {label}
                    </Text>
                </Pressable>
            </Link>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                {/* Left: Logo + Search */}
                <View style={styles.leftSection}>
                    <Link href="/" asChild>
                        <Pressable style={styles.logoContainer}>
                            <View style={styles.logoIcon}>
                                <IconSymbol name="leaf.fill" size={24} color={colors.primaryDark} />
                            </View>
                            <Text style={styles.logoText}>Bloomie</Text>
                        </Pressable>
                    </Link>

                    {/* Search bar - hidden on small screens */}
                    {Platform.OS === 'web' && (
                        <View style={styles.searchContainer}>
                            <IconSymbol name="magnifyingglass" size={18} color={colors.textSub} />
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Find a plant..."
                                placeholderTextColor={colors.textSub}
                            />
                        </View>
                    )}
                </View>

                {/* Center: Nav Links */}
                <View style={styles.navLinks}>
                    <NavLink href="/" label="My Garden" />
                    <NavLink href="/calendar" label="Schedule" />
                    <NavLink href="/scan" label="Identify" />
                </View>

                {/* Right: Notifications + Avatar */}
                <View style={styles.rightSection}>
                    <Pressable style={styles.notificationButton}>
                        <IconSymbol name="bell.fill" size={20} color={colors.textSub} />
                        <View style={styles.notificationDot} />
                    </Pressable>

                    <Link href="/profile" asChild>
                        <Pressable style={styles.avatar}>
                            <Text style={styles.avatarText}>
                                {user?.email?.charAt(0).toUpperCase() || 'U'}
                            </Text>
                        </Pressable>
                    </Link>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0, 0, 0, 0.05)',
        ...Platform.select({
            web: {
                position: 'sticky' as any,
                top: 0,
                zIndex: 50,
            },
        }),
    },
    content: {
        maxWidth: 1400,
        marginHorizontal: 'auto',
        paddingHorizontal: 24,
        paddingVertical: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    leftSection: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 32,
        flex: 1,
    },
    logoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    logoIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: 'rgba(74, 222, 128, 0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoText: {
        fontSize: 20,
        fontWeight: '800',
        fontFamily: 'PlusJakartaSans-ExtraBold',
        color: colors.textMain,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f1f5f9',
        borderRadius: 16,
        paddingHorizontal: 12,
        paddingVertical: 8,
        gap: 8,
        width: 300,
        display: Platform.OS === 'web' ? 'flex' : 'none',
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
        fontFamily: 'PlusJakartaSans-Regular',
        color: colors.textMain,
    },
    navLinks: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 32,
        display: Platform.OS === 'web' ? 'flex' : 'none',
    },
    navLink: {
        fontSize: 14,
        fontWeight: '600',
        fontFamily: 'PlusJakartaSans-SemiBold',
        color: colors.textSub,
    },
    navLinkActive: {
        color: colors.primaryDark,
        fontWeight: '700',
        fontFamily: 'PlusJakartaSans-Bold',
    },
    rightSection: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        paddingLeft: 16,
        borderLeftWidth: 1,
        borderLeftColor: '#e2e8f0',
    },
    notificationButton: {
        position: 'relative',
    },
    notificationDot: {
        position: 'absolute',
        top: 0,
        right: 0,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: colors.accentPink,
        borderWidth: 2,
        borderColor: '#fff',
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#e2e8f0',
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        fontSize: 16,
        fontWeight: '700',
        fontFamily: 'PlusJakartaSans-Bold',
        color: colors.primaryDark,
    },
});
