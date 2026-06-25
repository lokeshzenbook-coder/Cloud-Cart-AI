import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// Initialize Gemini client safely if API key exists
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  try {
    ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    console.error("Failed to initialize Gemini client:", err);
  }
}

const app = express();
const PORT = 3000;

app.use(express.json());

// IN-MEMORY SIMULATED DATABASES
interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: "admin" | "customer";
  verified: boolean;
  avatar?: string;
  createdAt: string;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  inventory: number;
  image: string;
  rating: number;
  reviewsCount: number;
  featured: boolean;
  reviews: Array<{
    id: string;
    userName: string;
    rating: number;
    comment: string;
    aiReply?: string;
    createdAt: string;
  }>;
}

interface CartItem {
  productId: string;
  quantity: number;
}

interface Cart {
  userId: string;
  items: CartItem[];
  couponCode?: string;
  discountPercent: number;
}

interface Order {
  id: string;
  userId: string;
  items: Array<{
    productId: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
  }>;
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  shippingAddress: string;
  paymentMethod: string;
  paymentStatus: "pending" | "paid" | "failed";
  status: "processing" | "shipped" | "delivered" | "cancelled";
  trackingNumber: string;
  createdAt: string;
}

interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  channel: "email" | "rabbitmq" | "alert";
  timestamp: string;
}

// SEED DATA
const users: User[] = [
  {
    id: "user-1",
    name: "Alex Dev",
    email: "customer@cloudcart.ai",
    passwordHash: "customer123", // simulation uses simple matching for testing
    role: "customer",
    verified: true,
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
    createdAt: new Date().toISOString(),
  },
  {
    id: "user-2",
    name: "Sarah Architect",
    email: "admin@cloudcart.ai",
    passwordHash: "admin123",
    role: "admin",
    verified: true,
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
    createdAt: new Date().toISOString(),
  }
];

const products: Product[] = [
  {
    id: "prod-1",
    name: "KubeKeyboard Pro-V4",
    description: "Premium split mechanical keyboard optimized for fast Kubernetes debugging. Features hot-swappable MX Cherry Blue switches, pre-programmed kubectl alias keys, and full addressable RGB aura sync.",
    price: 189.99,
    category: "Developer Hardware",
    inventory: 42,
    image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500",
    rating: 4.8,
    reviewsCount: 15,
    featured: true,
    reviews: [
      {
        id: "rev-1",
        userName: "KubectlWizard",
        rating: 5,
        comment: "My cluster debug speed increased by 300%. The dedicated 'k get pods' key is absolute gold!",
        aiReply: "Thanks KubectlWizard! We made sure the mechanical tactility matches the satisfying feel of a successful cluster deployment.",
        createdAt: new Date(Date.now() - 86400000 * 3).toISOString()
      }
    ]
  },
  {
    id: "prod-2",
    name: "DevOps Desk Lamp (RGB)",
    description: "Intelligent ambient lamp that links directly with Prometheus metrics, Grafana charts, or GitHub status alerts. Automatically changes color (Green, Yellow, Red) when your production container health fluctuates.",
    price: 59.99,
    category: "Smart Office",
    inventory: 85,
    image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500",
    rating: 4.5,
    reviewsCount: 22,
    featured: true,
    reviews: [
      {
        id: "rev-2",
        userName: "SRE_Lead",
        rating: 4,
        comment: "Excellent warning light, though it flashed red all weekend because of a database connection leak.",
        aiReply: "Glad it saved you from an outage, SRE_Lead! We recommend configuring our snooze filter for weekends.",
        createdAt: new Date(Date.now() - 86400000 * 5).toISOString()
      }
    ]
  },
  {
    id: "prod-3",
    name: "Helm Chart Hoodie",
    description: "Ultra-comfy, heavyweight organic cotton hoodie featuring an elegant, high-contrast structural blueprint of an umbrella Helm chart. Safe for continuous integrations and machine washing.",
    price: 49.99,
    category: "DevOps Gear",
    inventory: 150,
    image: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=500",
    rating: 4.9,
    reviewsCount: 38,
    featured: true,
    reviews: []
  },
  {
    id: "prod-4",
    name: "Dockerized Espresso Mug",
    description: "Vacuum insulated double-walled smart thermal mug that keeps your coffee at exactly 68°C. Built-in digital display showing simulated local cluster node state, container uptime, and battery level.",
    price: 34.99,
    category: "Smart Office",
    inventory: 64,
    image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=500",
    rating: 4.2,
    reviewsCount: 12,
    featured: false,
    reviews: []
  },
  {
    id: "prod-5",
    name: "RabbitMQ Soundproofing Panels",
    description: "Acoustic foam wall tiles optimized for dampening the high-frequency fan buzz of your homelab server rack. Styled with sleek geometric rabbit shapes for the ultimate SRE vibe.",
    price: 79.99,
    category: "Developer Hardware",
    inventory: 18,
    image: "https://images.unsplash.com/photo-1519751138087-5bf79df62d5b?w=500",
    rating: 4.6,
    reviewsCount: 7,
    featured: false,
    reviews: []
  },
  {
    id: "prod-6",
    name: "Gateway Load Balancer Balance Board",
    description: "Active standing desk balance board that helps you maintain physical load-balancing during exhausting standby shifts. Real Canadian maple wood top with non-slip grip tape.",
    price: 119.99,
    category: "DevOps Gear",
    inventory: 25,
    image: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=500",
    rating: 4.7,
    reviewsCount: 19,
    featured: false,
    reviews: []
  }
];

const carts: Cart[] = [
  {
    userId: "user-1",
    items: [
      { productId: "prod-1", quantity: 1 },
      { productId: "prod-3", quantity: 2 }
    ],
    discountPercent: 0
  }
];

const orders: Order[] = [
  {
    id: "ord-1001",
    userId: "user-1",
    items: [
      {
        productId: "prod-2",
        name: "DevOps Desk Lamp (RGB)",
        price: 59.99,
        quantity: 1,
        image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500"
      }
    ],
    subtotal: 59.99,
    tax: 4.80,
    shipping: 10.00,
    discount: 0,
    total: 74.79,
    shippingAddress: "404 Route Gateway, Cloud Suite 101, Austin, TX",
    paymentMethod: "Credit Card (Stripe)",
    paymentStatus: "paid",
    status: "shipped",
    trackingNumber: "TRK-CC-79482759",
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
  }
];

const notifications: Notification[] = [
  {
    id: "not-1",
    userId: "user-1",
    type: "Welcome Email",
    title: "Welcome to CloudCart AI!",
    message: "Welcome email simulated and published to rabbitmq exchange 'notifications.welcome'. Sent to customer@cloudcart.ai.",
    channel: "rabbitmq",
    timestamp: new Date(Date.now() - 86400000 * 4).toISOString()
  },
  {
    id: "not-2",
    userId: "user-1",
    type: "Order Created",
    title: "Order CC-1001 Confirmation",
    message: "Order billing processed. Invoice generated in PDF structure. Published to 'orders.processed' queue.",
    channel: "rabbitmq",
    timestamp: new Date(Date.now() - 86400000 * 2).toISOString()
  }
];

// PROMETHEUS METRICS SIMULATOR
const requestCounts = {
  auth: 42,
  products: 156,
  cart: 89,
  orders: 34,
  notifications: 51
};

// HELPER FOR CALCULATING CART DETAILS
function calculateCartTotals(cart: Cart) {
  let subtotal = 0;
  cart.items.forEach(item => {
    const product = products.find(p => p.id === item.productId);
    if (product) {
      subtotal += product.price * item.quantity;
    }
  });

  const discount = subtotal * (cart.discountPercent / 100);
  const discountedSubtotal = subtotal - discount;
  const tax = discountedSubtotal * 0.08; // 8% tax
  const shipping = subtotal > 150 ? 0 : 15.00; // Free shipping above $150
  const total = discountedSubtotal + tax + shipping;

  return {
    subtotal: parseFloat(subtotal.toFixed(2)),
    discount: parseFloat(discount.toFixed(2)),
    tax: parseFloat(tax.toFixed(2)),
    shipping: parseFloat(shipping.toFixed(2)),
    total: parseFloat(total.toFixed(2))
  };
}

// REST API v1 ENDPOINTS

// 1. Prometheus Metrics Endpoints
app.get("/metrics", (req, res) => {
  res.set("Content-Type", "text/plain; version=0.0.4; charset=utf-8");
  const ramUsageBytes = process.memoryUsage().heapUsed;
  const uptimeSeconds = process.uptime();

  const metricsText = `# HELP cloudcart_http_requests_total Total number of HTTP requests processed.
# TYPE cloudcart_http_requests_total counter
cloudcart_http_requests_total{service="auth_service",method="POST",route="/api/v1/auth/login",status="200"} ${requestCounts.auth}
cloudcart_http_requests_total{service="product_service",method="GET",route="/api/v1/products",status="200"} ${requestCounts.products}
cloudcart_http_requests_total{service="cart_service",method="POST",route="/api/v1/cart/items",status="201"} ${requestCounts.cart}
cloudcart_http_requests_total{service="order_service",method="POST",route="/api/v1/orders",status="201"} ${requestCounts.orders}
cloudcart_http_requests_total{service="notification_service",method="POST",route="/api/v1/notifications",status="200"} ${requestCounts.notifications}

# HELP cloudcart_memory_usage_bytes Current RAM heap usage of the server.
# TYPE cloudcart_memory_usage_bytes gauge
cloudcart_memory_usage_bytes ${ramUsageBytes}

# HELP cloudcart_uptime_seconds Container uptime in seconds.
# TYPE cloudcart_uptime_seconds counter
cloudcart_uptime_seconds ${uptimeSeconds}
`;
  res.send(metricsText);
});

// 2. Kubernetes Probes (Healthz, Readiness, Liveness)
app.get("/healthz", (req, res) => {
  res.json({ status: "healthy", services: { auth: "up", products: "up", cart: "up", orders: "up", notification: "up" } });
});

app.get("/ready", (req, res) => {
  res.json({ readiness: "ready", db_connections: { postgres_auth: "connected", mongodb_products: "connected", redis_cart: "connected", rabbitmq_notifications: "connected" } });
});

app.get("/live", (req, res) => {
  res.json({ liveness: "alive" });
});

// 3. AUTH SERVICE SIMULATION
app.post("/api/v1/auth/login", (req, res) => {
  requestCounts.auth++;
  const { email, password } = req.body;
  const user = users.find(u => u.email === email && u.passwordHash === password);
  if (!user) {
    return res.status(401).json({ error: "Invalid credentials. Try using customer@cloudcart.ai / customer123 or admin@cloudcart.ai / admin123." });
  }

  // Generate mock JWT
  const token = `mock-jwt-token-header.${Buffer.from(JSON.stringify({ id: user.id, role: user.role, email: user.email })).toString("base64")}.mock-signature`;
  res.json({
    message: "Login successful",
    accessToken: token,
    refreshToken: `mock-refresh-token-${user.id}`,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      verified: user.verified,
    }
  });
});

app.post("/api/v1/auth/register", (req, res) => {
  requestCounts.auth++;
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: "Name, email, and password are required." });
  }

  const existing = users.find(u => u.email === email);
  if (existing) {
    return res.status(409).json({ error: "Email already registered." });
  }

  const newUser: User = {
    id: `user-${Date.now()}`,
    name,
    email,
    passwordHash: password, // plain for high fidelity demo match
    role: "customer",
    verified: false,
    avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150`,
    createdAt: new Date().toISOString()
  };

  users.push(newUser);

  // Auto-trigger RabbitMQ registration notification
  notifications.push({
    id: `not-${Date.now()}`,
    userId: newUser.id,
    type: "Welcome Email",
    title: `Verify Email for ${newUser.name}`,
    message: `Account created for ${newUser.email}. Simulated confirmation link published to rabbitmq exchange 'notifications.verification'.`,
    channel: "rabbitmq",
    timestamp: new Date().toISOString()
  });

  res.status(211).json({
    message: "Registration initiated. Verification email queued.",
    user: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      verified: newUser.verified
    }
  });
});

app.post("/api/v1/auth/forgot-password", (req, res) => {
  const { email } = req.body;
  const user = users.find(u => u.email === email);
  if (user) {
    notifications.push({
      id: `not-${Date.now()}`,
      userId: user.id,
      type: "Password Reset",
      title: "Password Reset Triggered",
      message: `Reset password sequence initialized. Magic OTP reset token dispatched to ${email}.`,
      channel: "rabbitmq",
      timestamp: new Date().toISOString()
    });
  }
  res.json({ message: "If the email is registered, a password reset email has been dispatched via RabbitMQ." });
});

app.post("/api/v1/auth/reset-password", (req, res) => {
  const { email, newPassword } = req.body;
  const user = users.find(u => u.email === email);
  if (!user) {
    return res.status(404).json({ error: "User not found." });
  }
  user.passwordHash = newPassword;
  res.json({ message: "Password updated successfully." });
});

app.post("/api/v1/auth/verify-email", (req, res) => {
  const { userId } = req.body;
  const user = users.find(u => u.id === userId);
  if (!user) {
    return res.status(404).json({ error: "User not found." });
  }
  user.verified = true;
  res.json({ message: "Email address verified successfully!" });
});

// 4. PRODUCT SERVICE SIMULATION
app.get("/api/v1/products", (req, res) => {
  requestCounts.products++;
  let result = [...products];

  const { search, category, sort, priceMin, priceMax } = req.query;

  if (search) {
    const q = (search as string).toLowerCase();
    result = result.filter(p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
  }

  if (category) {
    result = result.filter(p => p.category === category);
  }

  if (priceMin) {
    result = result.filter(p => p.price >= parseFloat(priceMin as string));
  }

  if (priceMax) {
    result = result.filter(p => p.price <= parseFloat(priceMax as string));
  }

  if (sort) {
    if (sort === "price-low-high") {
      result.sort((a, b) => a.price - b.price);
    } else if (sort === "price-high-low") {
      result.sort((a, b) => b.price - a.price);
    } else if (sort === "rating") {
      result.sort((a, b) => b.rating - a.rating);
    }
  }

  res.json(result);
});

app.get("/api/v1/products/categories", (req, res) => {
  const categories = Array.from(new Set(products.map(p => p.category)));
  res.json(categories);
});

// Real AI Recommendations router calling Gemini
app.post("/api/v1/products/recommendations", async (req, res) => {
  const { userName, cartItems } = req.body;

  if (!ai) {
    // Fallback recommendation if no Gemini key available
    const recs = products.slice(0, 3).map(p => ({
      ...p,
      aiReason: `Hi ${userName || "valued customer"}! This hot-seller is highly recommended for tech leaders like you.`
    }));
    return res.json(recs);
  }

  try {
    const cartProductNames = cartItems ? cartItems.map((c: any) => c.name).join(", ") : "none";
    const prompt = `You are the AI personalization engine of CloudCart AI, an e-commerce store selling premium cloud developer gear, SRE clothing, and homelab accessories.
Customer name: ${userName || "Cloud Architect"}.
Current items in their cart: [${cartProductNames}].
Available store inventory items for recommending:
${JSON.stringify(products.map(p => ({ id: p.id, name: p.name, desc: p.description, price: p.price })))}

Generate recommendations selecting exactly 3 product IDs from our inventory list above. Return a JSON array matching this exact format:
[
  { "id": "prod-1", "reason": "Sleek reason highlighting how this matches their SRE or dev profile" },
  { "id": "prod-2", "reason": "Engaging recommendation reasoning" },
  { "id": "prod-3", "reason": "Engaging recommendation reasoning" }
]
Only choose from existing IDs: prod-1, prod-2, prod-3, prod-4, prod-5, prod-6. Respond ONLY with valid, parsable JSON. No backticks or explanations outside JSON.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const text = response.text || "[]";
    const parsed = JSON.parse(text);

    // Merge AI justifications into original product models
    const recommendedList = parsed.map((item: any) => {
      const original = products.find(p => p.id === item.id);
      if (original) {
        return {
          ...original,
          aiReason: item.reason
        };
      }
      return null;
    }).filter(Boolean);

    res.json(recommendedList.length ? recommendedList : products.slice(0, 3));
  } catch (err) {
    console.error("Gemini AI Recommendation Error:", err);
    res.json(products.slice(0, 3).map(p => ({
      ...p,
      aiReason: "Top pick matching cloud engineering paradigms."
    })));
  }
});

app.get("/api/v1/products/:id", (req, res) => {
  const product = products.find(p => p.id === req.params.id);
  if (!product) {
    return res.status(404).json({ error: "Product not found." });
  }
  res.json(product);
});

// Admin Product CRUD
app.post("/api/v1/products", (req, res) => {
  const { name, description, price, category, inventory, image } = req.body;
  if (!name || !price || !category) {
    return res.status(400).json({ error: "Product name, price, and category are required." });
  }

  const newProduct: Product = {
    id: `prod-${Date.now()}`,
    name,
    description: description || "Cloud native gadget.",
    price: parseFloat(price),
    category,
    inventory: parseInt(inventory) || 10,
    image: image || "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=500",
    rating: 5.0,
    reviewsCount: 0,
    featured: false,
    reviews: []
  };

  products.push(newProduct);
  res.status(201).json(newProduct);
});

app.put("/api/v1/products/:id", (req, res) => {
  const product = products.find(p => p.id === req.params.id);
  if (!product) return res.status(404).json({ error: "Product not found" });

  const { name, description, price, category, inventory, image, featured } = req.body;
  if (name) product.name = name;
  if (description) product.description = description;
  if (price !== undefined) product.price = parseFloat(price);
  if (category) product.category = category;
  if (inventory !== undefined) product.inventory = parseInt(inventory);
  if (image) product.image = image;
  if (featured !== undefined) product.featured = !!featured;

  res.json(product);
});

app.delete("/api/v1/products/:id", (req, res) => {
  const idx = products.findIndex(p => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Product not found" });
  products.splice(idx, 1);
  res.json({ message: "Product deleted successfully" });
});

// Submit review & triggers real-time Gemini AI reply
app.post("/api/v1/products/:id/reviews", async (req, res) => {
  const { userName, rating, comment } = req.body;
  const product = products.find(p => p.id === req.params.id);
  if (!product) return res.status(404).json({ error: "Product not found" });

  const reviewId = `rev-${Date.now()}`;
  let aiReply = `Thank you for reviewing the ${product.name}! We appreciate your feedback.`;

  // Get live reply from Gemini AI if available
  if (ai) {
    try {
      const prompt = `You are CloudCart AI's automated assistant. A customer named "${userName}" has left a ${rating}-star review on the product "${product.name}".
Customer comment: "${comment}".
Generate a helpful, empathetic, professional response to the customer. Max 2 sentences. Don't use placeholders.`;
      const aiResponse = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt
      });
      if (aiResponse.text) {
        aiReply = aiResponse.text.trim();
      }
    } catch (e) {
      console.error("Failed to generate AI review reply:", e);
    }
  }

  const newReview = {
    id: reviewId,
    userName: userName || "Anonymous Customer",
    rating: parseInt(rating) || 5,
    comment: comment || "",
    aiReply,
    createdAt: new Date().toISOString()
  };

  product.reviews.push(newReview);
  product.reviewsCount = product.reviews.length;
  // recalculate average rating
  const totalStars = product.reviews.reduce((sum, r) => sum + r.rating, 0);
  product.rating = parseFloat((totalStars / product.reviews.length).toFixed(1));

  res.status(201).json(newReview);
});

// 5. CART SERVICE SIMULATION (REDIS KEY-VALUE MOCK)
app.get("/api/v1/cart", (req, res) => {
  requestCounts.cart++;
  const userId = (req.query.userId as string) || "user-1";
  let cart = carts.find(c => c.userId === userId);
  if (!cart) {
    cart = { userId, items: [], discountPercent: 0 };
    carts.push(cart);
  }

  const fullItems = cart.items.map(item => {
    const product = products.find(p => p.id === item.productId);
    return {
      product,
      quantity: item.quantity
    };
  }).filter(item => item.product !== undefined);

  const totals = calculateCartTotals(cart);

  res.json({
    userId: cart.userId,
    items: fullItems,
    couponCode: cart.couponCode,
    discountPercent: cart.discountPercent,
    ...totals
  });
});

app.post("/api/v1/cart/items", (req, res) => {
  requestCounts.cart++;
  const { userId, productId, quantity } = req.body;
  const uid = userId || "user-1";
  const qty = parseInt(quantity) || 1;

  let cart = carts.find(c => c.userId === uid);
  if (!cart) {
    cart = { userId: uid, items: [], discountPercent: 0 };
    carts.push(cart);
  }

  const existingItem = cart.items.find(i => i.productId === productId);
  if (existingItem) {
    existingItem.quantity += qty;
  } else {
    cart.items.push({ productId, quantity: qty });
  }

  res.status(201).json({ message: "Item added to cart successfully", items: cart.items });
});

app.put("/api/v1/cart/items/:productId", (req, res) => {
  const { userId, quantity } = req.body;
  const uid = userId || "user-1";
  const { productId } = req.params;

  const cart = carts.find(c => c.userId === uid);
  if (!cart) return res.status(404).json({ error: "Cart not found" });

  const item = cart.items.find(i => i.productId === productId);
  if (!item) return res.status(404).json({ error: "Item not in cart" });

  item.quantity = parseInt(quantity);
  if (item.quantity <= 0) {
    cart.items = cart.items.filter(i => i.productId !== productId);
  }

  res.json({ message: "Cart item updated", items: cart.items });
});

app.delete("/api/v1/cart/items/:productId", (req, res) => {
  const userId = (req.query.userId as string) || "user-1";
  const { productId } = req.params;

  const cart = carts.find(c => c.userId === userId);
  if (!cart) return res.status(404).json({ error: "Cart not found" });

  cart.items = cart.items.filter(i => i.productId !== productId);
  res.json({ message: "Item removed from cart", items: cart.items });
});

app.post("/api/v1/cart/coupon", (req, res) => {
  const { userId, couponCode } = req.body;
  const uid = userId || "user-1";

  const cart = carts.find(c => c.userId === uid);
  if (!cart) return res.status(404).json({ error: "Cart not found" });

  const code = couponCode.toUpperCase();
  let discount = 0;

  if (code === "CLOUDCART20") {
    discount = 20;
  } else if (code === "AI50") {
    discount = 50;
  } else if (code === "HELM10") {
    discount = 10;
  } else {
    return res.status(400).json({ error: "Invalid coupon code. Try CLOUDCART20 or AI50." });
  }

  cart.couponCode = code;
  cart.discountPercent = discount;

  res.json({ message: `Coupon applied: ${discount}% discount applied.`, discountPercent: discount });
});

// 6. ORDER SERVICE SIMULATION (POSTGRESQL ORDER STORE)
app.get("/api/v1/orders", (req, res) => {
  requestCounts.orders++;
  const userId = (req.query.userId as string) || "user-1";
  const userOrders = orders.filter(o => o.userId === userId);
  res.json(userOrders);
});

app.get("/api/v1/orders/all", (req, res) => {
  res.json(orders);
});

app.get("/api/v1/orders/:id", (req, res) => {
  const order = orders.find(o => o.id === req.params.id);
  if (!order) return res.status(404).json({ error: "Order not found" });
  res.json(order);
});

app.post("/api/v1/orders", (req, res) => {
  requestCounts.orders++;
  const { userId, shippingAddress, paymentMethod } = req.body;
  const uid = userId || "user-1";

  const cart = carts.find(c => c.userId === uid);
  if (!cart || cart.items.length === 0) {
    return res.status(400).json({ error: "Your shopping cart is empty." });
  }

  // Map products
  const orderItems: any[] = [];
  cart.items.forEach(cItem => {
    const prod = products.find(p => p.id === cItem.productId);
    if (prod) {
      orderItems.push({
        productId: prod.id,
        name: prod.name,
        price: prod.price,
        quantity: cItem.quantity,
        image: prod.image
      });
      // decrease inventory
      prod.inventory = Math.max(0, prod.inventory - cItem.quantity);
    }
  });

  const totals = calculateCartTotals(cart);
  const newOrder: Order = {
    id: `ord-${1000 + orders.length + 1}`,
    userId: uid,
    items: orderItems,
    subtotal: totals.subtotal,
    tax: totals.tax,
    shipping: totals.shipping,
    discount: totals.discount,
    total: totals.total,
    shippingAddress: shippingAddress || "Default Cloud Lab Suite 1, Matrix Server Room",
    paymentMethod: paymentMethod || "Credit Card (Simulated)",
    paymentStatus: "paid",
    status: "processing",
    trackingNumber: `TRK-CC-${Math.floor(10000000 + Math.random() * 90000000)}`,
    createdAt: new Date().toISOString()
  };

  orders.push(newOrder);

  // Trigger RabbitMQ notifications
  notifications.push({
    id: `not-${Date.now()}`,
    userId: uid,
    type: "Order Confirmation",
    title: `Order Confirmed: ${newOrder.id}`,
    message: `Thank you for shopping at CloudCart AI! Your order total is $${newOrder.total}. Welcome to the next-gen cloud e-commerce paradigm.`,
    channel: "rabbitmq",
    timestamp: new Date().toISOString()
  });

  // clear cart
  cart.items = [];
  cart.couponCode = undefined;
  cart.discountPercent = 0;

  res.status(201).json(newOrder);
});

app.put("/api/v1/orders/:id/status", (req, res) => {
  const order = orders.find(o => o.id === req.params.id);
  if (!order) return res.status(404).json({ error: "Order not found" });

  const { status } = req.body;
  order.status = status;

  if (status === "shipped") {
    notifications.push({
      id: `not-${Date.now()}`,
      userId: order.userId,
      type: "Order Shipped",
      title: `Order Shipped: ${order.id}`,
      message: `Your package has left the Cloud Run container warehouse! Tracking number: ${order.trackingNumber}`,
      channel: "rabbitmq",
      timestamp: new Date().toISOString()
    });
  }

  res.json(order);
});

// 7. NOTIFICATION SERVICE SIMULATION (RABBITMQ QUEUES VIEW)
app.get("/api/v1/notifications", (req, res) => {
  res.json(notifications);
});

// Serve frontend app
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`CloudCart AI Gateway Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
