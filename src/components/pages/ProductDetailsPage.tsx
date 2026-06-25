import React, { useState } from "react";
import { Star, ShieldCheck, ShoppingCart, User as UserIcon, Send, Sparkles, Terminal } from "lucide-react";
import { Product } from "../../types";

interface ProductDetailsPageProps {
  product: Product;
  onAddToCart: (productId: string) => void;
  onSubmitReview: (productId: string, userName: string, rating: number, comment: string) => Promise<void>;
  currentUser: { name: string } | null;
}

export default function ProductDetailsPage({
  product,
  onAddToCart,
  onSubmitReview,
  currentUser
}: ProductDetailsPageProps) {
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState<string>("");
  const [submittingReview, setSubmittingReview] = useState<boolean>(false);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setSubmittingReview(true);
    try {
      await onSubmitReview(product.id, currentUser.name, reviewRating, reviewComment);
      setReviewComment("");
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Product Information Section */}
      <div className="lg:grid lg:grid-cols-2 lg:gap-x-12 xl:gap-x-16">
        
        {/* Product Image */}
        <div className="w-full aspect-4/3 rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800">
          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
        </div>

        {/* Specs & Buy Controls */}
        <div className="mt-8 lg:mt-0">
          <span className="text-xs font-mono uppercase text-indigo-600 dark:text-indigo-400 font-bold tracking-widest block mb-2">
            {product.category}
          </span>
          <h1 className="text-3xl font-sans font-extrabold tracking-tight text-zinc-950 dark:text-white">
            {product.name}
          </h1>

          {/* Average Rating Star display */}
          <div className="mt-3 flex items-center gap-2">
            <div className="flex items-center text-amber-500">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={16}
                  fill={i < Math.floor(product.rating) ? "currentColor" : "none"}
                  className="stroke-1"
                />
              ))}
            </div>
            <span className="text-xs font-mono font-bold text-zinc-700 dark:text-zinc-300">
              {product.rating} Average Rating ({product.reviewsCount || 0} customer reviews)
            </span>
          </div>

          <p className="mt-6 text-xl font-mono font-bold text-zinc-900 dark:text-white">
            ${product.price.toFixed(2)}
          </p>

          <div className="mt-6 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 font-mono">
              Configuration Specifications
            </h3>
            <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
              {product.description}
            </p>
          </div>

          <div className="mt-8 border-t border-zinc-200 dark:border-zinc-800 pt-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => onAddToCart(product.id)}
                disabled={product.inventory <= 0}
                className={`flex-1 rounded-xl px-5 py-3.5 text-sm font-sans font-bold text-white shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  product.inventory <= 0 
                    ? "bg-zinc-400 cursor-not-allowed" 
                    : "bg-indigo-600 hover:bg-indigo-700 hover:scale-102 active:scale-98"
                }`}
              >
                <ShoppingCart size={16} /> 
                {product.inventory <= 0 ? "OUT OF STOCK" : "PROVISION TO CART"}
              </button>
            </div>
            
            <p className="mt-3.5 text-[10.5px] text-zinc-400 font-mono flex items-center gap-1.5">
              <ShieldCheck size={13} className="text-emerald-500" /> SECURED ENDPOINT TRANSACTIONS • SSL Ready
            </p>
          </div>
        </div>

      </div>

      {/* Product Reviews Board */}
      <div className="mt-16 pt-10 border-t border-zinc-200 dark:border-zinc-800">
        <h2 className="text-xl font-sans font-bold text-zinc-950 dark:text-white mb-8">
          Customer Quality Reports
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Submit Quality Report Form */}
          <div className="lg:col-span-1">
            <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white mb-4 flex items-center gap-1.5">
                <Terminal size={14} className="text-indigo-600" /> FILE QUALITY REPORT
              </h3>

              {currentUser ? (
                <form onSubmit={handleReviewSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1.5 font-mono">
                      Rating Star Selection
                    </label>
                    <select
                      value={reviewRating}
                      onChange={(e) => setReviewRating(Number(e.target.value))}
                      className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs py-2 px-3 text-zinc-800 dark:text-zinc-100"
                    >
                      <option value="5">5 Stars (Excellent Service)</option>
                      <option value="4">4 Stars (Good Performance)</option>
                      <option value="3">3 Stars (Normal Metrics)</option>
                      <option value="2">2 Stars (Lagging Operations)</option>
                      <option value="1">1 Star (Outage Event)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1.5 font-mono">
                      Log Report Details
                    </label>
                    <textarea
                      rows={4}
                      required
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="Comment on latency, aesthetics, material tolerances..."
                      className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs p-3 text-zinc-800 dark:text-zinc-100 focus:outline-hidden"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="w-full bg-zinc-950 hover:bg-zinc-850 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
                  >
                    <Send size={12} /> {submittingReview ? "SUBMITTING REPORT..." : "DISPATCH QUALITY REPORT"}
                  </button>
                </form>
              ) : (
                <div className="text-center py-4">
                  <p className="text-xs text-zinc-500 mb-3">
                    Please authenticate to submit quality reports to the cloud database.
                  </p>
                  <button
                    onClick={() => onAddToCart(product.id)} // placeholder behavior or redirect
                    className="text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
                  >
                    Authenticate Now &rarr;
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Quality reports list */}
          <div className="lg:col-span-2 space-y-6">
            {product.reviews.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-zinc-300 dark:border-zinc-800 rounded-2xl">
                <p className="text-xs text-zinc-500 font-mono">
                  No Quality Reports Filed on this pod. Be the first SRE to file.
                </p>
              </div>
            ) : (
              product.reviews.map((rev) => (
                <div key={rev.id} className="border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 bg-white dark:bg-zinc-950/40">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-zinc-900 dark:text-white">
                          {rev.userName}
                        </span>
                        <span className="text-[10px] font-mono text-zinc-400">
                          {new Date(rev.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      
                      {/* Rating stars */}
                      <div className="flex items-center text-amber-500 mt-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            size={11}
                            fill={i < rev.rating ? "currentColor" : "none"}
                            className="stroke-1"
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <p className="mt-3 text-xs text-zinc-700 dark:text-zinc-300 font-sans leading-relaxed">
                    {rev.comment}
                  </p>

                  {/* Dynamic Gemini AI Response Reply */}
                  {rev.aiReply && (
                    <div className="mt-4 p-3 rounded-lg bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100/30 dark:border-indigo-900/30">
                      <div className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 text-[10px] font-sans font-bold uppercase tracking-wider mb-1">
                        <Sparkles size={11} className="text-indigo-500 animate-spin" /> Gemini AI Responder
                      </div>
                      <p className="text-xs text-zinc-600 dark:text-zinc-300 italic leading-relaxed">
                        "{rev.aiReply}"
                      </p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

        </div>
      </div>

    </div>
  );
}
