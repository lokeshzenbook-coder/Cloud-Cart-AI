import React, { useState } from "react";
import { Trash2, ShoppingBag, ArrowRight, Ticket, ShieldCheck } from "lucide-react";
import { CartData } from "../../types";

interface CartPageProps {
  cart: CartData;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onApplyCoupon: (couponCode: string) => Promise<void>;
  onNavigate: (page: string) => void;
}

export default function CartPage({
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onApplyCoupon,
  onNavigate
}: CartPageProps) {
  const [couponCode, setCouponCode] = useState<string>("");
  const [couponError, setCouponError] = useState<string>("");
  const [couponSuccess, setCouponSuccess] = useState<string>("");

  const handleCouponSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError("");
    setCouponSuccess("");
    if (!couponCode.trim()) return;

    try {
      await onApplyCoupon(couponCode);
      setCouponSuccess(`Coupon ${couponCode.toUpperCase()} applied successfully!`);
      setCouponCode("");
    } catch (err: any) {
      setCouponError(err.message || "Invalid coupon code. Try 'CLOUDCART20' or 'AI50'.");
    }
  };

  if (cart.items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 sm:px-6 lg:px-8 text-center flex flex-col items-center justify-center">
        <div className="p-4 bg-zinc-100 dark:bg-zinc-900 rounded-full text-zinc-400 mb-5">
          <ShoppingBag size={48} />
        </div>
        <h2 className="text-xl font-sans font-bold text-zinc-900 dark:text-white uppercase font-mono">
          Your Shopping Cart is Empty
        </h2>
        <p className="text-xs text-zinc-500 max-w-sm mt-1.5 leading-relaxed">
          Looks like you haven't propped any kubernetes-ready equipment in your cart yet. Explore our stock catalog to begin!
        </p>
        <button
          onClick={() => onNavigate("products")}
          className="mt-6 rounded-lg bg-indigo-600 px-5 py-2.5 text-xs font-sans font-semibold text-white shadow-md hover:bg-indigo-500 cursor-pointer"
        >
          Browse Inventory Catalog
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-sans font-extrabold tracking-tight text-zinc-950 dark:text-white mb-8">
        Your Propped Items
      </h1>

      <div className="lg:grid lg:grid-cols-12 lg:gap-x-12 xl:gap-x-16">
        
        {/* Cart Item Rows */}
        <div className="lg:col-span-7">
          <div className="divide-y divide-zinc-200 dark:divide-zinc-800 border-t border-b border-zinc-200 dark:border-zinc-800">
            {cart.items.map(({ product, quantity }) => (
              <div key={product.id} className="flex py-6 sm:py-8 items-center justify-between gap-4">
                
                {/* Product details */}
                <div className="flex gap-4 items-center">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-16 h-16 rounded-lg object-cover border border-zinc-200 dark:border-zinc-800"
                  />
                  <div>
                    <h3 className="text-xs font-bold text-zinc-900 dark:text-white font-sans line-clamp-1">
                      {product.name}
                    </h3>
                    <p className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">
                      {product.category}
                    </p>
                    <p className="text-xs font-mono font-bold text-zinc-900 dark:text-white mt-1">
                      ${product.price.toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-6">
                  {/* Quantity selector */}
                  <div className="flex items-center border border-zinc-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-900 overflow-hidden text-xs">
                    <button
                      onClick={() => onUpdateQuantity(product.id, quantity - 1)}
                      className="px-2 py-1 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    >
                      -
                    </button>
                    <span className="px-3 py-1 font-mono text-zinc-800 dark:text-white">
                      {quantity}
                    </span>
                    <button
                      onClick={() => onUpdateQuantity(product.id, quantity + 1)}
                      className="px-2 py-1 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    >
                      +
                    </button>
                  </div>

                  {/* Remove icon */}
                  <button
                    onClick={() => onRemoveItem(product.id)}
                    className="text-zinc-400 hover:text-red-500 transition-colors"
                    title="Remove item"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

              </div>
            ))}
          </div>
        </div>

        {/* Totals Summary */}
        <div className="lg:col-span-5 mt-12 lg:mt-0">
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 p-6 shadow-xs">
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-500 font-mono mb-4">
              Billing Specification Summary
            </h2>

            <div className="space-y-3.5 text-xs text-zinc-600 dark:text-zinc-400">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-mono text-zinc-900 dark:text-white">${cart.subtotal.toFixed(2)}</span>
              </div>
              
              {cart.discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Discount Applied ({cart.discountPercent}%)</span>
                  <span className="font-mono">-${cart.discount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Estimated Container Tax (8%)</span>
                <span className="font-mono text-zinc-900 dark:text-white">${cart.tax.toFixed(2)}</span>
              </div>

              <div className="flex justify-between">
                <span>Swag Logistics Shipping</span>
                <span className="font-mono text-zinc-900 dark:text-white">
                  {cart.shipping === 0 ? "FREE" : `$${cart.shipping.toFixed(2)}`}
                </span>
              </div>

              <div className="flex justify-between text-sm text-zinc-900 dark:text-white font-sans font-bold border-t border-zinc-200 dark:border-zinc-800 pt-4">
                <span>Estimated Grand Total</span>
                <span className="font-mono text-base font-extrabold">${cart.total.toFixed(2)}</span>
              </div>
            </div>

            {/* Coupon Code submission */}
            <form onSubmit={handleCouponSubmit} className="mt-6 pt-5 border-t border-zinc-200 dark:border-zinc-800">
              <label className="block text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-2 font-mono">
                Do you have a coupon code?
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="e.g. CLOUDCART20, AI50"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="w-full bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-xs py-2 pl-8 pr-3 text-zinc-800 dark:text-zinc-100 focus:outline-hidden"
                  />
                  <Ticket className="absolute left-2.5 top-2.5 text-zinc-400" size={13} />
                </div>
                <button
                  type="submit"
                  className="bg-zinc-950 dark:bg-zinc-800 hover:bg-zinc-850 dark:hover:bg-zinc-750 text-white rounded-lg px-4 text-xs font-semibold"
                >
                  Apply
                </button>
              </div>

              {couponError && <p className="text-[10px] text-red-500 font-mono mt-2">{couponError}</p>}
              {couponSuccess && <p className="text-[10px] text-emerald-600 font-mono mt-2">{couponSuccess}</p>}
            </form>

            <button
              onClick={() => onNavigate("checkout")}
              className="w-full mt-6 rounded-lg bg-indigo-600 px-5 py-3 text-xs font-sans font-bold text-white shadow-md hover:bg-indigo-500 transition-all flex items-center justify-center gap-2 group cursor-pointer"
            >
              PROCEED TO SECURE CHECKOUT <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </button>

            <p className="mt-4 text-[9.5px] text-zinc-400 font-mono flex items-center gap-1.5 justify-center">
              <ShieldCheck size={12} className="text-emerald-500" /> SECURED ENVELOPE TRANSACTIONS
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
