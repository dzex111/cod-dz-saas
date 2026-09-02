"use client";
import { useState } from "react";
import Link from "next/link";
import CheckoutForm from "@/app/[subdomain]/p/[slug]/CheckoutForm";

type Product = {
  id: string;
  name: string;
  slug: string;
  price: number;
  compare_at_price: number | null;
  image_url: string | null;
  description: string | null;
};

export default function StorefrontClient({ products, subdomain, merchantSubdomain }: { products: Product[]; subdomain: string; merchantSubdomain: string }) {
  const [selected, setSelected] = useState<Product | null>(null);
  const [cartCount, setCartCount] = useState(0);

  // Listen for successful order to increment cart
  const handleSelect = (p: Product) => {
    setSelected(p);
    document.body.style.overflow = "hidden";
  };
  const handleClose = () => {
    setSelected(null);
    document.body.style.overflow = "";
  };

  return (
    <>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((p) => (
          <div key={p.id} className="group bg-white border border-[#E8E6E1] overflow-hidden hover:border-[#111] transition-colors flex flex-col">
            <Link href={`/${subdomain}/p/${p.slug}`} className="block">
              {p.image_url ? <img src={p.image_url} alt={p.name} className="w-full h-[380px] object-cover group-hover:scale-[1.01] transition duration-500" /> : <div className="h-[380px] bg-[#FAF9F6] flex items-center justify-center text-xs opacity-40">Sans image</div>}
              <div className="p-3 border-t border-[#E8E6E1] flex justify-between items-center">
                <span className="text-xs font-medium truncate">{p.name}</span>
                <span className="text-xs font-serif">{p.price.toLocaleString("fr-DZ")} DZD</span>
              </div>
            </Link>
            <div className="px-3 pb-3">
              <button onClick={() => handleSelect(p)} className="w-full bg-[#111] text-white text-xs tracking-[0.12em] uppercase py-2.5 rounded-[4px] hover:bg-black transition-colors">Acheter</button>
            </div>
          </div>
        ))}
      </div>

      {/* Side Drawer */}
      <div className={`fixed inset-0 z-50 ${selected ? "visible" : "invisible"}`}>
        <div onClick={handleClose} className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity ${selected ? "opacity-100" : "opacity-0"}`} />
        <div className={`absolute top-0 right-0 h-full w-full sm:w-[480px] bg-[#FAF9F6] border-s border-[#E8E6E1] shadow-2xl transition-transform duration-300 ${selected ? "translate-x-0" : "translate-x-full"}`}>
          {selected && (
            <div className="h-full flex flex-col">
              <div className="h-[56px] border-b border-[#E8E6E1] flex items-center justify-between px-6 bg-white">
                <span className="font-serif text-sm">Commander</span>
                <button onClick={handleClose} className="w-8 h-8 rounded-full border border-[#E8E6E1] flex items-center justify-center hover:bg-white">
                  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5}><path d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div className="flex gap-4">
                  {selected.image_url && <img src={selected.image_url} alt={selected.name} className="w-24 h-24 object-cover rounded-[4px] border border-[#E8E6E1]" />}
                  <div>
                    <h3 className="font-serif text-lg leading-tight">{selected.name}</h3>
                    {selected.description && <p className="text-xs opacity-60 mt-1 line-clamp-2">{selected.description}</p>}
                    <div className="text-sm font-medium mt-2">{selected.price.toLocaleString("fr-DZ")} DZD</div>
                  </div>
                </div>
                <div className="bg-white border border-[#E8E6E1] rounded-[4px] p-5">
                  <CheckoutForm merchantSubdomain={merchantSubdomain} productSlug={selected.slug} price={selected.price} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
