# Home iOS App — Build Instructions

## What You Have Now

✅ **Capacitor iOS Project** created at `/home-app/ios/`
✅ **Xcode Project** ready to open
✅ **Mobile-optimized UI** at `/mobile` route
✅ **Static export** configured for App Store

## Quick Start

### Step 1: Open in Xcode
```bash
cd /Users/alexenright/.openclaw/workspace/home-app/ios/App
open App.xcodeproj
```

### Step 2: Configure Signing
1. In Xcode, select **App** project → **Signing & Capabilities**
2. Select your **Team** (your Apple Developer account)
3. Update **Bundle Identifier** if needed (default: `com.opc.home`)

### Step 3: Build & Run
1. Select a device/simulator
2. Press **Cmd+R** to run
3. Test the app on your iPhone

## App Features

- **Authentication**: Login/signup with Supabase
- **Dashboard**: View and manage your links
- **Add Links**: Create new links with title + URL
- **Delete Links**: Swipe or tap to remove
- **Public Profile**: View your public page
- **Responsive**: Designed for mobile-first

## Before App Store Submission

### Required Assets
- [ ] App Icon (1024×1024 PNG) → See `AppIcon.appiconset`
- [ ] Launch Screen (already configured)
- [ ] Screenshots (iPhone 6.7", 6.5", 5.5") 
- [ ] App Store description

### Privacy Settings
App uses:
- **Authentication** (Supabase)
- **Network requests** (fetch links)
- **Local storage** (session persistence)

No camera, microphone, or location access required.

## Rebuilding After Changes

When you update the web app:

```bash
cd /Users/alexenright/.openclaw/workspace/home-app

# 1. Build the web app
npm run build

# 2. Sync to iOS
npx cap sync ios

# 3. Open Xcode and build
npx cap open ios
```

## Project Structure

```
home-app/
├── ios/                    ← Xcode project
│   └── App/
│       ├── App.xcodeproj
│       └── App/
│           ├── public/     ← Built web app
│           └── Info.plist
├── src/
│   ├── components/
│   │   ├── MobileDashboard.tsx   ← Main app UI
│   │   └── MobileLogin.tsx       ← Auth screen
│   └── app/
│       └── mobile/
│           └── page.tsx          ← Entry point
└── out/                    ← Built static files
```

## Next Steps

1. **Test locally** on your iPhone via USB
2. **Create App Store Connect** record
3. **Archive & Upload** via Xcode
4. **Submit for review**

Estimated time to App Store: **1-2 days** (assuming you have Apple Developer account)

---

Ready to open Xcode? Run: `npx cap open ios`
