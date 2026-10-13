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
    _id: "rev001",
    productId: "prod001",
    productTitle: "Classic White T-Shirt",
    user: {
      _id: "user001",
      name: "John Doe"
    },
    rating: 5,
    comment: "Incredible quality and fit!",
    visible: true,
    editedAt: null,
    createdAt: "2026-08-21T12:00:00Z",
    updatedAt: "2026-08-21T12:00:00Z"
  },
  {
    _id: "rev002",
    productId: "prod003",
    productTitle: "Wireless Bluetooth Headphones",
    user: {
      _id: "user002",
      name: "Jane Smith"
    },
    rating: 4,
    comment: "Pretty good sound, battery life is amazing.",
    visible: true,
    editedAt: null,
    createdAt: "2026-08-21T13:00:00Z",
    updatedAt: "2026-08-21T13:00:00Z"
  }
];

// ─── Review helpers (mirrors backend src/utils/reviewRules.js) ────────────────
const MAX_COMMENT_LENGTH = 500;
const RECENT_REVIEWS_LIMIT = 5;

function formatReviewerName(fullName) {
  if (!fullName) return "Anonymous";
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return parts[0];
  const firstName = parts[0];
  const lastInitial = parts[parts.length - 1][0];
  return `${firstName} ${lastInitial}.`;
}

function validateReviewInput({ rating, comment }) {
  if (typeof rating === "boolean" || Array.isArray(rating) || (typeof rating === "object" && rating !== null)) {
    return { error: "Rating must be an integer between 1 and 5" };
  }
  const numericRating = Number(rating);
  if (
    rating === undefined ||
    rating === null ||
    rating === "" ||
    !Number.isInteger(numericRating) ||
    numericRating < 1 ||
    numericRating > 5
  ) {
    return { error: "Rating must be an integer between 1 and 5" };
  }

  let normalizedComment = comment;
  if (normalizedComment === undefined || normalizedComment === null) {
    normalizedComment = "";
  } else if (typeof normalizedComment !== "string") {
    return { error: "Comment must be text" };
  } else {
    normalizedComment = normalizedComment.trim();
  }
  if (normalizedComment.length > MAX_COMMENT_LENGTH) {
    return { error: `Comment must be at most ${MAX_COMMENT_LENGTH} characters` };
  }

  return { rating: numericRating, comment: normalizedComment };
}

function buildRatingSummary(list) {
  const distribution = { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 };
  let totalCount = 0;
  let ratingSum = 0;
  for (const r of list) {
    distribution[String(r.rating)] = (distribution[String(r.rating)] || 0) + 1;
    totalCount += 1;
    ratingSum += r.rating;
  }
  const averageRating = totalCount ? parseFloat((ratingSum / totalCount).toFixed(1)) : 0;
  return { averageRating, totalCount, distribution };
}

function toPublicReview(r) {
  return {
    _id: r._id,
    rating: r.rating,
    comment: r.comment || "",
    createdAt: r.createdAt,
    edited: Boolean(r.editedAt),
    verifiedPurchase: true,
    user: { name: formatReviewerName(r.user?.name) },
  };
}

function toOwnReview(r) {
  return { ...toPublicReview(r), visible: r.visible };
}

function toAdminReview(r) {
  return {
    _id: r._id,
    productId: r.productId,
    productTitle: r.productTitle,
    user: { _id: r.user?._id, name: r.user?.name },
    rating: r.rating,
    comment: r.comment || "",
    visible: r.visible,
    edited: Boolean(r.editedAt),
    editedAt: r.editedAt || null,
    verifiedPurchase: true,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  };
}

function getUserFromToken(req) {
  const token = req.headers["x-auth-token"];
  if (!token) return null;
  return users.find((u) => u.token === token) || null;
}

function isEligibleFor(userId, productId) {
  return orders.some(
    (o) =>
      o.user._id === userId &&
      o.status === "delivered" &&
      o.items.some((item) => item.productId._id === productId)
  );
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

// ─── Reviews Endpoints ────────────────────────────────────────────────────────
app.get("/products/:id/reviews", (req, res) => {
  const { id } = req.params;

  const productExists = products.some((p) => p._id === id);
  if (!productExists) {
    return res.status(404).json({ success: false, message: "Product not found" });
  }

  const visibleReviews = reviews.filter((r) => r.productId === id && r.visible === true);
  const summary = buildRatingSummary(visibleReviews);

  const sortedReviews = [...visibleReviews].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const recent = sortedReviews.slice(0, RECENT_REVIEWS_LIMIT).map(toPublicReview);

  let isEligible = false;
  let hasReviewed = false;
  let myReview = null;

  const user = getUserFromToken(req);
  if (user) {
    isEligible = isEligibleFor(user._id, id);
    const mine = reviews.find((r) => r.productId === id && r.user._id === user._id);
    hasReviewed = Boolean(mine);
    myReview = mine ? toOwnReview(mine) : null;
  }

  res.json({
    success: true,
    reviews: recent,
    ...summary,
    isEligible,
    hasReviewed,
    myReview,
  });
});

app.post("/reviews", authMiddleware, (req, res) => {
  const { productId, rating, comment } = req.body;

  if (!productId || rating === undefined) {
    return res.status(400).json({ success: false, message: "productId and rating are required" });
  }

  const validated = validateReviewInput({ rating, comment });
  if (validated.error) {
    return res.status(400).json({ success: false, message: validated.error });
  }

  const product = products.find((p) => p._id === productId);
  if (!product) {
    return res.status(404).json({ success: false, message: "Product not found" });
  }

  const isEligible = isEligibleFor(req.user._id, productId);
  if (!isEligible) {
    console.log("review.create_rejected", { productId, userId: req.user._id, reason: "not_eligible" });
    return res.status(403).json({ success: false, message: "You are not eligible to review this product" });
  }

  const hasReviewed = reviews.some((r) => r.productId === productId && r.user._id === req.user._id);
  if (hasReviewed) {
    console.log("review.create_rejected", { productId, userId: req.user._id, reason: "duplicate" });
    return res.status(409).json({
      success: false,
      message: "You have already reviewed this product. Edit your existing review instead.",
    });
  }

  const now = new Date().toISOString();
  const newReview = {
    _id: `rev-${uuidv4()}`,
    productId,
    productTitle: product.title,
    user: {
      _id: req.user._id,
      name: req.user.name,
    },
    rating: validated.rating,
    comment: validated.comment,
    visible: true,
    editedAt: null,
    createdAt: now,
    updatedAt: now,
  };

  reviews.push(newReview);
  console.log("review.created", { reviewId: newReview._id, productId, userId: req.user._id, rating: newReview.rating });

  res.json({ success: true, message: "Review submitted successfully", data: toOwnReview(newReview) });
});

app.post("/reviews/:id/update", authMiddleware, (req, res) => {
  const { id } = req.params;
  const { rating, comment } = req.body;

  const review = reviews.find((r) => r._id === id);
  if (!review) {
    return res.status(404).json({ success: false, message: "Review not found" });
  }

  if (review.user._id !== req.user._id) {
    return res.status(403).json({ success: false, message: "You can only edit your own review" });
  }

  const validated = validateReviewInput({ rating, comment });
  if (validated.error) {
    return res.status(400).json({ success: false, message: validated.error });
  }

  const wasVisible = review.visible;
  review.rating = validated.rating;
  review.comment = validated.comment;
  review.editedAt = new Date().toISOString();
  review.updatedAt = review.editedAt;

  console.log("review.updated", { reviewId: review._id, productId: review.productId, userId: req.user._id, rating: review.rating, wasVisible });

  res.json({ success: true, message: "Review updated successfully", data: toOwnReview(review) });
});

app.get("/admin/reviews", adminMiddleware, (req, res) => {
  const sorted = [...reviews].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json({ success: true, message: "all reviews", data: sorted.map(toAdminReview) });
});

app.post("/admin/reviews/:id/visibility", adminMiddleware, (req, res) => {
  const { id } = req.params;
  const { visible } = req.body;

  if (typeof visible !== "boolean") {
    return res.status(400).json({ success: false, message: "visible must be a boolean" });
  }

  const review = reviews.find((r) => r._id === id);
  if (!review) {
    return res.status(404).json({ success: false, message: "Review not found" });
  }

  review.visible = visible;
  console.log("review.visibility_changed", { reviewId: id, adminId: req.user._id, visible });

  res.json({ success: true, message: "Visibility updated successfully", data: toAdminReview(review) });
});

app.post("/admin/reviews/:id/delete", adminMiddleware, (req, res) => {
  const { id } = req.params;

  const reviewIndex = reviews.findIndex((r) => r._id === id);
  if (reviewIndex === -1) {
    return res.status(404).json({ success: false, message: "Review not found" });
  }

  reviews.splice(reviewIndex, 1);
  console.log("review.deleted", { reviewId: id, adminId: req.user._id });

  res.json({ success: true, message: "Review deleted successfully" });
});

// ─── Start server ─────────────────────────────────────────────────────────────
if (require.main === module) {
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
    console.log(`   GET    /products/:id/reviews`);
    console.log(`   POST   /reviews              (user)`);
    console.log(`   POST   /reviews/:id/update   (user)`);
    console.log(`   GET    /admin/reviews        (admin)`);
    console.log(`   POST   /admin/reviews/:id/visibility  (admin)`);
    console.log(`   POST   /admin/reviews/:id/delete      (admin)`);
    console.log(`   POST   /photos/upload`);
    console.log(`   GET    /uploads/:filename`);
    console.log(`\n🔑 Test tokens:`);
    console.log(`   Admin token : mock-admin-token-001`);
    console.log(`   User token  : mock-user-token-001`);
    console.log(`\n👤 Test credentials:`);
    console.log(`   Admin  → email: admin@easybuy.com  | password: admin123`);
    console.log(`   User   → email: user@easybuy.com   | password: user123\n`);
  });
}

module.exports = app;

// Made with Bob
