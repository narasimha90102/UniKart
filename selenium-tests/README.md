# UniKart Web Application - Selenium E2E Testing Suite

This repository hosts the automated, end-to-end (E2E) testing suite for the UniKart web application. It automates key customer journeys (sign-up, login, marketplace search, details, cart manipulation, and sell posting) and generates styled reports analyzing the run statistics.

## Tech Stack
- **Node.js**
- **Selenium WebDriver** (Automates browser testing)
- **ExcelJS** (Generates rich spreadsheet reports)

---

## Setup Instructions

### 1. Prerequisites
- **Node.js** (v18 or higher recommended)
- **Google Chrome** browser installed
- **Vite Frontend Server** and **Express Backend Server** running locally.
  - Run `npm run dev` in the root workspace to launch them on `http://localhost:5173` and `http://localhost:5000` respectively.

### 2. Install Dependencies
Change directory to `selenium-tests` and install the package requirements:
```bash
cd selenium-tests
npm install
```

### 3. Database Seeding (Crucial)
Before running the tests, run the test seeding script in the backend to ensure the databases contain verified, pre-approved test accounts (`testuser@unikart.com` and `admin@unikart.com`):
```bash
# From the root of the UniKart2 workspace
node backend/scripts/seed-test-users.js
```

---

## Running the E2E Tests

To trigger the full suite, execute:
```bash
npm test
```

The browser will run headlessly, simulating:
1. **Signup Verification:** Fills user signup details and checks validations.
2. **Login Verification:** Logins using `testuser@unikart.com`.
3. **Marketplace Navigation:** Navigates to `/marketplace` and searches for items.
4. **Product Details:** Details page viewing.
5. **Cart Operations:** Adds product to `/cart` and validates the layout.
6. **Sell Product Creation:** Lists a new test product, uploads a dummy image.
7. **Admin Dashboard:** Logins as `admin@unikart.com` and checks administrative pages.

---

## Excel Analysis Reports
After test execution, a reports folder is automatically generated:
- File location: `./reports/web_test_report.xlsx`
- If any test fails, a screenshot of the browser during failure is saved at: `./reports/failure_WEB-TC-XXX.png`

The Excel spreadsheet includes:
- **Title Banner:** Indigo branded headers.
- **Summary Section:** Cards mapping Total, Passed, Failed, and overall Pass Rate percentage.
- **Data Table:** Row-by-row mapping of test execution name, category/module, success status, duration, timestamp, and exception messages if failed.
