import { Users, DollarSign, MessageSquare, ShoppingCart, Wrench, RefreshCw, Clock } from 'lucide-react';

interface StaffDashboardPageProps {
  onMenuClick: (menu: string) => void;
}

const ptOnShift = [
  { name: 'PT Minh Tuấn', shift: '06:00 – 14:00', clients: 4, color: '#FF7A00' },
  { name: 'PT Hồng Nhung', shift: '06:00 – 14:00', clients: 2, color: '#10B981' },
  { name: 'PT Quang Huy', shift: '08:00 – 14:00', clients: 3, color: '#3B82F6' },
];

export function StaffDashboardPage({ onMenuClick }: StaffDashboardPageProps) {
  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Khách check-in trong ca', value: '23', sub: 'Tổng hôm nay: 47', icon: Users, color: 'text-orange-500' },
          { label: 'Doanh thu trong ca', value: '8.4M', sub: 'VNĐ', icon: DollarSign, color: 'text-emerald-500' },
          { label: 'Phản hồi chờ xử lý', value: '5', sub: 'Cần xử lý hôm nay', icon: MessageSquare, color: 'text-blue-500' },
        ].map((s) => (
          <div key={s.label} className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-[var(--muted-foreground)] font-medium">{s.label}</span>
              <s.icon className={`w-4 h-4 ${s.color}`} />
            </div>
            <p className="text-2xl font-bold text-[var(--foreground)]">{s.value}</p>
            <p className="text-xs text-[var(--muted-foreground)] mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4 shadow-sm">
        <h2 className="text-sm font-bold text-[var(--foreground)] mb-3">Thao tác nhanh</h2>
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => onMenuClick('sales')}
            className="flex items-center gap-3 p-3 rounded-lg bg-orange-50 border border-orange-200 hover:bg-orange-100 transition-colors text-left"
          >
            <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center flex-shrink-0">
              <ShoppingCart className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">Bán gói tập mới</p>
              <p className="text-xs text-slate-500">Đăng ký hội viên</p>
            </div>
          </button>
          <button
            onClick={() => onMenuClick('sales')}
            className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 border border-blue-200 hover:bg-blue-100 transition-colors text-left"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center flex-shrink-0">
              <RefreshCw className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">Gia hạn gói</p>
              <p className="text-xs text-slate-500">Hội viên cũ</p>
            </div>
          </button>
          <button
            onClick={() => onMenuClick('checkin')}
            className="flex items-center gap-3 p-3 rounded-lg bg-red-50 border border-red-200 hover:bg-red-100 transition-colors text-left"
          >
            <div className="w-8 h-8 rounded-lg bg-red-500 flex items-center justify-center flex-shrink-0">
              <Wrench className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">Báo máy hỏng</p>
              <p className="text-xs text-slate-500">Sự cố thiết bị</p>
            </div>
          </button>
        </div>
      </div>

      {/* Shift Info */}
      <div className="grid grid-cols-2 gap-4">
        {/* Current Shift */}
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4 text-orange-500" />
            <h3 className="text-sm font-bold text-[var(--foreground)]">Ca làm việc hôm nay</h3>
          </div>
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-3">
            <p className="text-xs text-orange-600 font-medium mb-0.5">Ca của bạn</p>
            <p className="text-xl font-bold text-orange-600">06:00 – 14:00</p>
            <p className="text-xs text-slate-400 mt-0.5">Thứ Sáu, 06/06/2026</p>
          </div>
          <div className="flex gap-2">
            <div className="flex-1 bg-[var(--secondary)] rounded-lg p-2 text-center">
              <p className="text-xs text-[var(--muted-foreground)] mb-0.5">Đã làm</p>
              <p className="text-base font-bold text-[var(--foreground)]">5h 20p</p>
            </div>
            <div className="flex-1 bg-[var(--secondary)] rounded-lg p-2 text-center">
              <p className="text-xs text-[var(--muted-foreground)] mb-0.5">Còn lại</p>
              <p className="text-base font-bold text-[var(--foreground)]">2h 40p</p>
            </div>
          </div>
        </div>

        {/* PT on shift */}
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4 shadow-sm">
          <h3 className="text-sm font-bold text-[var(--foreground)] mb-3">PT đang làm ca cùng</h3>
          <div className="space-y-2">
            {ptOnShift.map((pt) => (
              <div key={pt.name} className="flex items-center justify-between py-1.5 border-b border-[var(--border)] last:border-0">
                <div className="flex items-center gap-2">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                    style={{ backgroundColor: pt.color }}
                  >
                    {pt.name.split(' ').pop()?.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[var(--foreground)]">{pt.name}</p>
                    <p className="text-xs text-[var(--muted-foreground)]">{pt.shift}</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-orange-500 bg-orange-50 px-2 py-0.5 rounded-full">
                  {pt.clients} khách
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
