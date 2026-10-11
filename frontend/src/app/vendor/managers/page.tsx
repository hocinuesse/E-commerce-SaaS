"use client";

import React, { useState, useEffect } from "react";
import { useAuthStore } from "@/stores/useAuthStore";
import managerService from "@/services/managerService";
import { UserRole } from "@/interfaces/IUserStore";
import ProtectedRoute from "@/components/protectedRoute";
import { motion, AnimatePresence } from "framer-motion";
import { Users, UserPlus, Trash2, Mail, Phone, Calendar, Shield, AlertCircle, X, Check, SearchX } from "lucide-react";

interface IManager {
  _id: string;
  name: string;
  email: string;
  phone: string;
  createdAt: string;
}

export default function VendorManagers() {
  const { user, shop } = useAuthStore();
  const [managers, setManagers] = useState<IManager[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isModelOpen, setIsModelOpen] = useState(false);
  const [formData, setFormData] = useState({ email: "", name: "", password: "", phone: "" });

  const fetchManagers = async () => {
    setLoading(true);
    setError(null);
    if (!user?.shopId) { setError("لا يوجد متجر مرتبط بحسابك."); setLoading(false); return; }
    try {
      const data = await managerService.getAllManagers();
      setManagers(data || []);
    } catch (err: any) {
      setError(err.message || "فشل في جلب قائمة المدراء.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchManagers(); }, [user?.shopId]);

  const handelAddManager = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      await managerService.createManager(formData);
      setFormData({ email: "", name: "", password: "", phone: "" });
      setIsModelOpen(false);
      fetchManagers();
    } catch (err: any) {
      setError(err.message || "فشل في إضافة المدير.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handelDeleteManager = async (managerId: string) => {
    if (!confirm("هل أنت متأكد من إزالة هذا المدير؟")) return;
    setDeletingId(managerId);
    setError(null);
    try {
      await managerService.deleteManager(managerId);
      fetchManagers();
    } catch (err: any) {
      setError(err.message || "فشل في حذف المدير.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <ProtectedRoute allowedRoles={[UserRole.VENDOR]}>
      <div className="p-6 md:p-8 dir-rtl space-y-8 max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3 mb-2">
              <Users className="w-8 h-8 text-emerald-700" /> إدارة فريق العمل
            </h1>
            <p className="text-slate-500 font-medium">أضف مدراء للمتجر مع صلاحيات التحكم في المنتجات والمخزون.</p>
          </div>
          <button
            onClick={() => setIsModelOpen(true)}
            className="bg-emerald-700 text-white px-6 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 hover:scale-105 transition-transform"
          >
            <UserPlus className="w-5 h-5" /> إضافة مدير جديد
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-2xl font-bold flex items-center gap-2">
            <AlertCircle className="w-5 h-5" /> {error}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white shadow-sm p-6 rounded-3xl border border-slate-200 flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-700"><Users className="w-7 h-7" /></div>
            <div><p className="text-sm text-slate-500 font-bold mb-1">إجمالي المدراء</p><p className="text-2xl font-black text-slate-900">{managers.length}</p></div>
          </div>
          <div className="bg-white shadow-sm p-6 rounded-3xl border border-slate-200 flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-700"><Shield className="w-7 h-7" /></div>
            <div><p className="text-sm text-slate-500 font-bold mb-1">المتجر</p><p className="text-lg font-black text-slate-900 truncate">{shop?.name || "غير محدد"}</p></div>
          </div>
          <div className="bg-white shadow-sm p-6 rounded-3xl border border-slate-200 flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-700"><Calendar className="w-7 h-7" /></div>
            <div><p className="text-sm text-slate-500 font-bold mb-1">آخر إضافة</p><p className="text-lg font-black text-slate-900">{managers.length > 0 ? new Date(managers[managers.length - 1].createdAt).toLocaleDateString("ar-EG") : "-"}</p></div>
          </div>
        </div>

        {/* Managers Grid */}
        {loading ? (
          <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-700 rounded-full animate-spin"></div></div>
        ) : managers.length === 0 ? (
          <div className="bg-white shadow-sm p-16 rounded-3xl border border-slate-200 flex flex-col items-center text-center">
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-4"><SearchX className="w-10 h-10 text-slate-400" /></div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">لا يوجد مدراء</h3>
            <p className="text-slate-500 mb-6">لم تقم بإضافة أي مدير حتى الآن. أضف مدراء لمساعدتك في إدارة المتجر.</p>
            <button onClick={() => setIsModelOpen(true)} className="bg-emerald-700 text-white px-6 py-3 rounded-2xl font-bold hover:scale-105 transition-transform">
              <UserPlus className="w-5 h-5 inline ml-2" /> أضف أول مدير
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {managers.map((manager, idx) => (
              <motion.div 
                key={manager._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white shadow-sm p-6 rounded-3xl border border-slate-200 hover:border-emerald-300 transition-colors group relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-emerald-600"></div>
                
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white font-black text-xl shadow-md">
                    {manager.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-slate-900">{manager.name}</h3>
                    <p className="text-xs text-emerald-700 font-bold uppercase">مدير المتجر</p>
                  </div>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-3 text-slate-700">
                    <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="truncate">{manager.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-700">
                    <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                    <span dir="ltr">{manager.phone || "غير محدد"}</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-700">
                    <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>{new Date(manager.createdAt).toLocaleDateString("ar-EG")}</span>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100">
                  <button
                    disabled={deletingId === manager._id}
                    onClick={() => handelDeleteManager(manager._id)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-rose-600 bg-rose-50 hover:bg-rose-600 hover:text-white transition-colors disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" /> {deletingId === manager._id ? "جاري الإزالة..." : "إزالة المدير"}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Add Manager Modal */}
        <AnimatePresence>
          {isModelOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModelOpen(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"></motion.div>
              
              <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-lg bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                  <h2 className="text-xl font-black text-slate-900 flex items-center gap-2"><UserPlus className="w-5 h-5 text-emerald-700" /> إضافة مدير جديد</h2>
                  <button onClick={() => setIsModelOpen(false)} className="p-2 text-slate-500 hover:text-slate-900 bg-slate-100 rounded-xl transition-colors"><X className="w-5 h-5" /></button>
                </div>

                <form onSubmit={handelAddManager} className="p-6 space-y-5">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">الاسم الكامل <span className="text-rose-500">*</span></label>
                    <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 text-sm focus:border-emerald-500 outline-none text-slate-900 shadow-sm" placeholder="أحمد محمد" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">البريد الإلكتروني <span className="text-rose-500">*</span></label>
                    <input type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 text-sm focus:border-emerald-500 outline-none text-slate-900 shadow-sm" placeholder="manager@example.com" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">رقم الهاتف <span className="text-rose-500">*</span></label>
                    <input type="tel" required value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 text-sm focus:border-emerald-500 outline-none text-slate-900 dir-ltr text-right shadow-sm" placeholder="0550 00 00 00" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">كلمة المرور الأولية <span className="text-rose-500">*</span></label>
                    <input type="password" required minLength={6} value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 text-sm focus:border-emerald-500 outline-none text-slate-900 shadow-sm" placeholder="••••••••" />
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                    <button type="button" onClick={() => setIsModelOpen(false)} className="px-6 py-3 rounded-xl font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors">إلغاء</button>
                    <button type="submit" disabled={isSubmitting} className="bg-emerald-700 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:scale-105 transition-transform disabled:opacity-50 shadow-lg shadow-emerald-500/20">
                      {isSubmitting ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> : <Check className="w-5 h-5" />}
                      إنشاء حساب المدير
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </ProtectedRoute>
  );
}
