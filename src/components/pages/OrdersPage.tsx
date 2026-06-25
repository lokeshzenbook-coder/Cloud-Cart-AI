import { useState } from "react";
import { Terminal, Package, Clock, ShieldCheck, Printer, HelpCircle } from "lucide-react";
import { Order } from "../../types";

interface OrdersPageProps {
  orders: Order[];
  onCancelOrder?: (orderId: string) => void;
}

export default function OrdersPage({ orders, onCancelOrder }: OrdersPageProps) {
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<Order | null>(null);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans">
      <h1 className="text-2xl font-sans font-extrabold tracking-tight text-zinc-950 dark:text-white mb-8">
        Your Order History
      </h1>

      {orders.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl bg-white dark:bg-zinc-900/30">
          <div className="p-4 bg-zinc-100 dark:bg-zinc-900 rounded-full text-zinc-400 mb-4 inline-block">
            <Package size={32} />
          </div>
          <h3 className="text-sm font-bold text-zinc-900 dark:text-white font-mono uppercase">
            No transactions filed
          </h3>
          <p className="text-xs text-zinc-500 max-w-xs mx-auto mt-1 leading-relaxed">
            You have not initialized any transactions on this network namespace. Deploy a shopping cart checkout to view orders.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* List of Orders */}
          <div className="lg:col-span-7 space-y-6">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-xs hover:shadow-md transition-all"
              >
                {/* Order Header */}
                <div className="bg-zinc-50 dark:bg-zinc-950/70 border-b border-zinc-200 dark:border-zinc-800 px-5 py-4 flex flex-wrap justify-between items-center gap-3">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-zinc-400 block">TRANSACTION ID</span>
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 font-mono uppercase">{order.id}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase text-zinc-400 block">DATE PLACED</span>
                    <span className="text-xs text-zinc-700 dark:text-zinc-300 font-mono">{new Date(order.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase text-zinc-400 block">TOTAL</span>
                    <span className="text-xs font-bold text-zinc-900 dark:text-white font-mono">${order.total.toFixed(2)}</span>
                  </div>
                  <button
                    onClick={() => setSelectedInvoiceOrder(order)}
                    className="flex items-center gap-1 bg-zinc-950 dark:bg-zinc-800 hover:bg-zinc-850 dark:hover:bg-zinc-700 text-white rounded-lg text-[10px] py-1.5 px-3 font-mono font-bold transition-all"
                  >
                    <Printer size={10} /> INVOICE
                  </button>
                </div>

                {/* Items and status */}
                <div className="p-5">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-500">
                      Provisioning Status
                    </span>
                    <span className={`text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full border ${
                      order.status === "processing" ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/20 dark:text-blue-400" :
                      order.status === "shipped" ? "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950/20 dark:text-yellow-400" :
                      order.status === "delivered" ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400" :
                      "bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400"
                    }`}>
                      {order.status}
                    </span>
                  </div>

                  <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center py-3">
                        <div className="flex items-center gap-3">
                          <img src={item.image} alt={item.name} className="w-10 h-10 rounded-lg object-cover border border-zinc-200 dark:border-zinc-800" />
                          <div>
                            <p className="text-xs font-bold text-zinc-900 dark:text-white leading-tight">{item.name}</p>
                            <p className="text-[10px] font-mono text-zinc-400">Qty: {item.quantity} • Unit: ${item.price.toFixed(2)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Tracking details */}
                  <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800 flex justify-between items-center text-[11px] font-mono text-zinc-500">
                    <span className="flex items-center gap-1">
                      <Clock size={12} /> TRACKING: {order.trackingNumber}
                    </span>
                    <span>CARRIER: SWAG_POST_INT</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Invoice Terminal Printout View */}
          <div className="lg:col-span-5">
            <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 font-mono text-zinc-300 text-xs shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500"></div>
              
              <div className="flex justify-between items-center border-b border-zinc-800 pb-4 mb-4">
                <span className="font-bold text-white flex items-center gap-1.5 uppercase">
                  <Terminal size={14} className="text-indigo-500 animate-pulse" /> CLOUDCART_INVOICE_PRINTER
                </span>
                <span className="text-[10px] text-zinc-500">ONLINE</span>
              </div>

              {selectedInvoiceOrder ? (
                <div className="space-y-4">
                  <div className="text-[11px] text-zinc-500 flex justify-between">
                    <span>INVOICE NO: INV-{selectedInvoiceOrder.id.toUpperCase()}</span>
                    <span>PROV_DATE: {new Date(selectedInvoiceOrder.createdAt).toLocaleDateString()}</span>
                  </div>

                  <div className="border-b border-zinc-800 pb-3">
                    <span className="text-[10px] text-zinc-500 block uppercase">SHIPPING ENDPOINT TARGET</span>
                    <span className="text-zinc-200 text-xs">{selectedInvoiceOrder.shippingAddress}</span>
                  </div>

                  <div className="space-y-2 border-b border-zinc-800 pb-3">
                    <span className="text-[10px] text-zinc-500 block uppercase">ITEMIZED TRANSACTION LINES</span>
                    {selectedInvoiceOrder.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between">
                        <span className="text-zinc-200 max-w-xs truncate">{item.name} x{item.quantity}</span>
                        <span className="text-indigo-400">${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-1.5 text-zinc-400 text-[11px]">
                    <div className="flex justify-between">
                      <span>Subtotal Allocation</span>
                      <span>${selectedInvoiceOrder.subtotal.toFixed(2)}</span>
                    </div>
                    {selectedInvoiceOrder.discount > 0 && (
                      <div className="flex justify-between text-emerald-500">
                        <span>Coupon Savings</span>
                        <span>-${selectedInvoiceOrder.discount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Container Tax (8%)</span>
                      <span>${selectedInvoiceOrder.tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Logistics Shipping</span>
                      <span>${selectedInvoiceOrder.shipping.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-white font-bold text-xs pt-2 border-t border-zinc-800/60 mt-1">
                      <span>TOTAL CHARGED</span>
                      <span className="text-indigo-400 font-extrabold">${selectedInvoiceOrder.total.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-[10.5px] leading-relaxed text-zinc-400 mt-4 flex items-center gap-2">
                    <ShieldCheck size={14} className="text-emerald-500 shrink-0" />
                    <span>This invoice was authenticated via SHA-256 and stored in the PostgreSQL ledger of the Order Service.</span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-16 text-zinc-500 space-y-2">
                  <Printer size={28} className="mx-auto text-zinc-700 animate-bounce" />
                  <p className="text-[11.5px]">Select any invoice printer option on the left side to compile itemized lines.</p>
                </div>
              )}
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
