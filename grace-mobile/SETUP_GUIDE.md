# Grace Community Mobile App - Setup & Migration Guide

## Overview

This is a **React Native/Expo** conversion of the Grace Community Church web app. It provides full feature parity across iOS, Android, and Web platforms while reusing your existing MongoDB backend.

## Quick Start

### 1. Install Dependencies

```bash
cd grace-mobile
npm install
```

### 2. Configure Environment

Create a `.env` file from the template:

```bash
cp .env.example .env
```

**Update with your values:**
```
EXPO_PUBLIC_API_URL=http://your-backend-url:3000
EXPO_PUBLIC_GOOGLE_CLIENT_ID=your-google-oauth-client-id
EXPO_PUBLIC_APP_NAME=Grace Community
```

### 3. Start Development

```bash
# Start Expo server
npm run start

# Run on iOS (macOS only)
npm run ios

# Run on Android
npm run android

# Run on Web
npm run web
```

## Architecture Overview

### Navigation Structure

```
RootNavigator
├── Unauthenticated
│   ├── LoginScreen
│   ├── RegisterScreen
│   └── PublicTabsNavigator (Browse Only)
│       ├── Home
│       ├── Events
│       ├── Gallery
│       ├── Live Stream
│       └── Prayer Wall
│
└── Authenticated
    ├── User Role
    │   ├── PublicTabsNavigator (Full Access)
    │   ├── EventDetail
    │   ├── SermonDetail
    │   └── Profile
    │
    └── Admin Role
        ├── AdminDrawerNavigator
        │   ├── Dashboard
        │   ├── Events Management
        │   ├── Announcements
        │   ├── Sermons
        │   ├── Verses
        │   └── Users
        └── Profile
```

## Key Components

### State Management

#### Authentication
- **File**: `src/lib/auth.tsx`
- **Context**: `useAuth()`
- **Storage**: AsyncStorage (persisted across app sessions)
- **Flow**: Login → Store JWT → Auto-login on app open

```typescript
const { user, isSignedIn, login, logout, register } = useAuth();
```

#### Admin Data
- **File**: `src/lib/admin-data-context.tsx`
- **Context**: `useAdminData()`
- **Caching**: React Query for background updates
- **Sync**: Auto-refetch on app focus

```typescript
const { events, announcements, sermons, campuses, isLoading } = useAdminData();
```

### API Client
- **File**: `src/lib/api.ts`
- **Method**: Axios with interceptors
- **Auth**: JWT tokens automatically injected
- **Base URL**: From environment variable

### Styling System
- **File**: `src/lib/theme.ts`
- **Approach**: React Native StyleSheet + custom theme object
- **Colors**: Consistent with web app dark theme
- **Responsive**: Manual breakpoints using platform detection

## Web App to React Native Migration

### What Changed

| Web (Next.js) | Mobile (React Native) | Notes |
|---|---|---|
| `next/link` | `@react-navigation` | Navigation stack-based |
| CSS/Tailwind | `StyleSheet` + theme | No cascading styles |
| `localStorage` | `AsyncStorage` | Async storage access |
| HTML elements | React Native components | `View`, `Text`, `Pressable` |
| Vercel deployment | EAS Build/Expo | Native builds via Expo |
| API routes | Same backend | All endpoints reused |

### Component Conversion Examples

#### Web (Next.js)
```tsx
export function EventCard({ event }: { event: Event }) {
  return (
    <div className="p-6 rounded-lg border bg-card">
      <h3 className="text-lg font-semibold">{event.title}</h3>
      <p className="text-muted-foreground">{event.date}</p>
      <Link href={`/events/${event.id}`}>
        <button>View Details</button>
      </Link>
    </div>
  );
}
```

#### Mobile (React Native)
```tsx
export function EventCard({ event, onPress }: { event: Event; onPress: () => void }) {
  return (
    <Pressable
      style={styles.card}
      onPress={onPress}
    >
      <Text style={styles.title}>{event.title}</Text>
      <Text style={styles.date}>{event.date}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 8,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  title: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.foreground,
  },
  date: {
    fontSize: fontSize.sm,
    color: colors.mutedForeground,
    marginTop: 8,
  },
});
```

## Building for Production

### Android

```bash
# First time setup
npm run prebuild

# Build APK (for testing)
npm run build:android

# Or with EAS CLI
eas build --platform android
```

### iOS (requires macOS and Apple Developer Account)

```bash
# First time setup
npm run prebuild

# Build for TestFlight
npm run build:ios

# Or with EAS CLI
eas build --platform ios
```

### Web

```bash
# Static export
npm run web

# Deploy to Vercel, Netlify, etc.
```

## Development Workflow

### Adding a New Screen

1. **Create screen component**
   ```bash
   touch src/screens/public/NewScreen.tsx
   ```

2. **Implement with theme**
   ```tsx
   import { colors, fontSize, fontWeight } from "@/lib/theme";
   import { StyleSheet, View, Text } from "react-native";

   export default function NewScreen() {
     return (
       <View style={styles.container}>
         <Text style={styles.title}>New Screen</Text>
       </View>
     );
   }

   const styles = StyleSheet.create({
     container: {
       flex: 1,
       backgroundColor: colors.background,
       padding: 16,
     },
     title: {
       fontSize: fontSize["2xl"],
       fontWeight: fontWeight.bold,
       color: colors.foreground,
     },
   });
   ```

3. **Add to navigation**
   ```tsx
   // In src/navigation/RootNavigator.tsx
   import NewScreen from "@/screens/public/NewScreen";

   <Tab.Screen
     name="New"
     component={NewScreen}
     options={{ title: "New" }}
   />
   ```

### Debugging

#### Debug Mode
```bash
npm run start -- --dev-client
```

#### React DevTools
1. Install: `npm install -g react-devtools`
2. Run: `react-devtools`
3. App will auto-connect

#### Network Inspector
Use Expo DevTools built into the app:
- Shake device or press `Ctrl+M` (Android)
- Shake device or press `Cmd+D` (iOS)
- Select "Network"

## Common Issues & Solutions

### Issue: API calls failing on device
**Solution**: Update `EXPO_PUBLIC_API_URL` to your server's IP (not localhost)
```
EXPO_PUBLIC_API_URL=http://192.168.1.100:3000
```

### Issue: Builds failing with TypeScript errors
**Solution**: Check tsconfig.json and ensure all imports use correct path aliases
```bash
npm run build -- --fix
```

### Issue: Styles not applying
**Solution**: Verify you're using `StyleSheet.create()` and referencing styles correctly
```tsx
// ✅ Correct
<View style={styles.container}>

// ❌ Wrong
<View style={{ padding: 16 }} />  // Inline objects rerender every time
```

## Testing

### Unit Tests
```bash
npm test
```

### E2E Tests (Detox)
```bash
# Setup
npm install detox-cli --global
detox build-framework-cache
detox build-app --configuration ios.sim.debug

# Run
detox test --configuration ios.sim.debug --cleanup
```

## Deployment

### Prepare for Submission

1. **Update version numbers**
   ```json
   // app.json
   {
     "expo": {
       "version": "1.0.0",
       "ios": { "buildNumber": "1" },
       "android": { "versionCode": 1 }
     }
   }
   ```

2. **Test on real devices**
   ```bash
   eas build --platform ios --auto-submit
   eas build --platform android --auto-submit
   ```

3. **Submit to stores**
   ```bash
   eas submit --platform ios
   eas submit --platform android
   ```

## File Structure Reference

```
grace-mobile/
├── src/
│   ├── App.tsx                    # Entry point
│   ├── index.js                   # Expo entry
│   ├── navigation/
│   │   └── RootNavigator.tsx      # Navigation setup
│   ├── screens/
│   │   ├── public/               # Public screens
│   │   ├── admin/                # Admin screens
│   │   └── auth/                 # Auth screens
│   ├── components/               # Reusable components
│   ├── lib/
│   │   ├── api.ts               # API client
│   │   ├── auth.tsx             # Auth context
│   │   ├── admin-data-context.tsx
│   │   ├── theme.ts             # Colors & typography
│   │   └── types.ts             # TypeScript types
│   └── hooks/                    # Custom hooks
├── app.json                      # Expo config
├── package.json                  # Dependencies
├── tsconfig.json                # TypeScript config
├── .env.example                 # Environment template
└── README.md                    # Documentation
```

## Next Steps

1. ✅ **Foundation**: Navigation, auth, API client
2. 🔄 **In Progress**: Screen implementations
3. 📋 **TODO**: 
   - Complete all screen UIs
   - Add form validation
   - Implement video players (YouTube, streaming)
   - Add push notifications
   - Offline-first support
   - Analytics integration
   - App store review preparation

## Additional Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Docs](https://reactnative.dev/)
- [React Navigation](https://reactnavigation.org/)
- [EAS Build](https://docs.expo.dev/build/introduction/)

## Support & Contributions

For questions or issues:
1. Check the troubleshooting section above
2. Review Expo/React Native docs
3. Contact the development team

---

**Last Updated**: 2026-06-18  
**Version**: 1.0.0  
**Status**: Active Development
