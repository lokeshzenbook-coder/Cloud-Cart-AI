import express, { Request, Response, NextFunction } from "express";
import winston from "winston";
import dotenv from "dotenv";

dotenv.config();

const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  defaultMeta: { service: "product-service" },
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
const PORT = process.env.PORT || 5002;

app.use(express.json());

// In-Memory MongoDB Mock Store for Products
interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  inventory: number;
  image: string;
  rating: number;
}

const mongoProductsTable: Product[] = [
  {
    id: "prod-1",
    name: "KubeKeyboard Pro-V4",
    description: "Premium split mechanical keyboard optimized for fast Kubernetes debugging. Features hot-swappable MX Cherry Blue switches.",
    price: 189.99,
    category: "Developer Hardware",
    inventory: 42,
    image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500",
    rating: 4.8,
  },
  {
    id: "prod-2",
    name: "DevOps Desk Lamp (RGB)",
    description: "Intelligent ambient lamp that links directly with Prometheus metrics or Grafana charts.",
    price: 59.99,
    category: "Smart Office",
    inventory: 85,
    image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500",
    rating: 4.5,
  },
  {
    id: "prod-3",
    name: "Helm Chart Hoodie",
    description: "Ultra-comfy, heavyweight organic cotton hoodie featuring Helm blueprint.",
    price: 49.99,
    category: "DevOps Gear",
    inventory: 150,
    image: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=500",
    rating: 4.9,
  }
];

// Health Endpoints
app.get("/healthz", (req, res) => {
  res.json({ status: "healthy", service: "product-service" });
});

app.get("/ready", (req, res) => {
  res.json({ status: "ready", database: "mongodb-connected" });
});

app.get("/live", (req, res) => {
  res.send("Alive");
});

// Metrics
app.get("/metrics", (req, res) => {
  res.set("Content-Type", "text/plain");
  res.send(`# HELP product_count Total number of products in stock catalog
# TYPE product_count gauge
product_count ${mongoProductsTable.length}
`);
});

// REST routes
app.get("/api/v1/products", (req: Request, res: Response) => {
  logger.info("Fetching all products");
  const { category, search } = req.query;
  let result = [...mongoProductsTable];

  if (category) {
    result = result.filter(p => p.category === category);
  }
  if (search) {
    const q = (search as string).toLowerCase();
    result = result.filter(p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
  }

  res.json(result);
});

app.get("/api/v1/products/categories", (req, res) => {
  const categories = Array.from(new Set(mongoProductsTable.map(p => p.category)));
  res.json(categories);
});

app.get("/api/v1/products/:id", (req: Request, res: Response) => {
  const product = mongoProductsTable.find(p => p.id === req.params.id);
  if (!product) {
    return res.status(404).json({ error: "Product not found" });
  }
  res.json(product);
});

// Admin CRUDS
app.post("/api/v1/products", (req: Request, res: Response) => {
  const { name, description, price, category, inventory, image } = req.body;
  if (!name || !price || !category) {
    return res.status(400).json({ error: "Missing required product fields" });
  }

  const newProduct: Product = {
    id: `prod-${Date.now()}`,
    name,
    description: description || "",
    price: parseFloat(price),
    category,
    inventory: parseInt(inventory) || 0,
    image: image || "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=500",
    rating: 5.0,
  };

  mongoProductsTable.push(newProduct);
  logger.info("Product created", { productId: newProduct.id });
  res.status(201).json(newProduct);
});

app.put("/api/v1/products/:id", (req: Request, res: Response) => {
  const product = mongoProductsTable.find(p => p.id === req.params.id);
  if (!product) {
    return res.status(404).json({ error: "Product not found" });
  }

  const { name, description, price, category, inventory, image } = req.body;
  if (name) product.name = name;
  if (description) product.description = description;
  if (price !== undefined) product.price = parseFloat(price);
  if (category) product.category = category;
  if (inventory !== undefined) product.inventory = parseInt(inventory);
  if (image) product.image = image;

  logger.info("Product updated", { productId: product.id });
  res.json(product);
});

app.delete("/api/v1/products/:id", (req: Request, res: Response) => {
  const index = mongoProductsTable.findIndex(p => p.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: "Product not found" });
  }
  mongoProductsTable.splice(index, 1);
  logger.info("Product deleted", { productId: req.params.id });
  res.json({ message: "Product deleted successfully" });
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error("Product service error", { error: err.message });
  res.status(500).json({ error: "Internal Server Error", message: err.message });
});

app.listen(PORT, () => {
  logger.info(`Product Service listening on port ${PORT}`);
});
