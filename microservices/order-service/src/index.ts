import express, { Request, Response, NextFunction } from "express";
import winston from "winston";
import dotenv from "dotenv";

dotenv.config();

const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  defaultMeta: { service: "order-service" },
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
const PORT = process.env.PORT || 5004;

app.use(express.json());

// In-Memory PostgreSQL Store for Orders
interface Order {
  id: string;
  userId: string;
  items: Array<{ productId: string; name: string; price: number; quantity: number }>;
  total: number;
  status: "processing" | "shipped" | "delivered" | "cancelled";
  trackingNumber: string;
  createdAt: string;
}

const pgOrdersTable: Order[] = [
  {
    id: "ord-1001",
    userId: "user-1",
    items: [{ productId: "prod-2", name: "DevOps Desk Lamp (RGB)", price: 59.99, quantity: 1 }],
    total: 74.79,
    status: "shipped",
    trackingNumber: "TRK-CC-79482759",
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
  }
];

// Health endpoints
app.get("/healthz", (req, res) => {
  res.json({ status: "healthy", service: "order-service" });
});

app.get("/ready", (req, res) => {
  res.json({ status: "ready", database: "postgresql-connected", broker: "rabbitmq-connected" });
});

app.get("/live", (req, res) => {
  res.send("Alive");
});

// Prometheus metrics
app.get("/metrics", (req, res) => {
  res.set("Content-Type", "text/plain");
  res.send(`# HELP orders_placed_total Total orders placed through CloudCart AI
# TYPE orders_placed_total counter
orders_placed_total ${pgOrdersTable.length}
`);
});

// REST routes
app.get("/api/v1/orders", (req: Request, res: Response) => {
  const userId = (req.query.userId as string) || "user-1";
  logger.info("Fetching orders", { userId });
  const userOrders = pgOrdersTable.filter(o => o.userId === userId);
  res.json(userOrders);
});

app.get("/api/v1/orders/all", (req: Request, res: Response) => {
  logger.info("Admin fetching all orders across microservices");
  res.json(pgOrdersTable);
});

app.get("/api/v1/orders/:id", (req: Request, res: Response) => {
  const order = pgOrdersTable.find(o => o.id === req.params.id);
  if (!order) return res.status(404).json({ error: "Order not found" });
  res.json(order);
});

app.post("/api/v1/orders", (req: Request, res: Response) => {
  const { userId, items, total, shippingAddress } = req.body;
  const uid = userId || "user-1";

  if (!items || items.length === 0 || !total) {
    return res.status(400).json({ error: "Missing required order creation details" });
  }

  const newOrder: Order = {
    id: `ord-${1000 + pgOrdersTable.length + 1}`,
    userId: uid,
    items,
    total: parseFloat(total),
    status: "processing",
    trackingNumber: `TRK-CC-${Math.floor(10000000 + Math.random() * 90000000)}`,
    createdAt: new Date().toISOString()
  };

  pgOrdersTable.push(newOrder);

  // Publish event to RabbitMQ
  logger.info("Order created. Publishing event 'order.created' to RabbitMQ exchange", {
    orderId: newOrder.id,
    userId: newOrder.userId,
    routingKey: "notifications.order.confirmation"
  });

  res.status(201).json(newOrder);
});

app.put("/api/v1/orders/:id/status", (req: Request, res: Response) => {
  const order = pgOrdersTable.find(o => o.id === req.params.id);
  if (!order) return res.status(404).json({ error: "Order not found" });

  const { status } = req.body;
  order.status = status;

  logger.info("Order status updated. Publishing event to RabbitMQ broker", {
    orderId: order.id,
    newStatus: status
  });

  res.json(order);
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error("Order Service error", { error: err.message });
  res.status(500).json({ error: "Internal Server Error", message: err.message });
});

app.listen(PORT, () => {
  logger.info(`Order Service listening on port ${PORT}`);
});
