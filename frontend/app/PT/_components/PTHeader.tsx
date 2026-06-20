"use client";

import { useState, useRef, useEffect } from 'react';
import { Bell, User, LogOut, Settings, Plus, ChevronDown } from 'lucide-react';
import { format } from 'date-fns';

interface PTHeaderProps {
  pageTitle?: string;
  onLogout?: () => void;
  showCreatePlanButton?: boolean;
  onCreatePlan?: () => void;
  onProfileClick?: () => void;
}

export function PTHeader({ pageTitle = 'Lịch làm việc', onLogout, showCreatePlanButton = false, onCreatePlan, onProfileClick }: PTHeaderProps) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const bellRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    const headers: HeadersInit = { 'Authorization': `Bearer ${token}` };

    fetch('http://localhost:3001/announcements', { headers })
      .then(res => {
        if (!res.ok) return [];
        return res.json();
      })
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
      .catch(err => console.warn('Could not fetch notifications:', err.message));
  };

  useEffect(() => {
    if (currentUser) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [currentUser]);

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

  // Sync current user with localStorage and listen for updates
  useEffect(() => {
    const handleUserUpdate = () => {
      const stored = localStorage.getItem('currentUser');
      if (stored) {
        setCurrentUser(JSON.parse(stored));
      }
    };

    handleUserUpdate();
    window.addEventListener('currentUserUpdated', handleUserUpdate);
    return () => {
      window.removeEventListener('currentUserUpdated', handleUserUpdate);
    };
  }, []);

  const today = new Date(); // Today's actual date
  const dayNames = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
  const dayOfWeek = dayNames[today.getDay()];
  const formattedDate = format(today, 'dd/MM/yyyy');

  return (
    <header className="h-16 bg-white border-b border-slate-200 sticky top-0 right-0 left-64 z-10 shadow-sm">
      <div className="h-full px-6 flex items-center justify-between">
        {/* Left: Page Title */}
        <div>
          <h1 className="text-xl font-bold text-slate-900">{pageTitle}</h1>
        </div>

        {/* Right: Actions + Date + User Menu */}
        <div className="flex items-center gap-4">
          {/* Create New Workout Plan Button (only shown on workouts page) */}
          {showCreatePlanButton && onCreatePlan && (
            <button
              onClick={onCreatePlan}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2 shadow-md">
              <Plus className="w-4 h-4" />
              Tạo giáo án mới
            </button>
          )}

          {/* Notification Bell */}
          <div className="relative" ref={bellRef}>
            <button
              onClick={handleToggleNotifications}
              className="relative p-2 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              <Bell className="w-5 h-5 text-slate-600" />
              {hasUnread && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-3 w-80 bg-white rounded-lg shadow-2xl border border-slate-200 py-2 z-50 max-h-96 overflow-y-auto">
                <p className="px-4 py-2 text-slate-500 text-xs uppercase font-bold border-b border-slate-100">
                  Thông báo của bạn
                </p>
                {announcements.length === 0 ? (
                  <p className="px-4 py-6 text-sm text-slate-400 text-center">Không có thông báo nào.</p>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {announcements.map((item) => {
                      const isSystem = item.title.includes('[Hệ thống]');
                      const dateFormatted = new Date(item.createdAt).toLocaleDateString('vi-VN', {
                        hour: '2-digit',
                        minute: '2-digit',
                        day: '2-digit',
                        month: '2-digit',
                      });
                      return (
                        <div key={item.id} className="p-4 hover:bg-slate-50 transition-colors text-left">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded flex-shrink-0 ${isSystem ? 'bg-orange-100 text-orange-700 border border-orange-200' : 'bg-emerald-100 text-emerald-700 border border-emerald-200'}`}>
                              {isSystem ? 'Hệ thống' : 'Tin tức'}
                            </span>
                            <p className="text-slate-800 font-bold text-xs truncate flex-1">{item.title}</p>
                          </div>
                          <p className="text-xs text-slate-500 leading-relaxed mb-1.5">{item.content}</p>
                          <span className="text-[10px] text-slate-400 font-semibold">{dateFormatted}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-500">Hôm nay:</span>
            <span className="font-medium text-slate-900">
              {dayOfWeek}, {formattedDate}
            </span>
          </div>

          {/* User Menu */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-1.5 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center shadow-sm">
                <User className="w-4.5 h-4.5 text-white" />
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-sm font-semibold text-slate-900 leading-none">{currentUser?.fullName || 'Huấn luyện viên'}</p>
                <p className="text-xs text-slate-500 mt-1">Huấn luyện viên</p>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-500" />
            </button>

            {/* Dropdown Menu */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-slate-200 py-2 z-50">
                <div className="px-4 py-3 border-b border-slate-200">
                  <p className="text-sm font-bold text-slate-900">{currentUser?.fullName || 'Lê Minh Trọng'}</p>
                  <p className="text-xs text-emerald-600">{currentUser?.role === 'PT' ? 'Huấn luyện viên' : currentUser?.role || 'Senior PT'}</p>
                </div>

                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    if (onProfileClick) onProfileClick();
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-3 cursor-pointer"
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
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-3 cursor-pointer"
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
