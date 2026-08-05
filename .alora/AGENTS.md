# AGENTS.md

## Project Overview

EasyBuy is a React Native ecommerce application built with Expo. It contains two tightly coupled runtime surfaces in one repository:

- the mobile client at the repository root, implemented with React Native, React Navigation, Redux, and Expo
- the in-repo mock API at `mock-server/`, implemented with Express and in-memory data stores

The app supports both shopper and admin journeys. Shoppers browse products, manage a cart, check out, review orders, and manage wishlist/profile state. Admins manage products, categories, users, and order status through a dedicated dashboard. Authentication state is stored through the `utils/session.js` seam and every API request flows through `api/client.js`.

## Architecture Notes

- Entry point: `App.js`
- Navigation graph: `routes/Routes.js` and `routes/tabs/Tabs.js`
- Screen groups:
  - `screens/auth/*` for splash, login, signup, password reset
  - `screens/user/*` for storefront, cart, checkout, and order history
  - `screens/profile/*` for account and wishlist
  - `screens/admin/*` for dashboard and CRUD/operations
- State management: Redux store in `states/store.js`, reducers in `states/reducers/`, action creators in `states/actionCreaters/`
- Backend seam:
  - client transport: `api/client.js`
  - named API operations: `api/index.js`
  - base URL and upload URL resolution: `api/config.js`
- Mock backend: `mock-server/server.js` with payment derivation in `mock-server/orderPayment.js`
- Tests: `__tests__/`

## Domain Model Map

- **User**: authenticated shopper or admin
- **Session**: persisted auth user and token, loaded in splash/login flows
- **Category**: merchandising grouping for the catalog and admin management
- **Product**: sellable item with category, image, inventory, and price
- **CartItem**: Redux-managed product selection plus quantity
- **Order**: checkout record with address, line items, delivery status, and timestamps
- **Payment**: additive payment contract supporting `cod` and `wallet_mock`
- **WishlistEntry**: saved product reference for later purchase
- **DashboardMetric**: admin counts for users, orders, products, and categories
- **UploadedPhoto**: image asset exposed from `/uploads`

## Setup Commands

- Install root dependencies: `npm ci`
- Install mock server dependencies: `npm ci --prefix mock-server`
- Start the Expo app: `npm start`
- Start Android simulator flow: `npm run android`
- Start iOS simulator flow: `npm run ios`
- Start web preview: `npm run web`
- Start the mock server: `npm --prefix mock-server start`

## Environment and Runtime

- `EXPO_PUBLIC_API_URL` overrides the backend base URL for the mobile app
- default backend target is the in-repo mock server on port `3002`
- Android emulator host rewriting is handled in `api/config.js` (`localhost` -> `10.0.2.2`)
- `EXPO_PUBLIC_ENABLE_MOCK_WALLET_PAYMENT=true` enables the wallet mock checkout path in the UI

When changing checkout or order flows, keep the mobile payload builder in `utils/checkout.js`, the UI helpers in `utils/payment.js`, and the mock-server payment contract in sync.

## Development Workflow

1. Run the mock API when touching authenticated, catalog, upload, or checkout paths: `npm --prefix mock-server start`
2. Run the Expo client with `npm start`
3. Keep route changes aligned across `routes/Routes.js`, `routes/tabs/Tabs.js`, and the relevant screens
4. Prefer extending the `api/` seam instead of issuing raw `fetch` calls from screens
5. Prefer using `utils/session.js` for auth state instead of reading storage directly
6. Keep Redux cart behavior in `states/` and avoid duplicating cart calculations inside multiple screens

## Testing Instructions

- Run all tests: `npm test -- --ci`
- Run a focused Jest file: `npm test -- --runTestsByPath __tests__/checkout.test.js`
- Lint the React Native app: `npm run lint`

Relevant coverage today:

- `__tests__/checkout.test.js` validates checkout payload and address rules
- `__tests__/payment.test.js` validates payment labels and feature flags
- `__tests__/orderPayment.test.js` validates mock-server payment derivation
- `__tests__/colors.test.js` validates shared constants

The GitHub Actions workflow in `.github/workflows/ci.yml` runs `npm ci`, `npm run lint`, `npm ci --prefix mock-server`, and `npm test -- --ci` before the Android EAS build job.

## Code Style Guidelines

- JavaScript-only codebase; match existing functional React component style
- Preserve the current directory split by feature area (`screens/`, `components/`, `utils/`, `api/`, `states/`)
- Reuse the shared `colors` constants and existing custom UI wrappers before adding new primitives
- Maintain the API seam layering:
  - screens call `api/index.js`
  - `api/index.js` calls `api/client.js`
  - `api/client.js` owns auth headers and token-expiry handling
- Keep mock-server contracts additive so the external backend can mirror them

## Build and Deployment

- Staging Android build: `npm run build:staging:android`
- Staging iOS build: `npm run build:staging:ios`
- EAS configuration lives in `eas.json`
- Expo app configuration lives in `app.json`

CI also exports resolved EAS config and archives the Android APK artifact.

## Agent-Specific Guardrails

- Treat `.alora/AGENTS.md` as the canonical agent guide for this repository
- Keep graph or semantic analysis code-focused; do not use screenshots, Markdown, or other media as architecture evidence
- Prefer the in-repo mock server as the authoritative executable contract unless a task explicitly targets the external Node backend referenced in `README.md`
