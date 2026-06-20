"use client";

import {
  LayoutDashboard,
  Users,
  Dumbbell,
  Building2,
  UserCog,
  Package,
  MessageSquare,
  BarChart3,
  Calendar,
  Award
} from 'lucide-react';
import { useState } from 'react';

interface SidebarProps {
  activeMenu: string;
  onMenuClick: (menu: string) => void;
}

export function Sidebar({ activeMenu, onMenuClick }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Tổng quan', icon: LayoutDashboard },
    { id: 'schedule', label: 'Lịch làm việc', icon: Calendar },
    { id: 'staff', label: 'Quản lý nhân sự', icon: UserCog },
    { id: 'trainers', label: 'Quản lý HLV (PT)', icon: Award },
    { id: 'members', label: 'Quản lý khách hàng', icon: Users },
    { id: 'equipment', label: 'Quản lý thiết bị', icon: Dumbbell },
    { id: 'gym', label: 'Quản lý phòng tập', icon: Building2 },
    { id: 'packages', label: 'Gói tập & Khuyến mãi', icon: Package },
    { id: 'feedback', label: 'Chăm sóc khách hàng', icon: MessageSquare },
    { id: 'revenue', label: 'Quản lý doanh thu', icon: BarChart3 },
  ];

  return (
    <div className="w-64 bg-[var(--sidebar)] h-screen flex flex-col border-r border-[var(--sidebar-border)] fixed left-0 top-0 shadow-sm">
      <div className="p-6 border-b border-[var(--sidebar-border)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[var(--accent)] flex items-center justify-center">
            <Dumbbell className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-[var(--foreground)] text-lg">GymPro</h1>
            <p className="text-xs text-[var(--muted-foreground)]">Quản lý phòng tập</p>
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
              className={`
                w-full flex items-center gap-3 px-6 py-3 transition-all relative cursor-pointer
                ${isActive
                  ? 'bg-[var(--sidebar-accent)] text-[var(--sidebar-accent-foreground)]'
                  : 'text-[var(--muted-foreground)] hover:bg-[var(--secondary)]'
                }
              `}
            >
              {isActive && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-[var(--primary)] rounded-r"></div>
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
