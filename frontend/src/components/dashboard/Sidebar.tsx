"use client";

import authService from "@/services/authService";
import { useAuthStore } from "@/stores/useAuthStore";
import { UserRole } from "@/interfaces/IUserStore";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LayoutDashboard, Package, Users, ShoppingCart, Store, 
  Settings, LogOut, ChevronLeft, Menu, Activity, ShieldAlert,
  Bell, MessageSquareText
} from "lucide-react";

export default function Sidebar() {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleLogout = async () => {
    try {
      await authService.logout();
      logout();
      router.push("/login");
    } catch (error: any) {
      console.error("Error logging out:", error.message);
    }
  };

  const menuItems = [
    { title: "الرئيسية", href: "/vendor/dashboard", icon: <LayoutDashboard className="w-5 h-5" />, roles: [UserRole.VENDOR] },
    { title: "المنتجات", href: user?.role === UserRole.VENDOR ? "/vendor/products" : "/manager/products", icon: <Package className="w-5 h-5" />, roles: [UserRole.VENDOR, UserRole.MANAGER] },
    { title: "إدارة المدراء", href: "/vendor/managers", icon: <Users className="w-5 h-5" />, roles: [UserRole.VENDOR] },
    { title: "الطلبات", href: "/vendor/orders", icon: <ShoppingCart className="w-5 h-5" />, roles: [UserRole.VENDOR] },
    { title: "الرسائل", href: "/vendor/messages", icon: <MessageSquareText className="w-5 h-5" />, roles: [UserRole.VENDOR] },
    { title: "إعدادات الموقع", href: "/vendor/site-settings", icon: <Settings className="w-5 h-5" />, roles: [UserRole.VENDOR] },
    { title: "إدارة المتجر", href: user?.role === UserRole.VENDOR ? "/vendor/store" : "/manager/store", icon: <Store className="w-5 h-5" />, roles: [UserRole.VENDOR, UserRole.MANAGER] },
    
    // Admin Routes
    { title: "لوحة التحكم", href: "/admin/dashboard", icon: <ShieldAlert className="w-5 h-5" />, roles: [UserRole.ADMIN] },
    { title: "المتاجر المعتمدة", href: "/admin/stores", icon: <Store className="w-5 h-5" />, roles: [UserRole.ADMIN] },
  ];

  const filteredMenuItems = menuItems.filter((item) => item.roles.includes(user?.role as UserRole));

  return (
    <motion.aside 
      initial={{ width: 280 }}
      animate={{ width: isCollapsed ? 88 : 280 }}
      className="relative flex flex-col justify-between h-screen border-l border-slate-200 bg-white z-40 transition-all duration-300 shadow-sm"
    >
      {/* Collapse Toggle Button */}
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -left-4 top-8 bg-white border border-slate-200 rounded-full p-1.5 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-700 transition-colors z-50 shadow-md"
      >
        <ChevronLeft className={`w-4 h-4 transition-transform duration-300 ${isCollapsed ? "rotate-180" : ""}`} />
      </button>

      <div className="flex flex-col h-full overflow-hidden">
        {/* Header (Logo & Brand) */}
        <div className="h-20 flex items-center border-b border-slate-100 px-6 shrink-0">
          <div className="flex items-center gap-3 overflow-hidden whitespace-nowrap">
            <Menu className="w-8 h-8 shrink-0 text-emerald-700" />
            <AnimatePresence>
              {!isCollapsed && (
                <motion.span 
                  initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                  className="text-2xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-l from-emerald-700 to-emerald-500"
                >
                  SaaSify
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2 scrollbar-hide">
          <p className={`text-xs font-bold text-slate-400 mb-4 px-2 uppercase tracking-widest ${isCollapsed ? "text-center text-[10px]" : ""}`}>
            {isCollapsed ? "القائمة" : "القائمة الرئيسية"}
          </p>
          
          {filteredMenuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href} title={isCollapsed ? item.title : ""} className="block relative group">
                {isActive && (
                  <motion.div layoutId="sidebar-active" className="absolute inset-0 bg-emerald-50 border border-emerald-200 rounded-2xl" />
                )}
                <div className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 relative z-10 ${isActive ? "text-emerald-700 font-bold" : "text-slate-500 hover:text-emerald-700 hover:bg-slate-50"}`}>
                  <div className={`shrink-0 transition-transform duration-300 ${isActive ? "scale-110" : ""}`}>
                    {item.icon}
                  </div>
                  <AnimatePresence>
                    {!isCollapsed && (
                      <motion.span 
                        initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: "auto" }} exit={{ opacity: 0, width: 0 }}
                        className="font-semibold whitespace-nowrap overflow-hidden"
                      >
                        {item.title}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
              </Link>
            );
          })}
        </div>

        {/* User Profile Footer */}
        <div className="p-4 border-t border-slate-100 shrink-0">
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 flex items-center justify-between group overflow-hidden">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shrink-0 font-bold text-white shadow-md">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              {!isCollapsed && (
                <div className="whitespace-nowrap overflow-hidden">
                  <p className="text-sm font-bold text-slate-900 truncate w-32">{user?.name}</p>
                  <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">{user?.role}</p>
                </div>
              )}
            </div>
          </div>
          
          <button onClick={handleLogout} className="mt-2 w-full flex items-center justify-center gap-2 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm font-bold text-red-500 transition-colors hover:bg-red-500 hover:text-white hover:border-red-500">
            <LogOut className="w-4 h-4 shrink-0" />
            {!isCollapsed && <span>تسجيل الخروج</span>}
          </button>
        </div>
      </div>
    </motion.aside>
  );
}
