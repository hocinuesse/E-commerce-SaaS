"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/useAuthStore";
import { useRouter } from "next/navigation";
import orderService from "@/services/orderService";
import { Package, Clock, CheckCircle2, Truck, XCircle, ChevronRight, Store, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

export default function CustomerOrdersPage() {
    const { user, isAuth, logout } = useAuthStore();
    const router = useRouter();
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isAuth) {
            router.push("/login");
            return;
        }

        const fetchOrders = async () => {
            try {
                const data = await orderService.getUserOrders();
                setOrders(data || []);
            } catch (error) {
                console.error("Failed to fetch orders", error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [isAuth, router]);

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "PENDING":
                return <span className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 rounded-full text-xs font-bold border border-amber-200"><Clock size={14} /> قيد المراجعة</span>;
            case "PROCESSING":
                return <span className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-xs font-bold border border-blue-200"><Package size={14} /> جاري التجهيز</span>;
            case "SHIPPED":
                return <span className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-full text-xs font-bold border border-indigo-200"><Truck size={14} /> تم الشحن</span>;
            case "DELIVERED":
                return <span className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold border border-emerald-200"><CheckCircle2 size={14} /> تم التوصيل</span>;
            case "CANCELLED":
                return <span className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 text-rose-700 rounded-full text-xs font-bold border border-rose-200"><XCircle size={14} /> ملغى</span>;
            default:
                return <span className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-full text-xs font-bold border border-slate-200">{status}</span>;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-700 rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dir-rtl pb-20">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
                <div className="max-w-[1200px] mx-auto px-5 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="w-10 h-10 flex items-center justify-center bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 rounded-full transition-colors">
                            <ChevronRight size={20} />
                        </Link>
                        <h1 className="text-lg font-black text-slate-900">طلباتي السابقة</h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-slate-600 hidden sm:block">أهلاً، {user?.name}</span>
                        <button onClick={logout} className="text-xs font-bold text-rose-500 bg-rose-50 px-3 py-1.5 rounded-lg hover:bg-rose-100 transition">
                            تسجيل خروج
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-[1200px] mx-auto px-5 py-8">
                {orders.length === 0 ? (
                    <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm max-w-xl mx-auto mt-10">
                        <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <ShoppingBag size={40} className="text-slate-300" />
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 mb-3">لا توجد طلبات بعد!</h2>
                        <p className="text-slate-500 mb-8 font-medium">يبدو أنك لم تقم بأي طلب حتى الآن. استكشف منتجاتنا الرائعة وابدأ التسوق.</p>
                        <Link href="/" className="inline-flex items-center gap-2 bg-emerald-700 text-white px-8 py-3.5 rounded-xl font-bold hover:bg-emerald-800 hover:scale-105 transition-all shadow-lg shadow-emerald-700/20">
                            <ShoppingBag size={18} /> تصفح المنتجات
                        </Link>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {orders.map((order: any) => (
                            <div key={order._id} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden hover:border-emerald-200 hover:shadow-md transition-all duration-300">
                                {/* Order Header */}
                                <div className="bg-slate-50/50 p-5 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                                        <div>
                                            <p className="text-xs text-slate-500 font-medium mb-1">تاريخ الطلب</p>
                                            <p className="text-sm font-bold text-slate-900">
                                                {format(new Date(order.createdAt), "dd MMMM yyyy", { locale: ar })}
                                            </p>
                                        </div>
                                        <div className="w-px h-8 bg-slate-200 hidden sm:block"></div>
                                        <div>
                                            <p className="text-xs text-slate-500 font-medium mb-1">الإجمالي</p>
                                            <p className="text-sm font-black text-emerald-700">{order.totalAmount?.toLocaleString()} د.ج</p>
                                        </div>
                                        <div className="w-px h-8 bg-slate-200 hidden sm:block"></div>
                                        <div>
                                            <p className="text-xs text-slate-500 font-medium mb-1">رقم الطلب</p>
                                            <p className="text-xs font-bold text-slate-900 font-mono bg-white px-2 py-1 rounded border border-slate-200">
                                                #{order._id.slice(-6).toUpperCase()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center">
                                        {getStatusBadge(order.status)}
                                    </div>
                                </div>

                                {/* Order Items */}
                                <div className="p-5 sm:p-6 space-y-5">
                                    {order.items.map((item: any, index: number) => (
                                        <div key={index} className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                                            <div className="w-20 h-20 bg-slate-100 rounded-xl overflow-hidden border border-slate-200 shrink-0">
                                                {item.product?.images?.[0] ? (
                                                    <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-slate-300"><Package size={24} /></div>
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-bold text-slate-900 text-sm sm:text-base line-clamp-2 mb-1">{item.product?.name || "منتج غير متوفر"}</h3>
                                                <p className="text-xs font-bold text-slate-500 flex items-center gap-1.5 mb-2">
                                                    <Store size={14} />
                                                    يُباع بواسطة المتجر
                                                </p>
                                                
                                                <div className="flex flex-wrap items-center gap-4 text-sm mt-2">
                                                    <div className="font-bold text-slate-900">
                                                        {(item.price || 0).toLocaleString()} د.ج
                                                    </div>
                                                    <div className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                                                        الكمية: {item.quantity}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
