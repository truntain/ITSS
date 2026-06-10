"use client";

import { Calendar, Users, FileText, TrendingUp, User } from 'lucide-react';

interface PTSidebarProps {
  activeMenu: string;
  onMenuClick: (menu: string) => void;
}

export function PTSidebar({ activeMenu, onMenuClick }: PTSidebarProps) {
  const menuItems = [
    { id: 'schedule', label: 'Lịch làm việc', icon: Calendar },
    { id: 'clients', label: 'Danh sách Hội viên', icon: Users },
    { id: 'workouts', label: 'Bài tập & Giáo án', icon: FileText },
    { id: 'tracking', label: 'Đánh giá & Chỉ số', icon: TrendingUp },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-slate-200 shadow-sm z-20 flex flex-col">
      {/* Logo Section */}
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="text-3xl">🏋️</div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">GymPro</h1>
            <p className="text-xs text-emerald-600 font-medium">PT Portal</p>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeMenu === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onMenuClick(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isActive
                  ? 'bg-emerald-500 text-white shadow-md'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium text-sm">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Profile Section */}
      <div className="p-4 border-t border-slate-200">
        <div className="flex items-center gap-3 p-3 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg">
          <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center">
            <User className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="font-bold text-slate-900 text-sm">Lê Minh Trọng</p>
            <p className="text-xs text-emerald-700 font-medium">Senior PT</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
