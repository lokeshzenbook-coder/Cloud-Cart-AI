import React, { useState } from "react";
import { Terminal, ShieldCheck, KeyRound, Mail, Layers } from "lucide-react";

interface LoginPageProps {
  onLogin: (email: string, pass: string) => Promise<void>;
  onNavigate: (page: string) => void;
}

export default function LoginPage({ onLogin, onNavigate }: LoginPageProps) {
  const [email, setEmail] = useState<string>("sre_manager@cloudcart.ai");
  const [password, setPassword] = useState<string>("admin123");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await onLogin(email, password);
    } catch (err: any) {
      setError(err.message || "Failed to authenticate. Verify credentials.");
    } finally {
      setLoading(false);
    }
  };

  // Quick helper to fill credentials
  const fillCredentials = (role: "admin" | "customer") => {
    if (role === "admin") {
      setEmail("sre_manager@cloudcart.ai");
      setPassword("admin123");
    } else {
      setEmail("customer_dev@cloudcart.ai");
      setPassword("customer123");
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8 font-sans">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 shadow-xl">
        
        {/* Title logo */}
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-indigo-600 rounded-xl text-white mb-3">
            <Layers size={24} />
          </div>
          <h2 className="text-2xl font-sans font-extrabold text-zinc-950 dark:text-white">
            Secure Auth Service
          </h2>
          <p className="text-xs text-zinc-500 mt-1">
            Authenticate to sync carts, checkout and audit pods.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg text-xs font-mono">
            {error}
          </div>
        )}

        <form onSubmit={handleLoginSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1.5 font-mono">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="developer@cloudcart.ai"
                className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-xs py-2.5 pl-9 pr-3 text-zinc-800 dark:text-zinc-100 focus:outline-hidden"
              />
              <Mail className="absolute left-3 top-3 text-zinc-400" size={13} />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1.5 font-mono">
              Password Account
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-xs py-2.5 pl-9 pr-3 text-zinc-800 dark:text-zinc-100 focus:outline-hidden"
              />
              <KeyRound className="absolute left-3 top-3 text-zinc-400" size={13} />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs py-2.5 rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer"
          >
            {loading ? "PROVISIONING SESSION..." : "AUTHENTICATE"}
          </button>
        </form>

        {/* Quick Testing buttons */}
        <div className="mt-8 pt-6 border-t border-zinc-200 dark:border-zinc-800">
          <span className="block text-[9.5px] font-bold text-zinc-400 uppercase tracking-widest text-center mb-3 font-mono">
            SRE Quick Sandbox Login
          </span>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => fillCredentials("admin")}
              className="flex items-center justify-center gap-1 border border-zinc-200 dark:border-zinc-800 rounded-lg text-[10.5px] py-1.5 px-3 bg-zinc-50 dark:bg-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer font-mono font-bold text-indigo-600 dark:text-indigo-400"
            >
              <Terminal size={11} /> Admin console
            </button>
            <button
              onClick={() => fillCredentials("customer")}
              className="flex items-center justify-center gap-1 border border-zinc-200 dark:border-zinc-800 rounded-lg text-[10.5px] py-1.5 px-3 bg-zinc-50 dark:bg-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer font-mono font-bold text-emerald-600 dark:text-emerald-400"
            >
              <ShieldCheck size={11} /> Customer dev
            </button>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-zinc-500">
          Don't have a cluster credential?{" "}
          <button
            onClick={() => onNavigate("register")}
            className="font-bold text-indigo-600 hover:underline dark:text-indigo-400"
          >
            Create accounts &rarr;
          </button>
        </p>

      </div>
    </div>
  );
}
