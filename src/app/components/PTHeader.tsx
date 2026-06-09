import { useState, useRef, useEffect } from 'react';
import { Bell, User, LogOut, Settings, Plus } from 'lucide-react';
import { format } from 'date-fns';

interface PTHeaderProps {
  pageTitle?: string;
  onLogout?: () => void;
  showCreatePlanButton?: boolean;
  onCreatePlan?: () => void;
}

export function PTHeader({ pageTitle = 'Lịch làm việc', onLogout, showCreatePlanButton = false, onCreatePlan }: PTHeaderProps) {
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

          <button className="relative p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <Bell className="w-5 h-5 text-slate-600" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
          </button>

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
              className="flex items-center gap-2 p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
            </button>

            {/* Dropdown Menu */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-slate-200 py-2 z-50">
                <div className="px-4 py-3 border-b border-slate-200">
                  <p className="text-sm font-bold text-slate-900">Lê Minh Trọng</p>
                  <p className="text-xs text-emerald-600">Senior PT</p>
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
