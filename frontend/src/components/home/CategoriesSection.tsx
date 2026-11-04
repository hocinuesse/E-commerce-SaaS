"use client";

import React from "react";
import { GLOBAL_CATEGORIES } from "@/constants/categories";
import { IProduct } from "@/interfaces/IProduct";

interface CategoriesSectionProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  products: IProduct[];
}

export const CategoriesSection: React.FC<CategoriesSectionProps> = ({
  selectedCategory,
  onSelectCategory,
  products,
}) => {
  return (
    <section id="categories" className="mx-auto max-w-[1500px] px-5 py-16">
      <div className="mb-7 flex items-end justify-between">
        <div>
          <span className="text-xs font-bold text-emerald-700">
            اكتشف ما يناسبك
          </span>
          <h2 className="mt-1 text-2xl font-black sm:text-3xl text-slate-900">
            تسوق حسب الفئة
          </h2>
        </div>

        <button
          onClick={() => onSelectCategory("الكل")}
          className="hidden text-sm font-bold text-emerald-700 sm:block hover:underline"
        >
          استكشف جميع الفئات ←
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
        {GLOBAL_CATEGORIES.map((item: any) => {
          const isSelected = selectedCategory === item.name;
          const count = products.filter((p) => p.category === item.name).length;

          return (
            <button
              key={item.name}
              onClick={() => {
                onSelectCategory(item.name);
                document
                  .getElementById("products-grid")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
              className={`group rounded-2xl border p-2 text-center transition duration-300 hover:-translate-y-1 hover:border-emerald-300 hover:shadow-lg ${
                isSelected
                  ? "border-emerald-500 bg-emerald-50 shadow-md"
                  : "bg-white"
              }`}
            >
              <div className="overflow-hidden rounded-xl">
                <img
                  src={item.image}
                  alt={item.name}
                  className="h-24 w-full object-cover transition duration-500 group-hover:scale-105"
                />
              </div>

              <b className="mt-3 block text-sm text-slate-800">{item.name}</b>

              <span className="text-[11px] text-slate-500">
                {count} منتج
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
};

export default CategoriesSection;
