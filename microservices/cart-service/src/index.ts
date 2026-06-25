import express, { Request, Response, NextFunction } from "express";
import winston from "winston";
import dotenv from "dotenv";

dotenv.config();

const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  defaultMeta: { service: "cart-service" },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
  ],
});

const app = express();
const PORT = process.env.PORT || 5003;

app.use(express.json());

// Redis Key-Value Store Mock for Cart Cache
// Key format: cart:<userId>
const redisMockStore = new Map<string, string>();

// Seed default cart
redisMockStore.set("cart:user-1", JSON.stringify({
  items: [
    { productId: "prod-1", quantity: 1 },
    { productId: "prod-3", quantity: 2 }
  ],
  couponCode: null,
  discountPercent: 0
}));

// Health checks
app.get("/healthz", (req, res) => {
  res.json({ status: "healthy", service: "cart-service" });
});

app.get("/ready", (req, res) => {
  res.json({ status: "ready", database: "redis-connected" });
});

app.get("/live", (req, res) => {
  res.send("Alive");
});

// Metrics
app.get("/metrics", (req, res) => {
  res.set("Content-Type", "text/plain");
  res.send(`# HELP active_carts_total Total active cart sessions in Redis cache
# TYPE active_carts_total gauge
active_carts_total ${redisMockStore.size}
`);
});

// Cart APIs
app.get("/api/v1/cart", (req: Request, res: Response) => {
  const userId = (req.query.userId as string) || "user-1";
  logger.info("Retrieving cart cache", { userId });

  const rawCart = redisMockStore.get(`cart:${userId}`);
  if (!rawCart) {
    const emptyCart = { items: [], couponCode: null, discountPercent: 0 };
    redisMockStore.set(`cart:${userId}`, JSON.stringify(emptyCart));
    return res.json(emptyCart);
  }

  res.json(JSON.parse(rawCart));
});

app.post("/api/v1/cart/items", (req: Request, res: Response) => {
  const { userId, productId, quantity } = req.body;
  const uid = userId || "user-1";
  const qty = parseInt(quantity) || 1;

  logger.info("Adding item to cart", { uid, productId, qty });

  let cart = { items: [] as any[], couponCode: null, discountPercent: 0 };
  const rawCart = redisMockStore.get(`cart:${uid}`);
  if (rawCart) {
    cart = JSON.parse(rawCart);
  }

  const existing = cart.items.find((i: any) => i.productId === productId);
  if (existing) {
    existing.quantity += qty;
  } else {
    cart.items.push({ productId, quantity: qty });
  }

  redisMockStore.set(`cart:${uid}`, JSON.stringify(cart));
  res.status(201).json(cart);
});

app.put("/api/v1/cart/items/:productId", (req: Request, res: Response) => {
  const { userId, quantity } = req.body;
  const { productId } = req.params;
  const uid = userId || "user-1";

  logger.info("Modifying cart item quantity", { uid, productId, quantity });

  const rawCart = redisMockStore.get(`cart:${uid}`);
  if (!rawCart) {
    return res.status(404).json({ error: "Cart not found" });
  }

  const cart = JSON.parse(rawCart);
  const item = cart.items.find((i: any) => i.productId === productId);
  if (!item) {
    return res.status(404).json({ error: "Item not in cart" });
  }

  item.quantity = parseInt(quantity);
  if (item.quantity <= 0) {
    cart.items = cart.items.filter((i: any) => i.productId !== productId);
  }

  redisMockStore.set(`cart:${uid}`, JSON.stringify(cart));
  res.json(cart);
});

app.delete("/api/v1/cart/items/:productId", (req: Request, res: Response) => {
  const userId = (req.query.userId as string) || "user-1";
  const { productId } = req.params;

  logger.info("Removing item from cart", { userId, productId });

  const rawCart = redisMockStore.get(`cart:${userId}`);
  if (!rawCart) {
    return res.status(404).json({ error: "Cart not found" });
  }

  const cart = JSON.parse(rawCart);
  cart.items = cart.items.filter((i: any) => i.productId !== productId);

  redisMockStore.set(`cart:${userId}`, JSON.stringify(cart));
  res.json(cart);
});

app.post("/api/v1/cart/coupon", (req: Request, res: Response) => {
  const { userId, couponCode } = req.body;
  const uid = userId || "user-1";

  logger.info("Applying coupon code", { uid, couponCode });

  const rawCart = redisMockStore.get(`cart:${uid}`);
  if (!rawCart) {
    return res.status(404).json({ error: "Cart not found" });
  }

  const cart = JSON.parse(rawCart);
  const code = couponCode.toUpperCase();
  let discount = 0;

  if (code === "CLOUDCART20") discount = 20;
  else if (code === "AI50") discount = 50;
  else return res.status(400).json({ error: "Invalid coupon code" });

  cart.couponCode = code;
  cart.discountPercent = discount;

  redisMockStore.set(`cart:${uid}`, JSON.stringify(cart));
  res.json({ message: "Coupon applied successfully", discountPercent: discount });
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error("Cart Service error", { error: err.message });
  res.status(500).json({ error: "Internal Server Error", message: err.message });
});

app.listen(PORT, () => {
  logger.info(`Cart Service listening on port ${PORT}`);
});
