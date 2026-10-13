# EasyBuy Mock API Server

In-memory Express stand-in for the EasyBuy API. Same paths and `x-auth-token` header as [ecommerce-backend-node-example](https://github.com/Agentic-SDLC-test/ecommerce-backend-node-example). Wishlist routes are on that backend only; review routes are implemented here too. Data resets when the process restarts.

## Setup & Start

```bash
cd mock-server
npm install       # only needed once
npm start         # starts server on http://localhost:3002
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
| GET | `/delete-product?id=` | Admin | Delete a product (also purges its reviews) |
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
| GET | `/product-reviews?productId=` | — | Rating summary and recent reviews for a product |
| GET | `/my-review?productId=` | User | Caller's eligibility and own review for a product |
| POST | `/review` | User | Submit or edit a review (delivered-order customers only) |
| GET | `/admin/reviews` | Admin | All reviews, visible and hidden |
| POST | `/admin/review-visibility` | Admin | Hide or restore a review |
| POST | `/admin/delete-review` | Admin | Permanently delete a review |
| GET | `/delete-user?id=` | — | Delete a user account (also purges their reviews) |
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

## Using with a physical device

If you're running the app on a physical device (not a simulator), set `EXPO_PUBLIC_API_URL` to your Mac's LAN address and the mock server port, then restart Expo:

```bash
EXPO_PUBLIC_API_URL=http://<LAN-IP>:3002
```
EXPO_PUBLIC_API_URL=http://192.168.1.X:3002
```

Android emulators get `localhost` rewritten to `10.0.2.2` by `api/config.js`.

Find your LAN IP with:

Find your local IP with:

```bash
ipconfig getifaddr en0
```

## Mock Data

The server starts with pre-seeded data:
- **4 categories**: Garments, Electronics, Cosmetics, Groceries
- **8 products**: 2 per category
- **3 users**: 1 admin + 2 regular users
- **4 orders**: in various statuses (pending, shipped, delivered)
- **2 reviews**: seeded on the delivered `order004` so the review feature can be demonstrated without writing one first

All data is stored in-memory and resets when the server restarts.