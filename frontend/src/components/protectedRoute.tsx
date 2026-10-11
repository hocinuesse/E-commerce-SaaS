"use client";

import { useAuthStore } from "@/stores/useAuthStore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import authService from "@/services/authService";
import { UserRole } from "@/interfaces/IUserStore";
import vendorService from "@/services/vendorService";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const router = useRouter();
  const { user, setUser, setShop, shop } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        let currentUser = user;
        if (!currentUser) {
          currentUser = await authService.getMe();
          setUser(currentUser);
          if (!currentUser) {
            router.replace("/login");
            return;
          }
          if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
            router.replace("/unauthorized");
            return;
          }
        }

        if (currentUser?.shopId && !shop) {
          try {
            const fetchedShop = await vendorService.getMyShop();
            setShop(fetchedShop);
          } catch (error: Error | any) {
            console.log(error.message || "failed to get shop");
          }
        }

        if (allowedRoles && allowedRoles.length > 0) {
          const userRole = currentUser?.role;
          if (!userRole || !allowedRoles.includes(userRole)) {
            return router.push("/unauthorized");
          }
        }
        setIsAuthorized(true);
      } catch (error) {
        console.error("Error checking authentication:", error);
        setUser(null);
        router.replace("/login");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router, allowedRoles]);

  if (isLoading || (allowedRoles && !isAuthorized)) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-950">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
