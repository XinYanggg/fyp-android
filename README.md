# durian.health (Android)

The mobile companion to the [durian.health](../../fyp-website) web app. It lets durian farmers diagnose leaf diseases with their phone camera, manage farms and trees, and share farms with their team. The app is a client only: all data and AI inference go through the durian.health Next.js backend.

## Key Features

-   **AI Disease Scanner**: Take or pick a photo of a durian leaf and get a disease label with a confidence score. Results with 0% confidence cannot be saved.
-   **Farm Management**: Create farms and register trees (`Tree ID`, `Cultivar`).
-   **Scan History**: Save diagnoses to a tree and review its full history.
-   **Team Collaboration**: The farm owner can add and remove members by email.
-   **Authentication**: Email/password registration (with email verification) and Google Sign-In. The app requires an account; signed-out users only see the welcome screen.

## Tech Stack

-   **Framework**: [Expo](https://expo.dev) SDK 58 / React Native 0.88
-   **Language**: TypeScript
-   **Routing**: [Expo Router](https://docs.expo.dev/router/introduction) (file-based, protected routes)
-   **Auth**: Backend-issued JWT stored in `expo-secure-store`, native Google Sign-In (`@react-native-google-signin/google-signin`)
-   **Icons / graphics**: `lucide-react-native`, `react-native-svg`

## Project Structure

```
src/
├── app/                # Screens (Expo Router)
│   ├── welcome.tsx     # Intro + login/register (signed-out only)
│   ├── (tabs)/         # Dashboard, Farms, Scan, Profile
│   └── farm/[id].tsx   # Farm detail: trees, scan history, members
├── components/         # Shared UI (LoginModal, StatusBadge, ...)
├── constants/          # Theme and disease information
├── context/            # AuthContext, FarmContext
├── services/api.ts     # Backend API client
└── types/              # Shared TypeScript types
```

## Prerequisites

-   Node.js 20+ and npm
-   Android Studio (SDK + emulator) or a physical Android device
-   The [durian.health web backend](https://github.com/XinYanggg/fyp-website) running or deployed
-   A Google Cloud project with OAuth credentials (see [Google Sign-In](#google-sign-in))

## Getting Started

1. Install dependencies

    ```bash
    npm install
    ```

2. Create `.env.local` (see [Environment Variables](#environment-variables))

3. Build and run on a device or emulator

    ```bash
    npx expo run:android
    ```

    Google Sign-In uses native code, so **Expo Go is not supported**. Use a development build as above.

4. For later JS-only changes, start the dev server:

    ```bash
    npx expo start -c
    ```

## Environment Variables

Create `.env.local` in the project root (it is git-ignored). Variables prefixed with `EXPO_PUBLIC_` are bundled into the app, so **never put secrets here**. Restart Metro with `-c` after changing them.

| Variable                           | Description                                                                                     |
| ---------------------------------- | ----------------------------------------------------------------------------------------------- |
| `EXPO_PUBLIC_API_URL`              | Base URL of the web backend, e.g. `https://your-domain.com`. If unset, falls back to `http://10.0.2.2:3000` (Android emulator to host machine). |
| `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` | The **Web** OAuth client ID. Must equal `GOOGLE_CLIENT_ID` on the backend.                      |

```bash
EXPO_PUBLIC_API_URL=http://192.168.1.10:3000
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=xxxxxxxx.apps.googleusercontent.com
```

For a physical device on the same Wi-Fi during development, use your computer's LAN IP (not `localhost`).

## Google Sign-In

The app signs in natively, then sends the Google ID token to the backend (`POST /api/mobile/google`), which verifies it and returns an app session token.

1. In Google Cloud Console, keep the existing **Web** client (its ID goes in `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` and the backend's `GOOGLE_CLIENT_ID`).
2. Create an **Android** OAuth client with package name `com.durianhealth.app` and the SHA-1 of your signing key:

    ```bash
    cd android && ./gradlew signingReport
    ```

    Add the SHA-1 of every key you ship with (debug, release, and the Play App Signing key if you use the Play Store).

## Backend Requirements

The app talks to these endpoints on the web backend:

| Endpoint                                  | Purpose                                |
| ----------------------------------------- | -------------------------------------- |
| `POST /api/mobile/login`                  | Email/password login                   |
| `POST /api/mobile/google`                 | Google login (ID token exchange)       |
| `GET  /api/mobile/me`                     | Validate session / fetch current user  |
| `POST /api/register`                      | Register (sends verification email)    |
| `GET  /api/farm/get`, `POST /api/farm/add`| List and create farms                  |
| `POST /api/farm/tree/add`                 | Add a tree                             |
| `POST /api/farm/member/add`, `.../remove` | Manage members (owner only)            |
| `POST /api/scan/detect`, `/api/scan/save` | Run AI diagnosis, save a scan          |

For production, make sure the backend's `NEXT_APP_URL` is a public HTTPS URL, since verification and password-reset emails link to it.

## Scripts

```bash
npm run android      # build and run on Android (expo run:android)
npm start            # start the Metro dev server
npm run lint         # lint
npx tsc --noEmit     # type check
```

## Installing the App (APK)

The app is distributed as an APK through [GitHub Releases](../../releases), not the Play Store.

1. Open the latest release on your Android phone and download `durian-health.apk`.
2. Open the file. If prompted, allow "Install unknown apps" for your browser or file manager.
3. Launch **durian.health** and sign in.

## Publishing a Release (maintainers)

A GitHub Actions workflow (`.github/workflows/android-release.yml`) builds and signs the APK, then attaches it to a GitHub Release.

**One-time setup**

1. Create a release keystore and keep it somewhere safe (it is git-ignored). Losing it means users can no longer update the app in place.

    ```bash
    keytool -genkeypair -v -storetype PKCS12 -keystore durian-release.jks \
      -alias durian -keyalg RSA -keysize 2048 -validity 10000
    keytool -list -v -keystore durian-release.jks -alias durian   # note the SHA-1
    ```

2. Add the SHA-1 to the **Android OAuth client** in Google Cloud Console (package `com.durianhealth.app`), otherwise Google Sign-In fails in the released app.
3. In the repo, go to **Settings, Secrets and variables, Actions** and add:

    | Secret                             | Value                                         |
    | ---------------------------------- | --------------------------------------------- |
    | `ANDROID_KEYSTORE_BASE64`          | `base64 -i durian-release.jks \| pbcopy`      |
    | `ANDROID_KEYSTORE_PASSWORD`        | The keystore password                         |
    | `ANDROID_KEY_ALIAS`                | `durian`                                      |
    | `EXPO_PUBLIC_API_URL`              | Your deployed `https://` backend URL          |
    | `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` | The Web OAuth client ID                       |

**Releasing**

```bash
# bump "version" and android.versionCode in app.json first
# (versionCode must increase for phones to update in place), then:
git tag v1.0.0
git push origin v1.0.0
```

The release appears under **Releases** after a few minutes. You can also run the workflow manually from the **Actions** tab to get the APK as a build artifact.

## Notes

-   The app has no offline mode; a network connection to the backend is required.
-   Only the farm owner can add or remove members.

## Author

Farn Xin Yang | TP074541. Developed under the supervision of Dr. Kulothunkan A/L Palasundram.

SDG 12: Responsible Consumption and Production

## License

See [LICENSE](LICENSE).
