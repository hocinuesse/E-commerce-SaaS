"use client";

import React from "react";
import Link from "next/link";
import { X, ShoppingCart, Plus, Minus, CreditCard } from "lucide-react";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: any[];
  cartCount: number;
  cartTotal: number;
  onChangeQuantity: (action: "increase" | "decrease", productId: string) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cart,
  cartCount,
  cartTotal,
  onChangeQuantity,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100]" dir="rtl">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
      />

      {/* Drawer */}
      <aside className="absolute left-0 top-0 flex h-full w-full max-w-md flex-col bg-white shadow-2xl animate-in slide-in-from-left duration-300">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-5">
          <div>
            <h2 className="text-xl font-black text-slate-900">سلة التسوق</h2>
            <p className="mt-1 text-xs text-slate-500">{cartCount} منتج</p>
          </div>

          <button
            onClick={onClose}
            className="rounded-full bg-slate-100 p-2 text-slate-600 hover:bg-slate-200 transition"
            aria-label="إغلاق السلة"
          >
            <X size={19} />
          </button>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {cart.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="rounded-full bg-emerald-50 p-6 text-emerald-600">
                <ShoppingCart size={40} />
              </div>
              <h3 className="mt-5 font-black text-slate-800">السلة فارغة</h3>
              <p className="mt-2 text-sm text-slate-500">
                أضف المنتجات التي تعجبك إلى السلة.
              </p>
              <button
                onClick={onClose}
                className="mt-6 rounded-xl bg-emerald-700 px-6 py-3 text-sm font-bold text-white hover:bg-emerald-800 transition shadow-md"
              >
                متابعة التسوق
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              {cart.map((item: any) => {
                const product = item.product || {};
                const image = product.images?.[0] || product.image || "/placeholder.png";

                return (
                  <div
                    key={item._id || product._id || product.id}
                    className="flex gap-4 border-b pb-5"
                  >
                    <img
                      src={image}
                      alt={product.name}
                      className="h-24 w-24 rounded-xl object-cover bg-slate-50 border"
                    />

                    <div className="min-w-0 flex-1">
                      <h3 className="line-clamp-2 text-sm font-bold text-slate-800">
                        {product.name}
                      </h3>

                      <b className="mt-2 block text-emerald-700">
                        {((product.discountPrice || product.price || 0)).toLocaleString()} ر.س
                      </b>

                      <div className="mt-3 flex items-center gap-2">
                        <button
                          onClick={() => onChangeQuantity("decrease", product._id || product.id)}
                          className="rounded-lg border p-1 text-slate-600 hover:bg-slate-50 transition"
                          aria-label="تقليل الكمية"
                        >
                          <Minus size={14} />
                        </button>

                        <span className="w-6 text-center text-sm font-bold text-slate-800">
                          {item.quantity}
                        </span>

                        <button
                          onClick={() => onChangeQuantity("increase", product._id || product.id)}
                          className="rounded-lg border p-1 text-slate-600 hover:bg-slate-50 transition"
                          aria-label="زيادة الكمية"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Checkout */}
        {cart.length > 0 && (
          <div className="border-t bg-slate-50 px-6 py-6">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-500">الإجمالي الكلي</span>
              <b className="text-xl text-emerald-700">
                {cartTotal.toLocaleString()} ر.س
              </b>
            </div>

            <Link
              href="/checkout"
              onClick={onClose}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 py-4 text-sm font-bold text-white shadow-lg shadow-emerald-700/20 transition hover:bg-emerald-800"
            >
              <CreditCard size={18} />
              إتمام الطلب
            </Link>
          </div>
        )}
      </aside>
    </div>
  );
};

export default CartDrawer;
