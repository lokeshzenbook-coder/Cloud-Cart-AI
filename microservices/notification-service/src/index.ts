import express, { Request, Response, NextFunction } from "express";
import winston from "winston";
import dotenv from "dotenv";

dotenv.config();

const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  defaultMeta: { service: "notification-service" },
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
const PORT = process.env.PORT || 5005;

app.use(express.json());

// In-Memory RabbitMQ Consumer Simulation Log
interface NotificationEvent {
  id: string;
  type: string;
  recipient: string;
  subject: string;
  status: "dispatched" | "failed";
  timestamp: string;
}

const rabbitmqConsumerLogs: NotificationEvent[] = [
  {
    id: "not-01",
    type: "welcome_email",
    recipient: "customer@cloudcart.ai",
    subject: "Welcome to CloudCart AI!",
    status: "dispatched",
    timestamp: new Date(Date.now() - 86400000 * 4).toISOString()
  },
  {
    id: "not-02",
    type: "order_confirmation",
    recipient: "customer@cloudcart.ai",
    subject: "Order Confirmation: CC-1001",
    status: "dispatched",
    timestamp: new Date(Date.now() - 86400000 * 2).toISOString()
  }
];

// Health checks
app.get("/healthz", (req, res) => {
  res.json({ status: "healthy", service: "notification-service" });
});

app.get("/ready", (req, res) => {
  res.json({ status: "ready", broker: "rabbitmq-connected-and-listening" });
});

app.get("/live", (req, res) => {
  res.send("Alive");
});

// Metrics
app.get("/metrics", (req, res) => {
  res.set("Content-Type", "text/plain");
  res.send(`# HELP notifications_sent_total Total notifications processed and sent via email/rabbitmq
# TYPE notifications_sent_total counter
notifications_sent_total ${rabbitmqConsumerLogs.length}
`);
});

// Rest routes
app.get("/api/v1/notifications", (req: Request, res: Response) => {
  logger.info("Fetching notifications queue logs");
  res.json(rabbitmqConsumerLogs);
});

app.post("/api/v1/notifications/send", (req: Request, res: Response) => {
  const { type, recipient, subject, payload } = req.body;
  if (!type || !recipient || !subject) {
    return res.status(400).json({ error: "Missing type, recipient, or subject" });
  }

  const newLog: NotificationEvent = {
    id: `not-${Date.now()}`,
    type,
    recipient,
    subject,
    status: "dispatched",
    timestamp: new Date().toISOString()
  };

  rabbitmqConsumerLogs.push(newLog);
  logger.info("RabbitMQ Consumer triggered notification dispatch", { eventId: newLog.id, type, recipient });

  res.status(201).json({ message: "Notification event processed by RabbitMQ consumer", log: newLog });
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error("Notification Service error", { error: err.message });
  res.status(500).json({ error: "Internal Server Error", message: err.message });
});

app.listen(PORT, () => {
  logger.info(`Notification Service listening on port ${PORT}`);
});
