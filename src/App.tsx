import { useState, useEffect } from "react";
import axios from "axios";
import { 
  Terminal, 
  Layers, 
  CheckCircle, 
  XCircle, 
  ArrowRight,
  ShieldAlert,
  Server,
  Activity,
  Github
} from "lucide-react";

import { User, Product, CartData, Order, NotificationEvent } from "./types";
import Navbar from "./components/Navbar";

// Page Imports
import LandingPage from "./components/pages/LandingPage";
import ProductsPage from "./components/pages/ProductsPage";
import ProductDetailsPage from "./components/pages/ProductDetailsPage";
import CartPage from "./components/pages/CartPage";
import CheckoutPage from "./components/pages/CheckoutPage";
import OrdersPage from "./components/pages/OrdersPage";
import ProfilePage from "./components/pages/ProfilePage";
import LoginPage from "./components/pages/LoginPage";
import RegisterPage from "./components/pages/RegisterPage";
import DashboardPage from "./components/pages/DashboardPage";
import AdminDashboard from "./components/pages/AdminDashboard";

export default function App() {
  // NAVIGATION ROUTING STATE
  const [activePage, setActivePage] = useState<string>("landing");
  const [activeParams, setActiveParams] = useState<any>({});

  // CENTRAL SYNCHRONIZED APP STATES
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem("cloudcart_user");
    return saved ? JSON.parse(saved) : null;
  });
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [cart, setCart] = useState<CartData>({
    userId: "user-1",
    items: [],
    discountPercent: 0,
    subtotal: 0,
    discount: 0,
    tax: 0,
    shipping: 0,
    total: 0
  });
  const [orders, setOrders] = useState<Order[]>([]);
  const [notifications, setNotifications] = useState<NotificationEvent[]>([]);

  // THEME STATE
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem("cloudcart_dark") === "true";
  });

  // TOAST STATES
  const [toastMsg, setToastMsg] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");

  // SYSTEM METRICS LOG
  const [k8sUptime, setK8sUptime] = useState<number>(0);

  // Sync class name for dark mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("cloudcart_dark", String(darkMode));
  }, [darkMode]);

  // Toast helper
  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToastMsg(msg);
    setToastType(type);
    setTimeout(() => setToastMsg(""), 4000);
  };

  // INITIAL LOAD
  useEffect(() => {
    fetchProducts();
    fetchCategories();
    if (currentUser) {
      fetchCart(currentUser.id);
      fetchOrders(currentUser.id);
    } else {
      // load default sandbox cart
      fetchCart("user-1");
    }
    fetchNotifications();

    // Poll live SRE notifications queue every 6 seconds to show background RabbitMQ logs
    const interval = setInterval(() => {
      fetchNotifications();
      setK8sUptime(prev => prev + 6);
    }, 6000);

    return () => clearInterval(interval);
  }, [currentUser]);

  // API OPERATIONS
  const fetchProducts = async () => {
    try {
      const res = await axios.get("/api/v1/products");
      setProducts(res.data);
    } catch (err) {
      console.error("Failed to load products", err);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get("/api/v1/products/categories");
      setCategories(res.data);
    } catch (err) {
      console.error("Failed to load categories", err);
    }
  };

  const fetchCart = async (userId: string) => {
    try {
      const res = await axios.get(`/api/v1/cart?userId=${userId}`);
      setCart(res.data);
    } catch (err) {
      console.error("Failed to load cart cache", err);
    }
  };

  const fetchOrders = async (userId: string) => {
    try {
      const endpoint = currentUser?.role === "admin" ? "/api/v1/orders/all" : `/api/v1/orders?userId=${userId}`;
      const res = await axios.get(endpoint);
      setOrders(res.data);
    } catch (err) {
      console.error("Failed to load order history", err);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await axios.get("/api/v1/notifications");
      setNotifications(res.data);
    } catch (err) {
      console.error("Failed to fetch RabbitMQ notifications", err);
    }
  };

  // HANDLERS
  const handleLogin = async (email: string, pass: string) => {
    try {
      const res = await axios.post("/api/v1/auth/login", { email, password: pass });
      const userData = res.data.user;
      setCurrentUser(userData);
      localStorage.setItem("cloudcart_user", JSON.stringify(userData));
      showToast(`Welcome back, SRE ${userData.name}! Authentication verified.`, "success");
      
      // Navigate depending on role
      if (userData.role === "admin") {
        setActivePage("admin-dashboard");
      } else {
        setActivePage("dashboard");
      }
    } catch (err: any) {
      const errMsg = err.response?.data?.error || "Invalid user credentials.";
      showToast(errMsg, "error");
      throw new Error(errMsg);
    }
  };

  const handleRegister = async (name: string, email: string, pass: string, role: "admin" | "customer") => {
    try {
      await axios.post("/api/v1/auth/register", { name, email, password: pass, role });
      showToast("Identity committed successfully! Email confirmation queued.", "success");
      setActivePage("login");
    } catch (err: any) {
      const errMsg = err.response?.data?.error || "Registration rejected.";
      showToast(errMsg, "error");
      throw new Error(errMsg);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem("cloudcart_user");
    showToast("Session de-authenticated successfully.");
    setActivePage("landing");
  };

  const handleAddToCart = async (productId: string) => {
    const userId = currentUser ? currentUser.id : "user-1";
    try {
      await axios.post("/api/v1/cart/items", { userId, productId, quantity: 1 });
      await fetchCart(userId);
      showToast("Provisioned 1 item to Redis-cached cart!", "success");
    } catch (err) {
      showToast("Failed to cache cart item", "error");
    }
  };

  const handleUpdateQuantity = async (productId: string, quantity: number) => {
    const userId = currentUser ? currentUser.id : "user-1";
    try {
      await axios.put(`/api/v1/cart/items/${productId}`, { userId, quantity });
      await fetchCart(userId);
    } catch (err) {
      showToast("Failed to update cart cache", "error");
    }
  };

  const handleRemoveItem = async (productId: string) => {
    const userId = currentUser ? currentUser.id : "user-1";
    try {
      await axios.delete(`/api/v1/cart/items/${productId}?userId=${userId}`);
      await fetchCart(userId);
      showToast("De-allocated item from Redis-cached cart.");
    } catch (err) {
      showToast("Failed to clear cart item", "error");
    }
  };

  const handleApplyCoupon = async (couponCode: string) => {
    const userId = currentUser ? currentUser.id : "user-1";
    try {
      await axios.post("/api/v1/cart/coupon", { userId, couponCode });
      await fetchCart(userId);
      showToast(`Coupon applied successfully!`, "success");
    } catch (err: any) {
      const errMsg = err.response?.data?.error || "Invalid coupon code.";
      showToast(errMsg, "error");
      throw new Error(errMsg);
    }
  };

  const handlePlaceOrder = async (shippingAddress: string, paymentMethod: string) => {
    const userId = currentUser ? currentUser.id : "user-1";
    try {
      await axios.post("/api/v1/orders", { userId, shippingAddress, paymentMethod });
      await fetchCart(userId); // clear cart locally
      await fetchOrders(userId); // pull new order history
      showToast("Transaction confirmed! Notification published to AMQP broker.", "success");
      setActivePage("orders");
    } catch (err: any) {
      const errMsg = err.response?.data?.error || "Failed to commit transaction.";
      showToast(errMsg, "error");
      throw new Error(errMsg);
    }
  };

  const handleVerifyEmail = async (userId: string) => {
    try {
      await axios.post("/api/v1/auth/verify-email", { userId });
      if (currentUser) {
        const updated = { ...currentUser, verified: true };
        setCurrentUser(updated);
        localStorage.setItem("cloudcart_user", JSON.stringify(updated));
      }
      showToast("Account credentials flagged as verified SRE!", "success");
    } catch (err) {
      showToast("Failed to verify credentials", "error");
    }
  };

  const handleSubmitReview = async (productId: string, userName: string, rating: number, comment: string) => {
    try {
      await axios.post(`/api/v1/products/${productId}/reviews`, { userName, rating, comment });
      await fetchProducts(); // pull fresh ratings/review logs
      showToast("Quality Report filed to product database!", "success");
    } catch (err) {
      showToast("Failed to submit quality report", "error");
    }
  };

  // ADMIN-ONLY HANDLERS
  const handleAddProduct = async (p: Omit<Product, "id" | "reviews" | "rating" | "reviewsCount">) => {
    try {
      await axios.post("/api/v1/products", p);
      await fetchProducts();
      showToast("Swag deployed to catalog registry!", "success");
    } catch (err) {
      showToast("Failed to register new swag", "error");
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      await axios.delete(`/api/v1/products/${id}`);
      await fetchProducts();
      showToast("De-commissioned product stock from catalog.");
    } catch (err) {
      showToast("Failed to delete stock element", "error");
    }
  };

  const handleUpdateInventory = async (id: string, newInventory: number) => {
    try {
      await axios.put(`/api/v1/products/${id}`, { inventory: newInventory });
      await fetchProducts();
      showToast("Product replicas count updated in database.");
    } catch (err) {
      showToast("Failed to alter inventory quota", "error");
    }
  };

  // ROUTER CONTROLLER SELECTOR
  const renderPage = () => {
    switch (activePage) {
      case "landing":
        return (
          <LandingPage
            onNavigate={(page, params) => {
              setActivePage(page);
              if (params) setActiveParams(params);
            }}
            featuredProducts={products.filter((p) => p.featured)}
            onAddToCart={handleAddToCart}
          />
        );
      case "products":
        return (
          <ProductsPage
            products={products}
            categories={categories}
            onAddToCart={handleAddToCart}
            onSelectProduct={(productId) => {
              setActivePage("product-details");
              setActiveParams({ productId });
            }}
            initialSearch={activeParams.search || ""}
          />
        );
      case "product-details":
        const targetProduct = products.find((p) => p.id === activeParams.productId);
        if (!targetProduct) {
          return <div className="text-center py-20">Product specifications missing or loading...</div>;
        }
        return (
          <ProductDetailsPage
            product={targetProduct}
            onAddToCart={handleAddToCart}
            onSubmitReview={handleSubmitReview}
            currentUser={currentUser}
          />
        );
      case "cart":
        return (
          <CartPage
            cart={cart}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveItem}
            onApplyCoupon={handleApplyCoupon}
            onNavigate={(page) => setActivePage(page)}
          />
        );
      case "checkout":
        return (
          <CheckoutPage
            cart={cart}
            onPlaceOrder={handlePlaceOrder}
            onNavigate={(page) => setActivePage(page)}
          />
        );
      case "orders":
        return <OrdersPage orders={orders} />;
      case "profile":
        if (!currentUser) return <LoginPage onLogin={handleLogin} onNavigate={(page) => setActivePage(page)} />;
        return (
          <ProfilePage
            user={currentUser}
            onVerifyEmail={handleVerifyEmail}
            onNavigate={(page) => setActivePage(page)}
          />
        );
      case "login":
        return <LoginPage onLogin={handleLogin} onNavigate={(page) => setActivePage(page)} />;
      case "register":
        return <RegisterPage onRegister={handleRegister} onNavigate={(page) => setActivePage(page)} />;
      case "dashboard":
        if (!currentUser) return <LoginPage onLogin={handleLogin} onNavigate={(page) => setActivePage(page)} />;
        return (
          <DashboardPage
            user={currentUser}
            orders={orders}
            onNavigate={(page) => setActivePage(page)}
          />
        );
      case "admin-dashboard":
        if (!currentUser || currentUser.role !== "admin") {
          return <div className="max-w-md mx-auto text-center py-20">Access denied. Admin authority required.</div>;
        }
        return (
          <AdminDashboard
            products={products}
            orders={orders}
            notifications={notifications}
            onAddProduct={handleAddProduct}
            onDeleteProduct={handleDeleteProduct}
            onUpdateInventory={handleUpdateInventory}
          />
        );
      default:
        return (
          <LandingPage
            onNavigate={(page, params) => {
              setActivePage(page);
              if (params) setActiveParams(params);
            }}
            featuredProducts={products.filter((p) => p.featured)}
            onAddToCart={handleAddToCart}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col justify-between transition-colors duration-200">
      
      {/* Dynamic Slide-out Alert Notification system */}
      {toastMsg && (
        <div className="fixed top-20 right-4 z-[99] max-w-sm w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 shadow-2xl flex items-center gap-3 animate-slide-in font-sans">
          {toastType === "success" ? (
            <CheckCircle className="text-emerald-500 shrink-0" size={18} />
          ) : (
            <XCircle className="text-red-500 shrink-0" size={18} />
          )}
          <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-100 leading-tight">
            {toastMsg}
          </p>
        </div>
      )}

      {/* Navigation */}
      <Navbar
        user={currentUser}
        onLogout={handleLogout}
        cartCount={cart.items.reduce((acc, curr) => acc + curr.quantity, 0)}
        onNavigate={(page, params) => {
          setActivePage(page);
          setActiveParams(params || {});
        }}
        activePage={activePage}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
        notifications={notifications}
        products={products}
      />

      {/* Primary Sub-Page View container */}
      <main className="flex-1">
        {renderPage()}
      </main>

      {/* Modern Professional Footer */}
      <footer className="bg-zinc-50 dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 py-12 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10 text-xs">
            
            {/* Branding Column */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-indigo-600 rounded text-white">
                  <Layers size={15} />
                </div>
                <span className="font-sans font-bold text-sm tracking-tight text-zinc-950 dark:text-white">
                  CloudCart<span className="text-indigo-600">AI</span>
                </span>
              </div>
              <p className="text-zinc-500 leading-relaxed font-sans max-w-xs">
                A fully modular cloud-native e-commerce simulation environment built with container orchestrators, message brokers, and Google Gemini.
              </p>
            </div>

            {/* Quick Links Column */}
            <div>
              <h4 className="font-semibold text-zinc-800 dark:text-zinc-200 mb-4 font-sans">RESOURCES</h4>
              <ul className="space-y-2.5 text-zinc-500 font-mono">
                <li><button onClick={() => setActivePage("products")} className="hover:text-indigo-600 dark:hover:text-indigo-400">Inventory Catalog</button></li>
                <li><button onClick={() => { setActivePage("login"); }} className="hover:text-indigo-600 dark:hover:text-indigo-400">Admin Console</button></li>
                <li><button onClick={() => setActivePage("dashboard")} className="hover:text-indigo-600 dark:hover:text-indigo-400">Kubectl Dashboard</button></li>
              </ul>
            </div>

            {/* Infrastructure Specs Column */}
            <div>
              <h4 className="font-semibold text-zinc-800 dark:text-zinc-200 mb-4 font-sans">INFRASTRUCTURE</h4>
              <ul className="space-y-2.5 text-zinc-500 font-mono">
                <li>K8s Cluster Ready</li>
                <li>RabbitMQ Live Queue</li>
                <li>Redis Cart Caching</li>
                <li>MongoDB Store Catalog</li>
              </ul>
            </div>

            {/* SRE Live Stats Column */}
            <div>
              <h4 className="font-semibold text-zinc-800 dark:text-zinc-200 mb-4 font-sans">SRE LIVE STREAM</h4>
              <div className="bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg p-3 text-[10.5px] font-mono text-zinc-600 dark:text-zinc-400">
                <div className="flex items-center justify-between mb-1">
                  <span>Node SLA:</span>
                  <span className="text-emerald-500 font-bold">99.997%</span>
                </div>
                <div className="flex items-center justify-between mb-1">
                  <span>RAM Usage:</span>
                  <span className="text-indigo-500">256MB / 512MB</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Kubectl Uptime:</span>
                  <span>{k8sUptime}s</span>
                </div>
              </div>
            </div>

          </div>

          {/* Bottom segment */}
          <div className="border-t border-zinc-200 dark:border-zinc-800 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-[11px] text-zinc-500">
            <span>&copy; {new Date().getFullYear()} CloudCart AI Corp. All rights reserved.</span>
            <div className="flex items-center gap-1">
              <Github size={13} />
              <span>Version 1.0.0 (Helm-Installed Stable Deployment)</span>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
