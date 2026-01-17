# Expense Tracker Mobile App

## App Overview

The Expense Tracker Mobile App is a client-side interface designed to help users track and analyze their financial expenses by processing PDF bank/credit card statements. Instead of manual entry, users upload a PDF statement, which is securely transmitted to a backend for parsing and categorization. The app visualizes this data, providing insights into spending habits.

**Target Users:** Individuals seeking an automated, low-effort way to track expenses from monthly generic bank statements.
**Core Problem:** Manual expense tracking is tedious and prone to error. Existing banking apps often lack unified views across multiple banks or custom categorization logic.
**Current Status:** **Work in Progress (WIP)**. Core flows (Auth, Upload, List View) are implemented, but refinement and advanced analytics are ongoing.

---

## Architecture Overview

This project follows a **Thin Client, Thick Server** architecture.

> **Crucial Architecture Principle:** The React Native app is intentionally a **thin UI layer**. All PDF unlocking, parsing, categorization, and business logic are handled by the backend. **No expense processing logic should live in the mobile app.**

*   **React Native (Expo):** The mobile app acts primarily as a presentation layer. It handles user authentication, file selection (PDFs), and data visualization (charts, lists). It contains minimal business logic.
*   **Backend (Next.js API):** The backend is responsible for the heavy lifting: PDF file parsing, text extraction, transaction categorization (AI/Heuristic), and data persistence.
*   **Database (MongoDB Atlas):** Stores user profiles, processed transaction data, and statement metadata.
*   **Data Flow:**
    1.  User selects a PDF in the mobile app.
    2.  App sends the file (and password if encrypted) to the backend API.
    3.  Backend processes the file and saves structured data to MongoDB.
    4.  Backend returns a success response; App fetches updated JSON data for display.

---

## Tech Stack

*   **Frontend Framework:** React Native (via Expo SDK 52)
*   **Language:** TypeScript
*   **UI System:** Material Design 3 (using `react-native-paper`)
*   **Navigation:** React Navigation (Stack)
*   **State Management:** Zustand
*   **Network:** Axios
*   **Backend:** Next.js / Node.js (Separate repository)
*   **Database:** MongoDB Atlas

---

## Project Structure

*   **`src/screens`**: Full-page views (e.g., `SignIn.tsx`, `History.tsx`, `UploadPdf.tsx`). Each screen corresponds to a route in the navigator.
*   **`src/components`**: Reusable UI elements (e.g., `Input.tsx`, `Button.tsx`). These should be dumb components driven by props.
*   **`src/navigation`**: Navigation configuration, including the `RootNavigator` and authentication guard logic.
*   **`src/store`**: Global state definitions using Zustand (e.g., `authStore.ts` for user session management).
*   **`src/services`**: API interaction layer. Contains `api.ts` for standardized HTTP requests to the backend.

---

## Current Features

*   **Authentication:** Email/Password Sign In and Sign Up flows (integrated with backend).
*   **Document Upload:** secure PDF selection and upload functionality, including password support for protected statements.
*   **Dashboard:** Home screen with quick actions and user summary.
*   **History View:** List of uploaded statements and their processing status.
*   **Analytics:** Basic chart visualizations for spending trends (Monthly Trends, Category Breakdown).
*   **Settings:** User preferences and account management.

---

## Non-Goals

*   **Not a Budgeting App (Yet):** The current focus is on *expense tracking* from statements, not proactive budgeting or forecasting.
*   **Not Offline-First:** The app relies on server connectivity to function. Offline caching is not a priority.
*   **No On-Device Parsing:** **Critical.** The app never parses PDFs locally. All unlocking and extraction happen on the backend.
*   **No Analytics Engine:** The mobile app only visualizes pre-calculated data. No heavy aggregation or statistical logic resides in React Native.
*   **No Financial Advice:** This is a technical tool for data visualization, not a financial advisory platform.
*   **No Manual Entry:** Focus is strictly on automated statement processing.

---

## UI / UX Rules (Strict)

1.  **Material Design 3 Compliance:** All UI components **must** adhere to Material Design 3 guidelines. Use `react-native-paper` components (e.g., `Text` with `variant`, `Button` with `mode`).
2.  **Theme Tokens Only:** **Zero Tolerance for Hardcoded Colors.**
    *   ❌ Incorrect: `color: '#FFFFFF'`, `backgroundColor: '#f5f5f5'`
    *   ✅ Correct: `color: theme.colors.onPrimary`, `backgroundColor: theme.colors.background`
3.  **Dark Mode First:** All generic views must support dark mode by relying solely on theme tokens.
4.  **Safe Area Enforced:** Every screen must implement `useSafeAreaInsets` to prevent content clipping on notches/dynamic islands. Basic `SafeAreaView` is often insufficient for complex layouts.
5.  **Feedback Hierarchy:**
    *   **Snackbar:** For transient status updates (success/error).
    *   **Dialog/Modal:** For blocking confirmations or inputs.
    *   **Alert:** Avoid native alerts; they disrupt the specific UI flow.

---

## Development Standards

1.  **Strict Typing:** No `any`. Define interfaces for all API responses and component props.
2.  **Theme Tokens:** If a color is needed, it must come from the `theme` object. This ensures dark mode works out of the box.
3.  **Component Reusability:** If a UI pattern is used twice, extract it to `src/components`.
4.  **Separation of Concerns:** UI components should not contain direct API calls. Use `src/services` for fetching and `src/store` for state.
5.  **Phase:** Currently in a **Enhancement/Refactor** phase. Prioritize code quality, theme compliance, and stability over new features.

---

## Running the App Locally

### Prerequisites
*   Node.js (LTS)
*   npm or yarn
*   Expo Go app on your physical device (Android/iOS) OR Android Studio/Xcode Emulator.

### Installation

```bash
# Clone the repository
git clone <repository_url>
cd mobileApp

# Install dependencies
npm install
```

### Starting the App

```bash
# Start the Expo development server
npx expo start
```

*   Press `a` to run on Android Emulator.
*   Press `i` to run on iOS Simulator.
*   Scan the QR code to run on a physical device.

### Environment Variables
Create a `.env` file in the root if strictly necessary, but currently, API URLs might be configured in `src/services/api.ts` or `app.config.js`. Ensure the backend API is running and reachable.

---

## How to Use This README

**This README defines constraints and assumptions that should be respected during refactors, reviews, and AI-assisted development.**

*   **For AI Prompts:** Reference this file to establish context (e.g., *"Refactor [file] following the UI/UX Rules in README.md"*). This prevents the AI from introducing legacy patterns or hardcoded styles.
*   **For Code Reviews:** Reject PRs that violate the **Architecture Principle** (e.g., adding parsing logic to the client) or **UI Rules** (e.g., hardcoded hex values).
*   **For New Features:** Consult **Non-Goals** first. If a feature request contradicts a non-goal (e.g., "Add offline caching"), it warrants a design discussion before implementation.
