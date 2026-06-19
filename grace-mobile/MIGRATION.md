# Expo/React Native Version
This directory contains the React Native/Expo version of the Grace Community Church app.

## Quick Links
- [Setup Guide](./SETUP_GUIDE.md) - Complete setup and development guide
- [Main README](./README.md) - Project overview and features

## Key Differences from Web App

### Platform Support
- **Web**: Next.js, Vercel deployment
- **Mobile**: iOS, Android, Web (via Expo Web)

### Technology Stack
- **Web**: React, Next.js, Tailwind CSS, Vercel
- **Mobile**: React Native, Expo, StyleSheet, EAS Build

### Navigation
- **Web**: File-based routing
- **Mobile**: Stack/Tab/Drawer navigation

### Storage
- **Web**: localStorage (browser)
- **Mobile**: AsyncStorage (persistent)

### Styling  
- **Web**: Tailwind CSS classes
- **Mobile**: React Native StyleSheet + custom theme

## Getting Started

```bash
# Install and setup
cd grace-mobile
npm install
cp .env.example .env

# Update .env with your backend URL
EXPO_PUBLIC_API_URL=http://your-backend-url:3000

# Start development
npm run start
npm run ios      # or android/web
```

For detailed instructions, see [SETUP_GUIDE.md](./SETUP_GUIDE.md).

## File Organization

```
├── src/
│   ├── navigation/    # React Navigation setup
│   ├── screens/       # Screen components (public, admin, auth)
│   ├── components/    # Reusable components
│   ├── lib/          # Utilities, API, contexts
│   └── hooks/        # Custom React hooks
├── app.json          # Expo configuration
└── package.json      # Dependencies
```

## Build & Deployment

- **Development**: `npm run start`
- **Testing**: `npm run build:android/ios`
- **Production**: `eas build && eas submit`

See [SETUP_GUIDE.md](./SETUP_GUIDE.md#building-for-production) for full build instructions.
