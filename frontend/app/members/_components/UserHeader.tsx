"use client";

import { useState, useRef, useEffect } from 'react';
import { Bell, User, LogOut, Settings, Calendar } from 'lucide-react';

interface UserHeaderProps {
  activeMenu: string;
  onMenuClick: (menu: string) => void;
  onLogout?: () => void;
  onOpenBooking?: () => void;
}

export function UserHeader({ activeMenu, onMenuClick, onLogout, onOpenBooking }: UserHeaderProps) {
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

  const navItems = [
    { id: 'dashboard', label: 'TỔNG QUAN' },
    { id: 'schedule', label: 'LỊCH TẬP' },
    { id: 'membership', label: 'GÓI TẬP' },
    { id: 'checkin', label: 'THẺ ĐIỆN TỬ' },
    { id: 'tracker', label: 'CHỈ SỐ CƠ THỂ' },
    { id: 'evaluations', label: 'ĐÁNH GIÁ CỦA PT' },
    { id: 'support', label: 'PHẢN HỒI' },
  ];

  return (
    <header className="sticky top-0 z-50 backdrop-blur-lg bg-[#1A1A1A]/80 border-b border-[#333333] shadow-2xl">
      <div className="max-w-[1440px] mx-auto px-8 h-20 flex items-center justify-between">
        {/* Left: Logo */}
        <div className="flex items-center gap-3">
          <div className="text-4xl drop-shadow-[0_0_15px_rgba(255,90,0,0.6)]">🏋️</div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">GymPro</h1>
          </div>
        </div>

        {/* Center: Navigation Links */}
        <nav className="flex items-center gap-8">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onMenuClick(item.id)}
              className={`relative text-sm font-bold uppercase tracking-wide transition-colors ${
                activeMenu === item.id ? 'text-white' : 'text-[#A0A0A0] hover:text-white'
              }`}
            >
              {item.label}
              {activeMenu === item.id && (
                <div className="absolute -bottom-2 left-0 right-0 h-0.5 bg-[#FF5A00] shadow-[0_0_10px_rgba(255,90,0,0.8)]"></div>
              )}
            </button>
          ))}
        </nav>

        {/* Right: CTA Button + Notification + User Profile */}
        <div className="flex items-center gap-4">
          {/* CTA Button */}
          <button
            onClick={onOpenBooking}
            className="px-6 py-3 bg-[#FF5A00] hover:bg-[#FF6A10] text-white font-black uppercase text-sm shadow-lg hover:shadow-[0_0_25px_rgba(255,90,0,0.5)] transition-all flex items-center gap-2"
          >
            <Calendar className="w-4 h-4" />
            ĐẶT LỊCH NGAY
          </button>

          {/* Notification Bell */}
          <button className="relative p-2 hover:bg-[#242424] rounded-lg transition-colors">
            <Bell className="w-5 h-5 text-white" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-[#FF5A00] rounded-full animate-pulse shadow-[0_0_8px_rgba(255,90,0,1)]"></span>
          </button>

          {/* User Profile */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-3 px-3 py-2 hover:bg-[#242424] rounded-lg transition-colors"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-[#FF5A00] to-[#FF8C00] rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(255,90,0,0.4)]">
                <User className="w-5 h-5 text-white" />
              </div>
              <span className="text-white font-bold">Thành</span>
            </button>

            {/* Dropdown Menu */}
            {showUserMenu && (
              <div className="absolute right-0 mt-3 w-56 bg-[#1A1A1A] rounded-lg shadow-2xl border border-[#333333] py-2">
                <div className="px-4 py-3 border-b border-[#333333]">
                  <p className="text-sm font-bold text-white">Trương Thế Thành</p>
                  <p className="text-xs text-[#FF5A00] font-bold uppercase">Hội viên Premium</p>
                </div>

                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    onMenuClick('profile');
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-[#A0A0A0] hover:bg-[#242424] hover:text-white transition-colors flex items-center gap-3"
                >
                  <Settings className="w-4 h-4" />
                  Hồ sơ cá nhân
                </button>

                {onLogout && (
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      onLogout();
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-red-500 hover:bg-red-950 hover:text-red-400 transition-colors flex items-center gap-3"
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
