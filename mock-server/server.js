const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const { randomUUID } = require("crypto");

const PORT = 3002;
const REVIEW_STATUSES = ["published", "hidden", "removed"];
const REVIEW_REASON = {
  LOGIN_REQUIRED: "LOGIN_REQUIRED",
  PURCHASE_REQUIRED: "PURCHASE_REQUIRED",
  REVIEW_EXISTS: "REVIEW_EXISTS",
  REMOVED_BY_ADMIN: "REMOVED_BY_ADMIN",
};
const uuidv4 = () => randomUUID();

function createInitialState() {
  return {
    users: [
      {
        _id: "admin001",
        name: "Admin User",
        email: "admin@easybuy.com",
        password: "admin123",
        userType: "ADMIN",
        token: "mock-admin-token-001",
      },
      {
        _id: "user001",
        name: "John Doe",
        email: "user@easybuy.com",
        password: "user123",
        userType: "USER",
        token: "mock-user-token-001",
      },
      {
        _id: "user002",
        name: "Jane Smith",
        email: "jane@easybuy.com",
        password: "jane123",
        userType: "USER",
        token: "mock-user-token-002",
      },
    ],
    categories: [
      {
        _id: "62fe244f58f7aa8230817f89",
        title: "Garments",
        description: "Clothing and fashion items",
        icon: "garments.png",
      },
      {
        _id: "62fe243858f7aa8230817f86",
        title: "Electronics",
        description: "Electronic devices and accessories",
        icon: "electronics.png",
      },
      {
        _id: "62fe241958f7aa8230817f83",
        title: "Cosmetics",
        description: "Beauty and personal care products",
        icon: "cosmetics.png",
      },
      {
        _id: "62fe246858f7aa8230817f8c",
        title: "Groceries",
        description: "Food and daily essentials",
        icon: "grocery.png",
      },
    ],
    products: [
      {
        _id: "prod001",
        title: "Classic White T-Shirt",
        sku: "GAR-001",
        price: 19.99,
        quantity: 50,
        description:
          "A comfortable everyday white t-shirt made from 100% cotton.",
        image: "tshirt.png",
        category: {
          _id: "62fe244f58f7aa8230817f89",
          title: "Garments",
        },
      },
      {
        _id: "prod002",
        title: "Blue Denim Jeans",
        sku: "GAR-002",
        price: 49.99,
        quantity: 30,
        description: "Slim-fit blue denim jeans for a modern look.",
        image: "jeans.png",
        category: {
          _id: "62fe244f58f7aa8230817f89",
          title: "Garments",
        },
      },
      {
        _id: "prod003",
        title: "Wireless Bluetooth Headphones",
        sku: "ELC-001",
        price: 89.99,
        quantity: 20,
        description:
          "High-quality wireless headphones with noise cancellation.",
        image: "headphones.png",
        category: {
          _id: "62fe243858f7aa8230817f86",
          title: "Electronics",
        },
      },
      {
        _id: "prod004",
        title: "Smartphone Stand",
        sku: "ELC-002",
        price: 14.99,
        quantity: 100,
        description: "Adjustable aluminum smartphone and tablet stand.",
        image: "stand.png",
        category: {
          _id: "62fe243858f7aa8230817f86",
          title: "Electronics",
        },
      },
      {
        _id: "prod005",
        title: "Face Moisturizer SPF 30",
        sku: "COS-001",
        price: 24.99,
        quantity: 60,
        description: "Daily face moisturizer with SPF 30 sun protection.",
        image: "moisturizer.png",
        category: {
          _id: "62fe241958f7aa8230817f83",
          title: "Cosmetics",
        },
      },
      {
        _id: "prod006",
        title: "Lipstick Set (6 Colors)",
        sku: "COS-002",
        price: 34.99,
        quantity: 40,
        description:
          "Long-lasting matte lipstick set in 6 vibrant shades.",
        image: "lipstick.png",
        category: {
          _id: "62fe241958f7aa8230817f83",
          title: "Cosmetics",
        },
      },
      {
        _id: "prod007",
        title: "Organic Basmati Rice (5kg)",
        sku: "GRO-001",
        price: 12.99,
        quantity: 200,
        description:
          "Premium organic basmati rice, long grain and aromatic.",
        image: "rice.png",
        category: {
          _id: "62fe246858f7aa8230817f8c",
          title: "Groceries",
        },
      },
      {
        _id: "prod008",
        title: "Extra Virgin Olive Oil (1L)",
        sku: "GRO-002",
        price: 18.99,
        quantity: 80,
        description:
          "Cold-pressed extra virgin olive oil from Mediterranean farms.",
        image: "oliveoil.png",
        category: {
          _id: "62fe246858f7aa8230817f8c",
          title: "Groceries",
        },
      },
    ],
    orders: [
      {
        _id: "order001",
        orderId: "ORD-2024-001",
        user: {
          _id: "user001",
          name: "John Doe",
          email: "user@easybuy.com",
        },
        items: [
          {
            productId: {
              _id: "prod001",
              title: "Classic White T-Shirt",
            },
            price: 19.99,
            quantity: 2,
          },
          {
            productId: {
              _id: "prod003",
              title: "Wireless Bluetooth Headphones",
            },
            price: 89.99,
            quantity: 1,
          },
        ],
        amount: 129.97,
        discount: 0,
        payment_type: "cod",
        country: "Canada",
        city: "Toronto",
        zipcode: "M5V 3A8",
        shippingAddress: "123 Main Street",
        status: "pending",
        createdAt: "2024-01-15T10:30:00.000Z",
        updatedAt: "2024-01-15T10:30:00.000Z",
      },
      {
        _id: "order002",
        orderId: "ORD-2024-002",
        user: {
          _id: "user002",
          name: "Jane Smith",
          email: "jane@easybuy.com",
        },
        items: [
          {
            productId: {
              _id: "prod005",
              title: "Face Moisturizer SPF 30",
            },
            price: 24.99,
            quantity: 1,
          },
        ],
        amount: 24.99,
        discount: 0,
        payment_type: "cod",
        country: "Canada",
        city: "Vancouver",
        zipcode: "V6B 1A1",
        shippingAddress: "456 Oak Avenue",
        status: "shipped",
        shippedOn: "2024-01-17",
        createdAt: "2024-01-16T14:00:00.000Z",
        updatedAt: "2024-01-17T09:00:00.000Z",
      },
      {
        _id: "order003",
        orderId: "ORD-2024-003",
        user: {
          _id: "user001",
          name: "John Doe",
          email: "user@easybuy.com",
        },
        items: [
          {
            productId: {
              _id: "prod007",
              title: "Organic Basmati Rice (5kg)",
            },
            price: 12.99,
            quantity: 3,
          },
        ],
        amount: 38.97,
        discount: 0,
        payment_type: "cod",
        country: "Canada",
        city: "Toronto",
        zipcode: "M5V 3A8",
        shippingAddress: "123 Main Street",
        status: "delivered",
        shippedOn: "2024-01-10",
        deliveredOn: "2024-01-12",
        createdAt: "2024-01-09T08:00:00.000Z",
        updatedAt: "2024-01-12T16:00:00.000Z",
      },
      {
        _id: "order004",
        orderId: "ORD-2024-004",
        user: {
          _id: "user001",
          name: "John Doe",
          email: "user@easybuy.com",
        },
        items: [
          {
            productId: {
              _id: "prod001",
              title: "Classic White T-Shirt",
            },
            price: 19.99,
            quantity: 1,
          },
          {
            productId: {
              _id: "prod003",
              title: "Wireless Bluetooth Headphones",
            },
            price: 89.99,
            quantity: 1,
          },
        ],
        amount: 109.98,
        discount: 0,
        payment_type: "card",
        country: "Canada",
        city: "Toronto",
        zipcode: "M5V 3A8",
        shippingAddress: "123 Main Street",
        status: "delivered",
        shippedOn: "2024-02-02",
        deliveredOn: "2024-02-04",
        createdAt: "2024-02-01T10:00:00.000Z",
        updatedAt: "2024-02-04T12:00:00.000Z",
      },
      {
        _id: "order005",
        orderId: "ORD-2024-005",
        user: {
          _id: "user002",
          name: "Jane Smith",
          email: "jane@easybuy.com",
        },
        items: [
          {
            productId: {
              _id: "prod001",
              title: "Classic White T-Shirt",
            },
            price: 19.99,
            quantity: 2,
          },
        ],
        amount: 39.98,
        discount: 0,
        payment_type: "cod",
        country: "Canada",
        city: "Vancouver",
        zipcode: "V6B 1A1",
        shippingAddress: "456 Oak Avenue",
        status: "delivered",
        shippedOn: "2024-02-10",
        deliveredOn: "2024-02-12",
        createdAt: "2024-02-08T15:00:00.000Z",
        updatedAt: "2024-02-12T16:30:00.000Z",
      },
      {
        _id: "order006",
        orderId: "ORD-2024-006",
        user: {
          _id: "user002",
          name: "Jane Smith",
          email: "jane@easybuy.com",
        },
        items: [
          {
            productId: {
              _id: "prod005",
              title: "Face Moisturizer SPF 30",
            },
            price: 24.99,
            quantity: 1,
          },
        ],
        amount: 24.99,
        discount: 0,
        payment_type: "card",
        country: "Canada",
        city: "Vancouver",
        zipcode: "V6B 1A1",
        shippingAddress: "456 Oak Avenue",
        status: "delivered",
        shippedOn: "2024-02-15",
        deliveredOn: "2024-02-18",
        createdAt: "2024-02-14T09:00:00.000Z",
        updatedAt: "2024-02-18T13:00:00.000Z",
      },
    ],
    reviews: [
      {
        _id: "review001",
        productId: "prod001",
        userId: "user001",
        orderId: "order004",
        rating: 5,
        comment: "Great shirt quality and the fit stayed true after washing.",
        status: "published",
        verifiedPurchase: true,
        createdAt: "2024-02-05T10:00:00.000Z",
        updatedAt: "2024-02-05T10:00:00.000Z",
        moderatedAt: null,
        moderatedBy: null,
      },
      {
        _id: "review002",
        productId: "prod001",
        userId: "user002",
        orderId: "order005",
        rating: 4,
        comment: "Soft fabric and fast delivery, though the sleeves run short.",
        status: "published",
        verifiedPurchase: true,
        createdAt: "2024-02-13T08:00:00.000Z",
        updatedAt: "2024-02-13T08:00:00.000Z",
        moderatedAt: null,
        moderatedBy: null,
      },
      {
        _id: "review003",
        productId: "prod007",
        userId: "user001",
        orderId: "order003",
        rating: 3,
        comment: "Rice arrived fresh and cooks well, but the bag tore on arrival.",
        status: "hidden",
        verifiedPurchase: true,
        createdAt: "2024-01-13T16:00:00.000Z",
        updatedAt: "2024-01-14T09:00:00.000Z",
        moderatedAt: "2024-01-14T09:00:00.000Z",
        moderatedBy: "admin001",
      },
      {
        _id: "review004",
        productId: "prod005",
        userId: "user002",
        orderId: "order006",
        rating: 2,
        comment: "Moisturizer felt heavy for my skin, so I stopped using it.",
        status: "removed",
        verifiedPurchase: true,
        createdAt: "2024-02-19T11:00:00.000Z",
        updatedAt: "2024-02-20T10:30:00.000Z",
        moderatedAt: "2024-02-20T10:30:00.000Z",
        moderatedBy: "admin001",
      },
    ],
  };
}

let users = [];
let categories = [];
let products = [];
let orders = [];
let reviews = [];
let wishlists = [];

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function resetMockData(overrides = {}) {
  const initialState = createInitialState();
  users = clone(overrides.users || initialState.users);
  categories = clone(overrides.categories || initialState.categories);
  products = clone(overrides.products || initialState.products);
  orders = clone(overrides.orders || initialState.orders);
  reviews = clone(overrides.reviews || initialState.reviews);
  wishlists = clone(
    overrides.wishlists || [
      {
        _id: "wishlist001",
        userId: "user001",
        wishlist: [
          {
            productId: initialState.products[2],
            quantity: 1,
          },
        ],
      },
      {
        _id: "wishlist002",
        userId: "user002",
        wishlist: [],
      },
    ]
  );
}

resetMockData();

function getMockData() {
  return {
    users,
    categories,
    products,
    orders,
    reviews,
    wishlists,
  };
}

function getUserByToken(token) {
  if (!token) return null;
  return users.find((user) => user.token === token) || null;
}

function resolveOptionalUser(req) {
  return getUserByToken(req.headers["x-auth-token"]);
}

function findEligibleDeliveredOrder(userId, productId) {
  const matchingOrders = orders
    .filter(
      (order) =>
        order.user._id === userId &&
        order.status === "delivered" &&
        order.items.some((item) => item.productId?._id === productId)
    )
    .sort(
      (left, right) =>
        new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime()
    );

  if (!matchingOrders.length) {
    return null;
  }

  const latestOrder = matchingOrders[0];
  return {
    _id: latestOrder._id,
    orderId: latestOrder.orderId,
  };
}

function getPublicReviewUser(userId) {
  const user = users.find((item) => item._id === userId);
  return user ? { _id: user._id, name: user.name } : { _id: userId, name: "Unknown User" };
}

function sanitizeReview(review) {
  return {
    _id: review._id,
    productId: review.productId,
    userId: review.userId,
    orderId: review.orderId,
    rating: review.rating,
    comment: review.comment,
    status: review.status,
    verifiedPurchase: review.verifiedPurchase,
    createdAt: review.createdAt,
    updatedAt: review.updatedAt,
    moderatedAt: review.moderatedAt,
    moderatedBy: review.moderatedBy,
  };
}

function buildRecentReview(review) {
  return {
    _id: review._id,
    rating: review.rating,
    comment: review.comment,
    status: review.status,
    verifiedPurchase: review.verifiedPurchase,
    user: getPublicReviewUser(review.userId),
    createdAt: review.createdAt,
    updatedAt: review.updatedAt,
  };
}

function buildReviewSummary(productId) {
  const publishedReviews = reviews
    .filter(
      (review) => review.productId === productId && review.status === "published"
    )
    .sort(
      (left, right) =>
        new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
    );

  const ratingDistribution = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  };

  publishedReviews.forEach((review) => {
    ratingDistribution[review.rating] += 1;
  });

  const totalReviewCount = publishedReviews.length;
  const averageRating =
    totalReviewCount === 0
      ? 0
      : Number(
          (
            publishedReviews.reduce((total, review) => total + review.rating, 0) /
            totalReviewCount
          ).toFixed(1)
        );

  return {
    averageRating,
    totalReviewCount,
    ratingDistribution,
    recentReviews: publishedReviews.slice(0, 3).map(buildRecentReview),
  };
}

function buildViewerState(productId, viewer) {
  const baseViewer = {
    canReview: false,
    canEdit: false,
    reason: REVIEW_REASON.LOGIN_REQUIRED,
    eligibleOrderId: null,
    review: null,
  };

  if (!viewer) {
    return baseViewer;
  }

  const existingReview = reviews.find(
    (review) => review.productId === productId && review.userId === viewer._id
  );

  if (existingReview) {
    if (existingReview.status === "removed") {
      return {
        canReview: false,
        canEdit: false,
        reason: REVIEW_REASON.REMOVED_BY_ADMIN,
        eligibleOrderId: existingReview.orderId,
        review: sanitizeReview(existingReview),
      };
    }

    return {
      canReview: false,
      canEdit: true,
      reason: REVIEW_REASON.REVIEW_EXISTS,
      eligibleOrderId: existingReview.orderId,
      review: sanitizeReview(existingReview),
    };
  }

  const eligibleOrder = findEligibleDeliveredOrder(viewer._id, productId);
  if (!eligibleOrder) {
    return {
      canReview: false,
      canEdit: false,
      reason: REVIEW_REASON.PURCHASE_REQUIRED,
      eligibleOrderId: null,
      review: null,
    };
  }

  return {
    canReview: true,
    canEdit: false,
    reason: null,
    eligibleOrderId: eligibleOrder._id,
    review: null,
  };
}

function buildReviewContext(productId, viewer) {
  const product = products.find((item) => item._id === productId);
  if (!product) {
    return null;
  }

  const summary = buildReviewSummary(productId);

  return {
    productId,
    summary: {
      averageRating: summary.averageRating,
      totalReviewCount: summary.totalReviewCount,
      ratingDistribution: summary.ratingDistribution,
    },
    recentReviews: summary.recentReviews,
    viewer: buildViewerState(productId, viewer),
  };
}

function parseReviewPayload(body) {
  const rating = Number(body.rating);
  const comment = typeof body.comment === "string" ? body.comment.trim() : "";
  return {
    productId: typeof body.productId === "string" ? body.productId.trim() : "",
    orderId: typeof body.orderId === "string" ? body.orderId.trim() : "",
    rating,
    comment,
  };
}

function validateReviewInput({ productId, orderId, rating, comment }) {
  if (!productId || !orderId || !comment || Number.isNaN(rating)) {
    return "productId, orderId, rating, and comment are required";
  }

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return "Rating must be an integer between 1 and 5";
  }

  if (comment.length < 10 || comment.length > 280) {
    return "Comment must be between 10 and 280 characters";
  }

  return null;
}

function logEvent(event, payload) {
  console.log(event, payload);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, "uploads")),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage });

const app = express();
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const authMiddleware = (req, res, next) => {
  const token = req.headers["x-auth-token"];
  if (!token) {
    return res.status(401).json({ success: false, message: "No token provided" });
  }
  const user = getUserByToken(token);
  if (!user) {
    return res.status(401).json({
      success: false,
      err: "jwt expired",
      message: "Invalid or expired token",
    });
  }
  req.user = user;
  next();
};

const adminMiddleware = (req, res, next) => {
  authMiddleware(req, res, () => {
    if (req.user.userType !== "ADMIN") {
      return res
        .status(403)
        .json({ success: false, message: "Admin access required" });
    }
    next();
  });
};

app.post("/register", (req, res) => {
  const { email, password, name, userType } = req.body;
  if (!email || !password || !name) {
    return res
      .status(400)
      .json({ success: false, message: "All fields are required" });
  }
  if (users.find((user) => user.email === email)) {
    return res
      .status(400)
      .json({ success: false, message: "Email already registered" });
  }
  const newUser = {
    _id: uuidv4(),
    name,
    email,
    password,
    userType: userType || "USER",
    token: `mock-token-${uuidv4()}`,
  };
  users.push(newUser);
  const { password: _password, ...safeUser } = newUser;
  res
    .status(201)
    .json({ success: true, message: "User registered successfully", data: safeUser });
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const user = users.find(
    (item) => item.email === email && item.password === password
  );
  if (!user) {
    return res
      .status(401)
      .json({ success: false, message: "Invalid email or password" });
  }
  const { password: _password, ...safeUser } = user;
  res.json({ success: true, message: "Login successful", data: safeUser });
});

app.get("/products", (req, res) => {
  res.json({ success: true, data: products });
});

app.post("/product", adminMiddleware, (req, res) => {
  const { title, sku, price, image, description, category, quantity } = req.body;
  if (!title || !price) {
    return res
      .status(400)
      .json({ success: false, message: "Title and price are required" });
  }
  const cat = categories.find((item) => item._id === category);
  const newProduct = {
    _id: uuidv4(),
    title,
    sku: sku || "",
    price: parseFloat(price),
    quantity: parseInt(quantity, 10) || 0,
    description: description || "",
    image: image || "default.png",
    category: cat
      ? { _id: cat._id, title: cat.title }
      : { _id: category, title: "Unknown" },
  };
  products.push(newProduct);
  res.json({
    success: true,
    message: "Product added successfully",
    data: newProduct,
  });
});

app.post("/update-product", adminMiddleware, (req, res) => {
  const { id } = req.query;
  const idx = products.findIndex((product) => product._id === id);
  if (idx === -1) {
    return res
      .status(404)
      .json({ success: false, message: "Product not found" });
  }
  const { title, sku, price, image, description, category, quantity } = req.body;
  const cat = categories.find((item) => item._id === category);
  products[idx] = {
    ...products[idx],
    title: title || products[idx].title,
    sku: sku || products[idx].sku,
    price: price ? parseFloat(price) : products[idx].price,
    quantity:
      quantity !== undefined ? parseInt(quantity, 10) : products[idx].quantity,
    description: description || products[idx].description,
    image: image || products[idx].image,
    category: cat ? { _id: cat._id, title: cat.title } : products[idx].category,
  };
  res.json({
    success: true,
    message: "Product updated successfully",
    data: products[idx],
  });
});

app.get("/delete-product", adminMiddleware, (req, res) => {
  const { id } = req.query;
  const idx = products.findIndex((product) => product._id === id);
  if (idx === -1) {
    return res
      .status(404)
      .json({ success: false, message: "Product not found" });
  }
  products.splice(idx, 1);
  res.json({ success: true, message: "Product deleted successfully" });
});

app.get("/categories", (req, res) => {
  res.json({ success: true, categories });
});

app.post("/category", adminMiddleware, (req, res) => {
  const { title, image, description } = req.body;
  if (!title) {
    return res
      .status(400)
      .json({ success: false, message: "Title is required" });
  }
  const newCategory = {
    _id: uuidv4(),
    title,
    description: description || "",
    icon: image || "default.png",
  };
  categories.push(newCategory);
  res.json({
    success: true,
    message: "Category added successfully",
    data: newCategory,
  });
});

app.post("/update-category", adminMiddleware, (req, res) => {
  const { id } = req.query;
  const idx = categories.findIndex((category) => category._id === id);
  if (idx === -1) {
    return res
      .status(404)
      .json({ success: false, message: "Category not found" });
  }
  const { title, image, description } = req.body;
  categories[idx] = {
    ...categories[idx],
    title: title || categories[idx].title,
    description: description || categories[idx].description,
    icon: image || categories[idx].icon,
  };
  res.json({
    success: true,
    message: "Category updated successfully",
    data: categories[idx],
  });
});

app.get("/delete-category", adminMiddleware, (req, res) => {
  const { id } = req.query;
  const idx = categories.findIndex((category) => category._id === id);
  if (idx === -1) {
    return res
      .status(404)
      .json({ success: false, message: "Category not found" });
  }
  categories.splice(idx, 1);
  res.json({ success: true, message: "Category deleted successfully" });
});

app.get("/dashboard", adminMiddleware, (req, res) => {
  res.json({
    success: true,
    data: {
      usersCount: users.filter((user) => user.userType === "USER").length,
      ordersCount: orders.length,
      productsCount: products.length,
      categoriesCount: categories.length,
      reviewsCount: reviews.length,
    },
  });
});

app.get("/admin/orders", adminMiddleware, (req, res) => {
  res.json({ success: true, data: orders });
});

app.get("/admin/users", adminMiddleware, (req, res) => {
  const safeUsers = users.map(({ password, token, ...user }) => user);
  res.json({ success: true, data: safeUsers });
});

app.get("/admin/order-status", adminMiddleware, (req, res) => {
  const { orderId, status } = req.query;
  const validStatuses = ["pending", "shipped", "delivered"];
  if (!validStatuses.includes(status)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid status value" });
  }
  const order = orders.find((item) => item._id === orderId);
  if (!order) {
    return res
      .status(404)
      .json({ success: false, message: "Order not found" });
  }
  order.status = status;
  order.updatedAt = new Date().toISOString();
  if (status === "shipped") {
    order.shippedOn = new Date().toISOString().split("T")[0];
  }
  if (status === "delivered") {
    order.deliveredOn = new Date().toISOString().split("T")[0];
  }
  res.json({
    success: true,
    message: `Order status updated to ${status}`,
    data: order,
  });
});

app.get("/orders", authMiddleware, (req, res) => {
  const userOrders = orders.filter((order) => order.user._id === req.user._id);
  res.json({ success: true, data: userOrders });
});

app.get("/wishlist", authMiddleware, (req, res) => {
  const userWishlist = wishlists.find((item) => item.userId === req.user._id);
  if (!userWishlist) {
    const nextWishlist = {
      _id: uuidv4(),
      userId: req.user._id,
      wishlist: [],
    };
    wishlists.push(nextWishlist);
    return res.json({ success: true, data: [nextWishlist] });
  }

  res.json({ success: true, data: [userWishlist] });
});

app.post("/add-to-wishlist", authMiddleware, (req, res) => {
  const { productId, quantity = 1 } = req.body;
  const product = products.find((item) => item._id === productId);
  if (!product) {
    return res
      .status(404)
      .json({ success: false, message: "Product not found" });
  }

  let userWishlist = wishlists.find((item) => item.userId === req.user._id);
  if (!userWishlist) {
    userWishlist = {
      _id: uuidv4(),
      userId: req.user._id,
      wishlist: [],
    };
    wishlists.push(userWishlist);
  }

  const existingItem = userWishlist.wishlist.find(
    (item) => item.productId._id === productId
  );
  if (existingItem) {
    existingItem.quantity = quantity;
    return res.json({
      success: true,
      message: "Product already exists in wishlist",
      data: [userWishlist],
    });
  }

  userWishlist.wishlist.push({
    productId: clone(product),
    quantity,
  });
  res.json({
    success: true,
    message: "Product added to wishlist",
    data: [userWishlist],
  });
});

app.get("/remove-from-wishlist", authMiddleware, (req, res) => {
  const { id } = req.query;
  const userWishlist = wishlists.find((item) => item.userId === req.user._id);
  if (!userWishlist) {
    return res
      .status(404)
      .json({ success: false, message: "Wishlist not found" });
  }

  const nextWishlist = userWishlist.wishlist.filter(
    (item) => item.productId._id !== id
  );

  if (nextWishlist.length === userWishlist.wishlist.length) {
    return res.status(404).json({
      success: false,
      message: "Product not found in wishlist",
    });
  }

  userWishlist.wishlist = nextWishlist;
  res.json({
    success: true,
    message: "Product removed from wishlist",
    data: [userWishlist],
  });
});

app.post("/checkout", authMiddleware, (req, res) => {
  const {
    items,
    amount,
    discount,
    payment_type,
    country,
    city,
    zipcode,
    shippingAddress,
    status,
  } = req.body;
  if (!items || items.length === 0) {
    return res.status(400).json({ success: false, message: "Cart is empty" });
  }
  const orderItems = items.map((item) => {
    const product = products.find((productItem) => productItem._id === item.productId);
    return {
      productId: product
        ? { _id: product._id, title: product.title }
        : { _id: item.productId, title: "Unknown Product" },
      price: item.price,
      quantity: item.quantity,
    };
  });
  const newOrder = {
    _id: uuidv4(),
    orderId: `ORD-${Date.now()}`,
    user: {
      _id: req.user._id,
      name: req.user.name,
      email: req.user.email,
    },
    items: orderItems,
    amount: amount || 0,
    discount: discount || 0,
    payment_type: payment_type || "cod",
    country: country || "",
    city: city || "",
    zipcode: zipcode || "",
    shippingAddress: shippingAddress || "",
    status: status || "pending",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  orders.push(newOrder);
  res.json({
    success: true,
    message: "Order placed successfully",
    data: newOrder,
  });
});

app.get("/product-reviews", (req, res) => {
  const { productId } = req.query;
  const reviewContext = buildReviewContext(productId, resolveOptionalUser(req));
  if (!reviewContext) {
    return res
      .status(404)
      .json({ success: false, message: "Product not found" });
  }
  res.json({ success: true, data: reviewContext });
});

app.post("/review", authMiddleware, (req, res) => {
  const payload = parseReviewPayload(req.body);
  const validationError = validateReviewInput(payload);
  if (validationError) {
    return res.status(400).json({ success: false, message: validationError });
  }

  const product = products.find((item) => item._id === payload.productId);
  if (!product) {
    return res
      .status(404)
      .json({ success: false, message: "Product not found" });
  }

  const eligibleOrder = orders.find(
    (order) =>
      order._id === payload.orderId &&
      order.user._id === req.user._id &&
      order.status === "delivered" &&
      order.items.some((item) => item.productId?._id === payload.productId)
  );

  if (!eligibleOrder) {
    logEvent("review.create_rejected", {
      productId: payload.productId,
      orderId: payload.orderId,
      userId: req.user._id,
      reason: "PURCHASE_REQUIRED",
    });
    return res.status(403).json({
      success: false,
      message: "Only delivered purchases can be reviewed",
    });
  }

  const existingReview = reviews.find(
    (review) =>
      review.userId === req.user._id && review.productId === payload.productId
  );
  if (existingReview && existingReview.status === "removed") {
    logEvent("review.create_rejected", {
      productId: payload.productId,
      orderId: payload.orderId,
      userId: req.user._id,
      reason: "REMOVED_BY_ADMIN",
    });
    return res.status(409).json({
      success: false,
      message: "Review was removed by an administrator",
    });
  }
  if (existingReview && existingReview.status !== "removed") {
    logEvent("review.create_rejected", {
      productId: payload.productId,
      orderId: payload.orderId,
      userId: req.user._id,
      reason: "REVIEW_EXISTS",
    });
    return res.status(409).json({
      success: false,
      message: "Review already exists for this product",
    });
  }

  const timestamp = new Date().toISOString();
  const newReview = {
    _id: uuidv4(),
    productId: payload.productId,
    userId: req.user._id,
    orderId: payload.orderId,
    rating: payload.rating,
    comment: payload.comment,
    status: "published",
    verifiedPurchase: true,
    createdAt: timestamp,
    updatedAt: timestamp,
    moderatedAt: null,
    moderatedBy: null,
  };
  reviews.push(newReview);

  logEvent("review.created", {
    reviewId: newReview._id,
    productId: newReview.productId,
    orderId: newReview.orderId,
    userId: req.user._id,
    status: newReview.status,
  });

  res.json({
    success: true,
    message: "Review submitted successfully",
    data: sanitizeReview(newReview),
  });
});

app.post("/update-review", authMiddleware, (req, res) => {
  const { id } = req.query;
  const review = reviews.find((item) => item._id === id);
  if (!review) {
    return res
      .status(404)
      .json({ success: false, message: "Review not found" });
  }
  if (review.userId !== req.user._id) {
    return res
      .status(403)
      .json({ success: false, message: "You can only edit your own review" });
  }
  if (review.status === "removed") {
    return res.status(409).json({
      success: false,
      message: "Removed reviews cannot be edited",
    });
  }

  const payload = parseReviewPayload({
    ...req.body,
    productId: review.productId,
    orderId: review.orderId,
  });
  const validationError = validateReviewInput(payload);
  if (validationError) {
    return res.status(400).json({ success: false, message: validationError });
  }

  review.rating = payload.rating;
  review.comment = payload.comment;
  review.updatedAt = new Date().toISOString();

  logEvent("review.updated", {
    reviewId: review._id,
    productId: review.productId,
    userId: req.user._id,
    status: review.status,
  });

  res.json({
    success: true,
    message: "Review updated successfully",
    data: sanitizeReview(review),
  });
});

app.get("/admin/reviews", adminMiddleware, (req, res) => {
  const reviewRows = reviews
    .map((review) => {
      const product = products.find((item) => item._id === review.productId);
      const user = users.find((item) => item._id === review.userId);
      const moderatedByUser = users.find((item) => item._id === review.moderatedBy);
      return {
        ...sanitizeReview(review),
        productTitle: product?.title || "Unknown Product",
        userName: user?.name || "Unknown User",
        moderatedByName: moderatedByUser?.name || null,
      };
    })
    .sort(
      (left, right) =>
        new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime()
    );

  res.json({ success: true, data: reviewRows });
});

app.get("/admin/review-status", adminMiddleware, (req, res) => {
  const { id, status } = req.query;
  if (!REVIEW_STATUSES.includes(status)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid status value" });
  }

  const review = reviews.find((item) => item._id === id);
  if (!review) {
    return res
      .status(404)
      .json({ success: false, message: "Review not found" });
  }

  const previousStatus = review.status;
  review.status = status;
  review.updatedAt = new Date().toISOString();
  review.moderatedAt = review.updatedAt;
  review.moderatedBy = req.user._id;

  logEvent("review.moderated", {
    reviewId: review._id,
    previousStatus,
    nextStatus: status,
    adminUserId: req.user._id,
    productId: review.productId,
  });

  res.json({
    success: true,
    message: `Review status updated to ${status}`,
    data: sanitizeReview(review),
  });
});

app.get("/delete-user", (req, res) => {
  const { id } = req.query;
  const idx = users.findIndex((user) => user._id === id);
  if (idx === -1) {
    return res
      .status(404)
      .json({ success: false, message: "User not found" });
  }
  const deleted = users.splice(idx, 1)[0];
  const { password, token, ...safeUser } = deleted;
  res.json({
    success: true,
    message: "Account deleted successfully",
    data: safeUser,
  });
});

app.post("/reset-password", (req, res) => {
  const { id } = req.query;
  const { password, newPassword } = req.body;
  const user = users.find((item) => item._id === id);
  if (!user) {
    return res
      .status(404)
      .json({ success: false, message: "User not found" });
  }
  if (user.password !== password) {
    return res.status(401).json({
      success: false,
      message: "Current password is incorrect",
    });
  }
  user.password = newPassword;
  res.json({ success: true, message: "Password updated successfully" });
});

app.post("/photos/upload", upload.single("photos"), (req, res) => {
  if (!req.file) {
    return res
      .status(400)
      .json({ success: false, message: "No file uploaded" });
  }
  res.json({
    success: true,
    message: "Image uploaded successfully",
    filename: req.file.filename,
    url: `/uploads/${req.file.filename}`,
  });
});

app.get("/uploads/:filename", (req, res) => {
  const filePath = path.join(__dirname, "uploads", req.params.filename);
  const fs = require("fs");
  if (fs.existsSync(filePath)) {
    return res.sendFile(filePath);
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200">
    <rect width="200" height="200" fill="#e0e0e0"/>
    <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle"
      font-family="Arial" font-size="14" fill="#999">No Image</text>
  </svg>`;
  res.setHeader("Content-Type", "image/svg+xml");
  res.send(svg);
});

function printStartupInfo(port) {
  console.log(`\n🚀 EasyBuy Mock Server running at http://localhost:${port}`);
  console.log(`\n📋 Available endpoints:`);
  console.log(`   POST   /register`);
  console.log(`   POST   /login`);
  console.log(`   GET    /products`);
  console.log(`   POST   /product              (admin)`);
  console.log(`   POST   /update-product?id=   (admin)`);
  console.log(`   GET    /delete-product?id=   (admin)`);
  console.log(`   GET    /categories`);
  console.log(`   POST   /category             (admin)`);
  console.log(`   POST   /update-category?id=  (admin)`);
  console.log(`   GET    /delete-category?id=  (admin)`);
  console.log(`   GET    /dashboard            (admin)`);
  console.log(`   GET    /admin/orders         (admin)`);
  console.log(`   GET    /admin/users          (admin)`);
  console.log(`   GET    /admin/order-status?orderId=&status=  (admin)`);
  console.log(`   GET    /wishlist             (user)`);
  console.log(`   POST   /add-to-wishlist      (user)`);
  console.log(`   GET    /remove-from-wishlist?id=  (user)`);
  console.log(`   GET    /product-reviews?productId=`);
  console.log(`   POST   /review               (user)`);
  console.log(`   POST   /update-review?id=    (user)`);
  console.log(`   GET    /admin/reviews        (admin)`);
  console.log(`   GET    /admin/review-status?id=&status=  (admin)`);
  console.log(`   GET    /orders               (user)`);
  console.log(`   POST   /checkout             (user)`);
  console.log(`   GET    /delete-user?id=`);
  console.log(`   POST   /reset-password?id=`);
  console.log(`   POST   /photos/upload`);
  console.log(`   GET    /uploads/:filename`);
  console.log(`\n🔑 Test tokens:`);
  console.log(`   Admin token : mock-admin-token-001`);
  console.log(`   User token  : mock-user-token-001`);
  console.log(`\n👤 Test credentials:`);
  console.log(`   Admin  → email: admin@easybuy.com  | password: admin123`);
  console.log(`   User   → email: user@easybuy.com   | password: user123\n`);
}

function startServer(options = {}) {
  const { port = PORT, host = "0.0.0.0", silent = false } = options;
  return app.listen(port, host, () => {
    if (!silent) {
      printStartupInfo(port);
    }
  });
}

if (require.main === module) {
  startServer();
}

module.exports = {
  app,
  startServer,
  resetMockData,
  getMockData,
  resolveOptionalUser,
  findEligibleDeliveredOrder,
  buildReviewSummary,
  buildReviewContext,
  REVIEW_REASON,
  REVIEW_STATUSES,
};
