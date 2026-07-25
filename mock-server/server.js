const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const {
  PAYMENT_TYPES,
  PAYMENT_STATUSES,
  SUPPORTED_PAYMENT_TYPES,
  SUPPORTED_PAYMENT_STATUS_UPDATES,
  getInitialPaymentStatus,
  canTransitionPaymentStatus,
  canAdvanceFulfillment,
  normalizeOrderPaymentFields,
} = require("./paymentState");

const PORT = 3002;

const app = express();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, "uploads")),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage });

const clone = (value) => JSON.parse(JSON.stringify(value));

const seedUsers = [
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

const seedCategories = [
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

const seedProducts = [
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
    description:
      "Daily face moisturizer with SPF 30 sun protection.",
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
];

const seedOrders = [
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

let users = [];
let categories = [];
let products = [];
let orders = [];

function resetMockData() {
  users = clone(seedUsers);
  categories = clone(seedCategories);
  products = clone(seedProducts);
  orders = clone(seedOrders).map((order) => normalizeOrderPaymentFields(order));
}

resetMockData();

const authMiddleware = (req, res, next) => {
  const token = req.headers["x-auth-token"];
  if (!token) {
    return res.status(401).json({ success: false, message: "No token provided" });
  }

  const user = users.find((candidate) => candidate.token === token);
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
      return res.status(403).json({ success: false, message: "Admin access required" });
    }

    next();
  });
};

function createOrderItems(items) {
  return items.map((item) => {
    const product = products.find((candidate) => candidate._id === item.productId);

    return {
      productId: product
        ? { _id: product._id, title: product.title }
        : { _id: item.productId, title: "Unknown Product" },
      price: Number(item.price),
      quantity: Number(item.quantity),
    };
  });
}

app.post("/register", (req, res) => {
  const { email, password, name, userType } = req.body;
  if (!email || !password || !name) {
    return res.status(400).json({ success: false, message: "All fields are required" });
  }

  if (users.find((user) => user.email === email)) {
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
  const { password: _password, ...safeUser } = newUser;
  return res.status(201).json({
    success: true,
    message: "User registered successfully",
    data: safeUser,
  });
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const user = users.find(
    (candidate) => candidate.email === email && candidate.password === password
  );

  if (!user) {
    return res.status(401).json({ success: false, message: "Invalid email or password" });
  }

  const { password: _password, ...safeUser } = user;
  return res.json({ success: true, message: "Login successful", data: safeUser });
});

app.get("/products", (req, res) => {
  res.json({ success: true, data: products });
});

app.post("/product", adminMiddleware, (req, res) => {
  const { title, sku, price, image, description, category, quantity } = req.body;
  if (!title || !price) {
    return res.status(400).json({ success: false, message: "Title and price are required" });
  }

  const cat = categories.find((candidate) => candidate._id === category);
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
  return res.json({
    success: true,
    message: "Product added successfully",
    data: newProduct,
  });
});

app.post("/update-product", adminMiddleware, (req, res) => {
  const { id } = req.query;
  const productIndex = products.findIndex((product) => product._id === id);
  if (productIndex === -1) {
    return res.status(404).json({ success: false, message: "Product not found" });
  }

  const { title, sku, price, image, description, category, quantity } = req.body;
  const cat = categories.find((candidate) => candidate._id === category);

  products[productIndex] = {
    ...products[productIndex],
    title: title || products[productIndex].title,
    sku: sku || products[productIndex].sku,
    price: price ? parseFloat(price) : products[productIndex].price,
    quantity:
      quantity !== undefined
        ? parseInt(quantity, 10)
        : products[productIndex].quantity,
    description: description || products[productIndex].description,
    image: image || products[productIndex].image,
    category: cat ? { _id: cat._id, title: cat.title } : products[productIndex].category,
  };

  return res.json({
    success: true,
    message: "Product updated successfully",
    data: products[productIndex],
  });
});

app.get("/delete-product", adminMiddleware, (req, res) => {
  const { id } = req.query;
  const productIndex = products.findIndex((product) => product._id === id);
  if (productIndex === -1) {
    return res.status(404).json({ success: false, message: "Product not found" });
  }

  products.splice(productIndex, 1);
  return res.json({ success: true, message: "Product deleted successfully" });
});

app.get("/categories", (req, res) => {
  res.json({ success: true, categories });
});

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

  return res.json({
    success: true,
    message: "Category added successfully",
    data: newCategory,
  });
});

app.post("/update-category", adminMiddleware, (req, res) => {
  const { id } = req.query;
  const categoryIndex = categories.findIndex((category) => category._id === id);
  if (categoryIndex === -1) {
    return res.status(404).json({ success: false, message: "Category not found" });
  }

  const { title, image, description } = req.body;
  categories[categoryIndex] = {
    ...categories[categoryIndex],
    title: title || categories[categoryIndex].title,
    description: description || categories[categoryIndex].description,
    icon: image || categories[categoryIndex].icon,
  };

  return res.json({
    success: true,
    message: "Category updated successfully",
    data: categories[categoryIndex],
  });
});

app.get("/delete-category", adminMiddleware, (req, res) => {
  const { id } = req.query;
  const categoryIndex = categories.findIndex((category) => category._id === id);
  if (categoryIndex === -1) {
    return res.status(404).json({ success: false, message: "Category not found" });
  }

  categories.splice(categoryIndex, 1);
  return res.json({ success: true, message: "Category deleted successfully" });
});

app.get("/dashboard", adminMiddleware, (req, res) => {
  res.json({
    success: true,
    data: {
      usersCount: users.filter((user) => user.userType === "USER").length,
      ordersCount: orders.length,
      productsCount: products.length,
      categoriesCount: categories.length,
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
    return res.status(400).json({ success: false, message: "Invalid status value" });
  }

  const order = orders.find((candidate) => candidate._id === orderId);
  if (!order) {
    return res.status(404).json({ success: false, message: "Order not found" });
  }

  if (!canAdvanceFulfillment(order, status)) {
    console.info("order.fulfillment_blocked", {
      orderId: order.orderId,
      adminUserId: req.user._id,
      paymentType: order.payment_type,
      paymentStatus: order.payment_status,
      requestedFulfillmentStatus: status,
    });

    return res.status(409).json({
      success: false,
      message: "Wallet orders must be paid before they can be shipped or delivered",
    });
  }

  order.status = status;
  order.updatedAt = new Date().toISOString();
  if (status === "shipped") {
    order.shippedOn = new Date().toISOString().split("T")[0];
  }
  if (status === "delivered") {
    order.deliveredOn = new Date().toISOString().split("T")[0];
  }

  return res.json({
    success: true,
    message: `Order status updated to ${status}`,
    data: order,
  });
});

app.get("/orders", authMiddleware, (req, res) => {
  const userOrders = orders.filter((order) => order.user._id === req.user._id);
  res.json({ success: true, data: userOrders });
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
  } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ success: false, message: "Cart is empty" });
  }

  if (![country, city, zipcode, shippingAddress].every((value) => String(value || "").trim())) {
    return res.status(400).json({
      success: false,
      message: "Shipping address is required",
    });
  }

  if (!SUPPORTED_PAYMENT_TYPES.includes(payment_type)) {
    return res.status(400).json({
      success: false,
      message: "Invalid payment type",
    });
  }

  const now = new Date().toISOString();
  const paymentStatus = getInitialPaymentStatus(payment_type);
  const newOrder = normalizeOrderPaymentFields({
    _id: uuidv4(),
    orderId: `ORD-${Date.now()}`,
    user: {
      _id: req.user._id,
      name: req.user.name,
      email: req.user.email,
    },
    items: createOrderItems(items),
    amount: Number(amount) || 0,
    discount: Number(discount) || 0,
    payment_type,
    country: String(country).trim(),
    city: String(city).trim(),
    zipcode: String(zipcode).trim(),
    shippingAddress: String(shippingAddress).trim(),
    status: "pending",
    createdAt: now,
    updatedAt: now,
    payment_updated_at: now,
  });

  orders.push(newOrder);

  console.info("order.checkout", {
    orderId: newOrder.orderId,
    userId: req.user._id,
    paymentType: payment_type,
    paymentStatus,
  });

  return res.json({
    success: true,
    message: "Order placed successfully",
    data: newOrder,
  });
});

app.post("/order-payment-status", authMiddleware, (req, res) => {
  const { orderId, payment_status } = req.body;
  const order = orders.find((candidate) => candidate._id === orderId);

  if (!order) {
    return res.status(404).json({ success: false, message: "Order not found" });
  }

  if (order.user._id !== req.user._id) {
    return res.status(403).json({ success: false, message: "You cannot update this order" });
  }

  if (order.payment_type !== PAYMENT_TYPES.WALLET) {
    return res.status(400).json({
      success: false,
      message: "Only wallet orders can update payment status",
    });
  }

  if (!SUPPORTED_PAYMENT_STATUS_UPDATES.includes(payment_status)) {
    return res.status(400).json({
      success: false,
      message: "Invalid payment status value",
    });
  }

  if (!canTransitionPaymentStatus(order.payment_status, payment_status)) {
    return res.status(409).json({
      success: false,
      message: "Invalid payment status transition",
    });
  }

  const previousStatus = order.payment_status;
  order.payment_status = payment_status;
  order.payment_updated_at = new Date().toISOString();
  order.updatedAt = order.payment_updated_at;

  if (payment_status === PAYMENT_STATUSES.FAILED) {
    order.payment_failure_reason = "Wallet payment failed";
  } else if (payment_status === PAYMENT_STATUSES.CANCELLED) {
    order.payment_failure_reason = "Wallet payment cancelled";
  } else {
    delete order.payment_failure_reason;
  }

  if (previousStatus !== payment_status) {
    console.info("order.payment_status_changed", {
      orderId: order.orderId,
      userId: req.user._id,
      fromStatus: previousStatus,
      toStatus: payment_status,
    });
  }

  return res.json({
    success: true,
    message: `Payment status updated to ${payment_status}`,
    data: order,
  });
});

app.get("/delete-user", (req, res) => {
  const { id } = req.query;
  const userIndex = users.findIndex((user) => user._id === id);
  if (userIndex === -1) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  const deleted = users.splice(userIndex, 1)[0];
  const { password, token, ...safeUser } = deleted;
  return res.json({
    success: true,
    message: "Account deleted successfully",
    data: safeUser,
  });
});

app.post("/reset-password", (req, res) => {
  const { id } = req.query;
  const { password, newPassword } = req.body;
  const user = users.find((candidate) => candidate._id === id);
  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  if (user.password !== password) {
    return res.status(401).json({
      success: false,
      message: "Current password is incorrect",
    });
  }

  user.password = newPassword;
  return res.json({ success: true, message: "Password updated successfully" });
});

app.post("/photos/upload", upload.single("photos"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: "No file uploaded" });
  }

  return res.json({
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
  return res.send(svg);
});

function startServer(port = PORT, host = "0.0.0.0") {
  return app.listen(port, host, () => {
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
    console.log(`   GET    /orders               (user)`);
    console.log(`   POST   /checkout             (user)`);
    console.log(`   POST   /order-payment-status (user)`);
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
}

if (require.main === module) {
  startServer();
}

module.exports = {
  app,
  resetMockData,
  startServer,
};
