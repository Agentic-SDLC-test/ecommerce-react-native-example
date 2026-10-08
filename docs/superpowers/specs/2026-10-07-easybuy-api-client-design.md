# easybuy-api-client design

Date: 2026-10-07

## Goal

Create a sibling repository, `easybuy-api-client`, that the Expo app `ecommerce-react-native-example` installs as a dependency. The package holds the HTTP client and the domain constants and form checks that are currently inlined in that app. The app keeps screens, navigation, storage, platform URL selection, and the Redux cart.

The Node API in `ecommerce-backend-node-example` is not modified. The domain entry point has no runtime dependencies, so that backend can `require` the same constants in a later pass.

## Decisions

- TypeScript source, compiled with `tsc` to CommonJS in `dist/`. Metro bundles `dist/` and does not compile this package.
- Two entry points: `@agentic-sdlc-test/easybuy-api-client` and `@agentic-sdlc-test/easybuy-api-client/domain`.
- After the build and tests pass, publish to GitHub Packages for the `Agentic-SDLC-test` org. The first published version is `0.1.0`. The folder name stays `easybuy-api-client`. npmjs and github.ibm.com are not used. GitHub Packages on github.ibm.com is disabled for that enterprise.
- `.github/workflows/ci.yml` publishes that package when a pull request into `main` or `temp_main` is merged. The merge is a `push` to that branch. Pull requests run lint and test and do not publish.
- The app selects the mock server or the real API by passing `getBaseUrl()` into the client. The package does not read `EXPO_PUBLIC_API_URL` and does not contain a server switch.
- Response bodies are returned as parsed JSON. HTTP status does not throw.
- Cart logic stays in the app. Wishlist methods stay on the client. The mock server's missing wishlist routes are left as they are.
- The backend repository is out of scope for this pass.

## Repository

Path: `ibm/easybuy-api-client`, sibling of the two existing example repos. Implementation creates a local git repository, creates the public GitHub repo [Agentic-SDLC-test/easybuy-api-client](https://github.com/Agentic-SDLC-test/easybuy-api-client), and pushes that repo. The React Native app and the backend are not pushed.

```
easybuy-api-client/
  .github/workflows/ci.yml
  package.json
  .npmrc
  tsconfig.json
  src/index.ts
  src/domain/index.ts
  test/domain.test.js
  test/client.test.js
```

`dist/` is build output and is gitignored.

`package.json`:

- `name`: `@agentic-sdlc-test/easybuy-api-client`
- `version`: `0.1.0`
- `private` is omitted so the package can be published
- `repository`: `git+https://github.com/Agentic-SDLC-test/easybuy-api-client.git`. GitHub uses this field to link the package to that repo.
- `publishConfig.registry`: `https://npm.pkg.github.com`
- `engines.node`: `>=18`
- no runtime dependencies
- devDependency: `typescript`
- scripts: `build` runs `tsc`; `test` runs `build` then `node --test`; `lint` prints `No linter configured` and exits 0, matching the backend workflow's lint job
- `main` and `types` point at `dist/index.js` and `dist/index.d.ts`
- `exports`:
  - `.` → `dist/index.js` and `dist/index.d.ts`
  - `./domain` → `dist/domain/index.js` and `dist/domain/index.d.ts`
- `files`: `["dist"]`

`tsconfig.json`:

- `target`: `ES2018`
- `module`: `commonjs`
- `declaration`: `true`
- `outDir`: `dist`
- `rootDir`: `src`
- `strict`: `true`

`src/domain/index.ts` does not import `src/index.ts`. `src/index.ts` may import the domain module for paths.

## Domain module

Import path: `@agentic-sdlc-test/easybuy-api-client/domain`. No `fetch`, React Native, Express, or Mongoose.

### Constants

Values match the strings both servers already store and compare:

| Export | Members |
|---|---|
| `UserType` | `USER` = `"USER"`, `ADMIN` = `"ADMIN"` |
| `OrderStatus` | `PENDING` = `"pending"`, `SHIPPED` = `"shipped"`, `DELIVERED` = `"delivered"` |
| `PaymentType` | `COD` = `"cod"`, `ONLINE` = `"online"` |

`paths` holds the path strings used by the client:

| Key | Path |
|---|---|
| `register` | `/register` |
| `login` | `/login` |
| `resetPassword` | `/reset-password` |
| `deleteUser` | `/delete-user` |
| `products` | `/products` |
| `product` | `/product` |
| `updateProduct` | `/update-product` |
| `deleteProduct` | `/delete-product` |
| `categories` | `/categories` |
| `category` | `/category` |
| `updateCategory` | `/update-category` |
| `deleteCategory` | `/delete-category` |
| `checkout` | `/checkout` |
| `orders` | `/orders` |
| `adminOrders` | `/admin/orders` |
| `orderStatus` | `/admin/order-status` |
| `wishlist` | `/wishlist` |
| `addToWishlist` | `/add-to-wishlist` |
| `removeFromWishlist` | `/remove-from-wishlist` |
| `dashboard` | `/dashboard` |
| `users` | `/admin/users` |
| `upload` | `/photos/upload` |

### Validators

Each function returns the first matching error string, or `null` when the input is valid. They do not throw, trim, or read the selected server. Comparisons stay loose where the screens are loose today (`== ""`, `== 0`, `== null`).

`validateLogin({ email, password })`:

1. `email == ""` → `"Please enter your email"`
2. `password == ""` → `"Please enter your password"`
3. email does not contain `@` → `"Email is not valid"`
4. `email.length < 6` → `"Email is too short"`
5. `password.length < 6` → `"Password must be 6 characters long"`

`validateSignup({ email, name, password, confirmPassword })`:

1. `email == ""` → `"Please enter your email"`
2. `name == ""` → `"Please enter your name"`
3. `password == ""` → `"Please enter your password"`
4. email does not contain `@` → `"Email is not valid"`
5. `email.length < 6` → `"Email is too short"`
6. `password.length < 6` → `"Password must be 6 characters long"`
7. `password != confirmPassword` → `"password does not match"`

Signup in the app today uses `password.length < 5` while the message and the login screen both say 6. The shared function uses under 6. A 5-character signup password is rejected.

`validateProduct({ title, price, quantity, image })`:

1. `title == ""` → `"Please enter the product title"`
2. `price == 0` → `"Please enter the product price"`
3. `quantity <= 0` → `"Quantity must be greater then 1"`
4. `image == null` → `"Please upload the product image"`

`validateCategory({ title, description, image })`:

1. `title == ""` → `"Please enter the product title"`
2. `description == ""` → `"Please upload the product image"`
3. `image == null` → `"Please upload the Catergory image"`

Those category messages are kept, including the current spelling.

`UpdatePasswordScreen` keeps its own checks. Those checks are not moved.

## Client

`createClient({ baseUrl, getToken, onUnauthorized })` returns an object whose methods close over that config.

- `baseUrl` is a string. A trailing slash is stripped once at construction.
- `getToken` returns `Promise<string | null>`.
- `onUnauthorized` returns `void` or `Promise<void>`.

`imageUrl(filename)` returns `` `${baseUrl}/uploads/${filename}` ``.

### Transport

Each call does the following:

1. Build the URL as `baseUrl + path`.
2. Await `getToken()`. When the token is a non-empty string, set header `x-auth-token`. When it is missing, omit that header.
3. When `body` is `FormData`, send it and do not set `Content-Type`.
4. When `body` is anything else non-null, set `Content-Type: application/json` and send `JSON.stringify(body)` unless `body` is already a string.
5. `fetch` with `redirect: "follow"`.
6. On a JSON body, use that object. On a parse failure, use `{}`.
7. When `result.err === "jwt expired"`, await `onUnauthorized()`, then return `result`.
8. Return `result` for every other body, including HTTP 4xx and 5xx.

A thrown `fetch`, `getToken`, or `onUnauthorized` rejects the call. The client does not read `response.ok` and does not wrap the body.

`err` values other than `"jwt expired"` (`"No Auth Token Found"`, `"Authentication failed"`, `"Insufficient User Permissions"`, and any other string) do not call `onUnauthorized`.

Query values are passed through `encodeURIComponent`. `getProducts(search)` appends `?search=` only when `search` is truthy.

### Operations

These match `ecommerce-react-native-example/api/index.js`:

| Method | Request |
|---|---|
| `register(payload)` | `POST /register` |
| `login(email, password)` | `POST /login` with `{ email, password }` |
| `resetPassword(userId, body)` | `POST /reset-password?id=` |
| `deleteUser(userId)` | `GET /delete-user?id=` |
| `getProducts(search)` | `GET /products` or `GET /products?search=` |
| `createProduct(payload)` | `POST /product` |
| `updateProduct(id, payload)` | `POST /update-product?id=` |
| `deleteProduct(id)` | `GET /delete-product?id=` |
| `getCategories()` | `GET /categories` |
| `createCategory(payload)` | `POST /category` |
| `updateCategory(id, payload)` | `POST /update-category?id=` |
| `deleteCategory(id)` | `GET /delete-category?id=` |
| `checkout(payload)` | `POST /checkout` |
| `getOrders()` | `GET /orders` |
| `getAdminOrders()` | `GET /admin/orders` |
| `updateOrderStatus(orderId, status)` | `GET /admin/order-status?orderId=&status=` |
| `getWishlist()` | `GET /wishlist` |
| `addToWishlist(productId, quantity = 1)` | `POST /add-to-wishlist` with `{ productId, quantity }` |
| `removeFromWishlist(productId)` | `GET /remove-from-wishlist?id=` |
| `getDashboard()` | `GET /dashboard` |
| `getUsers()` | `GET /admin/users` |
| `uploadPhoto(formData)` | `POST /photos/upload` |

The field name on the upload body stays `photos`. The app still builds that `FormData`. The client returns the raw JSON. The real API responds with `{ image }`. The mock responds with `{ success, message, filename, url }`. Callers keep reading whichever fields they already read.

## Server selection

The package never chooses a host. The Expo app keeps `api/config.js` `getBaseUrl()`, including the Android rewrite of `localhost` and `127.0.0.1` to `10.0.2.2`, and including `EXPO_PUBLIC_API_URL`.

`api/index.js` constructs one client at module load:

```js
createClient({
  baseUrl: getBaseUrl(),
  getToken: () => session.getToken(),
  onUnauthorized: async () => {
    await session.clearSession();
    resetToLogin();
  },
})
```

It re-exports the client methods under the same names, re-exports `imageUrl`, and still re-exports `getBaseUrl` from `./config`. `api/client.js` is deleted.

Both processes default to port 3002. Run one at a time, or start one on another port and point `EXPO_PUBLIC_API_URL` at it. Image URLs use the same base URL as the API calls.

`GET /products?search=` is still sent. The real API filters on it. The mock ignores the query and returns the full list.

Wishlist methods stay, because the real API and the wishlist screens use them. `mock-server/server.js` has no wishlist routes. This pass does not add them.

## App changes

Dependency in `ecommerce-react-native-example/package.json`:

```json
"@agentic-sdlc-test/easybuy-api-client": "file:../easybuy-api-client"
```

`metro.config.js` sets `watchFolders` to the sibling `easybuy-api-client` directory. No other Metro resolver changes.

Screens keep `import * as api from "../../api"` for HTTP calls and `api.imageUrl`. Validators and constants are imported from `@agentic-sdlc-test/easybuy-api-client/domain`. The client is imported from `@agentic-sdlc-test/easybuy-api-client`. The `file:` dependency still installs that scoped name.

These call sites replace `` `${network.serverip}/uploads/${file}` `` with `api.imageUrl(file)`:

- `screens/admin/EditProductScreen.js`
- `screens/admin/ViewCategoryScreen.js`
- `screens/admin/ViewProductScreen.js`
- `screens/profile/MyWishlistScreen.js`
- `screens/user/ProductDetailScreen.js`
- `screens/user/CategoriesScreen.js`
- `screens/user/CartScreen.js`
- `components/HomeScreen/NewArrivals.js`

Then delete `constants/Network.js`, remove the `network` export from `constants/index.js`, and drop unused `network` imports in `components/ProductCard/ProductCard.js`, `components/CartProductList/CartProductList.js`, and `screens/user/MyOrderDetailScreen.js`. `colors` stays.

These screens call the matching validator, and on a string they `setError` and skip the request:

- `screens/auth/LoginScreen.js` → `validateLogin`
- `screens/auth/SignupScreen.js` → `validateSignup`
- `screens/admin/AddProductScreen.js` and `EditProductScreen.js` → `validateProduct`
- `screens/admin/AddCategoryScreen.js` and `EditCategoryScreen.js` → `validateCategory`

Data strings switch to domain constants. Display labels stay in the screens.

| Location | Replacement |
|---|---|
| `screens/auth/Splash.js`, `screens/auth/LoginScreen.js`, `utils/session.js` | `UserType.ADMIN` |
| `screens/user/CheckoutScreen.js` | `PaymentType.COD`, `OrderStatus.PENDING` |
| `screens/user/MyOrderDetailScreen.js`, `screens/admin/ViewOrderDetailScreen.js` | `OrderStatus` members in comparisons |
| Dropdown `value` fields in `AddProductScreen.js` and `ViewOrderDetailScreen.js` | `OrderStatus` members. Labels `"Pending"`, `"Shipped"`, `"Delivered"` stay |

Unchanged: screens' layout and styles, navigation, `utils/authStorage.js`, `utils/session.js` storage behavior, the Redux cart, the mock server, and the entire backend repo.

## Testing

Tests are plain JavaScript against `dist/`. They use `node:test`. They do not start either server.

`test/domain.test.js`:

- each validator returns the first failing message
- valid input returns `null`
- signup password length 5 is rejected
- signup password length 6 passes that rule

`test/client.test.js` stubs global `fetch`:

- `login` POSTs JSON to `{baseUrl}/login` with `Content-Type: application/json`
- a token from `getToken` is sent as `x-auth-token`
- a null token omits that header
- `getProducts("a b")` requests `/products?search=a%20b`
- `uploadPhoto` with `FormData` does not set `Content-Type`
- an HTTP 401 JSON body is returned and `onUnauthorized` is not called
- `{ err: "jwt expired" }` calls `onUnauthorized` and the method still returns that body
- `{ err: "Authentication failed" }` does not call `onUnauthorized`
- a non-JSON body becomes `{}`
- a rejected `fetch` rejects the call
- `imageUrl("a.png")` equals `{baseUrl}/uploads/a.png`

The app's `__tests__/colors.test.js` stays. Screen edits do not add Jest tests.

Manual check, not part of `npm test`: set `EXPO_PUBLIC_API_URL` to the mock server and log in, then point it at the real API on a different port and log in again.

## GitHub Packages

The committed `.npmrc` in `easybuy-api-client` and in `ecommerce-react-native-example` is only:

```
@agentic-sdlc-test:registry=https://npm.pkg.github.com
```

No auth token is committed. The token stays in the user-level `~/.npmrc`:

```
//npm.pkg.github.com/:_authToken=TOKEN
```

A local `~/.npmrc` token with `repo`, `read:packages`, and `write:packages` is only for `npm whoami` and local installs. It is not written into a project file, the spec, or chat. The publish job does not use that token. It uses the workflow's `GITHUB_TOKEN` with `packages: write`.

## Publish workflow

`.github/workflows/ci.yml` follows the same shape as `ecommerce-backend-node-example/.github/workflows/ci.yml` and `ecommerce-react-native-example/.github/workflows/ci.yml`:

- Triggers: `pull_request` and `push` for branches `main` and `temp_main`.
- `actions/checkout@v5`, `actions/setup-node@v6`, Node.js 20, `npm ci`.
- Jobs `lint` and `test` run on both triggers. `lint` runs `npm run lint`. `test` runs `npm test`.
- Job `publish` runs only when `github.event_name == 'push'`, after `lint` and `test` succeed. A merged pull request is that push. An open pull request does not publish.
- `publish` sets `registry-url` to `https://npm.pkg.github.com`, scope `@agentic-sdlc-test`, and `NODE_AUTH_TOKEN` to `${{ secrets.GITHUB_TOKEN }}`. Permissions on that job are `contents: read` and `packages: write`.
- The job checks out that commit, runs `npm ci` and `npm run build` (`dist/` is gitignored, so the runner must build it), then reads `version` from `package.json`. If `@agentic-sdlc-test/easybuy-api-client@<version>` is already on GitHub Packages, it exits 0 and does not publish again. If that version is absent, it runs `npm publish`. The first push of `0.1.0` publishes `0.1.0`. A later merge publishes a new version only when the pull request changed `package.json` `version` to a value the registry does not have.

The repo is public, matching [ecommerce-backend-node-example](https://github.com/Agentic-SDLC-test/ecommerce-backend-node-example). Installing the published package from `npm.pkg.github.com` still requires a token with `read:packages`, including for a public package. The Expo app's `file:` dependency does not need that token. There is no local `npm publish` in this pass. The workflow is the publisher.

The backend repo does not get an `.npmrc`. It does not install this package.

## Out of scope

- Wiring `@agentic-sdlc-test/easybuy-api-client/domain` into `ecommerce-backend-node-example`
- Adding wishlist routes to the mock server
- Moving or rewriting the Redux cart
- Calling the backend cart routes (`/add-to-cart`, `/cart`, `/remove-from-cart`)
- Generating the client from OpenAPI
- Changing UI copy, layout, or navigation
- Publishing to npmjs
- Publishing to github.ibm.com
- Pushing `ecommerce-react-native-example` or `ecommerce-backend-node-example`

## Success criteria

- `npm test` in `easybuy-api-client` passes.
- `@agentic-sdlc-test/easybuy-api-client@0.1.0` is on GitHub Packages, linked to `Agentic-SDLC-test/easybuy-api-client`, published by the `publish` job on the first push to `main`.
- `.github/workflows/ci.yml` runs lint and test on pull requests, and publishes only on a push to `main` or `temp_main` when that `package.json` version is not already published.
- No repository in this pass contains an `_authToken`.
- The Expo app installs the package through `"@agentic-sdlc-test/easybuy-api-client": "file:../easybuy-api-client"` and still imports API operations from `api`.
- Changing `EXPO_PUBLIC_API_URL` is the only switch between the mock server and the real API.
- `ecommerce-backend-node-example` has no diff from this work.
