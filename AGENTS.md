# AGENTS.md

ALORA-generated root agent guide. The canonical architecture and contribution guidance for this repository lives in `.alora/AGENTS.md`.

Agents working in this repository should read `.alora/AGENTS.md` before making code changes. Keep `.alora/AGENTS.md` canonical if guidance diverges.

## Quick Orientation

EasyBuy is an Expo React Native ecommerce app with shopper and admin flows. The mobile app is rooted at `App.js`, navigation lives in `routes/`, screens are grouped under `screens/`, reusable UI lives under `components/`, cart state lives under `states/`, and backend calls go through `api/`.

The bundled local API is `mock-server/`, an Express service that mirrors the app's backend endpoints for development.

## Common Commands

```bash
npm ci
npm ci --prefix mock-server
npm start --prefix mock-server
npm start
npm run lint
npm test -- --ci
```

For detailed architecture boundaries, domain model notes, build commands, and security guidance, use `.alora/AGENTS.md`.
