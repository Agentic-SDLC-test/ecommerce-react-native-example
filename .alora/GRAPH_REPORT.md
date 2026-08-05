# Graph Report - /Users/hharis/tmp/alora-data/workspaces/a374b97e-307a-47a0-a095-21488e3f56c7/_setup/ecommerce-react-native-example  (2026-08-05)

## Corpus Check
- Corpus is ~24,781 words - fits in a single context window. You may not need a graph.

## Summary
- 459 nodes · 853 edges · 49 communities (15 shown, 34 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 24 edges (avg confidence: 0.9)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Shared UI Components
- Navigation And Orders
- Expo App Config
- API Session Transport
- Tooling Dependencies
- Backend API Facade
- Home UI Components
- Common Cards And Alerts
- Mock Server Package
- App Redux Shell
- Mock Backend Contract
- Core App Dependencies
- Image Download Utility
- Cart Checkout Flow
- ESLint Configuration
- Metro Configuration
- Date Formatting Library
- Expo Runtime Library
- Expo File System
- Expo Image Picker
- Expo Media Library
- Expo Metro Package
- Secure Store Package
- Expo Status Bar
- Expo Updates
- Expo Vector Icons
- Moment Library
- Moment Timezone
- React Library
- React Color Log
- React DOM Package
- React Native Package
- Async Storage Package
- NetInfo Package
- Dropdown Picker Package
- Gesture Handler Package
- Image Picker Package
- Connection Alert Package
- Progress Dialog Package
- Safe Area Package
- Native Screens Package
- Searchable Dropdown Package
- Step Indicator Package
- React Native Web
- Bottom Tabs Package
- Native Stack Package
- Redux Package
- Redux Thunk Package

## God Nodes (most connected - your core abstractions)
1. `colors` - 49 edges
2. `expo` - 17 edges
3. `CustomAlert()` - 17 edges
4. `get()` - 16 edges
5. `CustomInput()` - 15 edges
6. `post()` - 14 edges
7. `CustomButton()` - 14 edges
8. `network` - 13 edges
9. `getBaseUrl()` - 10 edges
10. `q()` - 10 edges

## Surprising Connections (you probably didn't know these)
- `updateOrderStatus()` --conceptually_related_to--> `MyOrderDetailScreen()`  [AMBIGUOUS]
  api/index.js → screens/user/MyOrderDetailScreen.js
- `network` --conceptually_related_to--> `Platform Base URL Resolver`  [AMBIGUOUS]
  constants/Network.js → api/config.js
- `Mock Backend Contract` --conceptually_related_to--> `Backend API Facade`  [INFERRED]
  mock-server/server.js → api/index.js
- `Login Session Flow` --references--> `login()`  [EXTRACTED]
  screens/auth/LoginScreen.js → api/index.js
- `Product Discovery Flow` --references--> `getProducts()`  [EXTRACTED]
  screens/user/HomeScreen.js → api/index.js

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Auth Session Lifecycle Flow** — screens_auth_splash_auth_gate, screens_auth_loginscreen_login_session_flow, utils_session_session_lifecycle, utils_authstorage_platform_storage_adapter, api_client_token_expiry_redirect_protocol, routes_navigationref_resettologin [INFERRED 0.95]
- **Cart Checkout State Flow** — screens_user_homescreen_product_discovery_flow, screens_user_productdetailscreen_cart_wishlist_flow, screens_user_cartscreen_cart_mutation_flow, screens_user_checkoutscreen_checkout_order_flow, states_actioncreaters_actioncreaters_cart_command_api, states_reducers_cartreducer_cart_state_machine, api_index_checkout [INFERRED 0.95]
- **Admin Catalog Order Management Flow** — screens_admin_dashboardscreen_admin_workflow_hub, screens_admin_addproductscreen_addproductscreen, screens_admin_editproductscreen_editproductscreen, screens_admin_viewproductscreen_viewproductscreen, screens_admin_viewcategoryscreen_viewcategoryscreen, screens_admin_vieworderdetailscreen_vieworderdetailscreen, api_index_backend_api_facade, mock_server_server_admin_authorization_protocol [INFERRED 0.85]
- **Frontend Mock Backend Contract** — api_index_backend_api_facade, api_client_authenticated_request_pipeline, api_config_platform_base_url_resolver, mock_server_server_mock_backend_contract, mock_server_server_in_memory_domain_store [INFERRED 0.95]

## Communities (49 total, 34 thin omitted)

### Community 0 - "Shared UI Components"
Cohesion: 0.07
Nodes (38): BasicProductList(), styles, CartProductList(), styles, CategoryList(), styles, CustomAlert(), styles (+30 more)

### Community 1 - "Navigation And Orders"
Cohesion: 0.07
Nodes (33): dateFormat(), getTime(), OrderList(), styles, Stack, Customer Tab Shell, styles, Tab (+25 more)

### Community 2 - "Expo App Config"
Cohesion: 0.06
Nodes (35): backgroundColor, foregroundImage, adaptiveIcon, package, permissions, projectId, expo, android (+27 more)

### Community 3 - "API Session Transport"
Cohesion: 0.09
Nodes (28): Authenticated Request Pipeline, request(), Token Expiry Redirect Protocol, defaultHost(), forPlatform(), getBaseUrl(), imageUrl(), Platform Base URL Resolver (+20 more)

### Community 4 - "Tooling Dependencies"
Cohesion: 0.06
Nodes (34): @babel/core, @babel/plugin-proposal-export-namespace-from, eslint, eslint-config-expo, jest, jest-expo, devDependencies, @babel/core (+26 more)

### Community 5 - "Backend API Facade"
Cohesion: 0.16
Nodes (28): get(), post(), addToWishlist(), Backend API Facade, checkout(), createCategory(), createProduct(), deleteCategory() (+20 more)

### Community 6 - "Home UI Components"
Cohesion: 0.09
Nodes (18): CustomIconButton(), styles, CategoryList(), styles, HomeHeader(), styles, NewArrivals(), styles (+10 more)

### Community 7 - "Common Cards And Alerts"
Cohesion: 0.12
Nodes (13): ConnectionAlert(), CustomCard(), styles, OptionList(), styles, styles, UserProfileCard(), Admin Workflow Hub (+5 more)

### Community 8 - "Mock Server Package"
Cohesion: 0.10
Nodes (20): cors, express, dependencies, cors, express, multer, uuid, description (+12 more)

### Community 9 - "App Redux Shell"
Cohesion: 0.14
Nodes (14): App(), Application Shell Provider, Routes(), Stack Navigation Registry, Cart Command API, CART_ADD, CART_REMOVE, DECREASE_CART_ITEM_QUANTITY (+6 more)

### Community 10 - "Mock Backend Contract"
Cohesion: 0.14
Nodes (16): Admin Authorization Protocol, adminMiddleware(), app, categories, cors, express, In Memory Domain Store, Mock Backend Contract (+8 more)

### Community 11 - "Core App Dependencies"
Cohesion: 0.22
Nodes (9): babel-preset-expo, expo-dev-client, dependencies, babel-preset-expo, expo-dev-client, @react-navigation/native, react-redux, @react-navigation/native (+1 more)

### Community 12 - "Image Download Utility"
Cohesion: 0.25
Nodes (8): download(), fs, http, https, images, main(), path, UPLOADS_DIR

### Community 13 - "Cart Checkout Flow"
Cohesion: 0.39
Nodes (8): Cart Mutation Flow, CartScreen(), Checkout Order Flow, CheckoutScreen(), decreaseCartItemQuantity(), emptyCart(), increaseCartItemQuantity(), removeCartItem()

## Ambiguous Edges - Review These
- `updateOrderStatus()` → `MyOrderDetailScreen()`  [AMBIGUOUS]
  api/index.js · relation: conceptually_related_to
- `network` → `Platform Base URL Resolver`  [AMBIGUOUS]
  constants/Network.js · relation: conceptually_related_to

## Knowledge Gaps
- **167 isolated node(s):** `name`, `slug`, `version`, `orientation`, `icon` (+162 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **34 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `updateOrderStatus()` and `MyOrderDetailScreen()`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `network` and `Platform Base URL Resolver`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **Why does `expo` connect `Expo App Config` to `API Session Transport`?**
  _High betweenness centrality (0.098) - this node is a cross-community bridge._
- **Why does `plugins` connect `API Session Transport` to `Expo App Config`?**
  _High betweenness centrality (0.095) - this node is a cross-community bridge._
- **What connects `name`, `slug`, `version` to the rest of the system?**
  _167 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Shared UI Components` be split into smaller, more focused modules?**
  _Cohesion score 0.07074504442925496 - nodes in this community are weakly interconnected._
- **Should `Navigation And Orders` be split into smaller, more focused modules?**
  _Cohesion score 0.07307692307692308 - nodes in this community are weakly interconnected._