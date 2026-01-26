# Bloomie - Features and Functionalities

Bloomie is a premium AI-powered plant care companion app designed to help plant parents keep their indoor jungles thriving. This document describes all key features and functionalities implemented in the application.

---

## 1. Dashboard (My Jungle)
The central hub of the application, providing a high-level overview of the user's plant collection and daily status.

*   **Dynamic Greeting**: Personalized greeting based on the time of day (Good morning, Good afternoon, Good evening).
*   **Jungle Status**: A summary showing how many plants currently need attention (e.g., "3 plants need attention today").
*   **Indoor Temp Widget**: Displays real-time indoor temperature (currently optimized for Web).
*   **Plant Filtering**: Quick filters to view:
    *   **All Plants**: The entire collection.
    *   **To Water**: Only plants that are thirsty.
    *   **Sick Bay**: Plants that are struggling or need special care.
    *   **Propagating**: Plants that are in the growth phase.
*   **Plant Grid**: A visual collection of plant cards featuring:
    *   Plant photo (or placeholder emoji).
    *   Nickname and species name.
    *   **Status Badges**: Dynamic indicators (Thriving, Thirsty, Mist Me, Growing) with color-coding.
    *   **Location Badge**: Where the plant is located in the home.
*   **Quick Actions**: Floating buttons to quickly access the **AI Care Coach** or **Add a New Plant**.

## 2. Scan & AI Identification
Leverages AI to identify plants and diagnose health issues using the device camera.

*   **Identification Mode**: Identify over thousands of plant species from a single photo.
    *   Provides common name, scientific name, and description.
    *   **Add to Jungle**: One-tap functionality to add the identified plant to the user's collection with pre-filled metadata.
*   **Diagnosis Mode**: Analyze plant photos to detect pests, diseases, or nutrient deficiencies.
    *   Provides an overall health score and specific issue descriptions.
    *   **Treatment Recommendations**: Suggestions on how to fix detected issues.
*   **Visual Scan UI**: Interactive camera interface with guided framing and real-time scanning animations.

## 3. Care Schedule & Quest Log
A gamified task management system to ensure plants receive timely care.

*   **Quest Log (Task List)**: A prioritized list of "quests" (tasks) grouped by:
    *   **Overdue**: Tasks that should have been completed.
    *   **Today**: Current day's care requirements.
    *   **Upcoming**: A peek into future tasks.
*   **Calendar View**: A monthly overview with task dots (color-coded by task type: Water, Mist, Fertilize, Rotate).
*   **Interactive Task Cards**:
    *   **Swipe to Complete**: Swipe right to mark a task as done.
    *   **Swipe to Snooze**: Swipe left to delay a task.
    *   **XP Rewards**: Earn experience points (XP) for every completed task.
*   **Streak System**: Tracks consecutive days of plant care with a visual banner to encourage consistency.

## 4. AI Care Coach (Bloomie Buddy)
A conversational, context-aware AI assistant that acts as a personalized plant expert.

*   **Context Awareness**: Bloomie Buddy knows about the user's specific plants, pending tasks, and recent care history.
*   **Deep Guidance**: Users can ask specific questions like "Why are Theo's leaves yellowing?" or "What should I do with my plants while on vacation?".
*   **Dynamic Suggestions**: Provides contextual follow-up questions based on the conversation (e.g., if talking about watering, it suggests "signs of overwatering").
*   **Welcome States**: Personalizes its welcome message based on whether the user has plants, pending tasks, or is all caught up.

## 5. Plant Detail & Lifecycle
Comprehensive individual plant management.

*   **Health Dashboard**: Individual health score (%) and visual status summary.
*   **Care Logging**: Specific history of when the plant was last watered, misted, fertilized, or rotated.
*   **Environment Config**: Visual light requirement scale and temperature/humidity range information.
*   **Growth Insights**: AI-powered comparison between photos to detect growth progress and provide encouraging feedback.
*   **Notes & Journaling**: A dedicated space for users to record observations and tips specific to that plant.
*   **Pro Tips**: Contextual advice tailored to the specific plant species.

## 6. Discover & Shop
A curated marketplace for expanding the user's collection or finding plant care tools.

*   **Trending Plants**: A grid of popular plants with ratings, prices, and high-quality imagery.
*   **Categorized Search**: Browse by "Indoor", "Low Light", "Pet Safe", and other specific needs.
*   **Favorites & Cart**: Capability to save plants to a wishlist or add them to a shopping basket.
*   **Promotional Banners**: Highlights limited-time offers and seasonal sales.

## 7. Profile & Gamification
Tracks user progress and handles application settings.

*   **Leveling System**: Users progress from "Seedling" to "Master Gardener" by earning XP through care tasks.
*   **Achievements**: A grid of unlockable badges (e.g., "First Bloom", "Green Thumb", "Jungle King") to reward milestones.
*   **User Stats**: High-level metrics including total plants added, current streak, and total tasks completed.
*   **Customizable Preferences**:
    *   **Notifications**: Granular controls for push alerts, morning reminders, and weekly summaries.
    *   **Appearance**: Support for High Contrast and Reduced Motion for accessibility.
    *   **Haptic Feedback**: Toggle for tactile interaction responses.
    *   **Units**: Switch between Metric and Imperial systems.

## 8. Authentication & Synergy
*   **Secure Sign-In**: Integration with Firebase for robust user authentication (Login/Signup).
*   **Cloud Sync**: All plant data, tasks, and history are synced across devices via Firestore.
*   **Offline Support**: Fundamental app functionality remains accessible even with limited connectivity.

---
*Document Version: 1.0.0*  
*Last Updated: January 26, 2026*
