# Graph Report - /Users/hharis/tmp/alora-data/workspaces/33c06d58-8878-4621-aea2-9e28b4f15f57/_setup/ecommerce-react-native-example  (2026-08-04)

## Corpus Check
- Corpus is ~24,849 words - fits in a single context window. You may not need a graph.

## Summary
- 453 nodes · 861 edges · 49 communities (14 shown, 35 thin omitted)
- Extraction: 91% EXTRACTED · 9% INFERRED · 0% AMBIGUOUS · INFERRED: 78 edges (avg confidence: 0.91)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Navigation Routes
- Reusable UI Components
- API Transport
- Auth Session
- Testing Tooling
- Reusable UI Components
- Navigation Routes
- Mock Backend
- Cart Checkout
- Mock Backend
- API Transport
- Mock Backend
- Reusable UI Components
- Configuration Constants
- Configuration Constants
- Application Code
- Application Code
- Application Code
- Application Code
- Application Code
- Configuration Constants
- Application Code
- Application Code
- Application Code
- Application Code
- Application Code
- Application Code
- Application Code
- Application Code
- Application Code
- Application Code
- Application Code
- Application Code
- Application Code
- Application Code
- Application Code
- Application Code
- Application Code
- Application Code
- Navigation Routes
- Application Code
- Application Code
- Application Code
- Navigation Routes
- Navigation Routes
- Application Code
- Application Code
- Application Code

## God Nodes (most connected - your core abstractions)
1. `colors` - 49 edges
2. `React Navigation Stack Router` - 28 edges
3. `expo` - 17 edges
4. `CustomAlert()` - 17 edges
5. `get()` - 15 edges
6. `CustomInput()` - 15 edges
7. `CustomButton()` - 14 edges
8. `post()` - 13 edges
9. `network` - 12 edges
10. `Admin Management Console` - 12 edges

## Surprising Connections (you probably didn't know these)
- `request()` --shares_admin_auth_protocol--> `adminMiddleware()`  [AMBIGUOUS]
  api/client.js → mock-server/server.js
- `request()` --shares_x_auth_token_protocol--> `authMiddleware()`  [INFERRED]
  api/client.js → mock-server/server.js
- `LoginScreen()` --uses_api_operation--> `login()`  [INFERRED]
  screens/auth/LoginScreen.js → api/index.js
- `Cart State To Checkout Flow` --submits_order_via_api--> `checkout()`  [INFERRED]
  screens/user/CheckoutScreen.js → api/index.js
- `authMiddleware()` --validates_mock_auth_token--> `Secure Session Token Lifecycle`  [INFERRED]
  mock-server/server.js → utils/session.js

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Auth Session Navigation Flow** — screens_auth_splash_splash, concept_role_based_startup, utils_session_getuser, utils_session_setsession, utils_session_clearsession, api_client_request, routes_navigationref_resettologin, concept_token_expiry_redirect [INFERRED 0.90]
- **Cart To Order Flow** — screens_user_homescreen_homescreen, screens_user_productdetailscreen_productdetailscreen, states_actioncreaters_actioncreaters_addcartitem, states_actioncreaters_actioncreaters_emptycart, states_reducers_cartreducer_reducer, screens_user_checkoutscreen_checkoutscreen, api_index_checkout, concept_cart_checkout_flow [INFERRED 0.92]
- **API Facade Transport Contract** — concept_api_operation_facade, api_index, api_client_request, concept_authenticated_fetch_transport, concept_mock_api_contract, mock_server_server [INFERRED 0.88]
- **Admin CRUD Console** — screens_admin_dashboardscreen_dashboardscreen, concept_admin_console, api_index_getdashboard, api_index_getadminorders, api_index_getusers, api_index_createproduct, api_index_createcategory, mock_server_server_adminmiddleware [INFERRED 0.87]

## Communities (49 total, 35 thin omitted)

### Community 0 - "Navigation Routes"
Cohesion: 0.07
Nodes (49): BasicProductList(), styles, CategoryList(), styles, ConnectionAlert(), CustomAlert(), styles, CustomButton() (+41 more)

### Community 1 - "Reusable UI Components"
Cohesion: 0.06
Nodes (30): CartProductList(), styles, CustomIconButton(), styles, CategoryList(), styles, HomeHeader(), styles (+22 more)

### Community 2 - "API Transport"
Cohesion: 0.11
Nodes (38): get(), post(), request(), defaultHost(), forPlatform(), getBaseUrl(), imageUrl(), addToWishlist() (+30 more)

### Community 3 - "Auth Session"
Cohesion: 0.05
Nodes (37): backgroundColor, foregroundImage, adaptiveIcon, package, permissions, projectId, expo, android (+29 more)

### Community 4 - "Testing Tooling"
Cohesion: 0.06
Nodes (34): @babel/core, @babel/plugin-proposal-export-namespace-from, eslint, eslint-config-expo, jest, jest-expo, devDependencies, @babel/core (+26 more)

### Community 5 - "Reusable UI Components"
Cohesion: 0.09
Nodes (18): CustomCard(), styles, OptionList(), styles, styles, UserProfileCard(), Authenticated Fetch Transport, Secure Session Token Lifecycle (+10 more)

### Community 6 - "Navigation Routes"
Cohesion: 0.15
Nodes (18): dateFormat(), getTime(), OrderList(), styles, Bottom Tab Navigation Shell, React Navigation Stack Router, Role Based Startup Routing, styles (+10 more)

### Community 7 - "Mock Backend"
Cohesion: 0.10
Nodes (20): cors, express, dependencies, cors, express, multer, uuid, description (+12 more)

### Community 8 - "Cart Checkout"
Cohesion: 0.17
Nodes (11): App(), Redux Provider Store Boundary, Routes(), CART_ADD, CART_REMOVE, DECREASE_CART_ITEM_QUANTITY, EMPTY_CART, INCREASE_CART_ITEM_QUANTITY (+3 more)

### Community 9 - "Mock Backend"
Cohesion: 0.13
Nodes (15): Mock Express API Contract, adminMiddleware(), app, authMiddleware(), categories, cors, express, multer (+7 more)

### Community 10 - "API Transport"
Cohesion: 0.22
Nodes (9): babel-preset-expo, expo-dev-client, dependencies, babel-preset-expo, expo-dev-client, @react-navigation/native, react-redux, @react-navigation/native (+1 more)

### Community 11 - "Mock Backend"
Cohesion: 0.25
Nodes (8): download(), fs, http, https, images, main(), path, UPLOADS_DIR

### Community 12 - "Reusable UI Components"
Cohesion: 0.33
Nodes (4): styles, WishList(), MyWishlistScreen(), styles

## Ambiguous Edges - Review These
- `request()` → `adminMiddleware()`  [AMBIGUOUS]
  api/client.js · relation: shares_admin_auth_protocol
- `Tabs()` → `Splash()`  [AMBIGUOUS]
  screens/auth/Splash.js · relation: passes_authenticated_user_param

## Knowledge Gaps
- **173 isolated node(s):** `name`, `slug`, `version`, `orientation`, `icon` (+168 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **35 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `request()` and `adminMiddleware()`?**
  _Edge tagged AMBIGUOUS (relation: shares_admin_auth_protocol) - confidence is low._
- **What is the exact relationship between `Tabs()` and `Splash()`?**
  _Edge tagged AMBIGUOUS (relation: passes_authenticated_user_param) - confidence is low._
- **Are the 28 inferred relationships involving `React Navigation Stack Router` (e.g. with `Bottom Tab Navigation Shell` and `Tabs()`) actually correct?**
  _`React Navigation Stack Router` has 28 INFERRED edges - model-reasoned connections that need verification._
- **What connects `name`, `slug`, `version` to the rest of the system?**
  _173 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Navigation Routes` be split into smaller, more focused modules?**
  _Cohesion score 0.06526610644257703 - nodes in this community are weakly interconnected._
- **Should `Reusable UI Components` be split into smaller, more focused modules?**
  _Cohesion score 0.06376811594202898 - nodes in this community are weakly interconnected._
- **Should `API Transport` be split into smaller, more focused modules?**
  _Cohesion score 0.11295681063122924 - nodes in this community are weakly interconnected._