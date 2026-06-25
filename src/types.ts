export interface Review {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  aiReply?: string;
  createdAt: string;
}

export interface Product {
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
  reviews: Review[];
  aiReason?: string; // added dynamically by Gemini Personalization
}

export interface CartProductItem {
  product: Product;
  quantity: number;
}

export interface CartData {
  userId: string;
  items: CartProductItem[];
  couponCode?: string;
  discountPercent: number;
  subtotal: number;
  discount: number;
  tax: number;
  shipping: number;
  total: number;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
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

export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "customer";
  verified: boolean;
  avatar?: string;
}

export interface NotificationEvent {
  id: string;
  type: string;
  userId: string;
  title: string;
  message: string;
  channel: "email" | "rabbitmq" | "alert";
  timestamp: string;
  status?: string;
  recipient?: string;
}

export interface SystemMetrics {
  cpu: number;
  memory: number;
  uptime: number;
}
