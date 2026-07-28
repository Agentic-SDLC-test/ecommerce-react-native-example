/* eslint-env jest, node */
/* global Buffer */

const http = require("http");
const { app, resetMockData, __testing } = require("../mock-server/server");

const requestJson = ({ server, method, path, token, body }) =>
  new Promise((resolve, reject) => {
    const address = server.address();
    const payload = body ? JSON.stringify(body) : null;
    const req = http.request(
      {
        hostname: "127.0.0.1",
        port: address.port,
        path,
        method,
        headers: {
          ...(token ? { "x-auth-token": token } : {}),
          ...(payload
            ? {
                "Content-Type": "application/json",
                "Content-Length": Buffer.byteLength(payload),
              }
            : {}),
        },
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => {
          data += chunk;
        });
        res.on("end", () => {
          resolve({
            status: res.statusCode,
            body: data ? JSON.parse(data) : {},
          });
        });
      }
    );

    req.on("error", reject);
    if (payload) req.write(payload);
    req.end();
  });

describe("mock server reviews contract", () => {
  let server;

  beforeAll((done) => {
    server = app.listen(0, "127.0.0.1", done);
  });

  afterAll((done) => {
    server.close(done);
  });

  beforeEach(() => {
    resetMockData();
    jest.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("requires productId on the public reviews listing", async () => {
    const response = await requestJson({ server, method: "GET", path: "/reviews" });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("productId is required");
  });

  it("returns an empty summary and no verified-purchaser data for an anonymous caller", async () => {
    const response = await requestJson({
      server,
      method: "GET",
      path: "/reviews?productId=prod007",
    });

    expect(response.status).toBe(200);
    expect(response.body.data).toEqual(
      expect.objectContaining({
        summary: { average: 0, count: 0, distribution: { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 } },
        reviews: [],
        isVerifiedPurchaser: false,
        myReview: null,
      })
    );
  });

  it("rejects review submission from a non-verified purchaser", async () => {
    const response = await requestJson({
      server,
      method: "POST",
      path: "/reviews",
      token: "mock-user-token-002",
      body: { productId: "prod007", rating: 5, text: "Never bought this" },
    });

    expect(response.status).toBe(403);
    expect(response.body.message).toBe("Only verified purchasers can review this product");
  });

  it("rejects an out-of-range rating", async () => {
    const response = await requestJson({
      server,
      method: "POST",
      path: "/reviews",
      token: "mock-user-token-001",
      body: { productId: "prod007", rating: 6, text: "Too many stars" },
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("rating must be an integer between 1 and 5");
  });

  it("creates a review for a verified purchaser and blocks a second submission", async () => {
    const created = await requestJson({
      server,
      method: "POST",
      path: "/reviews",
      token: "mock-user-token-001",
      body: { productId: "prod007", rating: 5, text: "Great rice" },
    });

    expect(created.status).toBe(201);
    expect(created.body.message).toBe("Review submitted successfully");
    expect(created.body.data).toEqual(
      expect.objectContaining({
        productId: "prod007",
        userId: "user001",
        orderId: "order003",
        rating: 5,
        text: "Great rice",
        verifiedPurchase: true,
        status: "visible",
      })
    );

    const duplicate = await requestJson({
      server,
      method: "POST",
      path: "/reviews",
      token: "mock-user-token-001",
      body: { productId: "prod007", rating: 4, text: "Again" },
    });

    expect(duplicate.status).toBe(409);
    expect(duplicate.body.message).toBe(
      "You have already reviewed this product - use update-review to edit it"
    );
  });

  it("lets the owner update their own review but not anyone else", async () => {
    const created = await requestJson({
      server,
      method: "POST",
      path: "/reviews",
      token: "mock-user-token-001",
      body: { productId: "prod007", rating: 3, text: "Okay rice" },
    });
    const reviewId = created.body.data._id;

    const notOwner = await requestJson({
      server,
      method: "POST",
      path: `/update-review?id=${reviewId}`,
      token: "mock-user-token-002",
      body: { rating: 1, text: "Hijack" },
    });
    expect(notOwner.status).toBe(403);
    expect(notOwner.body.message).toBe("Cannot edit a review you do not own");

    const updated = await requestJson({
      server,
      method: "POST",
      path: `/update-review?id=${reviewId}`,
      token: "mock-user-token-001",
      body: { rating: 4, text: "Better than I thought" },
    });
    expect(updated.status).toBe(200);
    expect(updated.body.message).toBe("Review updated successfully");
    expect(updated.body.data).toEqual(
      expect.objectContaining({ rating: 4, text: "Better than I thought" })
    );

    const notFound = await requestJson({
      server,
      method: "POST",
      path: "/update-review?id=missing",
      token: "mock-user-token-001",
      body: { rating: 4, text: "n/a" },
    });
    expect(notFound.status).toBe(404);
    expect(notFound.body.message).toBe("Review not found");
  });

  it("reflects the caller's own review and verified-purchaser status on the public listing", async () => {
    await requestJson({
      server,
      method: "POST",
      path: "/reviews",
      token: "mock-user-token-001",
      body: { productId: "prod007", rating: 5, text: "Great rice" },
    });

    const response = await requestJson({
      server,
      method: "GET",
      path: "/reviews?productId=prod007",
      token: "mock-user-token-001",
    });

    expect(response.body.data.isVerifiedPurchaser).toBe(true);
    expect(response.body.data.myReview).toEqual(
      expect.objectContaining({ userId: "user001", rating: 5 })
    );
    expect(response.body.data.summary).toEqual(
      expect.objectContaining({ average: 5, count: 1 })
    );
  });

  it("lets admins moderate visibility and delete reviews", async () => {
    const created = await requestJson({
      server,
      method: "POST",
      path: "/reviews",
      token: "mock-user-token-001",
      body: { productId: "prod007", rating: 5, text: "Great rice" },
    });
    const reviewId = created.body.data._id;

    const invalidStatus = await requestJson({
      server,
      method: "GET",
      path: `/admin/review-status?reviewId=${reviewId}&status=archived`,
      token: "mock-admin-token-001",
    });
    expect(invalidStatus.status).toBe(400);
    expect(invalidStatus.body.message).toBe("Invalid status value");

    const hidden = await requestJson({
      server,
      method: "GET",
      path: `/admin/review-status?reviewId=${reviewId}&status=hidden`,
      token: "mock-admin-token-001",
    });
    expect(hidden.status).toBe(200);
    expect(hidden.body.message).toBe("Review status updated to hidden");
    expect(hidden.body.data.status).toBe("hidden");

    const publicListing = await requestJson({
      server,
      method: "GET",
      path: "/reviews?productId=prod007",
    });
    expect(publicListing.body.data.reviews).toEqual([]);
    expect(publicListing.body.data.summary.count).toBe(0);

    const adminListing = await requestJson({
      server,
      method: "GET",
      path: "/admin/reviews",
      token: "mock-admin-token-001",
    });
    expect(adminListing.body.data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ _id: reviewId, status: "hidden", productTitle: "Organic Basmati Rice (5kg)" }),
      ])
    );

    const deleted = await requestJson({
      server,
      method: "GET",
      path: `/admin/delete-review?id=${reviewId}`,
      token: "mock-admin-token-001",
    });
    expect(deleted.status).toBe(200);
    expect(deleted.body.message).toBe("Review deleted successfully");

    const deleteAgain = await requestJson({
      server,
      method: "GET",
      path: `/admin/delete-review?id=${reviewId}`,
      token: "mock-admin-token-001",
    });
    expect(deleteAgain.status).toBe(404);
    expect(deleteAgain.body.message).toBe("Review not found");
  });

  it("keeps the review helpers aligned with the spec", () => {
    expect(__testing.isVerifiedPurchaser("user001", "prod007")).toBe(true);
    expect(__testing.isVerifiedPurchaser("user002", "prod007")).toBe(false);
    expect(__testing.findUserReview("user001", "prod007")).toBeUndefined();
    expect(__testing.computeReviewSummary("prod007")).toEqual({
      average: 0,
      count: 0,
      distribution: { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 },
    });
  });
});
