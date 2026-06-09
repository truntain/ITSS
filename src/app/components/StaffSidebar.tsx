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

      <div className="p-4 border-t border-[var(--sidebar-border)]">
        <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-[var(--secondary)] transition-colors cursor-pointer">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--primary)] to-orange-600 flex items-center justify-center">
            <span className="text-white font-medium text-sm">NV</span>
          </div>
          <div className="flex-1">
            <p className="text-[var(--foreground)] text-sm font-medium">Nguyễn Văn A</p>
            <p className="text-[var(--muted-foreground)] text-xs">Ca: 06:00 – 14:00</p>
          </div>
        </div>
      </div>
    </div>
  );
}
