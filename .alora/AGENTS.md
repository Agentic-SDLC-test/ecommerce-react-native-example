# ALORA Canonical Agent Guide

This file is the canonical ALORA-generated agent guide for the EasyBuy ecommerce repository. The root `AGENTS.md`, when present, should point agents here rather than duplicating all architecture detail.

## Project Overview

EasyBuy is an Expo React Native ecommerce app. The mobile client supports user authentication, product and category browsing, cart management, wishlist management, cash-on-delivery checkout, customer order history, and an admin dashboard for managing products, categories, users, and order status.

The repository also includes `mock-server/`, a local Express API with in-memory data and file upload support. The mobile app's API wrapper targets either this mock server or a real backend through `EXPO_PUBLIC_API_URL`.

## Applications

- `easybuy-mobile` at `.`: Expo React Native app using React 19, React Native 0.83, React Navigation, Redux, and Redux Thunk.
- `easybuy-mock-server` at `mock-server/`: Node/Express mock API that mirrors the app's backend contract and serves uploaded product images.

## Architecture

- `App.js` mounts the Redux `Provider` and the root navigator from `routes/Routes.js`.
- `routes/Routes.js` defines the stack navigator for auth, user, profile, cart, checkout, and admin screens. `routes/tabs/Tabs.js` defines the main user bottom tabs.
- `api/client.js` is the low-level transport layer. It composes backend URLs, attaches `x-auth-token`, parses JSON, clears expired sessions, and redirects to login on token expiry.
- `api/index.js` is the backend boundary for screens. Prefer adding named operations here instead of building `fetch` calls inside screens.
- `api/config.js` owns backend base URL selection. `EXPO_PUBLIC_API_URL` overrides the default local mock server URL; Android emulator localhost values are rewritten to `10.0.2.2`.
- `utils/session.js` owns the persisted auth user and token lifecycle. `utils/authStorage.js` stores values in SecureStore on native platforms and AsyncStorage on web.
- `states/` contains Redux cart actions, action types, reducers, and store setup. The cart state is exposed as `state.product`.
- `screens/auth/`, `screens/user/`, `screens/profile/`, and `screens/admin/` contain route-level UI flows.
- `components/` contains reusable UI widgets and domain list/card components used by screens.
- `constants/` contains brand colors, app data, and legacy network constants.
- `mock-server/server.js` provides local endpoints for auth, catalog, categories, dashboard stats, orders, wishlist, password reset, deletion, uploads, and static upload serving.

## Domain Model

- `User`: authenticated account with id, name, email, `userType`, and token.
- `Admin`: user with `userType === "ADMIN"` who can reach dashboard and management screens.
- `Product`: catalog item with title, SKU, price, stock quantity, description, image, and category.
- `Category`: grouping used for browsing and product management.
- `CartItem`: Redux-managed product snapshot with selected quantity.
- `Order`: checkout result with user, line items, amount, payment type, shipping details, status, and timestamps.
- `OrderItem`: product id, price, and quantity within checkout/order payloads.
- `Wishlist`: authenticated user's saved product list.
- `Session`: persisted user/token record stored by `utils/session.js`.
- `DashboardMetric`: admin count card for users, orders, products, and categories.
- `UploadedImage`: product image accepted by `/photos/upload` and served from `/uploads`.
- `ShippingAddress`: country, city, street address, and zipcode collected during checkout.

## Setup Commands

- Install mobile dependencies: `npm install`
- Start Expo: `npm start`
- Start Android target: `npm run android`
- Start iOS target: `npm run ios`
- Start web target: `npm run web`
- Install mock server dependencies: `cd mock-server && npm install`
- Start mock server: `cd mock-server && npm start`

The app defaults to the mock server on port `3002` through `api/config.js`. Set `EXPO_PUBLIC_API_URL` to point at a real backend or a different local server.

## Testing And Quality

- Run tests: `npm test`
- Run lint: `npm run lint`
- The Jest preset is `jest-expo`; tests live under `__tests__/`.
- The mock server is ignored by the root Jest configuration.
- ESLint uses Expo's flat config and ignores `mock-server/`, `node_modules/`, and `dist/`.

## Build

- Android staging build: `npm run build:staging:android`
- iOS staging build: `npm run build:staging:ios`
- EAS build profiles are defined in `eas.json`; staging builds are non-interactive and use remote credentials.

## Backend Contract

Screens should call named functions from `api/index.js`. Current operations cover:

- Auth/users: `register`, `login`, `resetPassword`, `deleteUser`
- Products: `getProducts`, `createProduct`, `updateProduct`, `deleteProduct`
- Categories: `getCategories`, `createCategory`, `updateCategory`, `deleteCategory`
- Orders: `checkout`, `getOrders`, `getAdminOrders`, `updateOrderStatus`
- Wishlist: `getWishlist`, `addToWishlist`, `removeFromWishlist`
- Admin: `getDashboard`, `getUsers`
- Uploads: `uploadPhoto`, `imageUrl`

Protected mock-server routes expect `x-auth-token`. Public routes ignore the token if present.

## Agent Change Guidance

- Keep network calls behind `api/index.js` and `api/client.js`; do not add ad hoc `fetch` calls in screens.
- Keep auth persistence behind `utils/session.js`; do not read or write auth storage directly from screens.
- Preserve route names in `routes/Routes.js` unless all navigation callers are updated together.
- Treat `states/reducers/cartReducer.js` and `states/actionCreaters/actionCreaters.js` as the cart state boundary.
- When modifying checkout, keep `CartItem`, `OrderItem`, and `Order` payload shape aligned with `/checkout` in `mock-server/server.js`.
- When modifying product images, account for both uploaded filenames from the API and image URL composition through `api/config.js`.
- Prefer focused screen/component changes over cross-cutting refactors; many screens follow similar local-state and promise-based API handling patterns.
- Run `npm test` for JavaScript changes. Run `npm run lint` before committing broad UI or navigation changes.

## Known Local Notes

- `mock-server/README.md` mentions port `3001`, but `mock-server/server.js` and `api/config.js` use port `3002`.
- Some legacy code still imports `constants/Network.js`; newer backend URL composition should go through `api/config.js`.
- Product and category admin flows rely on the mock and real backend sharing the same flat response contract.
