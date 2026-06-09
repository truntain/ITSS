import { LayoutDashboard, Calendar, CreditCard, TrendingUp, User } from 'lucide-react';

interface UserSidebarProps {
  activeMenu: string;
  onMenuClick: (menu: string) => void;
}

export function UserSidebar({ activeMenu, onMenuClick }: UserSidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'TỔNG QUAN', icon: LayoutDashboard },
    { id: 'schedule', label: 'LỊCH TẬP CỦA TÔI', icon: Calendar },
    { id: 'membership', label: 'GÓI TẬP & DỊCH VỤ', icon: CreditCard },
    { id: 'tracker', label: 'CHỈ SỐ CƠ THỂ', icon: TrendingUp },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-[#121212] border-r border-[#333333] shadow-2xl z-20 flex flex-col">
      {/* Logo Section */}
      <div className="p-6 border-b border-[#333333]">
        <div className="flex items-center gap-3">
          <div className="text-4xl drop-shadow-[0_0_10px_rgba(255,90,0,0.5)]">🏋️</div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">GymPro</h1>
            <p className="text-[#FF5A00] text-xs font-bold uppercase tracking-widest">Elite Fitness</p>
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
              className={`w-full flex items-center gap-3 px-4 py-3 rounded transition-all relative group ${
                isActive
                  ? 'bg-[#1A1A1A] text-[#FF5A00]'
                  : 'text-[#A0A0A0] hover:bg-[#1A1A1A] hover:text-white'
              }`}
            >
              {/* Active indicator */}
              {isActive && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#FF5A00] shadow-[0_0_10px_rgba(255,90,0,0.6)]"></div>
              )}

              <Icon className={`w-5 h-5 ${isActive ? 'drop-shadow-[0_0_5px_rgba(255,90,0,0.5)]' : ''}`} />
              <span className="font-bold text-sm uppercase tracking-wide">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Profile Section */}
      <div className="p-4 border-t border-[#333333]">
        <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-[#1A1A1A] to-[#242424] rounded-lg border border-[#333333]">
          <div className="relative">
            <div className="w-12 h-12 bg-gradient-to-br from-[#FF5A00] to-[#FF8C00] rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(255,90,0,0.4)]">
              <User className="w-6 h-6 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#00FF00] border-2 border-[#121212] rounded-full"></div>
          </div>
          <div>
            <p className="font-black text-white text-sm">Trương Thế Thành</p>
            <p className="text-[#FF5A00] text-xs font-bold uppercase tracking-wide">Hội viên Premium</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
