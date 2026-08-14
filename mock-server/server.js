const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const { randomUUID } = require("crypto");

const app = express();
const PORT = 3002;
const uuidv4 = () => randomUUID();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ─── Multer setup for image uploads ───────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, "uploads")),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage });

// ─── In-memory data store ──────────────────────────────────────────────────────

let users = [
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
];

let categories = [
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
];

let products = [
  {
    _id: "prod001",
    title: "Classic White T-Shirt",
    sku: "GAR-001",
    price: 19.99,
    quantity: 50,
    description: "A comfortable everyday white t-shirt made from 100% cotton.",
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
    description: "High-quality wireless headphones with noise cancellation.",
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
    description: "Long-lasting matte lipstick set in 6 vibrant shades.",
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
    description: "Premium organic basmati rice, long grain and aromatic.",
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
    description: "Cold-pressed extra virgin olive oil from Mediterranean farms.",
    image: "oliveoil.png",
    category: {
      _id: "62fe246858f7aa8230817f8c",
      title: "Groceries",
    },
  },
];

let orders = [
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
    payment_status: "cod_pending",
    country: "Canada",
    city: "Toronto",
    zipcode: "M5V 3A8",
    shippingAddress: "123 Main Street",
    status: "pending",
    createdAt: new Date("2024-01-15T10:30:00Z").toISOString(),
    updatedAt: new Date("2024-01-15T10:30:00Z").toISOString(),
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
    payment_status: "cod_pending",
    country: "Canada",
    city: "Vancouver",
    zipcode: "V6B 1A1",
    shippingAddress: "456 Oak Avenue",
    status: "shipped",
    shippedOn: "2024-01-17",
    createdAt: new Date("2024-01-16T14:00:00Z").toISOString(),
    updatedAt: new Date("2024-01-17T09:00:00Z").toISOString(),
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
    payment_status: "cod_pending",
    country: "Canada",
    city: "Toronto",
    zipcode: "M5V 3A8",
    shippingAddress: "123 Main Street",
    status: "delivered",
    shippedOn: "2024-01-10",
    deliveredOn: "2024-01-12",
    createdAt: new Date("2024-01-09T08:00:00Z").toISOString(),
    updatedAt: new Date("2024-01-12T16:00:00Z").toISOString(),
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
    ],
    amount: 19.99,
    discount: 0,
    payment_type: "card",
    payment_status: "paid",
    country: "Canada",
    city: "Toronto",
    zipcode: "M5V 3A8",
    shippingAddress: "123 Main Street",
    status: "delivered",
    shippedOn: "2024-01-18",
    deliveredOn: "2024-01-20",
    createdAt: new Date("2024-01-17T12:00:00Z").toISOString(),
    updatedAt: new Date("2024-01-20T10:00:00Z").toISOString(),
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
    payment_status: "paid",
    country: "Canada",
    city: "Vancouver",
    zipcode: "V6B 1A1",
    shippingAddress: "456 Oak Avenue",
    status: "delivered",
    shippedOn: "2024-01-18",
    deliveredOn: "2024-01-21",
    createdAt: new Date("2024-01-17T14:00:00Z").toISOString(),
    updatedAt: new Date("2024-01-21T09:30:00Z").toISOString(),
  },
];

const emptySummary = () => ({
  averageRating: 0,
  totalVisibleReviews: 0,
  ratingDistribution: {
    5: 0,
    4: 0,
    3: 0,
    2: 0,
    1: 0,
  },
});

const buildDisplayName = (name) => {
  if (!name) return "Anonymous";
  const [firstName, ...rest] = name.trim().split(/\s+/);
  const secondInitial = rest[0] ? ` ${rest[0][0]}.` : "";
  return `${firstName}${secondInitial}`;
};

const createSeedReviews = () => [
  {
    _id: "rev001",
    productId: "prod001",
    productTitle: "Classic White T-Shirt",
    userId: "user001",
    displayName: "John D.",
    userName: "John Doe",
    userEmail: "user@easybuy.com",
    qualifyingOrderId: "ORD-2024-004",
    rating: 5,
    comment: "Great fit and quick delivery.",
    isVerifiedPurchase: true,
    visibility: "visible",
    createdAt: new Date("2026-08-14T20:08:15.000Z").toISOString(),
    updatedAt: new Date("2026-08-14T20:08:15.000Z").toISOString(),
  },
  {
    _id: "rev002",
    productId: "prod005",
    productTitle: "Face Moisturizer SPF 30",
    userId: "user002",
    displayName: "Jane S.",
    userName: "Jane Smith",
    userEmail: "jane@easybuy.com",
    qualifyingOrderId: "ORD-2024-005",
    rating: 4,
    comment: "Hydrating and lightweight for daily use.",
    isVerifiedPurchase: true,
    visibility: "hidden",
    createdAt: new Date("2026-08-13T18:00:00.000Z").toISOString(),
    updatedAt: new Date("2026-08-14T19:10:00.000Z").toISOString(),
    moderatedAt: new Date("2026-08-14T19:15:00.000Z").toISOString(),
    moderatedBy: {
      _id: "admin001",
      name: "Admin User",
    },
  },
];

const createSeedWishlists = () => [
  {
    userId: "user001",
    wishlist: [
      {
        productId: {
          _id: "prod003",
          title: "Wireless Bluetooth Headphones",
          image: "headphones.png",
          category: {
            _id: "62fe243858f7aa8230817f86",
            title: "Electronics",
          },
          price: 89.99,
          quantity: 20,
        },
        quantity: 1,
      },
    ],
  },
  {
    userId: "user002",
    wishlist: [],
  },
];

let reviews = createSeedReviews();
let wishlists = createSeedWishlists();

const reviewMetrics = {
  counters: {},
  latencies: [],
};

const logReviewEvent = (level, event, payload) => {
  console[level]({
    event,
    ...payload,
  });
};

const incrementMetric = (name, labels = {}) => {
  const key = `${name}:${JSON.stringify(labels)}`;
  reviewMetrics.counters[key] = (reviewMetrics.counters[key] || 0) + 1;
};

const recordLatency = (name, value) => {
  reviewMetrics.latencies.push({ name, value });
};

const findUserByToken = (token) => {
  if (!token) return null;
  return users.find((user) => user.token === token) || null;
};

const getProductById = (productId) =>
  products.find((product) => product._id === productId) || null;

const findWishlist = (userId) => {
  let wishlist = wishlists.find((item) => item.userId === userId);
  if (!wishlist) {
    wishlist = { userId, wishlist: [] };
    wishlists.push(wishlist);
  }
  return wishlist;
};

const serializeCurrentUserReview = (review) => {
  if (!review) return null;
  return {
    _id: review._id,
    rating: review.rating,
    comment: review.comment,
    visibility: review.visibility,
    updatedAt: review.updatedAt,
  };
};

const serializeRecentReview = (review) => ({
  _id: review._id,
  displayName: review.displayName,
  rating: review.rating,
  comment: review.comment,
  isVerifiedPurchase: review.isVerifiedPurchase,
  visibility: review.visibility,
  updatedAt: review.updatedAt,
});

const serializeAdminReview = (review) => ({
  _id: review._id,
  productId: review.productId,
  productTitle: review.productTitle,
  userId: review.userId,
  displayName: review.displayName,
  userEmail: review.userEmail,
  qualifyingOrderId: review.qualifyingOrderId,
  rating: review.rating,
  comment: review.comment,
  visibility: review.visibility,
  moderatedAt: review.moderatedAt || null,
  moderatedBy: review.moderatedBy || null,
  createdAt: review.createdAt,
  updatedAt: review.updatedAt,
});

const findQualifyingDeliveredOrder = (userId, productId) =>
  orders.find(
    (order) =>
      order.user._id === userId &&
      order.status === "delivered" &&
      order.items.some((item) => item.productId._id === productId)
  ) || null;

const getExistingReview = (userId, productId) =>
  reviews.find(
    (review) => review.userId === userId && review.productId === productId
  ) || null;

const buildReviewSummary = (productId) => {
  const visibleReviews = reviews.filter(
    (review) =>
      review.productId === productId && review.visibility === "visible"
  );

  if (visibleReviews.length === 0) {
    return emptySummary();
  }

  const distribution = emptySummary().ratingDistribution;
  let totalRating = 0;

  visibleReviews.forEach((review) => {
    distribution[review.rating] = (distribution[review.rating] || 0) + 1;
    totalRating += review.rating;
  });

  return {
    averageRating: Number((totalRating / visibleReviews.length).toFixed(1)),
    totalVisibleReviews: visibleReviews.length,
    ratingDistribution: distribution,
  };
};

const buildProductReviewBundle = (productId, user) => {
  const product = getProductById(productId);
  if (!product) return null;

  const existingReview = user ? getExistingReview(user._id, productId) : null;
  const qualifyingOrder = user
    ? findQualifyingDeliveredOrder(user._id, productId)
    : null;
  const visibleReviews = reviews
    .filter(
      (review) =>
        review.productId === productId && review.visibility === "visible"
    )
    .sort((left, right) => {
      return new Date(right.updatedAt) - new Date(left.updatedAt);
    })
    .slice(0, 5)
    .map(serializeRecentReview);

  let eligibility = null;
  if (user) {
    if (existingReview && existingReview.visibility === "removed") {
      eligibility = {
        canReview: false,
        reason: "This review was removed by an administrator.",
        qualifyingOrderId: existingReview.qualifyingOrderId,
      };
    } else if (qualifyingOrder) {
      eligibility = {
        canReview: true,
        reason: null,
        qualifyingOrderId: qualifyingOrder.orderId,
      };
    } else {
      eligibility = {
        canReview: false,
        reason: "Reviews unlock after delivery.",
        qualifyingOrderId: null,
      };
    }
  }

  return {
    productId,
    summary: buildReviewSummary(productId),
    eligibility,
    currentUserReview: serializeCurrentUserReview(existingReview),
    recentReviews: visibleReviews,
  };
};

const validateReviewPayload = ({ productId, rating, comment }) => {
  if (!productId) return "productId is required";
  if (!getProductById(productId)) return "Product not found";
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return "Rating must be an integer from 1 to 5";
  }

  const trimmedComment = typeof comment === "string" ? comment.trim() : "";
  if (trimmedComment.length < 10 || trimmedComment.length > 280) {
    return "Comment must be between 10 and 280 characters";
  }

  return null;
};

const resetReviewStore = () => {
  reviews = createSeedReviews();
  reviewMetrics.counters = {};
  reviewMetrics.latencies = [];
};

const resetWishlistStore = () => {
  wishlists = createSeedWishlists();
};

// ─── Auth middleware (simple token check) ─────────────────────────────────────
const authMiddleware = (req, res, next) => {
  const token = req.headers["x-auth-token"];
  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "No token provided" });
  }
  const user = users.find((u) => u.token === token);
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

// ─── Routes ───────────────────────────────────────────────────────────────────

// POST /register
app.post("/register", (req, res) => {
  const { email, password, name, userType } = req.body;
  if (!email || !password || !name) {
    return res
      .status(400)
      .json({ success: false, message: "All fields are required" });
  }
  if (users.find((u) => u.email === email)) {
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
  const { password: _, ...safeUser } = newUser;
  res.status(201).json({
    success: true,
    message: "User registered successfully",
    data: safeUser,
  });
});

// POST /login
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const user = users.find(
    (u) => u.email === email && u.password === password
  );
  if (!user) {
    return res
      .status(401)
      .json({ success: false, message: "Invalid email or password" });
  }
  const { password: _, ...safeUser } = user;
  res.json({ success: true, message: "Login successful", data: safeUser });
});

// GET /products
app.get("/products", (req, res) => {
  res.json({ success: true, data: products });
});

// POST /product  (admin: add product)
app.post("/product", adminMiddleware, (req, res) => {
  const { title, sku, price, image, description, category, quantity } =
    req.body;
  if (!title || !price) {
    return res
      .status(400)
      .json({ success: false, message: "Title and price are required" });
  }
  const cat = categories.find((c) => c._id === category);
  const newProduct = {
    _id: uuidv4(),
    title,
    sku: sku || "",
    price: parseFloat(price),
    quantity: parseInt(quantity) || 0,
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

// POST /update-product?id=
app.post("/update-product", adminMiddleware, (req, res) => {
  const { id } = req.query;
  const idx = products.findIndex((p) => p._id === id);
  if (idx === -1) {
    return res
      .status(404)
      .json({ success: false, message: "Product not found" });
  }
  const { title, sku, price, image, description, category, quantity } =
    req.body;
  const cat = categories.find((c) => c._id === category);
  products[idx] = {
    ...products[idx],
    title: title || products[idx].title,
    sku: sku || products[idx].sku,
    price: price ? parseFloat(price) : products[idx].price,
    quantity:
      quantity !== undefined ? parseInt(quantity) : products[idx].quantity,
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

// GET /delete-product?id=
app.get("/delete-product", adminMiddleware, (req, res) => {
  const { id } = req.query;
  const idx = products.findIndex((p) => p._id === id);
  if (idx === -1) {
    return res
      .status(404)
      .json({ success: false, message: "Product not found" });
  }
  products.splice(idx, 1);
  res.json({ success: true, message: "Product deleted successfully" });
});

// GET /categories
app.get("/categories", (req, res) => {
  res.json({ success: true, categories });
});

// POST /category  (admin: add category)
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

// POST /update-category?id=
app.post("/update-category", adminMiddleware, (req, res) => {
  const { id } = req.query;
  const idx = categories.findIndex((c) => c._id === id);
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

// GET /delete-category?id=
app.get("/delete-category", adminMiddleware, (req, res) => {
  const { id } = req.query;
  const idx = categories.findIndex((c) => c._id === id);
  if (idx === -1) {
    return res
      .status(404)
      .json({ success: false, message: "Category not found" });
  }
  categories.splice(idx, 1);
  res.json({ success: true, message: "Category deleted successfully" });
});

// GET /dashboard  (admin)
app.get("/dashboard", adminMiddleware, (req, res) => {
  res.json({
    success: true,
    data: {
      usersCount: users.filter((u) => u.userType === "USER").length,
      ordersCount: orders.length,
      productsCount: products.length,
      categoriesCount: categories.length,
    },
  });
});

// GET /admin/orders  (admin: all orders)
app.get("/admin/orders", adminMiddleware, (req, res) => {
  res.json({ success: true, data: orders });
});

// GET /admin/users  (admin: all users)
app.get("/admin/users", adminMiddleware, (req, res) => {
  const safeUsers = users.map(({ password, token, ...u }) => u);
  res.json({ success: true, data: safeUsers });
});

// GET /admin/order-status?orderId=&status=  (admin: update order status)
app.get("/admin/order-status", adminMiddleware, (req, res) => {
  const { orderId, status } = req.query;
  const validStatuses = ["pending", "shipped", "delivered"];
  if (!validStatuses.includes(status)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid status value" });
  }
  const order = orders.find((o) => o._id === orderId);
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

// GET /orders  (user: their own orders)
app.get("/orders", authMiddleware, (req, res) => {
  const userOrders = orders.filter((o) => o.user._id === req.user._id);
  res.json({ success: true, data: userOrders });
});

// GET /wishlist (user)
app.get("/wishlist", authMiddleware, (req, res) => {
  const wishlist = findWishlist(req.user._id);
  res.json({ success: true, data: [wishlist] });
});

// POST /add-to-wishlist (user)
app.post("/add-to-wishlist", authMiddleware, (req, res) => {
  const { productId, quantity = 1 } = req.body;
  if (!getProductById(productId)) {
    return res
      .status(404)
      .json({ success: false, message: "Product not found" });
  }

  const wishlist = findWishlist(req.user._id);
  const existingItem = wishlist.wishlist.find(
    (item) => item.productId._id === productId
  );

  if (existingItem) {
    existingItem.quantity = quantity;
  } else {
    wishlist.wishlist.push({
      productId: product,
      quantity,
    });
  }

  res.json({
    success: true,
    message: "Product added to wishlist",
    data: [wishlist],
  });
});

// GET /remove-from-wishlist?id= (user)
app.get("/remove-from-wishlist", authMiddleware, (req, res) => {
  const { id } = req.query;
  const wishlist = findWishlist(req.user._id);
  wishlist.wishlist = wishlist.wishlist.filter(
    (item) => item.productId._id !== id
  );

  res.json({
    success: true,
    message: "Product removed from wishlist",
    data: [wishlist],
  });
});

// GET /product-reviews
app.get("/product-reviews", (req, res) => {
  const startedAt = Date.now();
  const { productId } = req.query;
  if (!productId) {
    return res
      .status(400)
      .json({ success: false, message: "productId is required" });
  }

  const product = getProductById(productId);
  if (!product) {
    return res
      .status(404)
      .json({ success: false, message: "Product not found" });
  }

  const actor = findUserByToken(req.headers["x-auth-token"]);
  const bundle = buildProductReviewBundle(productId, actor);
  recordLatency("product_reviews_read_latency_ms", Date.now() - startedAt);

  logReviewEvent("info", "review_bundle_requested", {
    productId,
    actorId: actor?._id || null,
    hasToken: Boolean(req.headers["x-auth-token"]),
    resultCount: bundle.recentReviews.length,
  });

  res.json({ success: true, data: bundle });
});

// POST /review
app.post("/review", authMiddleware, (req, res) => {
  const { productId, rating, comment } = req.body;
  const validationMessage = validateReviewPayload({ productId, rating, comment });

  if (validationMessage) {
    logReviewEvent("warn", "review_rejected", {
      productId,
      userId: req.user._id,
      reason: validationMessage,
    });
    incrementMetric("reviews_submission_total", { result: "validation_error" });

    const statusCode = validationMessage === "Product not found" ? 404 : 400;
    return res
      .status(statusCode)
      .json({ success: false, message: validationMessage });
  }

  const qualifyingOrder = findQualifyingDeliveredOrder(req.user._id, productId);
  if (!qualifyingOrder) {
    logReviewEvent("warn", "review_rejected", {
      productId,
      userId: req.user._id,
      reason: "not_verified_purchaser",
    });
    incrementMetric("reviews_submission_total", { result: "forbidden" });
    return res.status(403).json({
      success: false,
      message: "Only verified purchasers can review this product",
    });
  }

  const existingReview = getExistingReview(req.user._id, productId);
  if (existingReview && existingReview.visibility === "removed") {
    logReviewEvent("warn", "review_rejected", {
      productId,
      userId: req.user._id,
      reason: "removed_review_locked",
    });
    incrementMetric("reviews_submission_total", { result: "forbidden" });
    return res.status(403).json({
      success: false,
      message: "Removed reviews cannot be edited",
    });
  }

  const now = new Date().toISOString();
  const trimmedComment = comment.trim();
  const product = getProductById(productId);
  let review = existingReview;
  let created = false;

  if (!review) {
    review = {
      _id: uuidv4(),
      productId,
      productTitle: product.title,
      userId: req.user._id,
      displayName: buildDisplayName(req.user.name),
      userName: req.user.name,
      userEmail: req.user.email,
      qualifyingOrderId: qualifyingOrder.orderId,
      rating,
      comment: trimmedComment,
      isVerifiedPurchase: true,
      visibility: "visible",
      createdAt: now,
      updatedAt: now,
    };
    reviews.push(review);
    created = true;
  } else {
    review.rating = rating;
    review.comment = trimmedComment;
    review.productTitle = product.title;
    review.qualifyingOrderId = qualifyingOrder.orderId;
    review.updatedAt = now;
  }

  const summary = buildReviewSummary(productId);
  logReviewEvent("info", "review_saved", {
    reviewId: review._id,
    productId,
    userId: req.user._id,
    qualifyingOrderId: review.qualifyingOrderId,
    created,
    visibility: review.visibility,
  });
  incrementMetric("reviews_submission_total", { result: "success" });
  incrementMetric("reviews_visible_total", { product_id: productId });

  res.status(created ? 201 : 200).json({
    success: true,
    message: "Review saved successfully",
    data: {
      review: {
        _id: review._id,
        productId: review.productId,
        rating: review.rating,
        comment: review.comment,
        visibility: review.visibility,
        isVerifiedPurchase: review.isVerifiedPurchase,
        updatedAt: review.updatedAt,
      },
      summary,
    },
  });
});

// GET /admin/reviews
app.get("/admin/reviews", adminMiddleware, (req, res) => {
  const { productId, visibility, search } = req.query;
  const validVisibility = ["visible", "hidden", "removed"];
  if (visibility && !validVisibility.includes(visibility)) {
    return res
      .status(400)
      .json({ success: false, message: "Unsupported visibility value" });
  }

  const needle = search ? String(search).trim().toLowerCase() : "";
  let filteredReviews = [...reviews];

  if (productId) {
    filteredReviews = filteredReviews.filter(
      (review) => review.productId === productId
    );
  }

  if (visibility) {
    filteredReviews = filteredReviews.filter(
      (review) => review.visibility === visibility
    );
  }

  if (needle) {
    filteredReviews = filteredReviews.filter((review) => {
      return [
        review.productTitle,
        review.displayName,
        review.userEmail,
        review.comment,
      ]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(needle));
    });
  }

  filteredReviews.sort(
    (left, right) => new Date(right.updatedAt) - new Date(left.updatedAt)
  );

  res.json({
    success: true,
    data: filteredReviews.map(serializeAdminReview),
  });
});

// GET /admin/review-visibility?id=&visibility=
app.get("/admin/review-visibility", adminMiddleware, (req, res) => {
  const { id, visibility } = req.query;
  if (!["visible", "hidden"].includes(visibility)) {
    return res
      .status(400)
      .json({ success: false, message: "Unsupported visibility value" });
  }

  const review = reviews.find((item) => item._id === id);
  if (!review) {
    return res
      .status(404)
      .json({ success: false, message: "Review not found" });
  }

  if (review.visibility === "removed") {
    return res.status(400).json({
      success: false,
      message: "Removed reviews cannot change visibility",
    });
  }

  const previousVisibility = review.visibility;
  review.visibility = visibility;
  review.moderatedAt = new Date().toISOString();
  review.moderatedBy = {
    _id: req.user._id,
    name: req.user.name,
  };
  review.updatedAt = review.moderatedAt;

  logReviewEvent("info", "review_visibility_changed", {
    reviewId: review._id,
    productId: review.productId,
    adminId: req.user._id,
    previousVisibility,
    nextVisibility: visibility,
  });
  incrementMetric("reviews_moderation_total", {
    action: visibility === "hidden" ? "hide" : "show",
  });

  res.json({
    success: true,
    message: "Review visibility updated successfully",
    data: serializeAdminReview(review),
  });
});

// GET /admin/delete-review?id=
app.get("/admin/delete-review", adminMiddleware, (req, res) => {
  const { id } = req.query;
  const review = reviews.find((item) => item._id === id);

  if (!review) {
    return res
      .status(404)
      .json({ success: false, message: "Review not found" });
  }

  review.visibility = "removed";
  review.moderatedAt = new Date().toISOString();
  review.moderatedBy = {
    _id: req.user._id,
    name: req.user.name,
  };
  review.updatedAt = review.moderatedAt;

  logReviewEvent("info", "review_removed", {
    reviewId: review._id,
    productId: review.productId,
    adminId: req.user._id,
  });
  incrementMetric("reviews_moderation_total", { action: "remove" });

  res.json({
    success: true,
    message: "Review removed successfully",
    data: serializeAdminReview(review),
  });
});

// Derive payment_status from payment_type (card PAN/CVV never accepted).
const derivePaymentStatus = (paymentType) => {
  if (paymentType === "cod") return "cod_pending";
  if (paymentType === "card") return "paid";
  return null;
};

// POST /checkout  (user: place order)
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
  const resolvedPaymentType = payment_type || "cod";
  const paymentStatus = derivePaymentStatus(resolvedPaymentType);
  if (!paymentStatus) {
    return res
      .status(400)
      .json({ success: false, message: "Unsupported payment_type" });
  }
  const orderItems = items.map((item) => {
    const product = products.find((p) => p._id === item.productId);
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
    payment_type: resolvedPaymentType,
    payment_status: paymentStatus,
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

// GET /delete-user?id=
app.get("/delete-user", (req, res) => {
  const { id } = req.query;
  const idx = users.findIndex((u) => u._id === id);
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

// POST /reset-password?id=
app.post("/reset-password", (req, res) => {
  const { id } = req.query;
  const { password, newPassword } = req.body;
  const user = users.find((u) => u._id === id);
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

// POST /photos/upload
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

// ─── Fallback placeholder image for /uploads/* ────────────────────────────────
// Returns a simple SVG placeholder when the requested image doesn't exist
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

const logStartupSummary = (port) => {
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
  console.log(`   GET    /remove-from-wishlist?id= (user)`);
  console.log(`   GET    /product-reviews`);
  console.log(`   POST   /review               (user)`);
  console.log(`   GET    /admin/reviews        (admin)`);
  console.log(`   GET    /admin/review-visibility?id=&visibility= (admin)`);
  console.log(`   GET    /admin/delete-review?id= (admin)`);
  console.log(`   GET    /orders               (user)`);
  console.log(`   POST   /checkout             (user)`);
  console.log(`   GET    /delete-user?id=`);
  console.log(`   POST   /reset-password?id=`);
  console.log(`   POST   /photos/upload`);
  console.log(`   GET    /uploads/:filename`);
  console.log(`\n🔑 Test tokens:`);
  console.log(`   Admin token : mock-admin-token-001`);
  console.log(`   User token  : mock-user-token-001`);
  console.log(`   User token  : mock-user-token-002`);
  console.log(`\n👤 Test credentials:`);
  console.log(`   Admin  → email: admin@easybuy.com  | password: admin123`);
  console.log(`   User   → email: user@easybuy.com   | password: user123`);
  console.log(`   User   → email: jane@easybuy.com   | password: jane123\n`);
};

const startServer = (port = PORT, options = {}) => {
  const { silent = false } = options;
  return app.listen(port, "0.0.0.0", () => {
    if (!silent) {
      logStartupSummary(port);
    }
  });
};

if (require.main === module) {
  startServer();
}

module.exports = {
  app,
  startServer,
  __reviewTestUtils: {
    buildDisplayName,
    findQualifyingDeliveredOrder,
    getExistingReview,
    buildReviewSummary,
    buildProductReviewBundle,
    resetReviewStore,
    resetWishlistStore,
    getReviews: () => reviews,
    getUserById: (userId) => users.find((user) => user._id === userId) || null,
  },
};
