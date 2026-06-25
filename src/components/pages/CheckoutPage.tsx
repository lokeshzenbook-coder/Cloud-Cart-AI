import React, { useState } from "react";
import { ShieldCheck, CreditCard, ShoppingBag, Terminal } from "lucide-react";
import { CartData } from "../../types";

interface CheckoutPageProps {
  cart: CartData;
  onPlaceOrder: (shippingAddress: string, paymentMethod: string) => Promise<void>;
  onNavigate: (page: string) => void;
}

export default function CheckoutPage({ cart, onPlaceOrder, onNavigate }: CheckoutPageProps) {
  const [address, setAddress] = useState<string>("404 Kubernetes Route, Cluster Node 1");
  const [city, setCity] = useState<string>("San Jose");
  const [state, setState] = useState<string>("CA");
  const [zip, setZip] = useState<string>("95112");
  const [cardNum, setCardNum] = useState<string>("4111 2222 3333 4444");
  const [cardExpiry, setCardExpiry] = useState<string>("12/28");
  const [cardCvv, setCardCvv] = useState<string>("123");
  const [submitting, setSubmitting] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const fullAddress = `${address}, ${city}, ${state} ${zip}`;
      await onPlaceOrder(fullAddress, "Credit Card (Stripe Simulated)");
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-sans font-extrabold tracking-tight text-zinc-950 dark:text-white mb-8">
        Secure Checkout
      </h1>

      <div className="lg:grid lg:grid-cols-12 lg:gap-x-12 xl:gap-x-16">
        
        {/* Checkout Forms */}
        <div className="lg:col-span-7">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Shipping Address Panel */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-xs">
              <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-500 font-mono mb-4 flex items-center gap-1.5">
                <Terminal size={14} className="text-indigo-600" /> SHIPPING TARGET INSTANCE
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1.5 font-mono">
                    Street Address
                  </label>
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-xs py-2 px-3 text-zinc-800 dark:text-zinc-100 focus:outline-hidden"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1.5 font-mono">
                      City
                    </label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-xs py-2 px-3 text-zinc-800 dark:text-zinc-100 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1.5 font-mono">
                      State
                    </label>
                    <input
                      type="text"
                      required
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-xs py-2 px-3 text-zinc-800 dark:text-zinc-100 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1.5 font-mono">
                      Zip / Node Area
                    </label>
                    <input
                      type="text"
                      required
                      value={zip}
                      onChange={(e) => setZip(e.target.value)}
                      className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-xs py-2 px-3 text-zinc-800 dark:text-zinc-100 focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Method Panel */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-xs">
              <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-500 font-mono mb-4 flex items-center gap-1.5">
                <CreditCard size={14} className="text-indigo-600" /> TRANSACTION INVOICING SECURE (STRIPE)
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1.5 font-mono">
                    Credit Card Number
                  </label>
                  <input
                    type="text"
                    required
                    value={cardNum}
                    onChange={(e) => setCardNum(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-xs py-2 px-3 text-zinc-800 dark:text-zinc-100 focus:outline-hidden font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1.5 font-mono">
                      Expiration Date
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="MM/YY"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-xs py-2 px-3 text-zinc-800 dark:text-zinc-100 focus:outline-hidden font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1.5 font-mono">
                      CVV / Verification Code
                    </label>
                    <input
                      type="text"
                      required
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value)}
                      className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-xs py-2 px-3 text-zinc-800 dark:text-zinc-100 focus:outline-hidden font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>

          </form>
        </div>

        {/* Right-Side Summary */}
        <div className="lg:col-span-5 mt-12 lg:mt-0">
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 p-6 shadow-xs">
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-500 font-mono mb-4 flex items-center gap-1.5">
              <ShoppingBag size={14} className="text-indigo-600" /> ORDER ALLOCATION SUMMARY
            </h2>

            {/* List items briefly */}
            <div className="space-y-3 mb-6 max-h-40 overflow-y-auto pr-2 divide-y divide-zinc-200 dark:divide-zinc-800">
              {cart.items.map(({ product, quantity }) => (
                <div key={product.id} className="flex justify-between items-center text-xs py-2.5">
                  <span className="font-semibold text-zinc-800 dark:text-white line-clamp-1">{product.name} (x{quantity})</span>
                  <span className="font-mono text-zinc-900 dark:text-white">${(product.price * quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="space-y-3 text-xs text-zinc-600 dark:text-zinc-400 border-t border-zinc-200 dark:border-zinc-800 pt-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-mono text-zinc-900 dark:text-white">${cart.subtotal.toFixed(2)}</span>
              </div>
              {cart.discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Coupon Discount</span>
                  <span className="font-mono">-${cart.discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Container Tax (8%)</span>
                <span className="font-mono text-zinc-900 dark:text-white">${cart.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Logistic Swag Shipping</span>
                <span className="font-mono text-zinc-900 dark:text-white">
                  {cart.shipping === 0 ? "FREE" : `$${cart.shipping.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between text-sm text-zinc-900 dark:text-white font-sans font-bold border-t border-zinc-200 dark:border-zinc-800 pt-4">
                <span>Total Charge Allocation</span>
                <span className="font-mono text-base font-extrabold">${cart.total.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full mt-6 rounded-lg bg-indigo-600 px-5 py-3 text-xs font-sans font-bold text-white shadow-md hover:bg-indigo-500 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {submitting ? "PROCESSING TRANSACTION..." : `CONFIRM & PAY $${cart.total}`}
            </button>

            <p className="mt-4 text-[9px] text-zinc-400 font-mono flex items-center gap-1.5 justify-center">
              <ShieldCheck size={12} className="text-emerald-500" /> SECURED TRANSACTION CERTIFIED • TLSv1.3
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
