"use client";

import { useAuthStore } from "@/stores/useAuthStore";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, PieChart, Pie, Cell } from 'recharts';
import { ShieldAlert, TrendingUp, Users, ShoppingCart, Store, Server, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import adminService from "@/services/adminService";
import Link from "next/link";
import { useEffect, useState } from "react";

// Mock Data for SaaS Platform Admin
const platformRevenue = [
  { name: 'يناير', revenue: 15000 },
  { name: 'فبراير', revenue: 18000 },
  { name: 'مارس', revenue: 22000 },
  { name: 'أبريل', revenue: 20000 },
  { name: 'مايو', revenue: 28000 },
  { name: 'يونيو', revenue: 35000 },
];

const usersDistribution = [
  { name: 'العملاء', value: 8500, color: '#10b981' },
  { name: 'التجار', value: 450, color: '#14b8a6' },
  { name: 'المدراء', value: 30, color: '#059669' },
];

const recentActivity = [
  { id: 1, action: 'متجر جديد تم إنشاؤه', details: 'متجر "أناقة" انضم للمنصة', time: 'منذ 10 دقائق', type: 'success' },
  { id: 2, action: 'تحديث النظام', details: 'تم نشر التحديث v2.4 بنجاح', time: 'منذ 3 ساعات', type: 'info' },
  { id: 3, action: 'تنبيه أمني', details: 'محاولة دخول متكررة بحساب مدير', time: 'منذ 5 ساعات', type: 'warning' },
];

export default function DashboardAdminPage() {
  const { user } = useAuthStore();

  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [totalOrders, setTotalOrders] = useState<number>(0);
  const [totalStores, setTotalStores] = useState<number>(0);

  const getTotalUsers = async () => {
    try {
      const response = await adminService.totalUsers();
      setTotalUsers(response);
      console.log("total users", response);
      return response;
    } catch (error) {
      console.log(error);
    }
  }

  const getTotalOrders = async () => {
    try {
      const response = await adminService.totalOrders();
      setTotalOrders(response);
      console.log("total orders", response);
      return response;
    } catch (error) {
      console.log(error);
    }
  }

  const getTotalStores = async () => {
    try {
      const response = await adminService.getAllStores();
      setTotalStores(response.activeShopsCount);
      console.log("total stores", response);
      return response.activeShopsCount;
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    getTotalUsers();
    getTotalOrders();
    getTotalStores();
  }, []);

  const kpis = [
    { title: "إجمالي الإيرادات", value: "2,450,000 د.ج", icon: <TrendingUp className="w-6 h-6 text-emerald-700" />, trend: "+22.5%" },
    { title: "المتاجر النشطة", value: totalStores || 0, icon: <Store className="w-6 h-6 text-emerald-700" />, trend: "+12" },
    { title: "المستخدمين", value: totalUsers || 0, icon: <Users className="w-6 h-6 text-emerald-700" />, trend: "+8.1%" },
    { title: "الطلبات الكلية", value: totalOrders || 0, icon: <ShoppingCart className="w-6 h-6 text-emerald-600" />, trend: "+15.3%" },
  ];

  return (
    <div className="p-4 sm:p-8 space-y-8 dir-rtl">

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
            <ShieldAlert className="text-emerald-700 w-8 h-8" />
            لوحة الإدارة المركزية (Super Admin)
          </h1>
          <p className="text-slate-500 mt-2 font-medium">نظرة شاملة على أداء منصة SaaS بالكامل.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-5 py-2.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-xl text-sm font-bold hover:bg-rose-100 hover:scale-105 transition-all duration-300 flex items-center gap-2 shadow-sm hover:shadow-rose-200/50">
            <AlertTriangle className="w-4 h-4" /> تقرير الأمان
          </button>
          <button className="px-5 py-2.5 bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-700/20 hover:bg-emerald-800 hover:scale-105 hover:shadow-emerald-700/40 transition-all duration-300 flex items-center gap-2">
            <Server className="w-4 h-4" /> حالة الخوادم
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, idx) => (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
            key={idx}
            className="bg-white p-6 rounded-3xl relative overflow-hidden group border border-slate-200 shadow-sm hover:border-emerald-400 hover:shadow-xl hover:shadow-emerald-100/50 hover:-translate-y-1 transition-all duration-300 cursor-default"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full blur-3xl group-hover:bg-emerald-100 transition-all duration-500 scale-100 group-hover:scale-150"></div>
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 shadow-sm group-hover:bg-emerald-50 group-hover:border-emerald-200 transition-all duration-300 group-hover:scale-110">
                {kpi.icon}
              </div>
              {kpi.trend && (
                <span className="flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-200 group-hover:bg-emerald-100 group-hover:scale-105 transition-all duration-300">
                  <TrendingUp className="w-3 h-3" /> {kpi.trend}
                </span>
              )}
            </div>
            <h3 className="text-slate-500 text-sm font-bold mb-1 relative z-10 group-hover:text-emerald-700 transition-colors duration-300">{kpi.title}</h3>
            <p className="text-3xl font-black text-slate-900 relative z-10 group-hover:text-emerald-800 transition-colors duration-300">{kpi.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-slate-900">إيرادات المنصة (الاشتراكات + العمولات)</h3>
          </div>
          <div className="h-[300px] w-full dir-ltr">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={platformRevenue} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px' }}
                  itemStyle={{ color: '#0f172a' }}
                />
                <Area type="monotone" dataKey="revenue" name="الإيرادات" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Users Distribution Chart */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col">
          <div className="mb-2">
            <h3 className="text-lg font-bold text-slate-900">توزيع المستخدمين</h3>
          </div>
          <div className="flex-1 w-full dir-ltr flex flex-col justify-center">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={usersDistribution} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {usersDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px' }}
                  itemStyle={{ color: '#0f172a' }}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Custom Legend */}
            <div className="mt-4 space-y-3 dir-rtl">
              {usersDistribution.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                    <span className="text-sm text-slate-500 font-medium">{item.name}</span>
                  </div>
                  <span className="text-sm font-bold text-slate-900">{item.value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Store Management Quick Link */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-emerald-100/40 hover:border-emerald-200 transition-all duration-300 flex flex-col sm:flex-row items-center justify-between gap-6 group">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center border border-emerald-100 group-hover:scale-110 group-hover:bg-emerald-100 transition-all duration-300">
            <Store className="w-8 h-8 text-emerald-600 group-hover:text-emerald-700 transition-colors" />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-900 mb-1 group-hover:text-emerald-800 transition-colors">إدارة المتاجر</h3>
            <p className="text-slate-500 font-medium">قم بمراجعة طلبات الانضمام الجديدة والمصادقة على المتاجر المعلقة.</p>
          </div>
        </div>
        <Link href="/admin/stores" className="shrink-0 px-6 py-3 bg-emerald-700 text-white rounded-xl font-bold hover:bg-emerald-800 hover:scale-105 transition-all duration-300 shadow-lg shadow-emerald-700/20 hover:shadow-emerald-700/40 flex items-center gap-2">
          الانتقال للمصادقة <AlertTriangle className="w-4 h-4 text-emerald-300" />
        </Link>
      </div>

    </div>
  );
}
