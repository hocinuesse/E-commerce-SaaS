"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import Image from "next/image";
import adminService from "@/services/adminService";
import { Shop } from "@/interfaces/IProduct";
import { ShopStatus } from "@/interfaces/IProduct";
import { motion } from "framer-motion";
import { ArrowRight, Store, User, Mail, Phone, Calendar, Shield, CheckCircle2, XCircle, Clock, AlertTriangle, FileText, Save } from "lucide-react";

export default function AdminStoreDetailsPage({ params }: { params: Promise<{ shopId: string }> }) {
  const resolvedParams = use(params);
  const storeId = resolvedParams.shopId;

  const [store, setStore] = useState<Shop | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [updating, setUpdating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<Shop["status"]>(ShopStatus.PENDING);
  const [adminNotes, setAdminNotes] = useState<string>("");

  useEffect(() => {
    const fetchStoreDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await adminService.getShopDetails(storeId);
        setStore(response);
        setSelectedStatus(response.status);
      } catch (err: any) {
        setError(err.response?.data?.message || "فشل في جلب بيانات المتجر المحدد");
      } finally {
        setLoading(false);
      }
    };
    if (storeId) fetchStoreDetails();
  }, [storeId]);

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setUpdating(true);
      setError(null);
      setSuccessMessage(null);
      const response = await adminService.updateShopStatus(storeId, selectedStatus);
      if (response) {
        setStore(response);
      } else {
        setStore((prev) => prev ? { ...prev, status: selectedStatus, adminNotes } : null);
      }
      setSuccessMessage("تم تحديث حالة المتجر بنجاح ⚡");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || "فشل في تحديث حالة المتجر");
    } finally {
      setUpdating(false);
    }
  };

  const getStatusConfig = (status: string) => {
    const map: Record<string, { label: string; icon: React.ReactNode; color: string; bg: string }> = {
      ACTIVE: { label: "نشط", icon: <CheckCircle2 className="w-5 h-5" />, color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200" },
      PENDING: { label: "قيد المراجعة", icon: <Clock className="w-5 h-5" />, color: "text-amber-700", bg: "bg-amber-50 border-amber-200" },
      SUSPENDED: { label: "موقوف", icon: <AlertTriangle className="w-5 h-5" />, color: "text-rose-700", bg: "bg-rose-50 border-rose-200" },
      REJECTED: { label: "مرفوض", icon: <XCircle className="w-5 h-5" />, color: "text-red-700", bg: "bg-red-50 border-red-200" },
    };
    return map[status] || map.PENDING;
  };

  if (loading) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center">
        <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-700 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error && !store) {
    return (
      <div className="p-8 dir-rtl max-w-xl mx-auto text-center">
        <div className="mb-6 bg-red-50 rounded-3xl border border-red-200 p-8 shadow-sm">
          <AlertTriangle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <p className="text-red-600 font-bold">{error}</p>
        </div>
        <Link href="/admin/dashboard" className="inline-block rounded-xl bg-slate-100 px-6 py-3 text-sm font-bold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md">
          الرجوع للوحة التحكم
        </Link>
      </div>
    );
  }

  const statusConfig = getStatusConfig(store?.status || "PENDING");

  return (
    <div className="p-6 md:p-8 dir-rtl space-y-8 max-w-6xl mx-auto">

      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/dashboard" className="p-3 bg-white border border-slate-200 shadow-sm rounded-xl hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700 hover:scale-105 transition-all duration-300 text-slate-700">
          <ArrowRight className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-black text-slate-900">تفاصيل المتجر</h1>
          <p className="text-xs text-slate-500 font-mono mt-1">ID: {store?._id}</p>
        </div>
        <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${statusConfig.bg} ${statusConfig.color} font-bold text-sm hover:scale-105 transition-all duration-300 shadow-sm`}>
          {statusConfig.icon} {statusConfig.label}
        </div>
      </div>

      {/* Messages */}
      {successMessage && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-4 rounded-2xl font-bold flex items-center gap-2 shadow-sm">
          <CheckCircle2 className="w-5 h-5" /> {successMessage}
        </motion.div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-2xl font-bold flex items-center gap-2 shadow-sm">
          <AlertTriangle className="w-5 h-5" /> {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Store Info Card */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-sm">

            {/* Store Identity */}
            <div className="flex items-center gap-5 mb-8 pb-6 border-b border-slate-100">
              <div className="relative w-20 h-20 shrink-0 rounded-2xl border-2 border-slate-200 bg-white overflow-hidden shadow-sm">
                {store?.settings.branding.logo ? (
                  <Image src={`/${store.settings.branding.logo}`} alt={store.name} fill className="object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-3xl font-black text-slate-400">{store?.name?.charAt(0)}</div>
                )}
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-900">{store?.name}</h2>
                <p className="text-sm text-slate-500 font-mono dir-ltr text-right">/{store?.slug}</p>
                <p className="text-xs text-slate-400 mt-1">تاريخ الإنشاء: {store?.createdAt ? new Date(store.createdAt).toLocaleDateString("ar-EG") : "-"}</p>
              </div>
            </div>

            {/* Description */}
            <div className="mb-8 group">
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2 group-hover:text-emerald-700 transition-colors">
                <FileText className="w-4 h-4" /> وصف المتجر
              </h3>
              <p className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-sm text-slate-700 leading-relaxed hover:bg-emerald-50 hover:border-emerald-200 transition-all duration-300">
                {store?.description || "لا يوجد وصف مدخل لهذا المتجر."}
              </p>
            </div>

            {/* Owner Info */}
            <div>
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                <User className="w-4 h-4" /> بيانات المالك
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center gap-3 hover:bg-emerald-50 hover:border-emerald-200 transition-all duration-300 group">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-700 group-hover:scale-110 transition-transform duration-300"><User className="w-5 h-5" /></div>
                  <div><p className="text-[10px] text-slate-400 font-bold uppercase">الاسم</p><p className="text-sm font-bold text-slate-900 group-hover:text-emerald-800 transition-colors">{store?.owner?.name || "غير محدد"}</p></div>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center gap-3 hover:bg-teal-50 hover:border-teal-200 transition-all duration-300 group">
                  <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center text-teal-700 group-hover:scale-110 transition-transform duration-300"><Mail className="w-5 h-5" /></div>
                  <div><p className="text-[10px] text-slate-400 font-bold uppercase">البريد</p><p className="text-sm font-bold text-slate-900 truncate group-hover:text-teal-800 transition-colors">{store?.owner?.email || "-"}</p></div>
                </div>
                {store?.owner?.phone && (
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center gap-3 md:col-span-2 hover:bg-emerald-50 hover:border-emerald-200 transition-all duration-300 group">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-700 group-hover:scale-110 transition-transform duration-300"><Phone className="w-5 h-5" /></div>
                    <div><p className="text-[10px] text-slate-400 font-bold uppercase">الهاتف</p><p className="text-sm font-bold text-slate-900 font-mono group-hover:text-emerald-800 transition-colors" dir="ltr">{store.owner.phone}</p></div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Status Control Panel */}
        <div className="lg:col-span-5 sticky top-28 self-start">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 relative overflow-hidden shadow-sm">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full blur-3xl opacity-50"></div>

            <h2 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2 relative z-10">
              <Shield className="w-6 h-6 text-emerald-700" /> إدارة حالة المتجر
            </h2>

            <form onSubmit={handleUpdateStatus} className="space-y-6 relative z-10">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-3">تغيير الحالة</label>
                <div className="grid grid-cols-2 gap-3">
                  {(["ACTIVE", "PENDING", "SUSPENDED", "REJECTED"] as const).map(status => {
                    const config = getStatusConfig(status);
                    return (
                      <button
                        type="button" key={status}
                        onClick={() => setSelectedStatus(status as Shop["status"])}
                        className={`p-3 rounded-xl border text-sm font-bold flex items-center gap-2 transition-all duration-300 shadow-sm hover:scale-105 ${selectedStatus === status ? `${config.bg} ${config.color} border-${config.color.split('-')[1]}-200 scale-105 shadow-md` : "border-slate-200 bg-white text-slate-500 hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700"}`}
                      >
                        {config.icon} {config.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">ملاحظات الإدارة</label>
                <textarea
                  rows={4}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="أدخل سبب القرار أو ملاحظات تظهر للمالك..."
                  className="w-full bg-white border border-slate-200 rounded-2xl p-4 text-sm focus:border-emerald-500 outline-none text-slate-900 resize-none shadow-sm"
                />
              </div>

              <button
                type="submit"
                disabled={updating}
                className="w-full bg-emerald-700 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-emerald-800 hover:scale-[1.02] hover:shadow-xl hover:shadow-emerald-700/40 transition-all duration-300 disabled:opacity-50 disabled:hover:scale-100 shadow-lg shadow-emerald-500/20"
              >
                {updating ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> : <Save className="w-5 h-5" />}
                {updating ? "جاري التحديث..." : "حفظ التغييرات"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}