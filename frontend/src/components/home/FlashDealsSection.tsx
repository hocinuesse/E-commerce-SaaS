"use client";

import React from "react";
import { IProduct } from "@/interfaces/IProduct";
import ProductCard from "./ProductCard";

interface FlashDealsSectionProps {
  deals: IProduct[];
  onAddToCart: (product: IProduct) => void;
}

export const FlashDealsSection: React.FC<FlashDealsSectionProps> = ({
  deals,
  onAddToCart,
}) => {
  if (!deals || deals.length === 0) return null;

  return (
    <section id="offers" className="mx-auto max-w-[1500px] px-5 py-6">
      <div className="overflow-hidden rounded-[30px] bg-gradient-to-l from-emerald-50 via-white to-emerald-50 p-6 sm:p-8 border border-emerald-100">
        <div className="mb-7 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <span className="text-xs font-black text-emerald-700">
              عروض لفترة محدودة
            </span>
            <h2 className="mt-1 text-2xl font-black sm:text-3xl text-slate-900">
              عروض اليوم 🔥
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-xl bg-white px-4 py-3 shadow-sm border border-emerald-100">
              <span className="text-sm font-bold text-emerald-700">
                سارع قبل نفاد الكمية!
              </span>
            </div>

            <button
              onClick={() =>
                document.getElementById("products-grid")?.scrollIntoView({ behavior: "smooth" })
              }
              className="hidden rounded-xl bg-emerald-700 px-5 py-3 text-sm font-bold text-white sm:block hover:bg-emerald-800 transition"
            >
              كل العروض
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          {deals.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              onAdd={() => onAddToCart(product)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FlashDealsSection;
