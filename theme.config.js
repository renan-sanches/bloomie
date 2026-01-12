/** @type {const} */
const themeColors = {
  // Primary colors - Bloomie brand
  primary: { light: '#64b478', dark: '#64b478' },        // Sage green
  forest: { light: '#4a8a5b', dark: '#4a8a5b' },         // Primary Dark

  // Secondary colors
  sunny: { light: '#FFD93D', dark: '#FFD93D' },          // Sunny yellow
  lavender: { light: '#CE93D8', dark: '#CE93D8' },       // Soft lavender (accent-purple)
  coral: { light: '#E6B08A', dark: '#E6B08A' },          // Peach/Coral (accent-fert)

  // Semantic colors
  background: { light: '#F8F9F8', dark: '#1A1F1A' },     // Warm off-white
  surface: { light: '#FFFFFF', dark: '#242A24' },        // Cards and elevated surfaces
  foreground: { light: '#131614', dark: '#F5F5F0' },     // Carbon text
  muted: { light: '#687076', dark: '#9BA1A6' },          // Secondary text
  border: { light: '#E8E4DC', dark: '#3A4A3A' },         // Subtle borders

  // Status colors
  success: { light: '#64b478', dark: '#64b478' },        // Green success (primary)
  warning: { light: '#FFB74D', dark: '#FBBF24' },        // Orange warning (accent-orange)
  error: { light: '#F48FB1', dark: '#FF8585' },          // Pink error (accent-pink)

  // Care action colors
  water: { light: '#66BBE6', dark: '#66BBE6' },          // Blue for water
  mist: { light: '#A3E0E0', dark: '#A3E0E0' },           // Teal for mist
  fertilize: { light: '#E6B08A', dark: '#E6B08A' },      // Orange for fertilize
  rotate: { light: '#CE93D8', dark: '#CE93D8' },         // Lavender for rotate

  // XP and gamification
  xp: { light: '#FFD93D', dark: '#FFD93D' },             // XP gold
  streak: { light: '#FF6B6B', dark: '#FF8585' },         // Streak fire
};

module.exports = { themeColors };
