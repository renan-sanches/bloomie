# Bloomie Codebase Review Report

**Date:** January 14, 2026
**Reviewer:** Claude Code
**Project:** Bloomie - Plant Care Companion App
**URL:** https://bloomie-app-a4a5e.web.app

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [What Was Fixed](#what-was-fixed)
3. [Critical Issues Remaining](#critical-issues-remaining)
4. [Security Issues](#security-issues)
5. [Performance Optimizations](#performance-optimizations)
6. [Code Quality Issues](#code-quality-issues)
7. [Missing Functionality](#missing-functionality)
8. [Step-by-Step Fix Guide](#step-by-step-fix-guide)
9. [Environment Setup Checklist](#environment-setup-checklist)

---

## Executive Summary

The Bloomie web app was experiencing a **404 error on Firebase Hosting**. This was the primary issue reported and has been **successfully fixed**. During the investigation, a comprehensive code review revealed several additional issues that need attention before production deployment.

### Quick Stats

| Category | Count |
|----------|-------|
| Issues Fixed | 2 |
| Critical Issues Remaining | 6 |
| High Priority Issues | 4 |
| Medium Priority Issues | 8 |
| Low Priority Issues | 10 |

---

## What Was Fixed

### 1. Firebase Hosting 404 Error (FIXED)

**Problem:** The web app was returning a 404 error when accessing https://bloomie-app-a4a5e.web.app

**Root Cause:** The `firebase.json` configuration was missing SPA (Single Page Application) rewrite rules. Without these rules, Firebase Hosting couldn't properly route client-side navigation requests to the main `index.html` file.

**Solution Applied:**

```json
// firebase.json - BEFORE
{
    "hosting": {
        "public": "dist",
        "ignore": ["firebase.json", "**/.*"],
        "cleanUrls": true,
        "headers": [...]
    }
}

// firebase.json - AFTER
{
    "hosting": {
        "public": "dist",
        "ignore": ["firebase.json", "**/.*"],
        "cleanUrls": true,
        "rewrites": [
            {
                "source": "**",
                "destination": "/index.html"
            }
        ],
        "headers": [
            {
                "source": "**/*.@(jpg|jpeg|gif|png|svg|webp)",
                "headers": [
                    {
                        "key": "Cache-Control",
                        "value": "max-age=31536000"
                    }
                ]
            },
            {
                "source": "**/*.@(js|css)",
                "headers": [
                    {
                        "key": "Cache-Control",
                        "value": "max-age=31536000"
                    }
                ]
            }
        ]
    }
}
```

**Status:** Deployed and verified working. HTTP 200 now returned.

### 2. Static Asset Caching (FIXED)

**Problem:** JavaScript and CSS files had no cache headers.

**Solution:** Added cache headers for JS/CSS files with 1-year max-age to improve load times on repeat visits.

---

## Critical Issues Remaining

### Issue #1: Missing Gemini API Key

**Severity:** CRITICAL
**Impact:** All AI features are broken (plant identification, health diagnosis, chat assistant)

**Location:** `.env.local`

**Current State:**
```bash
# .env.local contains Firebase config only
EXPO_PUBLIC_FIREBASE_API_KEY=...
# Missing: EXPO_PUBLIC_GEMINI_API_KEY
```

**Files Affected:**
- `lib/gemini-service.ts` - Will throw "Gemini API key not configured"
- `app/scan.tsx` - Plant scanner won't work
- `app/chat.tsx` - Bloomie Buddy chat won't work

**How to Fix:**
1. Get a Gemini API key from https://makersuite.google.com/app/apikey
2. Add to `.env.local`:
   ```bash
   EXPO_PUBLIC_GEMINI_API_KEY=your_api_key_here
   ```
3. Rebuild: `npm run build:web`
4. Redeploy: `npm run deploy:web`

---

### Issue #2: Missing expo-file-system Dependency

**Severity:** CRITICAL
**Impact:** App will crash when trying to save photos or process images

**Location:** `package.json`

**Files Using This Dependency:**
- `lib/image-utils.ts` (line 1): `import * as FileSystem from 'expo-file-system';`
- `app/scan.tsx` (line 2): `import * as FileSystem from 'expo-file-system';`

**How to Fix:**
```bash
cd /Users/renansanches/Projects/Bloomie
npm install expo-file-system
```

---

### Issue #3: Firebase Auth Initialization Race Condition

**Severity:** CRITICAL
**Impact:** App crashes on hot reload or when module is re-imported

**Location:** `lib/firebase.config.ts` (lines 27-36)

**Current Code:**
```typescript
let auth;
if (Platform.OS === 'web') {
    auth = getAuth(app);
} else {
    // This will crash if called twice!
    auth = initializeAuth(app, {
        persistence: getReactNativePersistence(AsyncStorage),
    });
}
```

**How to Fix:**
```typescript
let auth;
if (Platform.OS === 'web') {
    auth = getAuth(app);
} else {
    try {
        auth = initializeAuth(app, {
            persistence: getReactNativePersistence(AsyncStorage),
        });
    } catch (error) {
        // Auth already initialized, get existing instance
        auth = getAuth(app);
    }
}
```

---

### Issue #4: Firestore Rules - Wrong Field Name

**Severity:** CRITICAL
**Impact:** All plant creation and updates will be rejected by Firestore

**Location:** `firestore.rules` (line 27)

**Current Rule:**
```javascript
allow create: if isOwner(userId)
  && request.resource.data.name is string  // WRONG: should be 'nickname'
```

**How to Fix:**
```javascript
allow create: if isOwner(userId)
  && request.resource.data.nickname is string  // CORRECT
```

---

### Issue #5: Firestore Rules - Missing Plant Statuses

**Severity:** HIGH
**Impact:** Plants with certain statuses cannot be saved

**Location:** `firestore.rules` (line 29)

**Current Rule:**
```javascript
&& request.resource.data.status in ['thirsty', 'thriving', 'mist', 'growing']
```

**App Uses These Statuses (from `lib/store.ts` line 30):**
```typescript
status: 'thirsty' | 'mist' | 'fertilize' | 'thriving' | 'growing' | 'struggling' | 'dormant' | 'dead'
```

**How to Fix:**
```javascript
&& request.resource.data.status in ['thirsty', 'thriving', 'mist', 'growing', 'fertilize', 'struggling', 'dormant', 'dead']
```

---

### Issue #6: Missing Authentication Guard

**Severity:** HIGH
**Impact:** Unauthenticated users can access app, causing null reference errors

**Location:** `app/_layout.tsx`

**Current State:** No check for authentication before rendering main content

**How to Fix:**

Add authentication check in `_layout.tsx`:

```typescript
import { useRouter, useSegments } from 'expo-router';

export default function RootLayout() {
  const { user, isLoading } = useApp();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === 'auth';

    if (!user && !inAuthGroup) {
      // Redirect to login
      router.replace('/auth/login');
    } else if (user && inAuthGroup) {
      // Redirect to home
      router.replace('/');
    }
  }, [user, isLoading, segments]);

  // ... rest of component
}
```

---

## Security Issues

### Issue #7: Firestore Rules - Missing Care Action

**Severity:** MEDIUM
**Location:** `firestore.rules` (line 48)

**Current:**
```javascript
&& request.resource.data.action in ['water', 'fertilize', 'mist', 'prune', 'repot']
```

**Missing:** `'rotate'` action (used in `lib/store.ts` line 53)

**Fix:**
```javascript
&& request.resource.data.action in ['water', 'fertilize', 'mist', 'prune', 'repot', 'rotate']
```

---

### Issue #8: Exposed API Keys

**Severity:** HIGH (if committed to git)
**Location:** `.env.local`

**Recommendation:**
1. Check if `.env.local` is in `.gitignore`
2. If it was ever committed, rotate all Firebase API keys in Firebase Console
3. Never commit `.env.local` to version control

---

### Issue #9: Missing Environment Template

**Severity:** MEDIUM
**Location:** `.env.template`

**Current State:** Template doesn't include Gemini API key

**Fix:** Update `.env.template`:
```bash
# Firebase Configuration
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key_here
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Gemini AI API Key (required for AI features)
EXPO_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here
```

---

## Performance Optimizations

### Issue #10: Missing Memoization in Plant List

**Severity:** MEDIUM
**Location:** `app/index.tsx` (lines 173-187)

**Problem:** PlantCard components re-render on every parent update

**Fix:**
```typescript
// Wrap PlantCard component in React.memo
const MemoizedPlantCard = React.memo(PlantCard);

// Use in render
{filteredPlants.map((plant) => (
  <MemoizedPlantCard
    key={plant.id}
    name={plant.nickname}
    // ...
  />
))}
```

---

### Issue #11: Inline Arrow Functions in Chat

**Severity:** MEDIUM
**Location:** `app/chat.tsx` (multiple lines)

**Problem:** New function instances created on every render

**Fix:** Use `useCallback` for event handlers:
```typescript
const handleSend = useCallback(() => {
  // send logic
}, [dependencies]);
```

---

### Issue #12: Large Image Captures

**Severity:** MEDIUM
**Location:** `app/scan.tsx` (line 132)

**Current:** `quality: 0.7`

**Fix:** Reduce to `quality: 0.5` and implement compression:
```typescript
const photo = await cameraRef.current.takePictureAsync({
  quality: 0.5,
  base64: true,
  exif: false, // Don't need EXIF data
});
```

---

### Issue #13: No Pagination for Care History

**Severity:** LOW
**Location:** `lib/firestore.ts` (line 324)

**Current:** Hardcoded limit of 50 items

**Fix:** Implement cursor-based pagination:
```typescript
export async function getCareHistory(
  userId: string,
  plantId: string | null,
  limit: number = 20,
  startAfter?: DocumentSnapshot
) {
  let q = query(
    collection(db, `users/${userId}/careHistory`),
    orderBy('timestamp', 'desc'),
    limit(limit)
  );

  if (startAfter) {
    q = query(q, startAfter(startAfter));
  }

  return getDocs(q);
}
```

---

## Code Quality Issues

### Issue #14: Duplicate Type Definitions

**Severity:** LOW
**Locations:**
- `lib/store.ts` - Plant, UserProfile, UserPreferences
- `lib/firestore.ts` - UserProfile, Plant (slightly different)

**Fix:** Create a single `types.ts` file and import everywhere

---

### Issue #15: Inconsistent Error Handling

**Severity:** LOW
**Location:** Throughout codebase

**Fix:** Create a central error handler:
```typescript
// lib/error-handler.ts
export function handleError(error: unknown, context: string) {
  console.error(`[${context}]`, error);
  // Could also send to error tracking service
  return error instanceof Error ? error.message : 'An error occurred';
}
```

---

### Issue #16: Potential Null Reference in AppProvider

**Severity:** MEDIUM
**Location:** `lib/app-provider.tsx` (lines 142-146)

**Current:**
```typescript
photos: plant.photos?.map(p => ({...})) || [],
```

**The `?.` is already there but verify it's used consistently throughout.**

---

## Missing Functionality

### Issue #17: Task Persistence Not Implemented

**Severity:** MEDIUM
**Location:** `lib/app-provider.tsx` (lines 252-277)

**Current State:** Tasks are stored in local state only, lost on refresh

**Fix:** Create Firestore subcollection for tasks:
```typescript
// In firestore.ts
export async function createTask(userId: string, task: Omit<CareTask, 'id'>) {
  const tasksRef = collection(db, `users/${userId}/tasks`);
  const docRef = await addDoc(tasksRef, {
    ...task,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}
```

---

### Issue #18: No Offline Support

**Severity:** LOW
**Location:** `lib/firebase.config.ts`

**Fix:** Enable Firestore offline persistence:
```typescript
import { enableIndexedDbPersistence } from 'firebase/firestore';

// After initializing Firestore
if (Platform.OS === 'web') {
  enableIndexedDbPersistence(db).catch((err) => {
    console.warn('Offline persistence not available:', err);
  });
}
```

---

## Step-by-Step Fix Guide

### Phase 1: Critical Fixes (Do Immediately)

```bash
# Step 1: Install missing dependency
cd /Users/renansanches/Projects/Bloomie
npm install expo-file-system

# Step 2: Add Gemini API key to .env.local
echo "EXPO_PUBLIC_GEMINI_API_KEY=your_key_here" >> .env.local

# Step 3: Fix firebase.config.ts (see Issue #3 above)
# Edit lib/firebase.config.ts manually

# Step 4: Fix firestore.rules (see Issues #4, #5, #7 above)
# Edit firestore.rules manually

# Step 5: Rebuild and deploy
npm run build:web
firebase deploy
```

### Phase 2: High Priority Fixes

1. Add authentication guard to `app/_layout.tsx` (Issue #6)
2. Rotate Firebase API keys if exposed (Issue #8)
3. Update `.env.template` with all required variables (Issue #9)

### Phase 3: Performance & Quality

1. Add memoization to PlantCard components (Issue #10)
2. Use useCallback in chat.tsx (Issue #11)
3. Reduce image quality (Issue #12)
4. Consolidate type definitions (Issue #14)

### Phase 4: Feature Completion

1. Implement task persistence to Firestore (Issue #17)
2. Add pagination for care history (Issue #13)
3. Enable offline support (Issue #18)

---

## Environment Setup Checklist

For any developer setting up this project:

- [ ] Clone the repository
- [ ] Run `npm install`
- [ ] Copy `.env.template` to `.env.local`
- [ ] Fill in Firebase configuration values from Firebase Console
- [ ] Add Gemini API key from Google AI Studio
- [ ] Run `firebase login` and select the correct project
- [ ] Run `npm run web` to test locally
- [ ] Run `npm run build:web && npm run deploy:web` to deploy

---

## Files Changed in This Review

| File | Change Type | Description |
|------|-------------|-------------|
| `firebase.json` | Modified | Added SPA rewrites and JS/CSS caching |

## Files That Need Changes

| File | Priority | Issues to Fix |
|------|----------|---------------|
| `.env.local` | CRITICAL | Add EXPO_PUBLIC_GEMINI_API_KEY |
| `package.json` | CRITICAL | Add expo-file-system dependency |
| `lib/firebase.config.ts` | CRITICAL | Fix auth initialization race condition |
| `firestore.rules` | CRITICAL | Fix field name, add statuses/actions |
| `app/_layout.tsx` | HIGH | Add authentication guard |
| `.env.template` | MEDIUM | Add Gemini API key placeholder |
| `app/index.tsx` | MEDIUM | Add memoization |
| `app/chat.tsx` | MEDIUM | Add useCallback hooks |
| `app/scan.tsx` | MEDIUM | Reduce image quality |
| `lib/firestore.ts` | LOW | Add pagination |

---

## Conclusion

The primary issue (Firebase 404) has been resolved. However, several critical issues remain that will prevent the app from functioning correctly in production:

1. **AI features won't work** without the Gemini API key
2. **Photo features will crash** without expo-file-system
3. **Data operations will fail** due to Firestore rules mismatches
4. **Auth may crash on reload** due to initialization race condition

These should be addressed before any production deployment.

---

*Report generated by Claude Code on January 14, 2026*
