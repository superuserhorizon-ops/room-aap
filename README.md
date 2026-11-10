# Rooms (React Native / Expo)
Simple team task app. All data is stored on the device (AsyncStorage). No server.
1. Push this folder to the root of a GitHub repo (branch `main`).
2. Actions tab -> "Build Android APK" (runs on push, or Run workflow). Takes 10-20 min.
3. Download the `rooms-apk` artifact, unzip, install `app-release.apk` (arm64 phones).
Run locally: `npm install && npx expo start` (Expo Go).
Note: rooms are local to one phone. Sharing rooms between phones needs a backend (Firebase/Supabase).
