'use strict';

const { test, describe, before, after } = require('node:test');
const assert = require('node:assert/strict');

const app = require('../server');

const USER001_TOKEN = 'mock-user-token-001'; // delivered order003 contains prod007; owns rev001 on prod001
const USER002_TOKEN = 'mock-user-token-002'; // no delivered orders
const ADMIN_TOKEN = 'mock-admin-token-001';

let server;
let baseUrl;

function url(path) {
  return `${baseUrl}${path}`;
}

function request(path, { method = 'GET', token, body } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['x-auth-token'] = token;
  return fetch(url(path), {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  }).then(async (res) => ({ status: res.status, body: await res.json() }));
}

before(async () => {
  await new Promise((resolve) => {
    server = app.listen(0, '127.0.0.1', resolve);
  });
  const { port } = server.address();
  baseUrl = `http://127.0.0.1:${port}`;
});

after(async () => {
  await new Promise((resolve) => server.close(resolve));
});

describe('review contract scenarios (run sequentially, state carries over)', () => {
  let createdReviewId;

  test('1. anonymous GET on prod007: not eligible, no myReview, all-zero distribution', async () => {
    const { status, body } = await request('/products/prod007/reviews');
    assert.equal(status, 200);
    assert.equal(body.isEligible, false);
    assert.equal(body.myReview, null);
    assert.equal(body.totalCount, 0);
    assert.deepEqual(body.distribution, { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 });
  });

  test('2. ineligible user002 POST /reviews on prod007 -> 403', async () => {
    const { status, body } = await request('/reviews', {
      method: 'POST',
      token: USER002_TOKEN,
      body: { productId: 'prod007', rating: 5 },
    });
    assert.equal(status, 403);
    assert.equal(body.message, 'You are not eligible to review this product');
  });

  test('3. invalid rating/comment from eligible user001 -> 400', async () => {
    const badRating = await request('/reviews', {
      method: 'POST',
      token: USER001_TOKEN,
      body: { productId: 'prod007', rating: 4.5 },
    });
    assert.equal(badRating.status, 400);

    const longComment = await request('/reviews', {
      method: 'POST',
      token: USER001_TOKEN,
      body: { productId: 'prod007', rating: 4, comment: 'a'.repeat(501) },
    });
    assert.equal(longComment.status, 400);
  });

  test('4. eligible user001 POST /reviews on prod007 with rating only -> 200', async () => {
    const { status, body } = await request('/reviews', {
      method: 'POST',
      token: USER001_TOKEN,
      body: { productId: 'prod007', rating: 4 },
    });
    assert.equal(status, 200);
    assert.equal(body.data.edited, false);
    assert.equal(body.data.visible, true);
    createdReviewId = body.data._id;
    assert.ok(createdReviewId);
  });

  test('5. repeat submission for the same product -> 409', async () => {
    const { status, body } = await request('/reviews', {
      method: 'POST',
      token: USER001_TOKEN,
      body: { productId: 'prod007', rating: 3 },
    });
    assert.equal(status, 409);
    assert.match(body.message, /already reviewed/);
  });

  test('6. anonymous GET reflects the new review: count, average, privacy', async () => {
    const { status, body } = await request('/products/prod007/reviews');
    assert.equal(status, 200);
    assert.equal(body.totalCount, 1);
    assert.equal(body.averageRating, 4);
    assert.equal(body.distribution['4'], 1);
    const review = body.reviews[0];
    assert.equal(review.verifiedPurchase, true);
    assert.equal(review.user.name, 'John D.');
    assert.equal(review.user._id, undefined);
  });

  test('7. GET as user001: hasReviewed true, myReview.rating 4', async () => {
    const { body } = await request('/products/prod007/reviews', { token: USER001_TOKEN });
    assert.equal(body.hasReviewed, true);
    assert.equal(body.myReview.rating, 4);
  });

  test('8. user002 (not the author) tries to update -> 403', async () => {
    const { status, body } = await request(`/reviews/${createdReviewId}/update`, {
      method: 'POST',
      token: USER002_TOKEN,
      body: { rating: 2 },
    });
    assert.equal(status, 403);
    assert.equal(body.message, 'You can only edit your own review');
  });

  test('9. admin hides the review; invalid visible payload -> 400', async () => {
    const bad = await request(`/admin/reviews/${createdReviewId}/visibility`, {
      method: 'POST',
      token: ADMIN_TOKEN,
      body: { visible: 'no' },
    });
    assert.equal(bad.status, 400);

    const { status, body } = await request(`/admin/reviews/${createdReviewId}/visibility`, {
      method: 'POST',
      token: ADMIN_TOKEN,
      body: { visible: false },
    });
    assert.equal(status, 200);
    assert.equal(body.data.visible, false);
  });

  test('10. after hide: anonymous totalCount 0; author still sees own hidden review', async () => {
    const anon = await request('/products/prod007/reviews');
    assert.equal(anon.body.totalCount, 0);

    const mine = await request('/products/prod007/reviews', { token: USER001_TOKEN });
    assert.equal(mine.body.myReview.visible, false);
  });

  test('11. author edits the hidden review: edited true, stays hidden', async () => {
    const { status, body } = await request(`/reviews/${createdReviewId}/update`, {
      method: 'POST',
      token: USER001_TOKEN,
      body: { rating: 2, comment: 'Changed my mind' },
    });
    assert.equal(status, 200);
    assert.equal(body.data.visible, false);
    assert.equal(body.data.edited, true);

    const anon = await request('/products/prod007/reviews');
    assert.equal(anon.body.totalCount, 0);
  });

  test('12. admin shows the review again; public figures reflect the edit', async () => {
    const { status } = await request(`/admin/reviews/${createdReviewId}/visibility`, {
      method: 'POST',
      token: ADMIN_TOKEN,
      body: { visible: true },
    });
    assert.equal(status, 200);

    const anon = await request('/products/prod007/reviews');
    assert.equal(anon.body.distribution['2'], 1);
    assert.equal(anon.body.reviews[0].edited, true);
  });

  test('13. admin review list sorted desc, carries edited + full name; non-admin blocked', async () => {
    const { status, body } = await request('/admin/reviews', { token: ADMIN_TOKEN });
    assert.equal(status, 200);
    for (let i = 1; i < body.data.length; i += 1) {
      assert.ok(new Date(body.data[i - 1].createdAt) >= new Date(body.data[i].createdAt));
    }
    const mine = body.data.find((r) => r._id === createdReviewId);
    assert.equal(mine.edited, true);
    assert.equal(mine.user.name, 'John Doe');

    const forbidden = await request('/admin/reviews', { token: USER001_TOKEN });
    assert.equal(forbidden.status, 403);
  });

  test('14. admin delete frees the slot for a new submission', async () => {
    const del = await request(`/admin/reviews/${createdReviewId}/delete`, {
      method: 'POST',
      token: ADMIN_TOKEN,
    });
    assert.equal(del.status, 200);

    const resubmit = await request('/reviews', {
      method: 'POST',
      token: USER001_TOKEN,
      body: { productId: 'prod007', rating: 5 },
    });
    assert.equal(resubmit.status, 200);
  });

  test('15. GET reviews for an unknown product -> 404', async () => {
    const { status } = await request('/products/unknown/reviews');
    assert.equal(status, 404);
  });
});
