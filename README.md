# Bloomie 🌱

A modern plant care companion app built with React Native (Expo Router) and Firebase.

## Features

- 🔐 **Firebase Authentication** - Email/password and Google Sign-In
- 🌿 **Plant Management** - Track your plant jungle with detailed care schedules
- 📅 **Care Calendar** - Never miss watering, misting, or fertilizing
- 📸 **Plant Scanner** - Identify plants and diagnose health issues
- 🎨 **Modern UI** - Beautiful Stitch-inspired design with vibrant colors
- 🌐 **Cross-Platform** - iOS, Android, and Web support

## Tech Stack

- **Framework**: React Native with Expo SDK 51
- **Routing**: Expo Router (file-based routing)
- **Styling**: NativeWind (Tailwind CSS for React Native)
- **Backend**: Firebase (Auth + Firestore)
- **Deployment**: Firebase Hosting (Web)

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Expo CLI
- Firebase account

### Installation

1. Clone the repository:
```bash
git clone https://github.com/YOUR_USERNAME/bloomie.git
cd bloomie
```

2. Install dependencies:
```bash
npm install
```

3. Configure Firebase:
   - Copy `.env.template` to `.env.local`
   - Add your Firebase credentials from Firebase Console

4. Start the development server:
```bash
npm start
```

## Project Structure

```
bloomie/
├── app/                    # Expo Router screens
│   ├── auth/              # Authentication screens
│   ├── plant/             # Plant detail screens
│   ├── _layout.tsx        # Tab navigation
│   ├── index.tsx          # My Jungle dashboard
│   ├── calendar.tsx       # Care schedule
│   ├── scan.tsx           # Plant scanner
│   ├── discover.tsx       # Discovery & shop
│   └── profile.tsx        # User profile
├── lib/                   # Business logic
│   ├── auth.ts           # Firebase Auth helpers
│   ├── firebase.config.ts # Firebase initialization
│   ├── app-provider.tsx  # App context
│   └── store.ts          # Type definitions
├── components/            # Reusable UI components
├── assets/               # Images, fonts, etc.
└── firebase.json         # Firebase config
```

## Available Scripts

- `npm start` - Start Expo development server
- `npm run ios` - Run on iOS simulator
- `npm run android` - Run on Android emulator
- `npm run web` - Run in web browser
- `npm run build:web` - Build for web deployment
- `npm run deploy:web` - Deploy to Firebase Hosting

## Deployment

### 🌐 Web (Firebase Hosting)

1.  **Preparation**:
    ```bash
    npm run build:web
    ```
2.  **Deployment**:
    ```bash
    npm run deploy:web
    ```
    *Note: Requires `firebase login` and project initialization.*

### 📱 Mobile (EAS Build)

1.  **Setup**:
    ```bash
    npm install -g eas-cli
    eas login
    eas build:configure
    ```
2.  **Build**:
    - Android: `eas build --platform android`
    - iOS: `eas build --platform ios`
3.  **Submit**:
    ```bash
    eas submit
    ```

## Design System

The app uses a custom design system inspired by the Stitch concept:

- **Colors**: Vibrant greens, pinks, purples, and oranges
- **Typography**: Plus Jakarta Sans, Quicksand, Noto Sans
- **Components**: Glassmorphism effects, rounded corners, soft shadows

## Firebase Setup

1. Create a Firebase project at https://console.firebase.google.com/
2. Enable Authentication (Email/Password, Google)
3. Enable Cloud Firestore
4. Enable Firebase Hosting
5. Copy your web app credentials to `.env.local`

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT

## Acknowledgments

- Design inspiration from Stitch UI concept
- Built with Expo and Firebase