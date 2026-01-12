import { useState, useRef, useEffect, useCallback } from "react";
import {
  View,
  Text,
  Pressable,
  FlatList,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useApp } from "@/lib/store";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
} from "react-native-reanimated";
import { trpc } from "@/lib/trpc";

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
  "How to repot a plant",
];

export default function ChatScreen() {
  const { plants, tasks, profile } = useApp();
  const insets = useSafeAreaInsets();
  const flatListRef = useRef<FlatList>(null);
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: getWelcomeMessage(),
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [currentSuggestions, setCurrentSuggestions] = useState<string[]>(QUICK_SUGGESTIONS.slice(0, 3));

  // tRPC mutation for chat
  const chatMutation = trpc.ai.chat.useMutation();

  // Typing animation
  const typingDot1 = useSharedValue(0);
  const typingDot2 = useSharedValue(0);
  const typingDot3 = useSharedValue(0);

  useEffect(() => {
    if (isTyping) {
      typingDot1.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 300 }),
          withTiming(0, { duration: 300 })
        ),
        -1
      );
      typingDot2.value = withRepeat(
        withSequence(
          withTiming(0, { duration: 100 }),
          withTiming(1, { duration: 300 }),
          withTiming(0, { duration: 300 })
        ),
        -1
      );
      typingDot3.value = withRepeat(
        withSequence(
          withTiming(0, { duration: 200 }),
          withTiming(1, { duration: 300 }),
          withTiming(0, { duration: 300 })
        ),
        -1
      );
    }
  }, [isTyping, typingDot1, typingDot2, typingDot3]);

  const dot1Style = useAnimatedStyle(() => ({
    opacity: 0.3 + typingDot1.value * 0.7,
    transform: [{ scale: 0.8 + typingDot1.value * 0.2 }],
  }));

  const dot2Style = useAnimatedStyle(() => ({
    opacity: 0.3 + typingDot2.value * 0.7,
    transform: [{ scale: 0.8 + typingDot2.value * 0.2 }],
  }));

  const dot3Style = useAnimatedStyle(() => ({
    opacity: 0.3 + typingDot3.value * 0.7,
    transform: [{ scale: 0.8 + typingDot3.value * 0.2 }],
  }));

  function getWelcomeMessage(): string {
    const hour = new Date().getHours();
    let greeting = "Hello";
    if (hour < 12) greeting = "Good morning";
    else if (hour < 17) greeting = "Good afternoon";
    else greeting = "Good evening";

    if (plants.length === 0) {
      return `${greeting}! 🌱 I'm Bloomie, your plant care companion. I see you haven't added any plants yet - want me to help you get started? You can scan a plant using the camera or ask me any plant care questions!`;
    }

    const pendingTasks = tasks.filter((t) => !t.completed);
    if (pendingTasks.length > 0) {
      return `${greeting}, plant parent! 🌿 You have ${pendingTasks.length} care task${pendingTasks.length > 1 ? "s" : ""} waiting. How can I help you today? Ask me anything about your plants!`;
    }

    return `${greeting}! 🌱 Your plants are looking great! I'm here to help with any plant care questions. What would you like to chat about?`;
  }

  const getConversationHistory = useCallback(() => {
    return messages
      .filter((m) => m.id !== "welcome")
      .map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      }));
  }, [messages]);

  const getUserContext = useCallback(() => {
    return {
      plants: plants.map((p) => ({
        nickname: p.nickname,
        species: p.species,
        healthScore: p.healthScore,
      })),
      pendingTasks: tasks.filter((t) => !t.completed).length,
      streakDays: profile.streakDays,
    };
  }, [plants, tasks, profile]);

  const triggerHaptic = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleSend = async (text?: string) => {
    const messageText = text || inputText.trim();
    if (!messageText || isTyping) return;

    triggerHaptic();

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: messageText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setIsTyping(true);

    // Scroll to bottom
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);

    try {
      // Call server-side AI endpoint
      const conversationHistory = getConversationHistory();
      const userContext = getUserContext();
      
      const result = await chatMutation.mutateAsync({
        message: messageText,
        history: conversationHistory,
        context: userContext,
      });

      const responseText = result.success 
        ? result.response 
        : "Oops! I'm having a moment. Let me collect my thoughts and try again. 🌿";

      // Add assistant message
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: responseText,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Generate contextual suggestions based on the response
      generateSuggestions(messageText, responseText);

    } catch (error) {
      console.error("Chat error:", error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Oops! I'm having a moment. Let me collect my thoughts and try again. 🌿",
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, errorMessage]);
    }

    setIsTyping(false);

    // Scroll to bottom
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const generateSuggestions = (userMessage: string, response: string) => {
    const lowerMessage = userMessage.toLowerCase();
    const lowerResponse = response.toLowerCase();

    // Generate contextual follow-up suggestions
    if (lowerMessage.includes("water") || lowerResponse.includes("water")) {
      setCurrentSuggestions(["What about succulents?", "Signs of overwatering?", "Best time to water?"]);
    } else if (lowerMessage.includes("yellow") || lowerResponse.includes("yellow")) {
      setCurrentSuggestions(["How to fix overwatering?", "Should I remove yellow leaves?", "Other leaf problems"]);
    } else if (lowerMessage.includes("light") || lowerResponse.includes("light")) {
      setCurrentSuggestions(["Best low light plants?", "Can I use grow lights?", "South vs north window?"]);
    } else if (lowerMessage.includes("pest") || lowerResponse.includes("pest")) {
      setCurrentSuggestions(["How to use neem oil?", "Are fungus gnats harmful?", "Prevent future pests"]);
    } else if (plants.length > 0) {
      // Suggest asking about specific plants
      const plantSuggestions = plants.slice(0, 2).map((p) => `How is ${p.nickname} doing?`);
      setCurrentSuggestions([...plantSuggestions, "What should I do today?"]);
    } else {
      setCurrentSuggestions(QUICK_SUGGESTIONS.slice(0, 3));
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.role === "user";

    return (
      <View style={[styles.messageContainer, isUser && styles.userMessageContainer]}>
        {!isUser && (
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarEmoji}>🌱</Text>
          </View>
        )}
        <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.assistantBubble]}>
          <Text style={[styles.messageText, isUser && styles.userMessageText]}>
            {item.content}
          </Text>
        </View>
        {isUser && <View style={styles.avatarSpacer} />}
      </View>
    );
  };

  const renderSuggestions = () => (
    <View style={styles.suggestionsContainer}>
      {currentSuggestions.map((suggestion, index) => (
        <Pressable
          key={index}
          onPress={() => handleSend(suggestion)}
          disabled={isTyping}
          style={({ pressed }) => [
            styles.suggestionChip,
            pressed && styles.chipPressed,
            isTyping && styles.chipDisabled,
          ]}
        >
          <Text style={[styles.suggestionText, isTyping && styles.suggestionTextDisabled]}>
            {suggestion}
          </Text>
        </Pressable>
      ))}
    </View>
  );

  return (
    <ScreenContainer edges={["top", "left", "right"]} containerClassName="bg-background">
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => { triggerHaptic(); router.back(); }} style={styles.backButton}>
            <IconSymbol name="chevron.left" size={24} color="#2C3E50" />
          </Pressable>
          <View style={styles.headerInfo}>
            <View style={styles.headerAvatar}>
              <Text style={styles.headerAvatarEmoji}>🌱</Text>
            </View>
            <View>
              <Text style={styles.headerTitle}>Bloomie Buddy</Text>
              <Text style={styles.headerSubtitle}>
                {isTyping ? "Typing..." : "AI Plant Care Assistant"}
              </Text>
            </View>
          </View>
          <View style={{ width: 40 }} />
        </View>

        {/* Messages */}
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={() => (
            <>
              {/* Typing indicator */}
              {isTyping && (
                <View style={styles.typingContainer}>
                  <View style={styles.avatarContainer}>
                    <Text style={styles.avatarEmoji}>🌱</Text>
                  </View>
                  <View style={styles.typingBubble}>
                    <Animated.View style={[styles.typingDot, dot1Style]} />
                    <Animated.View style={[styles.typingDot, dot2Style]} />
                    <Animated.View style={[styles.typingDot, dot3Style]} />
                  </View>
                </View>
              )}

              {/* Suggestions */}
              {!isTyping && messages.length > 0 && renderSuggestions()}
            </>
          )}
        />

        {/* Input */}
        <View style={[styles.inputContainer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
          <TextInput
            style={styles.input}
            placeholder="Ask Bloomie anything..."
            placeholderTextColor="#9BA1A6"
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
            returnKeyType="send"
            onSubmitEditing={() => handleSend()}
            editable={!isTyping}
          />
          <Pressable
            onPress={() => handleSend()}
            disabled={!inputText.trim() || isTyping}
            style={({ pressed }) => [
              styles.sendButton,
              (!inputText.trim() || isTyping) && styles.sendButtonDisabled,
              pressed && styles.buttonPressed,
            ]}
          >
            <IconSymbol name="paperplane.fill" size={20} color={inputText.trim() && !isTyping ? "#FFFFFF" : "#9BA1A6"} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E8E4DC",
    backgroundColor: "#FFFFFF",
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#F5FFF0",
    alignItems: "center",
    justifyContent: "center",
  },
  headerAvatarEmoji: {
    fontSize: 24,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#2C3E50",
  },
  headerSubtitle: {
    fontSize: 13,
    color: "#9BA1A6",
  },
  messagesList: {
    padding: 16,
    paddingBottom: 8,
  },
  messageContainer: {
    flexDirection: "row",
    marginBottom: 16,
    alignItems: "flex-end",
  },
  userMessageContainer: {
    justifyContent: "flex-end",
  },
  avatarContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F5FFF0",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  avatarEmoji: {
    fontSize: 20,
  },
  avatarSpacer: {
    width: 44,
  },
  messageBubble: {
    maxWidth: "75%",
    padding: 14,
    borderRadius: 20,
  },
  userBubble: {
    backgroundColor: "#A8E063",
    borderBottomRightRadius: 4,
    marginLeft: "auto",
  },
  assistantBubble: {
    backgroundColor: "#FFFFFF",
    borderBottomLeftRadius: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  messageText: {
    fontSize: 15,
    color: "#2C3E50",
    lineHeight: 22,
  },
  userMessageText: {
    color: "#2D5A27",
  },
  typingContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 16,
  },
  typingBubble: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    padding: 14,
    borderRadius: 20,
    borderBottomLeftRadius: 4,
    gap: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#A8E063",
  },
  suggestionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 8,
    paddingLeft: 44,
  },
  suggestionChip: {
    backgroundColor: "#F5FFF0",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#A8E063",
  },
  chipPressed: {
    backgroundColor: "#A8E063",
  },
  chipDisabled: {
    opacity: 0.5,
  },
  suggestionText: {
    fontSize: 13,
    color: "#2D5A27",
    fontWeight: "500",
  },
  suggestionTextDisabled: {
    color: "#9BA1A6",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E8E4DC",
    gap: 12,
  },
  input: {
    flex: 1,
    backgroundColor: "#F5F5F0",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: "#2C3E50",
    maxHeight: 100,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#A8E063",
    alignItems: "center",
    justifyContent: "center",
  },
  sendButtonDisabled: {
    backgroundColor: "#E8E4DC",
  },
  buttonPressed: {
    transform: [{ scale: 0.95 }],
    opacity: 0.9,
  },
});
