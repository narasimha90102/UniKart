# UniKart Android Application - Appium E2E Testing Suite

This repository hosts the automated, end-to-end (E2E) testing suite for the UniKart Android mobile application. It automates key flows on a mobile emulator (signup validation, login, feed scrolling, item search, sell posting, and logout) and outputs styled reports in Microsoft Excel format.

## Tech Stack
- **Node.js**
- **WebdriverIO** (Modern Appium client)
- **Appium Server** (Mobile automation server)
- **ExcelJS** (Excel report generation)

---

## Setup Instructions

Running mobile E2E tests requires configuring the Android emulator environment.

### 1. Prerequisites
- **Node.js** (v18 or higher)
- **Java Development Kit (JDK)** (v17 or higher)
- **Android Studio** & **Android SDK** configured with `ANDROID_HOME` environment variable.
- A running **Android Emulator** or physical Android device connected via ADB.
- Appium Server installed globally:
  ```bash
  npm install -g appium
  ```
- Appium UiAutomator2 Driver installed:
  ```bash
  appium driver install uiautomator2
  ```

### 2. Compile the Mobile App APK
To test the app, you need to compile it into an APK file.
Run the following in the `unikart-mobile` folder:
```bash
cd unikart-mobile
# On Windows PowerShell
./gradlew assembleDebug
# Or run: npm run android (which will trigger a build and emulator deployment)
```
Verify that the APK file is successfully generated at:
`unikart-mobile/android/app/build/outputs/apk/debug/app-debug.apk`

### 3. Install Test Dependencies
Navigate to the `appium-tests` directory and install the requirements:
```bash
cd appium-tests
npm install
```

### 4. Database Seeding
Run the database test seeding script to create test accounts in the database:
```bash
# From the root of the UniKart2 workspace
node backend/scripts/seed-test-users.js
```

---

## Running the E2E Tests

### Step A: Start the Appium Server
Open a terminal and start the Appium server on default port `4723`:
```bash
appium
```

### Step B: Launch the Emulator
Make sure your Android Emulator is active and recognized by adb:
```bash
adb devices
```

### Step C: Execute Tests
Run the test runner script:
```bash
npm test
```

The automation will:
1. Launch the UniKart app on your emulator.
2. **Registration Checks:** Navigate to sign up, confirm fields, and return.
3. **Login Flow:** Log in as `testuser@unikart.com` / `TestPassword123!`.
4. **Scrolling Home Feed:** Perform swipe gestures to scroll through listings.
5. **Product Search:** Navigate to Search and filter items.
6. **Sell Listing:** Navigate to Sell page, enter item info, and list a product.
7. **Logout Flow:** Open Profile and log out.

---

## Excel Reports & Screenshots
After execution, a reports folder is automatically generated:
- File location: `./reports/mobile_test_report.xlsx`
- Failure states will capture screen dumps at: `./reports/failure_MOB-TC-XXX.png`

The report structure matches the Web E2E report, highlighting pass/fail counts, execution timings, and detailed stack-traces for failing elements.
