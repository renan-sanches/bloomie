export const themeColors: {
  primary: { light: string; dark: string };
  forest: { light: string; dark: string };
  sunny: { light: string; dark: string };
  lavender: { light: string; dark: string };
  coral: { light: string; dark: string };
  background: { light: string; dark: string };
  surface: { light: string; dark: string };
  foreground: { light: string; dark: string };
  muted: { light: string; dark: string };
  border: { light: string; dark: string };
  success: { light: string; dark: string };
  warning: { light: string; dark: string };
  error: { light: string; dark: string };
  water: { light: string; dark: string };
  mist: { light: string; dark: string };
  fertilize: { light: string; dark: string };
  rotate: { light: string; dark: string };
  xp: { light: string; dark: string };
  streak: { light: string; dark: string };
};

declare const themeConfig: {
  themeColors: typeof themeColors;
};

export default themeConfig;
