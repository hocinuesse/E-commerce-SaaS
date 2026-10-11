"use client";

import { useEffect, useState } from "react";
import cartService from "@/services/cartService";
import { ICart } from "@/interfaces/ICart";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, ArrowRight, ShieldCheck, CreditCard, Sparkles, Plus, Minus, ShoppingCart, Tag } from "lucide-react";

export default function CartPage() {
  const [cart, setCart] = useState<ICart | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [message, setMessage] = useState<string | null>(null);
  const [updatingItemId, setUpdatingItemId] = useState<string | null>(null);
  const pathname = usePathname();

  const showToast = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(null), 3000);
  };

  const fetchCart = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const cartData = await cartService.getCart();
      setCart(cartData);
    } catch (error: any) {
      showToast(error.message || "Failed to fetch cart");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [pathname]);

  const handleUpdateCartItem = async (action: string, productId: string) => {
    setUpdatingItemId(productId);
    try {
      const updatedCart = await cartService.updateCartItem(action, productId);
      setCart(updatedCart);
    } catch (error: any) {
      showToast(error.message || "Failed to update cart item");
    } finally {
      setUpdatingItemId(null);
    }
  };

  const handleRemoveCartItem = async (productId: string) => {
    setUpdatingItemId(productId);
    try {
      const updatedCart = await cartService.removeCartItem(productId);
      setCart(updatedCart);
    } catch (error: any) {
      showToast(error.message || "Failed to remove cart item");
    } finally {
      setUpdatingItemId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <ShoppingCart className="w-12 h-12 text-primary animate-bounce mb-4" />
        <div className="h-2 w-48 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full bg-primary w-1/2 rounded-full animate-pulse"></div>
        </div>
      </div>
    );
  }

  const isEmpty = !cart || cart.items.length === 0;

  return (
    <div className="min-h-screen bg-background text-foreground dir-rtl pt-24 pb-20">
      <AnimatePresence>
        {message && (
          <motion.div initial={{ opacity: 0, y: -20, x: "-50%" }} animate={{ opacity: 1, y: 0, x: "-50%" }} exit={{ opacity: 0, y: -20 }} className="fixed top-24 left-1/2 z-50 rounded-2xl border border-primary/30 bg-slate-900/95 px-6 py-4 text-sm font-bold text-white shadow-2xl backdrop-blur-xl flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-primary" />
            {message}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 pb-6 border-b border-white/5">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-white flex items-center gap-3">
              سلة المشتريات <span className="bg-primary/20 text-primary text-sm px-3 py-1 rounded-full">{cart?.items.reduce((acc, item) => acc + item.quantity, 0) || 0} عناصر</span>
            </h1>
            <p className="text-slate-400 mt-2 font-medium">راجع طلباتك قبل إتمام عملية الدفع بأمان.</p>
          </div>
          <Link href="/home" className="flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-white transition-colors group">
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            متابعة التسوق
          </Link>
        </div>

        {isEmpty ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white/5 border border-white/10 rounded-3xl text-center px-4">
            <div className="w-32 h-32 bg-slate-900 rounded-full flex items-center justify-center border border-white/5 shadow-2xl mb-8 relative">
              <ShoppingCart className="w-16 h-16 text-slate-500" />
              <div className="absolute -top-2 -right-2 bg-red-500 w-8 h-8 rounded-full border-4 border-slate-900"></div>
            </div>
            <h2 className="text-2xl font-black text-white mb-3">سلتك فارغة تماماً!</h2>
            <p className="text-slate-400 mb-8 max-w-md">لم تقم بإضافة أي منتجات إلى سلة التسوق الخاصة بك. استكشف منتجاتنا الرائعة وابدأ التسوق.</p>
            <Link href="/home" className="rounded-2xl bg-primary px-8 py-4 font-bold text-white shadow-xl hover:scale-105 transition-transform flex items-center gap-2">
              تصفح المنتجات الآن <ArrowRight className="w-5 h-5 rotate-180" />
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            
            {/* Cart Items List */}
            <div className="flex-1 w-full space-y-4">
              <AnimatePresence>
                {cart?.items.map((item) => {
                  const product = item.product;
                  if (!product) return null;
                  const isBusy = updatingItemId === product._id;

                  return (
                    <motion.div
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95, height: 0, margin: 0 }}
                      key={product._id}
                      className={`glass-card p-4 rounded-3xl flex flex-col sm:flex-row items-center gap-6 border transition-all duration-300 ${isBusy ? "border-primary/50 bg-primary/5 opacity-80" : "border-white/5 hover:border-emerald-500/30 hover:shadow-[0_0_30px_rgba(16,185,129,0.1)] hover:-translate-y-1"}`}
                    >
                      <Link href={`/shop/vendor/${product._id}`} className="relative h-32 w-32 shrink-0 rounded-2xl bg-slate-900 overflow-hidden border border-white/5 block group/img">
                        {product.images?.[0] ? (
                          <Image src={`/${product.images[0]}`} alt={product.name} fill className="object-cover transition-transform duration-500 group-hover/img:scale-110" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-xs text-slate-600 font-bold">صورة</div>
                        )}
                      </Link>

                      <div className="flex-1 w-full flex flex-col justify-between h-full py-2">
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <Link href={`/shop/vendor/${product._id}`}>
                              <h3 className="font-bold text-lg text-white hover:text-primary transition-colors line-clamp-1">{product.name}</h3>
                            </Link>
                            <p className="text-sm text-slate-400 mt-1">البائع: <span className="font-semibold text-emerald-400">{(product.shop as any)?.name || 'متجر'}</span></p>
                            
                            {/* Mock Options */}
                            <div className="flex gap-2 mt-3">
                              <span className="px-2 py-1 rounded-lg bg-white/5 text-xs font-bold text-slate-300 border border-white/5">اللون: أسود</span>
                              <span className="px-2 py-1 rounded-lg bg-white/5 text-xs font-bold text-slate-300 border border-white/5">المقاس: XL</span>
                            </div>
                          </div>
                          
                          <div className="text-left shrink-0">
                            <p className="font-black text-xl text-emerald-400">{product.price.toLocaleString()} د.ج</p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-6">
                          <button
                            disabled={isBusy}
                            onClick={() => handleRemoveCartItem(product._id)}
                            className="flex items-center gap-1 text-sm font-bold text-rose-500 hover:text-white hover:bg-rose-500 px-3 py-2 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-rose-500/20 disabled:opacity-50 disabled:hover:scale-100 disabled:hover:shadow-none"
                          >
                            <Trash2 className="w-4 h-4" /> حذف
                          </button>

                          <div className="flex items-center gap-4 bg-slate-900 border border-white/10 rounded-xl p-1">
                            <button
                              disabled={isBusy}
                              onClick={() => handleUpdateCartItem("decrease", product._id)}
                              className="w-8 h-8 flex items-center justify-center bg-white/5 hover:bg-emerald-500 hover:text-slate-900 rounded-lg text-white disabled:opacity-50 transition-all duration-300 hover:scale-110"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="w-6 text-center font-black text-lg">{item.quantity}</span>
                            <button
                              disabled={isBusy || item.quantity >= product.stock}
                              onClick={() => handleUpdateCartItem("increase", product._id)}
                              className="w-8 h-8 flex items-center justify-center bg-white/5 hover:bg-emerald-500 hover:text-slate-900 rounded-lg text-white disabled:opacity-50 transition-all duration-300 hover:scale-110"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {/* Sticky Order Summary */}
            <div className="w-full lg:w-[400px] shrink-0 sticky top-28">
              <div className="glass-card p-6 rounded-3xl border border-white/10 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl"></div>
                
                <h2 className="text-xl font-black text-white mb-6 flex items-center gap-2 relative z-10">
                  <ShoppingCart className="w-5 h-5 text-primary" /> ملخص الطلب
                </h2>

                <div className="space-y-4 text-sm font-medium relative z-10">
                  <div className="flex justify-between text-slate-300">
                    <span>المجموع الفرعي ({cart?.items.reduce((acc, item) => acc + item.quantity, 0)} عناصر)</span>
                    <span className="text-white font-bold">{cart?.totalPrice.toLocaleString()} د.ج</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>رسوم التوصيل (تقديرية)</span>
                    <span className="text-emerald-400 font-bold">مجاناً</span>
                  </div>
                  
                  {/* Mock Coupon Input */}
                  <div className="flex gap-2 pt-2">
                    <input type="text" placeholder="كود الخصم" className="flex-1 bg-slate-900 border border-white/10 rounded-xl px-4 py-2 outline-none focus:border-primary/50 text-sm" />
                    <button className="bg-white/10 hover:bg-white/20 text-white px-4 rounded-xl font-bold transition-colors">تطبيق</button>
                  </div>

                  <div className="h-px bg-white/10 my-4"></div>

                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-white">الإجمالي الكلي</span>
                    <span className="text-3xl font-black text-primary">{cart?.totalPrice.toLocaleString()} د.ج</span>
                  </div>
                </div>

                <Link href="/home/checkout" className="mt-8 w-full block text-center rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 py-4 font-black text-white shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] transition-all duration-300 relative z-10 active:scale-[0.98]">
                  متابعة للدفع الآمن
                </Link>

                <div className="mt-6 flex flex-col items-center gap-3 relative z-10">
                  <div className="flex gap-2">
                    <div className="w-10 h-6 bg-white/10 rounded border border-white/10 flex items-center justify-center"><CreditCard className="w-4 h-4 text-white/50" /></div>
                    <div className="w-10 h-6 bg-white/10 rounded border border-white/10 flex items-center justify-center"><ShieldCheck className="w-4 h-4 text-white/50" /></div>
                  </div>
                  <p className="text-xs text-slate-500 font-medium flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-500" /> تسوق آمن 100% ومحمي بتشفير متقدم
                  </p>
                </div>
              </div>

              {/* Mock Cross-sell Section */}
              <div className="mt-6 glass-card p-6 rounded-3xl border border-white/5">
                <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" /> يُشترى معاً عادةً
                </h3>
                <div className="flex items-center gap-4 bg-slate-900 p-3 rounded-2xl border border-white/5 hover:border-emerald-500/20 transition-all duration-300 hover:-translate-y-0.5 group/cross">
                  <div className="w-16 h-16 bg-slate-800 rounded-xl overflow-hidden group-hover/cross:scale-105 transition-transform duration-300"></div>
                  <div className="flex-1">
                    <h4 className="text-xs font-bold text-white mb-1">غطاء حماية فاخر</h4>
                    <p className="text-[10px] text-slate-400 mb-2">يتناسب مع طلبك</p>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-black text-emerald-400">1,200 د.ج</span>
                      <button className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-lg font-bold hover:bg-emerald-500 hover:text-white transition-all duration-300 hover:scale-105 shadow-sm hover:shadow-emerald-500/20">إضافة</button>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
}
