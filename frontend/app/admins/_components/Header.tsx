"use client";

import { useState, useRef, useEffect } from 'react';
import { Bell, User, LogOut, Settings, ChevronDown, Edit, Trash2, X } from 'lucide-react';
import { format } from 'date-fns';

interface HeaderProps {
  pageTitle?: string;
  onLogout?: () => void;
  onSettingsClick?: () => void;
}

export function Header({ pageTitle = 'Trang chủ', onLogout, onSettingsClick }: HeaderProps) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const [user, setUser] = useState<{ id?: number; fullName: string; email: string } | null>(null);

  // Notification States
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const bellRef = useRef<HTMLDivElement>(null);

  // CRUD Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingAnnouncement, setEditingAnnouncement] = useState<any | null>(null);
  const [announcementTitle, setAnnouncementTitle] = useState('');
  const [announcementContent, setAnnouncementContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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
          // Sort by newest first
          const sorted = data.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          setAnnouncements(sorted);

          const lastSeen = localStorage.getItem('admin_notifications_last_seen') || '0';
          const newestTime = sorted.length > 0 ? new Date(sorted[0].createdAt).getTime() : 0;
          setHasUnread(newestTime > Number(lastSeen));
        }
      })
      .catch(err => console.warn('Could not fetch notifications:', err.message));
  };

  useEffect(() => {
    const userStr = localStorage.getItem('currentUser');
    if (userStr) {
      try {
        setUser(JSON.parse(userStr));
      } catch (e) {
        console.error(e);
      }
    }
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close menus when clicking outside
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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (bellRef.current && !bellRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications]);

  const handleToggleNotifications = () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications) {
      setHasUnread(false);
      localStorage.setItem('admin_notifications_last_seen', String(Date.now()));
    }
  };

  const openCreateModal = () => {
    setModalMode('create');
    setAnnouncementTitle('');
    setAnnouncementContent('');
    setEditingAnnouncement(null);
    setIsModalOpen(true);
    setShowNotifications(false);
  };

  const openEditModal = (item: any) => {
    setModalMode('edit');
    setAnnouncementTitle(item.title);
    setAnnouncementContent(item.content);
    setEditingAnnouncement(item);
    setIsModalOpen(true);
    setShowNotifications(false);
  };

  const handleDelete = (id: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa thông báo này?')) return;
    const token = localStorage.getItem('token');
    fetch(`http://localhost:3001/announcements/${id}`, {
      method: 'DELETE',
      headers: token ? { 'Authorization': `Bearer ${token}` } : {},
    })
      .then(res => {
        if (res.ok) {
          fetchNotifications();
        } else {
          alert('Xóa thông báo thất bại.');
        }
      })
      .catch(err => console.error(err));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcementTitle.trim() || !announcementContent.trim()) {
      alert('Vui lòng điền đầy đủ tiêu đề và nội dung.');
      return;
    }

    setIsSubmitting(true);
    const token = localStorage.getItem('token');
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const url = modalMode === 'create' 
      ? 'http://localhost:3001/announcements'
      : `http://localhost:3001/announcements/${editingAnnouncement.id}`;
    const method = modalMode === 'create' ? 'POST' : 'PATCH';

    const body = modalMode === 'create' 
      ? {
          title: announcementTitle,
          content: announcementContent,
          authorId: user?.id || 1,
        }
      : {
          title: announcementTitle,
          content: announcementContent,
        };

    fetch(url, {
      method,
      headers,
      body: JSON.stringify(body),
    })
      .then(res => {
        if (res.ok) {
          setIsModalOpen(false);
          setAnnouncementTitle('');
          setAnnouncementContent('');
          setEditingAnnouncement(null);
          fetchNotifications();
        } else {
          alert('Lưu thông báo thất bại.');
        }
      })
      .catch(err => {
        console.error(err);
        alert('Có lỗi xảy ra.');
      })
      .finally(() => setIsSubmitting(false));
  };

  const today = new Date();
  const dayNames = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
  const dayOfWeek = dayNames[today.getDay()];
  const formattedDate = format(today, 'dd/MM/yyyy');

  return (
    <>
      <header className="h-16 bg-[var(--card)] border-b border-[var(--border)] sticky top-0 right-0 left-64 z-10 shadow-sm">
        <div className="h-full px-6 flex items-center justify-between">
          {/* Left: Page Title */}
          <div>
            <h1 className="text-xl font-bold text-[var(--foreground)]">{pageTitle}</h1>
          </div>

          {/* Right: Bell + Date + User Menu */}
          <div className="flex items-center gap-4">
            {/* Notification Bell Dropdown */}
            <div className="relative" ref={bellRef}>
              <button
                onClick={handleToggleNotifications}
                className="relative p-2 hover:bg-[var(--secondary)] rounded-lg transition-colors cursor-pointer"
              >
                <Bell className="w-5 h-5 text-[var(--muted-foreground)]" />
                {hasUnread && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-[var(--destructive)] rounded-full animate-pulse shadow-[0_0_8px_rgba(255,90,0,1)]"></span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-3 w-80 bg-white rounded-lg shadow-2xl border border-slate-200 py-2 z-50 max-h-96 overflow-y-auto">
                  <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                    <span className="text-slate-700 text-xs uppercase font-bold">Thông báo hệ thống</span>
                    <button
                      onClick={openCreateModal}
                      className="text-xs px-2.5 py-1 bg-orange-500 hover:bg-orange-600 text-white rounded font-bold transition-colors cursor-pointer"
                    >
                      + Thêm
                    </button>
                  </div>
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
                          <div key={item.id} className="p-4 hover:bg-slate-50 transition-colors text-left flex gap-2 justify-between items-start group">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded flex-shrink-0 ${isSystem ? 'bg-orange-100 text-orange-700 border border-orange-200' : 'bg-emerald-100 text-emerald-700 border border-emerald-200'}`}>
                                  {isSystem ? 'Hệ thống' : 'Tin tức'}
                                </span>
                                <p className="text-slate-800 font-bold text-xs truncate flex-1">{item.title}</p>
                              </div>
                              <p className="text-xs text-slate-500 leading-relaxed mb-1.5 whitespace-pre-wrap">{item.content}</p>
                              <span className="text-[10px] text-slate-400 font-semibold">{dateFormatted}</span>
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                              <button
                                onClick={() => openEditModal(item)}
                                className="p-1 hover:bg-slate-200 rounded text-slate-500 hover:text-orange-500 transition-colors cursor-pointer"
                                title="Sửa thông báo"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDelete(item.id)}
                                className="p-1 hover:bg-slate-200 rounded text-slate-500 hover:text-red-500 transition-colors cursor-pointer"
                                title="Xóa thông báo"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
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

            {/* User Menu */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-1.5 hover:bg-[var(--secondary)] rounded-lg transition-colors cursor-pointer"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center shadow-sm">
                  <User className="w-4.5 h-4.5 text-white" />
                </div>
                <div className="text-left hidden sm:block">
                  <p className="text-sm font-semibold text-[var(--foreground)] leading-none">{user?.fullName || 'Admin User'}</p>
                  <p className="text-xs text-[var(--muted-foreground)] mt-1">Quản trị viên</p>
                </div>
                <ChevronDown className="w-4 h-4 text-[var(--muted-foreground)]" />
              </button>

              {/* Dropdown Menu */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-slate-200 py-2 z-50">
                  <div className="px-4 py-3 border-b border-slate-200">
                    <p className="text-sm font-bold text-slate-900">{user?.fullName || 'Admin User'}</p>
                    <p className="text-xs text-slate-500">{user?.email || 'admin@gympro.com'}</p>
                  </div>

                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      if (onSettingsClick) onSettingsClick();
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-3 cursor-pointer"
                  >
                    <Settings className="w-4 h-4" />
                    Cài đặt
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

      {/* CRUD Modal for Announcements */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200 mx-4">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
              <h3 className="font-bold text-slate-800 text-lg">
                {modalMode === 'create' ? 'Tạo thông báo mới' : 'Cập nhật thông báo'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors p-1 hover:bg-slate-250 rounded-full cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Tiêu đề <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={announcementTitle}
                  onChange={(e) => setAnnouncementTitle(e.target.value)}
                  placeholder="Ví dụ: [Hệ thống] Thông báo nghỉ lễ 30/4"
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-slate-800"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Nội dung <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  value={announcementContent}
                  onChange={(e) => setAnnouncementContent(e.target.value)}
                  placeholder="Nhập nội dung chi tiết của thông báo..."
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-slate-800 resize-none"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-semibold text-white bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 rounded-lg transition-colors shadow-md shadow-orange-500/20 cursor-pointer"
                >
                  {isSubmitting ? 'Đang lưu...' : 'Lưu thông báo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
