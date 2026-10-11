"use client";

import { useAuthStore } from "@/stores/useAuthStore";
import { useEffect, useState } from "react";
import vendorService from "@/services/vendorService";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  Package,
  DollarSign,
  ShoppingCart,
  TrendingUp,
  Users,
  Activity,
  PlusCircle,
  Settings,
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import productsService from "@/services/productsService";
import { OrderMethod, currency } from "@/interfaces/IProduct";

export default function DashboardVendorPage() {
  const { user, shop, setShop } = useAuthStore();
  const [isLoading, setIsLoading] = useState(!!shop);
  const [formerData, setFormerData] = useState({ name: "", description: "" });
  const [error, setError] = useState<string | null>(null);
  const [createLoading, setCreateLoading] = useState(false);
  const [salesRevenue, setSalesRevenue] = useState<number | null>(null);
  const [newOrdersCount, setNewOrdersCount] = useState<number | null>(null);
  const [activeProductsCount, setActiveProductsCount] = useState<number | null>(
    null,
  );
  const [salesData, setChartData] = useState([]);

  useEffect(() => {
    const fetchShopData = async () => {
      if (user?.shopId) {
        try {
          const response = await vendorService.getMyShop();
          setShop(response);
        } catch (err: any) {
          setError(err.message || "Failed to fetch shop data.");
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };
    fetchShopData();
  }, [user?.shopId, setShop]);

  const handleCreateShop = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateLoading(true);
    setError(null);
    try {
      const newShop = await vendorService.createShop(formerData);
      setShop(newShop);
    } catch (err: any) {
      setError(err.message || "فشل في إنشاء المتجر");
    } finally {
      setCreateLoading(false);
    }
  };

  const getSalesRevenue = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await vendorService.getTotalSales(shop?._id);
      console.log(response);

      setSalesRevenue(response.totalSales || 0);
      setNewOrdersCount(response.newOrders || 0);
    } catch (error: Error | any) {
      console.log(error.response.data.message || "failed to get sales revenue");
      setError(error.response.data.message || "failed to get sales revenue");
    } finally {
      setIsLoading(false);
    }
  };

  const getActiveProductsCount = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await productsService.getShopProducts(shop?._id);
      setActiveProductsCount(response.productsCount || 0);
      console.log(response.productsCount);
    } catch (error: Error | any) {
      console.log(
        error.response.data.message || "failed to get active products count",
      );
      setError(
        error.response.data.message || "failed to get active products count",
      );
    } finally {
      setIsLoading(false);
    }
  };



  const monthlySalesReport = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await vendorService.monthlySalesReport(shop?._id);
      console.log(response);
      setChartData(response)
    } catch (error: Error | any) {
      console.log(
        error.response.data.message || "failed to get monthly sales report",
      );
      setError(
        error.response.data.message || "failed to get monthly sales report",
      );
    }
  };

  useEffect(() => {
    if (shop) {
      getSalesRevenue();
      getActiveProductsCount();
      monthlySalesReport();
    }
  }, [shop, user]);

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 rounded-full border-t-2 border-emerald-600 animate-spin"></div>
        </div>
      </div>
    );
  }

  // --- No Shop Configured Yet ---
  if (!user?.shopId && !shop) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-8 shadow-xl"
        >
          <div className="mb-8 text-center">
            <div className="mx-auto w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mb-4">
              <Store className="w-8 h-8 text-emerald-700" />
            </div>
            <h1 className="text-3xl font-black text-slate-900">
              إطلاق متجرك الإلكتروني
            </h1>
            <p className="mt-2 text-slate-500">
              خطوة واحدة تفصلك عن بيع منتجاتك لآلاف العملاء
            </p>
          </div>

          {error && (
            <div className="mb-6 rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-600 font-bold">
              {error}
            </div>
          )}

          <form onSubmit={handleCreateShop} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                اسم المتجر
              </label>
              <input
                type="text"
                required
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all outline-none"
                placeholder="مثال: متجر الأناقة"
                value={formerData.name}
                onChange={(e) =>
                  setFormerData({ ...formerData, name: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                وصف قصير
              </label>
              <textarea
                rows={4}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all outline-none resize-none"
                placeholder="بماذا يتميز متجرك؟"
                value={formerData.description}
                onChange={(e) =>
                  setFormerData({ ...formerData, description: e.target.value })
                }
              />
            </div>

            <button
              type="submit"
              disabled={createLoading}
              className="w-full rounded-2xl bg-emerald-700 hover:bg-emerald-800 py-4 font-bold text-white shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
            >
              {createLoading ? "جاري التجهيز..." : "تأكيد وإطلاق المتجر 🚀"}
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  // --- Vendor Dashboard ---
  const kpis = [
    {
      title: "المبيعات (هذا الشهر)",
      value: salesRevenue,
      icon: <DollarSign className="w-6 h-6 text-emerald-700" />,
      trend: "+12.5%",
      color: "bg-emerald-50 border-emerald-100",
      iconBg: "bg-emerald-100",
    },
    {
      title: "الطلبات الجديدة",
      value: newOrdersCount,
      icon: <ShoppingCart className="w-6 h-6 text-emerald-700" />,
      trend: "+5.2%",
      color: "bg-emerald-50 border-emerald-100",
      iconBg: "bg-emerald-100",
    },
    {
      title: "المنتجات النشطة",
      value: activeProductsCount,
      icon: <Package className="w-6 h-6 text-amber-700" />,
      trend: null,
      color: "bg-amber-50 border-amber-100",
      iconBg: "bg-amber-100",
    },
    {
      title: "إجمالي الزوار",
      value: shop?.viewCount || 0,
      icon: <Users className="w-6 h-6 text-teal-700" />,
      trend: null,
      color: "bg-teal-50 border-teal-100",
      iconBg: "bg-teal-100",
    },
  ];

  return (
    <div className="p-4 sm:p-8 space-y-8 dir-rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900">
            مرحباً بعودتك، {shop?.name} 👋
          </h1>
          <p className="text-slate-500 mt-1">إليك ملخص أداء متجرك اليوم.</p>
        </div>
        <div className="flex items-center gap-3">
          {shop?.slug && (
            <Link
              href={`/shop/${shop.slug}`}
              target="_blank"
              className="px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-700 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-2 text-slate-600 shadow-sm"
            >
              <Activity className="w-4 h-4" /> عرض المتجر
            </Link>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, idx) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            key={idx}
            className="bg-white p-6 rounded-3xl relative overflow-hidden group border border-slate-200 shadow-sm hover:shadow-lg hover:-translate-y-1 hover:border-emerald-200 transition-all duration-300 cursor-pointer"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 ${kpi.iconBg} rounded-2xl`}>
                {kpi.icon}
              </div>
              {kpi.trend && (
                <span className="flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100">
                  <TrendingUp className="w-3 h-3" /> {kpi.trend}
                </span>
              )}
            </div>
            <h3 className="text-slate-500 text-sm font-bold mb-1">
              {kpi.title}
            </h3>
            <p className="text-3xl font-black text-slate-900">{kpi.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Sales Chart - Full Width */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
        <div className="mb-6">
          <h3 className="text-lg font-bold text-slate-900">
            تحليل المبيعات والطلبات
          </h3>
          <p className="text-sm text-slate-500">
            إحصائيات اشهر هذه السنة
          </p>
        </div>
        <div className="h-75 w-full dir-ltr">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={salesData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#059669" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="name"
                stroke="#94a3b8"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#94a3b8"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}`}
              />
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#e2e8f0"
                vertical={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#ffffff",
                  borderColor: "#e2e8f0",
                  borderRadius: "12px",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                }}
                itemStyle={{ color: "#334155" }}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="sales"
                name="المبيعات (د.ج)"
                stroke="#059669"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorSales)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

// Keep a placeholder component just for lucide icons import
function Store(props: any) {
  return <ShoppingCart {...props} />;
}
