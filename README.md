# EasyBuy

Expo React Native ecommerce app for iOS, Android, and web. Screens talk to one HTTP API. For local development, point that API at the in-repo mock server, or at any server that speaks the same contract.

## Stack

- Expo SDK 55, React Native 0.83, React 19
- React Navigation (native stack and bottom tabs)
- Redux

## Mock server

[`mock-server/`](mock-server/README.md) is an in-memory Express stand-in. Same paths and `x-auth-token` header as the API the app calls. Data resets when the process restarts. Wishlist routes are not implemented here.

```bash
cd mock-server
npm install
npm start          # http://localhost:3002
# npm run dev      # nodemon
```

Seeded logins:

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@easybuy.com` | `admin123` |
| User | `user@easybuy.com` | `user123` |

## Run the app

Node 20.

```bash
git clone https://github.com/Agentic-SDLC-test/ecommerce-react-native-example.git
cd ecommerce-react-native-example
npm install
cp .env.example .env
npm start
```

`.env.example` sets `EXPO_PUBLIC_API_URL` to `http://localhost:3002`. With no env var, the app uses that same host and port (`10.0.2.2` on Android emulators). A phone cannot reach `localhost`. Set the URL to your machine's LAN IP and restart Expo.

```bash
npm run ios
npm run android
npm run web
npm test
npm run lint
```

Reset the Metro cache with `npm start -- --reset-cache`.

## Features

- Auth: splash, login, signup, forgot password, update password
- Shop: home, categories, product detail, cart, checkout
- Account: profile, orders, wishlist
- Admin: dashboard, products, categories, orders, users

## License

MIT
