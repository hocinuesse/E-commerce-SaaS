"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/useAuthStore";
import authService from "@/services/authService";
import { UserRole } from "@/interfaces/IUserStore";
import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, Lock, ArrowRight, Zap, Store, Box } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useAuthStore();
  const [former, setFormer] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handelChange = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await authService.login(former.email, former.password);
      setUser(response);
      const role = response.role;
      if (role === UserRole.ADMIN) router.push("/admin/dashboard");
      else if (role === UserRole.VENDOR) router.push("/vendor/dashboard");
      else if (role === UserRole.MANAGER) router.push("/manager/products");
      else router.push("/home");
    } catch (err: any) {
      setError(err?.message || "فشل تسجيل الدخول. يرجى المحاولة مرة أخرى.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex dir-rtl bg-white">
      {/* Right Side: Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 relative z-10 bg-white">
        
        <Link href="/home" className="absolute top-8 right-8 flex items-center gap-2 group text-slate-500 hover:text-emerald-700 transition-all duration-300 hover:scale-105">
          <ArrowRight className="w-5 h-5 group-hover:translate-x-[-4px] transition-transform duration-300" />
          <span className="font-semibold text-sm">العودة للرئيسية</span>
        </Link>

        <div className="w-full max-w-md">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center justify-center shadow-sm">
                <Zap className="w-6 h-6 text-emerald-600" />
              </div>
              <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-l from-emerald-600 to-teal-500">
                SaaSify
              </h1>
            </div>

            <h2 className="text-3xl font-bold text-slate-900 mb-2">مرحباً بعودتك! 👋</h2>
            <p className="text-slate-500 mb-8">قم بتسجيل الدخول للوصول إلى لوحة التحكم الخاصة بك.</p>

            {error && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600 font-bold">
                {error}
              </motion.div>
            )}

            <form onSubmit={handelChange} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">البريد الإلكتروني</label>
                <div className="relative">
                  <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="email" required
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 pr-12 pl-4 text-slate-900 hover:border-emerald-300 hover:bg-emerald-50/30 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/30 outline-none transition-all duration-300 shadow-sm hover:shadow-md"
                    placeholder="admin@example.com"
                    value={former.email}
                    onChange={(e) => setFormer({ ...former, email: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-bold text-slate-700">كلمة المرور</label>
                  <Link href="#" className="text-xs font-bold text-emerald-600 hover:text-emerald-800 hover:underline transition-all duration-300 hover:translate-x-[-2px] inline-block">نسيت كلمة المرور؟</Link>
                </div>
                <div className="relative">
                  <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="password" required
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 pr-12 pl-4 text-slate-900 hover:border-emerald-300 hover:bg-emerald-50/30 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/30 outline-none transition-all duration-300 shadow-sm hover:shadow-md"
                    placeholder="••••••••"
                    value={former.password}
                    onChange={(e) => setFormer({ ...former, password: e.target.value })}
                  />
                </div>
              </div>

              <button
                type="submit" disabled={loading}
                className="w-full rounded-2xl bg-emerald-700 py-4 font-bold text-white shadow-lg shadow-emerald-500/20 transition-all duration-300 hover:bg-emerald-800 hover:scale-[1.02] hover:shadow-xl hover:shadow-emerald-500/30 active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100 disabled:hover:shadow-lg flex items-center justify-center gap-2 group"
              >
                {loading ? "جاري التحقق..." : <>تسجيل الدخول <ArrowRight className="w-5 h-5 rotate-180 group-hover:translate-x-[4px] transition-transform duration-300" /></>}
              </button>
            </form>

            <p className="mt-8 text-center text-sm text-slate-500 font-medium">
              ليس لديك حساب؟ <Link href="/register" className="text-emerald-700 font-bold hover:text-emerald-900 hover:underline transition-all duration-300 hover:translate-x-[2px] inline-block">أنشئ حساباً جديداً</Link>
            </p>
          </motion.div>
        </div>
      </div>

      {/* Left Side: Animated Abstract Graphic (Only on Large Screens) */}
      <div className="hidden lg:flex w-1/2 relative bg-slate-50 border-r border-slate-200 overflow-hidden flex-col items-center justify-center">
        {/* Animated Orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-200/40 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-200/40 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }}></div>
        
        {/* Glassmorphic Mock UI elements floating */}
        <div className="relative z-10 w-full max-w-md">
          <motion.div animate={{ y: [0, -20, 0] }} transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }} className="bg-white/60 backdrop-blur-xl border border-slate-200 shadow-xl p-6 rounded-3xl mb-6 flex items-center gap-4 hover:scale-[1.03] hover:shadow-2xl transition-all duration-300 cursor-default">
            <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center"><Store className="w-6 h-6 text-emerald-600" /></div>
            <div><div className="h-4 w-32 bg-slate-200 rounded-full mb-2"></div><div className="h-3 w-20 bg-slate-100 rounded-full"></div></div>
          </motion.div>
          
          <motion.div animate={{ y: [0, 20, 0] }} transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }} className="bg-white/60 backdrop-blur-xl border border-slate-200 shadow-xl p-6 rounded-3xl ml-12 flex items-center gap-4 hover:scale-[1.03] hover:shadow-2xl transition-all duration-300 cursor-default">
            <div className="w-12 h-12 bg-teal-50 rounded-full flex items-center justify-center"><Box className="w-6 h-6 text-teal-600" /></div>
            <div><div className="h-4 w-24 bg-slate-200 rounded-full mb-2"></div><div className="h-3 w-40 bg-slate-100 rounded-full"></div></div>
          </motion.div>
        </div>

        <div className="absolute bottom-12 left-12 right-12 z-10 text-center">
          <h2 className="text-3xl font-black text-slate-900 mb-4">المنصة المتكاملة لتجارتك</h2>
          <p className="text-lg text-slate-600">إدارة المخزون، الطلبات، والمدفوعات في مكان واحد بتجربة مستخدم لا مثيل لها.</p>
        </div>
      </div>
    </div>
  );
}
