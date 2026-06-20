"use client";

import { useState, useEffect } from 'react';
import { QrCode, ShoppingCart, MessageSquare, CalendarDays, Dumbbell, Users } from 'lucide-react';

interface StaffSidebarProps {
  activeMenu: string;
  onMenuClick: (menu: string) => void;
}

const menuItems = [
  { id: 'sales', label: 'Bán hàng & Giao dịch', icon: ShoppingCart },
  { id: 'checkin', label: 'Vận hành & Check-in', icon: QrCode },
  { id: 'members', label: 'Hồ sơ hội viên', icon: Users },
  { id: 'feedback', label: 'Phản hồi hội viên', icon: MessageSquare },
  { id: 'schedule', label: 'Lịch làm việc', icon: CalendarDays },
];

export function StaffSidebar({ activeMenu, onMenuClick }: StaffSidebarProps) {
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

  return (
    <div className="w-64 bg-[var(--sidebar)] h-screen flex flex-col border-r border-[var(--sidebar-border)] fixed left-0 top-0 shadow-sm">
      <div className="p-6 border-b border-[var(--sidebar-border)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[var(--accent)] flex items-center justify-center">
            <Dumbbell className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-[var(--foreground)] text-lg">GymPro</h1>
            <p className="text-xs text-[var(--muted-foreground)]">Nhân viên</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeMenu === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onMenuClick(item.id)}
              className={`w-full flex items-center gap-3 px-6 py-3 transition-all relative ${
                isActive
                  ? 'bg-[var(--sidebar-accent)] text-[var(--sidebar-accent-foreground)]'
                  : 'text-[var(--muted-foreground)] hover:bg-[var(--secondary)]'
              }`}
            >
              {isActive && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-[var(--primary)] rounded-r" />
              )}
              <Icon className="w-5 h-5" />
              <span className="flex-1 text-left text-sm font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
