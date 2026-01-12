/** @type {const} */
const themeColors = {
  // Primary colors - Bloomie brand
  primary: { light: '#A8E063', dark: '#A8E063' },        // Vibrant lime green
  forest: { light: '#2D5A27', dark: '#3D7A37' },         // Deep forest green
  
  // Secondary colors
  sunny: { light: '#FFD93D', dark: '#FFD93D' },          // Sunny yellow
  lavender: { light: '#B8A9E8', dark: '#9B8AD8' },       // Soft lavender
  coral: { light: '#FF6B6B', dark: '#FF8585' },          // Coral pink
  
  // Semantic colors
  background: { light: '#FFF9F0', dark: '#1A1F1A' },     // Warm off-white / dark green-tinted
  surface: { light: '#FFFFFF', dark: '#242A24' },        // Cards and elevated surfaces
  foreground: { light: '#2C3E50', dark: '#F5F5F0' },     // Charcoal text
  muted: { light: '#687076', dark: '#9BA1A6' },          // Secondary text
  border: { light: '#E8E4DC', dark: '#3A4A3A' },         // Subtle borders
  
  // Status colors
  success: { light: '#22C55E', dark: '#4ADE80' },        // Green success
  warning: { light: '#FFD93D', dark: '#FBBF24' },        // Yellow warning
  error: { light: '#FF6B6B', dark: '#FF8585' },          // Coral error
  
  // Care action colors
  water: { light: '#4FC3F7', dark: '#81D4FA' },          // Blue for water
  mist: { light: '#26C6DA', dark: '#4DD0E1' },           // Teal for mist
  fertilize: { light: '#FFA726', dark: '#FFB74D' },      // Orange for fertilize
  rotate: { light: '#B8A9E8', dark: '#9B8AD8' },         // Lavender for rotate
  
  // XP and gamification
  xp: { light: '#FFD93D', dark: '#FFD93D' },             // XP gold
  streak: { light: '#FF6B6B', dark: '#FF8585' },         // Streak fire
};

module.exports = { themeColors };
