# EasyBuy

Expo React Native ecommerce app for iOS, Android, and web. Screens call one HTTP contract. Point that contract at the in-repo mock server or the Node backend.

## Stack

- Expo SDK 55, React Native 0.83, React 19
- React Navigation (native stack and bottom tabs)
- Redux

## Related repositories

### Backend

[ecommerce-backend-node-example](https://github.com/Agentic-SDLC-test/ecommerce-backend-node-example) is the Express + MongoDB API. Default port **3002**. Swagger UI at `/api-docs`.

```bash
git clone https://github.com/Agentic-SDLC-test/ecommerce-backend-node-example
cd ecommerce-backend-node-example
npm install
cp .env.example .env   # set DB_CON_STRING and TOKEN_KEY
npm run dev
```

The backend and the mock server both bind **3002**. Run one of them, or change one `PORT` and set `EXPO_PUBLIC_API_URL` to match.

### API client

[`@agentic-sdlc-test/easybuy-api-client`](https://github.com/Agentic-SDLC-test/easybuy-api-client) is the shared client for that contract. Published to GitHub Packages. This app's `api/` module speaks the same contract in-repo. Import the package when you want the typed client.

`.npmrc`:

```
@agentic-sdlc-test:registry=https://npm.pkg.github.com
```

```bash
npm install @agentic-sdlc-test/easybuy-api-client
```

```js
import { createClient } from "@agentic-sdlc-test/easybuy-api-client";
import { UserType, validateLogin } from "@agentic-sdlc-test/easybuy-api-client/domain";

const client = createClient({
  baseUrl: "http://localhost:3002",
  getToken: async () => token,
  onUnauthorized: () => {},
});
```

`createClient` sends the JWT in `x-auth-token`. A body of `{ err: "jwt expired" }` is treated as logout.

## Mock server

[`mock-server/`](mock-server/README.md) is an in-memory Express stand-in. Same paths and `x-auth-token` header as the Node API. Data resets when the process restarts. Wishlist routes are on the Node backend only.

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
