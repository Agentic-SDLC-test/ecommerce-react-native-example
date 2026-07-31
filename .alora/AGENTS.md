# ALORA Canonical Agent Guidance: EasyBuy (ecommerce-react-native-example)

Welcome, AI coding agent! This file provides precise architectural, developmental, and testing guidelines to help you work efficiently on the EasyBuy codebase.

## Project Overview

EasyBuy is an open-source, cross-platform e-commerce mobile application built using **React Native** and **Expo**. It supports typical customer flows (browsing, searching, shopping cart, wishlist, checkout) and administrator features (product, category, and order management dashboards).

The codebase consists of two primary application layers:
1. **Frontend Mobile Client** (`ecommerce-react-native-example`): Expo-based React Native app.
2. **Mock API Server** (`ecommerce-react-native-example/mock-server`): An Express.js mock server that serves the backend API for development and testing.

## Setup Commands

### Frontend Mobile App
To set up dependencies for the React Native/Expo app:
```bash
cd ecommerce-react-native-example
npm install
```

### Mock API Server
To set up dependencies for the Express mock server:
```bash
cd ecommerce-react-native-example/mock-server
npm install
```

## Development Workflow

### Starting the Mock API Server
Before running the app, start the mock server:
```bash
cd ecommerce-react-native-example/mock-server
npm start # runs on http://localhost:3002
# Or for development with watch mode:
npm run dev
```

### Starting the Expo Application
Run the Expo development server:
```bash
cd ecommerce-react-native-example
npm start
```
Use the Expo app on iOS/Android or run on web with:
- iOS: `npm run ios`
- Android: `npm run android`
- Web: `npm run web`

### Environment Variables
Configure the API server endpoint in `ecommerce-react-native-example/.env` or rely on the default fallback (reaches `localhost:3002` on Web/iOS, and `10.0.2.2:3002` on Android emulator).
The resolver in `api/config.js` respects `EXPO_PUBLIC_API_URL` if defined.

## Testing Instructions

Tests are built using **Jest** and **jest-expo**.
- To run all frontend tests:
  ```bash
  cd ecommerce-react-native-example
  npm test
  ```
- Tests are located in the `__tests__` directory or alongside files using the `.test.js` suffix.
- When creating code changes or new features, ensure corresponding unit and integration tests are added or updated.

## Code Style and Conventions

- **Component Design**: Functional components using React Native hooks are preferred. Style objects are typically defined at the bottom of the component file using `StyleSheet.create`.
- **State Management**: Redux is utilized for global state (e.g., Cart and active session management). Store configuration is located in `states/store.js` and reducers in `states/reducers/`.
- **API Seam**: Avoid writing direct `fetch` or network calls in screens. Use the unified API interface defined in `api/index.js` which relies on `api/client.js`.
- **Navigation**: Uses `@react-navigation/native` and stack/tab navigators defined in `routes/Routes.js` and `routes/tabs/`.
- **Linting**: Run the linter via:
  ```bash
  cd ecommerce-react-native-example
  npm run lint
  ```

## Build and Deployment

The project is configured for **EAS Build**:
- Build for Android Staging:
  ```bash
  cd ecommerce-react-native-example
  npm run build:staging:android
  ```
- Build for iOS Staging:
  ```bash
  cd ecommerce-react-native-example
  npm run build:staging:ios
  ```
- Settings and profiles are located in `eas.json`.
