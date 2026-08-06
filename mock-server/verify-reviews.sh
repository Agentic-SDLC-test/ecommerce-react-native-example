#!/usr/bin/env bash
#
# Verifies the review contract end to end against a running mock-server.
#
#   cd mock-server && npm start        # terminal A
#   ./verify-reviews.sh                # terminal B
#
# Not wired into CI: it needs a live server, and Jest excludes /mock-server/.
# Run it against a freshly started server — the checks assert on the seeded
# aggregates, and they clean up everything they create.

set -u

BASE="${BASE:-http://localhost:3002}"
ADMIN="mock-admin-token-001"
USER1="mock-user-token-001"   # John Doe  — bought prod001, prod003, prod007
USER2="mock-user-token-002"   # Jane Smith — bought prod005 only

checks=0

# Print a pass line, or a fail line and exit non-zero on the first failure.
expect() {
  local label="$1" actual="$2" wanted="$3"
  checks=$((checks + 1))
  if [ "$actual" = "$wanted" ]; then
    printf 'PASS  %s\n' "$label"
  else
    printf 'FAIL  %s\n        expected: %s\n        actual:   %s\n' \
      "$label" "$wanted" "$actual"
    exit 1
  fi
}

# GET, printing only the HTTP status code.
status() {
  curl -s -o /dev/null -w '%{http_code}' "$@"
}

# Read one field out of the JSON on stdin, e.g. field data.count
field() {
  python3 -c "
import sys, json
node = json.load(sys.stdin)
for key in sys.argv[1].split('.'):
    node = node[key] if isinstance(node, dict) else node
print('null' if node is None else node)
" "$1"
}

# The aggregate for a product as 'average/count'.
aggregate() {
  curl -s "$BASE/reviews?productId=$1" | python3 -c '
import sys, json
d = json.load(sys.stdin)["data"]
average = "null" if d["average"] is None else d["average"]
print(str(average) + "/" + str(d["count"]))
'
}

printf '\nVerifying review endpoints at %s\n\n' "$BASE"

if ! curl -s -o /dev/null "$BASE/products"; then
  printf 'FAIL  mock-server is not reachable at %s — start it first.\n' "$BASE"
  exit 1
fi

# ─── Read path and seeded aggregates ─────────────────────────────────────────
expect "prod003 seeded aggregate excludes the hidden 1-star review" \
  "$(aggregate prod003)" "4/3"
expect "prod001 seeded aggregate is 4.3 over 3 ratings" \
  "$(aggregate prod001)" "4.3/3"
expect "prod005 seeded aggregate is 4.5 over 2 ratings" \
  "$(aggregate prod005)" "4.5/2"
expect "prod002 has no reviews and no zero score" \
  "$(aggregate prod002)" "null/0"
expect "missing productId is rejected" \
  "$(status "$BASE/reviews")" "400"
expect "unknown productId is not found" \
  "$(status "$BASE/reviews?productId=nope")" "404"

# ─── Visible reviews are newest-first, and never carry contact details ────────
expect "visible reviews come back newest first" \
  "$(curl -s "$BASE/reviews?productId=prod003" | python3 -c "
import sys, json
dates = [r['createdAt'] for r in json.load(sys.stdin)['data']['reviews']]
print('sorted' if dates == sorted(dates, reverse=True) else 'unsorted')")" \
  "sorted"
expect "public reviews carry no email address" \
  "$(curl -s "$BASE/reviews?productId=prod001" | grep -c 'email' || true)" "0"
expect "public reviews carry no order or address fields" \
  "$(curl -s "$BASE/reviews?productId=prod001" \
     | grep -cE 'shippingAddress|zipcode|orderId' || true)" "0"

# ─── Viewer context drives the gate, server-side ─────────────────────────────
expect "an anonymous viewer is reported as signed out" \
  "$(curl -s "$BASE/reviews?productId=prod003" | field data.viewer.isAuthenticated)" \
  "False"
expect "a purchaser is allowed to review" \
  "$(curl -s -H "x-auth-token: $USER1" "$BASE/reviews?productId=prod003" \
     | field data.viewer.canReview)" "True"
expect "a non-purchaser is not allowed to review" \
  "$(curl -s -H "x-auth-token: $USER2" "$BASE/reviews?productId=prod003" \
     | field data.viewer.canReview)" "False"
expect "an author's own review comes back for prefill" \
  "$(curl -s -H "x-auth-token: $USER1" "$BASE/reviews?productId=prod001" \
     | python3 -c "import sys,json;print(json.load(sys.stdin)['data']['viewer']['myReview']['_id'])")" \
  "rev001"

# ─── Write path: gate, validation, upsert ────────────────────────────────────
expect "a non-purchaser cannot submit a review" \
  "$(status -X POST "$BASE/review" -H "x-auth-token: $USER2" \
     -H 'Content-Type: application/json' \
     -d '{"productId":"prod003","rating":5}')" "403"

# Payloads are assembled in a variable first: escaped double quotes inside
# "$( ... )" get unescaped by the outer quotes, which would leave the JSON
# braces unquoted for bash to brace-expand.
for bad in 0 6 2.5 '"3"'; do
  bad_body='{"productId":"prod003","rating":'"$bad"'}'
  expect "rating $bad is rejected" \
    "$(status -X POST "$BASE/review" -H "x-auth-token: $USER1" \
       -H 'Content-Type: application/json' -d "$bad_body")" "400"
done

expect "a verified purchaser can submit a review" \
  "$(curl -s -X POST "$BASE/review" -H "x-auth-token: $USER1" \
     -H 'Content-Type: application/json' \
     -d '{"productId":"prod003","rating":4,"comment":"Good value."}' \
     | field message)" "Review submitted successfully"
expect "a second submission updates instead of duplicating" \
  "$(curl -s -X POST "$BASE/review" -H "x-auth-token: $USER1" \
     -H 'Content-Type: application/json' \
     -d '{"productId":"prod003","rating":5,"comment":"Better than I thought."}' \
     | field message)" "Review updated successfully"
# seeded 5, 4, 3 plus this script's 5 -> 17/4 = 4.25, rounded to 4.3
expect "the upsert left exactly one extra visible review" \
  "$(aggregate prod003)" "4.3/4"

LONG=$(python3 -c "print('x' * 700)")
LONG_BODY='{"productId":"prod003","rating":4,"comment":"'"$LONG"'"}'
expect "an over-long comment is truncated to the cap" \
  "$(curl -s -X POST "$BASE/review" -H "x-auth-token: $USER1" \
     -H 'Content-Type: application/json' -d "$LONG_BODY" \
     | python3 -c "import sys,json;print(len(json.load(sys.stdin)['data']['comment']))")" \
  "500"
expect "markup and control characters round-trip as literal text" \
  "$(curl -s -X POST "$BASE/review" -H "x-auth-token: $USER1" \
     -H 'Content-Type: application/json' \
     -d '{"productId":"prod003","rating":4,"comment":"a\nb\t<b>bold</b> & <script>x</script>"}' \
     | python3 -c "import sys,json;print(json.load(sys.stdin)['data']['comment'])")" \
  "a b <b>bold</b> & <script>x</script>"
expect "the server ignores a spoofed user in the body" \
  "$(curl -s -X POST "$BASE/review" -H "x-auth-token: $USER1" \
     -H 'Content-Type: application/json' \
     -d '{"productId":"prod003","rating":4,"user":{"_id":"admin001","name":"Spoofed"},"verifiedPurchase":false}' \
     | python3 -c "import sys,json;print(json.load(sys.stdin)['data']['user']['name'])")" \
  "John Doe"

# Pin this script's own review to a known rating so the moderation arithmetic
# below does not depend on which write check ran last.
curl -s -o /dev/null -X POST "$BASE/review" -H "x-auth-token: $USER1" \
  -H 'Content-Type: application/json' \
  -d '{"productId":"prod003","rating":5,"comment":"Pinned for the moderation checks."}'
expect "prod003 averages the seeded 5, 4, 3 plus this script's 5" \
  "$(aggregate prod003)" "4.3/4"

MY_REVIEW=$(curl -s -H "x-auth-token: $USER1" "$BASE/reviews?productId=prod003" \
  | python3 -c "import sys,json;print(json.load(sys.stdin)['data']['viewer']['myReview']['_id'])")

# ─── Admin list and privacy ──────────────────────────────────────────────────
expect "the admin list needs a token" \
  "$(status "$BASE/admin/reviews")" "401"
expect "the admin list rejects a shopper token" \
  "$(status -H "x-auth-token: $USER1" "$BASE/admin/reviews")" "403"
expect "the admin list includes the hidden review" \
  "$(curl -s -H "x-auth-token: $ADMIN" "$BASE/admin/reviews" \
     | python3 -c "
import sys, json
d = json.load(sys.stdin)['data']
print('yes' if any(r['_id'] == 'rev007' and not r['isVisible'] for r in d) else 'no')")" \
  "yes"
expect "every admin row carries visibility and a product title" \
  "$(curl -s -H "x-auth-token: $ADMIN" "$BASE/admin/reviews" \
     | python3 -c "
import sys, json
d = json.load(sys.stdin)['data']
ok = all('isVisible' in r and r.get('product', {}).get('title') for r in d)
print('yes' if ok else 'no')")" \
  "yes"
expect "the admin list carries no email address" \
  "$(curl -s -H "x-auth-token: $ADMIN" "$BASE/admin/reviews" | grep -c 'email' || true)" "0"

# ─── Moderation: hide, aggregate re-check, unhide ────────────────────────────
expect "hiding a review is confirmed" \
  "$(curl -s -H "x-auth-token: $ADMIN" \
     "$BASE/admin/review-visibility?reviewId=rev004&visible=false" | field message)" \
  "Review hidden"
expect "the hidden review drops out of the average and the count" \
  "$(aggregate prod003)" "4/3"
expect "unhiding a review is confirmed" \
  "$(curl -s -H "x-auth-token: $ADMIN" \
     "$BASE/admin/review-visibility?reviewId=rev004&visible=true" | field message)" \
  "Review shown"
expect "unhiding restores the average and the count" \
  "$(aggregate prod003)" "4.3/4"
expect "a non-boolean visibility value is rejected" \
  "$(status -H "x-auth-token: $ADMIN" \
     "$BASE/admin/review-visibility?reviewId=rev004&visible=maybe")" "400"
expect "an unknown review id is not found" \
  "$(status -H "x-auth-token: $ADMIN" \
     "$BASE/admin/review-visibility?reviewId=nope&visible=true")" "404"

# ─── An author's edit must never un-hide their review ────────────────────────
curl -s -o /dev/null -H "x-auth-token: $ADMIN" \
  "$BASE/admin/review-visibility?reviewId=$MY_REVIEW&visible=false"
curl -s -o /dev/null -X POST "$BASE/review" -H "x-auth-token: $USER1" \
  -H 'Content-Type: application/json' \
  -d '{"productId":"prod003","rating":1,"comment":"Trying to sneak back."}'
expect "updating a hidden review leaves it hidden" \
  "$(curl -s -H "x-auth-token: $USER1" "$BASE/reviews?productId=prod003" \
     | python3 -c "import sys,json;print(json.load(sys.stdin)['data']['viewer']['myReview']['isVisible'])")" \
  "False"
expect "a hidden review stays out of the aggregate after its author edits it" \
  "$(aggregate prod003)" "4/3"
curl -s -o /dev/null -H "x-auth-token: $ADMIN" \
  "$BASE/admin/review-visibility?reviewId=$MY_REVIEW&visible=true"

# ─── Author deletion, and cleanup of what this script created ────────────────
expect "another shopper cannot delete someone else's review" \
  "$(status -H "x-auth-token: $USER2" "$BASE/delete-review?id=$MY_REVIEW")" "403"
expect "the author can remove their own review" \
  "$(curl -s -H "x-auth-token: $USER1" "$BASE/delete-review?id=$MY_REVIEW" | field message)" \
  "Review removed successfully"
expect "a replayed delete is not found" \
  "$(status -H "x-auth-token: $USER1" "$BASE/delete-review?id=$MY_REVIEW")" "404"
expect "the seeded aggregate is restored after cleanup" \
  "$(aggregate prod003)" "4/3"

# ─── Dashboard counter ───────────────────────────────────────────────────────
expect "the dashboard reports a review count" \
  "$(curl -s -H "x-auth-token: $ADMIN" "$BASE/dashboard" | field data.reviewsCount)" "10"

printf '\nAll %s checks passed.\n\n' "$checks"
