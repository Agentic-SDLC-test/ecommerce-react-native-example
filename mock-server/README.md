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
| GET | `/reviews?productId=` | — | Aggregate, visible reviews and viewer context for a product |
| POST | `/review` | User | Submit or update the caller's review (verified purchasers only) |
| GET | `/delete-review?id=` | User | Remove the caller's own review |
| GET | `/admin/reviews` | Admin | All reviews, newest first, with visibility state |
| GET | `/admin/review-visibility?reviewId=&visible=` | Admin | Hide or unhide a review |
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
- **3 orders**: in various statuses (pending, shipped, delivered)
- **10 reviews**: across 4 products (one hidden), leaving 4 products with none

All data is stored in-memory and resets when the server restarts.

## Review rules

Eligibility is configuration, not code. `REVIEWS_VERIFIED_PURCHASE_STATUSES` is
a comma-separated list of the order statuses that count as a verified purchase:

```bash
npm start                                              # default: pending,shipped,delivered
REVIEWS_VERIFIED_PURCHASE_STATUSES=delivered npm start # require delivery first
```

The resolved list is printed at boot, so the rule actually in force is always
readable from the server's own output. All review log lines share the
`[reviews]` prefix and are `key=value` so they can be grepped or shipped:

| Line | When |
|------|------|
| `[reviews] event=config verifiedPurchaseStatuses=…` | once at boot |
| `[reviews] event=upsert mode=created\|updated reviewId=… productId=… rating=… userId=…` | a review is created or replaced |
| `[reviews] event=upsert-rejected reason=not-verified-purchaser userId=… productId=…` | a non-purchaser tries to post |
| `[reviews] event=visibility-change reviewId=… from=… to=… adminId=… at=…` | an admin hides or unhides a review |

`verifiedPurchase` is decided by the server from the shopper's order history on
both the create and the update path — it is never read from the request body,
so a client cannot claim a badge it has not earned.

## Verifying the review endpoints

With the server running, `./verify-reviews.sh` walks the whole review contract
(read, gated write, non-purchaser rejection, bad rating, hide, aggregate
re-check, unhide, author delete) and exits non-zero on the first failure. It is
not part of CI because it needs a live server, and Jest excludes `mock-server/`.