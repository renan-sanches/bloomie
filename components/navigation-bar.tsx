import React from 'react';
import { View, Text, Pressable, StyleSheet, Platform, TextInput } from 'react-native';
import { Link, usePathname } from 'expo-router';
import { IconSymbol } from './ui/icon-symbol';
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
                {/* Left: Logo */}
                <View style={styles.leftSection}>
                    <Link href="/" asChild>
                        <Pressable style={styles.logoContainer}>
                            <View style={styles.logoIcon}>
                                <IconSymbol name="leaf.fill" size={20} color={colors.primaryDark} />
                            </View>
                            <Text style={styles.logoText}>Bloomie</Text>
                        </Pressable>
                    </Link>
                </View>

                {/* Center: Search bar */}
                <View style={[styles.centerSection, { display: Platform.OS === 'web' ? 'flex' : 'none' }]}>
                    <View style={styles.searchContainer}>
                        <IconSymbol name="magnifyingglass" size={16} color={colors.textSub} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Find a plant..."
                            placeholderTextColor={colors.textSub}
                        />
                    </View>
                </View>

                {/* Right: Nav Links + Actions */}
                <View style={styles.rightSection}>
                    <View style={styles.navLinks}>
                        <NavLink href="/" label="My Jungle" />
                        <NavLink href="/calendar" label="Schedule" />
                        <NavLink href="/scan" label="Identify" />
                    </View>

                    <View style={styles.actions}>
                        <Pressable style={styles.notificationButton}>
                            <IconSymbol name="bell.fill" size={18} color={colors.textSub} />
                            <View style={styles.notificationDot} />
                        </Pressable>

                        <Link href="/profile" asChild>
                            <Pressable style={styles.avatar}>
                                <Text style={styles.avatarText}>
                                    {user?.email?.charAt(0).toUpperCase() || 'P'}
                                </Text>
                            </Pressable>
                        </Link>
                    </View>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
        zIndex: 100,
        ...Platform.select({
            web: {
                position: 'sticky' as any,
                top: 0,
            },
        }),
    },
    content: {
        maxWidth: 1400,
        marginHorizontal: 'auto',
        paddingHorizontal: 24,
        paddingVertical: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
    },
    leftSection: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    logoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    logoIcon: {
        width: 32,
        height: 32,
        borderRadius: 8,
        backgroundColor: colors.primaryLight + '20',
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoText: {
        fontSize: 18,
        fontWeight: '800',
        fontFamily: 'PlusJakartaSans-ExtraBold',
        color: '#1e293b',
    },
    centerSection: {
        flex: 2,
        alignItems: 'center',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f1f5f9',
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 8,
        gap: 8,
        width: '100%',
        maxWidth: 400,
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
        fontFamily: 'PlusJakartaSans-Regular',
        color: '#1e293b',
        // @ts-ignore
        outlineStyle: 'none',
    },
    rightSection: {
        flex: 2,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: 32,
    },
    navLinks: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 24,
        display: Platform.OS === 'web' ? 'flex' : 'none',
    },
    navLink: {
        fontSize: 14,
        fontWeight: '600',
        fontFamily: 'PlusJakartaSans-SemiBold',
        color: '#64748b',
    },
    navLinkActive: {
        color: '#10b981',
        fontWeight: '700',
        fontFamily: 'PlusJakartaSans-Bold',
    },
    actions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    notificationButton: {
        position: 'relative',
        width: 32,
        height: 32,
        alignItems: 'center',
        justifyContent: 'center',
    },
    notificationDot: {
        position: 'absolute',
        top: 6,
        right: 6,
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#ef4444',
        borderWidth: 1.5,
        borderColor: '#fff',
    },
    avatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#fef3c7',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#f59e0b20',
    },
    avatarText: {
        fontSize: 14,
        fontWeight: '700',
        fontFamily: 'PlusJakartaSans-Bold',
        color: '#d97706',
    },
} as any);
