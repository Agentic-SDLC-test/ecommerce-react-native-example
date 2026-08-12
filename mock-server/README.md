# EasyBuy Mock API Server

A local Express.js mock server that replicates all API endpoints used by the EasyBuy React Native app.

## Setup & Start

```bash
cd mock-server
npm install       # only needed once
npm start         # starts server on http://localhost:3001
# or
npm run dev       # starts with nodemon (auto-restart on file changes)
```

## Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/register` | — | Register a new user |
| POST | `/login` | — | Login (returns user with token) |
| GET | `/products` | — | List all products |
| POST | `/product` | Admin | Add a product |
| POST | `/update-product?id=` | Admin | Update a product |
| GET | `/delete-product?id=` | Admin | Delete a product |
| GET | `/categories` | — | List all categories |
| POST | `/category` | Admin | Add a category |
| POST | `/update-category?id=` | Admin | Update a category |
| GET | `/delete-category?id=` | Admin | Delete a category |
| GET | `/dashboard` | Admin | Stats (users/orders/products/categories count) |
| GET | `/admin/orders` | Admin | All orders |
| GET | `/admin/users` | Admin | All users |
| GET | `/admin/order-status?orderId=&status=` | Admin | Update order status |
| GET | `/orders` | User | Current user's orders |
| POST | `/checkout` | User | Place an order |
| GET | `/product-reviews?productId=&limit=&offset=` | — | Visible reviews + aggregate for a product |
| GET | `/review-eligibility?productId=` | User | May this shopper review it, and their own review |
| POST | `/review` | User | Create or update the caller's review (one per product) |
| GET | `/admin/reviews?productId=&visibility=` | Admin | All reviews, including hidden ones |
| GET | `/admin/review-visibility?reviewId=&visibility=` | Admin | Hide or restore a review |
| GET | `/admin/delete-review?id=` | Admin | Remove a review permanently |
| GET | `/delete-user?id=` | — | Delete a user account |
| POST | `/reset-password?id=` | — | Update password |
| POST | `/photos/upload` | — | Upload an image |
| GET | `/uploads/:filename` | — | Serve uploaded images (SVG placeholder if not found) |

## Authentication

Pass the token in the `x-auth-token` header for protected routes.

### Pre-seeded test tokens

| Role | Token |
|------|-------|
| Admin | `mock-admin-token-001` |
| User | `mock-user-token-001` |

### Pre-seeded credentials (for `/login`)

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@easybuy.com` | `admin123` |
| User | `user@easybuy.com` | `user123` |
| User | `jane@easybuy.com` | `jane123` |

## Using with a Physical Device

If you're running the app on a physical device (not a simulator), replace `localhost` with your Mac's local IP address in `constants/Network.js`:

```js
serverip: "http://192.168.1.X:3001",  // replace with your actual local IP
```

Find your local IP with:
```bash
ipconfig getifaddr en0
```

## Mock Data

The server starts with pre-seeded data:
- **4 categories**: Garments, Electronics, Cosmetics, Groceries
- **8 products**: 2 per category
- **3 users**: 1 admin + 2 regular users
- **6 orders**: in various statuses (pending, shipped, delivered), two of them
  delivered specifically so the seeded reviews below are consistent with the
  eligibility rule
- **5 reviews**: 2 visible on `prod001` (one of them rating-only), 1 visible and
  1 hidden on `prod003` (so the hidden row can be seen excluded from the
  average), 1 visible on `prod007` authored by `user001` (so the seeded shopper
  has a review to edit). `prod005` and the rest have none, so the "No reviews
  yet" empty state is visible in the same session.

All data is stored in-memory and resets when the server restarts.

## Reviews

A review row:

```js
{
  _id: "rev001",
  productId: "prod001",                        // products[]._id
  user: { _id: "user001", name: "John Doe" },  // no email, deliberately
  reviewer_name: "John Doe",
  rating: 5,                                   // whole number 1..5
  text: "Fits well and the cotton is genuinely soft.",  // "" when rating-only
  verified_purchase: true,
  visibility: "visible",                       // "visible" | "hidden"
  moderated_by: null,                          // admin _id after a moderation action
  moderated_at: null,                          // ISO-8601
  moderation_action: null,                     // "hide" | "restore"
  createdAt: "2024-01-20T09:00:00.000Z",
  updatedAt: "2024-01-20T09:00:00.000Z"
}
```

Contract notes:

- **One review per `(productId, user._id)`.** `POST /review` upserts on that
  pair, preserving `_id` and `createdAt`, so an edit never moves the review
  count.
- **Eligibility is derived server-side** from the caller's own orders: a
  delivered order containing the product ⇒ `eligible`, an order that has not
  arrived yet ⇒ `not_delivered`, otherwise `no_purchase`. The client cannot
  assert it, and `POST /review` re-checks it on every write (`403`).
- **Aggregates come only from visible rows.** `summary` is
  `{ count, average, distribution }`, and `count: 0` is always paired with
  `average: null` — never `0`.
- **The shopper projection carries no email and no order reference**, because
  the row never stores either. Only `/admin/reviews` returns hidden rows and the
  moderation metadata.
- **Visibility is independent of order fulfilment and payment.**
  `/admin/review-visibility` writes only `visibility`, `moderated_by`,
  `moderated_at` and `moderation_action`; it never touches an order.
- **`REVIEWS_ENABLED=false`** makes all six review endpoints return
  `503 { reviews_disabled: true }` — the instant kill switch, no app release
  needed. Start with `REVIEWS_ENABLED=false npm start` to try it.