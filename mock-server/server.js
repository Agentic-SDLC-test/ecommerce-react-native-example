const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const { withPaymentDefaults, validatePaymentFields } = require("./payment");
const {
  REVIEW_VISIBILITIES,
  validateReviewSubmission,
  resolveEligibility,
  summarizeReviews,
  publicReview,
  adminReview,
  isReviewsEnabled,
} = require("./reviews");

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
    payment_status: "due_on_delivery",
    payment_reference: null,
    payment_status_updated_at: new Date("2024-01-15T10:30:00Z").toISOString(),
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
    payment_status: "due_on_delivery",
    payment_reference: null,
    payment_status_updated_at: new Date("2024-01-16T14:00:00Z").toISOString(),
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
    payment_status: "due_on_delivery",
    payment_reference: null,
    payment_status_updated_at: new Date("2024-01-09T08:00:00Z").toISOString(),
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
  // A paid card order, so a preview shows both payment states without having to
  // place one first. Fulfilment is still pending — paid does not mean shipped.
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
          _id: "prod004",
          title: "Smartphone Stand",
        },
        price: 14.99,
        quantity: 1,
      },
    ],
    amount: 14.99,
    discount: 0,
    payment_type: "card",
    payment_status: "paid",
    payment_reference: "SIMPAY-1705400000000-DEMO",
    payment_status_updated_at: new Date("2024-01-16T11:15:00Z").toISOString(),
    country: "Canada",
    city: "Toronto",
    zipcode: "M5V 3A8",
    shippingAddress: "123 Main Street",
    status: "pending",
    createdAt: new Date("2024-01-16T11:15:00Z").toISOString(),
    updatedAt: new Date("2024-01-16T11:15:00Z").toISOString(),
  },
  // Two delivered orders that make the seeded reviews below consistent with the
  // eligibility rule: a review only exists where its author took delivery.
  {
    _id: "order005",
    orderId: "ORD-2024-005",
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
    payment_type: "cod",
    payment_status: "due_on_delivery",
    payment_reference: null,
    payment_status_updated_at: new Date("2024-01-05T09:00:00Z").toISOString(),
    country: "Canada",
    city: "Toronto",
    zipcode: "M5V 3A8",
    shippingAddress: "123 Main Street",
    status: "delivered",
    shippedOn: "2024-01-06",
    deliveredOn: "2024-01-08",
    createdAt: new Date("2024-01-05T09:00:00Z").toISOString(),
    updatedAt: new Date("2024-01-08T15:00:00Z").toISOString(),
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
    payment_type: "card",
    payment_status: "paid",
    payment_reference: "SIMPAY-1704700000000-SEED",
    payment_status_updated_at: new Date("2024-01-04T10:00:00Z").toISOString(),
    country: "Canada",
    city: "Vancouver",
    zipcode: "V6B 1A1",
    shippingAddress: "456 Oak Avenue",
    status: "delivered",
    shippedOn: "2024-01-05",
    deliveredOn: "2024-01-07",
    createdAt: new Date("2024-01-04T10:00:00Z").toISOString(),
    updatedAt: new Date("2024-01-07T12:00:00Z").toISOString(),
  },
];

// Reviews hold no order reference and no email — eligibility is derived from
// orders at request time, so there is no foreign key for a moderation action to
// disturb and no order detail for a shopper-facing payload to leak.
//
// Seeded so a preview shows every state without having to place an order and
// wait for delivery first: prod001 has two visible reviews (one rating-only),
// prod003 has one visible and one hidden review so the hidden row can be seen
// excluded from the average, prod007 carries an editable review by the seeded
// shopper, and prod005 and the rest stay review-free so the empty state is
// visible in the same session. Data resets when the server restarts.
let reviews = [
  {
    _id: "rev001",
    productId: "prod001",
    user: { _id: "user001", name: "John Doe" },
    reviewer_name: "John Doe",
    rating: 5,
    text: "Fits well and the cotton is genuinely soft.",
    verified_purchase: true,
    visibility: "visible",
    moderated_by: null,
    moderated_at: null,
    moderation_action: null,
    createdAt: new Date("2024-01-20T09:00:00Z").toISOString(),
    updatedAt: new Date("2024-01-20T09:00:00Z").toISOString(),
  },
  {
    _id: "rev002",
    productId: "prod001",
    user: { _id: "user002", name: "Jane Smith" },
    reviewer_name: "Jane Smith",
    rating: 3,
    text: "",
    verified_purchase: true,
    visibility: "visible",
    moderated_by: null,
    moderated_at: null,
    moderation_action: null,
    createdAt: new Date("2024-01-21T11:30:00Z").toISOString(),
    updatedAt: new Date("2024-01-21T11:30:00Z").toISOString(),
  },
  {
    _id: "rev003",
    productId: "prod003",
    user: { _id: "user002", name: "Jane Smith" },
    reviewer_name: "Jane Smith",
    rating: 4,
    text: "Great sound, the case is bulkier than I expected.",
    verified_purchase: true,
    visibility: "visible",
    moderated_by: null,
    moderated_at: null,
    moderation_action: null,
    createdAt: new Date("2024-01-24T16:45:00Z").toISOString(),
    updatedAt: new Date("2024-01-24T16:45:00Z").toISOString(),
  },
  {
    _id: "rev004",
    productId: "prod003",
    user: { _id: "user001", name: "John Doe" },
    reviewer_name: "John Doe",
    rating: 2,
    text: "Battery life was worse than advertised.",
    verified_purchase: true,
    visibility: "hidden",
    moderated_by: "admin001",
    moderated_at: new Date("2024-02-01T12:00:00Z").toISOString(),
    moderation_action: "hide",
    createdAt: new Date("2024-01-25T08:00:00Z").toISOString(),
    updatedAt: new Date("2024-01-25T08:00:00Z").toISOString(),
  },
  {
    _id: "rev005",
    productId: "prod007",
    user: { _id: "user001", name: "John Doe" },
    reviewer_name: "John Doe",
    rating: 5,
    text: "Cooks evenly and smells wonderful.",
    verified_purchase: true,
    visibility: "visible",
    moderated_by: null,
    moderated_at: null,
    moderation_action: null,
    createdAt: new Date("2024-01-26T18:20:00Z").toISOString(),
    updatedAt: new Date("2024-01-26T18:20:00Z").toISOString(),
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

// The instant kill switch. REVIEWS_ENABLED=false cuts every review endpoint in
// seconds with no app release — the app renders the 503 as the neutral
// unavailable state, so the product page keeps working.
const reviewsEnabledMiddleware = (req, res, next) => {
  if (!isReviewsEnabled(process.env)) {
    console.log("[reviews] disabled_request", JSON.stringify({ path: req.path }));
    return res.status(503).json({
      success: false,
      reviews_disabled: true,
      message: "Reviews are unavailable",
    });
  }
  next();
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
      reviewsCount: reviews.length,
      hiddenReviewsCount: reviews.filter((r) => r.visibility === "hidden").length,
    },
  });
});

// GET /admin/orders  (admin: all orders)
app.get("/admin/orders", adminMiddleware, (req, res) => {
  res.json({ success: true, data: orders.map(withPaymentDefaults) });
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
  // Fulfilment only. Payment fields are intentionally untouched here — advancing
  // an order to shipped must never make it paid, and paid is set only at checkout.
  order.status = status;
  order.updatedAt = new Date().toISOString();
  if (status === "shipped") order.shippedOn = new Date().toISOString().split("T")[0];
  if (status === "delivered") order.deliveredOn = new Date().toISOString().split("T")[0];
  res.json({
    success: true,
    message: `Order status updated to ${status}`,
    data: withPaymentDefaults(order),
  });
});

// GET /orders  (user: their own orders)
app.get("/orders", authMiddleware, (req, res) => {
  const userOrders = orders.filter((o) => o.user._id === req.user._id);
  res.json({ success: true, data: userOrders.map(withPaymentDefaults) });
});

// POST /checkout  (user: place order)
app.post("/checkout", authMiddleware, (req, res) => {
  const { items, amount, discount, payment_type, payment_status, payment_reference, country, city, zipcode, shippingAddress, status } = req.body;
  if (!items || items.length === 0) {
    return res.status(400).json({ success: false, message: "Cart is empty" });
  }
  // Omitting the payment fields keeps the pre-change behaviour: cash on delivery,
  // due on delivery.
  const paymentType = payment_type || "cod";
  const paymentStatus = payment_status || "due_on_delivery";
  const paymentReference = payment_reference || null;
  const paymentCheck = validatePaymentFields({
    payment_type: paymentType,
    payment_status: paymentStatus,
    payment_reference: paymentReference,
  });
  if (!paymentCheck.valid) {
    console.log(
      "[payment] checkout_rejected",
      JSON.stringify({
        payment_type: paymentType,
        payment_status: paymentStatus,
        message: paymentCheck.message,
      })
    );
    return res.status(400).json({ success: false, message: paymentCheck.message });
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
    payment_type: paymentType,
    payment_status: paymentStatus,
    payment_reference: paymentReference,
    payment_status_updated_at: new Date().toISOString(),
    country: country || "",
    city: city || "",
    zipcode: zipcode || "",
    shippingAddress: shippingAddress || "",
    status: status || "pending",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  orders.push(newOrder);
  console.log(
    "[payment] checkout",
    JSON.stringify({
      orderId: newOrder.orderId,
      payment_type: newOrder.payment_type,
      payment_status: newOrder.payment_status,
      has_reference: Boolean(newOrder.payment_reference),
    })
  );
  res.json({
    success: true,
    message: "Order placed successfully",
    data: withPaymentDefaults(newOrder),
  });
});

// ─── Reviews ──────────────────────────────────────────────────────────────────
// Shopper reads are public and visible-only; eligibility and writes are derived
// from the caller's own token; moderation is admin-only. Review visibility is a
// third independent axis — nothing here reads or writes an order.

const DEFAULT_REVIEWS_PAGE_SIZE = 5;
const MAX_REVIEWS_PAGE_SIZE = 50;

const newestFirst = (a, b) => new Date(b.createdAt) - new Date(a.createdAt);

const reviewsFor = (productId) =>
  reviews.filter((r) => r.productId === productId);

const visibleReviewsFor = (productId) =>
  reviewsFor(productId).filter((r) => r.visibility === REVIEW_VISIBILITIES.VISIBLE);

// GET /product-reviews?productId=&limit=&offset=   (public)
app.get("/product-reviews", reviewsEnabledMiddleware, (req, res) => {
  const { productId } = req.query;
  if (!productId) {
    return res.status(400).json({ success: false, message: "productId is required" });
  }
  const limit = Math.min(
    Math.max(parseInt(req.query.limit) || DEFAULT_REVIEWS_PAGE_SIZE, 1),
    MAX_REVIEWS_PAGE_SIZE
  );
  const offset = Math.max(parseInt(req.query.offset) || 0, 0);
  const visible = visibleReviewsFor(productId).sort(newestFirst);
  res.json({
    success: true,
    data: {
      productId,
      // The summary covers every visible row, not just the page.
      summary: summarizeReviews(visible),
      reviews: visible.slice(offset, offset + limit).map(publicReview),
      total: visible.length,
      limit,
      offset,
    },
  });
});

// GET /review-eligibility?productId=   (user)
app.get("/review-eligibility", reviewsEnabledMiddleware, authMiddleware, (req, res) => {
  const { productId } = req.query;
  if (!productId) {
    return res.status(400).json({ success: false, message: "productId is required" });
  }
  const eligibility = resolveEligibility({
    orders,
    userId: req.user._id,
    productId,
  });
  // Returned even when hidden, so the author can still edit their own review.
  const own = reviewsFor(productId).find((r) => r.user._id === req.user._id);
  res.json({
    success: true,
    data: {
      productId,
      eligibility,
      can_review: eligibility === "eligible",
      my_review: own ? publicReview(own) : null,
    },
  });
});

// POST /review   (user: create or update, one per customer per product)
app.post("/review", reviewsEnabledMiddleware, authMiddleware, (req, res) => {
  const { productId, rating, text } = req.body;
  if (!productId) {
    return res.status(400).json({ success: false, message: "productId is required" });
  }
  const check = validateReviewSubmission({ rating, text });
  if (!check.valid) {
    console.log(
      "[reviews] submission_rejected",
      JSON.stringify({ productId, reason: check.message })
    );
    return res.status(400).json({ success: false, message: check.message });
  }
  // Re-checked on every write, so a client that skips the read check still
  // cannot post — hiding the form is UX, this 403 is the control.
  const eligibility = resolveEligibility({
    orders,
    userId: req.user._id,
    productId,
  });
  if (eligibility !== "eligible") {
    console.log(
      "[reviews] submission_rejected",
      JSON.stringify({ productId, reason: eligibility })
    );
    const message =
      eligibility === "not_delivered"
        ? "You can review this product once your order has been delivered"
        : "Only customers who bought this product can review it";
    return res.status(403).json({ success: false, eligibility, message });
  }
  const now = new Date().toISOString();
  const existing = reviewsFor(productId).find(
    (r) => r.user._id === req.user._id
  );
  let review;
  if (existing) {
    // _id and createdAt are preserved, so the review count cannot move on an edit.
    existing.rating = rating;
    existing.text = text ? String(text).trim() : "";
    existing.updatedAt = now;
    review = existing;
  } else {
    review = {
      _id: uuidv4(),
      productId,
      user: { _id: req.user._id, name: req.user.name },
      reviewer_name: req.user.name,
      rating,
      text: text ? String(text).trim() : "",
      verified_purchase: true,
      visibility: REVIEW_VISIBILITIES.VISIBLE,
      moderated_by: null,
      moderated_at: null,
      moderation_action: null,
      createdAt: now,
      updatedAt: now,
    };
    reviews.push(review);
  }
  console.log(
    "[reviews] submitted",
    JSON.stringify({
      productId,
      rating,
      is_edit: Boolean(existing),
      has_text: Boolean(review.text),
    })
  );
  res.json({
    success: true,
    message: existing ? "Review updated" : "Review published",
    data: {
      review: publicReview(review),
      summary: summarizeReviews(visibleReviewsFor(productId)),
    },
  });
});

// GET /admin/reviews?productId=&visibility=   (admin: the only surface that
// returns hidden rows)
app.get("/admin/reviews", reviewsEnabledMiddleware, adminMiddleware, (req, res) => {
  const { productId, visibility } = req.query;
  const matches = reviews
    .filter((r) => (productId ? r.productId === productId : true))
    .filter((r) => (visibility ? r.visibility === visibility : true))
    .sort(newestFirst);
  res.json({
    success: true,
    data: matches.map(adminReview),
    summary: {
      total: reviews.length,
      visible: reviews.filter((r) => r.visibility === REVIEW_VISIBILITIES.VISIBLE)
        .length,
      hidden: reviews.filter((r) => r.visibility === REVIEW_VISIBILITIES.HIDDEN)
        .length,
    },
  });
});

// GET /admin/review-visibility?reviewId=&visibility=   (admin: hide / restore)
app.get(
  "/admin/review-visibility",
  reviewsEnabledMiddleware,
  adminMiddleware,
  (req, res) => {
    const { reviewId, visibility } = req.query;
    if (!Object.values(REVIEW_VISIBILITIES).includes(visibility)) {
      return res.status(400).json({ success: false, message: "Invalid visibility value" });
    }
    const review = reviews.find((r) => r._id === reviewId);
    if (!review) {
      return res.status(404).json({ success: false, message: "Review not found" });
    }
    // Visibility only. Order fulfilment and payment fields are intentionally
    // untouched here — hiding a review must never change the order it came
    // from, and advancing an order must never change a review's visibility.
    const action =
      visibility === REVIEW_VISIBILITIES.HIDDEN ? "hide" : "restore";
    review.visibility = visibility;
    review.moderated_by = req.user._id;
    review.moderated_at = new Date().toISOString();
    review.moderation_action = action;
    console.log(
      "[reviews] moderated",
      JSON.stringify({
        reviewId: review._id,
        action,
        admin_id: req.user._id,
        productId: review.productId,
      })
    );
    res.json({
      success: true,
      message: action === "hide" ? "Review hidden" : "Review restored",
      data: {
        review: adminReview(review),
        summary: summarizeReviews(visibleReviewsFor(review.productId)),
      },
    });
  }
);

// GET /admin/delete-review?id=   (admin: permanent, unlike hide)
app.get(
  "/admin/delete-review",
  reviewsEnabledMiddleware,
  adminMiddleware,
  (req, res) => {
    const { id } = req.query;
    const idx = reviews.findIndex((r) => r._id === id);
    if (idx === -1) {
      return res.status(404).json({ success: false, message: "Review not found" });
    }
    const removed = reviews.splice(idx, 1)[0];
    console.log(
      "[reviews] removed",
      JSON.stringify({
        reviewId: removed._id,
        admin_id: req.user._id,
        productId: removed.productId,
      })
    );
    res.json({
      success: true,
      message: "Review removed permanently",
      data: {
        _id: removed._id,
        productId: removed.productId,
        summary: summarizeReviews(visibleReviewsFor(removed.productId)),
      },
    });
  }
);

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
  console.log(`   GET    /product-reviews?productId=&limit=&offset=`);
  console.log(`   GET    /review-eligibility?productId=        (user)`);
  console.log(`   POST   /review                              (user)`);
  console.log(`   GET    /admin/reviews?productId=&visibility= (admin)`);
  console.log(`   GET    /admin/review-visibility?reviewId=&visibility=  (admin)`);
  console.log(`   GET    /admin/delete-review?id=             (admin)`);
  console.log(`   GET    /delete-user?id=`);
  console.log(`   POST   /reset-password?id=`);
  console.log(`   POST   /photos/upload`);
  console.log(`   GET    /uploads/:filename`);
  console.log(`\n💳 Order payment contract:`);
  console.log(`   payment_type              cod | card`);
  console.log(`   payment_status            due_on_delivery | paid | failed | not_completed`);
  console.log(`   payment_reference         SIMPAY-<epochMs>-<4 chars> or null`);
  console.log(`   payment_status_updated_at ISO-8601 or null`);
  console.log(`\n⭐ Review contract:`);
  console.log(`   visibility                visible | hidden`);
  console.log(`   eligibility               eligible | not_signed_in | no_purchase | not_delivered | feature_off`);
  console.log(`   rating                    whole number 1..5`);
  console.log(`   text                      up to 500 plain-text characters, "" when rating-only`);
  console.log(`   REVIEWS_ENABLED=false     every review endpoint returns 503 (instant kill switch)`);
  console.log(`\n🔑 Test tokens:`);
  console.log(`   Admin token : mock-admin-token-001`);
  console.log(`   User token  : mock-user-token-001`);
  console.log(`\n👤 Test credentials:`);
  console.log(`   Admin  → email: admin@easybuy.com  | password: admin123`);
  console.log(`   User   → email: user@easybuy.com   | password: user123\n`);
});

// Made with Bob
