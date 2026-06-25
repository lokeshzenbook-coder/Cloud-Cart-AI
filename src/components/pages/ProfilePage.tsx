import React, { useState } from "react";
import { ShieldAlert, KeyRound, Server, Terminal, CheckCircle } from "lucide-react";
import { User } from "../../types";

interface ProfilePageProps {
  user: User;
  onVerifyEmail: (userId: string) => Promise<void>;
  onNavigate: (page: string) => void;
}

export default function ProfilePage({ user, onVerifyEmail, onNavigate }: ProfilePageProps) {
  const [verifying, setVerifying] = useState(false);
  const [verifiedMsg, setVerifiedMsg] = useState("");

  const handleVerify = async () => {
    setVerifying(true);
    setVerifiedMsg("");
    try {
      await onVerifyEmail(user.id);
      setVerifiedMsg("Email verification completed successfully!");
    } catch (err: any) {
      console.error(err);
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-sans">
      <h1 className="text-2xl font-sans font-extrabold tracking-tight text-zinc-950 dark:text-white mb-8">
        Your Account Profile
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Side: Avatar Card */}
        <div className="md:col-span-1">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 text-center shadow-xs">
            <img
              src={user.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150"}
              alt={user.name}
              className="w-24 h-24 rounded-full object-cover mx-auto ring-4 ring-indigo-500 mb-4"
            />
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white">{user.name}</h3>
            <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mt-1.5 bg-zinc-100 dark:bg-zinc-800 py-1 px-2.5 rounded-full inline-block">
              {user.role} role
            </p>

            {/* Email verification status badge */}
            <div className="mt-5 pt-4 border-t border-zinc-100 dark:border-zinc-800 text-center">
              {user.verified ? (
                <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-mono text-xs font-bold uppercase">
                  <CheckCircle size={13} /> VERIFIED DEV
                </span>
              ) : (
                <div className="space-y-3">
                  <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 font-mono text-xs font-bold uppercase">
                    <ShieldAlert size={13} /> UNVERIFIED DEV
                  </span>
                  <button
                    onClick={handleVerify}
                    disabled={verifying}
                    className="block w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs py-1.5 px-3 rounded-lg transition-colors cursor-pointer"
                  >
                    {verifying ? "VERIFYING..." : "DISPATCH VERIFICATION"}
                  </button>
                  {verifiedMsg && <p className="text-[10.5px] text-emerald-600 dark:text-emerald-400 font-mono">{verifiedMsg}</p>}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Account credentials */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-xs">
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-500 font-mono mb-5 flex items-center gap-1.5">
              <Terminal size={14} className="text-indigo-600" /> Account Specifications
            </h2>

            <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-xs">
              <div>
                <span className="block text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1 font-mono">
                  Full Name
                </span>
                <span className="font-semibold text-zinc-800 dark:text-zinc-200">{user.name}</span>
              </div>
              <div>
                <span className="block text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1 font-mono">
                  Email Endpoint
                </span>
                <span className="font-semibold text-zinc-800 dark:text-zinc-200">{user.email}</span>
              </div>
              <div>
                <span className="block text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1 font-mono">
                  Unique User Hash
                </span>
                <span className="font-mono text-zinc-500 select-all">{user.id}</span>
              </div>
              <div>
                <span className="block text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1 font-mono">
                  Auth Provider Scope
                </span>
                <span className="font-semibold text-zinc-800 dark:text-zinc-200 uppercase font-mono">JWT Local HS256</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-xs">
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-500 font-mono mb-5 flex items-center gap-1.5">
              <KeyRound size={14} className="text-indigo-600" /> Infrastructure Security Info
            </h2>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed mb-4">
              Your credentials and billing profiles are encrypted via bcrypt hash algorithms and salted inside our PostgreSQL service container cluster. Authentication logs are dispatched dynamically to the RabbitMQ auditor consumer topics.
            </p>
            <button
              onClick={() => onNavigate("dashboard")}
              className="inline-flex items-center gap-1.5 bg-zinc-950 dark:bg-zinc-800 hover:bg-zinc-850 dark:hover:bg-zinc-700 text-white rounded-lg text-xs py-2 px-4 font-mono font-medium transition-all cursor-pointer"
            >
              <Server size={13} /> ACCESS CONTAINER DASHBOARD
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
