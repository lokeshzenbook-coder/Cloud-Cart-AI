import React, { useState } from "react";
import { Terminal, KeyRound, Mail, Layers, User } from "lucide-react";

interface RegisterPageProps {
  onRegister: (name: string, email: string, pass: string, role: "admin" | "customer") => Promise<void>;
  onNavigate: (page: string) => void;
}

export default function RegisterPage({ onRegister, onNavigate }: RegisterPageProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"admin" | "customer">("customer");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await onRegister(name, email, password, role);
    } catch (err: any) {
      setError(err.message || "Failed to create account credential.");
    } finally {
      setLoading(false);
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
            Register Credentials
          </h2>
          <p className="text-xs text-zinc-500 mt-1">
            Provision a new security credential in the cloud identity store.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg text-xs font-mono">
            {error}
          </div>
        )}

        <form onSubmit={handleRegisterSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1.5 font-mono">
              Full Name
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Swag Architect"
                className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-xs py-2.5 pl-9 pr-3 text-zinc-800 dark:text-zinc-100 focus:outline-hidden"
              />
              <User className="absolute left-3 top-3 text-zinc-400" size={13} />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1.5 font-mono">
              Email Endpoint
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="devops@cloudcart.ai"
                className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-xs py-2.5 pl-9 pr-3 text-zinc-800 dark:text-zinc-100 focus:outline-hidden"
              />
              <Mail className="absolute left-3 top-3 text-zinc-400" size={13} />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1.5 font-mono">
              Role Authority Selection
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as any)}
              className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-xs py-2.5 px-3 text-zinc-800 dark:text-zinc-100 focus:outline-hidden cursor-pointer"
            >
              <option value="customer">Customer Developer (Normal Swag Ordering)</option>
              <option value="admin">SRE Cluster Admin (Analytics & Inventory Control)</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1.5 font-mono">
              Password Security Key
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
            {loading ? "COMMITTING IDENTITY..." : "PROVISION ACCOUNT"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-zinc-500">
          Already registered?{" "}
          <button
            onClick={() => onNavigate("login")}
            className="font-bold text-indigo-600 hover:underline dark:text-indigo-400"
          >
            Authenticate &rarr;
          </button>
        </p>

      </div>
    </div>
  );
}
