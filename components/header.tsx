import { View, Text, Pressable, Platform } from 'react-native';
import { useNavigation, DrawerActions } from '@react-navigation/native';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { colors } from '@/components/ui/design-system';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Logo } from '@/components/ui/logo';

export function Header() {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation();

    return (
        <View
            style={{
                paddingTop: Platform.OS === 'ios' ? insets.top : 20,
                backgroundColor: Platform.OS === 'web' ? 'rgba(255, 255, 255, 0.8)' : colors.surfaceLight,
                borderBottomWidth: 1,
                borderBottomColor: 'rgba(0,0,0,0.05)',
                zIndex: 10,
                // Web blur effect key mapping
                ...Platform.select({
                    web: {
                        backdropFilter: 'blur(10px)',
                        WebkitBackdropFilter: 'blur(10px)',
                    }
                })
            }}
        >
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingVertical: 16 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    {/* Menu Button */}
                    <Pressable
                        onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}
                        style={({ pressed }) => ({
                            opacity: pressed ? 0.7 : 1,
                            marginRight: 4,
                            width: 44,
                            height: 44,
                            justifyContent: 'center',
                            alignItems: 'center',
                        })}
                    >
                        {/* We need to hook this up. For now just placing the visual. */}
                        <IconSymbol name="line.3.horizontal" size={24} color={colors.gray900} />
                    </Pressable>

                    {/* Logo Icon */}
                    <Logo variant="brand" />
                </View>

                {/* Search Button */}
                <Pressable
                    style={({ pressed }) => ({
                        width: 44,
                        height: 44,
                        backgroundColor: Platform.OS === 'web' ? '#ffffff' : colors.surfaceLight,
                        borderRadius: 20,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 1 },
                        shadowOpacity: 0.1,
                        shadowRadius: 2,
                        elevation: 2,
                        alignItems: 'center',
                        justifyContent: 'center',
                        opacity: pressed ? 0.8 : 1,
                        borderWidth: 1,
                        borderColor: colors.gray100
                    })}
                >
                    <IconSymbol name="magnifyingglass" size={22} color={colors.gray500} />
                </Pressable>
            </View>
        </View>
    );
}
