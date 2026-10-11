"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import adminService from "@/services/adminService";
import { Shop, ShopStatus } from "@/interfaces/IProduct";
import { motion } from "framer-motion";
import { Store, CheckCircle2, Clock, XCircle, AlertTriangle, Eye, ArrowUpRight, Search, Filter } from "lucide-react";

export default function AdminStoresPage() {
  const [stores, setStores] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchStores = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminService.getAllStores();
      setStores(response.shops || []);
    } catch (err: any) {
      setError(err?.message || "فشل في جلب المتاجر");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, []);

  const handleQuickApprove = async (shopId: string) => {
    try {
      setUpdatingId(shopId);
      const updated = await adminService.updateShopStatus(shopId, ShopStatus.ACTIVE);
      setStores((prev) =>
        prev.map((s) => (s._id === shopId ? { ...s, status: ShopStatus.ACTIVE } : s))
      );
      setSuccessMsg("تمت المصادقة على المتجر بنجاح ✅");
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setError(err?.message || "فشل في تحديث الحالة");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleQuickReject = async (shopId: string) => {
    try {
      setUpdatingId(shopId);
      await adminService.updateShopStatus(shopId, ShopStatus.REJECTED);
      setStores((prev) =>
        prev.map((s) => (s._id === shopId ? { ...s, status: ShopStatus.REJECTED } : s))
      );
      setSuccessMsg("تم رفض المتجر ❌");
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setError(err?.message || "فشل في تحديث الحالة");
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusConfig = (status: string) => {
    const map: Record<string, { label: string; icon: React.ReactNode; color: string; bg: string; dot: string }> = {
      ACTIVE: { label: "نشط", icon: <CheckCircle2 className="w-4 h-4" />, color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200", dot: "bg-emerald-500" },
      PENDING: { label: "قيد المراجعة", icon: <Clock className="w-4 h-4" />, color: "text-amber-700", bg: "bg-amber-50 border-amber-200", dot: "bg-amber-500" },
      SUSPENDED: { label: "موقوف", icon: <AlertTriangle className="w-4 h-4" />, color: "text-rose-700", bg: "bg-rose-50 border-rose-200", dot: "bg-rose-500" },
      REJECTED: { label: "مرفوض", icon: <XCircle className="w-4 h-4" />, color: "text-red-700", bg: "bg-red-50 border-red-200", dot: "bg-red-500" },
    };
    return map[status] || map.PENDING;
  };

  const filteredStores = stores.filter((store) => {
    const matchesStatus = filterStatus === "ALL" || store.status === filterStatus;
    const matchesSearch = store.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      store.owner?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      store.owner?.email?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const pendingCount = stores.filter((s) => s.status === ShopStatus.PENDING).length;
  const activeCount = stores.filter((s) => s.status === ShopStatus.ACTIVE).length;
  const suspendedCount = stores.filter((s) => s.status === ShopStatus.SUSPENDED).length;
  const rejectedCount = stores.filter((s) => s.status === ShopStatus.REJECTED).length;

  const statusFilters = [
    { key: "ALL", label: "الكل", count: stores.length },
    { key: "PENDING", label: "قيد المراجعة", count: pendingCount },
    { key: "ACTIVE", label: "نشط", count: activeCount },
    { key: "SUSPENDED", label: "موقوف", count: suspendedCount },
    { key: "REJECTED", label: "مرفوض", count: rejectedCount },
  ];

  if (loading) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center">
        <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-700 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 space-y-6 dir-rtl max-w-7xl mx-auto">

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
            <Store className="text-emerald-700 w-8 h-8" />
            إدارة المتاجر
          </h1>
          <p className="text-slate-500 mt-2 font-medium">المصادقة على المتاجر الجديدة وإدارة حالة المتاجر الموجودة.</p>
        </div>
        <Link href="/admin/dashboard" className="px-5 py-2.5 bg-white text-slate-700 border border-slate-200 rounded-xl text-sm font-bold hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md">
          العودة للوحة التحكم
        </Link>
      </div>

      {/* Success/Error Messages */}
      {successMsg && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-4 rounded-2xl font-bold flex items-center gap-2 shadow-sm">
          <CheckCircle2 className="w-5 h-5" /> {successMsg}
        </motion.div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-2xl font-bold flex items-center gap-2 shadow-sm">
          <AlertTriangle className="w-5 h-5" /> {error}
          <button onClick={() => setError(null)} className="mr-auto text-xs underline">إغلاق</button>
        </div>
      )}

      {/* Pending Alert Banner */}
      {pendingCount > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-center gap-4"
        >
          <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
            <Clock className="w-6 h-6 text-amber-700" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-black text-amber-900">لديك {pendingCount} متجر بانتظار المصادقة</h3>
            <p className="text-xs text-amber-700 mt-1">قم بمراجعة الطلبات الجديدة والمصادقة عليها أو رفضها.</p>
          </div>
          <button
            onClick={() => setFilterStatus("PENDING")}
            className="px-4 py-2 bg-amber-600 text-white rounded-xl text-sm font-bold hover:bg-amber-700 hover:scale-105 hover:shadow-lg hover:shadow-amber-500/30 transition-all duration-300"
          >
            عرض المعلقة
          </button>
        </motion.div>
      )}

      {/* Filter Tabs + Search */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {statusFilters.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilterStatus(f.key)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 border shadow-sm hover:scale-105 ${
                filterStatus === f.key
                  ? "bg-emerald-700 text-white border-emerald-700 shadow-emerald-700/30 shadow-md scale-105"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700"
              }`}
            >
              {f.label} <span className="mr-1 text-xs opacity-75">({f.count})</span>
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="بحث بالاسم أو البريد..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pr-10 pl-4 text-sm text-slate-900 focus:border-emerald-500 outline-none shadow-sm"
          />
        </div>
      </div>

      {/* Stores List */}
      {filteredStores.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 shadow-sm">
          <Store className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-900 mb-2">لا توجد متاجر</h3>
          <p className="text-sm text-slate-500">لم يتم العثور على متاجر تطابق معايير البحث.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredStores.map((store, idx) => {
            const config = getStatusConfig(store.status);
            const isPending = store.status === ShopStatus.PENDING;
            const isUpdating = updatingId === store._id;

            return (
              <motion.div
                key={store._id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`bg-white rounded-2xl border shadow-sm p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 group ${
                  isPending ? "border-amber-200 bg-amber-50/30 hover:border-amber-300 hover:shadow-amber-100/50" : "border-slate-200 hover:border-emerald-300 hover:shadow-emerald-100/50"
                }`}
              >
                {/* Store Logo */}
                <div className="relative w-14 h-14 shrink-0 rounded-xl border border-slate-200 bg-slate-50 overflow-hidden group-hover:scale-110 transition-transform duration-300">
                  {store?.settings?.branding?.logo ? (
                    <Image src={`/${store.settings.branding.logo}`} alt={store.name} fill className="object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xl font-black text-slate-400 group-hover:text-emerald-600 transition-colors">
                      {store.name?.charAt(0)}
                    </div>
                  )}
                </div>

                {/* Store Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-base font-black text-slate-900 truncate group-hover:text-emerald-800 transition-colors">{store.name}</h3>
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${config.bg} ${config.color} group-hover:scale-105 transition-transform duration-300`}>
                      {config.icon} {config.label}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                    <span>المالك: <strong className="text-slate-700">{store.owner?.name || "غير محدد"}</strong></span>
                    <span>{store.owner?.email || ""}</span>
                    <span>تاريخ الإنشاء: {store.createdAt ? new Date(store.createdAt).toLocaleDateString("ar-EG") : "-"}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  {isPending && (
                    <>
                      <button
                        onClick={() => handleQuickApprove(store._id)}
                        disabled={isUpdating}
                        className="px-4 py-2 bg-emerald-700 text-white rounded-xl text-sm font-bold hover:bg-emerald-800 hover:scale-105 hover:shadow-lg hover:shadow-emerald-700/30 transition-all duration-300 disabled:opacity-50 disabled:hover:scale-100 flex items-center gap-1.5 shadow-sm"
                      >
                        {isUpdating ? (
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                          <CheckCircle2 className="w-4 h-4" />
                        )}
                        مصادقة
                      </button>
                      <button
                        onClick={() => handleQuickReject(store._id)}
                        disabled={isUpdating}
                        className="px-4 py-2 bg-red-50 text-red-700 border border-red-200 rounded-xl text-sm font-bold hover:bg-red-100 hover:scale-105 hover:shadow-md hover:shadow-red-100/50 transition-all duration-300 disabled:opacity-50 disabled:hover:scale-100 flex items-center gap-1.5"
                      >
                        <XCircle className="w-4 h-4" /> رفض
                      </button>
                    </>
                  )}
                  <Link
                    href={`/admin/stores/${store._id}`}
                    className="px-4 py-2 bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-sm font-bold hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700 hover:scale-105 transition-all duration-300 flex items-center gap-1.5"
                  >
                    <Eye className="w-4 h-4" /> التفاصيل
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
