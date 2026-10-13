# EasyBuy Mock API Server

In-memory Express stand-in for the EasyBuy API. Same paths and `x-auth-token` header as [ecommerce-backend-node-example](https://github.com/Agentic-SDLC-test/ecommerce-backend-node-example). Wishlist routes are on that backend only; review routes are served by both, following the same shared contract. Data resets when the process restarts.

## Setup & Start

```bash
cd mock-server
npm install       # only needed once
npm start         # starts server on http://localhost:3002
# or
npm run dev       # starts with nodemon (auto-restart on file changes)
# or
npm test          # runs the review contract test suite (node:test)
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
| GET | `/delete-user?id=` | — | Delete a user account |
| POST | `/reset-password?id=` | — | Update password |
| GET | `/products/:id/reviews` | — (optional auth) | Rating summary, distribution, recent reviews and (when authenticated) the caller's own review |
| POST | `/reviews` | User | Submit a review (verified purchasers only, one per product) |
| POST | `/reviews/:id/update` | User | Edit your own review (visibility stays unchanged) |
| GET | `/admin/reviews` | Admin | All reviews, visible and hidden |
| POST | `/admin/reviews/:id/visibility` | Admin | Hide or show a review |
| POST | `/admin/reviews/:id/delete` | Admin | Permanently delete a review |
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

## Using with a physical device

The app reads `EXPO_PUBLIC_API_URL` (see `.env.example` in the app root). Simulators can use `http://localhost:3002`. A phone cannot. Set the URL to your machine's LAN IP and restart Expo:

```
EXPO_PUBLIC_API_URL=http://192.168.1.X:3002
```

Android emulators get `localhost` rewritten to `10.0.2.2` by `api/config.js`.

Find your LAN IP with:

```bash
ipconfig getifaddr en0
```

## Mock Data

The server starts with pre-seeded data:
- **4 categories**: Garments, Electronics, Cosmetics, Groceries
- **8 products**: 2 per category
- **3 users**: 1 admin + 2 regular users
- **3 orders**: in various statuses (pending, shipped, delivered)
- **2 reviews**: `rev001` on `prod001` by `user001`, `rev002` on `prod003` by `user002`

Review eligibility fixture: `user001` has a `delivered` order (`order003`) containing `prod007`, so `mock-user-token-001` is eligible to review `prod007`. `user002` has no delivered orders and is not eligible to review anything.

All data is stored in-memory and resets when the server restarts.