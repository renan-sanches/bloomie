// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { SymbolWeight, SymbolViewProps } from "expo-symbols";
import { ComponentProps } from "react";
import { OpaqueColorValue, type StyleProp, type TextStyle } from "react-native";

type IconMapping = Record<SymbolViewProps["name"], ComponentProps<typeof MaterialIcons>["name"]>;
type IconSymbolName = keyof typeof MAPPING;

/**
 * Bloomie app icon mappings - SF Symbols to Material Icons
 */
const MAPPING = {
  // Tab bar icons
  "house.fill": "home",
  "calendar": "event",
  "camera.fill": "photo-camera",
  "leaf.fill": "eco",
  "person.fill": "person",
  "magnifyingglass": "search",
  
  // Navigation icons
  "chevron.left": "chevron-left",
  "chevron.right": "chevron-right",
  "camera.rotate": "flip-camera-ios",
  "xmark": "close",
  "plus": "add",
  "plus.circle.fill": "add-circle",
  
  // Care action icons
  "drop.fill": "water-drop",
  "humidity.fill": "water",
  "leaf.arrow.circlepath": "autorenew",
  "sun.max.fill": "wb-sunny",
  "arrow.clockwise": "rotate-right",
  
  // Status icons
  "checkmark.circle.fill": "check-circle",
  "exclamationmark.triangle.fill": "warning",
  "heart.fill": "favorite",
  "star.fill": "star",
  "flame.fill": "local-fire-department",
  
  // Feature icons
  "bubble.left.fill": "chat-bubble",
  "photo.fill": "photo",
  "camera.viewfinder": "center-focus-strong",
  "qrcode.viewfinder": "qr-code-scanner",
  "cart.fill": "shopping-cart",
  "bag.fill": "shopping-bag",
  
  // Settings icons
  "gear": "settings",
  "bell.fill": "notifications",
  "moon.fill": "dark-mode",
  "paintbrush.fill": "brush",
  "square.and.arrow.up": "share",
  "arrow.down.circle.fill": "download",
  "trash.fill": "delete",
  "info.circle.fill": "info",
  "lock.fill": "lock",
  "eye.fill": "visibility",
  "eye.slash.fill": "visibility-off",
  
  // Gamification icons
  "trophy.fill": "emoji-events",
  "gift.fill": "card-giftcard",
  "sparkles": "auto-awesome",
  "crown.fill": "workspace-premium",
  
  // Misc icons
  "paperplane.fill": "send",
  "chevron.left.forwardslash.chevron.right": "code",
  "ellipsis": "more-horiz",
  "arrow.left": "arrow-back",
  "arrow.right": "arrow-forward",
  "questionmark.circle.fill": "help",
} as IconMapping;

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
}

export type { IconSymbolName };
