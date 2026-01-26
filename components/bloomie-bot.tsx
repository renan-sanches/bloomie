import React, { useState, useRef, useEffect, useCallback } from "react";
import {
    View,
    Text,
    Pressable,
    FlatList,
    TextInput,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    Dimensions,
} from "react-native";
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withRepeat,
    withSequence,
    withTiming,
    FadeIn,
    FadeOut,
    SlideInRight,
} from "react-native-reanimated";
import { IconSymbol } from "./icon-symbol";
import { colors, spacing, borderRadius, typography } from "./ui/design-system";
import { useApp } from "@/lib/store";
import { trpc } from "@/lib/trpc";
import * as Haptics from "expo-haptics";

type Message = {
    id: string;
    role: "user" | "assistant";
    content: string;
    timestamp: Date;
};

const QUICK_SUGGESTIONS = [
    "Why are my leaves yellowing?",
    "How often should I water?",
    "My plant looks droopy",
    "Best plants for low light",
];

const SCREEN_HEIGHT = Dimensions.get("window").height;

export function BloomieBot() {
    const { plants, tasks, profile, careHistory } = useApp();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const flatListRef = useRef<FlatList>(null);
    const chatMutation = trpc.ai.chat.useMutation();

    // Initial welcome message
    useEffect(() => {
        if (messages.length === 0) {
            setMessages([{
                id: "welcome",
                role: "assistant",
                content: "Hi! I'm Bloomie Buddy. How can I help you and your plants today? 🌱",
                timestamp: new Date(),
            }]);
        }
    }, []);

    const toggleChat = () => {
        setIsOpen(!isOpen);
        if (Platform.OS !== "web") {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }
    };

    const handleSend = async (text?: string) => {
        const messageText = text || inputText.trim();
        if (!messageText || isTyping) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: "user",
            content: messageText,
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInputText("");
        setIsTyping(true);

        setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);

        try {
            const context = {
                plants: plants.map(p => ({
                    nickname: p.nickname,
                    species: p.species,
                    healthScore: p.healthScore,
                    location: p.location,
                    personality: p.personality,
                    lastWatered: p.lastWatered,
                })),
                pendingTasks: tasks.filter(t => !t.completed).map(t => ({
                    type: t.type,
                    plantName: plants.find(p => p.id === t.plantId)?.nickname || "Plant",
                    dueDate: t.dueDate,
                })),
                streakDays: profile.streakDays,
            };

            const result = await chatMutation.mutateAsync({
                message: messageText,
                history: messages.map(m => ({ role: m.role, content: m.content })),
                context: context as any,
            });

            const assistantMessage: Message = {
                id: Date.now().toString() + "-ai",
                role: "assistant",
                content: result.response,
                timestamp: new Date(),
            };

            setMessages((prev) => [...prev, assistantMessage]);
        } catch (error) {
            console.error(error);
        } finally {
            setIsTyping(false);
            setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
        }
    };

    if (!isOpen) {
        return (
            <Pressable
                style={styles.floatingButton}
                onPress={toggleChat}
            >
                <Animated.View entering={FadeIn} style={styles.fabIcon}>
                    <IconSymbol name="message.fill" size={24} color="#fff" />
                    <View style={styles.badge} />
                </Animated.View>
            </Pressable>
        );
    }

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.chatWindowWrapper}
        >
            <Animated.View
                entering={SlideInRight.springify().damping(15)}
                exiting={FadeOut}
                style={styles.chatWindow}
            >
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.headerTitleContainer}>
                        <View style={styles.botAvatar}>
                            <Text style={styles.avatarEmoji}>🌱</Text>
                        </View>
                        <View>
                            <Text style={styles.headerTitle}>Bloomie Buddy</Text>
                            <View style={styles.statusRow}>
                                <View style={styles.onlineDot} />
                                <Text style={styles.statusText}>Always here to help</Text>
                            </View>
                        </View>
                    </View>
                    <Pressable onPress={toggleChat} style={styles.closeButton}>
                        <IconSymbol name="xmark" size={18} color="#64748b" />
                    </Pressable>
                </View>

                {/* Messages */}
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.messageList}
                    renderItem={({ item }) => (
                        <View style={[
                            styles.messageRow,
                            item.role === "user" ? styles.userRow : styles.assistantRow
                        ]}>
                            <View style={[
                                styles.bubble,
                                item.role === "user" ? styles.userBubble : styles.assistantBubble
                            ]}>
                                <Text style={[
                                    styles.messageText,
                                    item.role === "user" ? styles.userText : styles.assistantText
                                ]}>
                                    {item.content}
                                </Text>
                            </View>
                        </View>
                    )}
                    ListFooterComponent={isTyping ? (
                        <View style={styles.typingContainer}>
                            <Text style={styles.typingText}>Bloomie is thinking...</Text>
                        </View>
                    ) : null}
                />

                {/* Quick Suggestions */}
                {!isTyping && messages.length < 5 && (
                    <View style={styles.suggestions}>
                        {QUICK_SUGGESTIONS.map((s, i) => (
                            <Pressable
                                key={i}
                                style={styles.suggestionChip}
                                onPress={() => handleSend(s)}
                            >
                                <Text style={styles.suggestionText}>{s}</Text>
                            </Pressable>
                        ))}
                    </View>
                )}

                {/* Input */}
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Ask me anything..."
                        value={inputText}
                        onChangeText={setInputText}
                        onSubmitEditing={() => handleSend()}
                        multiline={false}
                    />
                    <Pressable
                        style={[styles.sendButton, !inputText.trim() && styles.sendDisabled]}
                        onPress={() => handleSend()}
                        disabled={!inputText.trim() || isTyping}
                    >
                        <IconSymbol name="paperplane.fill" size={18} color="#fff" />
                    </Pressable>
                </View>
            </Animated.View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    floatingButton: {
        position: 'absolute',
        bottom: 24,
        right: 24,
        zIndex: 1000,
    },
    fabIcon: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#10b981',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#10b981',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 10,
    },
    badge: {
        position: 'absolute',
        top: 2,
        right: 2,
        width: 14,
        height: 14,
        borderRadius: 7,
        backgroundColor: '#ef4444',
        borderWidth: 2,
        borderColor: '#fff',
    },
    chatWindowWrapper: {
        position: 'absolute',
        bottom: 24,
        right: 24,
        zIndex: 1001,
        width: 400,
        maxWidth: Dimensions.get('window').width - 48,
    },
    chatWindow: {
        backgroundColor: '#fff',
        borderRadius: 24,
        height: 600,
        maxHeight: Dimensions.get('window').height - 100,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.15,
        shadowRadius: 24,
        elevation: 20,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
        backgroundColor: '#f8fafc',
    },
    headerTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    botAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#d1fae5',
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarEmoji: {
        fontSize: 20,
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: '700',
        fontFamily: 'PlusJakartaSans-Bold',
        color: '#1e293b',
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    onlineDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#10b981',
    },
    statusText: {
        fontSize: 11,
        color: '#64748b',
        fontFamily: 'PlusJakartaSans-Medium',
    },
    closeButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f1f5f9',
    },
    messageList: {
        padding: 16,
        gap: 12,
    },
    messageRow: {
        flexDirection: 'row',
        width: '100%',
    },
    userRow: {
        justifyContent: 'flex-end',
    },
    assistantRow: {
        justifyContent: 'flex-start',
    },
    bubble: {
        maxWidth: '85%',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 18,
    },
    userBubble: {
        backgroundColor: '#10b981',
        borderBottomRightRadius: 4,
    },
    assistantBubble: {
        backgroundColor: '#f1f5f9',
        borderBottomLeftRadius: 4,
    },
    messageText: {
        fontSize: 14,
        lineHeight: 20,
        fontFamily: 'PlusJakartaSans-Regular',
    },
    userText: {
        color: '#fff',
    },
    assistantText: {
        color: '#334155',
    },
    typingContainer: {
        paddingVertical: 8,
    },
    typingText: {
        fontSize: 12,
        color: '#94a3b8',
        fontStyle: 'italic',
    },
    suggestions: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        padding: 12,
        gap: 8,
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
    },
    suggestionChip: {
        backgroundColor: '#f1f5f9',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    suggestionText: {
        fontSize: 12,
        color: '#475569',
        fontFamily: 'PlusJakartaSans-Medium',
    },
    inputContainer: {
        flexDirection: 'row',
        padding: 16,
        gap: 12,
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
    },
    input: {
        flex: 1,
        backgroundColor: '#f8fafc',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 8,
        fontSize: 14,
        fontFamily: 'PlusJakartaSans-Regular',
        maxHeight: 100,
        // @ts-ignore
        outlineStyle: 'none',
    },
    sendButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#10b981',
        alignItems: 'center',
        justifyContent: 'center',
    },
    sendDisabled: {
        backgroundColor: '#cbd5e1',
    },
} as any);
