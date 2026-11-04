"use client";

import React from "react";
import { GLOBAL_BRANDS } from "@/constants/categories";

const TEXT_BRANDS = [
  "SAMSUNG",
  "Apple",
  "NIKE",
  "adidas",
  "SONY",
  "DELL",
  "LG",
  "PHILIPS",
];

export const BrandsSection: React.FC = () => {
  return (
    <section id="brands" className="mx-auto max-w-[1500px] px-5 py-12">
      <div className="mb-8 text-center">
        <span className="text-xs font-bold text-emerald-700">شركاؤنا</span>
        <h2 className="mt-1 text-2xl font-black text-slate-900">علامات تجارية موثوقة</h2>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 md:grid-cols-8">
        {TEXT_BRANDS.map((brand) => (
          <div
            key={brand}
            className="flex h-20 items-center justify-center rounded-2xl border bg-white text-sm font-black text-slate-400 transition hover:border-emerald-300 hover:text-emerald-700 hover:shadow-md cursor-default"
          >
            {brand}
          </div>
        ))}
      </div>

      {GLOBAL_BRANDS && GLOBAL_BRANDS.length > 0 && (
        <div className="mt-10 flex flex-wrap justify-center gap-8 md:gap-16 opacity-60 grayscale transition hover:grayscale-0 hover:opacity-100 duration-500">
          {GLOBAL_BRANDS.map((logo, index) => (
            <img
              key={index}
              src={logo}
              alt="Brand Logo"
              className="h-8 md:h-12 object-contain hover:scale-110 transition duration-300"
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default BrandsSection;
