"use client";

import { Bell, LogOut, User, ChevronDown, UserCircle } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface StaffHeaderProps {
  pageTitle: string;
  onLogout: () => void;
}

export function StaffHeader({ pageTitle, onLogout }: StaffHeaderProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [user, setUser] = useState<{ id: number; fullName: string; email: string; phone: string; role: string } | null>(null);

  useEffect(() => {
    const userStr = localStorage.getItem('currentUser');
    if (userStr) {
      try {
        setUser(JSON.parse(userStr));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    if (showMenu) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showMenu]);

  return (
    <>
      <header className="h-16 bg-[var(--card)] border-b border-[var(--border)] sticky top-0 right-0 left-64 z-10 shadow-sm">
        <div className="h-full px-6 flex items-center justify-between">
          <h1 className="text-xl font-bold text-[var(--foreground)]">{pageTitle}</h1>
          <div className="flex items-center gap-3">
            <button className="relative p-2 hover:bg-[var(--secondary)] rounded-lg transition-colors">
              <Bell className="w-5 h-5 text-[var(--muted-foreground)]" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-[var(--destructive)] rounded-full animate-pulse" />
            </button>

            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="flex items-center gap-2 p-2 hover:bg-[var(--secondary)] rounded-lg transition-colors"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-xs">NV</span>
                </div>
                <div className="text-left hidden sm:block">
                  <p className="text-sm font-medium text-[var(--foreground)] leading-none">{user?.fullName || 'Nguyễn Văn A'}</p>
                  <p className="text-xs text-[var(--muted-foreground)] mt-0.5">Nhân viên</p>
                </div>
                <ChevronDown className="w-4 h-4 text-[var(--muted-foreground)]" />
              </button>

              {showMenu && (
                <div className="absolute right-0 mt-2 w-52 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-50">
                  <div className="px-4 py-3 border-b border-slate-100">
                    <p className="text-sm font-bold text-slate-900">{user?.fullName || 'Nguyễn Văn A'}</p>
                    <p className="text-xs text-slate-500">{user?.email || 'staff@gympro.com'}</p>
                    <p className="text-xs text-orange-500 font-medium mt-0.5">Ca: 06:00 – 14:00</p>
                  </div>
                  <button
                    onClick={() => { setShowMenu(false); setShowProfile(true); }}
                    className="w-full px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-3"
                  >
                    <UserCircle className="w-4 h-4 text-slate-400" />
                    Hồ sơ cá nhân
                  </button>
                  <button
                    onClick={() => { setShowMenu(false); onLogout(); }}
                    className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-3"
                  >
                    <LogOut className="w-4 h-4" />
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Profile Modal */}
      {showProfile && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
              <h3 className="font-bold text-slate-800">Hồ sơ cá nhân</h3>
              <button onClick={() => setShowProfile(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <ChevronDown className="w-5 h-5 rotate-180" />
              </button>
            </div>
            <div className="p-5">
              <div className="flex items-center gap-4 mb-5">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-xl">NV</span>
                </div>
                <div>
                  <p className="font-bold text-slate-800 text-lg">{user?.fullName || 'Nguyễn Văn A'}</p>
                  <p className="text-slate-500 text-sm">Nhân viên</p>
                  <span className="inline-block mt-1 text-xs bg-orange-100 text-orange-600 font-semibold px-2 py-0.5 rounded-full">Đang hoạt động</span>
                </div>
              </div>
              <div className="space-y-3 text-sm">
                {[
                  { label: 'Mã nhân viên', value: `NV-2026-${String(user?.id || '001').padStart(3, '0')}` },
                  { label: 'Email', value: user?.email || 'staff@gympro.com' },
                  { label: 'Số điện thoại', value: user?.phone || '0909 123 456' },
                  { label: 'Ca làm việc', value: '06:00 – 14:00' },
                  { label: 'Ngày vào làm', value: '15/03/2026' },
                ].map((row) => (
                  <div key={row.label} className="flex justify-between py-2 border-b border-slate-100 last:border-0">
                    <span className="text-slate-500">{row.label}</span>
                    <span className="font-medium text-slate-800">{row.value}</span>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setShowProfile(false)}
                className="w-full mt-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition-colors text-sm"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
