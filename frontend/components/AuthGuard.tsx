"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ShieldAlert, KeyRound } from "lucide-react";

interface AuthGuardProps {
  children: React.ReactNode;
  allowedRoles: ("AD" | "PT" | "HV" | "NV")[];
}

export function AuthGuard({ children, allowedRoles }: AuthGuardProps) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isSessionExpired, setIsSessionExpired] = useState(false);

  useEffect(() => {
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      try {
        const response = await originalFetch(...args);
        if (response.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("currentUser");
          setIsSessionExpired(true);
        }
        return response;
      } catch (error) {
        throw error;
      }
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, []);

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

  if (isSessionExpired) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-md w-full shadow-2xl text-center relative overflow-hidden animate-in fade-in zoom-in duration-300">
          {/* Subtle background glows */}
          <div className="absolute -top-10 -left-10 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl pointer-events-none"></div>
          <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>
          
          <div className="w-16 h-16 bg-orange-500/10 border border-orange-500/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <KeyRound className="w-8 h-8 text-orange-500 animate-pulse" />
          </div>
          
          <h3 className="text-2xl font-bold text-white mb-3">Phiên đăng nhập hết hạn</h3>
          <p className="text-slate-400 text-sm leading-relaxed mb-8">
            Phiên làm việc của bạn đã hết hạn hoặc không hợp lệ. Vui lòng đăng nhập lại để tiếp tục sử dụng hệ thống.
          </p>
          
          <button
            onClick={() => {
              localStorage.removeItem("token");
              localStorage.removeItem("currentUser");
              window.location.href = "/login";
            }}
            className="w-full py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl font-semibold shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30 active:scale-[0.98] transition-all cursor-pointer"
          >
            Đăng nhập lại
          </button>
        </div>
      </div>
    );
  }

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
