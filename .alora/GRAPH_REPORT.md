# Graph Report - /Users/hharis/tmp/alora-data/workspaces/bb74555a-b40e-42b5-8141-8224c3e79899/_setup/ecommerce-react-native-example  (2026-07-31)

## Corpus Check
- Corpus is ~26,889 words - fits in a single context window. You may not need a graph.

## Summary
- 447 nodes · 820 edges · 49 communities (15 shown, 34 thin omitted)
- Extraction: 95% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 36 edges (avg confidence: 0.86)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Community 0
- Community 1
- Community 2
- Community 3
- Community 4
- Community 5
- Community 6
- Community 7
- Community 8
- Community 9
- Community 10
- Community 11
- Community 12
- Community 13
- Community 14
- Community 15
- Community 16
- Community 17
- Community 18
- Community 19
- Community 20
- Community 21
- Community 22
- Community 23
- Community 24
- Community 25
- Community 26
- Community 27
- Community 28
- Community 29
- Community 30
- Community 31
- Community 32
- Community 33
- Community 34
- Community 35
- Community 36
- Community 37
- Community 38
- Community 39
- Community 40
- Community 41
- Community 42
- Community 43
- Community 44
- Community 45
- Community 46
- Community 47

## God Nodes (most connected - your core abstractions)
1. `colors` - 49 edges
2. `expo` - 17 edges
3. `CustomAlert()` - 17 edges
4. `get()` - 16 edges
5. `CustomInput()` - 15 edges
6. `post()` - 14 edges
7. `CustomButton()` - 14 edges
8. `network` - 13 edges
9. `q()` - 10 edges
10. `scripts` - 10 edges

## Surprising Connections (you probably didn't know these)
- `Platform-Adaptive Secure Storage Strategy` --semantically_similar_to--> `Platform-Aware Base-URL Resolver`  [INFERRED] [semantically similar]
  utils/authStorage.js → api/config.js
- `reducer()` --conceptually_related_to--> `checkout()`  [AMBIGUOUS]
  states/reducers/cartReducer.js → api/index.js
- `network` --implements--> `Platform-Aware Base-URL Resolver`  [INFERRED]
  constants/Network.js → api/config.js
- `Logout-on-Expiry Redirect` --conceptually_related_to--> `LoginScreen()`  [AMBIGUOUS]
  routes/navigationRef.js → screens/auth/LoginScreen.js
- `clearSession()` --implements--> `Logout-on-Expiry Redirect`  [INFERRED]
  utils/session.js → routes/navigationRef.js

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Authentication & Session Flow** — screens_auth_loginscreen_loginscreen, api_index_login, utils_session_setsession, api_client_request, utils_session_gettoken, routes_navigationref_resettologin [INFERRED 0.85]
- **Cart -> Checkout -> Order Flow** — screens_user_cartscreen_cartscreen, screens_user_checkoutscreen_checkoutscreen, states_reducers_cartreducer_reducer, api_index_checkout, states_actioncreaters_actioncreaters_emptycart [INFERRED 0.85]
- **Backend API Seam Operations** — api_client_request, api_index, api_index_getproducts, api_index_login, api_index_checkout, api_index_getcategories [INFERRED 0.90]
- **Admin Catalog & Order Management** — api_index_createproduct, api_index_updateproduct, api_index_deleteproduct, api_index_getdashboard, api_index_getadminorders, api_index_updateorderstatus, mock_server_server_adminmiddleware [INFERRED 0.80]
- **Platform-Adaptive Secure Storage** — utils_authstorage_getitem, utils_authstorage_setitem, utils_authstorage_deleteitem [INFERRED 0.90]

## Communities (49 total, 34 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.06
Nodes (48): BasicProductList(), styles, CategoryList(), styles, CustomAlert(), styles, CustomButton(), styles (+40 more)

### Community 1 - "Community 1"
Cohesion: 0.10
Nodes (38): get(), post(), request(), defaultHost(), forPlatform(), getBaseUrl(), imageUrl(), addToWishlist() (+30 more)

### Community 2 - "Community 2"
Cohesion: 0.08
Nodes (23): CartProductList(), styles, CustomIconButton(), styles, CategoryList(), styles, HomeHeader(), styles (+15 more)

### Community 3 - "Community 3"
Cohesion: 0.06
Nodes (35): backgroundColor, foregroundImage, adaptiveIcon, package, permissions, projectId, expo, android (+27 more)

### Community 4 - "Community 4"
Cohesion: 0.06
Nodes (34): @babel/core, @babel/plugin-proposal-export-namespace-from, eslint, eslint-config-expo, jest, jest-expo, devDependencies, @babel/core (+26 more)

### Community 5 - "Community 5"
Cohesion: 0.12
Nodes (13): ConnectionAlert(), CustomCard(), styles, OptionList(), styles, styles, UserProfileCard(), DashboardScreen() (+5 more)

### Community 6 - "Community 6"
Cohesion: 0.14
Nodes (16): checkout(), Redux Cart Store (Flux pattern), CartScreen(), CheckoutScreen(), decreaseCartItemQuantity(), emptyCart(), increaseCartItemQuantity(), removeCartItem() (+8 more)

### Community 7 - "Community 7"
Cohesion: 0.10
Nodes (20): cors, express, dependencies, cors, express, multer, uuid, description (+12 more)

### Community 8 - "Community 8"
Cohesion: 0.13
Nodes (15): dateFormat(), getTime(), OrderList(), styles, styles, Tab, Tabs(), styles (+7 more)

### Community 9 - "Community 9"
Cohesion: 0.15
Nodes (14): adminMiddleware(), authMiddleware(), categories, cors, express, multer, orders, path (+6 more)

### Community 10 - "Community 10"
Cohesion: 0.22
Nodes (12): plugins, Platform-Adaptive Secure Storage Strategy, Session & Token Ownership, expo-secure-store, deleteItem(), getItem(), setItem(), clearSession() (+4 more)

### Community 11 - "Community 11"
Cohesion: 0.22
Nodes (9): babel-preset-expo, expo-dev-client, dependencies, babel-preset-expo, expo-dev-client, @react-navigation/native, react-redux, @react-navigation/native (+1 more)

### Community 12 - "Community 12"
Cohesion: 0.25
Nodes (8): download(), fs, http, https, images, main(), path, UPLOADS_DIR

### Community 13 - "Community 13"
Cohesion: 0.33
Nodes (4): styles, WishList(), MyWishlistScreen(), styles

## Ambiguous Edges - Review These
- `checkout()` → `reducer()`  [AMBIGUOUS]
  states/reducers/cartReducer.js · relation: conceptually_related_to
- `LoginScreen()` → `Logout-on-Expiry Redirect`  [AMBIGUOUS]
  routes/navigationRef.js · relation: conceptually_related_to

## Knowledge Gaps
- **169 isolated node(s):** `name`, `slug`, `version`, `orientation`, `icon` (+164 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **34 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `checkout()` and `reducer()`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `LoginScreen()` and `Logout-on-Expiry Redirect`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **Why does `expo` connect `Community 3` to `Community 10`?**
  _High betweenness centrality (0.099) - this node is a cross-community bridge._
- **Why does `plugins` connect `Community 10` to `Community 3`?**
  _High betweenness centrality (0.096) - this node is a cross-community bridge._
- **What connects `name`, `slug`, `version` to the rest of the system?**
  _169 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.06330532212885154 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.10409745293466224 - nodes in this community are weakly interconnected._