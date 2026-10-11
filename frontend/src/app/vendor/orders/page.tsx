"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import orderService from "@/services/orderService";
import { IOrder } from "@/interfaces/IOrder";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Clock, Truck, CheckCircle2, XCircle, Box, Filter, Search, Eye, ChevronDown, AlertCircle } from "lucide-react";

const STATUS_OPTIONS = [
  { value: "pending", label: "قيد الانتظار", icon: <Clock className="w-4 h-4" />, color: "amber" },
  { value: "processing", label: "قيد المعالجة", icon: <Box className="w-4 h-4" />, color: "teal" },
  { value: "shipped", label: "تم الشحن", icon: <Truck className="w-4 h-4" />, color: "emerald-light" },
  { value: "delivered", label: "تم التسليم", icon: <CheckCircle2 className="w-4 h-4" />, color: "emerald" },
  { value: "cancelled", label: "ملغى", icon: <XCircle className="w-4 h-4" />, color: "rose" },
];

export default function ShopOrdersPage() {
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await orderService.getShopOrders();
        setOrders(response);
      } catch (err: any) {
        setError(err.response?.data?.message || "فشل في جلب قائمة الطلبات");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      setUpdatingId(orderId);
      await orderService.updateOrderStatus(orderId, newStatus);
      setOrders((prevOrders) =>
        prevOrders.map((ord) =>
          ord._id === orderId ? { ...ord, status: newStatus as IOrder["status"] } : ord
        )
      );
    } catch (err: any) {
      setError(err.response?.data?.message || "فشل في تحديث حالة الطلب");
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredOrders = filterStatus === "all" ? orders : orders.filter(o => o.status === filterStatus);

  const getStatusBadge = (status: string) => {
    const opt = STATUS_OPTIONS.find(s => s.value === status);
    if (!opt) return <span className="text-slate-400 text-xs">{status}</span>;
    const colorMap: Record<string, string> = {
      amber: "bg-amber-50 text-amber-700 border-amber-200",
      teal: "bg-teal-50 text-teal-700 border-teal-200",
      "emerald-light": "bg-emerald-50 text-emerald-600 border-emerald-200",
      emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
      rose: "bg-rose-50 text-rose-700 border-rose-200",
    };
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${colorMap[opt.color]}`}>
        {opt.icon} {opt.label}
      </span>
    );
  };

  return (
    <div className="p-6 md:p-8 dir-rtl space-y-8 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3 mb-2">
            <ShoppingCart className="w-8 h-8 text-emerald-700" /> إدارة الطلبات
          </h1>
          <p className="text-slate-500 font-medium">تتبع وإدارة جميع طلبات العملاء وتحديث حالتها.</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-2xl font-bold flex items-center gap-2">
          <AlertCircle className="w-5 h-5" /> {error}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {STATUS_OPTIONS.map(opt => {
          const count = orders.filter(o => o.status === opt.value).length;
          const colorMap: Record<string, string> = {
            amber: "text-amber-700 bg-amber-100",
            teal: "text-teal-700 bg-teal-100",
            "emerald-light": "text-emerald-600 bg-emerald-100",
            emerald: "text-emerald-700 bg-emerald-100",
            rose: "text-rose-700 bg-rose-100",
          };
          return (
            <button 
              key={opt.value} 
              onClick={() => setFilterStatus(filterStatus === opt.value ? "all" : opt.value)} 
              className={`bg-white p-4 rounded-2xl border transition-all duration-300 text-center cursor-pointer shadow-sm hover:-translate-y-1 hover:shadow-md ${filterStatus === opt.value ? "border-emerald-300 bg-emerald-50 shadow-emerald-100 scale-105" : "border-slate-200 hover:border-emerald-200"}`}
            >
              <div className={`w-10 h-10 rounded-xl ${colorMap[opt.color]} flex items-center justify-center mx-auto mb-2`}>
                {opt.icon}
              </div>
              <p className="text-2xl font-black text-slate-900">{count}</p>
              <p className="text-[10px] font-bold text-slate-500 uppercase">{opt.label}</p>
            </button>
          );
        })}
      </div>

      {/* Orders List */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <h2 className="font-bold text-slate-900 flex items-center gap-2">
            قائمة الطلبات <span className="bg-emerald-50 text-emerald-700 text-xs px-2 py-0.5 rounded-full border border-emerald-200">{filteredOrders.length}</span>
          </h2>
          {filterStatus !== "all" && (
            <button onClick={() => setFilterStatus("all")} className="text-xs font-bold text-slate-400 hover:text-slate-700 transition-colors">
              عرض الكل ✕
            </button>
          )}
        </div>

        {loading ? (
          <div className="p-12 flex justify-center"><div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div></div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-16 flex flex-col items-center text-center">
            <ShoppingCart className="w-16 h-16 text-slate-300 mb-4" />
            <h3 className="text-xl font-bold text-slate-900 mb-2">لا توجد طلبات</h3>
            <p className="text-slate-500">لم يتم تسجيل أي طلبات في هذه الفئة بعد.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredOrders.map((order) => {
              const isUpdating = updatingId === order._id;
              const isExpanded = expandedOrder === order._id;

              return (
                <div key={order._id} className={`transition-colors ${isUpdating ? "bg-emerald-50/50" : ""}`}>
                  {/* Order Row */}
                  <div className="p-5 flex flex-wrap items-center gap-6 hover:bg-emerald-50/30 hover:border-r-4 hover:border-r-emerald-500 transition-all duration-300 cursor-pointer" onClick={() => setExpandedOrder(isExpanded ? null : order._id)}>
                    <div className="flex-1 min-w-[180px]">
                      <p className="font-mono text-xs text-slate-400 mb-1">#{order._id.slice(-8).toUpperCase()}</p>
                      <p className="text-sm font-bold text-slate-900">{new Date(order.createdAt).toLocaleDateString("ar-EG")} — {new Date(order.createdAt).toLocaleTimeString("ar-EG", { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>

                    <div>{getStatusBadge(order.status)}</div>
                    
                    <div className="text-left">
                      <p className="text-xs text-slate-500 font-bold">الإجمالي</p>
                      <p className="text-lg font-black text-emerald-700">{(order.totalAmount || 0).toLocaleString()} د.ج</p>
                    </div>

                    {/* Status Change Dropdown */}
                    <div onClick={(e) => e.stopPropagation()}>
                      <select
                        disabled={isUpdating}
                        value={order.status}
                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                        className="bg-white border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:border-emerald-500 outline-none disabled:opacity-50 cursor-pointer appearance-none transition-all duration-300 shadow-sm hover:shadow-md"
                      >
                        {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                      </select>
                    </div>

                    <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                  </div>

                  {/* Expandable Details */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                        <div className="p-5 pt-0 grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Items */}
                          <div className="space-y-3">
                            <h4 className="text-sm font-bold text-slate-700 mb-3">المنتجات المطلوبة</h4>
                            {order.items.map((item, idx) => (
                              <div key={item._id || idx} className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                                <div className="w-12 h-12 bg-white rounded-lg overflow-hidden shrink-0 border border-slate-200 relative">
                                  {item.product?.images?.[0] ? (
                                    <Image src={`/${item.product.images[0]}`} alt={item.product.name} fill className="object-cover" />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-400 font-bold">صورة</div>
                                  )}
                                </div>
                                <div className="flex-1">
                                  <p className="text-sm font-bold text-slate-900 line-clamp-1">{item.product?.name || "منتج"}</p>
                                  <div className="flex gap-4 mt-1 text-xs text-slate-500">
                                    <span>الكمية: {item.quantity}</span>
                                    <span className="text-emerald-700 font-bold">{(item.price || 0).toLocaleString()} د.ج</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                          
                          {/* Customer Info (Mock) */}
                          <div className="bg-slate-50 p-5 rounded-xl border border-slate-100">
                            <h4 className="text-sm font-bold text-slate-700 mb-3">بيانات العميل</h4>
                            <div className="space-y-3 text-sm">
                              <div className="flex justify-between"><span className="text-slate-500">العميل:</span><span className="text-slate-900 font-bold">عميل #{order._id.slice(-4)}</span></div>
                              <div className="flex justify-between"><span className="text-slate-500">طريقة الدفع:</span><span className="text-slate-900 font-bold">COD</span></div>
                              <div className="flex justify-between"><span className="text-slate-500">عدد العناصر:</span><span className="text-slate-900 font-bold">{order.items.length}</span></div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
