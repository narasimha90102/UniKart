# UniKart Real Mobile App - Installation & Developer Guide

This directory contains the source code and configuration for the fully native React Native mobile application for UniKart.

---

## 📱 How to Install the APK on Your Android Mobile
1. **Enable Unknown Sources**: Go to **Settings** > **Security** > **Install Unknown Apps** on your Android device and allow installations from your browser/file manager.
2. **Download the APK**: Open the following link in your mobile browser to download the compiled native APK directly:
   * **Direct Link**: [https://lucky-eagle-23.loca.lt/unikart-native.apk](https://lucky-eagle-23.loca.lt/unikart-native.apk)
3. **Install & Launch**: Tap the downloaded `.apk` file to install it, then open **UniKart** from your launcher!

---

## 🛠️ Developer Setup & Running Locally
If you want to run the React Native application in development mode with hot reloading:

### 1. Prerequisites
Ensure you have the following installed on your machine:
* **Node.js** (v18 or higher)
* **Android Studio & SDK** (configured with target API level 34+)
* **Java Development Kit (JDK 17)**

### 2. Install Dependencies
Run the following inside the `unikart-mobile/` directory:
```bash
cd unikart-mobile
npm install
```

### 3. Start Metro Bundler
Start the local packager:
```bash
npm start
```

### 4. Build and Run on Emulator/Device
In a separate terminal, launch the application on a connected Android device or emulator:
```bash
# Set JAVA_HOME to JDK 17
$env:JAVA_HOME="C:\Program Files\Java\jdk-17"

# Build and run
npx react-native run-android
```

---

## 📦 Compiling APK and AAB from Source
To compile clean production builds manually:

1. Navigate to the `unikart-mobile/android` directory.
2. Clear the Gradle cache and build outputs:
   ```powershell
   ./gradlew clean
   ```
3. Compile the debug or release APK:
   ```powershell
   # Compile Debug APK (outputs to android/app/build/outputs/apk/debug/app-debug.apk)
   ./gradlew assembleDebug

   # Compile Release Bundle AAB (outputs to android/app/build/outputs/bundle/release/app-release.aab)
   ./gradlew bundleRelease
   ```
