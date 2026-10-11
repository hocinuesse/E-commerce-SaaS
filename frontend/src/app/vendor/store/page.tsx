"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/stores/useAuthStore";
import managerService from "@/services/managerService";
import productsService from "@/services/productsService";
import { IProduct } from "@/interfaces/IProduct";
import ProtectedRoute from "@/components/protectedRoute";
import { UserRole } from "@/interfaces/IUserStore";
import { motion } from "framer-motion";
import { Store, Package, Eye, EyeOff, Plus, Minus, Search, AlertCircle, Layers, TrendingUp } from "lucide-react";

export default function StorePage() {
  const { user } = useAuthStore();
  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editProductId, setEditProductId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchProducts = async () => {
    if (!user?.shopId) { setError("لا يوجد متجر مرتبط بحسابك."); return; }
    setLoading(true);
    setError(null);
    try {
      const data = await productsService.getShopProducts(user.shopId);
      setProducts(data.products || []);
    } catch (err: any) {
      setError(err.message || "فشل في جلب المنتجات.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, [user?.shopId]);

  const handleStockChange = async (product: IProduct, stock: number) => {
    const newStock = product.stock + stock;
    if (newStock < 0) { setError("لا يمكن أن يكون المخزون سالباً."); return; }
    setEditProductId(product._id);
    try {
      await managerService.updateQuantity(product._id, newStock);
      fetchProducts();
    } catch (err: any) {
      setError(err.message || "فشل في تحديث المخزون.");
    } finally {
      setEditProductId(null);
    }
  };

  const handelChangeVisibility = async (product: IProduct) => {
    setEditProductId(product._id);
    try {
      await managerService.changeProductStatus(product._id, !product.isActive);
      fetchProducts();
    } catch (err: any) {
      setError(err.message || "فشل في تغيير حالة المنتج.");
    } finally {
      setEditProductId(null);
    }
  };

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const activeCount = products.filter(p => p.isActive).length;
  const lowStockCount = products.filter(p => p.stock <= 5 && p.stock > 0).length;
  const outOfStockCount = products.filter(p => p.stock === 0).length;

  return (
    <ProtectedRoute allowedRoles={[UserRole.VENDOR, UserRole.MANAGER]}>
      <div className="p-6 md:p-8 dir-rtl space-y-8 max-w-7xl mx-auto">

        {/* Header */}
        <div>
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3 mb-2">
            <Store className="w-8 h-8 text-emerald-700" /> إدارة المخزون والظهور
          </h1>
          <p className="text-slate-500 font-medium">تحكم سريع في كمية المخزون وحالة ظهور كل منتج.</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-2xl font-bold flex items-center gap-2">
            <AlertCircle className="w-5 h-5" /> {error}
            <button onClick={() => setError(null)} className="mr-auto text-xs hover:underline">إغلاق</button>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3 hover:shadow-md hover:-translate-y-0.5 hover:border-emerald-200 transition-all duration-300 cursor-pointer">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-700"><Package className="w-6 h-6" /></div>
            <div><p className="text-xs text-slate-500 font-bold">إجمالي المنتجات</p><p className="text-xl font-black text-slate-900">{products.length}</p></div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3 hover:shadow-md hover:-translate-y-0.5 hover:border-emerald-200 transition-all duration-300 cursor-pointer">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-700"><Eye className="w-6 h-6" /></div>
            <div><p className="text-xs text-slate-500 font-bold">نشط ومعروض</p><p className="text-xl font-black text-slate-900">{activeCount}</p></div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3 hover:shadow-md hover:-translate-y-0.5 hover:border-amber-200 transition-all duration-300 cursor-pointer">
            <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-700"><TrendingUp className="w-6 h-6" /></div>
            <div><p className="text-xs text-slate-500 font-bold">مخزون منخفض</p><p className="text-xl font-black text-amber-600">{lowStockCount}</p></div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3 hover:shadow-md hover:-translate-y-0.5 hover:border-rose-200 transition-all duration-300 cursor-pointer">
            <div className="w-12 h-12 rounded-xl bg-rose-50 flex items-center justify-center text-rose-700"><Layers className="w-6 h-6" /></div>
            <div><p className="text-xs text-slate-500 font-bold">نفد المخزون</p><p className="text-xl font-black text-rose-600">{outOfStockCount}</p></div>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="ابحث عن منتج..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-2xl py-3 pr-12 pl-4 text-sm font-medium focus:border-emerald-500 outline-none shadow-sm text-slate-900"
          />
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-700 rounded-full animate-spin"></div></div>
        ) : filteredProducts.length === 0 ? (
          <div className="bg-white shadow-sm p-16 rounded-3xl border border-slate-200 flex flex-col items-center text-center">
            <Package className="w-16 h-16 text-slate-400 mb-4" />
            <h3 className="text-xl font-bold text-slate-900 mb-2">لا توجد منتجات</h3>
            <p className="text-slate-500">لم يتم العثور على أي منتجات.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product, idx) => {
              const isBusy = editProductId === product._id;
              const stockLevel = product.stock === 0 ? "out" : product.stock <= 5 ? "low" : "ok";

              return (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`bg-white shadow-sm p-5 rounded-3xl border transition-all relative overflow-hidden ${
                    !product.isActive ? "border-rose-200 opacity-70 bg-slate-50" : "border-slate-200"
                  }`}
                >
                  {/* Status indicator bar */}
                  <div className={`absolute top-0 left-0 right-0 h-1 ${
                    stockLevel === "out" ? "bg-rose-500" : stockLevel === "low" ? "bg-amber-500" : "bg-emerald-500"
                  }`}></div>

                  <div className="flex items-center gap-4 mb-5">
                    <div className="w-14 h-14 bg-white rounded-xl border border-slate-200 overflow-hidden shrink-0 relative">
                      {product.images?.[0] ? (
                        <img src={`${product.images[0]}`} className="w-full h-full object-cover" alt="" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-slate-400 font-bold">صورة</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-slate-900 line-clamp-1">{product.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm font-black text-emerald-700">{product.price.toLocaleString()} د.ج</span>
                        <span className="text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-600 border border-slate-200">{product.category || "عام"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Stock Controls */}
                  <div className="flex items-center justify-between bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-4">
                    <span className="text-sm font-bold text-slate-700">المخزون</span>
                    <div className="flex items-center gap-3">
                      <button
                        disabled={isBusy || product.stock <= 0}
                        onClick={() => handleStockChange(product, -1)}
                        className="w-8 h-8 flex items-center justify-center bg-white hover:bg-slate-100 rounded-lg border border-slate-200 text-slate-700 disabled:opacity-30 transition-colors shadow-sm"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className={`min-w-[40px] text-center text-lg font-black ${
                        stockLevel === "out" ? "text-rose-600" : stockLevel === "low" ? "text-amber-600" : "text-slate-900"
                      }`}>
                        {product.stock}
                      </span>
                      <button
                        disabled={isBusy}
                        onClick={() => handleStockChange(product, 1)}
                        className="w-8 h-8 flex items-center justify-center bg-white hover:bg-slate-100 rounded-lg border border-slate-200 text-slate-700 disabled:opacity-30 transition-colors shadow-sm"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Visibility Toggle */}
                  <button
                    disabled={isBusy}
                    onClick={() => handelChangeVisibility(product)}
                    className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-colors disabled:opacity-50 ${
                      product.isActive
                        ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                        : "bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200"
                    }`}
                  >
                    {product.isActive ? <><Eye className="w-4 h-4" /> معروض للعملاء</> : <><EyeOff className="w-4 h-4" /> مخفي من المتجر</>}
                  </button>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
