# easybuy-api-client Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build `@agentic-sdlc-test/easybuy-api-client`, install it into the Expo app with a `file:` dependency, and let GitHub Actions publish `0.1.0` to GitHub Packages when `main` is pushed.

**Architecture:** A TypeScript package compiles to CommonJS in `dist/`. `domain` has constants and form checks and imports nothing. `createClient` sends the existing flat HTTP contract and takes `baseUrl`, `getToken`, and `onUnauthorized` from the app. The app keeps platform URL selection, SecureStore, navigation, screens, and the Redux cart.

**Tech Stack:** TypeScript 5, `tsc` to CommonJS, Node.js `node:test`, Expo 55 Metro, GitHub Packages at `https://npm.pkg.github.com`.

**Spec:** `ecommerce-react-native-example/docs/superpowers/specs/2026-10-07-easybuy-api-client-design.md`

## Global Constraints

- Package name is `@agentic-sdlc-test/easybuy-api-client`. Folder is `/Users/hharis/aircanada/ibm/easybuy-api-client`. Version is `0.1.0`.
- Entry points are `@agentic-sdlc-test/easybuy-api-client` and `@agentic-sdlc-test/easybuy-api-client/domain`. `domain` does not import the client.
- `tsc` target `ES2018`, module `commonjs`, `declaration` true, `outDir` `dist`, `rootDir` `src`, `strict` true. Also set `lib` to `["ES2018", "DOM"]` so `fetch`, `Headers`, and `FormData` typecheck.
- No runtime dependencies. Dev dependency is `typescript` only.
- No React Native, Express, or Mongoose imports in the package.
- Committed `.npmrc` files contain only `@agentic-sdlc-test:registry=https://npm.pkg.github.com`. No `_authToken` in any project file.
- The Expo app depends on `"@agentic-sdlc-test/easybuy-api-client": "file:../easybuy-api-client"`.
- `getBaseUrl()` stays in the app. The package does not read `EXPO_PUBLIC_API_URL`.
- HTTP 4xx/5xx JSON is returned, not thrown. Only a failed `fetch`, `getToken`, or `onUnauthorized` rejects.
- `onUnauthorized` runs only when `result.err === "jwt expired"`, then the body is still returned.
- Wishlist methods stay. Do not add wishlist routes to the mock server.
- Do not modify `ecommerce-backend-node-example`.
- Do not git push `ecommerce-react-native-example` or `ecommerce-backend-node-example`.
- Do not publish to npmjs or github.ibm.com.
- Do not run a local `npm publish`. The package workflow publishes on push to `main` or `temp_main` when `package.json` `version` is not already on GitHub Packages.
- `UpdatePasswordScreen` checks stay in that screen. The Redux cart stays in the app.
- Signup password rule is length under 6, including a 5-character password.

---

### Task 1: Domain module

**Files:**
- Create: `/Users/hharis/aircanada/ibm/easybuy-api-client/package.json`
- Create: `/Users/hharis/aircanada/ibm/easybuy-api-client/tsconfig.json`
- Create: `/Users/hharis/aircanada/ibm/easybuy-api-client/.gitignore`
- Create: `/Users/hharis/aircanada/ibm/easybuy-api-client/.npmrc`
- Create: `/Users/hharis/aircanada/ibm/easybuy-api-client/src/domain/index.ts`
- Test: `/Users/hharis/aircanada/ibm/easybuy-api-client/test/domain.test.js`

**Interfaces:**
- Consumes: nothing
- Produces: `UserType`, `OrderStatus`, `PaymentType`, `paths`, `validateLogin`, `validateSignup`, `validateProduct`, `validateCategory` from `dist/domain/index.js`

- [ ] **Step 1: Write the failing domain test**

Create the test file below. Do not create `src/` yet.

```js
const { test } = require("node:test");
const assert = require("node:assert/strict");
const {
  validateLogin,
  validateSignup,
  validateProduct,
  validateCategory,
  UserType,
  OrderStatus,
  PaymentType,
} = require("../dist/domain/index.js");

const validLogin = { email: "ab@cde", password: "123456" };

test("constants match the server strings", () => {
  assert.equal(UserType.USER, "USER");
  assert.equal(UserType.ADMIN, "ADMIN");
  assert.equal(OrderStatus.PENDING, "pending");
  assert.equal(OrderStatus.SHIPPED, "shipped");
  assert.equal(OrderStatus.DELIVERED, "delivered");
  assert.equal(PaymentType.COD, "cod");
  assert.equal(PaymentType.ONLINE, "online");
});

test("validateLogin returns the first failing message", () => {
  assert.equal(validateLogin({ email: "", password: "123456" }), "Please enter your email");
  assert.equal(validateLogin({ email: "ab@cde", password: "" }), "Please enter your password");
  assert.equal(validateLogin({ email: "abcdef", password: "123456" }), "Email is not valid");
  assert.equal(validateLogin({ email: "a@b", password: "123456" }), "Email is too short");
  assert.equal(validateLogin({ email: "ab@cde", password: "12345" }), "Password must be 6 characters long");
  assert.equal(validateLogin(validLogin), null);
});

test("validateSignup returns the first failing message", () => {
  assert.equal(
    validateSignup({ email: "", name: "Ada", password: "123456", confirmPassword: "123456" }),
    "Please enter your email"
  );
  assert.equal(
    validateSignup({ email: "ab@cde", name: "", password: "123456", confirmPassword: "123456" }),
    "Please enter your name"
  );
  assert.equal(
    validateSignup({ email: "ab@cde", name: "Ada", password: "", confirmPassword: "" }),
    "Please enter your password"
  );
  assert.equal(
    validateSignup({ email: "abcdef", name: "Ada", password: "123456", confirmPassword: "123456" }),
    "Email is not valid"
  );
  assert.equal(
    validateSignup({ email: "a@b", name: "Ada", password: "123456", confirmPassword: "123456" }),
    "Email is too short"
  );
  assert.equal(
    validateSignup({ email: "ab@cde", name: "Ada", password: "12345", confirmPassword: "12345" }),
    "Password must be 6 characters long"
  );
  assert.equal(
    validateSignup({ email: "ab@cde", name: "Ada", password: "123456", confirmPassword: "654321" }),
    "password does not match"
  );
  assert.equal(
    validateSignup({ email: "ab@cde", name: "Ada", password: "123456", confirmPassword: "123456" }),
    null
  );
});

test("validateProduct returns the first failing message", () => {
  assert.equal(
    validateProduct({ title: "", price: 1, quantity: 1, image: "a.png" }),
    "Please enter the product title"
  );
  assert.equal(
    validateProduct({ title: "Hat", price: 0, quantity: 1, image: "a.png" }),
    "Please enter the product price"
  );
  assert.equal(
    validateProduct({ title: "Hat", price: 1, quantity: 0, image: "a.png" }),
    "Quantity must be greater then 1"
  );
  assert.equal(
    validateProduct({ title: "Hat", price: 1, quantity: 1, image: null }),
    "Please upload the product image"
  );
  assert.equal(validateProduct({ title: "Hat", price: 1, quantity: 1, image: "a.png" }), null);
});

test("validateCategory returns the first failing message", () => {
  assert.equal(
    validateCategory({ title: "", description: "x", image: "a.png" }),
    "Please enter the product title"
  );
  assert.equal(
    validateCategory({ title: "Hats", description: "", image: "a.png" }),
    "Please upload the product image"
  );
  assert.equal(
    validateCategory({ title: "Hats", description: "x", image: null }),
    "Please upload the Catergory image"
  );
  assert.equal(validateCategory({ title: "Hats", description: "x", image: "a.png" }), null);
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run from `/Users/hharis/aircanada/ibm/easybuy-api-client`:

```bash
node --test test/domain.test.js
```

Expected: FAIL. The error includes `Cannot find module` and `dist/domain/index.js`.

- [ ] **Step 3: Add the package scaffold and domain implementation**

`package.json`:

```json
{
  "name": "@agentic-sdlc-test/easybuy-api-client",
  "version": "0.1.0",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/Agentic-SDLC-test/easybuy-api-client.git"
  },
  "publishConfig": {
    "registry": "https://npm.pkg.github.com"
  },
  "engines": {
    "node": ">=18"
  },
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "default": "./dist/index.js"
    },
    "./domain": {
      "types": "./dist/domain/index.d.ts",
      "default": "./dist/domain/index.js"
    }
  },
  "files": ["dist"],
  "scripts": {
    "build": "tsc",
    "lint": "echo \"No linter configured\" && exit 0",
    "test": "npm run build && node --test"
  },
  "devDependencies": {
    "typescript": "^5.0.0"
  }
}
```

`tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2018",
    "module": "commonjs",
    "lib": ["ES2018", "DOM"],
    "declaration": true,
    "outDir": "dist",
    "rootDir": "src",
    "strict": true
  },
  "include": ["src"]
}
```

`.gitignore`:

```
node_modules/
dist/
```

`.npmrc`:

```
@agentic-sdlc-test:registry=https://npm.pkg.github.com
```

`src/domain/index.ts`:

```ts
export const UserType = {
  USER: "USER",
  ADMIN: "ADMIN",
} as const;

export const OrderStatus = {
  PENDING: "pending",
  SHIPPED: "shipped",
  DELIVERED: "delivered",
} as const;

export const PaymentType = {
  COD: "cod",
  ONLINE: "online",
} as const;

export const paths = {
  register: "/register",
  login: "/login",
  resetPassword: "/reset-password",
  deleteUser: "/delete-user",
  products: "/products",
  product: "/product",
  updateProduct: "/update-product",
  deleteProduct: "/delete-product",
  categories: "/categories",
  category: "/category",
  updateCategory: "/update-category",
  deleteCategory: "/delete-category",
  checkout: "/checkout",
  orders: "/orders",
  adminOrders: "/admin/orders",
  orderStatus: "/admin/order-status",
  wishlist: "/wishlist",
  addToWishlist: "/add-to-wishlist",
  removeFromWishlist: "/remove-from-wishlist",
  dashboard: "/dashboard",
  users: "/admin/users",
  upload: "/photos/upload",
} as const;

export function validateLogin(input: { email: string; password: string }): string | null {
  const { email, password } = input;
  if (email == "") return "Please enter your email";
  if (password == "") return "Please enter your password";
  if (!email.includes("@")) return "Email is not valid";
  if (email.length < 6) return "Email is too short";
  if (password.length < 6) return "Password must be 6 characters long";
  return null;
}

export function validateSignup(input: {
  email: string;
  name: string;
  password: string;
  confirmPassword: string;
}): string | null {
  const { email, name, password, confirmPassword } = input;
  if (email == "") return "Please enter your email";
  if (name == "") return "Please enter your name";
  if (password == "") return "Please enter your password";
  if (!email.includes("@")) return "Email is not valid";
  if (email.length < 6) return "Email is too short";
  if (password.length < 6) return "Password must be 6 characters long";
  if (password != confirmPassword) return "password does not match";
  return null;
}

export function validateProduct(input: {
  title: string;
  price: any;
  quantity: any;
  image: any;
}): string | null {
  const { title, price, quantity, image } = input;
  if (title == "") return "Please enter the product title";
  if (price == 0) return "Please enter the product price";
  if (quantity <= 0) return "Quantity must be greater then 1";
  if (image == null) return "Please upload the product image";
  return null;
}

export function validateCategory(input: {
  title: string;
  description: string;
  image: any;
}): string | null {
  const { title, description, image } = input;
  if (title == "") return "Please enter the product title";
  if (description == "") return "Please upload the product image";
  if (image == null) return "Please upload the Catergory image";
  return null;
}
```

Then install and build:

```bash
cd /Users/hharis/aircanada/ibm/easybuy-api-client
npm install
```

- [ ] **Step 4: Run the tests to verify they pass**

```bash
cd /Users/hharis/aircanada/ibm/easybuy-api-client
npm test
```

Expected: PASS for the five domain tests. `dist/domain/index.js` exists.

- [ ] **Step 5: Commit**

```bash
cd /Users/hharis/aircanada/ibm/easybuy-api-client
git init
git add package.json package-lock.json tsconfig.json .gitignore .npmrc src/domain/index.ts test/domain.test.js
git commit -m "Add domain constants and form checks for the API client."
```

Expected: `git status` is clean. `git grep _authToken` prints nothing.

---

### Task 2: HTTP client

**Files:**
- Create: `/Users/hharis/aircanada/ibm/easybuy-api-client/src/index.ts`
- Test: `/Users/hharis/aircanada/ibm/easybuy-api-client/test/client.test.js`

**Interfaces:**
- Consumes: `paths` from `src/domain/index.ts`
- Produces: `createClient({ baseUrl, getToken, onUnauthorized })` from `dist/index.js`. Methods: `imageUrl`, `register`, `login`, `resetPassword`, `deleteUser`, `getProducts`, `createProduct`, `updateProduct`, `deleteProduct`, `getCategories`, `createCategory`, `updateCategory`, `deleteCategory`, `checkout`, `getOrders`, `getAdminOrders`, `updateOrderStatus`, `getWishlist`, `addToWishlist`, `removeFromWishlist`, `getDashboard`, `getUsers`, `uploadPhoto`. Each method returns `Promise<unknown>`.

- [ ] **Step 1: Write the failing client test**

```js
const { test } = require("node:test");
const assert = require("node:assert/strict");
const { createClient } = require("../dist/index.js");

function headerValue(init, name) {
  return new Headers(init && init.headers).get(name);
}

function installFetch(impl) {
  const original = global.fetch;
  global.fetch = impl;
  return () => {
    global.fetch = original;
  };
}

test("login posts JSON and sends the auth token", async () => {
  let seen;
  const restore = installFetch(async (url, init) => {
    seen = { url, init };
    return { json: async () => ({ success: true, data: { token: "t" } }) };
  });
  const client = createClient({
    baseUrl: "http://example.test/",
    getToken: async () => "jwt-1",
    onUnauthorized: () => {
      throw new Error("should not logout");
    },
  });
  const result = await client.login("a@b.co", "secret");
  restore();
  assert.equal(result.success, true);
  assert.equal(seen.url, "http://example.test/login");
  assert.equal(seen.init.method, "POST");
  assert.equal(headerValue(seen.init, "content-type"), "application/json");
  assert.equal(headerValue(seen.init, "x-auth-token"), "jwt-1");
  assert.equal(seen.init.body, JSON.stringify({ email: "a@b.co", password: "secret" }));
  assert.equal(client.imageUrl("a.png"), "http://example.test/uploads/a.png");
});

test("a null token omits x-auth-token", async () => {
  let seen;
  const restore = installFetch(async (url, init) => {
    seen = init;
    return { json: async () => ({ success: true }) };
  });
  const client = createClient({
    baseUrl: "http://example.test",
    getToken: async () => null,
    onUnauthorized: () => {},
  });
  await client.login("a@b.co", "secret");
  restore();
  assert.equal(headerValue(seen, "x-auth-token"), null);
});

test("getProducts without a search term has no query", async () => {
  let seenUrl;
  const restore = installFetch(async (url) => {
    seenUrl = url;
    return { json: async () => ({ success: true, data: [] }) };
  });
  const client = createClient({
    baseUrl: "http://example.test",
    getToken: async () => null,
    onUnauthorized: () => {},
  });
  await client.getProducts("");
  restore();
  assert.equal(seenUrl, "http://example.test/products");
});

test("getProducts with a search term keeps the encoded query", async () => {
  let seenUrl;
  const restore = installFetch(async (url) => {
    seenUrl = url;
    return { json: async () => ({}) };
  });
  const client = createClient({
    baseUrl: "http://example.test",
    getToken: async () => null,
    onUnauthorized: () => {},
  });
  await client.getProducts("a b");
  restore();
  assert.equal(seenUrl, "http://example.test/products?search=a%20b");
});

test("uploadPhoto does not set Content-Type", async () => {
  let seen;
  const restore = installFetch(async (url, init) => {
    seen = init;
    return { json: async () => ({ image: "a.png" }) };
  });
  const client = createClient({
    baseUrl: "http://example.test",
    getToken: async () => "jwt-1",
    onUnauthorized: () => {},
  });
  const body = new FormData();
  body.append("photos", "file");
  await client.uploadPhoto(body);
  restore();
  assert.equal(headerValue(seen, "content-type"), null);
  assert.equal(seen.body, body);
});

test("HTTP 401 JSON is returned and does not logout", async () => {
  let loggedOut = false;
  const restore = installFetch(async () => ({
    ok: false,
    status: 401,
    json: async () => ({ success: false, message: "Invalid email or password" }),
  }));
  const client = createClient({
    baseUrl: "http://example.test",
    getToken: async () => null,
    onUnauthorized: () => {
      loggedOut = true;
    },
  });
  const result = await client.login("a@b.co", "nope");
  restore();
  assert.equal(loggedOut, false);
  assert.equal(result.success, false);
  assert.equal(result.message, "Invalid email or password");
});

test("jwt expired calls onUnauthorized and still returns the body", async () => {
  let loggedOut = false;
  const restore = installFetch(async () => ({
    status: 401,
    json: async () => ({ err: "jwt expired" }),
  }));
  const client = createClient({
    baseUrl: "http://example.test",
    getToken: async () => "old",
    onUnauthorized: async () => {
      loggedOut = true;
    },
  });
  const result = await client.getOrders();
  restore();
  assert.equal(loggedOut, true);
  assert.equal(result.err, "jwt expired");
});

test("other err values do not logout", async () => {
  let loggedOut = false;
  const restore = installFetch(async () => ({
    json: async () => ({ err: "Authentication failed" }),
  }));
  const client = createClient({
    baseUrl: "http://example.test",
    getToken: async () => "old",
    onUnauthorized: () => {
      loggedOut = true;
    },
  });
  const result = await client.getOrders();
  restore();
  assert.equal(loggedOut, false);
  assert.equal(result.err, "Authentication failed");
});

test("a non-JSON body becomes an empty object", async () => {
  const restore = installFetch(async () => ({
    json: async () => {
      throw new Error("not json");
    },
  }));
  const client = createClient({
    baseUrl: "http://example.test",
    getToken: async () => null,
    onUnauthorized: () => {},
  });
  const result = await client.getCategories();
  restore();
  assert.deepEqual(result, {});
});

test("a rejected fetch rejects the call", async () => {
  const restore = installFetch(async () => {
    throw new Error("network down");
  });
  const client = createClient({
    baseUrl: "http://example.test",
    getToken: async () => null,
    onUnauthorized: () => {},
  });
  await assert.rejects(() => client.getProducts(), /network down/);
  restore();
});
```

- [ ] **Step 2: Run the test to verify it fails**

```bash
cd /Users/hharis/aircanada/ibm/easybuy-api-client
node --test test/client.test.js
```

Expected: FAIL. The error includes `Cannot find module` and `dist/index.js`, or `createClient is not a function` if an empty dist file already exists. Domain tests are not part of this command.

- [ ] **Step 3: Implement createClient**

`src/index.ts`:

```ts
import { paths } from "./domain";

export type ClientConfig = {
  baseUrl: string;
  getToken: () => Promise<string | null>;
  onUnauthorized: () => void | Promise<void>;
};

function queryValue(value: unknown): string {
  return encodeURIComponent(String(value));
}

export function createClient(config: ClientConfig) {
  const baseUrl = config.baseUrl.replace(/\/+$/, "");

  async function request(method: string, path: string, body?: unknown): Promise<any> {
    const headers = new Headers();
    const token = await config.getToken();
    if (token) headers.append("x-auth-token", token);

    let payload: BodyInit | undefined;
    if (body != null) {
      if (typeof FormData !== "undefined" && body instanceof FormData) {
        payload = body;
      } else {
        headers.append("Content-Type", "application/json");
        payload = typeof body === "string" ? body : JSON.stringify(body);
      }
    }

    const response = await fetch(`${baseUrl}${path}`, {
      method,
      headers,
      body: payload,
      redirect: "follow",
    });

    let result: any;
    try {
      result = await response.json();
    } catch (e) {
      result = {};
    }

    if (result?.err === "jwt expired") {
      await config.onUnauthorized();
    }
    return result;
  }

  return {
    imageUrl(filename: string) {
      return `${baseUrl}/uploads/${filename}`;
    },
    register: (payload: unknown) => request("POST", paths.register, payload),
    login: (email: string, password: string) =>
      request("POST", paths.login, { email, password }),
    resetPassword: (userId: unknown, body: unknown) =>
      request("POST", `${paths.resetPassword}?id=${queryValue(userId)}`, body),
    deleteUser: (userId: unknown) =>
      request("GET", `${paths.deleteUser}?id=${queryValue(userId)}`),
    getProducts: (search?: string) =>
      request(
        "GET",
        search ? `${paths.products}?search=${queryValue(search)}` : paths.products
      ),
    createProduct: (payload: unknown) => request("POST", paths.product, payload),
    updateProduct: (id: unknown, payload: unknown) =>
      request("POST", `${paths.updateProduct}?id=${queryValue(id)}`, payload),
    deleteProduct: (id: unknown) =>
      request("GET", `${paths.deleteProduct}?id=${queryValue(id)}`),
    getCategories: () => request("GET", paths.categories),
    createCategory: (payload: unknown) => request("POST", paths.category, payload),
    updateCategory: (id: unknown, payload: unknown) =>
      request("POST", `${paths.updateCategory}?id=${queryValue(id)}`, payload),
    deleteCategory: (id: unknown) =>
      request("GET", `${paths.deleteCategory}?id=${queryValue(id)}`),
    checkout: (payload: unknown) => request("POST", paths.checkout, payload),
    getOrders: () => request("GET", paths.orders),
    getAdminOrders: () => request("GET", paths.adminOrders),
    updateOrderStatus: (orderId: unknown, status: unknown) =>
      request(
        "GET",
        `${paths.orderStatus}?orderId=${queryValue(orderId)}&status=${queryValue(status)}`
      ),
    getWishlist: () => request("GET", paths.wishlist),
    addToWishlist: (productId: unknown, quantity = 1) =>
      request("POST", paths.addToWishlist, { productId, quantity }),
    removeFromWishlist: (productId: unknown) =>
      request("GET", `${paths.removeFromWishlist}?id=${queryValue(productId)}`),
    getDashboard: () => request("GET", paths.dashboard),
    getUsers: () => request("GET", paths.users),
    uploadPhoto: (formData: FormData) => request("POST", paths.upload, formData),
  };
}
```

- [ ] **Step 4: Run the tests to verify they pass**

```bash
cd /Users/hharis/aircanada/ibm/easybuy-api-client
npm test
```

Expected: PASS for every test in `test/domain.test.js` and `test/client.test.js`.

- [ ] **Step 5: Commit**

```bash
cd /Users/hharis/aircanada/ibm/easybuy-api-client
git add src/index.ts test/client.test.js
git commit -m "Add the fetch client for the ecommerce HTTP contract."
```

---

### Task 3: Install the package in the Expo app

**Files:**
- Modify: `/Users/hharis/aircanada/ibm/ecommerce-react-native-example/package.json`
- Modify: `/Users/hharis/aircanada/ibm/ecommerce-react-native-example/package-lock.json`
- Modify: `/Users/hharis/aircanada/ibm/ecommerce-react-native-example/metro.config.js`
- Create: `/Users/hharis/aircanada/ibm/ecommerce-react-native-example/.npmrc`
- Modify: `/Users/hharis/aircanada/ibm/ecommerce-react-native-example/api/index.js`
- Modify: `/Users/hharis/aircanada/ibm/ecommerce-react-native-example/api/config.js`
- Delete: `/Users/hharis/aircanada/ibm/ecommerce-react-native-example/api/client.js`

**Interfaces:**
- Consumes: `createClient` from Task 2, and the app's existing `getBaseUrl`, `session.getToken`, `session.clearSession`, `resetToLogin`
- Produces: `api.login`, `api.getProducts`, and the rest of the current `api/index.js` names, plus `api.imageUrl(filename)` and `api.getBaseUrl`

- [ ] **Step 1: Point Metro and npm at the sibling package**

Add this dependency to `package.json` `dependencies`:

```json
"@agentic-sdlc-test/easybuy-api-client": "file:../easybuy-api-client"
```

Replace `metro.config.js` with:

```js
const path = require("path");
const { getDefaultConfig } = require("expo/metro-config");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);
config.watchFolders = [path.resolve(__dirname, "../easybuy-api-client")];

module.exports = config;
```

Create `.npmrc`:

```
@agentic-sdlc-test:registry=https://npm.pkg.github.com
```

Run:

```bash
cd /Users/hharis/aircanada/ibm/ecommerce-react-native-example
npm install
```

Expected: `node_modules/@agentic-sdlc-test/easybuy-api-client` exists. `package-lock.json` records the `file:` dependency.

- [ ] **Step 2: Replace the local API client**

Replace `api/index.js` with:

```js
import { createClient } from "@agentic-sdlc-test/easybuy-api-client";
import { getBaseUrl } from "./config";
import * as session from "../utils/session";
import { resetToLogin } from "../routes/navigationRef";

const client = createClient({
  baseUrl: getBaseUrl(),
  getToken: () => session.getToken(),
  onUnauthorized: async () => {
    await session.clearSession();
    resetToLogin();
  },
});

export const register = client.register;
export const login = client.login;
export const resetPassword = client.resetPassword;
export const deleteUser = client.deleteUser;
export const getProducts = client.getProducts;
export const createProduct = client.createProduct;
export const updateProduct = client.updateProduct;
export const deleteProduct = client.deleteProduct;
export const getCategories = client.getCategories;
export const createCategory = client.createCategory;
export const updateCategory = client.updateCategory;
export const deleteCategory = client.deleteCategory;
export const checkout = client.checkout;
export const getOrders = client.getOrders;
export const getAdminOrders = client.getAdminOrders;
export const updateOrderStatus = client.updateOrderStatus;
export const getWishlist = client.getWishlist;
export const addToWishlist = client.addToWishlist;
export const removeFromWishlist = client.removeFromWishlist;
export const getDashboard = client.getDashboard;
export const getUsers = client.getUsers;
export const uploadPhoto = client.uploadPhoto;
export const imageUrl = (filename) => client.imageUrl(filename);

export { getBaseUrl };
```

Delete the `imageUrl` function from `api/config.js`. Leave `getBaseUrl`, `defaultHost`, and `forPlatform` in that file.

Delete `api/client.js`.

- [ ] **Step 3: Verify the app can load the package**

```bash
cd /Users/hharis/aircanada/ibm/ecommerce-react-native-example
node -e "const c = require('@agentic-sdlc-test/easybuy-api-client'); if (typeof c.createClient !== 'function') process.exit(1)"
npm test -- __tests__/colors.test.js
test ! -f api/client.js
git grep -n _authToken -- ':!docs/superpowers' || true
```

Expected: the node command exits 0, the colors Jest test passes, `api/client.js` is gone, and `git grep` prints nothing.

- [ ] **Step 4: Commit**

```bash
cd /Users/hharis/aircanada/ibm/ecommerce-react-native-example
git add package.json package-lock.json metro.config.js .npmrc api/index.js api/config.js
git add -u api/client.js
git commit -m "Install the shared API client and remove the local fetch wrapper."
```

Do not push.

---

### Task 4: Image URLs

**Files:**
- Modify: `/Users/hharis/aircanada/ibm/ecommerce-react-native-example/screens/admin/EditProductScreen.js`
- Modify: `/Users/hharis/aircanada/ibm/ecommerce-react-native-example/screens/admin/ViewCategoryScreen.js`
- Modify: `/Users/hharis/aircanada/ibm/ecommerce-react-native-example/screens/admin/ViewProductScreen.js`
- Modify: `/Users/hharis/aircanada/ibm/ecommerce-react-native-example/screens/profile/MyWishlistScreen.js`
- Modify: `/Users/hharis/aircanada/ibm/ecommerce-react-native-example/screens/user/ProductDetailScreen.js`
- Modify: `/Users/hharis/aircanada/ibm/ecommerce-react-native-example/screens/user/CategoriesScreen.js`
- Modify: `/Users/hharis/aircanada/ibm/ecommerce-react-native-example/screens/user/CartScreen.js`
- Modify: `/Users/hharis/aircanada/ibm/ecommerce-react-native-example/components/HomeScreen/NewArrivals.js`
- Modify: `/Users/hharis/aircanada/ibm/ecommerce-react-native-example/components/ProductCard/ProductCard.js`
- Modify: `/Users/hharis/aircanada/ibm/ecommerce-react-native-example/components/CartProductList/CartProductList.js`
- Modify: `/Users/hharis/aircanada/ibm/ecommerce-react-native-example/screens/user/MyOrderDetailScreen.js`
- Modify: `/Users/hharis/aircanada/ibm/ecommerce-react-native-example/constants/index.js`
- Delete: `/Users/hharis/aircanada/ibm/ecommerce-react-native-example/constants/Network.js`

**Interfaces:**
- Consumes: `api.imageUrl` from Task 3
- Produces: no `network.serverip` reads left in the app

- [ ] **Step 1: Replace upload URL strings**

In each file, change the import and the URL.

`EditProductScreen.js`: import `{ colors }` instead of `{ colors, network }`. Replace

```js
setImage(`${network.serverip}/uploads/${product?.image}`);
```

with

```js
setImage(api.imageUrl(product?.image));
```

`ViewCategoryScreen.js`: same import change. Replace

```js
icon={`${network.serverip}/uploads/${item?.icon}`}
```

with

```js
icon={api.imageUrl(item?.icon)}
```

`ViewProductScreen.js`: same import change. Replace

```js
image={`${network.serverip}/uploads/${product?.image}`}
```

with

```js
image={api.imageUrl(product?.image)}
```

`MyWishlistScreen.js`: same import change. Replace

```js
image={`${network.serverip}/uploads/${list?.productId?.image}`}
```

with

```js
image={api.imageUrl(list?.productId?.image)}
```

`ProductDetailScreen.js`: same import change. Replace

```js
SetProductImage(`${network.serverip}/uploads/${product?.image}`);
```

with

```js
SetProductImage(api.imageUrl(product?.image));
```

`CategoriesScreen.js`: same import change. Replace

```js
image={`${network.serverip}/uploads/${product.image}`}
```

with

```js
image={api.imageUrl(product.image)}
```

`CartScreen.js`: same import change. Replace

```js
image={`${network.serverip}/uploads/${item.image}`}
```

with

```js
image={api.imageUrl(item.image)}
```

`NewArrivals.js`: same import change. Replace

```js
image={`${network.serverip}/uploads/${item.image}`}
```

with

```js
image={api.imageUrl(item.image)}
```

These files import `network` and do not read it. Change the import to `colors` only:

- `components/ProductCard/ProductCard.js`
- `components/CartProductList/CartProductList.js`
- `screens/user/MyOrderDetailScreen.js`

Replace `constants/index.js` with:

```js
export { default as colors } from "./Colors";
```

Delete `constants/Network.js`.

- [ ] **Step 2: Verify no serverip reads remain**

```bash
cd /Users/hharis/aircanada/ibm/ecommerce-react-native-example
git grep -n "network.serverip" -- ':!docs' ':!mock-server' || true
git grep -n "constants/Network" -- ':!docs' || true
npm test -- __tests__/colors.test.js
```

Expected: both `git grep` commands print nothing. The colors test passes.

- [ ] **Step 3: Commit**

```bash
cd /Users/hharis/aircanada/ibm/ecommerce-react-native-example
git add screens components constants
git add -u constants/Network.js
git commit -m "Build upload image URLs through the shared API client."
```

Do not push.

---

### Task 5: Form checks in screens

**Files:**
- Modify: `/Users/hharis/aircanada/ibm/ecommerce-react-native-example/screens/auth/LoginScreen.js`
- Modify: `/Users/hharis/aircanada/ibm/ecommerce-react-native-example/screens/auth/SignupScreen.js`
- Modify: `/Users/hharis/aircanada/ibm/ecommerce-react-native-example/screens/admin/AddProductScreen.js`
- Modify: `/Users/hharis/aircanada/ibm/ecommerce-react-native-example/screens/admin/EditProductScreen.js`
- Modify: `/Users/hharis/aircanada/ibm/ecommerce-react-native-example/screens/admin/AddCategoryScreen.js`
- Modify: `/Users/hharis/aircanada/ibm/ecommerce-react-native-example/screens/admin/EditCategoryScreen.js`

**Interfaces:**
- Consumes: `validateLogin`, `validateSignup`, `validateProduct`, `validateCategory` from Task 1
- Produces: those screens call the shared functions before any request

- [ ] **Step 1: Replace the inline checks**

`LoginScreen.js`, add:

```js
import { validateLogin } from "@agentic-sdlc-test/easybuy-api-client/domain";
```

Replace the block from `if (email == "")` through the password length check with:

```js
    const validationError = validateLogin({ email, password });
    if (validationError) {
      setIsloading(false);
      return setError(validationError);
    }
```

`SignupScreen.js`, add:

```js
import { validateSignup } from "@agentic-sdlc-test/easybuy-api-client/domain";
```

Replace the block from `if (email == "")` through the confirm-password check with:

```js
    const validationError = validateSignup({
      email,
      name,
      password,
      confirmPassword,
    });
    if (validationError) {
      return setError(validationError);
    }
```

`AddProductScreen.js` and `EditProductScreen.js`, add:

```js
import { validateProduct } from "@agentic-sdlc-test/easybuy-api-client/domain";
```

Replace each `if (title == "") { ... } else if (price == 0) { ... } else if (quantity <= 0) { ... } else if (image == null) { ... } else {` chain with:

```js
    const validationError = validateProduct({ title, price, quantity, image });
    if (validationError) {
      setError(validationError);
      setIsloading(false);
    } else {
```

Keep the existing `api.createProduct` / `api.updateProduct` call inside that `else`.

`AddCategoryScreen.js` and `EditCategoryScreen.js`, add:

```js
import { validateCategory } from "@agentic-sdlc-test/easybuy-api-client/domain";
```

Replace each title / description / image chain with:

```js
    const validationError = validateCategory({ title, description, image });
    if (validationError) {
      setError(validationError);
      setIsloading(false);
    } else {
```

Keep the existing `api.createCategory` / `api.updateCategory` call inside that `else`.

- [ ] **Step 2: Verify the old checks are gone**

```bash
cd /Users/hharis/aircanada/ibm/ecommerce-react-native-example
git grep -n "Please enter your email" -- screens || true
git grep -n "validateLogin\|validateSignup\|validateProduct\|validateCategory" -- screens
```

Expected: the first command prints nothing. The second prints one import or call in each of the six screens.

- [ ] **Step 3: Commit**

```bash
cd /Users/hharis/aircanada/ibm/ecommerce-react-native-example
git add screens/auth/LoginScreen.js screens/auth/SignupScreen.js screens/admin/AddProductScreen.js screens/admin/EditProductScreen.js screens/admin/AddCategoryScreen.js screens/admin/EditCategoryScreen.js
git commit -m "Use shared form checks on login, signup, product, and category screens."
```

Do not push.

---

### Task 6: Domain constants at data call sites

**Files:**
- Modify: `/Users/hharis/aircanada/ibm/ecommerce-react-native-example/screens/auth/Splash.js`
- Modify: `/Users/hharis/aircanada/ibm/ecommerce-react-native-example/screens/auth/LoginScreen.js`
- Modify: `/Users/hharis/aircanada/ibm/ecommerce-react-native-example/screens/auth/SignupScreen.js`
- Modify: `/Users/hharis/aircanada/ibm/ecommerce-react-native-example/utils/session.js`
- Modify: `/Users/hharis/aircanada/ibm/ecommerce-react-native-example/screens/user/CheckoutScreen.js`
- Modify: `/Users/hharis/aircanada/ibm/ecommerce-react-native-example/screens/user/MyOrderDetailScreen.js`
- Modify: `/Users/hharis/aircanada/ibm/ecommerce-react-native-example/screens/admin/ViewOrderDetailScreen.js`
- Modify: `/Users/hharis/aircanada/ibm/ecommerce-react-native-example/screens/admin/AddProductScreen.js`

**Interfaces:**
- Consumes: `UserType`, `OrderStatus`, `PaymentType` from Task 1
- Produces: those comparisons and payload fields use the constants. Labels `"Pending"`, `"Shipped"`, and `"Delivered"` stay.

- [ ] **Step 1: Replace role and status strings**

`Splash.js`, add `import { UserType } from "@agentic-sdlc-test/easybuy-api-client/domain";` and change `user.userType === "ADMIN"` to `user.userType === UserType.ADMIN`.

`LoginScreen.js`: change the Task 5 import to

```js
import { validateLogin, UserType } from "@agentic-sdlc-test/easybuy-api-client/domain";
```

and change `user.userType === "ADMIN"` to `user.userType === UserType.ADMIN`.

`SignupScreen.js`: change the Task 5 import to

```js
import { validateSignup, UserType } from "@agentic-sdlc-test/easybuy-api-client/domain";
```

and change `userType: "USER"` to `userType: UserType.USER`.

`session.js`, add the `UserType` import and change `user?.userType === "ADMIN"` to `user?.userType === UserType.ADMIN`. Do not change `getUser`, `getToken`, `setSession`, or `clearSession`.

`CheckoutScreen.js`, add:

```js
import { OrderStatus, PaymentType } from "@agentic-sdlc-test/easybuy-api-client/domain";
```

Change `payment_type: "cod"` to `payment_type: PaymentType.COD` and `status: "pending"` to `status: OrderStatus.PENDING`.

`MyOrderDetailScreen.js`, add `import { OrderStatus } from "@agentic-sdlc-test/easybuy-api-client/domain";`. Change `orderDetail?.status == "delivered"` to `orderDetail?.status == OrderStatus.DELIVERED`, `=== "pending"` to `=== OrderStatus.PENDING`, and `=== "shipped"` to `=== OrderStatus.SHIPPED`. Leave the final `else` branch as it is.

`ViewOrderDetailScreen.js`, add the same `OrderStatus` import. Change `orderDetail?.status == "delivered"` to `orderDetail?.status == OrderStatus.DELIVERED`. Replace the dropdown items with:

```js
  const [items, setItems] = useState([
    { label: "Pending", value: OrderStatus.PENDING },
    { label: "Shipped", value: OrderStatus.SHIPPED },
    { label: "Delivered", value: OrderStatus.DELIVERED },
  ]);
```

`AddProductScreen.js`: change the Task 5 import to

```js
import { validateProduct, OrderStatus } from "@agentic-sdlc-test/easybuy-api-client/domain";
```

and use the same dropdown `value` fields as `ViewOrderDetailScreen.js`. Keep the labels.

- [ ] **Step 2: Verify the old data strings are gone from those checks**

```bash
cd /Users/hharis/aircanada/ibm/ecommerce-react-native-example
git grep -n 'userType === "ADMIN"' -- screens utils || true
git grep -n 'payment_type: "cod"' -- screens || true
git grep -n 'status: "pending"' -- screens/user/CheckoutScreen.js || true
npm test -- __tests__/colors.test.js
```

Expected: the three `git grep` commands print nothing. The colors test passes. `mock-server/server.js` still contains its own `"cod"` and `"pending"` strings. Do not edit that file.

- [ ] **Step 3: Commit**

```bash
cd /Users/hharis/aircanada/ibm/ecommerce-react-native-example
git add screens/auth/Splash.js screens/auth/LoginScreen.js screens/auth/SignupScreen.js utils/session.js screens/user/CheckoutScreen.js screens/user/MyOrderDetailScreen.js screens/admin/ViewOrderDetailScreen.js screens/admin/AddProductScreen.js
git commit -m "Use shared role, order, and payment constants."
```

Do not push.

---

### Task 7: GitHub repo and publish workflow

**Files:**
- Create: `/Users/hharis/aircanada/ibm/easybuy-api-client/.github/workflows/ci.yml`

**Interfaces:**
- Consumes: the commits from Tasks 1 and 2, `npm run lint`, `npm test`, and `publishConfig.registry`
- Produces: public repo `Agentic-SDLC-test/easybuy-api-client`, and `@agentic-sdlc-test/easybuy-api-client@0.1.0` published by the `publish` job on the first push to `main`

- [ ] **Step 1: Add the workflow**

Create `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  push:
    branches:
      - main
      - temp_main
  pull_request:
    branches:
      - main
      - temp_main

permissions:
  contents: read

jobs:
  lint:
    name: Lint
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v5

      - name: Setup Node.js
        uses: actions/setup-node@v6
        with:
          node-version: 20
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Lint
        run: npm run lint

  test:
    name: Test
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v5

      - name: Setup Node.js
        uses: actions/setup-node@v6
        with:
          node-version: 20
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Test
        run: npm test

  publish:
    name: Publish package
    runs-on: ubuntu-latest
    needs: [lint, test]
    if: github.event_name == 'push'
    permissions:
      contents: read
      packages: write
    steps:
      - name: Checkout code
        uses: actions/checkout@v5

      - name: Setup Node.js
        uses: actions/setup-node@v6
        with:
          node-version: 20
          cache: npm
          registry-url: https://npm.pkg.github.com
          scope: "@agentic-sdlc-test"

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Publish new version
        env:
          NODE_AUTH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: |
          VERSION=$(node -p "require('./package.json').version")
          NAME=$(node -p "require('./package.json').name")
          if npm view "${NAME}@${VERSION}" version --registry=https://npm.pkg.github.com > /dev/null 2>&1; then
            echo "${NAME}@${VERSION} is already on GitHub Packages. Skip publish."
            exit 0
          fi
          npm publish
```

- [ ] **Step 2: Re-run the library tests**

```bash
cd /Users/hharis/aircanada/ibm/easybuy-api-client
npm test
npm run lint
git grep -n _authToken || true
```

Expected: tests pass, lint prints `No linter configured`, and `git grep` prints nothing.

- [ ] **Step 3: Commit the workflow**

```bash
cd /Users/hharis/aircanada/ibm/easybuy-api-client
git add .github/workflows/ci.yml
git commit -m "Publish a new package version when a pull request merges."
```

- [ ] **Step 4: Create the public repo and push only this package**

```bash
cd /Users/hharis/aircanada/ibm/easybuy-api-client
git branch -M main
gh repo create Agentic-SDLC-test/easybuy-api-client --public --source=. --remote=origin --push
```

Expected: GitHub prints `https://github.com/Agentic-SDLC-test/easybuy-api-client`. That push to `main` starts the workflow. Do not run `npm publish` locally. Do not run `git push` in `ecommerce-react-native-example` or `ecommerce-backend-node-example`.

- [ ] **Step 5: Wait for the publish job**

```bash
cd /Users/hharis/aircanada/ibm/easybuy-api-client
gh run watch --repo Agentic-SDLC-test/easybuy-api-client
npm view @agentic-sdlc-test/easybuy-api-client version --registry=https://npm.pkg.github.com
```

Expected: the `publish` job succeeds, and `npm view` prints `0.1.0`.

- [ ] **Step 6: Confirm the backend repo is untouched**

```bash
git -C /Users/hharis/aircanada/ibm/ecommerce-backend-node-example status --short
```

Expected: no output.

Manual check, separate from `npm test`: start the mock server on port 3002 and run the Expo app with `EXPO_PUBLIC_API_URL=http://localhost:3002`, then log in as `user@easybuy.com`. Stop the mock server, start the real API on another port, point `EXPO_PUBLIC_API_URL` at that port, and log in again. Both logins use `api.login` from the shared client.
