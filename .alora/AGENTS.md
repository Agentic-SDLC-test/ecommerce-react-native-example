# ALORA Canonical Agent Guide

This is the canonical ALORA-generated agent guide for the EasyBuy React Native ecommerce repository. If another `AGENTS.md` exists at the repository root, treat this file as the source of truth for architecture details.

## Project Overview

EasyBuy is an Expo React Native mobile ecommerce app. It supports shopper flows for login, signup, browsing products and categories, cart management, checkout, wishlist, profile, and order history, plus admin flows for dashboard metrics and management of products, categories, orders, and users.

The repository also includes `mock-server/`, a local Express API that mirrors the app's flat backend contract for development and tests. The README references an external Node backend, but this clone can run against the bundled mock server by default.

## Application Structure

- `App.js` wires `react-redux` `Provider` around `routes/Routes`.
- `routes/Routes.js` owns the native stack navigator and all route names.
- `routes/tabs/Tabs.js` owns the shopper bottom tabs: `home`, `categories`, `myorder`, and `user`.
- `screens/auth/` contains splash, login, signup, forgot password, and session entry flows.
- `screens/user/` contains shopper product, category, cart, checkout, and order screens.
- `screens/profile/` contains account, profile, password, and wishlist screens.
- `screens/admin/` contains admin dashboard, product/category CRUD, order views, and user views.
- `components/` holds reusable UI components for cards, lists, inputs, buttons, alerts, and home/profile widgets.
- `states/` holds the Redux store and cart reducer/action creators. The only combined reducer key is `product`, which represents cart contents.
- `api/` is the backend boundary. Screens should call named operations from `api/index.js`, not build `fetch` requests directly.
- `utils/session.js` owns authenticated user and token lifecycle.
- `utils/authStorage.js` switches between `expo-secure-store` on native platforms and AsyncStorage on web.
- `constants/` stores colors, local display data, and a backwards-compatible network shim.
- `mock-server/` is a Node/Express service with in-memory users, products, categories, orders, wishlist data, upload handling, and static `/uploads` serving.

## Architecture Boundaries

Keep network access behind `api/index.js` and `api/client.js`. `api/client.js` composes the base URL, attaches the `x-auth-token` header from `utils/session.js`, parses JSON, and centralizes JWT-expiry behavior by clearing the session and navigating back to login.

Use `api/config.js` as the only source for backend base URL behavior. It defaults to the local mock server on port `3002`, rewrites localhost to `10.0.2.2` for Android emulators, and honors `EXPO_PUBLIC_API_URL` when set.

Session persistence belongs in `utils/session.js`; storage-provider details belong in `utils/authStorage.js`. Screens may ask for or clear the current session through those modules, but should not read SecureStore or AsyncStorage directly.

Cart state belongs to Redux under `state.product`. Preserve existing cart item fields when changing cart behavior because checkout and cart/product list components read product metadata directly from the cart items.

Navigation route names are string contracts. When renaming or adding a route, update all callers that use `navigation.navigate`, `navigation.replace`, or `navigationRef`.

## Domain Model

- `User`: authenticated account with `_id`, name, email, `userType`, and token.
- `Admin`: user with `userType === "ADMIN"` who can access dashboard and management screens.
- `Customer`: regular shopper with catalog, cart, checkout, wishlist, profile, and order history flows.
- `Product`: sellable catalog item with title, SKU, price, quantity, description, image, and category.
- `Category`: catalog grouping for products, displayed in home/category screens and managed by admins.
- `CartItem`: client-side selected product plus selected `quantity` and available stock.
- `Order`: checkout aggregate with items, amount, discount, cash-on-delivery payment type, shipping address, status, and timestamps.
- `WishlistItem`: saved product reference managed through wishlist endpoints.
- `Session`: persisted user/token object used for authenticated API calls.
- `Upload`: image file accepted by `/photos/upload` and served from `/uploads`.

## Setup Commands

Install mobile app dependencies:

```bash
npm ci
```

Install mock server dependencies:

```bash
npm ci --prefix mock-server
```

Run the mock API:

```bash
npm start --prefix mock-server
```

Run the Expo app:

```bash
npm start
```

Run platform targets:

```bash
npm run android
npm run ios
npm run web
```

Point the app at a non-default backend:

```bash
EXPO_PUBLIC_API_URL=http://localhost:3000 npm start
```

## Testing And Quality

Run unit tests:

```bash
npm test -- --ci
```

Run lint:

```bash
npm run lint
```

The Jest preset is `jest-expo`; tests live in `__tests__/`. The mock server is ignored by the root Jest config and ESLint config.

## Build And CI

Staging EAS build commands:

```bash
npm run build:staging:android
npm run build:staging:ios
```

CI is defined in `.github/workflows/ci.yml`. It installs with `npm ci`, runs lint and tests, installs `mock-server` dependencies for the test job, and runs an Android staging EAS build on pushes when credentials are available through `EXPO_TOKEN`.

EAS profiles live in `eas.json`. The staging Android profile produces an APK and uses remote credentials.

## Development Notes

Prefer named API functions in `api/index.js` over new screen-local calls. If the backend contract changes, update the mock server and API seam together.

When adding authenticated flows, make token/session behavior go through `utils/session.js` so token expiry and logout stay consistent.

When adding product or category image behavior, use `api.imageUrl()` or `api.uploadPhoto()` rather than duplicating upload URL logic.

When working on admin features, preserve the distinction between admin stack routes and shopper tab routes. Login uses `userType` to decide whether to route to `dashboard` or `tab`.

The mock server stores data in memory and resets on restart. Do not treat mock data as persistent state.

## Sensitive Data

Do not commit real API keys, EAS tokens, production credentials, or real customer data. Use `.env.example` or local environment variables for `EXPO_PUBLIC_API_URL` and keep `EXPO_TOKEN` in CI secrets.
