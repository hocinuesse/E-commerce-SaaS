"use client";

import { useAuthStore } from "@/stores/useAuthStore";
import { motion } from "framer-motion";
import { Package, Layers, TrendingUp, Clock, Activity, Eye, BarChart3, ArrowUpRight } from "lucide-react";
import Link from "next/link";

// Mock Data
const recentActions = [
  { id: 1, action: "تحديث مخزون منتج", details: "حذاء رياضي: +25 وحدة", time: "منذ 5 دقائق", color: "bg-emerald-500" },
  { id: 2, action: "إخفاء منتج", details: "تيشيرت أسود - مخفي مؤقتاً", time: "منذ ساعة", color: "bg-amber-500" },
  { id: 3, action: "تحديث مخزون", details: "ساعة ذكية: -3 وحدات", time: "منذ 3 ساعات", color: "bg-blue-500" },
  { id: 4, action: "عرض منتج", details: "عطر فاخر - تم تفعيل العرض", time: "منذ 5 ساعات", color: "bg-emerald-600" },
];

const quickStats = [
  { label: "منتجات مدارة", value: "48", icon: <Package className="w-6 h-6" />, color: "text-emerald-700", bg: "bg-emerald-50", trend: "+5 هذا الأسبوع" },
  { label: "مخزون منخفض", value: "7", icon: <TrendingUp className="w-6 h-6" />, color: "text-amber-700", bg: "bg-amber-50", trend: "تحتاج تعبئة" },
  { label: "منتجات مخفية", value: "3", icon: <Eye className="w-6 h-6" />, color: "text-rose-700", bg: "bg-rose-50", trend: "غير معروضة" },
  { label: "إجراء اليوم", value: "12", icon: <Activity className="w-6 h-6" />, color: "text-blue-700", bg: "bg-blue-50", trend: "تحديثات" },
];

export default function ManagerDashboard() {
  const { user } = useAuthStore();

  return (
    <div className="p-6 md:p-8 dir-rtl space-y-8 max-w-7xl mx-auto">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-3xl font-black text-slate-900 mb-2">مرحباً، {user?.name} 👋</h1>
          <p className="text-slate-500 font-medium">هذه نظرة سريعة على حالة المنتجات والمخزون الذي تديره.</p>
        </div>
        <div className="flex gap-3">
          <Link href="/manager/products" className="bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:scale-105 transition-transform shadow-lg shadow-emerald-500/20">
            <Package className="w-4 h-4" /> إدارة المنتجات
          </Link>
          <Link href="/manager/store" className="bg-white text-slate-700 px-5 py-2.5 rounded-xl font-bold border border-slate-200 hover:bg-slate-50 transition-colors flex items-center gap-2 shadow-sm">
            <Layers className="w-4 h-4" /> المخزون
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickStats.map((stat, idx) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            key={idx}
            className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:border-emerald-300 transition-colors group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-full blur-2xl group-hover:bg-emerald-100 transition-colors opacity-50"></div>
            <div className="flex items-center justify-between mb-4 relative z-10">
              <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color}`}>
                {stat.icon}
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-700 transition-colors" />
            </div>
            <p className="text-3xl font-black text-slate-900 relative z-10 mb-1">{stat.value}</p>
            <p className="text-sm text-slate-500 font-bold relative z-10">{stat.label}</p>
            <p className="text-xs text-slate-400 mt-2 relative z-10">{stat.trend}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Activity Log */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-700" /> آخر الإجراءات
            </h3>
            <span className="text-xs text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">اليوم</span>
          </div>

          <div className="space-y-4">
            {recentActions.map((action, idx) => (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                key={action.id}
                className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-colors border border-slate-100"
              >
                <div className={`w-2 h-12 rounded-full ${action.color}`}></div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-slate-900">{action.action}</h4>
                  <p className="text-xs text-slate-500 mt-1">{action.details}</p>
                </div>
                <span className="text-xs text-slate-600 font-medium bg-white px-3 py-1 rounded-full whitespace-nowrap shadow-sm border border-slate-100">{action.time}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-600" /> إجراءات سريعة
          </h3>
          
          <div className="space-y-4">
            <Link href="/manager/products" className="flex items-center gap-4 p-4 rounded-2xl bg-emerald-50 border border-emerald-100 hover:bg-emerald-100 transition-colors group">
              <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-emerald-700 shadow-sm border border-emerald-50">
                <Package className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">إدارة المنتجات</h4>
                <p className="text-xs text-slate-500">إضافة، تعديل، حذف</p>
              </div>
              <ArrowUpRight className="w-5 h-5 text-slate-400 group-hover:text-emerald-700 transition-colors" />
            </Link>
            
            <Link href="/manager/store" className="flex items-center gap-4 p-4 rounded-2xl bg-emerald-50 border border-emerald-100 hover:bg-emerald-100 transition-colors group">
              <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-emerald-600 shadow-sm border border-emerald-50">
                <Layers className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">إدارة المخزون</h4>
                <p className="text-xs text-slate-500">تحديث الكميات والظهور</p>
              </div>
              <ArrowUpRight className="w-5 h-5 text-slate-400 group-hover:text-emerald-600 transition-colors" />
            </Link>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-3 mb-3">
                <Clock className="w-5 h-5 text-amber-500" />
                <span className="text-sm font-bold text-slate-900">ملخص سريع</span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-slate-500">آخر تحديث للمخزون</span><span className="text-slate-900 font-bold">منذ 5 دقائق</span></div>
                <div className="flex justify-between"><span className="text-slate-500">إجراءات اليوم</span><span className="text-slate-900 font-bold">12 إجراء</span></div>
                <div className="flex justify-between"><span className="text-slate-500">الدور</span><span className="text-emerald-600 font-bold">مدير متجر</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
