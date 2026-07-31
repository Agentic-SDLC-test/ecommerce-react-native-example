<!-- ALORA-generated. Canonical agent guidance for EasyBuy. Source of truth; the root AGENTS.md mirrors a banner + pointer to this file. -->

# AGENTS.md — EasyBuy (React Native E-commerce)

## Project Overview

EasyBuy is a cross-platform e-commerce application built with **Expo (SDK ~55)** and **React Native 0.83 / React 19**. It runs on iOS, Android, and web (via `react-native-web`). It ships two personas from one codebase:

- **Customer storefront** — splash/auth, home + promotions, category browse, product detail, cart, wishlist, checkout (cash-on-delivery), and order history/tracking.
- **Admin console** — dashboard stats, product/category CRUD, order listing + status updates, and user management.

The repo also contains a **local development-only mock backend** (`mock-server/`, Express) that replicates the flat REST contract the app expects, so the app is fully runnable without the real Node backend.

### Key technologies

- **UI/runtime:** Expo, React Native, React 19, `react-native-web`
- **Navigation:** `@react-navigation/native` — a native-stack root (`routes/Routes.js`) with a nested bottom-tab navigator (`routes/tabs/Tabs.js`)
- **State:** Redux (`redux`, `react-redux`) + `redux-thunk`; only a client-side **cart** slice exists (`states/`)
- **Auth/session:** `expo-secure-store` (native) / `@react-native-async-storage` (web) behind `utils/authStorage.js` + `utils/session.js`
- **Backend seam:** `api/client.js` (transport) + `api/index.js` (named operations); base URL from `api/config.js`
- **Build/CI:** EAS Build (`eas.json`), GitHub Actions (`.github/workflows/ci.yml`), Jest + `jest-expo`, ESLint (`eslint-config-expo`)

## Architecture

```
App.js                      Redux <Provider> → <Routes/>
routes/
  Routes.js                 native-stack navigator; initialRouteName "splash"; all screens registered here
  tabs/Tabs.js              bottom-tab navigator (home, categories, myorder, user); receives `user` via route params
  navigationRef.js          navigation handle + resetToLogin() used by the API seam on token expiry
screens/
  auth/                     Splash, Login, Signup, ForgetPassword
  user/                     Home, Categories, ProductDetail, Cart, Checkout, OrderConfirm, MyOrder(+Detail)
  profile/                  UserProfile, MyAccount, UpdatePassword, MyWishlist
  admin/                    Dashboard, Add/Edit/View Product, Add/Edit/View Category, ViewOrders(+Detail), ViewUsers
components/                 Reusable UI (Custom* primitives + list/card widgets); each folder re-exports via index.js
states/
  store.js                  createStore(reducers, {}, applyMiddleware(thunk))
  reducers/index.js         combineReducers({ product: cartReducer })
  reducers/cartReducer.js   cart add/remove/increase/decrease/empty
  actionCreaters/ actionTypes/   thunk action creators + string action types
api/
  config.js                 getBaseUrl() (EXPO_PUBLIC_API_URL or platform default), imageUrl(); Android→10.0.2.2 rewrite
  client.js                 request() — URL composition, x-auth-token header, JSON parse, centralized "jwt expired" handling
  index.js                  named REST operations (register/login, products, categories, orders, wishlist, admin, uploads)
utils/
  authStorage.js            platform-aware key/value storage (SecureStore vs AsyncStorage)
  session.js                owns authUser + token lifecycle: getUser/getToken/setSession/clearSession/isAdmin
constants/                  Colors, Network (shim over getBaseUrl), AppData (seed categories/slides)
mock-server/                Express dev server (port 3002) with in-memory seed data; NOT part of the shipped app
```

### Important architectural conventions

- **One backend seam.** Screens must call the named operations in `api/index.js` (`api.getProducts()`, `api.login()`, …), never `fetch` directly. `api/client.js` is the only place that attaches the `x-auth-token` header and handles token expiry (`jwt expired` → `session.clearSession()` + `resetToLogin()`).
- **One base-URL resolver.** `api/config.js#getBaseUrl()` is the single source for the backend URL. It reads `EXPO_PUBLIC_API_URL`, strips trailing slashes, and rewrites `localhost`/`127.0.0.1` to `10.0.2.2` on Android. `constants/Network.js` is a backwards-compatible shim over it — do not reintroduce a hardcoded `serverip`.
- **One session owner.** `utils/session.js` owns the authenticated user + token. Read identity from it (`getUser`, `getToken`, `isAdmin`) instead of reading storage or route params directly. Persist login with `setSession(user)`.
- **Role model.** `userType` is `USER` or `ADMIN`. Admin gating on the client uses `session.isAdmin()`; the mock-server enforces it with `authMiddleware`/`adminMiddleware` on `x-auth-token`.
- **Cart is client-only.** The Redux `product` slice is the cart; there is no server cart. Checkout maps cart items into an order payload and calls `api.checkout(...)`.
- **`testID` everywhere.** Components and screens carry `testID` props (e.g. `checkout-submit-btn`); preserve/extend them — they are the contract for UI testing.

## Setup Commands

```bash
npm install                 # install app dependencies (root)
npm install --prefix mock-server   # install mock-server dependencies (once)
```

Environment: copy `.env.example` to `.env` and set the backend URL. Restart Expo after changes.

```bash
# .env
EXPO_PUBLIC_API_URL=http://localhost:3002   # points at the bundled mock-server
```

- Real Node backend: listens on **:3000** — set `EXPO_PUBLIC_API_URL=http://localhost:3000`.
- Bundled mock-server: listens on **:3002** (note: its README text says 3001, but `mock-server/server.js` uses `PORT = 3002`; the app default is 3002).

## Development Workflow

```bash
npm start           # expo start (Metro bundler; open in Expo Go / dev client)
npm run android     # expo start --android
npm run ios         # expo start --ios
npm run web         # expo start --web
npm start -- --reset-cache   # clear Metro cache when bundling misbehaves

# Mock backend (separate terminal)
node mock-server/server.js   # Express API + seed data on http://localhost:3002
```

Pre-seeded mock credentials: admin `admin@easybuy.com` / `admin123`, user `user@easybuy.com` / `user123`.

## Testing Instructions

```bash
npm test                     # jest (preset: jest-expo)
npm test -- --ci             # CI mode (used by GitHub Actions)
npm test -- -t "<name>"      # focus a single test by name
```

- Tests live in `__tests__/` (e.g. `__tests__/colors.test.js`).
- `mock-server/` is excluded from Jest (`testPathIgnorePatterns`).
- Add or update tests alongside the code you change.

## Code Style

- Language: modern JavaScript (ES modules) with JSX. No TypeScript.
- Linting: `npm run lint` (`expo lint` → `eslint-config-expo/flat`). `dist/`, `node_modules/`, and `mock-server/` are ignored by ESLint.
- File organization: components live in `components/<Name>/<Name>.js` with a sibling `index.js` re-export; import via the folder (`components/CustomButton`).
- Styling: `StyleSheet.create` at the bottom of each screen/component; colors come from `constants/Colors.js` via `import { colors } from "../constants"`.
- Screens receive `{ navigation, route }`; navigate by route name string (see `routes/Routes.js`), e.g. `navigation.navigate("productdetail")`.

## Build and Deployment

- **EAS Build** profiles in `eas.json`: `local` (dev client) and `staging` (internal distribution; Android APK, iOS universal; `autoIncrement`).
- Convenience scripts: `npm run build:staging:android`, `npm run build:staging:ios`.
- CI (`.github/workflows/ci.yml`) on push/PR to `main`/`temp_main`: **lint** → **test** (installs mock-server deps, runs `npm test -- --ci`) → **build-android** (EAS staging APK on push; uploads `.apk` + config artifacts). Requires the `EXPO_TOKEN` secret.
- App config: `app.json` (Expo — name "EasyBuy", slug `ecommerce-react-native-example`, bundle id `com.abidrazaa.EasyBuy`).

## Backend REST Contract (flat; served by both the Node backend and the mock-server)

- **Auth/users:** `POST /register`, `POST /login`, `POST /reset-password?id=`, `GET /delete-user?id=`
- **Products:** `GET /products[?search=]`, `POST /product` (admin), `POST /update-product?id=` (admin), `GET /delete-product?id=` (admin)
- **Categories:** `GET /categories`, `POST /category` (admin), `POST /update-category?id=` (admin), `GET /delete-category?id=` (admin)
- **Orders:** `POST /checkout` (user), `GET /orders` (user), `GET /admin/orders` (admin), `GET /admin/order-status?orderId=&status=` (admin)
- **Wishlist:** `GET /wishlist`, `POST /add-to-wishlist`, `GET /remove-from-wishlist?id=`
- **Admin:** `GET /dashboard`, `GET /admin/users`
- **Uploads:** `POST /photos/upload` (multipart), `GET /uploads/:filename`

Auth is via the `x-auth-token` header. Responses use a flat envelope (`{ success, message, data | categories, err }`). Categories are returned under `categories`; most other reads under `data`.

## Additional Notes / Gotchas

- **Reducer fall-through:** `states/reducers/cartReducer.js` mutates state in place and several `case` branches lack `break`/`return`, so they fall through to the next case. Preserve existing behavior unless a change is explicitly requested; be deliberate about mutation vs. returning new state.
- **Misspellings are load-bearing:** field `avaiableQuantity` (cart) and action-type string values like `"inceasequantity"`/`"deceasequantity"` are intentional current spellings — match them exactly or you will silently break dispatch matching.
- **Hardcoded contact fields:** `CheckoutScreen` shows placeholder email/phone; treat as demo data.
- **Android networking:** on a physical Android device use your machine's LAN IP in `EXPO_PUBLIC_API_URL`; on the Android emulator `getBaseUrl()` auto-rewrites `localhost` → `10.0.2.2`.
- **Mock data is in-memory:** the mock-server resets seed data (4 categories, 8 products, 3 users, 3 orders) on every restart.

## Pull Request Guidelines

- Ensure `npm run lint` and `npm test` pass before committing (CI enforces both).
- Keep the API seam, base-URL resolver, and session module as the single owners of their concerns; don't scatter `fetch`, hardcoded URLs, or direct storage reads into screens.
