#!/usr/bin/env python3
"""ALORA deep semantic pass over the code-only AST graph.

Adds design-pattern / protocol concepts that AST cannot see, confidence-scored
INFERRED / AMBIGUOUS edges, and hyperedges. Every edge/hyperedge endpoint is
validated against the AST node set (or the concept nodes added here) so no
orphan edges are emitted. All nodes carry code provenance (source_file is a
real code file; file_type in {code, concept}).
"""
import json
from pathlib import Path

AST = json.loads(Path(".alora/.graphify_ast.json").read_text(encoding="utf-8"))
ast_ids = {n["id"] for n in AST["nodes"]}


def node(nid, label, src, rationale=None):
    n = {
        "id": nid,
        "label": label,
        "file_type": "concept",
        "source_file": src,
        "source_location": None,
        "source_url": None,
        "captured_at": None,
        "author": None,
        "contributor": None,
        "_origin": "alora_semantic",
    }
    if rationale:
        n["rationale"] = rationale
    return n


# ---- Design-pattern / architectural concept nodes (human-readable labels) ----
concept_nodes = [
    node("pattern_backend_api_seam", "Backend API Seam (named REST operations)", "api/index.js",
         "Screens call named operations here instead of building fetch, so transport, auth, and URL concerns stay in one place."),
    node("pattern_token_auth_transport", "Token-Auth HTTP Transport", "api/client.js",
         "request() is the only code that attaches the x-auth-token header, parses JSON, and centralizes token-expiry handling."),
    node("pattern_base_url_resolver", "Platform-Aware Base-URL Resolver", "api/config.js",
         "getBaseUrl() is the single source of the backend URL; honours EXPO_PUBLIC_API_URL and rewrites localhost->10.0.2.2 on Android."),
    node("pattern_session_ownership", "Session & Token Ownership", "utils/session.js",
         "One module owns the authenticated user + JWT lifecycle; everything else asks it for identity instead of reading storage/route params."),
    node("pattern_platform_secure_storage", "Platform-Adaptive Secure Storage Strategy", "utils/authStorage.js",
         "Branches on Platform.OS: SecureStore on native, AsyncStorage on web, behind one key/value interface."),
    node("pattern_redux_cart_store", "Redux Cart Store (Flux pattern)", "states/store.js",
         "Client-only cart state: store + thunk action creators + cartReducer under the 'product' slice; there is no server-side cart."),
    node("pattern_role_based_access", "Role-Based Access Control (USER/ADMIN)", "utils/session.js",
         "userType discriminates customer vs admin; enforced client-side by isAdmin() and server-side by auth/admin middleware."),
    node("pattern_flat_rest_contract", "Flat REST Contract (shared by app & mock-server)", "api/index.js",
         "A flat {success, message, data|categories, err} envelope served identically by the Node backend and the Express mock-server."),
    node("pattern_expiry_redirect", "Logout-on-Expiry Redirect", "routes/navigationRef.js",
         "A navigation handle lets the API seam reset to the login route on 'jwt expired' without every screen owning expiry handling."),
]
concept_ids = {n["id"] for n in concept_nodes}
known = ast_ids | concept_ids


def edge(src, tgt, relation, confidence, score, source_file):
    return {
        "source": src, "target": tgt, "relation": relation,
        "confidence": confidence, "confidence_score": score,
        "source_file": source_file, "source_location": None, "weight": 1.0,
        "_origin": "alora_semantic",
    }


# symbol --implements--> concept  (INFERRED, design-pattern membership AST can't see)
impl = [
    ("api_index", "pattern_backend_api_seam", 0.95, "api/index.js"),
    ("api_client_request", "pattern_token_auth_transport", 0.95, "api/client.js"),
    ("api_client_get", "pattern_token_auth_transport", 0.85, "api/client.js"),
    ("api_client_post", "pattern_token_auth_transport", 0.85, "api/client.js"),
    ("api_config_getbaseurl", "pattern_base_url_resolver", 0.95, "api/config.js"),
    ("api_config_forplatform", "pattern_base_url_resolver", 0.85, "api/config.js"),
    ("api_config_defaulthost", "pattern_base_url_resolver", 0.85, "api/config.js"),
    ("constants_network_network", "pattern_base_url_resolver", 0.75, "constants/Network.js"),
    ("utils_session_getuser", "pattern_session_ownership", 0.95, "utils/session.js"),
    ("utils_session_gettoken", "pattern_session_ownership", 0.95, "utils/session.js"),
    ("utils_session_setsession", "pattern_session_ownership", 0.95, "utils/session.js"),
    ("utils_session_clearsession", "pattern_session_ownership", 0.95, "utils/session.js"),
    ("utils_session_isadmin", "pattern_role_based_access", 0.95, "utils/session.js"),
    ("mock_server_server_adminmiddleware", "pattern_role_based_access", 0.85, "mock-server/server.js"),
    ("mock_server_server_authmiddleware", "pattern_role_based_access", 0.85, "mock-server/server.js"),
    ("utils_authstorage_getitem", "pattern_platform_secure_storage", 0.95, "utils/authStorage.js"),
    ("utils_authstorage_setitem", "pattern_platform_secure_storage", 0.95, "utils/authStorage.js"),
    ("utils_authstorage_deleteitem", "pattern_platform_secure_storage", 0.95, "utils/authStorage.js"),
    ("states_store_store", "pattern_redux_cart_store", 0.95, "states/store.js"),
    ("states_reducers_cartreducer_reducer", "pattern_redux_cart_store", 0.95, "states/reducers/cartReducer.js"),
    ("states_actioncreaters_actioncreaters_addcartitem", "pattern_redux_cart_store", 0.85, "states/actionCreaters/actionCreaters.js"),
    ("states_actioncreaters_actioncreaters_removecartitem", "pattern_redux_cart_store", 0.85, "states/actionCreaters/actionCreaters.js"),
    ("states_actioncreaters_actioncreaters_increasecartitemquantity", "pattern_redux_cart_store", 0.85, "states/actionCreaters/actionCreaters.js"),
    ("states_actioncreaters_actioncreaters_decreasecartitemquantity", "pattern_redux_cart_store", 0.85, "states/actionCreaters/actionCreaters.js"),
    ("states_actioncreaters_actioncreaters_emptycart", "pattern_redux_cart_store", 0.85, "states/actionCreaters/actionCreaters.js"),
    ("api_client_request", "pattern_expiry_redirect", 0.85, "api/client.js"),
    ("routes_navigationref_resettologin", "pattern_expiry_redirect", 0.95, "routes/navigationRef.js"),
    ("utils_session_clearsession", "pattern_expiry_redirect", 0.75, "utils/session.js"),
    ("api_index", "pattern_flat_rest_contract", 0.85, "api/index.js"),
    ("mock_server_server_app", "pattern_flat_rest_contract", 0.85, "mock-server/server.js"),
]

# cross-cutting INFERRED protocol/latent-coupling edges (different modules/processes)
cross = [
    ("pattern_backend_api_seam", "pattern_flat_rest_contract", "conceptually_related_to", "INFERRED", 0.85, "api/index.js"),
    ("api_index", "mock_server_server_app", "shares_data_with", "INFERRED", 0.85, "api/index.js"),
    ("pattern_token_auth_transport", "pattern_session_ownership", "shares_data_with", "INFERRED", 0.95, "api/client.js"),
    ("pattern_platform_secure_storage", "pattern_base_url_resolver", "semantically_similar_to", "INFERRED", 0.75, "utils/authStorage.js"),
]

# AMBIGUOUS edges (uncertain latent couplings — flagged for review, not omitted)
ambiguous = [
    ("states_reducers_cartreducer_reducer", "api_index_checkout", "conceptually_related_to", "AMBIGUOUS", 0.3, "states/reducers/cartReducer.js"),
    ("pattern_expiry_redirect", "screens_auth_loginscreen_loginscreen", "conceptually_related_to", "AMBIGUOUS", 0.25, "routes/navigationRef.js"),
]

edges = []
for s, t, sc, sf in impl:
    edges.append(edge(s, t, "implements", "INFERRED", sc, sf))
for s, t, rel, conf, sc, sf in cross:
    edges.append(edge(s, t, rel, conf, sc, sf))
for s, t, rel, conf, sc, sf in ambiguous:
    edges.append(edge(s, t, rel, conf, sc, sf))

# ---- Hyperedges (3+ nodes participating in a shared flow/pattern) ----
def hyper(hid, label, nodes, relation, conf, score, sf):
    return {"id": hid, "label": label, "nodes": nodes, "relation": relation,
            "confidence": conf, "confidence_score": score, "source_file": sf,
            "_origin": "alora_semantic"}

hyperedges = [
    hyper("hyper_auth_session_flow", "Authentication & Session Flow",
          ["screens_auth_loginscreen_loginscreen", "api_index_login", "utils_session_setsession",
           "api_client_request", "utils_session_gettoken", "routes_navigationref_resettologin"],
          "participate_in", "INFERRED", 0.85, "api/client.js"),
    hyper("hyper_checkout_order_flow", "Cart -> Checkout -> Order Flow",
          ["screens_user_cartscreen_cartscreen", "screens_user_checkoutscreen_checkoutscreen",
           "states_reducers_cartreducer_reducer", "api_index_checkout",
           "states_actioncreaters_actioncreaters_emptycart"],
          "participate_in", "INFERRED", 0.85, "screens/user/CheckoutScreen.js"),
    hyper("hyper_backend_seam_ops", "Backend API Seam Operations",
          ["api_client_request", "api_index", "api_index_getproducts", "api_index_login",
           "api_index_checkout", "api_index_getcategories"],
          "implement", "INFERRED", 0.9, "api/index.js"),
    hyper("hyper_admin_management", "Admin Catalog & Order Management",
          ["api_index_createproduct", "api_index_updateproduct", "api_index_deleteproduct",
           "api_index_getdashboard", "api_index_getadminorders", "api_index_updateorderstatus",
           "mock_server_server_adminmiddleware"],
          "participate_in", "INFERRED", 0.8, "screens/admin/DashboardScreen.js"),
    hyper("hyper_platform_storage", "Platform-Adaptive Secure Storage",
          ["utils_authstorage_getitem", "utils_authstorage_setitem", "utils_authstorage_deleteitem"],
          "implement", "INFERRED", 0.9, "utils/authStorage.js"),
]

# ---- Validate every endpoint exists (no orphan edges/hyperedges) ----
problems = []
for e in edges:
    for end in (e["source"], e["target"]):
        if end not in known:
            problems.append(f"edge endpoint missing: {end}")
for h in hyperedges:
    for end in h["nodes"]:
        if end not in known:
            problems.append(f"hyperedge {h['id']} endpoint missing: {end}")
if problems:
    raise SystemExit("ORPHAN ENDPOINTS:\n" + "\n".join(sorted(set(problems))))

semantic = {
    "nodes": concept_nodes,
    "edges": edges,
    "hyperedges": hyperedges,
    "input_tokens": 0,
    "output_tokens": 0,
}
Path(".alora/.graphify_semantic.json").write_text(
    json.dumps(semantic, indent=2, ensure_ascii=False), encoding="utf-8")

from collections import Counter
print(f"semantic: {len(concept_nodes)} concept nodes, {len(edges)} edges, {len(hyperedges)} hyperedges")
print("edge confidence dist:", dict(Counter(e["confidence"] for e in edges)))
print("all endpoints validated against", len(known), "known ids")
