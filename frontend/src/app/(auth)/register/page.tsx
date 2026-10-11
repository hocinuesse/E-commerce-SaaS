"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/useAuthStore";
import authService from "@/services/authService";
import { UserRole } from "@/interfaces/IUserStore";
import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, Lock, User, Phone, ArrowRight, Zap, ShoppingCart, Store, CheckCircle2 } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const { setUser } = useAuthStore();
  const [former, setFormer] = useState({
    name: "", email: "", password: "", phone: "", role: UserRole.CLIENT,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handelChange = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await authService.register(former);
      setUser(response);
      if (response.role === UserRole.VENDOR || response.role === UserRole.MANAGER) {
        router.push("/vendor/dashboard");
      } else {
        router.push("/home");
      }
    } catch (err: any) {
      setError(err?.message || "فشل إنشاء الحساب. يرجى المحاولة مرة أخرى.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex dir-rtl bg-white">
      {/* Right Side: Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 relative z-10 overflow-y-auto bg-white">
        
        <Link href="/home" className="absolute top-8 right-8 flex items-center gap-2 group text-slate-500 hover:text-emerald-700 transition-all duration-300 hover:scale-105 hidden sm:flex">
          <ArrowRight className="w-5 h-5 group-hover:translate-x-[-4px] transition-transform duration-300" />
          <span className="font-semibold text-sm">العودة للرئيسية</span>
        </Link>

        <div className="w-full max-w-md my-auto pt-16 pb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-center shadow-sm">
                <Zap className="w-5 h-5 text-emerald-600" />
              </div>
              <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-l from-emerald-600 to-teal-500">
                SaaSify
              </h1>
            </div>

            <h2 className="text-3xl font-bold text-slate-900 mb-2">انضم إلينا الآن 🚀</h2>
            <p className="text-slate-500 mb-6 text-sm">اختر نوع حسابك وأدخل بياناتك للبدء.</p>

            {error && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600 font-bold">
                {error}
              </motion.div>
            )}

            <form onSubmit={handelChange} className="space-y-4">
              
              {/* Role Selection */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">نوع الحساب</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormer({ ...former, role: UserRole.CLIENT })}
                    className={`relative overflow-hidden rounded-2xl border p-4 text-sm font-bold transition-all duration-300 flex flex-col items-center justify-center gap-2 group shadow-sm hover:shadow-md ${
                      former.role === UserRole.CLIENT
                        ? "border-emerald-500 bg-emerald-50 text-emerald-700 shadow-emerald-500/10 scale-[1.02]"
                        : "border-slate-200 bg-white text-slate-500 hover:bg-emerald-50/50 hover:border-emerald-300 hover:text-emerald-600"
                    }`}
                  >
                    {former.role === UserRole.CLIENT && <CheckCircle2 className="absolute top-2 right-2 w-4 h-4 text-emerald-600" />}
                    <ShoppingCart className={`w-6 h-6 transition-transform duration-300 ${former.role === UserRole.CLIENT ? 'scale-110' : 'group-hover:scale-110'}`} />
                    حساب متسوق
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setFormer({ ...former, role: UserRole.VENDOR })}
                    className={`relative overflow-hidden rounded-2xl border p-4 text-sm font-bold transition-all duration-300 flex flex-col items-center justify-center gap-2 group shadow-sm hover:shadow-md ${
                      former.role === UserRole.VENDOR
                        ? "border-teal-500 bg-teal-50 text-teal-700 shadow-teal-500/10 scale-[1.02]"
                        : "border-slate-200 bg-white text-slate-500 hover:bg-teal-50/50 hover:border-teal-300 hover:text-teal-600"
                    }`}
                  >
                    {former.role === UserRole.VENDOR && <CheckCircle2 className="absolute top-2 right-2 w-4 h-4 text-teal-600" />}
                    <Store className={`w-6 h-6 transition-transform duration-300 ${former.role === UserRole.VENDOR ? 'scale-110' : 'group-hover:scale-110'}`} />
                    حساب بائع
                  </button>
                </div>
              </div>

              {/* Inputs */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">الاسم الكامل</label>
                <div className="relative">
                  <User className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="text" required
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 pr-12 pl-4 text-sm text-slate-900 hover:border-emerald-300 hover:bg-emerald-50/30 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/30 outline-none transition-all duration-300 shadow-sm hover:shadow-md"
                    placeholder="مثال: حسين أحمد"
                    value={former.name} onChange={(e) => setFormer({ ...former, name: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">البريد الإلكتروني</label>
                <div className="relative">
                  <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="email" required
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 pr-12 pl-4 text-sm text-slate-900 hover:border-emerald-300 hover:bg-emerald-50/30 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/30 outline-none transition-all duration-300 shadow-sm hover:shadow-md"
                    placeholder="example@gmail.com"
                    value={former.email} onChange={(e) => setFormer({ ...former, email: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">رقم الهاتف</label>
                <div className="relative">
                  <Phone className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="text" required
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 pr-12 pl-4 text-sm text-slate-900 hover:border-emerald-300 hover:bg-emerald-50/30 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/30 outline-none transition-all duration-300 dir-ltr text-right shadow-sm hover:shadow-md"
                    placeholder="0550 00 00 00"
                    value={former.phone} onChange={(e) => setFormer({ ...former, phone: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">كلمة المرور</label>
                <div className="relative">
                  <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="password" required minLength={6}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 pr-12 pl-4 text-sm text-slate-900 hover:border-emerald-300 hover:bg-emerald-50/30 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/30 outline-none transition-all duration-300 shadow-sm hover:shadow-md"
                    placeholder="••••••••"
                    value={former.password} onChange={(e) => setFormer({ ...former, password: e.target.value })}
                  />
                </div>
              </div>

              <button
                type="submit" disabled={loading}
                className="w-full rounded-2xl bg-emerald-700 py-3.5 font-bold text-white shadow-lg shadow-emerald-500/20 transition-all duration-300 hover:bg-emerald-800 hover:scale-[1.02] hover:shadow-xl hover:shadow-emerald-500/30 active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100 disabled:hover:shadow-lg mt-4 group flex items-center justify-center gap-2"
              >
                {loading ? "جاري الإنشاء..." : <>إنشاء الحساب الآن <ArrowRight className="w-5 h-5 rotate-180 group-hover:translate-x-[4px] transition-transform duration-300" /></>}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-500 font-medium">
              لديك حساب بالفعل؟ <Link href="/login" className="text-emerald-700 font-bold hover:text-emerald-900 hover:underline transition-all duration-300 hover:translate-x-[-2px] inline-block">تسجيل الدخول</Link>
            </p>
          </motion.div>
        </div>
      </div>

      {/* Left Side: Animated Abstract Graphic (Only on Large Screens) */}
      <div className="hidden lg:flex w-1/2 relative bg-slate-50 border-r border-slate-200 overflow-hidden flex-col items-center justify-center">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-teal-200/40 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-200/40 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }}></div>
        
        <div className="relative z-10 text-center px-12">
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}
            className="w-32 h-32 mx-auto bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-full flex items-center justify-center mb-8 shadow-xl hover:shadow-2xl hover:scale-110 transition-all duration-500 cursor-default group"
          >
            <User className="w-16 h-16 text-emerald-500 group-hover:text-emerald-600 group-hover:scale-110 transition-all duration-300" />
          </motion.div>
          <h2 className="text-4xl font-black text-slate-900 mb-6 leading-tight">ابدأ رحلتك في عالم التجارة الرقمية</h2>
          <p className="text-xl text-slate-600 font-medium">سواء كنت متسوقاً يبحث عن الأفضل، أو تاجراً يطمح للنجاح. نحن هنا من أجلك.</p>
        </div>
      </div>
    </div>
  );
}
