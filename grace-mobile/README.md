# Grace Community Church - React Native/Expo App

A full-featured mobile application for Grace Community Church built with Expo, React Native, and TypeScript.

## Features

### Public Features
- **Home Screen**: Hero section with daily verse, quick stats, and latest updates
- **Events**: Browse and register for church events
- **Gallery**: View church photos and albums
- **Sermons**: Stream and watch recorded sermons
- **Live Worship**: Join live streaming services
- **Prayer Wall**: Share and pray for prayer requests

### Admin Features
- **Dashboard**: Admin overview and analytics
- **Events Management**: Create, edit, and manage events
- **Announcements**: Post and manage announcements
- **Sermons**: Upload and manage sermon content
- **Daily Verses**: Curate daily Bible verses
- **User Management**: Manage user roles and permissions

## Tech Stack

- **Framework**: Expo 51 & React Native
- **Navigation**: React Navigation
- **State Management**: Zustand, React Query
- **Forms**: React Hook Form + Zod
- **Styling**: React Native StyleSheet + Custom Theme
- **API**: Axios
- **Authentication**: JWT-based auth with AsyncStorage

## Project Structure

```
grace-mobile/
├── src/
│   ├── App.tsx              # Main app component
│   ├── navigation/          # Navigation setup
│   ├── screens/
│   │   ├── public/         # Public-facing screens
│   │   ├── admin/          # Admin management screens
│   │   └── auth/           # Login, Register, Profile
│   ├── components/         # Reusable components
│   ├── lib/                # Utilities, hooks, contexts
│   │   ├── api.ts         # API client
│   │   ├── auth.tsx       # Auth context
│   │   ├── admin-data-context.tsx
│   │   ├── theme.ts       # Color & typography system
│   │   └── types.ts       # TypeScript types
│   └── hooks/             # Custom React hooks
├── app.json               # Expo configuration
├── package.json           # Dependencies
└── tsconfig.json         # TypeScript config
```

## Getting Started

### Prerequisites
- Node.js >= 18
- Expo CLI: `npm install -g expo-cli`
- EAS CLI (for building): `npm install -g eas-cli`

### Installation

1. **Navigate to the project**
   ```bash
   cd grace-mobile
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create `.env` file** (copy from `.env.example`)
   ```bash
   cp .env.example .env
   ```

4. **Update environment variables**
   - Set `EXPO_PUBLIC_API_URL` to your backend URL
   - Add your Google OAuth Client ID

### Development

**Start the development server**
```bash
npm run start
# or use: expo start
```

**Run on specific platform**
```bash
# iOS (macOS only)
npm run ios

# Android
npm run android

# Web
npm run web
```

### Building

**Preview builds**
```bash
npm run build:android
npm run build:ios
```

**Production builds & submission**
```bash
npm run build
npm run publish
```

## API Integration

The app connects to your existing MongoDB backend through the API client in `src/lib/api.ts`. All endpoints from your web app are supported:

- Authentication: `/api/auth/*`
- Events: `/api/admin/events`, `/api/events`
- Announcements: `/api/admin/announcements`
- Sermons: `/api/admin/sermons`
- Verses: `/api/admin/verses`
- Prayers: `/api/prayers`
- Gallery: `/api/gallery/photos`
- Campuses: `/api/campuses`
- Users: `/api/admin/users`

## Cross-Platform Support

- **iOS**: iPhone and iPad support via Expo Go and native builds
- **Android**: Phone and tablet support via Expo Go and native builds
- **Web**: Full web support via Expo Web (experimental)

## Theme Customization

Edit `src/lib/theme.ts` to customize:
- Color palette
- Typography sizes & weights
- Shadows and spacing

## State Management

- **Auth**: Context API (`useAuth()`)
- **Admin Data**: Context API (`useAdminData()`)
- **Server State**: React Query for API calls
- **Client State**: Zustand (when needed)

## Next Steps

1. Implement detailed screens for each feature
2. Add media components (image gallery, video player)
3. Set up push notifications
4. Implement offline-first functionality
5. Add analytics tracking
6. Set up CI/CD with EAS Build

## License

Proprietary - Grace Community Church

## Support

For issues or questions, contact the development team.
