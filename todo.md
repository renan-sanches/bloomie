# Bloomie - Project TODO

## Core Setup
- [x] Configure theme colors (lime green, forest green, coral, lavender, yellow)
- [x] Generate custom app logo
- [x] Update app.config.ts with branding
- [x] Set up icon mappings for all tabs
- [x] Update UI font to Plus Jakarta Sans

## Onboarding Flow
- [x] Welcome screen with animated plants
- [x] Plant parent quiz (Beginner/Growing/Expert)
- [x] Notification permission screen
- [x] Add first plant prompt screen
- [x] Celebration screen with confetti

## Navigation Structure
- [x] Tab bar with 5 tabs (Home, Calendar, Scan, Discover, Profile)
- [x] Onboarding flow navigation
- [x] Plant detail screen navigation
- [x] Modal screens (scan results, chat)

## My Jungle Dashboard (Home)
- [x] Time-based greeting header
- [x] Quick stats bar (plants, streak, tasks, XP)
- [x] Plant cards grid with status badges
- [x] Floating action button (+)
- [x] Empty state illustration
- [x] Bloomie Insight cards
- [x] Seasonal event banner

## Smart Scan Interface
- [x] Camera interface with scanning frame
- [x] Plant identification mode
- [x] Confidence-based results with alternatives
- [x] Health diagnosis mode
- [x] Scan failure handling

## Plant Detail Screen
- [x] Hero image with parallax
- [x] Editable nickname and personality
- [x] Health dashboard (circular progress)
- [x] Stat bars (hydration, light, humidity)
- [x] Care action buttons (Water, Mist, Fertilize, Rotate)
- [x] Growth journal timeline
- [x] Photo comparison slider
- [x] Care tips accordion
- [x] Smart schedule auto-tuning suggestions

## Care Calendar
- [x] Monthly calendar view
- [x] Daily quest log view
- [x] Swipeable task cards
- [x] Streak tracker
- [x] Weekly summary

## Discovery & Shop
- [x] Category tabs
- [x] Plant cards with affiliate links
- [x] Plant of the Week banner
- [ ] Search filters
- [x] AI recommendations section

## Rewards & Gamification
- [x] XP system implementation
- [x] Level progression (Seedling → Plant Wizard)
- [x] Achievement badges
- [ ] Weekly challenges
- [x] Seasonal events and themes

## Settings & Profile
- [x] Profile header with avatar
- [x] Notification preferences
- [x] Appearance settings (theme, contrast, motion)
- [x] Units preference
- [x] Data export/backup
- [x] AI privacy controls

## AI Features
- [x] Bloomie Buddy chat interface
- [x] Context-aware responses
- [x] Visual progress AI insights
- [x] Smart schedule tuning
- [ ] Privacy-first messaging

## Retention & Social
- [ ] Smart notification copy rotation
- [ ] Share plant progress card
- [ ] Plant of the Month gallery

## Plant Death Flow
- [x] Gentle goodbye screen
- [x] Memory card
- [x] Reflection prompt
- [x] Archive functionality

## Data & Storage
- [x] Plant data model with AsyncStorage
- [x] Care task scheduling
- [x] XP and achievements tracking
- [x] User preferences storage
- [ ] Remote config support
- [ ] Feature flags implementation

## Analytics Events
- [ ] Task completion tracking
- [ ] Scan success/failure
- [ ] Drop-off points
- [ ] AI chat usage

## Accessibility
- [ ] VoiceOver labels
- [ ] Dynamic Type support
- [ ] High contrast mode
- [ ] Reduced motion support

## Offline Mode
- [ ] Cached data display
- [ ] Offline banner
- [ ] Graceful feature degradation

## AI Integration (Real Services)
- [x] Add real camera capture with expo-camera
- [x] Integrate Gemini AI for plant identification
- [x] Integrate Gemini AI for health diagnosis
- [x] Upgrade Bloomie Buddy chat with real Gemini AI
- [x] Add streaming responses for AI chat
- [x] Test all AI features end-to-end

## Bug Fixes
- [x] Fix Gemini API key not accessible from mobile client
- [x] Move AI calls to server-side tRPC endpoints
- [x] Update scan screen to use server endpoints
- [x] Update chat screen to use server endpoints
- [x] Fix "Rendered fewer hooks than expected" error in PlantDetailScreen when archiving
- [x] Save captured photo when identifying plants
- [x] Display actual plant photos on plant cards instead of generic icons
- [x] Update plant detail screen to show plant photo
