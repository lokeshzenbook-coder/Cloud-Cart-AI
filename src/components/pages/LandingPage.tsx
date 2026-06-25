import { ArrowRight, Server, ShieldCheck, Cpu, Zap, Activity } from "lucide-react";
import { Product } from "../../types";

interface LandingPageProps {
  onNavigate: (page: string, params?: any) => void;
  featuredProducts: Product[];
  onAddToCart: (productId: string) => void;
}

export default function LandingPage({ onNavigate, featuredProducts, onAddToCart }: LandingPageProps) {
  return (
    <div className="bg-zinc-50 dark:bg-zinc-950 transition-colors duration-200">
      
      {/* Hero Section */}
      <div className="relative isolate overflow-hidden bg-zinc-900 py-24 sm:py-32">
        {/* Abstract background graphics */}
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30"></div>
        
        <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
          <div className="mx-auto max-w-2xl">
            {/* Tech Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-mono mb-6">
              <Zap size={12} className="animate-bounce" /> MULTI-NAMESPACE CLUSTER DEPLOYED
            </div>
            
            <h1 className="font-sans font-extrabold text-4xl sm:text-6xl tracking-tight text-white leading-tight">
              Cloud-Native Gear for <span className="text-indigo-500">SRE & DevOps</span> Architects
            </h1>
            
            <p className="mt-6 text-base sm:text-lg leading-relaxed text-zinc-300 font-sans">
              Deploy physical developer swag, reactive desks, and Prometheus alert lamps built on automated K8s infrastructure. Synchronized via real-time message brokers and personalized by active Gemini AI.
            </p>
            
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <button
                onClick={() => onNavigate("products")}
                className="rounded-lg bg-indigo-600 px-5 py-3 text-sm font-sans font-semibold text-white shadow-md hover:bg-indigo-500 transition-all flex items-center gap-2 group cursor-pointer"
              >
                Explore Catalog <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => onNavigate("login")}
                className="text-sm font-sans font-semibold text-zinc-300 hover:text-white"
              >
                Admin console &rarr;
              </button>
            </div>
          </div>

          {/* Infrastructure Metrics Bento */}
          <div className="mx-auto mt-16 max-w-5xl sm:mt-20 lg:mt-24">
            <dl className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-4 border border-zinc-800 bg-zinc-950/70 p-6 rounded-xl backdrop-blur-md">
              <div className="flex flex-col items-center">
                <dd className="text-3xl font-mono font-bold tracking-tight text-indigo-400">5</dd>
                <dt className="text-xs font-sans text-zinc-400 mt-1 uppercase flex items-center gap-1.5">
                  <Server size={12} /> Microservices
                </dt>
              </div>
              <div className="flex flex-col items-center">
                <dd className="text-3xl font-mono font-bold tracking-tight text-emerald-400">99.99%</dd>
                <dt className="text-xs font-sans text-zinc-400 mt-1 uppercase flex items-center gap-1.5">
                  <Activity size={12} /> Container SLA
                </dt>
              </div>
              <div className="flex flex-col items-center">
                <dd className="text-3xl font-mono font-bold tracking-tight text-indigo-400">Redis</dd>
                <dt className="text-xs font-sans text-zinc-400 mt-1 uppercase flex items-center gap-1.5">
                  <Cpu size={12} /> Cart Cache
                </dt>
              </div>
              <div className="flex flex-col items-center">
                <dd className="text-3xl font-mono font-bold tracking-tight text-purple-400">AMQP</dd>
                <dt className="text-xs font-sans text-zinc-400 mt-1 uppercase flex items-center gap-1.5">
                  <ShieldCheck size={12} /> Broker Channel
                </dt>
              </div>
            </dl>
          </div>
        </div>
      </div>

      {/* Featured Products Grid */}
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <div className="sm:flex sm:items-center sm:justify-between border-b border-zinc-200 dark:border-zinc-800 pb-5 mb-10">
          <div>
            <h2 className="text-2xl font-sans font-bold tracking-tight text-zinc-950 dark:text-white">
              SRE Hot Sellers
            </h2>
            <p className="mt-1 text-sm text-zinc-500">
              Swag and peripheral configurations tested for continuous developer comfort.
            </p>
          </div>
          <button
            onClick={() => onNavigate("products")}
            className="hidden sm:flex text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 items-center gap-1"
          >
            See full inventory &rarr;
          </button>
        </div>

        <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-8">
          {featuredProducts.map((product) => (
            <div 
              key={product.id} 
              className="border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900 overflow-hidden shadow-xs hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between"
              onClick={() => onNavigate("product-details", { productId: product.id })}
            >
              <div className="aspect-4/3 w-full bg-zinc-100 overflow-hidden">
                <img src={product.image} alt={product.name} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" />
              </div>
              <div className="p-4 flex flex-1 flex-col justify-between">
                <div>
                  <span className="text-[10px] font-mono uppercase text-zinc-400 tracking-wider block mb-1">
                    {product.category}
                  </span>
                  <h3 className="text-sm font-sans font-bold text-zinc-900 dark:text-white">
                    {product.name}
                  </h3>
                  <p className="mt-1 text-xs text-zinc-500 line-clamp-2">
                    {product.description}
                  </p>
                </div>
                <div className="mt-4 flex items-center justify-between pt-3 border-t border-zinc-100 dark:border-zinc-800">
                  <span className="text-sm font-mono font-bold text-zinc-950 dark:text-white">
                    ${product.price}
                  </span>
                  <span className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold group">
                    Deploy Specs &rarr;
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SRE Banner */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-2xl bg-zinc-950 px-6 py-20 shadow-xl sm:px-12 sm:py-24">
          <div className="absolute inset-0 -z-10 bg-[linear-gradient(45deg,#4338ca_0%,#312e81_100%)] opacity-20"></div>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl sm:text-3xl font-sans font-bold tracking-tight text-white">
              Connect Your Lab Workspace
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-zinc-300 font-sans">
              All devices include native integrations with Prometheus, Docker registries, and RabbitMQ topics out of the box. Configured in seconds via Helm.
            </p>
            <div className="mt-8 flex justify-center gap-x-4 font-mono text-xs">
              <code className="bg-zinc-900 text-zinc-300 px-4 py-2.5 rounded-lg border border-zinc-800">
                helm repo add cloudcart https://charts.cloudcart.ai
              </code>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
