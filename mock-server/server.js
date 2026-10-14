const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

const app = express();
const PORT = 3002;
const REVIEW_TEXT_MAX = 500;

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
  {
    _id: "order004",
    orderId: "ORD-2024-004",
    user: {
      _id: "user002",
      name: "Jane Smith",
      email: "jane@easybuy.com",
    },
    items: [
      {
        productId: {
          _id: "prod007",
          title: "Organic Basmati Rice (5kg)",
        },
        price: 12.99,
        quantity: 1,
      },
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
    amount: 122.97,
    discount: 0,
    payment_type: "cod",
    country: "Canada",
    city: "Vancouver",
    zipcode: "V6B 1A1",
    shippingAddress: "456 Oak Avenue",
    status: "delivered",
    shippedOn: "2024-01-20",
    deliveredOn: "2024-01-22",
    createdAt: new Date("2024-01-19T08:00:00Z").toISOString(),
    updatedAt: new Date("2024-01-22T16:00:00Z").toISOString(),
  },
];

// ─── Reviews (verified purchaser ratings and reviews) ─────────────────────────
let reviews = [
  {
    _id: "rev001",
    product: "prod007",
    user: "user002",
    rating: 4,
    text: "Fluffy and fragrant, cooks evenly. Would buy again.",
    hidden: false,
    edited: false,
    postedAt: "2024-01-23T10:00:00.000Z",
  },
  {
    _id: "rev002",
    product: "prod001",
    user: "user002",
    rating: 3,
    text: "",
    hidden: false,
    edited: false,
    postedAt: "2024-01-23T11:00:00.000Z",
  },
  {
    _id: "rev003",
    product: "prod003",
    user: "user002",
    rating: 2,
    text: "Sound is fine but the ear cushions wore out within a week.",
    hidden: true,
    edited: false,
    postedAt: "2024-01-24T09:00:00.000Z",
  },
];

// ─── Review helpers ─────────────────────────────────────────────────────────────

// method to decide whether a customer may review a product (eligible | not_delivered | not_purchased)
const reviewEligibility = (userId, productId) => {
  const delivered = orders.some(
    (o) =>
      o.user._id === userId &&
      o.status === "delivered" &&
      o.items.some((i) => i.productId._id === productId)
  );
  if (delivered) return "eligible";
  const purchased = orders.some(
    (o) =>
      o.user._id === userId && o.items.some((i) => i.productId._id === productId)
  );
  return purchased ? "not_delivered" : "not_purchased";
};

// method to validate and normalize the rating/text submitted for a review
const parseReviewInput = (body) => {
  const rating = Number(body?.rating);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return { error: "Please select a star rating from 1 to 5" };
  }
  let text = body?.text;
  if (text === undefined || text === null) {
    text = "";
  } else if (typeof text !== "string") {
    return { error: "Review text must be plain text" };
  } else {
    text = text.trim();
  }
  if (text.length > REVIEW_TEXT_MAX) {
    return { error: "Review text must be 500 characters or fewer" };
  }
  return { rating, text };
};

// method to clamp paging query params the same way the backend does
const parsePaging = (query, defaultLimit) => {
  let limit = parseInt(query.limit, 10);
  if (!Number.isInteger(limit)) limit = defaultLimit;
  limit = Math.min(Math.max(limit, 1), 50);
  let skip = parseInt(query.skip, 10);
  if (!Number.isInteger(skip) || skip < 0) skip = 0;
  return { limit, skip };
};

// method to shape the average/count/distribution summary from a list of reviews
const buildSummary = (list) => {
  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let count = 0;
  let sum = 0;
  list.forEach((r) => {
    distribution[r.rating] += 1;
    count += 1;
    sum += r.rating;
  });
  return {
    average: count ? Math.round((sum / count) * 10) / 10 : null,
    count,
    distribution,
  };
};

const reviewerName = (userId) => {
  const user = users.find((u) => u._id === userId);
  return user?.name || "EasyBuy customer";
};

const toPublicReview = (r) => ({
  _id: r._id,
  rating: r.rating,
  text: r.text,
  edited: r.edited,
  postedAt: r.postedAt,
  reviewer: { name: reviewerName(r.user) },
});

const toOwnReview = (r) => ({
  ...toPublicReview(r),
  product: r.product,
  hidden: r.hidden,
});

const toAdminReview = (r) => {
  const product = products.find((p) => p._id === r.product);
  return {
    ...toPublicReview(r),
    hidden: r.hidden,
    product: { _id: r.product, title: product?.title || "Deleted product" },
    reviewer: { _id: r.user, name: reviewerName(r.user) },
  };
};

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
  reviews = reviews.filter((r) => r.product !== id);
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
  reviews = reviews.filter((r) => r.user !== id);
  const { password, token, ...safeUser } = deleted;
  res.json({ success: true, message: "Account deleted successfully", data: safeUser });
});

// GET /product-reviews?productId=&limit=&skip=
app.get("/product-reviews", (req, res) => {
  const { productId } = req.query;
  if (!productId) {
    return res.status(400).json({ success: false, message: "Invalid productId" });
  }
  const product = products.find((p) => p._id === productId);
  if (!product) {
    return res.status(404).json({ success: false, message: "Product not found" });
  }
  const { limit, skip } = parsePaging(req.query, 5);
  const visible = reviews.filter((r) => r.product === productId && !r.hidden);
  const written = visible.filter((r) => r.text !== "");
  const sorted = [...written].sort(
    (a, b) => new Date(b.postedAt) - new Date(a.postedAt)
  );
  const page = sorted.slice(skip, skip + limit);
  res.json({
    success: true,
    message: "product reviews",
    data: {
      summary: buildSummary(visible),
      reviews: page.map(toPublicReview),
      writtenCount: written.length,
    },
  });
});

// GET /my-review?productId=  (auth)
app.get("/my-review", authMiddleware, (req, res) => {
  const { productId } = req.query;
  if (!productId) {
    return res.status(400).json({ success: false, message: "Invalid productId" });
  }
  const eligibility = reviewEligibility(req.user._id, productId);
  const review = reviews.find(
    (r) => r.user === req.user._id && r.product === productId
  );
  res.json({
    success: true,
    message: "my review",
    data: { eligibility, review: review ? toOwnReview(review) : null },
  });
});

// POST /review  (auth)
app.post("/review", authMiddleware, (req, res) => {
  const { productId } = req.body;
  if (!productId) {
    return res.status(400).json({ success: false, message: "Invalid productId" });
  }
  const product = products.find((p) => p._id === productId);
  if (!product) {
    return res.status(404).json({ success: false, message: "Product not found" });
  }
  const parsed = parseReviewInput(req.body);
  if (parsed.error) {
    return res.status(400).json({ success: false, message: parsed.error });
  }
  const eligibility = reviewEligibility(req.user._id, productId);
  if (eligibility === "not_delivered") {
    return res.status(403).json({
      success: false,
      message: "You can review this product once your order is delivered",
    });
  }
  if (eligibility === "not_purchased") {
    return res.status(403).json({
      success: false,
      message: "Only customers who have received this product can review it",
    });
  }
  if (reviews.some((r) => r.user === req.user._id && r.product === productId)) {
    return res.status(409).json({
      success: false,
      message:
        "You have already reviewed this product. Edit your existing review instead",
    });
  }
  const review = {
    _id: uuidv4(),
    product: productId,
    user: req.user._id,
    rating: parsed.rating,
    text: parsed.text,
    hidden: false,
    edited: false,
    postedAt: new Date().toISOString(),
  };
  reviews.push(review);
  res.status(201).json({
    success: true,
    message: "Review submitted",
    data: toOwnReview(review),
  });
});

// POST /update-review?id=  (auth; only the author's own review matches)
app.post("/update-review", authMiddleware, (req, res) => {
  const { id } = req.query;
  if (!id) {
    return res.status(400).json({ success: false, message: "Invalid id" });
  }
  const review = reviews.find((r) => r._id === id && r.user === req.user._id);
  if (!review) {
    return res.status(404).json({ success: false, message: "Review not found" });
  }
  const parsed = parseReviewInput(req.body);
  if (parsed.error) {
    return res.status(400).json({ success: false, message: parsed.error });
  }
  const eligibility = reviewEligibility(req.user._id, review.product);
  if (eligibility === "not_delivered") {
    return res.status(403).json({
      success: false,
      message: "You can review this product once your order is delivered",
    });
  }
  if (eligibility === "not_purchased") {
    return res.status(403).json({
      success: false,
      message: "Only customers who have received this product can review it",
    });
  }
  review.rating = parsed.rating;
  review.text = parsed.text;
  review.edited = true;
  review.postedAt = new Date().toISOString();
  res.json({ success: true, message: "Review updated", data: toOwnReview(review) });
});

// GET /admin/reviews?visibility=all|visible|hidden&limit=&skip=  (admin)
app.get("/admin/reviews", adminMiddleware, (req, res) => {
  const visibility = req.query.visibility || "all";
  if (!["all", "visible", "hidden"].includes(visibility)) {
    return res.status(400).json({ success: false, message: "Invalid visibility" });
  }
  const { limit, skip } = parsePaging(req.query, 20);
  let filtered = reviews;
  if (visibility === "visible") filtered = reviews.filter((r) => !r.hidden);
  if (visibility === "hidden") filtered = reviews.filter((r) => r.hidden);
  const sorted = [...filtered].sort(
    (a, b) => new Date(b.postedAt) - new Date(a.postedAt)
  );
  const page = sorted.slice(skip, skip + limit);
  res.json({
    success: true,
    message: "all reviews",
    data: { reviews: page.map(toAdminReview), total: filtered.length },
  });
});

// POST /admin/review-visibility?id=&hidden=true|false  (admin)
app.post("/admin/review-visibility", adminMiddleware, (req, res) => {
  const { id } = req.query;
  if (!id) {
    return res.status(400).json({ success: false, message: "Invalid id" });
  }
  if (req.query.hidden !== "true" && req.query.hidden !== "false") {
    return res.status(400).json({ success: false, message: "Invalid hidden value" });
  }
  const review = reviews.find((r) => r._id === id);
  if (!review) {
    return res.status(404).json({ success: false, message: "Review not found" });
  }
  review.hidden = req.query.hidden === "true";
  res.json({
    success: true,
    message: review.hidden ? "Review hidden" : "Review visible",
    data: toAdminReview(review),
  });
});

// POST /admin/delete-review?id=  (admin)
app.post("/admin/delete-review", adminMiddleware, (req, res) => {
  const { id } = req.query;
  if (!id) {
    return res.status(400).json({ success: false, message: "Invalid id" });
  }
  const idx = reviews.findIndex((r) => r._id === id);
  if (idx === -1) {
    return res.status(404).json({ success: false, message: "Review not found" });
  }
  reviews.splice(idx, 1);
  res.json({ success: true, message: "Review removed" });
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
// Guarded so `require("./server")` (used by the review HTTP tests) can import
// `app` without also binding the port.
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
    console.log(`   POST   /photos/upload`);
    console.log(`   GET    /uploads/:filename`);
    console.log(`   GET    /product-reviews?productId=&limit=&skip=`);
    console.log(`   GET    /my-review?productId=                 (user)`);
    console.log(`   POST   /review                                (user)`);
    console.log(`   POST   /update-review?id=                     (user)`);
    console.log(`   GET    /admin/reviews?visibility=&limit=&skip= (admin)`);
    console.log(`   POST   /admin/review-visibility?id=&hidden=    (admin)`);
    console.log(`   POST   /admin/delete-review?id=                (admin)`);
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
