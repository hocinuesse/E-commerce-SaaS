"use client";

import React from "react";
import { IProduct } from "@/interfaces/IProduct";
import ProductCard from "./ProductCard";

interface NewArrivalsSectionProps {
  products: IProduct[];
  onAddToCart: (product: IProduct) => void;
}

export const NewArrivalsSection: React.FC<NewArrivalsSectionProps> = ({
  products,
  onAddToCart,
}) => {
  return (
    <section id="new" className="mx-auto max-w-[1500px] px-5 py-16">
      <div className="mb-7 flex items-end justify-between">
        <div>
          <span className="text-xs font-bold text-emerald-700">
            اكتشف الجديد
          </span>
          <h2 className="mt-1 text-2xl font-black sm:text-3xl text-slate-900">
            وصل حديثاً ✨
          </h2>
        </div>

        <button
          onClick={() =>
            document.getElementById("products-grid")?.scrollIntoView({ behavior: "smooth" })
          }
          className="hidden text-sm font-bold text-emerald-700 sm:block hover:underline"
        >
          عرض جميع المنتجات ←
        </button>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
        {products && products.length > 0 ? (
          products.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              onAdd={() => onAddToCart(product)}
            />
          ))
        ) : (
          <div className="col-span-full rounded-2xl border border-dashed py-10 text-center">
            <h3 className="font-bold text-slate-500">لا توجد منتجات جديدة حالياً</h3>
          </div>
        )}
      </div>
    </section>
  );
};

export default NewArrivalsSection;
