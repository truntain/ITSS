"use client";

import { Bell, LogOut, User, ChevronDown, UserCircle } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { format } from 'date-fns';

interface StaffHeaderProps {
  pageTitle: string;
  onLogout: () => void;
  onProfileClick?: () => void;
}

export function StaffHeader({ pageTitle, onLogout, onProfileClick }: StaffHeaderProps) {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [user, setUser] = useState<{ id: number; fullName: string; email: string; phone: string; role: string } | null>(null);
  const [todayShift, setTodayShift] = useState<string>('Ca: 06:00 – 14:00');

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
              return user?.fullName && item.content.includes(user.fullName);
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
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

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

  useEffect(() => {
    const handleUserUpdate = () => {
      const userStr = localStorage.getItem('currentUser');
      if (userStr) {
        try {
          setUser(JSON.parse(userStr));
        } catch (e) {
          console.error(e);
        }
      }
    };

    handleUserUpdate();
    window.addEventListener('currentUserUpdated', handleUserUpdate);
    return () => {
      window.removeEventListener('currentUserUpdated', handleUserUpdate);
    };
  }, []);

  useEffect(() => {
    if (user?.id) {
      const token = localStorage.getItem('token');
      const todayStr = format(new Date(), 'yyyy-MM-dd');
      fetch(`http://localhost:3001/work-shifts?employeeId=${user.id}&startDate=${todayStr}&endDate=${todayStr}`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      })
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data) && data.length > 0) {
            const shift = data[0];
            const startTime = shift.startTime.slice(0, 5);
            const endTime = shift.endTime.slice(0, 5);
            const shiftLabel = shift.roleShift ? `Ca: ${startTime} – ${endTime} (${shift.roleShift})` : `Ca: ${startTime} – ${endTime}`;
            setTodayShift(shiftLabel);
          } else {
            setTodayShift('Ca: Nghỉ');
          }
        })
        .catch(err => {
          console.error('Error fetching today shift:', err);
          setTodayShift('Ca: Nghỉ');
        });
    }
  }, [user]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    if (showMenu) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showMenu]);

  const today = new Date(); // Today's actual date
  const dayNames = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
  const dayOfWeek = dayNames[today.getDay()];
  const formattedDate = format(today, 'dd/MM/yyyy');

  return (
    <>
      <header className="h-16 bg-[var(--card)] border-b border-[var(--border)] sticky top-0 right-0 left-64 z-10 shadow-sm">
        <div className="h-full px-6 flex items-center justify-between">
          <h1 className="text-xl font-bold text-[var(--foreground)]">{pageTitle}</h1>
          <div className="flex items-center gap-3">
            {/* Notification Bell */}
            <div className="relative" ref={bellRef}>
              <button
                onClick={handleToggleNotifications}
                className="relative p-2 hover:bg-[var(--secondary)] rounded-lg transition-colors cursor-pointer"
              >
                <Bell className="w-5 h-5 text-[var(--muted-foreground)]" />
                {hasUnread && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-[var(--destructive)] rounded-full animate-pulse" />
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
              <span className="text-[var(--muted-foreground)]">Hôm nay:</span>
              <span className="font-medium text-[var(--foreground)]">{dayOfWeek}, {formattedDate}</span>
            </div>

            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="flex items-center gap-2 p-1.5 hover:bg-[var(--secondary)] rounded-lg transition-colors cursor-pointer"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-[var(--primary)] to-orange-600 rounded-full flex items-center justify-center shadow-sm">
                  <User className="w-4.5 h-4.5 text-white" />
                </div>
                <div className="text-left hidden sm:block">
                  <p className="text-sm font-semibold text-[var(--foreground)] leading-none">{user?.fullName || 'Nguyễn Văn A'}</p>
                  <p className="text-xs text-[var(--muted-foreground)] mt-1">Nhân viên</p>
                </div>
                <ChevronDown className="w-4 h-4 text-[var(--muted-foreground)]" />
              </button>

              {showMenu && (
                <div className="absolute right-0 mt-2 w-52 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-50">
                  <div className="px-4 py-3 border-b border-slate-100">
                    <p className="text-sm font-bold text-slate-900">{user?.fullName || 'Nguyễn Văn A'}</p>
                    <p className="text-xs text-slate-500">{user?.email || 'staff@gympro.com'}</p>
                    <p className="text-xs text-orange-500 font-medium mt-0.5">{todayShift}</p>
                  </div>
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      if (onProfileClick) onProfileClick();
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-3 cursor-pointer"
                  >
                    <UserCircle className="w-4 h-4 text-slate-400" />
                    Hồ sơ cá nhân
                  </button>
                  <button
                    onClick={() => { setShowMenu(false); onLogout(); }}
                    className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-3 cursor-pointer"
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
    </>
  );
}
