const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const { randomUUID } = require("crypto");
const { derivePaymentFields, serializeOrder } = require("./orderPayment");
const {
  assertReviewEligibility,
  buildProductReviewSummary,
  createReviewError,
  serializeReview,
} = require("./reviewSummary");

const PORT = 3002;
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
        payment_status: "pending",
        payment_reference: null,
        payment_message: "Pay on delivery",
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
        payment_status: "pending",
        payment_reference: null,
        payment_message: "Pay on delivery",
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
        payment_status: "pending",
        payment_reference: null,
        payment_message: "Pay on delivery",
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
    ],
    reviews: [],
  };
}

function cloneState(state) {
  return JSON.parse(JSON.stringify(state));
}

function createMetricLogger() {
  return (name, labels, value = 1) => {
    console.info("metric", {
      name,
      labels,
      value,
      timestamp: new Date().toISOString(),
    });
  };
}

function createApp(initialState = createInitialState()) {
  const state = cloneState(initialState);
  let { users, categories, products, orders, reviews } = state;
  const emitMetric = createMetricLogger();
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use("/uploads", express.static(path.join(__dirname, "uploads")));

  const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, path.join(__dirname, "uploads")),
    filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
  });
  const upload = multer({ storage });

  const getUserFromToken = (token) => users.find((user) => user.token === token);

  const resolveOptionalUser = (req, res) => {
    const token = req.headers["x-auth-token"];

    if (!token) {
      return null;
    }

    const user = getUserFromToken(token);

    if (!user) {
      res
        .status(401)
        .json({
          success: false,
          err: "jwt expired",
          message: "Invalid or expired token",
        });
      return false;
    }

    return user;
  };

  const authMiddleware = (req, res, next) => {
    const token = req.headers["x-auth-token"];
    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "No token provided" });
    }
    const user = getUserFromToken(token);
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

  const findProduct = (productId) =>
    products.find((product) => product._id === productId);

  const validateReviewInput = ({ productId, rating, comment }) => {
    if (productId !== undefined && !productId) {
      throw createReviewError(400, "Product id is required");
    }

    if (!Number.isInteger(Number(rating)) || Number(rating) < 1 || Number(rating) > 5) {
      throw createReviewError(400, "Rating must be an integer between 1 and 5");
    }

    const trimmedComment = typeof comment === "string" ? comment.trim() : "";

    if (!trimmedComment) {
      throw createReviewError(400, "Comment is required");
    }

    if (trimmedComment.length > 500) {
      throw createReviewError(400, "Comment must be 500 characters or less");
    }

    return {
      rating: Number(rating),
      comment: trimmedComment,
    };
  };

  const buildViewerState = ({ productId, viewerUser }) => {
    if (!viewerUser) {
      return {
        canSubmit: false,
        hasExistingReview: false,
        reviewId: null,
        eligibleOrderId: null,
        reason: "login_required",
        review: null,
      };
    }

    const existingReview = reviews.find(
      (review) =>
        review.productId === productId && review.user?._id === viewerUser._id
    );

    if (existingReview) {
      return {
        canSubmit: false,
        hasExistingReview: true,
        reviewId: existingReview._id,
        eligibleOrderId: existingReview.orderId,
        reason: "already_reviewed",
        review: serializeReview(existingReview),
      };
    }

    const eligibleOrder = orders.find((order) => {
      return (
        order.user?._id === viewerUser._id &&
        order.status === "delivered" &&
        order.items?.some((item) => item.productId?._id === productId)
      );
    });

    if (!eligibleOrder) {
      return {
        canSubmit: false,
        hasExistingReview: false,
        reviewId: null,
        eligibleOrderId: null,
        reason: "delivery_required",
        review: null,
      };
    }

    return {
      canSubmit: true,
      hasExistingReview: false,
      reviewId: null,
      eligibleOrderId: eligibleOrder._id,
      reason: null,
      review: null,
    };
  };

  const createSummaryPayload = (productId) => {
    const summary = buildProductReviewSummary(reviews, productId);

    return {
      summary: {
        averageRating: summary.averageRating,
        totalReviewCount: summary.totalReviewCount,
        ratingDistribution: summary.ratingDistribution,
      },
      recentReviews: summary.recentReviews,
    };
  };

  const serializeAdminReview = (review) => ({
    _id: review._id,
    product: review.product,
    user: {
      _id: review.user?._id,
      name: review.user?.name,
      email: review.user?.email,
    },
    orderId: review.orderId,
    rating: review.rating,
    comment: review.comment,
    verifiedPurchase: review.verifiedPurchase,
    moderationStatus: review.moderationStatus,
    createdAt: review.createdAt,
    updatedAt: review.updatedAt,
    hiddenAt: review.hiddenAt || null,
    removedAt: review.removedAt || null,
  });

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
    const { password: ignoredPassword, ...safeUser } = newUser;
    res
      .status(201)
      .json({
        success: true,
        message: "User registered successfully",
        data: safeUser,
      });
  });

  app.post("/login", (req, res) => {
    const { email, password } = req.body;
    const user = users.find(
      (registeredUser) =>
        registeredUser.email === email && registeredUser.password === password
    );
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
    }
    const { password: ignoredPassword, ...safeUser } = user;
    res.json({ success: true, message: "Login successful", data: safeUser });
  });

  app.get("/products", (req, res) => {
    res.json({ success: true, data: products });
  });

  app.post("/product", adminMiddleware, (req, res) => {
    const { title, sku, price, image, description, category, quantity } =
      req.body;
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
    const { title, sku, price, image, description, category, quantity } =
      req.body;
    const cat = categories.find((item) => item._id === category);
    products[idx] = {
      ...products[idx],
      title: title || products[idx].title,
      sku: sku || products[idx].sku,
      price: price ? parseFloat(price) : products[idx].price,
      quantity:
        quantity !== undefined
          ? parseInt(quantity, 10)
          : products[idx].quantity,
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
      },
    });
  });

  app.get("/admin/orders", adminMiddleware, (req, res) => {
    res.json({ success: true, data: orders.map(serializeOrder) });
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
    const serializedOrder = serializeOrder(order);
    console.info("admin_order_status_updated", {
      orderId: serializedOrder.orderId,
      delivery_status: serializedOrder.status,
      payment_status: serializedOrder.payment_status,
      timestamp: new Date().toISOString(),
    });
    res.json({
      success: true,
      message: `Order status updated to ${status}`,
      data: serializedOrder,
    });
  });

  app.get("/orders", authMiddleware, (req, res) => {
    const userOrders = orders.filter((order) => order.user._id === req.user._id);
    res.json({ success: true, data: userOrders.map(serializeOrder) });
  });

  app.get("/product-reviews", (req, res) => {
    const { productId } = req.query;
    const product = findProduct(productId);

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    const viewerUser = resolveOptionalUser(req, res);
    if (viewerUser === false) {
      return;
    }

    const payload = createSummaryPayload(productId);
    const viewer = buildViewerState({ productId, viewerUser });

    console.info("review_summary_requested", {
      productId,
      viewerUserId: viewerUser?._id || null,
      visibleReviewCount: payload.summary.totalReviewCount,
      timestamp: new Date().toISOString(),
    });
    emitMetric(
      "easybuy_product_review_visible_total",
      { product_id: productId },
      payload.summary.totalReviewCount
    );
    emitMetric(
      "easybuy_product_review_average_rating",
      { product_id: productId },
      payload.summary.averageRating
    );

    res.json({
      success: true,
      data: {
        product: {
          _id: product._id,
          title: product.title,
        },
        summary: payload.summary,
        recentReviews: payload.recentReviews,
        viewer,
      },
    });
  });

  app.post("/review", authMiddleware, (req, res) => {
    const { productId } = req.body;
    const product = findProduct(productId);

    if (!product) {
      console.warn("review_create_blocked", {
        productId,
        userId: req.user._id,
        reason: "product_not_found",
        timestamp: new Date().toISOString(),
      });
      emitMetric("easybuy_review_create_attempt_total", {
        result: "product_not_found",
      });
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    let parsedInput;
    try {
      parsedInput = validateReviewInput(req.body);
    } catch (error) {
      console.warn("review_create_blocked", {
        productId,
        userId: req.user._id,
        reason: error.message,
        timestamp: new Date().toISOString(),
      });
      emitMetric("easybuy_review_create_attempt_total", {
        result: "validation_error",
      });
      return res
        .status(error.status || 400)
        .json({ success: false, message: error.message });
    }

    const existingReview = reviews.find(
      (review) =>
        review.productId === productId && review.user?._id === req.user._id
    );

    if (existingReview) {
      console.warn("review_create_blocked", {
        productId,
        userId: req.user._id,
        reason: "already_reviewed",
        timestamp: new Date().toISOString(),
      });
      emitMetric("easybuy_review_create_attempt_total", {
        result: "already_reviewed",
      });
      return res.status(409).json({
        success: false,
        message: "You have already reviewed this product",
      });
    }

    let eligibleOrder;
    try {
      eligibleOrder = assertReviewEligibility({
        user: req.user,
        productId,
        orders,
      });
    } catch (error) {
      console.warn("review_create_blocked", {
        productId,
        userId: req.user._id,
        reason: error.message,
        timestamp: new Date().toISOString(),
      });
      emitMetric("easybuy_review_create_attempt_total", {
        result: "delivery_required",
      });
      return res
        .status(error.status || 403)
        .json({ success: false, message: error.message });
    }

    console.info("review_create_requested", {
      productId,
      actorUserId: req.user._id,
      timestamp: new Date().toISOString(),
    });

    const now = new Date().toISOString();
    const newReview = {
      _id: uuidv4(),
      productId,
      product: {
        _id: product._id,
        title: product.title,
      },
      orderId: eligibleOrder._id,
      user: {
        _id: req.user._id,
        name: req.user.name,
        email: req.user.email,
      },
      rating: parsedInput.rating,
      comment: parsedInput.comment,
      verifiedPurchase: true,
      moderationStatus: "visible",
      createdAt: now,
      updatedAt: now,
      hiddenAt: null,
      removedAt: null,
      moderatedBy: null,
    };

    reviews.push(newReview);
    const payload = createSummaryPayload(productId);

    console.info("review_created", {
      reviewId: newReview._id,
      productId,
      userId: req.user._id,
      rating: newReview.rating,
      timestamp: now,
    });
    emitMetric("easybuy_review_create_attempt_total", { result: "success" });
    emitMetric(
      "easybuy_product_review_visible_total",
      { product_id: productId },
      payload.summary.totalReviewCount
    );
    emitMetric(
      "easybuy_product_review_average_rating",
      { product_id: productId },
      payload.summary.averageRating
    );

    res.status(201).json({
      success: true,
      message: "Review saved successfully",
      data: {
        review: serializeReview(newReview),
        summary: payload.summary,
      },
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

    let parsedInput;
    try {
      parsedInput = validateReviewInput(req.body);
      assertReviewEligibility({
        user: req.user,
        productId: review.productId,
        orders,
        existingReview: review,
      });
    } catch (error) {
      return res
        .status(error.status || 400)
        .json({ success: false, message: error.message });
    }

    review.rating = parsedInput.rating;
    review.comment = parsedInput.comment;
    review.updatedAt = new Date().toISOString();

    const payload = createSummaryPayload(review.productId);

    console.info("review_updated", {
      reviewId: review._id,
      productId: review.productId,
      userId: req.user._id,
      timestamp: review.updatedAt,
    });
    emitMetric(
      "easybuy_product_review_visible_total",
      { product_id: review.productId },
      payload.summary.totalReviewCount
    );
    emitMetric(
      "easybuy_product_review_average_rating",
      { product_id: review.productId },
      payload.summary.averageRating
    );

    res.json({
      success: true,
      message: "Review updated successfully",
      data: {
        review: serializeReview(review),
        summary: payload.summary,
      },
    });
  });

  app.get("/admin/reviews", adminMiddleware, (req, res) => {
    const rows = reviews
      .map((review) => {
        const product = findProduct(review.productId);
        return serializeAdminReview({
          ...review,
          product: product
            ? { _id: product._id, title: product.title }
            : review.product,
        });
      })
      .sort((firstReview, secondReview) => {
        return (
          new Date(secondReview.updatedAt).getTime() -
          new Date(firstReview.updatedAt).getTime()
        );
      });

    res.json({ success: true, data: rows });
  });

  app.get("/admin/review-visibility", adminMiddleware, (req, res) => {
    const { id, status } = req.query;
    const validStatuses = ["visible", "hidden", "removed"];

    if (!validStatuses.includes(status)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid moderation state" });
    }

    const review = reviews.find((item) => item._id === id);

    if (!review) {
      return res
        .status(404)
        .json({ success: false, message: "Review not found" });
    }

    const previousStatus = review.moderationStatus;
    review.moderationStatus = status;
    review.updatedAt = new Date().toISOString();
    review.moderatedBy = {
      _id: req.user._id,
      email: req.user.email,
    };

    if (status === "visible") {
      review.hiddenAt = null;
      review.removedAt = null;
    }
    if (status === "hidden") {
      review.hiddenAt = review.updatedAt;
      review.removedAt = null;
    }
    if (status === "removed") {
      review.removedAt = review.updatedAt;
      review.hiddenAt = review.hiddenAt || null;
    }

    console.info("admin_review_visibility_changed", {
      reviewId: review._id,
      productId: review.productId,
      adminUserId: req.user._id,
      fromStatus: previousStatus,
      toStatus: status,
      moderationStatus: review.moderationStatus,
      timestamp: review.updatedAt,
    });
    emitMetric("easybuy_review_visibility_change_total", { to_status: status });

    const payload = createSummaryPayload(review.productId);
    emitMetric(
      "easybuy_product_review_visible_total",
      { product_id: review.productId },
      payload.summary.totalReviewCount
    );
    emitMetric(
      "easybuy_product_review_average_rating",
      { product_id: review.productId },
      payload.summary.averageRating
    );

    res.json({
      success: true,
      message: `Review visibility updated to ${status}`,
      data: serializeAdminReview(review),
    });
  });

  app.post("/checkout", authMiddleware, (req, res) => {
    const {
      items,
      amount,
      discount,
      payment_type,
      payment_acknowledged,
      country,
      city,
      zipcode,
      shippingAddress,
    } = req.body;
    if (!items || items.length === 0) {
      console.warn("checkout_validation_failed", {
        userId: req.user._id,
        reason: "Cart is empty",
        payment_type,
        timestamp: new Date().toISOString(),
      });
      return res.status(400).json({ success: false, message: "Cart is empty" });
    }

    const orderId = `ORD-${Date.now()}`;
    console.info("checkout_submitted", {
      orderId,
      userId: req.user._id,
      payment_type,
      amount,
      timestamp: new Date().toISOString(),
    });

    let paymentFields;
    try {
      paymentFields = derivePaymentFields({
        payment_type,
        payment_acknowledged,
      });
    } catch (error) {
      console.warn("checkout_validation_failed", {
        userId: req.user._id,
        reason: error.message,
        payment_type,
        timestamp: new Date().toISOString(),
      });
      return res
        .status(error.status || 400)
        .json({ success: false, message: error.message });
    }

    const orderItems = items.map((item) => {
      const product = products.find((productRow) => productRow._id === item.productId);
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
      orderId,
      user: {
        _id: req.user._id,
        name: req.user.name,
        email: req.user.email,
      },
      items: orderItems,
      amount: amount || 0,
      discount: discount || 0,
      ...paymentFields,
      country: country || "",
      city: city || "",
      zipcode: zipcode || "",
      shippingAddress: shippingAddress || "",
      status: "pending",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    orders.push(newOrder);
    const serializedOrder = serializeOrder(newOrder);
    console.info("checkout_payment_derived", {
      orderId: serializedOrder.orderId,
      payment_status: serializedOrder.payment_status,
      payment_reference: serializedOrder.payment_reference,
      timestamp: new Date().toISOString(),
    });
    res.json({
      success: true,
      message: "Order placed successfully",
      data: serializedOrder,
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
    const user = users.find((account) => account._id === id);
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

  return {
    app,
    state: {
      get users() {
        return users;
      },
      get categories() {
        return categories;
      },
      get products() {
        return products;
      },
      get orders() {
        return orders;
      },
      get reviews() {
        return reviews;
      },
    },
  };
}

function startServer() {
  const { app } = createApp();
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`\n🚀 EasyBuy Mock Server running at http://localhost:${PORT}`);
    console.log(`\n📋 Available endpoints:`);
    console.log(`   POST   /register`);
    console.log(`   POST   /login`);
    console.log(`   GET    /products`);
    console.log(`   GET    /product-reviews?productId=`);
    console.log(`   POST   /review`);
    console.log(`   POST   /update-review?id=`);
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
    console.log(`   GET    /admin/reviews        (admin)`);
    console.log(`   GET    /admin/review-visibility?id=&status=  (admin)`);
    console.log(`   GET    /admin/order-status?orderId=&status=  (admin)`);
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
  });
}

if (require.main === module) {
  startServer();
}

module.exports = {
  createApp,
  createInitialState,
  startServer,
};
