import Link from "next/link";
import { ShoppingBag, Home, Search, ArrowRight } from "lucide-react";

export default function NotFound() {
  return (
    <div
      dir="rtl"
      className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center px-6 py-16 text-slate-800"
    >
      <div className="max-w-md w-full text-center">
        {/* Animated Icon Badge */}
        <div className="relative mx-auto mb-8 flex h-28 w-28 items-center justify-center rounded-3xl bg-emerald-100 text-emerald-600 shadow-xl shadow-emerald-500/10">
          <ShoppingBag size={52} className="animate-bounce" />
          <span className="absolute -top-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-emerald-700 text-xs font-black text-white shadow-md">
            404
          </span>
        </div>

        {/* Title & Description */}
        <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
          الصفحة غير موجودة!
        </h1>
        <p className="mt-4 text-sm leading-7 text-slate-500">
          عذراً، الرابط الذي تحاول الوصول إليه غير متاح أو قد تم نقله أو حذف المتجر/المنتج المطلوب.
        </p>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-700/20 transition hover:bg-emerald-800 hover:-translate-y-0.5"
          >
            <Home size={18} />
            العودة للرئيسية
          </Link>

          <Link
            href="/#products-grid"
            className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <Search size={18} />
            تصفح المنتجات
          </Link>
        </div>

        {/* Helpful links */}
        <div className="mt-12 border-t pt-6 text-xs text-slate-400">
          <span>تحتاج إلى مساعدة؟ </span>
          <Link href="/" className="font-semibold text-emerald-700 hover:underline inline-flex items-center gap-1">
            تواصل مع الدعم الفني
            <ArrowRight size={12} className="rotate-180" />
          </Link>
        </div>
      </div>
    </div>
  );
}
