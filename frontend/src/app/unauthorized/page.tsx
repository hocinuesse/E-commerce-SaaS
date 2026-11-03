"use client";

import Link from "next/link";
import { ShieldAlert, ArrowRight, Home, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-6 text-right" dir="rtl">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-xl text-center space-y-6">
        <div className="mx-auto w-16 h-16 rounded-full bg-red-100 dark:bg-red-950/50 flex items-center justify-center text-red-600 dark:text-red-400">
          <ShieldAlert className="w-9 h-9" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            غير مصرح لك بالوصول
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            عذراً، ليس لديك الصلاحيات الكافية لعرض هذه الصفحة أو تنفيذ هذا الإجراء. يرجى التحقق من نوع حسابك أو تسجيل الدخول بالحساب المناسب.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2 justify-center">
          <Button asChild variant="default" className="flex items-center gap-2">
            <Link href="/home">
              <Home className="w-4 h-4" />
              <span>الرئيسية</span>
            </Link>
          </Button>

          <Button asChild variant="outline" className="flex items-center gap-2">
            <Link href="/login">
              <LogIn className="w-4 h-4" />
              <span>تسجيل الدخول</span>
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

