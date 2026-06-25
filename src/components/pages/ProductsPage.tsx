import React, { useState, useEffect } from "react";
import { Filter, SlidersHorizontal, Search, ArrowUpDown, ServerCrash } from "lucide-react";
import { Product } from "../../types";
import ProductCard from "../ProductCard";

interface ProductsPageProps {
  products: Product[];
  categories: string[];
  onAddToCart: (productId: string) => void;
  onSelectProduct: (productId: string) => void;
  initialSearch?: string;
}

export default function ProductsPage({
  products,
  categories,
  onAddToCart,
  onSelectProduct,
  initialSearch = ""
}: ProductsPageProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [sortBy, setSortBy] = useState<string>("default");
  const [priceMax, setPriceMax] = useState<number>(250);

  // Sync state with parent-triggered initialSearch
  useEffect(() => {
    setSearchQuery(initialSearch);
  }, [initialSearch]);

  // Client-side Filter & Sort
  const filteredProducts = products
    .filter(p => {
      const matchCategory = selectedCategory === "all" || p.category === selectedCategory;
      const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchPrice = p.price <= priceMax;
      return matchCategory && matchSearch && matchPrice;
    })
    .sort((a, b) => {
      if (sortBy === "price-low") return a.price - b.price;
      if (sortBy === "price-high") return b.price - a.price;
      if (sortBy === "rating") return b.rating - a.rating;
      return 0; // default order
    });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* SIDEBAR FILTER PANEL */}
        <div className="w-full md:w-64 shrink-0">
          <div className="sticky top-24 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-xs">
            
            {/* Header */}
            <div className="flex items-center gap-2 pb-4 mb-4 border-b border-zinc-100 dark:border-zinc-800 text-zinc-900 dark:text-white font-sans font-bold text-sm">
              <SlidersHorizontal size={16} className="text-indigo-600" /> Filter Settings
            </div>

            {/* Categories filter */}
            <div className="mb-6">
              <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 font-mono">
                Categories
              </h4>
              <div className="space-y-1">
                <button
                  onClick={() => setSelectedCategory("all")}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-xs transition-colors ${
                    selectedCategory === "all"
                      ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-400 font-bold"
                      : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                  }`}
                >
                  All Categories
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`w-full text-left px-3 py-1.5 rounded-lg text-xs transition-colors ${
                      selectedCategory === cat
                        ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-400 font-bold"
                        : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Price slider */}
            <div className="mb-6">
              <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2.5 font-mono">
                Max Price: ${priceMax}
              </h4>
              <input
                type="range"
                min="10"
                max="250"
                value={priceMax}
                onChange={(e) => setPriceMax(Number(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-zinc-400 font-mono mt-1">
                <span>$10</span>
                <span>$250</span>
              </div>
            </div>

          </div>
        </div>

        {/* MAIN PRODUCT CATALOG CONTAINER */}
        <div className="flex-1">
          
          {/* Header & Controls bar */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center pb-5 mb-6 border-b border-zinc-200 dark:border-zinc-800">
            <div>
              <h2 className="text-xl font-sans font-bold text-zinc-950 dark:text-white">
                Cluster Inventory Catalog
              </h2>
              <p className="text-xs text-zinc-500">
                Found {filteredProducts.length} items matching your filters
              </p>
            </div>

            {/* Sorting & Search */}
            <div className="flex items-center gap-3 w-full sm:w-auto">
              {/* Local Search input */}
              <div className="relative flex-1 sm:max-w-xs">
                <input
                  type="text"
                  placeholder="Filter inventory..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg pl-9 pr-4 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-hidden"
                />
                <Search className="absolute left-3 top-2 text-zinc-400" size={13} />
              </div>

              {/* Sort By selector */}
              <div className="flex items-center gap-1.5">
                <ArrowUpDown size={14} className="text-zinc-400" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs py-1.5 pl-2 pr-8 text-zinc-700 dark:text-zinc-300 focus:outline-hidden cursor-pointer"
                >
                  <option value="default">Default Sort</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Top Rated</option>
                </select>
              </div>
            </div>
          </div>

          {/* Catalog grid */}
          {filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="p-4 bg-zinc-100 dark:bg-zinc-900 rounded-full text-zinc-400 mb-4">
                <ServerCrash size={32} />
              </div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white uppercase font-mono">
                No matching pods found
              </h3>
              <p className="text-xs text-zinc-500 max-w-sm mt-1">
                Your filter parameters yielded zero results in the cluster. Try clearing search terms or selecting 'All Categories'.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={onAddToCart}
                  onSelectProduct={onSelectProduct}
                />
              ))}
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
