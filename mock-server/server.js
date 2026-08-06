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

// ─── Review rules ─────────────────────────────────────────────────────────────
// Comments are capped server-side; anything longer is truncated, not rejected.
const REVIEW_COMMENT_MAX_LENGTH = 500;
// Which order statuses count as a verified purchase. Override per environment
// with REVIEWS_VERIFIED_PURCHASE_STATUSES (comma-separated) — e.g. "delivered"
// to require delivery before a shopper may review.
const DEFAULT_VERIFIED_PURCHASE_STATUSES = ["pending", "shipped", "delivered"];
const parseStatuses = (raw) =>
  String(raw || "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
const configuredStatuses = parseStatuses(
  process.env.REVIEWS_VERIFIED_PURCHASE_STATUSES
);
const VERIFIED_PURCHASE_STATUSES = configuredStatuses.length
  ? configuredStatuses
  : DEFAULT_VERIFIED_PURCHASE_STATUSES;
// Log the rule in force so any environment can be audited from its own output.
console.log(
  `[reviews] event=config verifiedPurchaseStatuses=${VERIFIED_PURCHASE_STATUSES.join(",")}`
);

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

// Seeded product reviews. prod002, prod004, prod006 and prod008 are left
// without reviews so the "no reviews yet" state is always demonstrable, and
// rev007 is hidden so excluding it from the aggregate is demonstrable too.
let reviews = [
  {
    _id: "rev001",
    product: { _id: "prod001", title: "Classic White T-Shirt" },
    user: { _id: "user001", name: "John Doe" },
    rating: 5,
    comment: "Fits exactly as described and the cotton is genuinely soft.",
    isVisible: true,
    verifiedPurchase: true,
    createdAt: new Date("2024-02-01T10:00:00Z").toISOString(),
    updatedAt: new Date("2024-02-01T10:00:00Z").toISOString(),
  },
  {
    _id: "rev002",
    product: { _id: "prod001", title: "Classic White T-Shirt" },
    user: { _id: "seed-user-001", name: "Amara Osei" },
    rating: 4,
    comment: "Good everyday shirt, though it shrank slightly after washing.",
    isVisible: true,
    verifiedPurchase: true,
    createdAt: new Date("2024-02-02T08:30:00Z").toISOString(),
    updatedAt: new Date("2024-02-02T08:30:00Z").toISOString(),
  },
  {
    _id: "rev003",
    product: { _id: "prod001", title: "Classic White T-Shirt" },
    user: { _id: "seed-user-002", name: "Tom Becker" },
    rating: 4,
    comment: "",
    isVisible: true,
    verifiedPurchase: true,
    createdAt: new Date("2024-02-03T17:45:00Z").toISOString(),
    updatedAt: new Date("2024-02-03T17:45:00Z").toISOString(),
  },
  {
    _id: "rev004",
    product: { _id: "prod003", title: "Wireless Bluetooth Headphones" },
    user: { _id: "seed-user-003", name: "Marco Silva" },
    rating: 5,
    comment: "Battery lasts all week and the noise cancelling is excellent.",
    isVisible: true,
    verifiedPurchase: true,
    createdAt: new Date("2024-02-04T09:12:00Z").toISOString(),
    updatedAt: new Date("2024-02-04T09:12:00Z").toISOString(),
  },
  {
    _id: "rev005",
    product: { _id: "prod003", title: "Wireless Bluetooth Headphones" },
    user: { _id: "seed-user-004", name: "Lena Fischer" },
    rating: 4,
    comment: "Great sound, but the case is bulkier than I expected.",
    isVisible: true,
    verifiedPurchase: true,
    createdAt: new Date("2024-02-05T13:20:00Z").toISOString(),
    updatedAt: new Date("2024-02-05T13:20:00Z").toISOString(),
  },
  {
    _id: "rev006",
    product: { _id: "prod003", title: "Wireless Bluetooth Headphones" },
    user: { _id: "seed-user-005", name: "Ravi Anand" },
    rating: 3,
    comment: "Comfortable enough, but the app pairing was fiddly.",
    isVisible: true,
    verifiedPurchase: true,
    createdAt: new Date("2024-02-05T18:05:00Z").toISOString(),
    updatedAt: new Date("2024-02-05T18:05:00Z").toISOString(),
  },
  {
    _id: "rev007",
    product: { _id: "prod003", title: "Wireless Bluetooth Headphones" },
    user: { _id: "seed-user-006", name: "Priya Nair" },
    rating: 1,
    comment: "Arrived broken.",
    isVisible: false,
    verifiedPurchase: true,
    createdAt: new Date("2024-02-06T11:00:00Z").toISOString(),
    updatedAt: new Date("2024-02-06T11:00:00Z").toISOString(),
  },
  {
    _id: "rev008",
    product: { _id: "prod005", title: "Face Moisturizer SPF 30" },
    user: { _id: "user002", name: "Jane Smith" },
    rating: 5,
    comment: "Light on the skin and no white cast under makeup.",
    isVisible: true,
    verifiedPurchase: true,
    createdAt: new Date("2024-02-07T07:40:00Z").toISOString(),
    updatedAt: new Date("2024-02-07T07:40:00Z").toISOString(),
  },
  {
    _id: "rev009",
    product: { _id: "prod005", title: "Face Moisturizer SPF 30" },
    user: { _id: "seed-user-007", name: "Chloe Martin" },
    rating: 4,
    comment: "Does the job daily, wish the bottle were bigger.",
    isVisible: true,
    verifiedPurchase: true,
    createdAt: new Date("2024-02-08T15:15:00Z").toISOString(),
    updatedAt: new Date("2024-02-08T15:15:00Z").toISOString(),
  },
  {
    _id: "rev010",
    product: { _id: "prod007", title: "Organic Basmati Rice (5kg)" },
    user: { _id: "seed-user-008", name: "Sofia Rossi" },
    rating: 3,
    comment: "Cooks well but a few grains were broken in the bag.",
    isVisible: true,
    verifiedPurchase: true,
    createdAt: new Date("2024-02-09T12:00:00Z").toISOString(),
    updatedAt: new Date("2024-02-09T12:00:00Z").toISOString(),
  },
];

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

// ─── Review helpers ───────────────────────────────────────────────────────────

// True when the user has an order in a qualifying status containing the product.
const hasPurchased = (userId, productId) =>
  orders.some(
    (order) =>
      order.user._id === userId &&
      VERIFIED_PURCHASE_STATUSES.includes(order.status) &&
      order.items.some((item) => item.productId._id === productId)
  );

// Shopper-facing reviews for one product: visible only, newest first.
const visibleReviewsFor = (productId) =>
  reviews
    .filter((review) => review.product._id === productId && review.isVisible === true)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

// The one place the aggregate is computed, so hiding a review always changes it.
// average is null (never 0) when there is nothing visible to average.
const aggregateFor = (productId) => {
  const visible = visibleReviewsFor(productId);
  const count = visible.length;
  if (count === 0) {
    return { average: null, count: 0 };
  }
  const sum = visible.reduce((total, review) => total + review.rating, 0);
  return { average: Math.round((sum / count) * 10) / 10, count };
};

// Store comments as plain, bounded text: no control characters, no runs of
// whitespace, trimmed, and never longer than the cap.
const sanitizeComment = (raw) => {
  if (raw === null || raw === undefined) return "";
  return String(raw)
    .split("")
    .map((char) => {
      const code = char.charCodeAt(0);
      return code < 32 || code === 127 ? " " : char;
    })
    .join("")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, REVIEW_COMMENT_MAX_LENGTH);
};

// The upsert key lookup — matches hidden reviews too, so an author can never
// end up with two reviews on one product.
const findReviewByAuthor = (userId, productId) =>
  reviews.find(
    (review) => review.user._id === userId && review.product._id === productId
  );

// Resolve the caller when a token happens to be present, without requiring one.
const resolveOptionalUser = (req) =>
  users.find((u) => u.token === req.headers["x-auth-token"]) || null;

// Public projection: an explicit whitelist, never a spread of the stored record,
// so no email, address or order reference can leak into public content.
const toPublicReview = (review) => ({
  _id: review._id,
  productId: review.product._id,
  rating: review.rating,
  comment: review.comment,
  verifiedPurchase: review.verifiedPurchase,
  createdAt: review.createdAt,
  updatedAt: review.updatedAt,
  user: { _id: review.user._id, name: review.user.name },
});

// Admin projection: the public fields plus moderation state and product title.
const toAdminReview = (review) => ({
  ...toPublicReview(review),
  isVisible: review.isVisible,
  product: { _id: review.product._id, title: review.product.title },
});

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
  // Drop this product's reviews too, so the admin list never shows orphans.
  reviews = reviews.filter((review) => review.product._id !== id);
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
      reviewsCount: reviews.length,
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

// GET /reviews?productId=  (public: aggregate + visible reviews + viewer context)
app.get("/reviews", (req, res) => {
  const { productId } = req.query;
  if (!productId) {
    return res.status(400).json({ success: false, message: "productId is required" });
  }
  if (!products.some((p) => p._id === productId)) {
    return res.status(404).json({ success: false, message: "Product not found" });
  }
  const { average, count } = aggregateFor(productId);
  const user = resolveOptionalUser(req);
  let viewer = {
    isAuthenticated: false,
    hasPurchased: false,
    canReview: false,
    myReview: null,
  };
  if (user) {
    const purchased = hasPurchased(user._id, productId);
    const myReview = findReviewByAuthor(user._id, productId);
    viewer = {
      isAuthenticated: true,
      hasPurchased: purchased,
      canReview: purchased,
      // The author sees their own review even when an admin has hidden it, so
      // their one-per-product slot is never a silent dead end.
      myReview: myReview ? toAdminReview(myReview) : null,
    };
  }
  res.json({
    success: true,
    data: {
      productId,
      average,
      count,
      reviews: visibleReviewsFor(productId).map(toPublicReview),
      viewer,
    },
  });
});

// POST /review  (user: upsert own review for a product)
app.post("/review", authMiddleware, (req, res) => {
  // Only these three fields are read; user, verifiedPurchase and isVisible are
  // decided by the server so a client cannot claim them.
  const { productId, rating, comment } = req.body;
  if (!productId) {
    return res.status(400).json({ success: false, message: "productId is required" });
  }
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return res
      .status(400)
      .json({ success: false, message: "Rating must be a whole number between 1 and 5" });
  }
  const product = products.find((p) => p._id === productId);
  if (!product) {
    return res.status(404).json({ success: false, message: "Product not found" });
  }
  if (!hasPurchased(req.user._id, productId)) {
    console.log(
      `[reviews] event=upsert-rejected reason=not-verified-purchaser userId=${req.user._id} productId=${productId}`
    );
    return res
      .status(403)
      .json({ success: false, message: "Only verified purchasers can review this product" });
  }
  const now = new Date().toISOString();
  const existing = findReviewByAuthor(req.user._id, productId);
  if (existing) {
    // An author's edit must never un-hide a review an admin has hidden.
    existing.rating = rating;
    existing.comment = sanitizeComment(comment);
    existing.verifiedPurchase = hasPurchased(req.user._id, productId);
    existing.updatedAt = now;
    console.log(
      `[reviews] event=upsert mode=updated reviewId=${existing._id} productId=${productId} rating=${rating} userId=${req.user._id}`
    );
    return res.json({
      success: true,
      message: "Review updated successfully",
      data: toPublicReview(existing),
    });
  }
  const newReview = {
    _id: uuidv4(),
    product: { _id: product._id, title: product.title },
    user: { _id: req.user._id, name: req.user.name },
    rating,
    comment: sanitizeComment(comment),
    isVisible: true,
    verifiedPurchase: hasPurchased(req.user._id, product._id),
    createdAt: now,
    updatedAt: now,
  };
  reviews.push(newReview);
  console.log(
    `[reviews] event=upsert mode=created reviewId=${newReview._id} productId=${productId} rating=${rating} userId=${req.user._id}`
  );
  res.json({
    success: true,
    message: "Review submitted successfully",
    data: toPublicReview(newReview),
  });
});

// GET /delete-review?id=  (user: remove own review; admins hide instead)
app.get("/delete-review", authMiddleware, (req, res) => {
  const { id } = req.query;
  const idx = reviews.findIndex((review) => review._id === id);
  if (idx === -1) {
    return res.status(404).json({ success: false, message: "Review not found" });
  }
  if (reviews[idx].user._id !== req.user._id) {
    return res
      .status(403)
      .json({ success: false, message: "You can only remove your own review" });
  }
  reviews.splice(idx, 1);
  res.json({ success: true, message: "Review removed successfully" });
});

// GET /admin/reviews  (admin: every review, newest first)
app.get("/admin/reviews", adminMiddleware, (req, res) => {
  const allReviews = reviews
    .slice()
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .map(toAdminReview);
  res.json({ success: true, data: allReviews });
});

// GET /admin/review-visibility?reviewId=&visible=  (admin: hide / unhide)
app.get("/admin/review-visibility", adminMiddleware, (req, res) => {
  const { reviewId, visible } = req.query;
  if (visible !== "true" && visible !== "false") {
    return res.status(400).json({ success: false, message: "visible must be true or false" });
  }
  const review = reviews.find((r) => r._id === reviewId);
  if (!review) {
    return res.status(404).json({ success: false, message: "Review not found" });
  }
  // capture the prior value first so a hide is distinguishable from an unhide
  // without correlating adjacent lines
  const previous = review.isVisible;
  review.isVisible = visible === "true";
  review.updatedAt = new Date().toISOString();
  console.log(
    `[reviews] event=visibility-change reviewId=${review._id} from=${previous} to=${review.isVisible} adminId=${req.user._id} at=${review.updatedAt}`
  );
  res.json({
    success: true,
    message: review.isVisible ? "Review shown" : "Review hidden",
    data: toAdminReview(review),
  });
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
  console.log(`   GET    /reviews?productId=`);
  console.log(`   POST   /review               (user)`);
  console.log(`   GET    /delete-review?id=    (user)`);
  console.log(`   GET    /admin/reviews        (admin)`);
  console.log(`   GET    /admin/review-visibility?reviewId=&visible=  (admin)`);
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
});

// Made with Bob
