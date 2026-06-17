# UniKart Android Application - Appium E2E Testing Suite (Python)

This repository hosts the automated, end-to-end (E2E) testing suite for the UniKart Android mobile application, implemented in Python. It automates key user flows on a mobile emulator (registration verification, customer login, home feed scrolling, search, product listing creation, and logout verification) and outputs styled Excel reports.

## Tech Stack
- **Python** (v3.8 or higher)
- **Appium Python Client** (Python client interface for Appium)
- **Appium Server** (Mobile automation server)
- **openpyxl** (Excel report generation library)

---

## Setup Instructions

Running mobile E2E tests requires configuring the Android emulator and Appium environment.

### 1. Prerequisites
- **Python** (v3.8 or higher)
- **Java Development Kit (JDK)** (v17 or higher)
- **Android Studio** & **Android SDK** configured with the `ANDROID_HOME` environment variable.
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
To test the app, compile it into an APK file.
Run the following in the `unikart-mobile` folder:
```bash
cd unikart-mobile
# On Windows PowerShell
./gradlew assembleDebug
# Or run: npm run android (which will trigger a build and emulator deployment)
```
Verify that the APK file is successfully generated at:
`unikart-mobile/android/app/build/outputs/apk/debug/app-debug.apk`

### 3. Install Python Dependencies
Navigate to the `appium-tests` directory and install the requirements:
```bash
cd appium-tests

# (Optional but recommended) Set up virtual environment
python -m venv venv
# On Windows PowerShell
.\venv\Scripts\activate
# On Linux/macOS
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
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

#### Running in Dry Run Mode (105 Tests)
Simulates test execution and produces a detailed Excel report immediately (no emulator or Appium server required):
```bash
# On Windows PowerShell
$env:DRY_RUN="true"
python mobile_e2e_test.py
```

#### Running in Live Mode
Executes the live Appium tests on the emulator:
```bash
# On Windows PowerShell
$env:DRY_RUN="false"
python mobile_e2e_test.py
```

The automation will execute:
1. **Verify Register Screen Fields:** Navigate to sign up, confirm fields, and return.
2. **Mobile Login Flow:** Log in as `testuser@unikart.com` / `TestPassword123!`.
3. **Verify Product Listings Feed:** Perform swipe gestures to scroll through listings.
4. **Mobile Product Search:** Navigate to Search and filter items.
5. **Mobile Create Listing Flow:** Navigate to Sell page, enter item details, and list a product.
6. **Logout Verification:** Open Profile and log out.

---

## Excel Reports & Screenshots
After execution, a reports folder is automatically generated:
- File location: `./reports/mobile_test_report.xlsx`
- Failure states will capture screen dumps at: `./reports/failure_MOB-TC-XXX.png`

The report structure highlights pass/fail counts, execution timings, and detailed stack-traces for failing elements.
