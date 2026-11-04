"use client";

import React from "react";
import Link from "next/link";
import { Heart, ShoppingCart, Star } from "lucide-react";
import { IProduct } from "@/interfaces/IProduct";

interface ProductCardProps {
  product: IProduct;
  onAdd: () => void;
  onFavorite?: () => void;
  isFavorite?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAdd,
  onFavorite,
  isFavorite = false,
}) => {
  return (
    <article className="group relative overflow-hidden rounded-2xl border bg-white p-3 transition duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-xl">
      {/* Favorite Button */}
      {onFavorite && (
        <button
          onClick={onFavorite}
          className="absolute right-5 top-5 z-10 rounded-full bg-white/95 p-2.5 shadow-md transition hover:scale-105"
          aria-label="إضافة للمفضلة"
        >
          <Heart
            size={17}
            className={
              isFavorite
                ? "fill-current text-rose-500"
                : "text-slate-500"
            }
          />
        </button>
      )}

      {/* Badge */}
      {product.badge && (
        <span className="absolute left-5 top-5 z-10 rounded-full bg-emerald-700 px-2.5 py-1.5 text-[10px] font-black text-white shadow">
          {product.badge}
        </span>
      )}

      {/* Image with Link */}
      <Link href={`/shop/${(product as any).shop?.slug || (product as any).shop}/${product._id}`}>
        <div className="overflow-hidden rounded-xl bg-slate-50 cursor-pointer">
          <img
            src={product.images?.[0] || "/placeholder.png"}
            alt={product.name}
            className="h-48 w-full object-cover transition duration-500 group-hover:scale-105"
          />
        </div>
      </Link>

      {/* Content */}
      <div className="p-2">
        <span className="text-[10px] font-semibold text-slate-400">
          {product.category}
        </span>

        <Link href={`/shop/${(product as any).shop?.slug || (product as any).shop}/${product._id}`}>
          <h3 className="mt-1 min-h-[44px] text-sm font-bold leading-5 hover:text-emerald-700 transition">
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        <div className="mt-2 flex items-center gap-1 text-xs">
          <Star size={13} className="fill-amber-400 text-amber-400" />
          <b>{product.rating?.toFixed(2) || "5.0"}</b>
          <span className="text-slate-400">({product.reviews?.length || 0})</span>
        </div>

        {/* Price & Action */}
        <div className="mt-3 flex items-end justify-between gap-2">
          <div>
            <b className="text-lg font-black text-emerald-700">
              {product.price.toLocaleString()} ر.س
            </b>
            {product.discountPrice && (
              <del className="mr-2 text-xs text-slate-400">
                {product.discountPrice.toLocaleString()} ر.س
              </del>
            )}
          </div>

          <button
            onClick={onAdd}
            className="rounded-xl bg-emerald-700 p-2.5 text-white shadow-sm transition hover:bg-emerald-800 hover:shadow-lg"
            aria-label="إضافة للسلة"
          >
            <ShoppingCart size={17} />
          </button>
        </div>

        {/* Stock & Discount Percentage */}
        <div className="mt-2 flex items-center justify-between text-[10px]">
          <span className="text-slate-400">المتبقي {product.stock} قطعة</span>
          {product.discountPrice && product.price > product.discountPrice && (
            <span className="font-bold text-red-500">
              خصم{" "}
              {(
                ((product.price - product.discountPrice) / product.price) *
                100
              ).toFixed(0)}
              %
            </span>
          )}
        </div>
      </div>
    </article>
  );
};

export default ProductCard;
