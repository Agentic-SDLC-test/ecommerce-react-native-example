# Graph Report - .  (2026-08-05)

## Corpus Check
- Corpus is ~25,226 words - fits in a single context window. You may not need a graph.

## Summary
- 481 nodes · 911 edges · 51 communities (14 shown, 37 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 32 edges (avg confidence: 0.87)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Authentication Screens
- Redux Cart Actions
- API Transport Layer
- Checkout and Payments
- Expo App Config
- Mobile Dependencies
- Admin Order Controls
- Redux Cart State
- Mock Server Dependencies
- Session Persistence
- Shared UI Components
- Mobile Dependencies
- Mock Image Loader
- Lint Configuration
- Metro Configuration
- Mobile Dependencies
- Mobile Dependencies
- Mobile Dependencies
- Mobile Dependencies
- Mobile Dependencies
- Mobile Dependencies
- Mobile Dependencies
- Mobile Dependencies
- Mobile Dependencies
- Mobile Dependencies
- Mobile Dependencies
- Mobile Dependencies
- Mobile Dependencies
- Mobile Dependencies
- Mobile Dependencies
- Mobile Dependencies
- Mobile Dependencies
- Mobile Dependencies
- Mobile Dependencies
- Mobile Dependencies
- Mobile Dependencies
- Mobile Dependencies
- Mobile Dependencies
- Mobile Dependencies
- Mobile Dependencies
- Mobile Dependencies
- Mobile Dependencies
- Mobile Dependencies
- Mobile Dependencies
- Mobile Dependencies
- Mobile Dependencies
- Mobile Dependencies
- Mobile Dependencies
- Mobile Dependencies
- Mobile Dependencies

## God Nodes (most connected - your core abstractions)
1. `colors` - 49 edges
2. `CustomAlert()` - 18 edges
3. `expo` - 17 edges
4. `get()` - 15 edges
5. `CustomInput()` - 15 edges
6. `CustomButton()` - 14 edges
7. `post()` - 13 edges
8. `CheckoutScreen()` - 13 edges
9. `getPaymentTypeLabel()` - 12 edges
10. `network` - 11 edges

## Surprising Connections (you probably didn't know these)
- `derivePaymentFields()` --implements--> `Feature-Flagged Payment Strategy`  [INFERRED]
  mock-server/orderPayment.js → utils/payment.js
- `CheckoutScreen()` --shares_data_with--> `Cart State Store`  [INFERRED]
  screens/user/CheckoutScreen.js → states/reducers/cartReducer.js
- `CheckoutScreen()` --calls--> `emptyCart()`  [EXTRACTED]
  screens/user/CheckoutScreen.js → states/actionCreaters/actionCreaters.js
- `request()` --calls--> `getToken()`  [EXTRACTED]
  api/client.js → utils/session.js
- `LoginScreen()` --calls--> `login()`  [EXTRACTED]
  screens/auth/LoginScreen.js → api/index.js

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Authentication Session Flow** — screens_auth_splash_splash, screens_auth_loginscreen_loginscreen, utils_session_getuser, utils_session_setsession, api_client_request, routes_navigationref_resettologin [INFERRED 0.95]
- **Checkout Order Pipeline** — screens_user_checkoutscreen_checkoutscreen, utils_checkout_buildcheckoutpayload, api_index_checkout, api_client_post, mock_server_server_post_checkout_handler, mock_server_orderpayment_derivepaymentfields, utils_payment_ismockwalletpaymentenabled [INFERRED 0.95]
- **Admin Order Operations** — screens_admin_dashboardscreen_dashboardscreen, screens_admin_viewordersscreen_viewordersscreen, screens_admin_vieworderdetailscreen_vieworderdetailscreen, api_index_getdashboard, api_index_getadminorders, api_index_updateorderstatus, mock_server_server_adminmiddleware, mock_server_server_get_admin_orders_handler [INFERRED 0.85]

## Communities (51 total, 37 thin omitted)

### Community 0 - "Authentication Screens"
Cohesion: 0.07
Nodes (45): CategoryList(), styles, ConnectionAlert(), CustomAlert(), styles, CustomButton(), styles, CustomCard() (+37 more)

### Community 1 - "Redux Cart Actions"
Cohesion: 0.06
Nodes (32): CartProductList(), styles, CustomIconButton(), styles, CategoryList(), styles, HomeHeader(), styles (+24 more)

### Community 2 - "API Transport Layer"
Cohesion: 0.12
Nodes (34): get(), post(), request(), defaultHost(), forPlatform(), getBaseUrl(), imageUrl(), addToWishlist() (+26 more)

### Community 3 - "Checkout and Payments"
Cohesion: 0.12
Nodes (27): Checkout Pipeline, Feature-Flagged Payment Strategy, BasicProductList(), styles, dateFormat(), getTime(), OrderList(), styles (+19 more)

### Community 4 - "Expo App Config"
Cohesion: 0.06
Nodes (35): backgroundColor, foregroundImage, adaptiveIcon, package, permissions, projectId, expo, android (+27 more)

### Community 5 - "Mobile Dependencies"
Cohesion: 0.06
Nodes (34): @babel/core, @babel/plugin-proposal-export-namespace-from, eslint, eslint-config-expo, jest, jest-expo, devDependencies, @babel/core (+26 more)

### Community 6 - "Admin Order Controls"
Cohesion: 0.09
Nodes (25): Admin Control Plane, Mock Order Contract, createValidationError(), derivePaymentFields(), serializeOrder(), VALID_PAYMENT_TYPES, adminMiddleware(), app (+17 more)

### Community 7 - "Redux Cart State"
Cohesion: 0.10
Nodes (20): App(), Cart State Store, Catalog Browsing Flow, Mobile App Shell, Route Orchestration, Routes(), styles, Tab (+12 more)

### Community 8 - "Mock Server Dependencies"
Cohesion: 0.10
Nodes (20): dependencies, cors, express, multer, uuid, description, devDependencies, nodemon (+12 more)

### Community 9 - "Session Persistence"
Cohesion: 0.15
Nodes (9): plugins, Session Authentication Flow, expo-secure-store, LoginScreen(), Splash(), getToken(), getUser(), isAdmin() (+1 more)

### Community 10 - "Shared UI Components"
Cohesion: 0.20
Nodes (8): OptionList(), styles, styles, UserProfileCard(), MyAccountScreen(), styles, styles, UserProfileScreen()

### Community 11 - "Mobile Dependencies"
Cohesion: 0.18
Nodes (11): babel-preset-expo, @expo/metro-config, expo-updates, dependencies, babel-preset-expo, @expo/metro-config, expo-updates, react-color-log (+3 more)

### Community 12 - "Mock Image Loader"
Cohesion: 0.25
Nodes (8): download(), fs, http, https, images, main(), path, UPLOADS_DIR

## Ambiguous Edges - Review These
- `MyWishlistScreen()` → `CartScreen()`  [AMBIGUOUS]
  screens/profile/MyWishlistScreen.js · relation: conceptually_related_to

## Knowledge Gaps
- **182 isolated node(s):** `{
  derivePaymentFields,
  serializeOrder,
}`, `name`, `slug`, `version`, `orientation` (+177 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **37 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `MyWishlistScreen()` and `CartScreen()`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **Why does `expo` connect `Expo App Config` to `Session Persistence`?**
  _High betweenness centrality (0.094) - this node is a cross-community bridge._
- **Why does `plugins` connect `Session Persistence` to `Expo App Config`?**
  _High betweenness centrality (0.091) - this node is a cross-community bridge._
- **What connects `{
  derivePaymentFields,
  serializeOrder,
}`, `name`, `slug` to the rest of the system?**
  _182 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Authentication Screens` be split into smaller, more focused modules?**
  _Cohesion score 0.06677215189873417 - nodes in this community are weakly interconnected._
- **Should `Redux Cart Actions` be split into smaller, more focused modules?**
  _Cohesion score 0.05725490196078432 - nodes in this community are weakly interconnected._
- **Should `API Transport Layer` be split into smaller, more focused modules?**
  _Cohesion score 0.11740890688259109 - nodes in this community are weakly interconnected._