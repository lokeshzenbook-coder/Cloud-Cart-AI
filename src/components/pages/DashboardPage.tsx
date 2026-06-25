import { Terminal, CreditCard, Activity, Cpu, CheckCircle2, ShoppingBag, ArrowRight } from "lucide-react";
import { Order, User } from "../../types";

interface DashboardPageProps {
  user: User;
  orders: Order[];
  onNavigate: (page: string) => void;
}

export default function DashboardPage({ user, orders, onNavigate }: DashboardPageProps) {
  const completedOrders = orders.filter((o) => o.status === "delivered").length;
  const processingOrders = orders.filter((o) => o.status === "processing" || o.status === "shipped").length;
  const totalSpend = orders.reduce((acc, curr) => acc + curr.total, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans">
      
      {/* Title greeting */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-sans font-extrabold text-zinc-950 dark:text-white leading-tight">
            Welcome Back, <span className="text-indigo-600">{user.name}</span>
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Cluster Console Context ID: <span className="font-mono">{user.id.slice(0, 12)}...</span>
          </p>
        </div>

        {/* Quick action block */}
        <button
          onClick={() => onNavigate("products")}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-sans font-semibold text-white shadow-xs hover:bg-indigo-500 transition-all flex items-center gap-1.5 cursor-pointer"
        >
          Deploy swag order <ArrowRight size={13} />
        </button>
      </div>

      {/* Bento Grid Analytics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        
        {/* Metric 1 */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">TOTAL TRANSACTIONS</span>
            <Activity size={16} className="text-indigo-500" />
          </div>
          <span className="text-3xl font-mono font-bold tracking-tight text-zinc-900 dark:text-white">
            {orders.length}
          </span>
          <span className="block text-[10px] text-zinc-500 mt-1">Dispatched to PostgreSQL db</span>
        </div>

        {/* Metric 2 */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">ACTIVE ALLOCATIONS</span>
            <Cpu size={16} className="text-indigo-500" />
          </div>
          <span className="text-3xl font-mono font-bold tracking-tight text-zinc-900 dark:text-white">
            {processingOrders}
          </span>
          <span className="block text-[10px] text-zinc-500 mt-1">Pods in rolling processing</span>
        </div>

        {/* Metric 3 */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">DELIVERED SPECIMENS</span>
            <CheckCircle2 size={16} className="text-emerald-500" />
          </div>
          <span className="text-3xl font-mono font-bold tracking-tight text-zinc-900 dark:text-white">
            {completedOrders}
          </span>
          <span className="block text-[10px] text-zinc-500 mt-1">Completed network hops</span>
        </div>

        {/* Metric 4 */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">TOTAL INVESTMENT</span>
            <CreditCard size={16} className="text-indigo-500" />
          </div>
          <span className="text-3xl font-mono font-bold tracking-tight text-zinc-900 dark:text-white">
            ${totalSpend.toFixed(2)}
          </span>
          <span className="block text-[10px] text-zinc-500 mt-1">Stripe verified transfers</span>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Recent Orders */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-xs">
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-500 font-mono mb-5 flex items-center gap-1.5">
              <Terminal size={14} className="text-indigo-600" /> ACTIVE ORDER REPLICAS
            </h2>

            {orders.length === 0 ? (
              <div className="text-center py-12 text-zinc-500">
                <ShoppingBag size={24} className="mx-auto mb-2 text-zinc-400" />
                <p className="text-xs font-mono">No order replicas propped. Deploy inventory stock now.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-zinc-100 dark:border-zinc-800 text-zinc-400 uppercase font-mono tracking-wider">
                      <th className="pb-3 font-semibold">Order Hash</th>
                      <th className="pb-3 font-semibold">Date</th>
                      <th className="pb-3 font-semibold">Routing Status</th>
                      <th className="pb-3 font-semibold text-right">Sum Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                    {orders.slice(0, 5).map((order) => (
                      <tr key={order.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40 cursor-pointer" onClick={() => onNavigate("orders")}>
                        <td className="py-3.5 font-mono text-indigo-600 dark:text-indigo-400 uppercase font-bold">{order.id.slice(0, 10)}</td>
                        <td className="py-3.5 text-zinc-600 dark:text-zinc-400 font-mono">{new Date(order.createdAt).toLocaleDateString()}</td>
                        <td className="py-3.5">
                          <span className={`text-[9.5px] font-mono uppercase font-bold py-0.5 px-2 rounded-full border ${
                            order.status === "processing" ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/20 dark:text-blue-400" :
                            order.status === "shipped" ? "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950/20 dark:text-yellow-400" :
                            "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400"
                          }`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="py-3.5 text-right font-mono font-bold text-zinc-900 dark:text-white">${order.total.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Active coupon reminders & tips */}
        <div className="lg:col-span-1">
          <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 font-mono mb-4">
              ACTIVE VOUCHER TOPICS
            </h3>
            
            <div className="space-y-4 font-mono text-[11px]">
              <div className="p-3 bg-white dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 rounded-lg">
                <span className="font-bold text-indigo-600 dark:text-indigo-400 uppercase text-xs block mb-1">CLOUDCART20</span>
                <p className="text-zinc-600 dark:text-zinc-400 font-sans">Apply on cart workspace to retrieve 20% flat discount on swag limits.</p>
              </div>

              <div className="p-3 bg-white dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 rounded-lg">
                <span className="font-bold text-indigo-600 dark:text-indigo-400 uppercase text-xs block mb-1">AI50</span>
                <p className="text-zinc-600 dark:text-zinc-400 font-sans">Special SRE coupon saving 50% on all orders in this namespace.</p>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
