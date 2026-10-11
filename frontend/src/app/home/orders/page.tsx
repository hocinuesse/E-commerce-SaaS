"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import orderService from "@/services/orderService";
import { IOrder } from "@/interfaces/IOrder";
import { motion } from "framer-motion";
import { Package, Clock, Truck, CheckCircle2, XCircle, ArrowRight, MapPin, Map, Box } from "lucide-react";

export default function CustomerOrdersPage() {
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await orderService.getUserOrders();
        setOrders(response);
      } catch (err: any) {
        setError(err.response?.data?.message || "فشل في جلب قائمة الطلبات");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const getTimeline = (status: IOrder["status"]) => {
    const steps = [
      { id: "pending", name: "قيد الانتظار", icon: <Clock className="w-4 h-4" /> },
      { id: "processing", name: "قيد المعالجة", icon: <Box className="w-4 h-4" /> },
      { id: "shipped", name: "في الطريق", icon: <Truck className="w-4 h-4" /> },
      { id: "delivered", name: "تم التوصيل", icon: <CheckCircle2 className="w-4 h-4" /> },
    ];
    
    if (status === "cancelled") {
      return (
        <div className="flex items-center gap-2 text-rose-500 font-bold bg-rose-500/10 px-4 py-2 rounded-xl w-fit">
          <XCircle className="w-5 h-5" /> تم إلغاء هذا الطلب
        </div>
      );
    }

    const currentIndex = steps.findIndex(s => s.id === status);
    
    return (
      <div className="relative flex justify-between w-full max-w-2xl mt-8 mb-4">
        <div className="absolute top-1/2 left-0 right-0 h-1 bg-white/10 -translate-y-1/2 z-0 rounded-full"></div>
        <div 
          className="absolute top-1/2 right-0 h-1 bg-emerald-500 -translate-y-1/2 z-0 transition-all duration-500 rounded-full"
          style={{ width: `${currentIndex === -1 ? 0 : (currentIndex / (steps.length - 1)) * 100}%` }}
        ></div>
        
        {steps.map((step, idx) => {
          const isCompleted = currentIndex >= idx;
          const isCurrent = currentIndex === idx;
          
          return (
            <div key={step.id} className="relative z-10 flex flex-col items-center gap-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 transition-colors ${isCompleted ? "bg-emerald-500 border-slate-900 text-slate-950 shadow-[0_0_15px_rgba(16,185,129,0.5)]" : "bg-slate-800 border-slate-900 text-slate-500"}`}>
                {step.icon}
              </div>
              <span className={`text-[10px] sm:text-xs font-bold absolute -bottom-6 whitespace-nowrap ${isCurrent ? "text-emerald-400" : isCompleted ? "text-slate-300" : "text-slate-500"}`}>
                {step.name}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center bg-background">
        <Package className="w-12 h-12 text-primary animate-pulse" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground dir-rtl pt-24 pb-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 pb-6 border-b border-white/5">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-white flex items-center gap-3">
              طلباتي <span className="bg-primary/20 text-primary text-sm px-3 py-1 rounded-full">{orders.length} طلبات</span>
            </h1>
            <p className="text-slate-400 mt-2 font-medium">تتبع مسار شحناتك واستعرض تفاصيل طلباتك السابقة.</p>
          </div>
          <Link href="/home" className="flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-white transition-colors group">
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            العودة للمتجر
          </Link>
        </div>

        {error && (
          <div className="mb-8 rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-sm font-bold text-destructive text-center">
            {error}
          </div>
        )}

        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white/5 border border-white/10 rounded-3xl text-center px-4">
            <div className="w-32 h-32 bg-slate-900 rounded-full flex items-center justify-center border border-white/5 shadow-2xl mb-8 relative">
              <Package className="w-16 h-16 text-slate-500" />
            </div>
            <h2 className="text-2xl font-black text-white mb-3">لا توجد طلبات بعد!</h2>
            <p className="text-slate-400 mb-8 max-w-md">لم تقم بإجراء أي طلب حتى الآن. اكتشف العروض المميزة واطلب ما يناسبك.</p>
            <Link href="/home" className="rounded-2xl bg-primary px-8 py-4 font-bold text-white shadow-xl hover:scale-105 transition-transform">
              ابدأ التسوق الآن
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {orders.map((order, idx) => (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                key={order._id}
                className="glass-card rounded-3xl border border-white/5 overflow-hidden"
              >
                {/* Order Header */}
                <div className="bg-white/5 border-b border-white/5 p-6 flex flex-wrap items-center justify-between gap-6">
                  <div>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">رقم الطلب</p>
                    <p className="font-mono text-sm font-bold text-white">#{order._id.slice(-8).toUpperCase()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">تاريخ الطلب</p>
                    <p className="text-sm font-bold text-white">{new Date(order.createdAt).toLocaleDateString("ar-EG")}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">المجموع الكلي</p>
                    <p className="text-lg font-black text-emerald-400">{(order.totalAmount || 0).toLocaleString()} د.ج</p>
                  </div>
                  <button className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white text-xs font-bold rounded-xl transition-colors border border-white/10">
                    عرض الفاتورة
                  </button>
                </div>

                {/* Timeline and Details */}
                <div className="p-6 md:p-8">
                  {getTimeline(order.status)}

                  <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8">
                    
                    {/* Items List */}
                    <div>
                      <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                        <Package className="w-4 h-4 text-primary" /> المنتجات ({order.items.length})
                      </h3>
                      <div className="space-y-4">
                        {order.items.map((item, itemIdx) => (
                          <div key={item._id || itemIdx} className="flex items-center gap-4 bg-slate-900/50 p-3 rounded-2xl border border-white/5">
                            <div className="w-16 h-16 bg-slate-900 rounded-xl overflow-hidden shrink-0 border border-white/5 relative">
                              {item.product?.images?.[0] ? (
                                <Image src={`/${item.product.images[0]}`} alt={item.product.name} fill className="object-cover" />
                              ) : (
                                <div className="flex h-full items-center justify-center text-[10px] text-slate-600 font-bold">صورة</div>
                              )}
                            </div>
                            <div className="flex-1">
                              <p className="font-bold text-sm text-white line-clamp-1">{item.product?.name || "منتج غير متوفر"}</p>
                              {item.options && item.options.length > 0 && (
                                <div className="flex gap-2 mt-1">
                                  {item.options.map((opt, i) => <span key={i} className="text-[10px] bg-white/5 px-2 py-0.5 rounded text-slate-400">{opt.name}: {opt.values}</span>)}
                                </div>
                              )}
                              <div className="flex justify-between mt-2 text-sm">
                                <span className="text-slate-400">الكمية: {item.quantity}</span>
                                <span className="font-bold text-emerald-400">{(item.price || 0).toLocaleString()} د.ج</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Shipping Mock Info */}
                    <div>
                      <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-violet-400" /> معلومات التوصيل
                      </h3>
                      <div className="bg-slate-900/50 p-5 rounded-2xl border border-white/5 space-y-4">
                        
                        <div className="flex items-start gap-3">
                          <Map className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-bold text-white mb-1">الجزائر العاصمة، باب الزوار</p>
                            <p className="text-xs text-slate-400">الحي الجامعي 3، العمارة أ، الطابق الثاني</p>
                          </div>
                        </div>

                        <div className="h-px bg-white/5 w-full"></div>

                        <div>
                          <p className="text-xs text-slate-500 font-bold mb-1">طريقة الدفع</p>
                          <p className="text-sm font-bold text-white flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                            الدفع عند الاستلام (COD)
                          </p>
                        </div>

                        {/* Mock Tracking Map Placeholder */}
                        <div className="w-full h-24 bg-slate-800 rounded-xl mt-4 relative overflow-hidden border border-white/5 flex items-center justify-center group cursor-pointer">
                          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cartographer.png')] opacity-20"></div>
                          <span className="relative z-10 bg-primary/20 text-primary px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 group-hover:bg-primary group-hover:text-white transition-colors">
                            <MapPin className="w-3 h-3" /> تتبع المندوب على الخريطة
                          </span>
                        </div>

                      </div>
                    </div>

                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}