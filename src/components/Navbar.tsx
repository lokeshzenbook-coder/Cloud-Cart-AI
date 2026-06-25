import React, { useState, useEffect } from "react";
import { 
  ShoppingBag, 
  Search, 
  Bell, 
  Sun, 
  Moon, 
  Menu, 
  X, 
  User as UserIcon, 
  LogOut, 
  Layers, 
  TrendingUp, 
  Database,
  Terminal
} from "lucide-react";
import { User, NotificationEvent, Product } from "../types";

interface NavbarProps {
  user: User | null;
  onLogout: () => void;
  cartCount: number;
  onNavigate: (page: string, params?: any) => void;
  activePage: string;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  notifications: NotificationEvent[];
  products: Product[];
}

export default function Navbar({
  user,
  onLogout,
  cartCount,
  onNavigate,
  activePage,
  darkMode,
  onToggleDarkMode,
  notifications,
  products
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Product[]>([]);

  // Search autocomplete suggestion handler
  useEffect(() => {
    if (searchQuery.trim().length > 1) {
      const query = searchQuery.toLowerCase();
      const filtered = products.filter(
        p => p.name.toLowerCase().includes(query) || p.category.toLowerCase().includes(query)
      );
      setSuggestions(filtered.slice(0, 4));
    } else {
      setSuggestions([]);
    }
  }, [searchQuery, products]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuggestions([]);
    onNavigate("products", { search: searchQuery });
  };

  const handleSuggestionClick = (product: Product) => {
    setSearchQuery("");
    setSuggestions([]);
    onNavigate("product-details", { productId: product.id });
  };

  return (
    <nav className="sticky top-0 z-50 bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 transition-colors duration-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigate("landing")}>
            <div className="p-2 bg-indigo-600 rounded-lg text-white">
              <Layers size={20} className="animate-pulse" />
            </div>
            <div>
              <span className="font-sans font-bold text-lg tracking-tight text-zinc-950 dark:text-white">
                CloudCart<span className="text-indigo-600">AI</span>
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] font-mono py-0.5 px-1.5 rounded-sm bg-zinc-100 dark:bg-zinc-800 text-zinc-500 border border-zinc-200 dark:border-zinc-700">
                v1.0.0 (K8s Ready)
              </span>
            </div>
          </div>

          {/* Search Bar - Autocomplete */}
          <form onSubmit={handleSearchSubmit} className="hidden md:block relative flex-1 max-w-md mx-8">
            <div className="relative">
              <input
                type="text"
                placeholder="Search cloud-native gear, tools, SRE swag..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg pl-10 pr-4 py-1.5 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              />
              <Search className="absolute left-3 top-2.5 text-zinc-400" size={16} />
            </div>

            {/* Auto Suggestions dropdown */}
            {suggestions.length > 0 && (
              <div className="absolute top-11 left-0 right-0 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-xl z-50 overflow-hidden">
                <div className="px-3 py-1.5 bg-zinc-50 dark:bg-zinc-800 text-[10px] font-mono text-zinc-500 flex items-center gap-1.5 border-b border-zinc-100 dark:border-zinc-700">
                  <Terminal size={10} /> SEARCH COMPILATION ENGINE
                </div>
                {suggestions.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => handleSuggestionClick(p)}
                    className="flex items-center gap-3 px-4 py-2 hover:bg-zinc-50 dark:hover:bg-zinc-800 cursor-pointer transition-colors"
                  >
                    <img src={p.image} alt={p.name} className="w-8 h-8 rounded-md object-cover border border-zinc-200 dark:border-zinc-700" />
                    <div>
                      <div className="text-xs font-medium text-zinc-900 dark:text-white">{p.name}</div>
                      <div className="text-[10px] text-zinc-500">{p.category} • ${p.price}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </form>

          {/* Right Action Icons */}
          <div className="flex items-center gap-4">
            
            {/* Dark Mode Switch */}
            <button
              onClick={onToggleDarkMode}
              className="p-1.5 rounded-lg text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800 transition-colors"
              title="Toggle theme"
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Notifications (RabbitMQ Consumer logs simulation) */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-1.5 rounded-lg text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800 transition-colors relative"
                title="SaaS Live Queue Notification Service"
              >
                <Bell size={18} />
                {notifications.length > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-indigo-600 rounded-full ring-2 ring-white dark:ring-zinc-950 animate-ping"></span>
                )}
              </button>

              {/* Notification dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl z-50 overflow-hidden font-mono text-zinc-300">
                  <div className="px-4 py-3 border-b border-zinc-800 bg-zinc-950 flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-2">
                      <Terminal size={14} className="text-indigo-500" /> notification-service-log
                    </span>
                    <span className="text-[10px] text-indigo-400 border border-indigo-400/20 px-1.5 rounded-sm animate-pulse">
                      RABBITMQ ACTIVE
                    </span>
                  </div>
                  <div className="max-h-80 overflow-y-auto divide-y divide-zinc-800">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-xs text-zinc-500">
                        Queue empty. Listening to amqp://rabbitmq:5672...
                      </div>
                    ) : (
                      notifications.slice().reverse().map((n) => (
                        <div key={n.id} className="p-3 text-[10.5px] hover:bg-zinc-800/50">
                          <div className="flex justify-between items-start text-indigo-400 mb-1">
                            <span className="font-semibold">{n.type}</span>
                            <span className="text-zinc-500 text-[9px]">{new Date(n.timestamp).toLocaleTimeString()}</span>
                          </div>
                          <p className="text-zinc-200 font-sans leading-relaxed">{n.message}</p>
                          <div className="mt-1 flex gap-2 text-[8.5px] text-zinc-500 uppercase">
                            <span>Status: {n.status}</span>
                            <span>•</span>
                            <span>Broker: {n.channel}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="bg-zinc-950 px-4 py-2 text-center text-[9px] text-zinc-500 border-t border-zinc-800">
                    Press any action (Checkout/Register) to trigger live events.
                  </div>
                </div>
              )}
            </div>

            {/* Shopping Cart button */}
            <button
              onClick={() => onNavigate("cart")}
              className="p-1.5 rounded-lg text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800 transition-colors relative"
              title="Shopping Cart"
            >
              <ShoppingBag size={18} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-bounce">
                  {cartCount}
                </span>
              )}
            </button>

            {/* User Account / Navigation Link */}
            {user ? (
              <div className="hidden sm:flex items-center gap-3 border-l border-zinc-200 dark:border-zinc-800 pl-4">
                <div 
                  onClick={() => onNavigate("profile")}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full object-cover ring-2 ring-indigo-500" />
                  <div className="text-left">
                    <div className="text-xs font-semibold text-zinc-900 dark:text-white">{user.name}</div>
                    <div className="text-[10px] text-zinc-500 uppercase font-mono tracking-wider">{user.role}</div>
                  </div>
                </div>
                
                {/* Dashboard Shortcut link */}
                <button
                  onClick={() => onNavigate(user.role === "admin" ? "admin-dashboard" : "dashboard")}
                  className="p-1.5 rounded-lg text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-xs font-mono font-medium"
                >
                  CONSOLE
                </button>

                <button
                  onClick={onLogout}
                  className="p-1.5 rounded-lg text-zinc-500 hover:bg-red-50 hover:text-red-600 dark:text-zinc-400 dark:hover:bg-red-950/30 transition-colors"
                  title="Logout"
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <button
                  onClick={() => onNavigate("login")}
                  className="text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:text-indigo-600 dark:hover:text-indigo-400 px-3 py-1.5"
                >
                  Sign In
                </button>
                <button
                  onClick={() => onNavigate("register")}
                  className="text-xs font-medium bg-indigo-600 text-white hover:bg-indigo-700 px-3 py-1.5 rounded-lg transition-colors shadow-xs"
                >
                  Sign Up
                </button>
              </div>
            )}

            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="sm:hidden p-1.5 rounded-lg text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800 transition-colors"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 pt-2 pb-4 space-y-2">
          {/* Mobile Search */}
          <form onSubmit={handleSearchSubmit} className="relative py-2">
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg pl-10 pr-4 py-1.5 text-sm"
            />
            <Search className="absolute left-3 top-4.5 text-zinc-400" size={16} />
          </form>

          <button
            onClick={() => { setMobileMenuOpen(false); onNavigate("products"); }}
            className="block w-full text-left px-3 py-2 rounded-lg text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            Explore Catalog
          </button>

          {user ? (
            <>
              <button
                onClick={() => { setMobileMenuOpen(false); onNavigate(user.role === "admin" ? "admin-dashboard" : "dashboard"); }}
                className="block w-full text-left px-3 py-2 rounded-lg text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/20"
              >
                Access Dashboard
              </button>
              <button
                onClick={() => { setMobileMenuOpen(false); onNavigate("profile"); }}
                className="block w-full text-left px-3 py-2 rounded-lg text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                My Profile
              </button>
              <button
                onClick={() => { setMobileMenuOpen(false); onLogout(); }}
                className="block w-full text-left px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
              >
                Logout
              </button>
            </>
          ) : (
            <div className="pt-2 flex gap-2">
              <button
                onClick={() => { setMobileMenuOpen(false); onNavigate("login"); }}
                className="flex-1 text-center bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 py-2 rounded-lg text-sm font-semibold"
              >
                Sign In
              </button>
              <button
                onClick={() => { setMobileMenuOpen(false); onNavigate("register"); }}
                className="flex-1 text-center bg-indigo-600 text-white py-2 rounded-lg text-sm font-semibold"
              >
                Sign Up
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
