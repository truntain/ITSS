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
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);
  const bellRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = () => {
    const token = localStorage.getItem('token');
    const headers: HeadersInit = token ? { 'Authorization': `Bearer ${token}` } : {};

    fetch('http://localhost:3001/announcements', { headers })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          // Filter announcements: show general announcements, plus personal system notifications
          // relevant to this user (contains user's name)
          const filtered = data.filter((item: any) => {
            const isSystem = item.title.includes('[Hệ thống]');
            if (isSystem) {
              return currentUser?.fullName && item.content.includes(currentUser.fullName);
            }
            return true;
          });

          setAnnouncements(filtered);

          // Check for unread
          const lastSeen = localStorage.getItem('notifications_last_seen') || '0';
          const newestTime = filtered.length > 0 ? new Date(filtered[0].createdAt).getTime() : 0;
          if (newestTime > Number(lastSeen)) {
            setHasUnread(true);
          } else {
            setHasUnread(false);
          }
        }
      })
      .catch(err => console.error('Error fetching notifications:', err));
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('currentUser');
      if (stored) {
        setCurrentUser(JSON.parse(stored));
      }
    }
  }, []);

  useEffect(() => {
    if (currentUser) {
      fetchNotifications();
      // Poll notifications every 30 seconds
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [currentUser]);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };
    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showUserMenu]);

  // Close notifications menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (bellRef.current && !bellRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNotifications]);

  const handleToggleNotifications = () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications) {
      setHasUnread(false);
      localStorage.setItem('notifications_last_seen', String(Date.now()));
    }
  };

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
      <div className="max-w-[1800px] mx-auto px-8 h-20 flex items-center justify-between">
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
          <div className="relative" ref={bellRef}>
            <button
              onClick={handleToggleNotifications}
              className="relative p-2 hover:bg-[#242424] rounded-lg transition-colors cursor-pointer"
            >
              <Bell className="w-5 h-5 text-white" />
              {hasUnread && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-[#FF5A00] rounded-full animate-pulse shadow-[0_0_8px_rgba(255,90,0,1)]"></span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-3 w-80 bg-[#1A1A1A] rounded-lg shadow-2xl border border-[#333333] py-2 z-50 max-h-96 overflow-y-auto">
                <p className="px-4 py-2 text-[#A0A0A0] text-xs uppercase font-bold border-b border-[#333333]">
                  Thông báo của bạn
                </p>
                {announcements.length === 0 ? (
                  <p className="px-4 py-6 text-sm text-[#A0A0A0] text-center">Không có thông báo nào.</p>
                ) : (
                  <div className="divide-y divide-[#333333]">
                    {announcements.map((item) => {
                      const isSystem = item.title.includes('[Hệ thống]');
                      const dateFormatted = new Date(item.createdAt).toLocaleDateString('vi-VN', {
                        hour: '2-digit',
                        minute: '2-digit',
                        day: '2-digit',
                        month: '2-digit',
                      });
                      return (
                        <div key={item.id} className="p-4 hover:bg-[#242424] transition-colors text-left">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded flex-shrink-0 ${isSystem ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
                              {isSystem ? 'Hệ thống' : 'Tin tức'}
                            </span>
                            <p className="text-white font-bold text-xs truncate flex-1">{item.title}</p>
                          </div>
                          <p className="text-xs text-[#A0A0A0] leading-relaxed mb-1.5">{item.content}</p>
                          <span className="text-[10px] text-[#555555] font-semibold">{dateFormatted}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* User Profile */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-3 px-3 py-2 hover:bg-[#242424] rounded-lg transition-colors cursor-pointer"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-[#FF5A00] to-[#FF8C00] rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(255,90,0,0.4)]">
                <User className="w-5 h-5 text-white" />
              </div>
              <span className="text-white font-bold">
                {currentUser?.fullName ? currentUser.fullName.split(' ').pop() : 'Hội viên'}
              </span>
            </button>

            {/* Dropdown Menu */}
            {showUserMenu && (
              <div className="absolute right-0 mt-3 w-56 bg-[#1A1A1A] rounded-lg shadow-2xl border border-[#333333] py-2">
                <div className="px-4 py-3 border-b border-[#333333]">
                  <p className="text-sm font-bold text-white">{currentUser?.fullName || 'Hội viên'}</p>
                  <p className="text-xs text-[#FF5A00] font-bold uppercase">Hội viên GymPro</p>
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
