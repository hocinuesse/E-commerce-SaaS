"use client";

import ProtectedRoute from "@/components/protectedRoute";
import Sidebar from "@/components/dashboard/Sidebar";
import { UserRole } from "@/interfaces/IUserStore";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute allowedRoles={[UserRole.MANAGER]}>
      <div className="flex min-h-screen bg-slate-50 text-slate-900">
        <Sidebar />
        <main className="flex-1 p-8 overflow-y-auto">{children}</main>
      </div>
    </ProtectedRoute>
  );
}
