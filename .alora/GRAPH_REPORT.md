# Graph Report - .  (2026-07-31)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 437 nodes · 784 edges · 48 communities (15 shown, 33 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 2 edges (avg confidence: 0.5)
- Token cost: 1,089 input · 528 output

## Graph Freshness
- Built from commit: `1fa8d417`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Reusable UI Components
- Home and Cart UI
- API Client Services
- Expo App Configuration
- Build and Test Tools
- Mock Server Setup
- Order Management UI
- Cart State Management
- Backend Server Logic
- User Account UI
- Auth and Session Storage
- Expo Core Dependencies
- Image Download Scripts
- Wishlist UI
- ESLint Configuration
- Metro Bundler Config
- Babel Expo Preset
- Date Utility Library
- File System Library
- Media Library Integration
- Expo Metro Config
- Status Bar Component
- OTA Update Library
- Icon Library
- Timezone Utility Library
- React Core
- Logging Utility
- React Web Support
- React Native Core
- Local Storage Library
- Network Info Library
- Dropdown UI Component
- Gesture Handling Library
- Image Picker Library
- Network Alert Library
- Progress Dialog UI
- Safe Area Management
- Screen Management Library
- Searchable Dropdown UI
- Step Indicator UI
- React Native Web Support
- Bottom Tab Navigation
- Navigation Core
- Stack Navigation
- Redux React Bindings
- Redux State Management
- Redux Middleware

## God Nodes (most connected - your core abstractions)
1. `colors` - 49 edges
2. `expo` - 17 edges
3. `CustomAlert()` - 17 edges
4. `get()` - 15 edges
5. `CustomInput()` - 15 edges
6. `CustomButton()` - 14 edges
7. `post()` - 13 edges
8. `network` - 12 edges
9. `q()` - 10 edges
10. `scripts` - 10 edges

## Surprising Connections (you probably didn't know these)
- `CartScreen()` --calls--> `decreaseCartItemQuantity()`  [EXTRACTED]
  screens/user/CartScreen.js → states/actionCreaters/actionCreaters.js
- `CartScreen()` --calls--> `increaseCartItemQuantity()`  [EXTRACTED]
  screens/user/CartScreen.js → states/actionCreaters/actionCreaters.js
- `CartScreen()` --calls--> `removeCartItem()`  [EXTRACTED]
  screens/user/CartScreen.js → states/actionCreaters/actionCreaters.js
- `ProductDetailScreen()` --calls--> `addCartItem()`  [EXTRACTED]
  screens/user/ProductDetailScreen.js → states/actionCreaters/actionCreaters.js
- `request()` --calls--> `resetToLogin()`  [EXTRACTED]
  api/client.js → routes/navigationRef.js

## Import Cycles
- None detected.

## Communities (48 total, 33 thin omitted)

### Community 0 - "Reusable UI Components"
Cohesion: 0.06
Nodes (56): BasicProductList(), styles, CategoryList(), styles, ConnectionAlert(), CustomAlert(), styles, CustomButton() (+48 more)

### Community 1 - "Home and Cart UI"
Cohesion: 0.07
Nodes (29): CartProductList(), styles, CustomIconButton(), styles, CategoryList(), styles, HomeHeader(), styles (+21 more)

### Community 2 - "API Client Services"
Cohesion: 0.12
Nodes (32): get(), post(), request(), defaultHost(), forPlatform(), getBaseUrl(), imageUrl(), addToWishlist() (+24 more)

### Community 3 - "Expo App Configuration"
Cohesion: 0.06
Nodes (35): backgroundColor, foregroundImage, adaptiveIcon, package, permissions, projectId, expo, android (+27 more)

### Community 4 - "Build and Test Tools"
Cohesion: 0.06
Nodes (34): @babel/core, @babel/plugin-proposal-export-namespace-from, eslint, eslint-config-expo, jest, jest-expo, devDependencies, @babel/core (+26 more)

### Community 5 - "Mock Server Setup"
Cohesion: 0.10
Nodes (20): cors, express, dependencies, cors, express, multer, uuid, description (+12 more)

### Community 6 - "Order Management UI"
Cohesion: 0.17
Nodes (12): dateFormat(), getTime(), OrderList(), styles, styles, Tab, Tabs(), CategoriesScreen() (+4 more)

### Community 7 - "Cart State Management"
Cohesion: 0.16
Nodes (9): Routes(), CART_ADD, CART_REMOVE, DECREASE_CART_ITEM_QUANTITY, EMPTY_CART, INCREASE_CART_ITEM_QUANTITY, reducer(), reducers (+1 more)

### Community 8 - "Backend Server Logic"
Cohesion: 0.14
Nodes (14): adminMiddleware(), app, authMiddleware(), categories, cors, express, multer, orders (+6 more)

### Community 9 - "User Account UI"
Cohesion: 0.20
Nodes (8): OptionList(), styles, styles, UserProfileCard(), MyAccountScreen(), styles, styles, UserProfileScreen()

### Community 10 - "Auth and Session Storage"
Cohesion: 0.18
Nodes (6): plugins, expo-secure-store, expo-secure-store, getToken(), getUser(), isAdmin()

### Community 11 - "Expo Core Dependencies"
Cohesion: 0.22
Nodes (9): expo, expo-dev-client, expo-image-picker, moment, dependencies, expo, expo-dev-client, expo-image-picker (+1 more)

### Community 12 - "Image Download Scripts"
Cohesion: 0.25
Nodes (8): download(), fs, http, https, images, main(), path, UPLOADS_DIR

### Community 13 - "Wishlist UI"
Cohesion: 0.33
Nodes (4): styles, WishList(), MyWishlistScreen(), styles

## Knowledge Gaps
- **169 isolated node(s):** `name`, `slug`, `version`, `orientation`, `icon` (+164 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **33 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `Expo Core Dependencies` to `Build and Test Tools`, `Auth and Session Storage`, `Babel Expo Preset`, `Date Utility Library`, `File System Library`, `Media Library Integration`, `Expo Metro Config`, `Status Bar Component`, `OTA Update Library`, `Icon Library`, `Timezone Utility Library`, `React Core`, `Logging Utility`, `React Web Support`, `React Native Core`, `Local Storage Library`, `Network Info Library`, `Dropdown UI Component`, `Gesture Handling Library`, `Image Picker Library`, `Network Alert Library`, `Progress Dialog UI`, `Safe Area Management`, `Screen Management Library`, `Searchable Dropdown UI`, `Step Indicator UI`, `React Native Web Support`, `Bottom Tab Navigation`, `Navigation Core`, `Stack Navigation`, `Redux React Bindings`, `Redux State Management`, `Redux Middleware`?**
  _High betweenness centrality (0.360) - this node is a cross-community bridge._
- **Why does `expo-secure-store` connect `Auth and Session Storage` to `Expo Core Dependencies`?**
  _High betweenness centrality (0.311) - this node is a cross-community bridge._
- **What connects `name`, `slug`, `version` to the rest of the system?**
  _169 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Reusable UI Components` be split into smaller, more focused modules?**
  _Cohesion score 0.056140350877192984 - nodes in this community are weakly interconnected._
- **Should `Home and Cart UI` be split into smaller, more focused modules?**
  _Cohesion score 0.06565656565656566 - nodes in this community are weakly interconnected._
- **Should `API Client Services` be split into smaller, more focused modules?**
  _Cohesion score 0.12312312312312312 - nodes in this community are weakly interconnected._
- **Should `Expo App Configuration` be split into smaller, more focused modules?**
  _Cohesion score 0.05555555555555555 - nodes in this community are weakly interconnected._