const { test, before, after, describe } = require("node:test");
const assert = require("node:assert/strict");

const app = require("../server");

const ADMIN_TOKEN = "mock-admin-token-001";
const JOHN_TOKEN = "mock-user-token-001";
const JANE_TOKEN = "mock-user-token-002";

let server;
let baseUrl;

before(async () => {
  await new Promise((resolve) => {
    server = app.listen(0, "127.0.0.1", resolve);
  });
  const { port } = server.address();
  baseUrl = `http://127.0.0.1:${port}`;
});

after(async () => {
  await new Promise((resolve) => server.close(resolve));
});

function url(path) {
  return `${baseUrl}${path}`;
}

function withAuth(token, init = {}) {
  return {
    ...init,
    headers: { ...(init.headers || {}), "x-auth-token": token },
  };
}

// These tests mutate the mock server's shared in-memory `reviews` array, so
// they are written to run in this exact sequence (newest-first ordering and
// AC-2's duplicate-review rule both depend on prior steps in this file).
describe("verified purchaser ratings and reviews", () => {
  test("public GET /product-reviews reflects seeded visible reviews", async () => {
    const res = await fetch(url("/product-reviews?productId=prod007"));
    const body = await res.json();
    assert.equal(res.status, 200);
    assert.equal(body.data.summary.count, 1);
    assert.equal(body.data.summary.average, 4);
    assert.equal(body.data.reviews.length, 1);
    assert.equal(body.data.reviews[0].reviewer.name, "Jane Smith");
    assert.equal("email" in body.data.reviews[0].reviewer, false);
  });

  test("a rating-only review counts toward the summary but is not listed", async () => {
    const res = await fetch(url("/product-reviews?productId=prod001"));
    const body = await res.json();
    assert.equal(body.data.summary.count, 1);
    assert.equal(body.data.writtenCount, 0);
    assert.equal(body.data.reviews.length, 0);
  });

  test("a hidden review is excluded from the public summary", async () => {
    const res = await fetch(url("/product-reviews?productId=prod003"));
    const body = await res.json();
    assert.equal(body.data.summary.count, 0);
    assert.equal(body.data.summary.average, null);
  });

  test("GET /my-review reports eligible, not_delivered and not_purchased for John", async () => {
    const eligible = await fetch(
      url("/my-review?productId=prod007"),
      withAuth(JOHN_TOKEN)
    ).then((r) => r.json());
    assert.equal(eligible.data.eligibility, "eligible");
    assert.equal(eligible.data.review, null);

    const notDelivered = await fetch(
      url("/my-review?productId=prod001"),
      withAuth(JOHN_TOKEN)
    ).then((r) => r.json());
    assert.equal(notDelivered.data.eligibility, "not_delivered");

    const notPurchased = await fetch(
      url("/my-review?productId=prod002"),
      withAuth(JOHN_TOKEN)
    ).then((r) => r.json());
    assert.equal(notPurchased.data.eligibility, "not_purchased");
  });

  test("GET /my-review without a token is unauthorized", async () => {
    const res = await fetch(url("/my-review?productId=prod007"));
    assert.equal(res.status, 401);
  });

  test("POST /review rejects an ineligible submission and invalid input", async () => {
    const notDelivered = await fetch(
      url("/review"),
      withAuth(JOHN_TOKEN, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: "prod001", rating: 5 }),
      })
    );
    assert.equal(notDelivered.status, 403);

    const notPurchased = await fetch(
      url("/review"),
      withAuth(JOHN_TOKEN, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: "prod002", rating: 5 }),
      })
    );
    assert.equal(notPurchased.status, 403);

    const missingRating = await fetch(
      url("/review"),
      withAuth(JOHN_TOKEN, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: "prod007" }),
      })
    );
    assert.equal(missingRating.status, 400);

    const tooLong = await fetch(
      url("/review"),
      withAuth(JOHN_TOKEN, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: "prod007",
          rating: 5,
          text: "a".repeat(501),
        }),
      })
    );
    assert.equal(tooLong.status, 400);
  });

  test("POST /review accepts a rating-only submission and ignores an injected hidden flag", async () => {
    const res = await fetch(
      url("/review"),
      withAuth(JOHN_TOKEN, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: "prod007", rating: 5, hidden: true }),
      })
    );
    const body = await res.json();
    assert.equal(res.status, 201);
    assert.equal(body.data.rating, 5);
    assert.equal(body.data.hidden, false);
  });

  test("a second POST /review for the same product is rejected as a duplicate", async () => {
    const res = await fetch(
      url("/review"),
      withAuth(JOHN_TOKEN, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: "prod007", rating: 3 }),
      })
    );
    assert.equal(res.status, 409);
  });

  test("the summary for prod007 now reflects both John's and Jane's reviews", async () => {
    const res = await fetch(url("/product-reviews?productId=prod007"));
    const body = await res.json();
    assert.equal(body.data.summary.count, 2);
    assert.equal(body.data.summary.average, 4.5);
  });

  test("POST /update-review marks the review Edited and another user's update 404s", async () => {
    const mine = await fetch(
      url("/my-review?productId=prod007"),
      withAuth(JOHN_TOKEN)
    ).then((r) => r.json());
    const reviewId = mine.data.review._id;

    const update = await fetch(
      url(`/update-review?id=${reviewId}`),
      withAuth(JOHN_TOKEN, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating: 5, text: "Updated: still great rice." }),
      })
    );
    const updated = await update.json();
    assert.equal(update.status, 200);
    assert.equal(updated.data.edited, true);

    const list = await fetch(url("/product-reviews?productId=prod007")).then(
      (r) => r.json()
    );
    assert.equal(list.data.reviews[0]._id, reviewId);

    const foreign = await fetch(
      url(`/update-review?id=${reviewId}`),
      withAuth(JANE_TOKEN, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating: 1 }),
      })
    );
    assert.equal(foreign.status, 404);
  });

  test("admin hide and unhide immediately change the public summary", async () => {
    const mine = await fetch(
      url("/my-review?productId=prod007"),
      withAuth(JOHN_TOKEN)
    ).then((r) => r.json());
    const reviewId = mine.data.review._id;

    const forbidden = await fetch(
      url(`/admin/review-visibility?id=${reviewId}&hidden=true`),
      withAuth(JOHN_TOKEN, { method: "POST" })
    );
    assert.equal(forbidden.status, 403);

    const hide = await fetch(
      url(`/admin/review-visibility?id=${reviewId}&hidden=true`),
      withAuth(ADMIN_TOKEN, { method: "POST" })
    );
    assert.equal(hide.status, 200);

    const hiddenSummary = await fetch(
      url("/product-reviews?productId=prod007")
    ).then((r) => r.json());
    assert.equal(hiddenSummary.data.summary.count, 1);

    const authorView = await fetch(
      url("/my-review?productId=prod007"),
      withAuth(JOHN_TOKEN)
    ).then((r) => r.json());
    assert.equal(authorView.data.review.hidden, true);

    const unhide = await fetch(
      url(`/admin/review-visibility?id=${reviewId}&hidden=false`),
      withAuth(ADMIN_TOKEN, { method: "POST" })
    );
    assert.equal(unhide.status, 200);

    const restoredSummary = await fetch(
      url("/product-reviews?productId=prod007")
    ).then((r) => r.json());
    assert.equal(restoredSummary.data.summary.count, 2);
  });

  test("GET /admin/reviews lists by visibility and rejects an invalid filter", async () => {
    const invalid = await fetch(
      url("/admin/reviews?visibility=bogus"),
      withAuth(ADMIN_TOKEN)
    );
    assert.equal(invalid.status, 400);

    const hidden = await fetch(
      url("/admin/reviews?visibility=hidden"),
      withAuth(ADMIN_TOKEN)
    ).then((r) => r.json());
    assert.ok(hidden.data.reviews.every((r) => r.hidden === true));
    assert.ok(hidden.data.reviews.some((r) => r._id === "rev003"));
  });

  test("POST /admin/delete-review permanently removes a review", async () => {
    const del = await fetch(
      url("/admin/delete-review?id=rev003"),
      withAuth(ADMIN_TOKEN, { method: "POST" })
    );
    assert.equal(del.status, 200);

    const repeat = await fetch(
      url("/admin/delete-review?id=rev003"),
      withAuth(ADMIN_TOKEN, { method: "POST" })
    );
    assert.equal(repeat.status, 404);
  });

  test("deleting a product cascades to its reviews", async () => {
    const before2 = await fetch(
      url("/admin/reviews?visibility=all"),
      withAuth(ADMIN_TOKEN)
    ).then((r) => r.json());
    const countBefore = before2.data.reviews.filter(
      (r) => r.product._id === "prod007"
    ).length;
    assert.ok(countBefore > 0);

    const del = await fetch(url("/delete-product?id=prod007"), withAuth(ADMIN_TOKEN));
    assert.equal(del.status, 200);

    const after2 = await fetch(
      url("/admin/reviews?visibility=all"),
      withAuth(ADMIN_TOKEN)
    ).then((r) => r.json());
    assert.equal(
      after2.data.reviews.some((r) => r.product._id === "prod007"),
      false
    );
  });
});
