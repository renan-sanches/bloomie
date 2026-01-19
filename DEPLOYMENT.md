# Deployment Guide

## Web Deployment (Firebase Hosting)

The web application is built using Expo Router and deployed to Firebase Hosting as a Single Page Application (SPA).

### Prerequisites

1.  **Environment Variables**:
    The build process (`npx expo export`) requires environment variables to be present. These are baked into the static files.

    You **must** have a `.env` (or `.env.local`) file in the root directory with the following keys:

    ```bash
    EXPO_PUBLIC_FIREBASE_API_KEY=...
    EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=...
    EXPO_PUBLIC_FIREBASE_PROJECT_ID=...
    EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=...
    EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
    EXPO_PUBLIC_FIREBASE_APP_ID=...
    EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=...
    EXPO_PUBLIC_GEMINI_API_KEY=... (Optional but recommended for AI features)
    ```

    **Crucial**: If these variables are missing during the build, the app will crash at runtime with an error about missing configuration.

2.  **Firebase CLI**:
    Ensure you have firebase-tools installed and logged in.
    ```bash
    npm install -g firebase-tools
    firebase login
    ```

### Deployment Steps

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Build the Web App**:
    This generates the `dist` folder.
    ```bash
    npm run build:web
    ```
    *Check the output for any warnings about missing environment variables.*

3.  **Deploy to Firebase**:
    ```bash
    npm run deploy:web
    ```

### CI/CD

If deploying via GitHub Actions or another CI provider, ensure the `EXPO_PUBLIC_` environment variables are set in the CI environment secrets. Expo will pick them up from `process.env` during the build.
