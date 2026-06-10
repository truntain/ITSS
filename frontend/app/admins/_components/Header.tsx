"use client";

import { useState, useRef, useEffect } from 'react';
import { Bell, User, LogOut, Settings } from 'lucide-react';
import { format } from 'date-fns';

interface HeaderProps {
  pageTitle?: string;
  onLogout?: () => void;
}

export function Header({ pageTitle = 'Trang chủ', onLogout }: HeaderProps) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu]);
  const today = new Date(2026, 4, 17); // May 17, 2026
  const dayNames = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
  const dayOfWeek = dayNames[today.getDay()];
  const formattedDate = format(today, 'dd/MM/yyyy');

  return (
    <header className="h-16 bg-[var(--card)] border-b border-[var(--border)] sticky top-0 right-0 left-64 z-10 shadow-sm">
      <div className="h-full px-6 flex items-center justify-between">
        {/* Left: Page Title */}
        <div>
          <h1 className="text-xl font-bold text-[var(--foreground)]">{pageTitle}</h1>
        </div>

        {/* Right: Bell + Date + User Menu */}
        <div className="flex items-center gap-4">
          <button className="relative p-2 hover:bg-[var(--secondary)] rounded-lg transition-colors">
            <Bell className="w-5 h-5 text-[var(--muted-foreground)]" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-[var(--destructive)] rounded-full animate-pulse"></span>
          </button>

          <div className="flex items-center gap-2 text-sm">
            <span className="text-[var(--muted-foreground)]">Hôm nay:</span>
            <span className="font-medium text-[var(--foreground)]">{dayOfWeek}, {formattedDate}</span>
          </div>

          {/* User Menu */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-2 hover:bg-[var(--secondary)] rounded-lg transition-colors"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
            </button>

            {/* Dropdown Menu */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-slate-200 py-2 z-50">
                <div className="px-4 py-3 border-b border-slate-200">
                  <p className="text-sm font-bold text-slate-900">Admin User</p>
                  <p className="text-xs text-slate-500">admin@gympro.com</p>
                </div>

                <button className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-3">
                  <Settings className="w-4 h-4" />
                  Cài đặt
                </button>

                {onLogout && (
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      onLogout();
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-3"
                  >
                    <LogOut className="w-4 h-4" />
                    Đăng xuất
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
