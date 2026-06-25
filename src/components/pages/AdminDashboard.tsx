import React, { useState } from "react";
import { Terminal, Package, Plus, Trash2, Edit3, DollarSign, Activity, Settings, Bell, RefreshCw } from "lucide-react";
import { Product, Order, NotificationEvent } from "../../types";

interface AdminDashboardProps {
  products: Product[];
  orders: Order[];
  notifications: NotificationEvent[];
  onAddProduct: (p: Omit<Product, "id" | "reviews" | "rating" | "reviewsCount">) => void;
  onDeleteProduct: (id: string) => void;
  onUpdateInventory: (id: string, newInventory: number) => void;
}

export default function AdminDashboard({
  products,
  orders,
  notifications,
  onAddProduct,
  onDeleteProduct,
  onUpdateInventory
}: AdminDashboardProps) {
  // Add product form states
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState<number>(49.99);
  const [category, setCategory] = useState("Swag");
  const [inventory, setInventory] = useState<number>(50);
  const [image, setImage] = useState("https://images.unsplash.com/photo-1576016770956-debb63d90029?w=300");

  const [activeTab, setActiveTab] = useState<"sales" | "inventory" | "queue">("sales");

  // Calculations
  const grossSales = orders.reduce((acc, curr) => acc + curr.total, 0);
  const totalOrders = orders.length;
  const uniqueUsers = Array.from(new Set(orders.map(o => o.userId))).length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAddProduct({
      name,
      description,
      price,
      category,
      inventory,
      image,
      featured: true
    });
    // Reset Form
    setName("");
    setDescription("");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans text-zinc-900 dark:text-zinc-100">
      
      {/* Admin header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-sans font-extrabold text-zinc-950 dark:text-white flex items-center gap-2">
            <Settings className="text-indigo-600 animate-spin" size={24} /> SRE Admin Dashboard
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Cluster Console Context • Active Namespace: <span className="font-mono text-indigo-500 font-bold">cloudcart</span>
          </p>
        </div>

        {/* Tab selection */}
        <div className="flex bg-zinc-100 dark:bg-zinc-900 p-1 rounded-lg border border-zinc-200 dark:border-zinc-800 text-xs">
          <button
            onClick={() => setActiveTab("sales")}
            className={`px-3 py-1.5 rounded-md font-mono transition-colors cursor-pointer ${
              activeTab === "sales" ? "bg-white dark:bg-zinc-800 font-bold text-indigo-600 shadow-xs" : "text-zinc-500"
            }`}
          >
            Sales Metrics
          </button>
          <button
            onClick={() => setActiveTab("inventory")}
            className={`px-3 py-1.5 rounded-md font-mono transition-colors cursor-pointer ${
              activeTab === "inventory" ? "bg-white dark:bg-zinc-800 font-bold text-indigo-600 shadow-xs" : "text-zinc-500"
            }`}
          >
            Product CRUD
          </button>
          <button
            onClick={() => setActiveTab("queue")}
            className={`px-3 py-1.5 rounded-md font-mono transition-colors cursor-pointer ${
              activeTab === "queue" ? "bg-white dark:bg-zinc-800 font-bold text-indigo-600 shadow-xs" : "text-zinc-500"
            }`}
          >
            RabbitMQ Queue
          </button>
        </div>
      </div>

      {/* Overview stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Gross Sales</span>
            <DollarSign className="text-emerald-500" size={16} />
          </div>
          <span className="text-2xl font-mono font-bold">${grossSales.toFixed(2)}</span>
        </div>
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Orders Handled</span>
            <Package className="text-indigo-500" size={16} />
          </div>
          <span className="text-2xl font-mono font-bold">{totalOrders}</span>
        </div>
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Subscribed Users</span>
            <Activity className="text-blue-500" size={16} />
          </div>
          <span className="text-2xl font-mono font-bold">{uniqueUsers}</span>
        </div>
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Active Stock Catalog</span>
            <Plus className="text-purple-500" size={16} />
          </div>
          <span className="text-2xl font-mono font-bold">{products.length} Items</span>
        </div>
      </div>

      {/* Tab Contents */}
      {activeTab === "sales" && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6">
          <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-500 font-mono mb-5 flex items-center gap-1.5">
            <Terminal size={14} className="text-indigo-600" /> PostgreSQL Sales Transaction Logs
          </h2>

          {orders.length === 0 ? (
            <div className="text-center py-10 text-zinc-500 font-mono text-xs">
              No sales recorded on the ledger yet.
            </div>
          ) : (
            <div className="overflow-x-auto text-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-100 dark:border-zinc-800 text-zinc-400 font-mono uppercase">
                    <th className="pb-3">Order Hash</th>
                    <th className="pb-3">Recipient Address</th>
                    <th className="pb-3">Items Alloc</th>
                    <th className="pb-3 text-right">Sum Charged</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {orders.map((o) => (
                    <tr key={o.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/20">
                      <td className="py-3 font-mono text-indigo-600 dark:text-indigo-400 font-bold uppercase">{o.id.slice(0, 12)}</td>
                      <td className="py-3 truncate max-w-xs">{o.shippingAddress}</td>
                      <td className="py-3 font-mono">({o.items.length} units)</td>
                      <td className="py-3 text-right font-mono font-bold text-zinc-950 dark:text-white">${o.total.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === "inventory" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Add Stock product form */}
          <div className="lg:col-span-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 font-mono mb-4 flex items-center gap-1.5">
              <Plus size={14} className="text-indigo-600" /> DEPLOY NEW SWAG STOCK
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1.5 font-mono">
                  Product Swag Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. SRE Prom Alert Lamp"
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg py-2 px-3 text-zinc-800 dark:text-zinc-100 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1.5 font-mono">
                  Description
                </label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Dynamic smart status lamps..."
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg py-2 px-3 text-zinc-800 dark:text-zinc-100 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1.5 font-mono">
                    Price ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg py-2 px-3 text-zinc-800 dark:text-zinc-100 focus:outline-hidden font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1.5 font-mono">
                    Inventory Units
                  </label>
                  <input
                    type="number"
                    required
                    value={inventory}
                    onChange={(e) => setInventory(Number(e.target.value))}
                    className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg py-2 px-3 text-zinc-800 dark:text-zinc-100 focus:outline-hidden font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1.5 font-mono">
                  Category Type
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg py-2 px-3 text-zinc-800 dark:text-zinc-100 focus:outline-hidden"
                >
                  <option value="Swag">Swag Apparel</option>
                  <option value="Hardware">Hardware Peripheral</option>
                  <option value="Desk">Smart Desk Furniture</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1.5 font-mono">
                  Stock Image URL
                </label>
                <input
                  type="text"
                  required
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg py-2 px-3 text-zinc-800 dark:text-zinc-100 focus:outline-hidden"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-lg transition-colors cursor-pointer"
              >
                PROVISION PRODUCT STOCK
              </button>
            </form>
          </div>

          {/* Catalog editor list */}
          <div className="lg:col-span-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 font-mono mb-4 flex items-center gap-1.5">
              <Package size={14} className="text-indigo-600" /> ACTIVE STOCK INVENTORY
            </h3>

            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 divide-y divide-zinc-100 dark:divide-zinc-800">
              {products.map((p) => (
                <div key={p.id} className="flex items-center justify-between py-3 gap-4 text-xs">
                  <div className="flex items-center gap-3">
                    <img src={p.image} alt={p.name} className="w-10 h-10 rounded-lg object-cover border border-zinc-200 dark:border-zinc-800" />
                    <div>
                      <h4 className="font-bold text-zinc-900 dark:text-white line-clamp-1">{p.name}</h4>
                      <p className="text-[10px] text-zinc-400 font-mono uppercase">{p.category} • ${p.price}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1 font-mono">
                      <span className="text-[10px] text-zinc-500 uppercase mr-1">Pods:</span>
                      <input
                        type="number"
                        value={p.inventory}
                        onChange={(e) => onUpdateInventory(p.id, Number(e.target.value))}
                        className="w-14 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-center py-1 rounded-md focus:outline-hidden font-bold"
                      />
                    </div>

                    <button
                      onClick={() => onDeleteProduct(p.id)}
                      className="text-zinc-400 hover:text-red-500 transition-colors cursor-pointer"
                      title="De-commission product"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {activeTab === "queue" && (
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 font-mono text-zinc-300 text-xs shadow-2xl">
          <div className="flex justify-between items-center border-b border-zinc-800 pb-4 mb-4">
            <span className="font-bold text-white flex items-center gap-1.5 uppercase">
              <Bell className="text-indigo-500 animate-pulse" size={14} /> RabbitMQ Queue Auditor Logs
            </span>
            <span className="text-[10px] text-emerald-400 border border-emerald-400/20 px-2 py-0.5 rounded-sm">
              Broker Status: RUNNING
            </span>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto divide-y divide-zinc-800/50 pr-2">
            {notifications.length === 0 ? (
              <p className="text-center py-10 text-zinc-500">amqp://guest:guest@rabbitmq-service:5672/ logs are currently empty. Trigger user checkouts to dispatch.</p>
            ) : (
              notifications.slice().reverse().map((n) => (
                <div key={n.id} className="pt-3 text-[10.5px]">
                  <div className="flex justify-between text-indigo-400 font-bold mb-1">
                    <span>TOPIC: {n.type}</span>
                    <span className="text-zinc-500 text-[9px]">{new Date(n.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <p className="text-zinc-100 font-sans">{n.message}</p>
                  <div className="flex gap-3 text-[9px] text-zinc-500 uppercase mt-1">
                    <span>Recip: {n.recipient}</span>
                    <span>•</span>
                    <span>Exchange: amqp.direct</span>
                    <span>•</span>
                    <span>Status: {n.status}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

    </div>
  );
}
