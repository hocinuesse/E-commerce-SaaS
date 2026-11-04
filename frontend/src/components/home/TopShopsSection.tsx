"use client";

import React from "react";
import ShopCard from "./ShopCard";

interface TopShopsSectionProps {
  shops: any[];
}

export const TopShopsSection: React.FC<TopShopsSectionProps> = ({ shops }) => {
  return (
    <section id="best" className="mx-auto max-w-[1500px] px-5 py-16">
      <div className="mb-7 flex items-end justify-between">
        <div>
          <span className="text-xs font-bold text-emerald-700">
            اختيارات العملاء
          </span>
          <h2 className="mt-1 text-2xl font-black sm:text-3xl text-slate-900">
            أفضل المتاجر 🌟
          </h2>
        </div>

        <button className="hidden text-sm font-bold text-emerald-700 sm:block hover:underline">
          عرض جميع المتاجر ←
        </button>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
        {shops && shops.length > 0 ? (
          shops.map((shop: any) => <ShopCard key={shop._id} shop={shop} />)
        ) : (
          <div className="col-span-full rounded-2xl border border-dashed py-10 text-center">
            <h3 className="font-bold text-slate-500">جاري تحميل المتاجر...</h3>
          </div>
        )}
      </div>
    </section>
  );
};

export default TopShopsSection;
