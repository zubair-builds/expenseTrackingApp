# Expense Tracker Mobile App

## App Overview

The Expense Tracker Mobile App is a client-side interface designed to help users track and analyze their financial expenses by processing PDF bank/credit card statements. Instead of manual entry, users upload a PDF statement, which is securely transmitted to a backend for parsing and categorization. The app visualizes this data, providing insights into spending habits.

**Target Users:** Individuals seeking an automated, low-effort way to track expenses from monthly generic bank statements.
**Core Problem:** Manual expense tracking is tedious and prone to error. Existing banking apps often lack unified views across multiple banks or custom categorization logic.
**Current Status:** **Work in Progress (WIP)**. Core flows (Auth, Upload, List View) are implemented, but refinement and advanced analytics are ongoing.

---

## Architecture Overview

This project follows a **Thin Client, Thick Server** architecture:

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

*   **No Parsing on Device:** The mobile app typically does NOT parse PDFs locally. All processing is offloaded to the API.
*   **No Manual Transaction Entry:** The current scope focuses on *statement-based* tracking, not manual line-item entry.
*   **No Offline Mode:** The app requires an internet connection to function (upload files, fetch history). Offline caching is not currently a priority.

---

## UI / UX Principles

*   **Design System:** Strictly adheres to **Material Design 3 (Material You)**.
*   **Theming:** Uses `react-native-paper` `MD3LightTheme` (and Dark equivalent).
*   **Consistency:**
    *   **NEVER** use hardcoded colors (e.g., `'#FFFFFF'`, `'#000'`). ALWAYS use `theme.colors.*` (e.g., `theme.colors.surface`, `theme.colors.onSurface`).
    *   **Spacing:** Use standard spacing grid (4, 8, 16, 24).
*   **Safe Area:** All screens must use `useSafeAreaInsets` from `react-native-safe-area-context` to handle notches and dynamic islands correctly.
*   **Feedback:** Use **Snackbars** for transient non-critical updates (success/error toasts). Use **Dialogs** for critical confirmations. Avoid native `Alert.alert` unless necessary for system errors.

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

## How to Use This README for Code Reviews

*   **Reviewers:** Check PRs against the **UI / UX Principles** section. If a PR introduces hardcoded colors or ignores Safe Area, request changes pointing to this document.
*   **Context:** Use the **Architecture Overview** to understand *why* certain logic is absent from the mobile code (e.g., "Where is the PDF parser?" -> "It's in the backend, as per Architecture").
*   **AI Prompts:** When asking AI assistants (like Cursor/Windsurf) to modify code, reference this README to establish constraints (e.g., "Use Material 3 tokens as defined in the README").
