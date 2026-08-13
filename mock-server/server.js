const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

const app = express();
const PORT = 3002;

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
    country: "Canada",
    city: "Toronto",
    zipcode: "M5V 3A8",
    shippingAddress: "123 Main Street",
    status: "delivered",
    shippedOn: "2024-01-16",
    deliveredOn: "2024-01-18",
    createdAt: new Date("2024-01-15T10:30:00Z").toISOString(),
    updatedAt: new Date("2024-01-18T16:00:00Z").toISOString(),
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
];

let reviews = [
  {
    _id: "review001",
    productId: "prod007",
    user: { _id: "user001", name: "John Doe" },
    rating: 5,
    comment: "Great quality rice, aromatic and cooks perfectly every time.",
    verifiedPurchase: true,
    visible: true,
    hidden: false,
    removed: false,
    moderationStatus: "visible",
    createdAt: "2024-01-20T10:00:00.000Z",
    updatedAt: "2024-01-20T10:00:00.000Z",
    moderatedAt: null,
    moderatedBy: null,
  },
  {
    _id: "review002",
    productId: "prod001",
    user: { _id: "user001", name: "John Doe" },
    rating: 4,
    comment: "Comfortable cotton t-shirt, fits well and washes nicely.",
    verifiedPurchase: true,
    visible: false,
    hidden: true,
    removed: false,
    moderationStatus: "hidden",
    createdAt: "2024-01-18T14:00:00.000Z",
    updatedAt: "2024-01-19T09:00:00.000Z",
    moderatedAt: "2024-01-19T09:00:00.000Z",
    moderatedBy: { _id: "admin001", name: "Admin User" },
  },
];

// ─── Review helpers ───────────────────────────────────────────────────────────

function findProduct(productId) {
  return products.find((p) => p._id === productId);
}

function hasDeliveredPurchase(userId, productId) {
  return orders.some(
    (order) =>
      order.user._id === userId &&
      order.status === "delivered" &&
      order.items.some((item) => item.productId._id === productId)
  );
}

function getVisibleReviews(productId) {
  return reviews.filter(
    (r) =>
      r.productId === productId &&
      r.visible === true &&
      r.hidden === false &&
      r.removed === false
  );
}

function buildReviewSummary(productId) {
  const visible = getVisibleReviews(productId);
  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let totalRating = 0;
  visible.forEach((r) => {
    distribution[r.rating] = (distribution[r.rating] || 0) + 1;
    totalRating += r.rating;
  });
  const totalReviews = visible.length;
  const averageRating =
    totalReviews > 0 ? Math.round((totalRating / totalReviews) * 10) / 10 : 0;
  return { averageRating, totalReviews, distribution };
}

function sanitizeReview(review) {
  return {
    _id: review._id,
    productId: review.productId,
    user: { _id: review.user._id, name: review.user.name },
    rating: review.rating,
    comment: review.comment,
    verifiedPurchase: review.verifiedPurchase,
    createdAt: review.createdAt,
    updatedAt: review.updatedAt,
  };
}

function sanitizeAdminReview(review) {
  const product = findProduct(review.productId);
  return {
    _id: review._id,
    product: product
      ? { _id: product._id, title: product.title }
      : { _id: review.productId, title: "Unknown Product" },
    user: { _id: review.user._id, name: review.user.name },
    rating: review.rating,
    comment: review.comment,
    verifiedPurchase: review.verifiedPurchase,
    visible: review.visible,
    hidden: review.hidden,
    removed: review.removed,
    moderationStatus: review.moderationStatus,
    createdAt: review.createdAt,
    updatedAt: review.updatedAt,
    moderatedAt: review.moderatedAt || null,
    moderatedBy: review.moderatedBy || null,
  };
}

function validateReviewBody(body) {
  const rating = parseInt(body.rating, 10);
  if (!rating || rating < 1 || rating > 5) {
    return { valid: false, message: "Rating must be an integer between 1 and 5" };
  }
  const comment = (body.comment || "").trim();
  if (comment.length < 10) {
    return { valid: false, message: "Comment must be at least 10 characters" };
  }
  if (comment.length > 500) {
    return { valid: false, message: "Comment must be at most 500 characters" };
  }
  return { valid: true, rating, comment };
}

// ─── Auth middleware (simple token check) ─────────────────────────────────────
const authMiddleware = (req, res, next) => {
  const token = req.headers["x-auth-token"];
  if (!token) {
    return res.status(401).json({ success: false, message: "No token provided" });
  }
  const user = users.find((u) => u.token === token);
  if (!user) {
    return res.status(401).json({ success: false, err: "jwt expired", message: "Invalid or expired token" });
  }
  req.user = user;
  next();
};

const adminMiddleware = (req, res, next) => {
  authMiddleware(req, res, () => {
    if (req.user.userType !== "ADMIN") {
      return res.status(403).json({ success: false, message: "Admin access required" });
    }
    next();
  });
};

// ─── Routes ───────────────────────────────────────────────────────────────────

// POST /register
app.post("/register", (req, res) => {
  const { email, password, name, userType } = req.body;
  if (!email || !password || !name) {
    return res.status(400).json({ success: false, message: "All fields are required" });
  }
  if (users.find((u) => u.email === email)) {
    return res.status(400).json({ success: false, message: "Email already registered" });
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
  res.status(201).json({ success: true, message: "User registered successfully", data: safeUser });
});

// POST /login
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const user = users.find((u) => u.email === email && u.password === password);
  if (!user) {
    return res.status(401).json({ success: false, message: "Invalid email or password" });
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
  const { title, sku, price, image, description, category, quantity } = req.body;
  if (!title || !price) {
    return res.status(400).json({ success: false, message: "Title and price are required" });
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
    category: cat ? { _id: cat._id, title: cat.title } : { _id: category, title: "Unknown" },
  };
  products.push(newProduct);
  res.json({ success: true, message: "Product added successfully", data: newProduct });
});

// POST /update-product?id=
app.post("/update-product", adminMiddleware, (req, res) => {
  const { id } = req.query;
  const idx = products.findIndex((p) => p._id === id);
  if (idx === -1) {
    return res.status(404).json({ success: false, message: "Product not found" });
  }
  const { title, sku, price, image, description, category, quantity } = req.body;
  const cat = categories.find((c) => c._id === category);
  products[idx] = {
    ...products[idx],
    title: title || products[idx].title,
    sku: sku || products[idx].sku,
    price: price ? parseFloat(price) : products[idx].price,
    quantity: quantity !== undefined ? parseInt(quantity) : products[idx].quantity,
    description: description || products[idx].description,
    image: image || products[idx].image,
    category: cat ? { _id: cat._id, title: cat.title } : products[idx].category,
  };
  res.json({ success: true, message: "Product updated successfully", data: products[idx] });
});

// GET /delete-product?id=
app.get("/delete-product", adminMiddleware, (req, res) => {
  const { id } = req.query;
  const idx = products.findIndex((p) => p._id === id);
  if (idx === -1) {
    return res.status(404).json({ success: false, message: "Product not found" });
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
    return res.status(400).json({ success: false, message: "Title is required" });
  }
  const newCategory = {
    _id: uuidv4(),
    title,
    description: description || "",
    icon: image || "default.png",
  };
  categories.push(newCategory);
  res.json({ success: true, message: "Category added successfully", data: newCategory });
});

// POST /update-category?id=
app.post("/update-category", adminMiddleware, (req, res) => {
  const { id } = req.query;
  const idx = categories.findIndex((c) => c._id === id);
  if (idx === -1) {
    return res.status(404).json({ success: false, message: "Category not found" });
  }
  const { title, image, description } = req.body;
  categories[idx] = {
    ...categories[idx],
    title: title || categories[idx].title,
    description: description || categories[idx].description,
    icon: image || categories[idx].icon,
  };
  res.json({ success: true, message: "Category updated successfully", data: categories[idx] });
});

// GET /delete-category?id=
app.get("/delete-category", adminMiddleware, (req, res) => {
  const { id } = req.query;
  const idx = categories.findIndex((c) => c._id === id);
  if (idx === -1) {
    return res.status(404).json({ success: false, message: "Category not found" });
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
      reviewsCount: reviews.filter((r) => r.removed !== true).length,
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
    return res.status(400).json({ success: false, message: "Invalid status value" });
  }
  const order = orders.find((o) => o._id === orderId);
  if (!order) {
    return res.status(404).json({ success: false, message: "Order not found" });
  }
  order.status = status;
  order.updatedAt = new Date().toISOString();
  if (status === "shipped") order.shippedOn = new Date().toISOString().split("T")[0];
  if (status === "delivered") order.deliveredOn = new Date().toISOString().split("T")[0];
  res.json({ success: true, message: `Order status updated to ${status}`, data: order });
});

// GET /orders  (user: their own orders)
app.get("/orders", authMiddleware, (req, res) => {
  const userOrders = orders.filter((o) => o.user._id === req.user._id);
  res.json({ success: true, data: userOrders });
});

// POST /checkout  (user: place order)
app.post("/checkout", authMiddleware, (req, res) => {
  const { items, amount, discount, payment_type, country, city, zipcode, shippingAddress, status } = req.body;
  if (!items || items.length === 0) {
    return res.status(400).json({ success: false, message: "Cart is empty" });
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
  res.json({ success: true, message: "Order placed successfully", data: newOrder });
});

// GET /delete-user?id=
app.get("/delete-user", (req, res) => {
  const { id } = req.query;
  const idx = users.findIndex((u) => u._id === id);
  if (idx === -1) {
    return res.status(404).json({ success: false, message: "User not found" });
  }
  const deleted = users.splice(idx, 1)[0];
  const { password, token, ...safeUser } = deleted;
  res.json({ success: true, message: "Account deleted successfully", data: safeUser });
});

// POST /reset-password?id=
app.post("/reset-password", (req, res) => {
  const { id } = req.query;
  const { password, newPassword } = req.body;
  const user = users.find((u) => u._id === id);
  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }
  if (user.password !== password) {
    return res.status(401).json({ success: false, message: "Current password is incorrect" });
  }
  user.password = newPassword;
  res.json({ success: true, message: "Password updated successfully" });
});

// ─── Review endpoints ─────────────────────────────────────────────────────────

// GET /products/:productId/reviews
app.get("/products/:productId/reviews", (req, res) => {
  const { productId } = req.params;
  const product = findProduct(productId);
  if (!product) {
    return res.status(404).json({ success: false, message: "Product not found" });
  }
  const summary = buildReviewSummary(productId);
  const recentReviews = getVisibleReviews(productId)
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .slice(0, 3)
    .map(sanitizeReview);
  res.json({ success: true, data: { summary, recentReviews } });
});

// GET /products/:productId/my-review
app.get("/products/:productId/my-review", authMiddleware, (req, res) => {
  const { productId } = req.params;
  const product = findProduct(productId);
  if (!product) {
    return res.status(404).json({ success: false, message: "Product not found" });
  }
  const canReview = hasDeliveredPurchase(req.user._id, productId);
  const existingReview = reviews.find(
    (r) =>
      r.productId === productId &&
      r.user._id === req.user._id &&
      r.removed !== true
  );
  res.json({
    success: true,
    data: {
      canReview,
      reason: canReview ? "delivered_purchase" : "no_delivered_purchase",
      existingReview: existingReview
        ? {
            _id: existingReview._id,
            productId: existingReview.productId,
            rating: existingReview.rating,
            comment: existingReview.comment,
            verifiedPurchase: existingReview.verifiedPurchase,
            visible: existingReview.visible,
            hidden: existingReview.hidden,
            removed: existingReview.removed,
            moderationStatus: existingReview.moderationStatus,
            createdAt: existingReview.createdAt,
            updatedAt: existingReview.updatedAt,
          }
        : null,
    },
  });
});

// POST /products/:productId/reviews
app.post("/products/:productId/reviews", authMiddleware, (req, res) => {
  const { productId } = req.params;
  const product = findProduct(productId);
  if (!product) {
    return res.status(404).json({ success: false, message: "Product not found" });
  }
  if (!hasDeliveredPurchase(req.user._id, productId)) {
    return res
      .status(403)
      .json({ success: false, message: "Only verified purchasers can review this product" });
  }
  const validation = validateReviewBody(req.body);
  if (!validation.valid) {
    return res.status(400).json({ success: false, message: validation.message });
  }
  const existingIdx = reviews.findIndex(
    (r) =>
      r.productId === productId &&
      r.user._id === req.user._id &&
      r.removed !== true
  );
  const now = new Date().toISOString();
  if (existingIdx !== -1) {
    reviews[existingIdx] = {
      ...reviews[existingIdx],
      rating: validation.rating,
      comment: validation.comment,
      updatedAt: now,
      visible: true,
      hidden: false,
      moderationStatus: "visible",
    };
    console.log(
      `review update reviewId=${reviews[existingIdx]._id} productId=${productId} userId=${req.user._id}`
    );
    return res.json({
      success: true,
      message: "Review saved successfully",
      data: {
        ...reviews[existingIdx],
        user: { _id: req.user._id, name: req.user.name },
      },
    });
  }
  const newReview = {
    _id: uuidv4(),
    productId,
    user: { _id: req.user._id, name: req.user.name },
    rating: validation.rating,
    comment: validation.comment,
    verifiedPurchase: true,
    visible: true,
    hidden: false,
    removed: false,
    moderationStatus: "visible",
    createdAt: now,
    updatedAt: now,
    moderatedAt: null,
    moderatedBy: null,
  };
  reviews.push(newReview);
  console.log(
    `review create reviewId=${newReview._id} productId=${productId} userId=${req.user._id}`
  );
  res.status(201).json({
    success: true,
    message: "Review saved successfully",
    data: newReview,
  });
});

// GET /admin/reviews
app.get("/admin/reviews", adminMiddleware, (req, res) => {
  const { search } = req.query;
  let result = reviews.map(sanitizeAdminReview);
  if (search) {
    const keyword = search.toLowerCase();
    result = result.filter(
      (r) =>
        r.product.title.toLowerCase().includes(keyword) ||
        r.user.name.toLowerCase().includes(keyword) ||
        r.comment.toLowerCase().includes(keyword) ||
        r.moderationStatus.toLowerCase().includes(keyword)
    );
  }
  res.json({ success: true, data: result });
});

// GET /admin/review-hide?id=
app.get("/admin/review-hide", adminMiddleware, (req, res) => {
  const { id } = req.query;
  const review = reviews.find((r) => r._id === id);
  if (!review) {
    return res.status(404).json({ success: false, message: "Review not found" });
  }
  review.visible = false;
  review.hidden = true;
  review.moderationStatus = "hidden";
  review.moderatedAt = new Date().toISOString();
  review.moderatedBy = { _id: req.user._id, name: req.user.name };
  console.log(
    `review hide reviewId=${id} productId=${review.productId} adminId=${req.user._id}`
  );
  res.json({
    success: true,
    message: "Review hidden successfully",
    data: sanitizeAdminReview(review),
  });
});

// GET /admin/review-visibility?id=&visible=
app.get("/admin/review-visibility", adminMiddleware, (req, res) => {
  const { id, visible } = req.query;
  const review = reviews.find((r) => r._id === id);
  if (!review) {
    return res.status(404).json({ success: false, message: "Review not found" });
  }
  if (review.removed) {
    return res
      .status(400)
      .json({ success: false, message: "Cannot change visibility of a removed review" });
  }
  if (visible !== "true" && visible !== "false") {
    return res.status(400).json({ success: false, message: "Invalid visible value" });
  }
  const isVisible = visible === "true";
  review.visible = isVisible;
  review.hidden = !isVisible;
  review.moderationStatus = isVisible ? "visible" : "hidden";
  review.moderatedAt = new Date().toISOString();
  review.moderatedBy = { _id: req.user._id, name: req.user.name };
  console.log(
    `review visibility reviewId=${id} visible=${isVisible} adminId=${req.user._id}`
  );
  res.json({
    success: true,
    message: "Review visibility updated successfully",
    data: sanitizeAdminReview(review),
  });
});

// GET /admin/review-remove?id=
app.get("/admin/review-remove", adminMiddleware, (req, res) => {
  const { id } = req.query;
  const review = reviews.find((r) => r._id === id);
  if (!review) {
    return res.status(404).json({ success: false, message: "Review not found" });
  }
  review.removed = true;
  review.visible = false;
  review.hidden = true;
  review.moderationStatus = "removed";
  review.moderatedAt = new Date().toISOString();
  review.moderatedBy = { _id: req.user._id, name: req.user.name };
  console.log(
    `review remove reviewId=${id} productId=${review.productId} adminId=${req.user._id}`
  );
  res.json({
    success: true,
    message: "Review removed successfully",
    data: sanitizeAdminReview(review),
  });
});

// POST /photos/upload
app.post("/photos/upload", upload.single("photos"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: "No file uploaded" });
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
  // Return a simple SVG placeholder
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200">
    <rect width="200" height="200" fill="#e0e0e0"/>
    <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle"
      font-family="Arial" font-size="14" fill="#999">No Image</text>
  </svg>`;
  res.setHeader("Content-Type", "image/svg+xml");
  res.send(svg);
});

// ─── Start server ─────────────────────────────────────────────────────────────
app.listen(PORT, "0.0.0.0", () => {
  console.log(`\n🚀 EasyBuy Mock Server running at http://localhost:${PORT}`);
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
  console.log(`   GET    /orders               (user)`);
  console.log(`   POST   /checkout             (user)`);
  console.log(`   GET    /delete-user?id=`);
  console.log(`   POST   /reset-password?id=`);
  console.log(`   GET    /products/:productId/reviews`);
  console.log(`   GET    /products/:productId/my-review  (user)`);
  console.log(`   POST   /products/:productId/reviews      (user)`);
  console.log(`   GET    /admin/reviews                  (admin)`);
  console.log(`   GET    /admin/review-hide?id=          (admin)`);
  console.log(`   GET    /admin/review-visibility?id=&visible=  (admin)`);
  console.log(`   GET    /admin/review-remove?id=        (admin)`);
  console.log(`   POST   /photos/upload`);
  console.log(`   GET    /uploads/:filename`);
  console.log(`\n🔑 Test tokens:`);
  console.log(`   Admin token : mock-admin-token-001`);
  console.log(`   User token  : mock-user-token-001`);
  console.log(`\n👤 Test credentials:`);
  console.log(`   Admin  → email: admin@easybuy.com  | password: admin123`);
  console.log(`   User   → email: user@easybuy.com   | password: user123\n`);
});

// Made with Bob
