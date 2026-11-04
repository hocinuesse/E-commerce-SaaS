"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  Truck,
  ShoppingCart,
  Menu,
  X,
  Search,
  UserRound,
  Package,
  LogOut,
} from "lucide-react";
import { GLOBAL_CATEGORIES } from "@/constants/categories";
import { UserRole } from "@/interfaces/IUserStore";

interface HomeHeaderProps {
  user: any;
  onLogout: () => void;
  search: string;
  onSearchChange: (value: string) => void;
  category: string;
  onCategoryChange: (value: string) => void;
  cartCount: number;
  onOpenCart: () => void;
}

export const HomeHeader: React.FC<HomeHeaderProps> = ({
  user,
  onLogout,
  search,
  onSearchChange,
  category,
  onCategoryChange,
  cartCount,
  onOpenCart,
}) => {
  const [mobileMenu, setMobileMenu] = useState(false);

  return (
    <>
      {/* ================= ANNOUNCEMENT BAR ================= */}
      <div className="bg-emerald-700 text-white py-2 text-center text-xs font-bold flex items-center justify-center gap-2">
        <Sparkles size={14} className="text-amber-400" />
        استخدم الكود{" "}
        <span className="bg-white text-emerald-800 px-2 py-0.5 rounded text-[10px] mx-1">
          ECOM20
        </span>{" "}
        واحصل على خصم 20% وشحن مجاني!
        <Sparkles size={14} className="text-amber-400" />
      </div>

      {/* ================= TOP BAR ================= */}
      <div className="border-b bg-slate-50">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between px-5 py-2 text-xs text-slate-500">
          <div className="hidden gap-6 md:flex">
            <a href="#" className="hover:text-emerald-700 transition">
              تواصل معنا
            </a>
            <a href="#" className="hover:text-emerald-700 transition">
              مركز المساعدة
            </a>
            <Link href="/profile/orders" className="hover:text-emerald-700 transition">
              تتبع طلبك
            </Link>
          </div>

          <div className="mx-auto flex items-center gap-2 font-semibold text-emerald-700 md:mx-0">
            <Truck size={14} />
            توصيل مجاني للطلبات فوق 299 ريال
          </div>

          <div className="hidden md:block">
            العربية <span className="mx-2">|</span> SAR
          </div>
        </div>
      </div>

      {/* ================= MAIN HEADER ================= */}
      <header className="sticky top-0 z-50 border-b bg-white/95 shadow-sm backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1500px] items-center gap-4 px-5 py-4">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenu(!mobileMenu)}
            className="rounded-xl border p-2 md:hidden text-slate-700"
            aria-label="القائمة الرئيسية"
          >
            {mobileMenu ? <X size={21} /> : <Menu size={21} />}
          </button>

          {/* Logo */}
          <Link
            href="/"
            className="flex min-w-fit items-center gap-2 text-2xl font-black tracking-tight text-emerald-700"
          >
            <span>EcoMart</span>
            <span className="rounded-xl bg-emerald-700 p-2 text-white shadow-lg">
              <ShoppingCart size={19} />
            </span>
          </Link>

          {/* Categories button */}
          <button
            onClick={() =>
              document
                .getElementById("categories")
                ?.scrollIntoView({ behavior: "smooth" })
            }
            className="hidden items-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-bold text-white shadow-md shadow-emerald-700/20 transition hover:bg-emerald-800 lg:flex"
          >
            <Menu size={18} />
            الأقسام
          </button>

          {/* Search Box */}
          <div className="flex flex-1 overflow-hidden rounded-xl border-2 border-slate-100 bg-slate-50 transition focus-within:border-emerald-500">
            <input
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="ابحث عن منتجات، علامات تجارية، فئات..."
              className="min-w-0 flex-1 bg-transparent px-4 py-3 text-sm outline-none text-slate-800"
            />

            <select
              value={category}
              onChange={(e) => onCategoryChange(e.target.value)}
              className="hidden border-x bg-transparent px-3 text-sm outline-none md:block text-slate-700"
            >
              <option value="الكل">الكل</option>
              {GLOBAL_CATEGORIES.map((item: any) => (
                <option key={item.name} value={item.name}>
                  {item.name}
                </option>
              ))}
            </select>

            <button
              onClick={() =>
                document
                  .getElementById("products-grid")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              className="bg-emerald-700 px-5 text-white transition hover:bg-emerald-800"
              aria-label="بحث"
            >
              <Search size={20} />
            </button>
          </div>

          {/* User & Cart Actions */}
          <div className="hidden items-center gap-5 md:flex">
            {user ? (
              <div className="flex items-center gap-6 border-l border-slate-200 pl-5">
                <Link
                  href={
                    user.role === UserRole.VENDOR
                      ? "/vendor/dashboard"
                      : user.role === UserRole.MANAGER
                        ? "/manager/dashboard"
                        : user.role === UserRole.ADMIN
                          ? "/admin/dashboard"
                          : "/profile"
                  }
                  className="group text-center text-xs text-emerald-600 font-bold"
                >
                  <UserRound
                    size={21}
                    className="mx-auto mb-1 transition group-hover:scale-110"
                  />
                  لوحة التحكم
                </Link>

                <Link
                  href="/profile/orders"
                  className="group text-center text-xs text-slate-600 font-bold hover:text-emerald-700 transition"
                >
                  <Package
                    size={21}
                    className="mx-auto mb-1 transition group-hover:scale-110"
                  />
                  طلباتي
                </Link>

                <button
                  onClick={onLogout}
                  className="group text-center text-xs text-rose-500 font-bold hover:text-rose-600 transition"
                >
                  <LogOut
                    size={21}
                    className="mx-auto mb-1 transition group-hover:scale-110"
                  />
                  خروج
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 border-l border-slate-200 pl-5">
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-bold text-slate-600 hover:text-emerald-700 transition"
                >
                  دخول
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 rounded-xl bg-emerald-100 text-emerald-700 text-sm font-bold hover:bg-emerald-200 transition shadow-sm"
                >
                  إنشاء حساب
                </Link>
              </div>
            )}

            <button
              onClick={onOpenCart}
              className="relative text-center text-xs text-slate-600 hover:text-emerald-700 transition"
              aria-label="عرض السلة"
            >
              <ShoppingCart size={21} className="mx-auto mb-1 transition" />
              السلة
              {cartCount > 0 && (
                <span className="absolute -left-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-emerald-700 px-1 text-[9px] text-white font-bold animate-pulse">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden border-t lg:block">
          <div className="mx-auto flex max-w-[1500px] items-center justify-center gap-12 px-5 py-3 text-sm font-semibold">
            {[
              ["الرئيسية", "#"],
              ["العروض", "#offers"],
              ["الجديد", "#new"],
              ["الأكثر مبيعاً", "#best"],
              ["العلامات التجارية", "#brands"],
              ["عن المنصة", "#about"],
            ].map(([label, href], index) => (
              <a
                key={label}
                href={href}
                className={`transition hover:text-emerald-700 ${
                  index === 0 ? "text-emerald-700" : "text-slate-600"
                }`}
              >
                {label}
              </a>
            ))}
          </div>
        </nav>

        {/* Mobile Navigation Drawer */}
        {mobileMenu && (
          <div className="border-t bg-white px-5 py-5 lg:hidden">
            <div className="grid gap-3">
              {[
                ["الرئيسية", "#"],
                ["العروض", "#offers"],
                ["الجديد", "#new"],
                ["الأكثر مبيعاً", "#best"],
                ["العلامات التجارية", "#brands"],
              ].map(([label, href]) => (
                <a
                  key={label}
                  href={href}
                  onClick={() => setMobileMenu(false)}
                  className="rounded-xl bg-slate-50 px-4 py-3 text-sm font-bold text-slate-800"
                >
                  {label}
                </a>
              ))}

              {user ? (
                <div className="pt-2 border-t flex flex-col gap-2">
                  <Link
                    href="/profile"
                    onClick={() => setMobileMenu(false)}
                    className="rounded-xl bg-emerald-50 text-emerald-700 px-4 py-3 text-sm font-bold"
                  >
                    لوحة التحكم
                  </Link>
                  <button
                    onClick={() => {
                      setMobileMenu(false);
                      onLogout();
                    }}
                    className="rounded-xl bg-rose-50 text-rose-600 px-4 py-3 text-sm font-bold text-right"
                  >
                    تسجيل الخروج
                  </button>
                </div>
              ) : (
                <div className="pt-2 border-t grid grid-cols-2 gap-2">
                  <Link
                    href="/login"
                    onClick={() => setMobileMenu(false)}
                    className="rounded-xl border text-center py-3 text-sm font-bold text-slate-700"
                  >
                    دخول
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileMenu(false)}
                    className="rounded-xl bg-emerald-700 text-center py-3 text-sm font-bold text-white"
                  >
                    إنشاء حساب
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>
    </>
  );
};

export default HomeHeader;
