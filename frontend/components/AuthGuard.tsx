"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ShieldAlert } from "lucide-react";

interface AuthGuardProps {
  children: React.ReactNode;
  allowedRoles: ("AD" | "PT" | "HV" | "NV")[];
}

export function AuthGuard({ children, allowedRoles }: AuthGuardProps) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("currentUser");

    if (!token || !userStr) {
      toast.error("Vui lòng đăng nhập để tiếp tục!");
      router.replace("/login");
      return;
    }

    try {
      const user = JSON.parse(userStr);
      if (!allowedRoles.includes(user.role)) {
        toast.error("Bạn không có quyền truy cập vào trang này!");
        
        // Redirect to their respective home screen based on role
        if (user.role === "AD") router.replace("/admins");
        else if (user.role === "PT") router.replace("/PT");
        else if (user.role === "HV") router.replace("/members");
        else if (user.role === "NV") router.replace("/staffs");
        else router.replace("/login");
        
        return;
      }
      setAuthorized(true);
    } catch (e) {
      localStorage.removeItem("token");
      localStorage.removeItem("currentUser");
      router.replace("/login");
    }
  }, [router, allowedRoles]);

  if (!mounted || !authorized) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-900 text-slate-100">
        <div className="relative flex items-center justify-center mb-6">
          {/* Pulsing glow effect */}
          <div className="absolute w-20 h-20 bg-orange-500 rounded-full filter blur-xl opacity-30 animate-pulse"></div>
          {/* Premium Loader */}
          <div className="w-16 h-16 border-4 border-slate-700 border-t-orange-500 rounded-full animate-spin"></div>
        </div>
        <p className="text-sm font-semibold tracking-wider text-slate-400 uppercase animate-pulse">
          Đang xác thực quyền truy cập...
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
