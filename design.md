# Bloomie - Mobile App Interface Design

## Design Philosophy
Bloomie is a gamified indoor plant care companion that feels like Duolingo meets Plant Parent. The design prioritizes **playful engagement**, **visual delight**, and **rewarding interactions** while maintaining iOS Human Interface Guidelines compliance for a native feel.

---

## Color Palette

### Primary Colors
- **Lime Green** `#A8E063` - Primary accent, growth, success states
- **Forest Green** `#2D5A27` - Deep accent, headers, emphasis

### Secondary Colors
- **Sunny Yellow** `#FFD93D` - Highlights, warnings, celebrations
- **Soft Lavender** `#B8A9E8` - Calm states, rotate actions
- **Coral Pink** `#FF6B6B` - Alerts, urgent states, love

### Neutrals
- **Warm Off-White** `#FFF9F0` - Light mode background
- **Charcoal** `#2C3E50` - Primary text
- **Dark Background** `#1A1F1A` - Dark mode background

### Gradients
- Yellow → Coral: Celebration cards
- Lavender → Green: Achievement badges
- Lime → Forest: Progress bars

---

## Typography

- **Headlines**: Rounded bold sans-serif (System font with rounded design)
- **Body**: SF Pro / System default for readability
- **Accent**: Playful emphasis for celebrations ("You did it!")

---

## Screen List

### 1. Onboarding Flow (5 screens)
- **Welcome Screen**: Animated plants waving, app intro
- **Plant Parent Quiz**: Beginner/Growing/Expert selection
- **Notification Permission**: Friendly illustrated ask
- **Add First Plant**: Scan/Search/Browse options
- **Celebration Screen**: Confetti "Welcome to your jungle!"

### 2. My Jungle Dashboard (Home Tab)
- Time-based greeting header with weather/light conditions
- Quick stats bar (plants, streak, tasks, XP/level)
- Plant cards grid/list with status badges
- Floating action button to add plant
- Bloomie Insight cards
- Seasonal event banner

### 3. Smart Scan Interface
- Full-screen camera with animated scanning frame
- Plant identification results modal
- Confidence-based suggestions
- Health diagnosis mode with severity indicators

### 4. Plant Detail Screen
- Hero image with parallax effect
- Editable nickname and personality tagline
- Health dashboard with circular progress ring
- Stat bars (hydration, light, humidity, fertilized)
- Care action buttons (Water, Mist, Fertilize, Rotate)
- Growth journal timeline with photo comparison
- Care tips accordion

### 5. Care Calendar (Quest Log Tab)
- Monthly calendar view with color-coded dots
- Daily quest log with swipeable task cards
- Streak tracker and weekly summary

### 6. Discovery & Shop Tab
- Category tabs (Trending, Beginner-Friendly, Pet-Safe, Rare)
- Magazine-style plant cards with affiliate links
- Plant of the Week featured banner
- AI-powered recommendations section

### 7. Rewards & Achievements
- XP and level progress display
- Achievement badge showcase
- Weekly challenges
- Seasonal event badges

### 8. Settings & Profile Tab
- Profile header with avatar, username, level
- Notification preferences (granular controls)
- Appearance settings (theme, contrast, motion)
- Units preference (Metric/Imperial)
- Data management (export, backup)
- AI privacy controls

### 9. Bloomie Buddy Chat
- Context-aware AI chat interface
- Quick action suggestions
- Plant-specific entry points

### 10. Plant Death Flow
- Gentle goodbye screen
- Memory card with stats
- Reflection prompt
- Archive option

---

## Key User Flows

### Flow 1: New User Onboarding
1. User opens app → Welcome screen with animated plants
2. Taps "Get Started" → Plant parent quiz
3. Selects experience level → Notification permission screen
4. Grants/denies permission → Add first plant screen
5. Chooses method (Scan/Search/Browse) → Adds plant
6. Celebration screen with confetti → Dashboard

### Flow 2: Daily Care Routine
1. User opens app → Dashboard with greeting
2. Sees pending tasks in quick stats → Taps task
3. Swipes right to complete → Checkmark animation + haptic
4. XP earned → Streak updated

### Flow 3: Plant Identification
1. User taps (+) FAB → Selects "Scan"
2. Camera opens with scanning frame → Captures photo
3. AI identifies plant → Results modal appears
4. User confirms or searches manually → Plant added to jungle

### Flow 4: Health Check
1. User taps plant card → Plant detail screen
2. Sees health score and stats → Taps "Scan for issues"
3. Camera scans leaf → Diagnosis cards appear
4. User logs observation → Care tips provided

### Flow 5: Bloomie Buddy Consultation
1. User taps chat icon → Chat interface opens
2. Types question about plant → AI responds with context
3. Suggested actions appear → User taps to log action

---

## Component Specifications

### Plant Card
- Large photo (user-uploaded or illustration)
- Bold nickname, smaller species text
- Status badge with animation (pulse, glow, checkmark)
- Last watered timestamp
- Quick action overlay on tap

### Care Action Button
- Pill-shaped, color-coded by action type
- Icon + label + next due date
- Bouncy press animation
- Haptic feedback on completion

### Achievement Badge
- Circular with illustrated icon
- Gradient background when earned
- Grayscale when locked
- Celebration animation on unlock

### Insight Card
- Rounded corners (20px)
- Gradient background
- Plant avatar + insight text
- Actionable CTA button

---

## Interaction Design

### Animations
- Spring animations on all interactive elements
- Confetti particles on achievements
- Pulse animations for attention states
- Parallax scroll on hero images
- Bouncy micro-interactions on buttons

### Haptics
- Light impact on button taps
- Medium impact on toggles
- Success notification on task completion
- Error notification on failures

### Sound Effects (Optional)
- Celebration chime on achievements
- Water splash on watering
- Gentle pop on task completion

---

## Accessibility

- VoiceOver support with meaningful labels
- Dynamic Type support
- High contrast mode option
- Reduced motion setting respected
- Minimum touch targets 44x44pt

---

## Offline Mode

- Show cached plant data
- Banner: "You're offline. Some features unavailable."
- Disable: Scan, AI chat, Shop
- Enable: View plants, log tasks locally
