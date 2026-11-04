"use client";

import React from "react";
import Link from "next/link";
import { Star } from "lucide-react";

interface ShopCardProps {
  shop: {
    _id: string;
    name: string;
    slug?: string;
    description?: string;
    rating?: number;
    ratingCount?: number;
    settings?: {
      branding?: {
        logo?: string;
      };
    };
  };
}

export const ShopCard: React.FC<ShopCardProps> = ({ shop }) => {
  return (
    <Link href={`/shop/${shop.slug || shop._id}`}>
      <article className="group relative overflow-hidden rounded-2xl border bg-white p-5 text-center transition duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-xl h-full flex flex-col justify-between">
        <div>
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-4 border-slate-50 bg-slate-100 shadow-sm transition duration-500 group-hover:scale-110 group-hover:border-emerald-100">
            {shop.settings?.branding?.logo ? (
              <img
                src={shop.settings.branding.logo}
                alt={shop.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-2xl font-black text-slate-300">
                {shop.name?.charAt(0).toUpperCase()}
              </span>
            )}
          </div>

          <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-700 transition">
            {shop.name}
          </h3>

          <p className="mt-2 text-xs font-medium text-slate-500 line-clamp-2 min-h-[32px]">
            {shop.description || "متجر مميز يقدم أفضل المنتجات بجودة عالية."}
          </p>
        </div>

        <div>
          <div className="mt-4 flex items-center justify-center gap-1 text-sm font-bold text-amber-500">
            <Star size={16} className="fill-amber-400 text-amber-400" />
            <span>{shop.rating?.toFixed(1) || "5.0"}</span>
            <span className="text-xs text-slate-400 font-normal">
              ({shop.ratingCount || 0} تقييم)
            </span>
          </div>

          <div className="mt-4 w-full rounded-xl bg-slate-50 py-2 text-xs font-bold text-slate-600 transition group-hover:bg-emerald-50 group-hover:text-emerald-700">
            زيارة المتجر
          </div>
        </div>
      </article>
    </Link>
  );
};

export default ShopCard;
