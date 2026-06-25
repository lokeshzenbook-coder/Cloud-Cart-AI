import React from "react";
import { Star, ShoppingCart, HelpCircle, Sparkles, AlertTriangle } from "lucide-react";
import { Product } from "../types";

interface ProductCardProps {
  product: Product;
  onAddToCart: (productId: string) => void;
  onSelectProduct: (productId: string) => void;
  key?: any;
}

export default function ProductCard({ product, onAddToCart, onSelectProduct }: ProductCardProps) {
  const isOutOfStock = product.inventory <= 0;

  return (
    <div 
      className="group relative flex flex-col overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 transition-all duration-300 hover:shadow-lg hover:border-indigo-500/30"
    >
      {/* Product Image Section */}
      <div 
        onClick={() => onSelectProduct(product.id)}
        className="relative aspect-4/3 overflow-hidden bg-zinc-100 dark:bg-zinc-800 cursor-pointer"
      >
        <img 
          src={product.image} 
          alt={product.name}
          className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
        />
        {isOutOfStock ? (
          <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-md bg-zinc-900/90 text-[10px] font-mono tracking-wide font-bold uppercase text-white px-2.5 py-1">
            <AlertTriangle size={11} className="text-yellow-500" /> OUT OF STOCK
          </div>
        ) : product.inventory < 10 ? (
          <div className="absolute top-3 left-3 rounded-md bg-amber-600 text-[10px] font-mono font-bold uppercase text-white px-2.5 py-1">
            LOW STOCK ({product.inventory})
          </div>
        ) : null}

        {/* Floating Quick Action overlay */}
        {!isOutOfStock && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart(product.id);
            }}
            className="absolute bottom-3 right-3 p-2 rounded-lg bg-indigo-600 text-white shadow-md opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 hover:bg-indigo-700 hover:scale-110 active:scale-95"
            title="Quick add to cart"
          >
            <ShoppingCart size={15} />
          </button>
        )}
      </div>

      {/* Info Section */}
      <div className="flex flex-1 flex-col p-4">
        {/* Category */}
        <p className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1">
          {product.category}
        </p>

        {/* Title */}
        <h3 
          onClick={() => onSelectProduct(product.id)}
          className="text-sm font-sans font-semibold text-zinc-900 dark:text-white line-clamp-1 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer transition-colors"
        >
          {product.name}
        </h3>

        {/* Ratings block */}
        <div className="mt-1.5 flex items-center gap-1">
          <div className="flex items-center text-amber-500">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star 
                key={i} 
                size={12} 
                fill={i < Math.floor(product.rating) ? "currentColor" : "none"} 
                className="stroke-1"
              />
            ))}
          </div>
          <span className="text-[10.5px] font-mono text-zinc-500">
            {product.rating} ({product.reviewsCount || 0})
          </span>
        </div>

        {/* Price & Primary CTA */}
        <div className="mt-4 flex items-center justify-between pt-3 border-t border-zinc-100 dark:border-zinc-800">
          <span className="text-base font-mono font-bold text-zinc-900 dark:text-white">
            ${product.price.toFixed(2)}
          </span>
          <button
            onClick={() => onSelectProduct(product.id)}
            className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline hover:text-indigo-700 dark:hover:text-indigo-300"
          >
            Details &rarr;
          </button>
        </div>

        {/* Customized Gemini AI recommendation box */}
        {product.aiReason && (
          <div className="mt-4 p-2.5 rounded-lg bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100/40 dark:border-indigo-900/40">
            <div className="flex items-center gap-1 text-indigo-700 dark:text-indigo-400 font-sans font-bold text-[10px] tracking-tight uppercase mb-1">
              <Sparkles size={11} className="animate-spin" /> Gemini AI Engine
            </div>
            <p className="text-[10.5px] leading-relaxed text-zinc-600 dark:text-zinc-400 italic">
              "{product.aiReason}"
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
