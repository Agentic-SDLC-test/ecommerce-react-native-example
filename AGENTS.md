<!--
  ALORA-generated (initial project analysis).
  This root AGENTS.md was created because none existed. The canonical, fuller
  agent guidance lives at `.alora/AGENTS.md` — keep that file as the source of
  truth and mirror any lasting changes here. Safe to edit/replace with your own.
-->

# AGENTS.md — EasyBuy (React Native E-commerce)

> Canonical agent guidance: [`.alora/AGENTS.md`](.alora/AGENTS.md).
> Architecture metadata: [`.alora/application-architecture.json`](.alora/application-architecture.json).

## Project Overview

EasyBuy is a cross-platform (iOS/Android/web) e-commerce app built with **Expo (SDK ~55)** + **React Native 0.83 / React 19**. One codebase serves a **customer storefront** (browse, search, cart, wishlist, checkout, order tracking) and an **admin console** (dashboard, product/category CRUD, orders, users). A local Express **`mock-server/`** replicates the backend REST contract for development.

- **Navigation:** `@react-navigation` native-stack root (`routes/Routes.js`) + bottom tabs (`routes/tabs/Tabs.js`)
- **State:** Redux + redux-thunk — client-side cart slice only (`states/`)
- **Auth/session:** `utils/session.js` over `expo-secure-store` / AsyncStorage; JWT sent as `x-auth-token`
- **Backend seam:** `api/index.js` (named ops) + `api/client.js` (transport) + `api/config.js` (base URL)

## Setup Commands

```bash
npm install                        # app deps
npm install --prefix mock-server   # mock backend deps (once)
cp .env.example .env               # set EXPO_PUBLIC_API_URL (mock-server = http://localhost:3002)
```

## Development Workflow

```bash
npm start          # expo start (also: npm run android | ios | web)
node mock-server/server.js   # dev backend on http://localhost:3002 (seed data)
```

Mock credentials: admin `admin@easybuy.com`/`admin123`, user `user@easybuy.com`/`user123`.

## Testing & Lint

```bash
npm test           # jest (jest-expo); CI uses: npm test -- --ci
npm run lint       # expo lint (eslint-config-expo)
```

Tests live in `__tests__/`; `mock-server/` is excluded from Jest. CI (`.github/workflows/ci.yml`): lint → test → EAS Android staging build.

## Conventions (do not break)

- Call backend only through `api/index.js` — never `fetch` directly. `api/client.js` owns the `x-auth-token` header and `jwt expired` → logout handling.
- Resolve the backend URL only through `api/config.js#getBaseUrl()` (honors `EXPO_PUBLIC_API_URL`; Android `localhost`→`10.0.2.2`).
- Read identity only through `utils/session.js` (`getUser`/`getToken`/`isAdmin`).
- Components: `components/<Name>/<Name>.js` + sibling `index.js` re-export; colors from `constants/Colors.js`.
- Preserve `testID` props (UI-test contract) and the intentional current spellings (`avaiableQuantity`, action strings `inceasequantity`/`deceasequantity`).

See [`.alora/AGENTS.md`](.alora/AGENTS.md) for the full architecture map, REST contract, build/deploy details, and gotchas.
